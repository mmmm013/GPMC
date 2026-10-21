import { NextResponse } from 'next/server';

/* A "Did it?" answer from the MEANTs games, passed on to k-kut's VOC intake
   server-side. The answers are how the games test the catalogue's tags with
   real listeners. */
export const dynamic = 'force-dynamic';

const VOC = 'https://www.k-kut.com/api/voc';

export async function POST(request: Request) {
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
  const contact: string | null = null;
  if (body.type === 'did-it') {
    const challenge = str(body.challenge, 40);
    const answer = body.answer === 'yes' ? 'Yes' : body.answer === 'no' ? 'No' : '';
    if (!challenge || !answer) return NextResponse.json({ error: 'Missing answer.' }, { status: 400 });
    said = `${str(body.ask, 80)} Did it? ${answer}`;
    surface = `gpm-game:can-i:${challenge}`;
  } else {
    return NextResponse.json({ error: 'Unknown answer.' }, { status: 400 });
  }

  try {
    const res = await fetch(VOC, {
      method: 'POST',
      /* k-kut lets GPM's own sites through its bot gate by this name. */
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'GPM-gputnammusic/1' },
      body: JSON.stringify({ reference, what_they_said: said, kind: 'other', contact, surface }),
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return NextResponse.json({ error: 'We could not record that just now.' }, { status: 503 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'We could not record that just now.' }, { status: 503 });
  }
}
