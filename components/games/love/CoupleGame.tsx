'use client';

import { gameEvent } from '@/lib/games/gameEvent';
import { useRef, useState } from 'react';
import type { GameElement } from '@/lib/games/meantsGame';
import { FUTURISTIC_NAMES, HISTORIC_NAMES, LOVE_WORDS, fetchHug, fetchLoveBug, lawfulName, sendLove } from '@/lib/games/loveGame';
import PrizePicker from './PrizePicker';
import { FailButton } from './FailButton';

/* HUGs, Kisses & Fantastic Wishes: the couple's game (GD, 2026-10-21 idea; on
   2026-10-22 he asked for whatever works best for users, maybe a 2nd game). Two
   people, one phone, passed back and forth.
     HUGs     each partner hears three HUGs and secretly picks the one that is most
              "us"; the other guesses it. One HUG per round end, used sparingly.
     Kisses   each partner strings three love BUGs into a little message for the
              other, who answers with one, two or three kisses.
     Wishes   each makes a Fantastic Wish for the two of them, and the couple wins
              one free HUG together.
   Names and wishes never leave this browser. */
type Step =
  | 'names'
  | 'hug-pick'
  | 'hug-pass'
  | 'hug-guess'
  | 'hug-result'
  | 'kiss-make'
  | 'kiss-pass'
  | 'kiss-hear'
  | 'wish'
  | 'finale'
  | 'prize';

function Pass({ to, onReady }: { to: string; onReady: () => void }) {
  return (
    <div className="mt-8 flex flex-col items-center rounded-2xl border border-[#EC407A]/50 bg-black/40 p-6 text-center">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#FFD54F]">Pass the phone</p>
      <p className="mt-2 text-3xl font-black">Over to {to}</p>
      <p className="mt-2 text-[#D7CCC8]">No peeking until it is in their hands.</p>
      <button type="button" onClick={onReady} className="mt-5 min-h-12 rounded-2xl bg-[#EC407A] px-6 font-bold text-white">I am {to}</button>
    </div>
  );
}

