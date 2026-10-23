'use client';

import VoicePlayer from './VoicePlayer';
import SendLine from './SendLine';
import { gameEvent } from '@/lib/games/gameEvent';
import { playVoice } from '@/lib/games/clearVoice';
import { useEffect, useRef, useState } from 'react';
import { GAME_API, loadProgress, saveProgress, type GameElement } from '@/lib/games/meantsGame';
import { MOODS_FOR_PACE, SERENADE, useNugPlayer, usePlayerSense } from '@/lib/games/adaptive';
import { STARS_FOR_GOLDEN, isSweet, lineFromParam, reelFor } from '@/lib/games/bugReels';

/* BUG Reels: pull the lever, the reels stop one by one on a word each, and the
   line is sung word by word. Every pull sings; there is nothing to lose. Hold
   keeps a word, Nudge steps one reel by one word (once a pull), a Sweet Line
   earns a star, and three stars open a Golden Pull with a fourth reel. The
   song is never named (bare=1). See lib/games/bugReels.ts for the history. */
type Progress = { pulls: number; stars: number; golden: boolean };
const KEY = 'meants-game:bug-reels:v1';
const GAME = 'bug-reels';
const STOP_MS = [900, 1400, 1900, 2400];

const pick = (list: string[]) => list[Math.floor(Math.random() * list.length)];

/* Whole words only, never broken: longer words and the fourth reel get a smaller size. */
const SIZES = ['text-3xl sm:text-5xl', 'text-2xl sm:text-4xl', 'text-lg sm:text-3xl', 'text-sm sm:text-2xl', 'text-xs sm:text-xl'];
const sizeFor = (word: string, reels: number) =>
  SIZES[Math.min(4, (word.length > 8 ? 3 : word.length > 6 ? 2 : word.length > 4 ? 1 : 0) + (reels === 4 ? 1 : 0))];

async function bugFor(word: string): Promise<GameElement | null> {
  try {
    const params = new URLSearchParams({ kind: 'bug', word, bare: '1' });
    const body = (await (await fetch(`${GAME_API}&${params}`, { cache: 'no-store' })).json()) as { element: GameElement | null };
    return body.element;
  } catch {
    return null;
  }
}

