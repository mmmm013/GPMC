import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { isVotableWeek, riffOff } from '@/lib/riffRuns/schedule';

/* Riff-OFF votes. One vote per listener per week; a listener may change it.
   An email is optional and only enters the voter in that week's draw. */
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
const VOTER = /^[a-f0-9-]{16,64}$/i;

async function tally(week: string) {
  const { data, error } = await supabaseAdmin.from('riff_off_votes').select('riff_key').eq('week', week);
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const v of data ?? []) counts[v.riff_key] = (counts[v.riff_key] ?? 0) + 1;
  return counts;
}

export async function GET(req: Request) {
  const week = new URL(req.url).searchParams.get('week') ?? '';
  if (!isVotableWeek(week)) return NextResponse.json({ error: 'Unknown week' }, { status: 400 });
  try {
    return NextResponse.json({ counts: await tally(week) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Votes unavailable' }, { status: 503 });
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const week = String(body?.week ?? '');
  const riff = String(body?.riff ?? '');
  const voter = String(body?.voter ?? '');
  const email = body?.email ? String(body.email).trim().toLowerCase() : null;
  if (!isVotableWeek(week)) return NextResponse.json({ error: 'This Riff-OFF is closed.' }, { status: 400 });
  if (!riffOff(week).some((r) => r.key === riff)) return NextResponse.json({ error: 'That riff is not in this Riff-OFF.' }, { status: 400 });
  if (!VOTER.test(voter)) return NextResponse.json({ error: 'Reload the page and vote again.' }, { status: 400 });
  if (email && !EMAIL.test(email)) return NextResponse.json({ error: 'That email does not look right.' }, { status: 400 });
  const { error } = await supabaseAdmin
    .from('riff_off_votes')
    .upsert({ week, voter_id: voter, riff_key: riff, email, updated_at: new Date().toISOString() }, { onConflict: 'week,voter_id' });
  if (error) return NextResponse.json({ error: 'Your vote did not save. Try again.' }, { status: 503 });
  try {
    return NextResponse.json({ counts: await tally(week) });
  } catch {
    return NextResponse.json({ counts: null });
  }
}
