import { NextResponse } from 'next/server';
import { publicRiff, riffOff, runOrder } from '@/lib/riffRuns/catalog';

/* A week's run order and its Riff-OFF pair, as public riff numbers and names only. */
export async function GET(req: Request) {
  const week = new URL(req.url).searchParams.get('week') ?? '';
  const t = Date.parse(`${week}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(week) || !Number.isFinite(t) || new Date(t).getUTCDay() !== 0) {
    return NextResponse.json({ error: 'Unknown week' }, { status: 400 });
  }
  return NextResponse.json(
    { order: runOrder(week).map(publicRiff), pair: riffOff(week).map(publicRiff) },
    { headers: { 'Cache-Control': 's-maxage=3600' } },
  );
}