export default function BugReels() {
  const audio = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState<Progress>(() => loadProgress<Progress>(KEY, { pulls: 0, stars: 0, golden: false }));
  const [words, setWords] = useState<string[]>(['i', 'love', 'you']);
  const [sung, setSung] = useState<(GameElement | null)[]>([]);
  const [held, setHeld] = useState<boolean[]>([false, false, false, false]);
  const [spinning, setSpinning] = useState<boolean[]>([false, false, false, false]);
  const [flicker, setFlicker] = useState(0);
  const [busy, setBusy] = useState(false);
  const [pulled, setPulled] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [starred, setStarred] = useState(false);
  const [now, setNow] = useState(-1);
  const [sent, setSent] = useState<string[] | null>(null);
  const [message, setMessage] = useState('');
  const sense = usePlayerSense();
  const nugs = useNugPlayer();

  /* A line someone sent: shown on the reels, sung when the player taps. */
  useEffect(() => {
    const line = lineFromParam(new URLSearchParams(window.location.search).get('line'));
    if (line) {
      setWords(line);
      setSent(line);
    }
  }, []);

  /* Calm-down: rapid pulls rest the machine and bring a soft serenade instead. */
  useEffect(() => {
    if (!sense.frustrated) return;
    audio.current?.pause();
    void nugs.playAlone(SERENADE);
    setMessage('The reels are resting. Here is something calm.');
    setBusy(true);
    const t = setTimeout(() => {
      setBusy(false);
      setMessage('');
      sense.settle();
    }, 5000);
    return () => clearTimeout(t);
  }, [sense.frustrated]); // eslint-disable-line react-hooks/exhaustive-deps

  /* While a reel spins its words blur past. */
  useEffect(() => {
    if (!spinning.some(Boolean)) return;
    const t = setInterval(() => setFlicker((f) => f + 1), 70);
    return () => clearInterval(t);
  }, [spinning]);

  function sing(list: (GameElement | null)[], i: number, first = true) {
    const a = audio.current;
    while (i < list.length && !list[i]) i += 1;
    if (!a || i >= list.length) {
      setNow(-1);
      nugs.stop();
      /* Quick players get a snip to close the line; steady and calm ones heard a quiet bed under it. */
      if (a && !first && sense.pace === 'quick') void nugs.playAlone(MOODS_FOR_PACE.quick);
      return;
    }
    if (first && sense.pace !== 'quick') void nugs.ambient(MOODS_FOR_PACE[sense.pace]);
    setNow(i);
    a.onended = () => sing(list, i + 1, false);
    void playVoice(a, list[i]!.src).catch(() => setMessage('Tap play to hear the line.'));
  }

  /* Score a finished line once per pull: a star for a Sweet Line, a Golden Pull at every third star. */
  function score(line: string[], base: Progress, alreadyStarred: boolean): Progress {
    if (alreadyStarred || !isSweet(line)) return base;
    setStarred(true);
    const stars = base.stars + 1;
    const golden = base.golden || stars % STARS_FOR_GOLDEN === 0;
    setMessage(golden && !base.golden ? 'A Sweet Line! That is a star, and a Golden Pull is ready.' : 'A Sweet Line! That is a star.');
    return { ...base, stars, golden };
  }

  function finish(line: string[], found: (GameElement | null)[], next: Progress) {
    setSung(found);
    setProgress(next);
    saveProgress(KEY, next);
    const missing = line.filter((_, i) => !found[i]);
    if (missing.length) setMessage(`Not sung yet: ${missing.join(', ')}. Nudge or pull again.`);
    if (found.some(Boolean)) gameEvent('game_finish', { game: GAME, round: String(line.length) });
    sing(found, 0);
  }

  async function pull() {
    sense.tap();
    if (busy) return;
    const count = progress.golden ? 4 : 3;
    const keep = held.slice(0, count);
    if (keep.every(Boolean)) {
      setMessage('Let go of one reel to pull.');
      return;
    }
    audio.current?.pause();
    nugs.stop();
    setBusy(true);
    setSent(null);
    setNow(-1);
    setMessage('');
    setStarred(false);
    gameEvent('game_start', { game: GAME });
    const line = Array.from({ length: count }, (_, i) => (keep[i] && words[i] ? words[i] : pick(reelFor(i))));
    const spin = Array.from({ length: 4 }, (_, i) => i < count && !keep[i]);
    setSpinning(spin);
    const fetching = Promise.all(line.map((w, i) => (keep[i] && sung[i]?.words === w ? Promise.resolve(sung[i]) : bugFor(w))));
    /* The reels stop left to right, each on its word. */
    await Promise.all(
      spin.map((s, i) =>
        s
          ? new Promise<void>((r) =>
              setTimeout(() => {
                setWords((ws) => Object.assign([...ws], { [i]: line[i] }).slice(0, count));
                setSpinning((sp) => Object.assign([...sp], { [i]: false }));
                r();
              }, STOP_MS[i]),
            )
          : Promise.resolve(),
      ),
    );
    setWords(line);
    const found = await fetching;
    setBusy(false);
    setPulled(true);
    setNudge(true);
    const used = { ...progress, pulls: progress.pulls + 1, golden: count === 4 ? false : progress.golden };
    if (count === 4) setHeld([false, false, false, false]);
    finish(line, found, score(line, used, false));
  }

  async function nudgeReel(i: number) {
    sense.tap();
    if (busy || !nudge) return;
    nugs.stop();
    audio.current?.pause();
    setNudge(false);
    setMessage('');
    const reel = reelFor(i);
    const line = [...words];
    line[i] = reel[(reel.indexOf(line[i]) + 1) % reel.length];
    setWords(line);
    setBusy(true);
    const found = [...sung];
    found[i] = await bugFor(line[i]);
    setBusy(false);
    finish(line, found, score(line, progress, starred));
  }

  async function hearSent() {
    if (!sent) return;
    sense.tap();
    setBusy(true);
    const found = await Promise.all(sent.map(bugFor));
    setBusy(false);
    setSung(found);
    if (!found.some(Boolean)) {
      setMessage('That line did not load. Pull for a new one.');
      return;
    }
    sing(found, 0);
  }

  const count = progress.golden ? 4 : 3;
  const shown = Array.from({ length: Math.max(count, words.length) }, (_, i) => i);
  const done = pulled && !busy && sung.length === words.length && sung.every(Boolean);
  const filled = progress.golden ? STARS_FOR_GOLDEN : progress.stars % STARS_FOR_GOLDEN;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-black/30 p-4">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#FFD54F]">
          {Array.from({ length: STARS_FOR_GOLDEN }, (_, i) => (
            <span key={i} aria-hidden className={`text-xl ${i < filled ? 'text-[#FFD54F]' : 'text-white/20'}`}>★</span>
          ))}{' '}
          {progress.stars} {progress.stars === 1 ? 'star' : 'stars'}
        </p>
        <p className="text-sm text-[#D7CCC8]">
          {progress.golden ? 'Golden Pull ready: a fourth reel!' : `${STARS_FOR_GOLDEN - filled} more for a Golden Pull`}
        </p>
      </div>

      <div className={`mt-6 rounded-[2rem] border-4 p-4 shadow-[0_0_60px_rgba(255,213,79,0.2)] ${progress.golden ? 'border-[#FFD54F] bg-[#3a2a07]' : 'border-[#8B4513] bg-[#2a1a0a]'}`}>
        <div className={`grid gap-3 ${shown.length === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
          {shown.map((i) => {
            const reel = reelFor(i);
            const word = spinning[i] ? reel[(flicker + i * 5) % reel.length] : words[i] ?? '?';
            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <button type="button" onClick={() => pulled && !busy && sing(sung.slice(i, i + 1), 0)} aria-label={`Reel ${i + 1}: ${word}`}
                  className={`flex h-28 w-full items-center justify-center overflow-hidden rounded-2xl border-2 bg-white px-1 text-black ${now === i ? 'border-[#EC407A] ring-4 ring-[#EC407A]/50' : held[i] ? 'border-[#66BB6A]' : 'border-white/40'}`}>
                  <span className={`text-center font-black leading-none ${sizeFor(word, shown.length)} ${spinning[i] ? 'opacity-60 blur-[1px]' : ''} ${pulled && !busy && !sung[i] ? 'text-black/30' : ''}`}>
                    {word}
                  </span>
                </button>
                {pulled && (
                  <div className="flex w-full flex-col gap-2">
                    <button type="button" disabled={busy} onClick={() => setHeld((h) => Object.assign([...h], { [i]: !h[i] }))}
                      className={`min-h-11 rounded-xl text-sm font-black ${held[i] ? 'bg-[#66BB6A] text-black' : 'border border-white/30 text-white'}`}>
                      {held[i] ? 'Held' : 'Hold'}
                    </button>
                    <button type="button" disabled={busy || !nudge} onClick={() => void nudgeReel(i)}
                      className="min-h-11 rounded-xl border border-[#FFD54F]/60 text-sm font-black text-[#FFD54F] disabled:opacity-30">
                      Nudge ▼
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button type="button" onClick={() => void pull()} disabled={busy}
          className="mt-5 flex min-h-16 w-full items-center justify-center rounded-2xl bg-[#EC407A] px-6 text-2xl font-black text-white shadow-lg disabled:opacity-60">
          {busy ? 'Spinning…' : progress.golden ? 'Golden Pull!' : 'Pull'}
        </button>
        {pulled && <p className="mt-2 text-center text-xs text-[#D7CCC8]">Tap a word to hear it again. One nudge each pull.</p>}
      </div>

      <VoicePlayer ref={audio} className="mt-6 w-full" />

      {sent && !pulled && (
        <div className="mt-4 rounded-2xl border border-[#FFD54F]/40 bg-black/40 p-4 text-center">
          <p className="text-lg font-black">Someone sent you a sung line.</p>
          <button type="button" onClick={() => void hearSent()} disabled={busy} className="mt-3 min-h-12 w-full rounded-2xl bg-[#FFD54F] px-5 text-lg font-black text-black">
            Hear it
          </button>
          <p className="mt-2 text-sm text-[#D7CCC8]">Then pull for your own line.</p>
        </div>
      )}

      {message && <p className="mt-4 text-center text-lg font-bold text-[#FFD54F]" role="status">{message}</p>}

      {done && <SendLine words={words} game={GAME} />}
    </div>
  );
}
