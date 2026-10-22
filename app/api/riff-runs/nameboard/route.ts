import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { riffByKey, riffOff } from '@/lib/riffRuns/schedule';

/* Riffs of the Week: each finished Riff-OFF's winner, newest first. */
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('riff_off_winners')
    .select('week, riff_key, votes')
    .order('week', { ascending: false })
    .limit(52);
  if (error) return NextResponse.json({ error: 'Nameboard unavailable' }, { status: 503 });
  const board = (data ?? [])
    .filter((w) => riffOff(w.week).some((r) => r.key === w.riff_key))
    .map((w) => ({ week: w.week, song: riffByKey(w.riff_key)?.song ?? '', key: w.riff_key, votes: w.votes }));
  return NextResponse.json({ board }, { headers: { 'Cache-Control': 's-maxage=300' } });
}
