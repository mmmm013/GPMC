'use client';

import { gameEvent } from '@/lib/games/gameEvent';
import { useEffect, useRef, useState } from 'react';
import type { GameElement } from '@/lib/games/meantsGame';
import { CLAIMED_KEY, PROMISE_KEY, alreadyClaimed, claimedLink, fetchPrize, newPromiseCode, sendLove, type PrizeTier } from '@/lib/games/loveGame';
import SendOn from './SendOn';
import { FailButton } from './FailButton';

/* The prize for their love: a HUG. Three are offered and the player whittles
   them to one. If that one is not it, one final set of three. If none of those,
   the player says what they want; we look, and if it cannot be found we say
   sorry and promise a freebie any time, filed so it is honoured (GD,
   2026-10-22: "we will not forget").

   A short game wins a TUG the same way. A quick game wins a BUG, and a BUG shows
   only when the player asks for its word, so the player says the one love word
   they want and hears it sung; three words not found, and it is sorry and a
   freebie, the same promise. */
type Stage = 'loading' | 'whittle' | 'kept' | 'ask' | 'wish' | 'searching' | 'found' | 'sorry';
const WORD_TRIES = 3;

export default function PrizePicker({ lover, freebie, tier = 'HUG', onDone }: { lover: string; freebie?: string; tier?: PrizeTier; onDone: () => void }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [set, setSet] = useState<1 | 2>(1);
  const [cards, setCards] = useState<GameElement[]>([]);
  const [stage, setStage] = useState<Stage>('loading');
  const [offered, setOffered] = useState<string[]>([]);
  const [kept, setKept] = useState<GameElement | null>(null);
  const [wish, setWish] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [to, setTo] = useState('');
  const [link, setLink] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [note, setNote] = useState('');
  const [missed, setMissed] = useState(0);
  const isBug = tier === 'BUG';

  async function deal(round: 1 | 2, skip: string[]) {
    setStage('loading');
    const got: GameElement[] = [];
    const seen = [...skip];
    for (let i = 0; i < 3; i++) {
      const hug = await fetchPrize(tier, seen);
      if (!hug?.reference || seen.includes(hug.reference)) break;
      got.push(hug);
      seen.push(hug.reference);
    }
    setOffered(seen);
    setCards(got);
    setSet(round);
    setStage(got.length ? 'whittle' : 'wish');
  }

  useEffect(() => {
    if (isBug) setStage('ask');
    else void deal(1, []);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function play(hug: GameElement) {
    const a = audio.current;
    if (!a) return;
    a.src = hug.src;
    void a.play().catch(() => setNote('Tap play to listen.'));
  }

  function pass(hug: GameElement) {
    if (hug.reference) void sendLove({ type: 'love-pick', pick: 'pass', tier, set: String(set), reference: hug.reference });
    audio.current?.pause();
    setCards((c) => c.filter((x) => x.reference !== hug.reference));
  }

  function keep(hug: GameElement) {
    if (hug.reference) void sendLove({ type: 'love-pick', pick: 'keep', tier, set: String(set), reference: hug.reference });
    setKept(hug);
    setStage('kept');
    if (freebie) {
      try {
        window.localStorage.removeItem(PROMISE_KEY);
      } catch {
        /* nothing kept, nothing to clear */
      }
    }
  }

  function notIt(hug: GameElement) {
    pass(hug);
    if (set === 1) void deal(2, offered);
    else setStage('wish');
  }

  async function lookFor(e: React.FormEvent) {
    e.preventDefault();
    const w = wish.trim();
    if (!w) return;
    const reference = offered[offered.length - 1] ?? '';
    if (reference) void sendLove({ type: 'love-wish', wish: w, reference });
    setStage('searching');
    const hug = await fetchPrize(tier, offered, w);
    if (hug?.reference) {
      setMissed(0);
      setNote('');
      setOffered((o) => [...o, hug.reference as string]);
      setCards([hug]);
      setStage('found');
      play(hug);
    } else if (isBug && missed + 1 < WORD_TRIES) {
      setMissed(missed + 1);
      setNote(`We do not have “${w}” sung and ready to send yet. Try another word.`);
      setStage('ask');
    } else {
      sorry(w);
    }
  }

  /* A BUG that is not the one: ask for another word. */
  function anotherWord(bug: GameElement) {
    pass(bug);
    setWish('');
    setNote('');
    setStage('ask');
  }

  function sorry(w: string) {
    audio.current?.pause();
    setNote('');
    const c = newPromiseCode();
    setCode(c);
    setStage('sorry');
    try {
      window.localStorage.setItem(PROMISE_KEY, JSON.stringify({ code: c, on: new Date().toISOString() }));
    } catch {
      /* the filed promise below still holds */
    }
    const reference = offered[offered.length - 1] ?? '';
    if (reference) void sendLove({ type: 'love-freebie', code: c, wish: w, reference });
  }

  async function claim(e: React.FormEvent) {
    e.preventDefault();
    const reference = kept?.reference ?? offered[offered.length - 1] ?? '';
    if (!reference || claiming) return;
    setClaiming(true);
    const out =
      stage === 'sorry'
        ? await sendLove({ type: 'love-freebie', code, email, wish, reference })
        : await sendLove({ type: 'prize-claim', prize: freebie ? 'love-game-freebie-hug' : `love-game-${tier.toLowerCase()}`, game: 'love', email, reference, from: lover, to: to.trim() });
    setClaiming(false);
    if (out.ok && out.link) {
      setLink(out.link);
      gameEvent('prize_link', { game: 'love' });
      try {
        window.localStorage.setItem(CLAIMED_KEY, out.link);
      } catch {
        /* the link is on screen; it is still one per email */
      }
      return;
    }
    setNote(out.ok ? 'Saved. We will not forget.' : out.error ?? 'Try again in a moment.');
  }

  const forLove = lover ? `${lover}'s love` : 'your love';
  const claimedBefore = alreadyClaimed();
  const earlier = claimedBefore ? claimedLink() : '';
  const card = 'rounded-2xl border border-[#FFD54F]/40 bg-black/40 p-4';
  return (
    <div className="mt-6">
      <audio ref={audio} controls controlsList="nodownload" className="w-full" />

      {stage === 'loading' && <p className="mt-4 text-[#D7CCC8]" role="status">{isBug ? 'Finding your word…' : `The prize table is setting out your ${tier}s…`}</p>}

      {stage === 'whittle' && (
        <div className="mt-4">
          <p className="text-xl font-black">
            {set === 1 ? `Pick a prize for ${forLove}` : 'One final set of three'}
          </p>
          <p className="mt-1 text-sm text-[#D7CCC8]">
            {cards.length > 1 ? `Listen, then set aside the ones that are not it until one is left.` : 'Is this the one?'}
          </p>
          <div className="mt-4 grid gap-3">
            {cards.map((hug) => (
              <div key={hug.reference} className={card}>
                <p className="text-lg font-bold">“{hug.words}”</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-[#FFD54F]">a {tier}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => play(hug)} className="min-h-11 rounded-2xl bg-[#FFD54F] px-4 font-bold text-black">Listen</button>
                  {cards.length > 1 ? (
                    <button type="button" onClick={() => pass(hug)} className="min-h-11 rounded-2xl border border-white/30 px-4 font-bold">Not this one</button>
                  ) : (
                    <>
                      <button type="button" onClick={() => keep(hug)} className="min-h-11 rounded-2xl bg-[#EC407A] px-4 font-bold text-white">This is the one</button>
                      <button type="button" onClick={() => notIt(hug)} className="min-h-11 rounded-2xl border border-white/30 px-4 font-bold">
                        {set === 1 ? 'Not quite. Show me 3 more' : 'Still not it'}
                      </button>
                    </>
                  )}
                  {hug.reference && <FailButton game="love" reference={hug.reference} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stage === 'kept' && kept && (
        <div className={`mt-4 ${card}`}>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#FFD54F]">Your free prize {tier}</p>
          <p className="mt-2 text-2xl font-black">“{kept.words}”</p>
          <button type="button" onClick={() => play(kept)} className="mt-3 min-h-11 rounded-2xl bg-[#FFD54F] px-4 font-bold text-black">Play it again</button>
          {link && <SendOn link={link} from={lover} />}
          {!link && !note && !freebie && claimedBefore && (
            <div className="mt-4">
              <p className="text-sm text-[#D7CCC8]">You already claimed your free prize. It is one per player, so this one is yours to hear here.</p>
              {earlier && <SendOn link={earlier} from={lover} again />}
            </div>
          )}
          {!link && !note && (freebie || !claimedBefore) && (
            <form onSubmit={claim} className="mt-4 flex flex-col gap-3">
              <span className="text-sm text-[#D7CCC8]">It is free, one per player. Get its own link now and send it to {forLove}.</span>
              <input value={to} onChange={(e) => setTo(e.target.value)} maxLength={40} autoComplete="off" aria-label="Their name" placeholder="Their name (optional)"
                className="min-h-12 rounded-2xl border border-white/20 bg-black/40 px-4 text-white placeholder:text-white/40" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" aria-label="Your email" placeholder="Your email (one free prize each)"
                className="min-h-12 rounded-2xl border border-white/20 bg-black/40 px-4 text-white placeholder:text-white/40" />
              <button type="submit" disabled={claiming} className="min-h-12 rounded-2xl bg-[#EC407A] font-bold text-white disabled:opacity-60">{claiming ? 'Making your link…' : 'Get my link'}</button>
            </form>
          )}
        </div>
      )}

      {stage === 'ask' && (
        <form onSubmit={lookFor} className={`mt-4 ${card}`}>
          <p className="text-xl font-black">Pick one love word for {forLove}</p>
          <p className="mt-1 text-sm text-[#D7CCC8]">Type the word you want them to hear. We will find it sung.</p>
          <input value={wish} onChange={(e) => setWish(e.target.value.replace(/\s+/g, ''))} maxLength={30} autoComplete="off" aria-label="One love word" placeholder="One word, e.g. forever"
            className="mt-3 min-h-12 w-full rounded-2xl border border-white/20 bg-black/40 px-4 text-white placeholder:text-white/40" />
          <button type="submit" className="mt-3 min-h-12 w-full rounded-2xl bg-[#FFD54F] font-bold text-black">Find it sung</button>
        </form>
      )}

      {stage === 'wish' && (
        <form onSubmit={lookFor} className={`mt-4 ${card}`}>
          <p className="text-xl font-black">None of those? Tell us what you want.</p>
          <p className="mt-1 text-sm text-[#D7CCC8]">A word, a feeling, a moment. We will look for it.</p>
          <input value={wish} onChange={(e) => setWish(e.target.value)} maxLength={120} placeholder="e.g. a first dance, or forever"
            className="mt-3 min-h-12 w-full rounded-2xl border border-white/20 bg-black/40 px-4 text-white placeholder:text-white/40" />
          <button type="submit" className="mt-3 min-h-12 w-full rounded-2xl bg-[#FFD54F] font-bold text-black">Find it</button>
        </form>
      )}

      {stage === 'searching' && <p className="mt-4 text-[#D7CCC8]" role="status">Looking…</p>}

      {stage === 'found' && cards[0] && (
        <div className={`mt-4 ${card}`}>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#FFD54F]">{isBug ? 'Here it is, sung' : 'We found this'}</p>
          <p className="mt-2 text-lg font-bold">“{cards[0].words}”</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => keep(cards[0])} className="min-h-11 rounded-2xl bg-[#EC407A] px-4 font-bold text-white">This is the one</button>
            <button type="button" onClick={() => play(cards[0])} className="min-h-11 rounded-2xl bg-[#FFD54F] px-4 font-bold text-black">Listen</button>
            {isBug ? (
              <button type="button" onClick={() => anotherWord(cards[0])} className="min-h-11 rounded-2xl border border-white/30 px-4 font-bold">Try another word</button>
            ) : (
              <button type="button" onClick={() => { pass(cards[0]); sorry(wish); }} className="min-h-11 rounded-2xl border border-white/30 px-4 font-bold">Not it</button>
            )}
            {cards[0].reference && <FailButton game="love" reference={cards[0].reference} />}
          </div>
        </div>
      )}

      {stage === 'sorry' && (
        <div className={`mt-4 ${card}`}>
          <p className="text-2xl font-black">We are sorry.</p>
          <p className="mt-2 text-[#D7CCC8]">
            We could not find it this time. Come back for a freebie any time. We will not forget.
          </p>
          <p className="mt-3 text-sm">Your promise: <span className="font-mono font-bold text-[#FFD54F]">{code}</span></p>
          {!note && (
            <form onSubmit={claim} className="mt-4 flex flex-col gap-3">
              <span className="text-sm text-[#D7CCC8]">Optional: leave your email so we can reach you when we find it.</span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email"
                className="min-h-12 rounded-2xl border border-white/20 bg-black/40 px-4 text-white placeholder:text-white/40" />
              <button type="submit" className="min-h-12 rounded-2xl bg-[#FFD54F] font-bold text-black">Remember me</button>
            </form>
          )}
        </div>
      )}

      {note && <p className="mt-4 font-bold text-[#FFD54F]" role="status">{note}</p>}
      {(stage === 'kept' || stage === 'sorry') && (
        <button type="button" onClick={onDone} className="mt-6 min-h-12 w-full rounded-2xl border border-white/30 font-bold">Back to the fair</button>
      )}
    </div>
  );
}
