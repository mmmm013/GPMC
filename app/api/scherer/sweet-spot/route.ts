import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sweetSpotKey } from '@/lib/scherer/sweetSpots';

/* One of Michael Scherer's sweet spots, streamed by a visit's number only. The same pattern as
   /api/riff-runs/audio: stream only, never a file, and no path or name reaches the listener. */
const BUCKET = 'audio-output';
const PREFIX = 'riff-runs';

export async function GET(req: Request) {
  const n = Number(new URL(req.url).searchParams.get('n'));
  if (!Number.isFinite(n)) return new Response('Unknown', { status: 404 });
  const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(`${PREFIX}/${sweetSpotKey(n)}.mp3`, 60);
  if (error || !data) return new Response('Unavailable', { status: 503 });
  const range = req.headers.get('range');
  const src = await fetch(data.signedUrl, { headers: range ? { range } : {}, cache: 'no-store' }).catch(() => null);
  if (!src || !src.ok || !src.body) return new Response('Unavailable', { status: 503 });
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