export default function CoupleGame() {
  const audio = useRef<HTMLAudioElement>(null);
  const [step, setStep] = useState<Step>('names');
  const [names, setNames] = useState<[string, string]>(['', '']);
  const [problem, setProblem] = useState('');
  const [turn, setTurn] = useState<0 | 1>(0);
  const [hearts, setHearts] = useState<[number, number]>([0, 0]);
  const [offered, setOffered] = useState<string[]>([]);
  const [hugs, setHugs] = useState<GameElement[]>([]);
  const [secret, setSecret] = useState('');
  const [guessed, setGuessed] = useState('');
  const [ours, setOurs] = useState<GameElement | null>(null);
  const [words, setWords] = useState<string[]>([]);
  const [message, setMessage] = useState<GameElement[]>([]);
  const [wishes, setWishes] = useState<[string, string]>(['', '']);
  const [note, setNote] = useState('');

  const me = names[turn];
  const you = names[turn === 0 ? 1 : 0];
  const other = (t: 0 | 1): 0 | 1 => (t === 0 ? 1 : 0);

  function play(src: string) {
    const a = audio.current;
    if (!a) return;
    a.onended = null;
    a.src = src;
    void a.play().catch(() => setNote('Tap play to listen.'));
  }

  function chain(list: GameElement[]) {
    const a = audio.current;
    if (!a || !list.length) return;
    let i = 0;
    a.onended = () => {
      i += 1;
      if (i < list.length) {
        a.src = list[i].src;
        void a.play().catch(() => {});
      } else a.onended = null;
    };
    a.src = list[0].src;
    void a.play().catch(() => setNote('Tap play to hear it.'));
  }

  function setName(i: 0 | 1, raw: string) {
    const v = raw.slice(0, 24);
    setProblem(v.trim() ? lawfulName(v).problem : '');
    setNames((n) => (i === 0 ? [v, n[1]] : [n[0], v]));
  }

  async function dealHugs(t: 0 | 1) {
    setTurn(t);
    setSecret('');
    setGuessed('');
    setNote('Setting out three HUGs…');
    if (t === 0) gameEvent('game_start', { game: 'hugs-kisses-wishes' });
    setStep('hug-pick');
    const got: GameElement[] = [];
    const seen = [...offered];
    for (let i = 0; i < 3; i++) {
      const hug = await fetchHug(seen);
      if (!hug?.reference || seen.includes(hug.reference)) break;
      got.push(hug);
      seen.push(hug.reference);
    }
    setOffered(seen);
    setHugs(got);
    setNote(got.length ? '' : 'The HUGs are slow to arrive. Try again in a moment.');
  }

  function start() {
    const a = lawfulName(names[0]);
    const b = lawfulName(names[1]);
    if (!a.name || !b.name) {
      setProblem(a.problem || b.problem || 'Both of you need a name.');
      return;
    }
    setNames([a.name, b.name]);
    void dealHugs(0);
  }

  function guess(ref: string) {
    setNote('');
    setGuessed(ref);
    const matched = ref === secret;
    if (matched) setHearts((h) => (turn === 0 ? [h[0], h[1] + 1] : [h[0] + 1, h[1]]));
    /* The round's one HUG: the one the picker chose as most "us". */
    setOurs(hugs.find((h) => h.reference === secret) ?? null);
    setStep('hug-result');
  }

  async function makeMessage() {
    setNote('Finding the words…');
    const got: GameElement[] = [];
    for (const w of words) {
      const bug = await fetchLoveBug(w);
      if (bug) got.push(bug);
    }
    setNote('');
    if (!got.length) {
      setNote('Those words are not in the songs yet. Pick others.');
      return;
    }
    setMessage(got);
    setStep('kiss-pass');
  }

  function kisses(n: number) {
    setNote('');
    setHearts((h) => (turn === 0 ? [h[0] + n, h[1]] : [h[0], h[1] + n]));
    setMessage([]);
    setWords([]);
    if (turn === 0) {
      setTurn(1);
      setStep('kiss-make');
    } else {
      setTurn(0);
      setStep('wish');
    }
  }

  const card = 'mt-6 rounded-2xl border border-[#FFD54F]/40 bg-black/40 p-4';
  const chip = (on: boolean) => `min-h-11 rounded-2xl border px-3 font-bold ${on ? 'border-[#EC407A] bg-[#EC407A] text-white' : 'border-white/30 text-white'}`;

  return (
    <div>
      <audio ref={audio} controls controlsList="nodownload" className={step === 'names' || step === 'prize' ? 'hidden' : 'w-full'} />
      {step !== 'names' && step !== 'prize' && (
        <p className="mt-3 text-sm font-bold uppercase tracking-[0.2em] text-[#FFD54F]">
          {names[0]} ♥ {hearts[0]} · {names[1]} ♥ {hearts[1]}
        </p>
      )}

      {step === 'names' && (
        <div className="mt-4 grid gap-6">
          {([0, 1] as const).map((i) => (
            <div key={i}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFD54F]">{i === 0 ? 'First lover' : 'Second lover'}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {[...HISTORIC_NAMES.slice(0, 8), ...FUTURISTIC_NAMES.slice(0, 4)].map((n) => (
                  <button key={n} type="button" onClick={() => setName(i, n)} aria-pressed={names[i] === n} className={chip(names[i] === n)}>{n}</button>
                ))}
              </div>
              <input value={names[i]} onChange={(e) => setName(i, e.target.value)} maxLength={24} placeholder="Or your own name"
                className="mt-2 w-full rounded-2xl border border-white/20 bg-black/40 px-4 py-3 text-white placeholder:text-white/40" />
            </div>
          ))}
          {problem && <p className="text-sm text-[#FF8A80]" role="status">{problem}</p>}
          <button type="button" onClick={start} className="min-h-12 rounded-2xl bg-[#EC407A] font-bold text-white">Start: Round 1, HUGs</button>
        </div>
      )}

      {step === 'hug-pick' && (
        <div className={card}>
          <p className="text-xl font-black">{me}, which HUG is most “us”?</p>
          <p className="mt-1 text-sm text-[#D7CCC8]">Listen, then pick one in secret. {you} will try to guess it.</p>
          <div className="mt-4 grid gap-3">
            {hugs.map((h) => (
              <div key={h.reference} className="rounded-2xl border border-white/15 p-3">
                <p className="font-bold">“{h.words}”</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" onClick={() => play(h.src)} className="min-h-11 rounded-2xl bg-[#FFD54F] px-4 font-bold text-black">Listen</button>
                  <button type="button" onClick={() => { setSecret(h.reference ?? ''); audio.current?.pause(); setStep('hug-pass'); }}
                    className="min-h-11 rounded-2xl bg-[#EC407A] px-4 font-bold text-white">This one</button>
                  {h.reference && <FailButton game="couple" reference={h.reference} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'hug-pass' && <Pass to={you} onReady={() => setStep('hug-guess')} />}

      {step === 'hug-guess' && (
        <div className={card}>
          <p className="text-xl font-black">{you}, which one did {me} pick?</p>
          <div className="mt-4 grid gap-3">
            {hugs.map((h) => (
              <div key={h.reference} className="rounded-2xl border border-white/15 p-3">
                <p className="font-bold">“{h.words}”</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" onClick={() => play(h.src)} className="min-h-11 rounded-2xl bg-[#FFD54F] px-4 font-bold text-black">Listen</button>
                  <button type="button" onClick={() => guess(h.reference ?? '')} className="min-h-11 rounded-2xl bg-[#EC407A] px-4 font-bold text-white">My guess</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'hug-result' && (
        <div className={card}>
          <p className="text-2xl font-black">{guessed === secret ? `${you} knows ${me}! A heart for ${you}.` : `Not this time. ${me} picked:`}</p>
          {ours && (
            <>
              <p className="mt-3 text-lg font-bold">“{ours.words}”</p>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFD54F]">your HUG for this round</p>
              <button type="button" onClick={() => play(ours.src)} className="mt-3 min-h-11 rounded-2xl bg-[#FFD54F] px-4 font-bold text-black">Hear it together</button>
            </>
          )}
          <button type="button"
            onClick={() => {
              if (ours?.reference) void sendLove({ type: 'love-pick', pick: 'keep', set: 'couple', reference: ours.reference });
              if (turn === 0) void dealHugs(1);
              else {
                setTurn(0);
                setStep('kiss-make');
              }
            }}
            className="mt-5 block min-h-12 w-full rounded-2xl bg-[#EC407A] font-bold text-white">
            {turn === 0 ? `Now ${you} picks` : 'Round 2: Kisses'}
          </button>
        </div>
      )}

      {step === 'kiss-make' && (
        <div className={card}>
          <p className="text-xl font-black">{me}, send {you} a little love message</p>
          <p className="mt-1 text-sm text-[#D7CCC8]">Pick up to three words. Each one is sung, in order.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {LOVE_WORDS.map((w) => {
              const on = words.includes(w);
              return (
                <button key={w} type="button" aria-pressed={on} className={chip(on)}
                  onClick={() => setWords((list) => (on ? list.filter((x) => x !== w) : list.length < 3 ? [...list, w] : list))}>
                  {w}
                </button>
              );
            })}
          </div>
          <p className="mt-3 font-bold">{words.length ? words.join(' · ') : 'No words yet'}</p>
          <button type="button" disabled={!words.length} onClick={() => void makeMessage()}
            className="mt-3 min-h-12 w-full rounded-2xl bg-[#EC407A] font-bold text-white disabled:opacity-50">Seal it with a kiss</button>
        </div>
      )}

      {step === 'kiss-pass' && <Pass to={you} onReady={() => { setStep('kiss-hear'); chain(message); }} />}

      {step === 'kiss-hear' && (
        <div className={card}>
          <p className="text-xl font-black">{you}, {me} sent you this</p>
          <p className="mt-2 text-2xl font-black">{message.map((m) => `“${m.words}”`).join(' ')}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={() => chain(message)} className="min-h-11 rounded-2xl bg-[#FFD54F] px-4 font-bold text-black">Hear it again</button>
            {message.map((m) => m.reference && (
              <span key={m.reference} className="flex items-center gap-1 text-sm text-[#D7CCC8]">“{m.words}”<FailButton game="couple" reference={m.reference} /></span>
            ))}
          </div>
          <p className="mt-4 font-bold">How many kisses back?</p>
          <div className="mt-2 flex gap-2">
            {[1, 2, 3].map((n) => (
              <button key={n} type="button" onClick={() => kisses(n)} className="min-h-12 flex-1 rounded-2xl border border-[#EC407A] text-2xl" aria-label={`${n} kisses`}>
                {'💋'.repeat(n)}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'wish' && (
        <div className={card}>
          <p className="text-xl font-black">Final round: Fantastic Wishes</p>
          <p className="mt-1 text-sm text-[#D7CCC8]">Each of you makes one wish for the two of you. It stays on this phone.</p>
          {([0, 1] as const).map((i) => (
            <label key={i} className="mt-3 block">
              <span className="text-sm font-bold">{names[i]} wishes…</span>
              <input value={wishes[i]} maxLength={120} onChange={(e) => setWishes((w) => (i === 0 ? [e.target.value, w[1]] : [w[0], e.target.value]))}
                className="mt-1 w-full rounded-2xl border border-white/20 bg-black/40 px-4 py-3 text-white" placeholder="a fantastic wish" />
            </label>
          ))}
          <button type="button" disabled={!wishes[0].trim() || !wishes[1].trim()}
            onClick={async () => {
              setStep('finale');
              gameEvent('game_finish', { game: 'hugs-kisses-wishes' });
              const sealed = (await fetchLoveBug('forever')) ?? (await fetchLoveBug('together'));
              if (sealed) play(sealed.src);
            }}
            className="mt-4 min-h-12 w-full rounded-2xl bg-[#EC407A] font-bold text-white disabled:opacity-50">Make the wishes</button>
        </div>
      )}

      {step === 'finale' && (
        <div className="mt-8 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#FFD54F]">Fantastic Wishes</p>
          <p className="mt-3 text-2xl font-black">“{wishes[0]}”</p>
          <p className="text-[#D7CCC8]">— {names[0]}</p>
          <p className="mt-3 text-2xl font-black">“{wishes[1]}”</p>
          <p className="text-[#D7CCC8]">— {names[1]}</p>
          <p className="mt-6 text-lg">{hearts[0] + hearts[1]} hearts between you. Every couple wins: one free HUG, together.</p>
          <button type="button" onClick={() => setStep('prize')} className="mt-5 min-h-12 rounded-2xl bg-[#EC407A] px-6 font-bold text-white">Claim our HUG</button>
        </div>
      )}

      {step === 'prize' && (
        <PrizePicker lover={`${names[0]} & ${names[1]}`} onDone={() => { setStep('names'); setHearts([0, 0]); setWishes(['', '']); }} />
      )}

      {note && <p className="mt-4 text-[#D7CCC8]" role="status">{note}</p>}
    </div>
  );
}
