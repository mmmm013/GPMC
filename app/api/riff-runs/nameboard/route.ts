import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { riffOff } from '@/lib/riffRuns/catalog';

/* Riffs of the Week: each finished Riff-OFF's winner, newest first. */
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('riff_off_winners')
    .select('week, riff_key, votes')
    .order('week', { ascending: false })
    .limit(52);
  if (error) return NextResponse.json({ error: 'Nameboard unavailable' }, { status: 503 });
  /* Public riff numbers only: no song, no clip name. */
  const board = (data ?? []).flatMap((w) => {
    const riff = riffOff(w.week).find((r) => r.key === w.riff_key);
    return riff ? [{ week: w.week, riff: riff.number, votes: w.votes }] : [];
  });
  return NextResponse.json({ board }, { headers: { 'Cache-Control': 's-maxage=300' } });
}
