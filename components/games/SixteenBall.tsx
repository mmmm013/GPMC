'use client';

import { gameEvent } from '@/lib/games/gameEvent';
import VoicePlayer from './VoicePlayer';
import { playVoice } from '@/lib/games/clearVoice';
import { useEffect, useRef, useState } from 'react';
import { GAME_API, loadProgress, saveProgress, type GameElement } from '@/lib/games/meantsGame';
import { MOODS_FOR_PACE, SERENADE, useNugPlayer, usePlayerSense } from '@/lib/games/adaptive';

/* 16-Ball: the old 8-ball, remade as a 16-ball kaleidoscope with a touch of
   the mystic. A circle plays: a couple, friends, ideally up to 8, but anyone can
   join (GD, 2026-10-23: "can be couple, friends & ideally up to 8 but any number
   of participants can join. Do like ask Q for other person OR ask for self.
   Brining in mysticalism."). On each turn one player asks, for themself or for
   someone in the circle, and the ball answers with one real BUG, ambiguous more
   often than not (GD, 2026-10-21: "favor amiguity"). The question stays in the
   room: it is never typed or sent. Names stay on this phone. */
type Circle = { players: string[]; turn: number };
const KEY = 'meants-game:sixteen-ball:v2';
const COLORS = ['#FFD54F', '#FF7043', '#AB47BC', '#29B6F6', '#66BB6A', '#EC407A', '#FFA726', '#26C6DA'];
const SOMEONE_ELSE = -1;
const nameOf = (players: string[], i: number) => players[i]?.trim() || `Player ${i + 1}`;

