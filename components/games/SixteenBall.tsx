'use client';

import { useEffect, useRef, useState } from 'react';
import { GAME_API, loadProgress, saveProgress, type GameElement } from '@/lib/games/meantsGame';
import { MOODS_FOR_PACE, SERENADE, useNugPlayer, usePlayerSense } from '@/lib/games/adaptive';

/* 16-Ball: the old 8-ball, remade as a 16-ball kaleidoscope. Ask the person
   across from you anything, shake, and the ball answers with one real
   BUG, ambiguous more often than not (GD, 2026-10-21: "favor amiguity"). Next
   game you ask the person to your left, then your right. The question stays in
   the room: it is never sent anywhere. */
const TURNS = ['across from you', 'to your left', 'to your right'] as const;
const KEY = 'meants-game:sixteen-ball:v1';
const COLORS = ['#FFD54F', '#FF7043', '#AB47BC', '#29B6F6', '#66BB6A', '#EC407A', '#FFA726', '#26C6DA'];

export default function SixteenBall() {
  const audio = useRef<HTMLAudioElement>(null);
  const [games, setGames] = useState<number>(() => loadProgress<{ games: number }>(KEY, { games: 0 }).games);
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

  const turn = TURNS[games % TURNS.length];

  async function shake() {
    sense.tap();
    nugs.stop();
    setBusy(true);
    setMessage('');
    setAnswer(null);
    setSpin((s) => s + 720 + Math.floor(Math.random() * 360));
    try {
      const body = (await (await fetch(`${GAME_API}&kind=ball`, { cache: 'no-store' })).json()) as { element: GameElement | null };
      await new Promise((r) => setTimeout(r, 1200));
      if (!body.element) {
        setMessage('The ball is cloudy. Shake again.');
        return;
      }
      setAnswer(body.element);
      const a = audio.current;
      if (a) {
        a.src = body.element.src;
        /* Steady and calm players hear a mood bed under the answer; quick players get a snip after it. */
        if (sense.pace !== 'quick') void nugs.bedUnder(a, MOODS_FOR_PACE[sense.pace]);
        a.onended = sense.pace === 'quick' ? () => void nugs.playAlone(MOODS_FOR_PACE.quick) : null;
        void a.play().catch(() => setMessage('Tap play to hear the answer.'));
      }
    } catch {
      setMessage('The ball is cloudy. Shake again.');
    } finally {
      setBusy(false);
    }
  }

  function nextGame() {
    sense.tap();
    nugs.stop();
    const n = games + 1;
    setGames(n);
    saveProgress(KEY, { games: n });
    setAnswer(null);
    setMessage('');
  }

  /* Sixteen mirrored wedges: each colour runs out and back, which is what makes it a kaleidoscope. */
  const wedges = Array.from({ length: 16 }, (_, i) => {
    const c = COLORS[(i % 2 ? 15 - i : i) % COLORS.length];
    return `${c} ${i * 22.5}deg ${(i + 1) * 22.5}deg`;
  }).join(', ');

  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#FFD54F]">Game {games + 1}</p>
      <p className="mt-1 text-xl font-bold">Ask the person {turn} any question.</p>

      <button type="button" onClick={shake} disabled={busy} aria-label="Shake the 16-Ball"
        className="relative mt-8 aspect-square w-72 max-w-full rounded-full shadow-[0_0_60px_rgba(255,213,79,0.25)] disabled:cursor-wait">
        <span className="absolute inset-0 rounded-full transition-transform duration-[1200ms] ease-out"
          style={{ background: `conic-gradient(${wedges})`, transform: `rotate(${spin}deg)` }} />
        <span className="absolute inset-0 rounded-full transition-transform duration-[1200ms] ease-out opacity-60 mix-blend-screen"
          style={{ background: `conic-gradient(from 11.25deg, ${wedges})`, transform: `rotate(${-spin / 2}deg) scale(0.7)` }} />
        <span className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/85 p-2 text-white">
          {busy ? (
            <span className="text-3xl font-black">16</span>
          ) : answer ? (
            <span className="text-2xl font-black leading-tight">{answer.words}</span>
          ) : (
            <span className="text-sm font-bold uppercase tracking-[0.15em]">Shake</span>
          )}
        </span>
      </button>

      <audio ref={audio} controls controlsList="nodownload" className="mt-8 w-full max-w-md" />

      {answer && (
        <div className="mt-4">
          <p className="text-sm text-[#D7CCC8]">from {answer.song}</p>
          <button type="button" onClick={nextGame} className="mt-4 min-h-12 rounded-2xl bg-[#FFD54F] px-6 font-bold text-black">
            Next game: ask the person {TURNS[(games + 1) % TURNS.length]}
          </button>
        </div>
      )}
      {message && <p className="mt-4 text-[#D7CCC8]" role="status">{message}</p>}
    </div>
  );
}
