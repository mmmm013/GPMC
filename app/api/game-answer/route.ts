import { NextResponse } from 'next/server';
import { isPerson } from '@/lib/people';

/* A "Did it?" answer, a prize claim, a Fail, or a Love Game pick, wish or freebie promise from the MEANTs games, passed on to k-kut's VOC intake
   server-side. The answers are how the games test the catalogue's tags with
   real listeners. */
export const dynamic = 'force-dynamic';

const VOC = 'https://www.k-kut.com/api/voc';
/* The VOC kinds a player can name when an Element sounds wrong. */
const FAIL_KINDS = new Set(['cut_off', 'wrong_word', 'sound_quality', 'not_what_i_expected']);

export async function POST(request: Request) {
  if (!(await isPerson(request))) return NextResponse.json({ error: 'Answers come from people only. Reload the page and try again.' }, { status: 403 });
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'We could not read that.' }, { status: 400 });
  }
  const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const reference = str(body.reference, 40).toLowerCase();
  if (!/^kut_[0-9a-f]{16}$/.test(reference)) {
    return NextResponse.json({ error: 'Play a song first.' }, { status: 400 });
  }

  let said = '';
  let surface = '';
  let contact: string | null = null;
  let kind = 'other';
  if (body.type === 'did-it') {
    const challenge = str(body.challenge, 40);
    const answer = body.answer === 'yes' ? 'Yes' : body.answer === 'no' ? 'No' : '';
    if (!challenge || !answer) return NextResponse.json({ error: 'Missing answer.' }, { status: 400 });
    said = `${str(body.ask, 80)} Did it? ${answer}`;
    surface = `gpm-game:can-i:${challenge}`;
  } else if (body.type === 'prize-claim') {
    /* A Golden NUG win: the free BUG to send goes to this email. */
    const prize = str(body.prize, 60);
    const email = str(body.email, 320);
    if (!prize || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 });
    }
    /* The Love Game's prize is a free HUG, one per player (GD, 2026-10-22: "free HUG only"). */
    const game = str(body.game, 40);
    said = `Prize claim: ${prize} (${game})${game === 'love' ? ', free, one per email' : ''}`;
    surface = `gpm-game:prize-claim:${prize}`;
    contact = email;
  } else if (body.type === 'love-pick') {
    /* The Love Game's prize HUGs: each keep or pass tests the romantic tags. */
    const pick = body.pick === 'keep' ? 'Kept' : body.pick === 'pass' ? 'Passed' : '';
    if (!pick) return NextResponse.json({ error: 'Missing answer.' }, { status: 400 });
    said = `Love Game prize HUG: ${pick} (set ${str(body.set, 8) || '1'})`;
    surface = `gpm-game:love:${pick.toLowerCase()}`;
  } else if (body.type === 'fail') {
    /* Approve ALL MEANTs until failed; a Fail goes to Triage (GD, 2026-10-21). */
    const why = FAIL_KINDS.has(String(body.why)) ? String(body.why) : 'other';
    kind = why;
    said = `Fail from ${str(body.game, 40) || 'a game'}: ${str(body.note, 200) || why.replace(/_/g, ' ')}`;
    surface = `gpm-game:fail:${str(body.game, 40) || 'game'}`;
  } else if (body.type === 'love-wish') {
    /* No HUG in two sets fit: what the player asked for instead. */
    const wish = str(body.wish, 300);
    if (!wish) return NextResponse.json({ error: 'Tell us what you would like.' }, { status: 400 });
    said = `Love Game wish: ${wish}`;
    surface = 'gpm-game:love:wish';
  } else if (body.type === 'love-freebie') {
    /* "Come back for a freebie anytime. We will not forget." The promise is filed
       with its code, and with an email when the player gives one. */
    const code = str(body.code, 20).toUpperCase();
    const email = str(body.email, 320);
    if (!/^LOVE-[0-9A-F]{8}$/.test(code)) return NextResponse.json({ error: 'Missing promise.' }, { status: 400 });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email, or leave it empty.' }, { status: 400 });
    }
    said = `Freebie owed (${code}): Love Game wish not found. ${str(body.wish, 300)}`.trim();
    surface = 'gpm-game:love:freebie-owed';
    contact = email || null;
  } else {
    return NextResponse.json({ error: 'Unknown answer.' }, { status: 400 });
  }

  try {
    const res = await fetch(VOC, {
      method: 'POST',
      /* k-kut lets GPM's own sites through its bot gate by this name. */
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'GPM-gputnammusic/1' },
      body: JSON.stringify({ reference, what_they_said: said, kind, contact, surface }),
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return NextResponse.json({ error: 'We could not record that just now.' }, { status: 503 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'We could not record that just now.' }, { status: 503 });
  }
}
