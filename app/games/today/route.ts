import { NextResponse, type NextRequest } from 'next/server';
import { gameOfTheDay } from '@/lib/games/list';

/* The Game of the day: one link that leads to a different game each day.
   A 307, never cached, so tomorrow's visitor is not sent to today's game.
   A ?src= tag rides along so the visit log can tell where the click came from. */
export const dynamic = 'force-dynamic';

export function GET(req: NextRequest) {
  const to = new URL(gameOfTheDay().href, req.nextUrl.origin);
  const src = req.nextUrl.searchParams.get('src');
  to.searchParams.set('src', src || 'today');
  return NextResponse.redirect(to, { status: 307, headers: { 'Cache-Control': 'no-store' } });
}
