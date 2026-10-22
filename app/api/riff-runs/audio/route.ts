import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { riffByNumber } from '@/lib/riffRuns/catalog';

/* A riff streams through this address, by its public number only. The storage
   path and clip name never reach the listener, and nothing is offered as a file. */
const BUCKET = 'audio-output';
const PREFIX = 'riff-runs';

export async function GET(req: Request) {
  const riff = riffByNumber(new URL(req.url).searchParams.get('riff'));
  if (!riff) return new Response('Unknown riff', { status: 404 });
  const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(`${PREFIX}/${riff.key}.mp3`, 60);
  if (error || !data) return new Response('Riff unavailable', { status: 503 });
  const range = req.headers.get('range');
  const src = await fetch(data.signedUrl, { headers: range ? { range } : {}, cache: 'no-store' }).catch(() => null);
  if (!src || !src.ok || !src.body) return new Response('Riff unavailable', { status: 503 });
  const headers = new Headers({
    'Content-Type': 'audio/mpeg',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'private, no-store',
    'Content-Disposition': 'inline',
  });
  for (const h of ['content-length', 'content-range']) {
    const v = src.headers.get(h);
    if (v) headers.set(h, v);
  }
  return new Response(src.body, { status: src.status, headers });
}
