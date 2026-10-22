import { NextResponse } from 'next/server';
import { isPerson } from '@/lib/people';
import { seal } from '@/lib/games/loveSeal';

/* The Love Game asks here, never k-kut directly, for one prize (a HUG, TUG or BUG) or one love
   BUG at a time. What reaches the page is the Element's own words, its content
   reference (for answers and Fails) and a sealed stream address: no song title,
   no catalogue id, no storage path. People only. */
export const dynamic = 'force-dynamic';

const GAME = process.env.NEXT_PUBLIC_MEANTS_GAME_API || 'https://www.k-kut.com/api/kleigh-game';
const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' };

type Element = { tier: string; words: string; src: string; reference: string | null };

export async function GET(request: Request) {
  if (!(await isPerson(request))) return NextResponse.json({ error: 'People only.' }, { status: 403, headers });
  const url = new URL(request.url);
  const kind = url.searchParams.get('kind');
  const params = new URLSearchParams({ scope: 'all' });
  if (kind === 'hug' || kind === 'prize') {
    const tier = url.searchParams.get('tier');
    params.set('kind', 'prize');
    params.set('tier', kind === 'prize' && (tier === 'TUG' || tier === 'BUG') ? tier : 'HUG');
    params.set('skip', (url.searchParams.get('skip') ?? '').slice(0, 1000));
    params.set('wish', (url.searchParams.get('wish') ?? '').slice(0, 80));
  } else if (kind === 'bug') {
    params.set('kind', 'bug');
    params.set('bare', '1');
    params.set('word', (url.searchParams.get('word') ?? '').slice(0, 40));
  } else {
    return NextResponse.json({ error: 'Ask for kind=prize, kind=hug or kind=bug.' }, { status: 400, headers });
  }
  try {
    const res = await fetch(`${GAME}?${params}`, {
      /* k-kut lets GPM's own sites through its bot gate by this name. */
      headers: { 'User-Agent': 'GPM-gputnammusic/1' },
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    const body = (await res.json()) as { element: Element | null };
    const e = body.element;
    if (!e || !e.src) return NextResponse.json({ element: null }, { headers });
    return NextResponse.json(
      { element: { tier: e.tier, words: e.words, song: '', reference: e.reference, src: `/api/love-game/audio?t=${seal(e.src)}` } },
      { headers },
    );
  } catch {
    return NextResponse.json({ element: null }, { status: 503, headers });
  }
}
