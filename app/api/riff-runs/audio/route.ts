import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { riffByKey } from '@/lib/riffRuns/schedule';

/* A riff streams on a short signed link and is never offered as a file. */
const BUCKET = 'audio-output';
const PREFIX = 'riff-runs';

export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get('key') ?? '';
  if (!riffByKey(key)) return NextResponse.json({ error: 'Unknown riff' }, { status: 404 });
  const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(`${PREFIX}/${key}.mp3`, 900);
  if (error || !data) return NextResponse.json({ error: 'Riff unavailable' }, { status: 503 });
  return NextResponse.json({ url: data.signedUrl }, { headers: { 'Cache-Control': 'no-store' } });
}