export default function SixteenBall() {
  const audio = useRef<HTMLAudioElement>(null);
  const [circle, setCircle] = useState<Circle>(() => loadProgress<Circle>(KEY, { players: [], turn: 0 }));
  const [draft, setDraft] = useState<string[]>(() => (circle.players.length ? circle.players : ['', '']));
  const [gathering, setGathering] = useState(circle.players.length === 0);
  const [forWhom, setForWhom] = useState<number | null>(null);
  const [answer, setAnswer] = useState<GameElement | null>(null);
  const [spin, setSpin] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const sense = usePlayerSense();
  const nugs = useNugPlayer();

  /* Calm-down: rapid shaking brings a soft serenade and a short rest for the ball. */
  useEffect(() => {
    if (!sense.frustrated) return;
    audio.current?.pause();
    void nugs.playAlone(SERENADE);
    setMessage('The ball is resting. Here is something calm.');
    setBusy(true);
    const t = setTimeout(() => {
      setBusy(false);
      sense.settle();
    }, 5000);
    return () => clearTimeout(t);
  }, [sense.frustrated]); // eslint-disable-line react-hooks/exhaustive-deps

  const players = circle.players;
  const asker = players.length ? circle.turn % players.length : 0;
  const askerName = nameOf(players, asker);
  const nextName = nameOf(players, (asker + 1) % Math.max(1, players.length));
  const target = forWhom === null ? '' : forWhom === asker ? 'self' : forWhom === SOMEONE_ELSE ? 'someone not here' : nameOf(players, forWhom);

  function keep(next: Circle) {
    setCircle(next);
    saveProgress(KEY, next);
  }

  function begin() {
    sense.tap();
    keep({ players: draft.map((d) => d.trim().slice(0, 24)), turn: 0 });
    setGathering(false);
    setForWhom(null);
    setAnswer(null);
    setMessage('');
  }

  /* Anyone can join, any time: a new player takes a seat at the end of the circle. */
  function join() {
    keep({ ...circle, players: [...players, ''] });
    setDraft([...players, '']);
  }

  async function shake() {
    sense.tap();
    nugs.stop();
    setBusy(true);
    setMessage('');
    setAnswer(null);
    setSpin((s) => s + 720 + Math.floor(Math.random() * 360));
    gameEvent('game_start', { game: '16-ball', round: forWhom === asker ? 'self' : 'other' });
    try {
      const body = (await (await fetch(`${GAME_API}&kind=ball`, { cache: 'no-store' })).json()) as { element: GameElement | null };
      /* The ball listens a moment before it answers. */
      await new Promise((r) => setTimeout(r, 2000));
      if (!body.element) {
        setMessage('The mists are thick. Touch the ball again.');
        return;
      }
      setAnswer(body.element);
      gameEvent('game_finish', { game: '16-ball' });
      const a = audio.current;
      if (a) {
        /* Steady and calm players hear a mood bed under the answer; quick players get a snip after it. */
        if (sense.pace !== 'quick') void nugs.bedUnder(a, MOODS_FOR_PACE[sense.pace]);
        a.onended = sense.pace === 'quick' ? () => void nugs.playAlone(MOODS_FOR_PACE.quick) : null;
        void playVoice(a, body.element.src).catch(() => setMessage('Tap play to hear the answer.'));
      }
    } catch {
      setMessage('The mists are thick. Touch the ball again.');
    } finally {
      setBusy(false);
    }
  }

  function passOn() {
    sense.tap();
    nugs.stop();
    audio.current?.pause();
    keep({ ...circle, turn: circle.turn + 1 });
    setForWhom(null);
    setAnswer(null);
    setMessage('');
  }

  /* Sixteen mirrored wedges: each colour runs out and back, which is what makes it a kaleidoscope. */
  const wedges = Array.from({ length: 16 }, (_, i) => {
    const c = COLORS[(i % 2 ? 15 - i : i) % COLORS.length];
    return `${c} ${i * 22.5}deg ${(i + 1) * 22.5}deg`;
  }).join(', ');

  if (gathering) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#FFD54F]">Gather your circle</p>
        <p className="mt-2 text-xl font-bold">How many are playing?</p>
        <div className="mt-4 flex items-center gap-6">
          <button type="button" aria-label="One fewer" disabled={draft.length <= 1} onClick={() => setDraft(draft.slice(0, -1))}
            className="h-14 w-14 rounded-full border-2 border-[#FFD54F] text-3xl font-black text-[#FFD54F] disabled:opacity-30">−</button>
          <span className="w-16 text-5xl font-black">{draft.length}</span>
          <button type="button" aria-label="One more" onClick={() => setDraft([...draft, ''])}
            className="h-14 w-14 rounded-full border-2 border-[#FFD54F] text-3xl font-black text-[#FFD54F]">+</button>
        </div>
        <p className="mt-2 text-sm text-[#D7CCC8]">Two of you, friends, family. Best with up to 8, but there is always room for one more.</p>
        <div className="mt-5 grid w-full gap-2">
          {draft.map((d, i) => (
            <input key={i} value={d} maxLength={24} aria-label={`Name of player ${i + 1}`} placeholder={`Player ${i + 1} (a first name, if you like)`}
              onChange={(e) => setDraft(draft.map((x, j) => (j === i ? e.target.value : x)))}
              className="min-h-12 rounded-2xl border border-white/20 bg-black/40 px-4 text-lg text-white placeholder:text-white/40" />
          ))}
        </div>
        <p className="mt-2 text-xs text-[#D7CCC8]">Names stay on this phone. Nothing is sent.</p>
        <button type="button" onClick={begin} className="mt-5 min-h-14 w-full rounded-2xl bg-[#FFD54F] px-6 text-xl font-black text-black">
          Begin
        </button>
      </div>
    );
  }

  const others = players.map((_, i) => i).filter((i) => i !== asker);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex flex-wrap justify-center gap-2" aria-label="The circle">
        {players.map((_, i) => (
          <span key={i} className={`rounded-full px-3 py-1 text-sm font-bold ${i === asker ? 'bg-[#FFD54F] text-black' : 'border border-white/20 text-[#D7CCC8]'}`}>
            {nameOf(players, i)}
          </span>
        ))}
        <button type="button" onClick={join} className="rounded-full border border-dashed border-[#FFD54F]/70 px-3 py-1 text-sm font-bold text-[#FFD54F]">
          + Someone joins
        </button>
      </div>

      <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-[#FFD54F]">{askerName}, it is your turn</p>

      {forWhom === null ? (
        <div className="mt-3 w-full max-w-md">
          <p className="text-xl font-bold">Who is your question for?</p>
          <div className="mt-4 grid gap-3">
            <button type="button" onClick={() => setForWhom(asker)} className="min-h-12 rounded-2xl bg-[#AB47BC] px-4 text-lg font-black text-white">
              For me
            </button>
            {others.map((i) => (
              <button key={i} type="button" onClick={() => setForWhom(i)} className="min-h-12 rounded-2xl border-2 border-[#AB47BC] px-4 text-lg font-black text-white">
                For {nameOf(players, i)}
              </button>
            ))}
            {others.length === 0 && (
              <button type="button" onClick={() => setForWhom(SOMEONE_ELSE)} className="min-h-12 rounded-2xl border-2 border-[#AB47BC] px-4 text-lg font-black text-white">
                For someone who is not here
              </button>
            )}
          </div>
        </div>
      ) : (
        <p className="mt-3 max-w-md text-lg text-[#EDE7F6]">
          {answer
            ? 'The ball has spoken. Read into it what you will.'
            : target === 'self'
              ? `${askerName}, hold the phone in both hands. Close your eyes and ask your question silently. Breathe in, breathe out, then touch the ball.`
              : target === 'someone not here'
                ? `${askerName}, picture them. Ask your question for them, out loud or in your mind. Breathe in, breathe out, then touch the ball.`
                : `${askerName}, look at ${target} and ask your question out loud. ${target}, take the phone, breathe in, breathe out, and touch the ball.`}
        </p>
      )}

      <button type="button" onClick={shake} disabled={busy || forWhom === null || !!answer} aria-label="Touch the 16-Ball"
        className={`relative mt-8 aspect-square w-72 max-w-full rounded-full shadow-[0_0_80px_rgba(171,71,188,0.45)] disabled:cursor-default ${busy ? 'animate-pulse' : ''} ${forWhom === null ? 'opacity-50' : ''}`}>
        <span className="absolute inset-0 rounded-full transition-transform duration-[2000ms] ease-out"
          style={{ background: `conic-gradient(${wedges})`, transform: `rotate(${spin}deg)` }} />
        <span className="absolute inset-0 rounded-full transition-transform duration-[2000ms] ease-out opacity-60 mix-blend-screen"
          style={{ background: `conic-gradient(from 11.25deg, ${wedges})`, transform: `rotate(${-spin / 2}deg) scale(0.7)` }} />
        <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.45),transparent_40%)]" />
        <span className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/85 p-2 text-white">
          {busy ? (
            <span className="text-sm font-bold uppercase tracking-[0.15em]">Listening…</span>
          ) : answer ? (
            <span className="text-2xl font-black leading-tight">{answer.words}</span>
          ) : (
            <span className="text-sm font-bold uppercase tracking-[0.15em]">{forWhom === null ? '16' : 'Touch'}</span>
          )}
        </span>
      </button>

      <VoicePlayer ref={audio} className="mt-8 w-full max-w-md" />

      {answer && (
        <div className="mt-4">
          <p className="text-sm text-[#D7CCC8]">from {answer.song}</p>
          <button type="button" onClick={passOn} className="mt-4 min-h-12 rounded-2xl bg-[#FFD54F] px-6 font-bold text-black">
            {players.length > 1 ? `Pass the phone to ${nextName}` : 'Ask again'}
          </button>
        </div>
      )}
      {message && <p className="mt-4 text-[#D7CCC8]" role="status">{message}</p>}
      <button type="button" onClick={() => { setDraft(players.length ? players : ['', '']); setGathering(true); }}
        className="mt-8 text-sm font-bold text-[#FFD54F] underline-offset-4 hover:underline">
        Change the circle
      </button>
    </div>
  );
}
