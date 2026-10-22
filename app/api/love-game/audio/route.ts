import { unseal } from '@/lib/games/loveSeal';

/* A Love Game Element streams through this address by its sealed token only.
   Nothing is offered as a file. The audio player cannot carry the page's people
   check, so robots are turned away here by their own user-agent. */
const ROBOT = /bot|crawl|spider|slurp|preview|fetch|curl|wget|python|httpclient|headless|monitor|scan/i;

export async function GET(req: Request) {
  const ua = req.headers.get('user-agent') ?? '';
  if (!ua || ROBOT.test(ua) || !/Mozilla\//.test(ua)) return new Response('People only', { status: 403 });
  const src = unseal(new URL(req.url).searchParams.get('t') ?? '');
  if (!src) return new Response('This has expired. Play again.', { status: 404 });
  const range = req.headers.get('range');
  /* Every play comes from this site's servers, so k-kut's HUNTR would count all
     players as one visitor. The relay secret lets it count each player instead. */
  const player = (req.headers.get('x-real-ip') ?? req.headers.get('x-forwarded-for')?.split(',')[0] ?? '').trim();
  const relay = process.env.GPM_RELAY_SECRET?.trim();
  const toKkut = /(^|\.)k-kut\.com$/.test(new URL(src).hostname);
  const upstream = await fetch(src, {
    headers: {
      'User-Agent': 'GPM-gputnammusic/1',
      ...(range ? { range } : {}),
      ...(relay && player && toKkut ? { 'x-gpm-relay': relay, 'x-gpm-player': player } : {}),
    },
    cache: 'no-store',
  }).catch(() => null);
  if (!upstream || !upstream.ok || !upstream.body) return new Response('Unavailable', { status: 503 });
  const headers = new Headers({
    'Content-Type': upstream.headers.get('content-type') ?? 'audio/mpeg',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'private, no-store',
    'Content-Disposition': 'inline',
  });
  for (const h of ['content-length', 'content-range']) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }
  return new Response(upstream.body, { status: upstream.status, headers });
}
