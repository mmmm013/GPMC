import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { drawOne, entrants, isClosed } from '@/lib/riffRuns/draw';

/* Runs daily. Each Riff-OFF week that has closed and has not been drawn gets
   one draw: a voter who left an email wins a free BUG to send. The winner is
   only recorded here; the prize email goes out from GD's own mailbox once he
   has said yes to its wording. */
export const dynamic = 'force-dynamic';

function isCronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (process.env.NODE_ENV === 'production' && !secret) return false;
  if (!secret) return true;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [{ data: votes, error: vErr }, { data: drawn, error: dErr }] = await Promise.all([
    supabaseAdmin.from('riff_off_votes').select('week, voter_id, email, updated_at').order('updated_at', { ascending: true }),
    supabaseAdmin.from('riff_off_draws').select('week'),
  ]);
  if (vErr || dErr) return NextResponse.json({ error: 'Draw unavailable' }, { status: 503 });

  const done = new Set((drawn ?? []).map((d) => String(d.week)));
  const weeks = new Map<string, { voter_id: string; email: string | null }[]>();
  for (const v of votes ?? []) {
    const week = String(v.week);
    if (done.has(week) || !isClosed(week)) continue;
    weeks.set(week, [...(weeks.get(week) ?? []), v]);
  }

  const results = [];
  for (const [week, wv] of weeks) {
    const pool = entrants(wv);
    const winner = drawOne(pool);
    /* The week is the primary key, so a second run can never redraw a week. */
    const { error } = await supabaseAdmin.from('riff_off_draws').insert({
      week,
      entrants: pool.length,
      winner_voter_id: winner?.voter_id ?? null,
      winner_email: winner?.email ?? null,
    });
    results.push({ week, entrants: pool.length, drawn: Boolean(winner), saved: !error });
  }
  return NextResponse.json({ results });
}
