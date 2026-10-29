'use client';

import { gameEvent } from '@/lib/games/gameEvent';
import VoicePlayer from './VoicePlayer';
import { playVoice } from '@/lib/games/clearVoice';
import { useEffect, useRef, useState } from 'react';
import { GAME_API, PRIZES, loadProgress, saveProgress, sendAnswer, type GameElement } from '@/lib/games/meantsGame';
import PrizeClaim from './PrizeClaim';
import { MOODS_FOR, SERENADE, nextSuggestion, useNugPlayer, usePlayerSense } from '@/lib/games/adaptive';

/* "Can I…?" — the song asks, the listener answers. Each challenge plays a
   TUG whose catalogue tags fit it, and every "Did it?" is filed so the tags can
   be checked against real listeners. Songs only, nothing personal. */
type Challenge = { id: string; ask: string };
type Progress = { answered: string[]; heard: string[] };

const KEY = 'meants-game:can-i:v1';
const LEVELS = [
  { level: 1, need: 3, prize: 'holiday-christmas-trio' },
  { level: 2, need: 5, prize: 'ten-free-downloads' },
  { level: 3, need: 7, prize: 'free-hug' },
] as const;

export default function CanIGame() {
  const audio = useRef<HTMLAudioElement>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [progress, setProgress] = useState<Progress>(() => loadProgress<Progress>(KEY, { answered: [], heard: [] }));
  const [active, setActive] = useState<Challenge | null>(null);
  const [search, setSearch] = useState('');
  const [element, setElement] = useState<GameElement | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState<{ id: string; yes: boolean } | null>(null);
  const sense = usePlayerSense();
  const nugs = useNugPlayer();

  /* Calm-down: rapid taps bring a soft serenade and a short pause. */
  useEffect(() => {
    if (!sense.frustrated) return;
    audio.current?.pause();
    void nugs.playAlone(SERENADE);
    setMessage('Take a breath. Here is something calm.');
    setBusy(true);
    const t = setTimeout(() => {
      setBusy(false);
      sense.settle();
    }, 5000);
    return () => clearTimeout(t);
  }, [sense.frustrated]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetch(`${GAME_API}&kind=challenges`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((b: { challenges?: Challenge[] }) => setChallenges(b.challenges ?? []))
      .catch(() => setMessage('The game is loading slowly. Please refresh in a moment.'));
  }, []);

  const done = progress.answered.length;
  const cleared = LEVELS.filter((l) => done >= l.need);
  const next = LEVELS.find((l) => done < l.need);
  const suggested = nextSuggestion(last, challenges.map((c) => c.id), progress.answered);
  /* After a round, one tap starts the next: the suggested challenge, or the same one again with a new TUG (GD, 2026-10-29: "go"). */
  const again = challenges.find((c) => c.id === suggested) ?? challenges.find((c) => c.id === last?.id);

  async function play(challenge: Challenge) {
    sense.tap();
    nugs.stop();
    setActive(challenge);
    gameEvent('game_start', { game: 'can-i', round: challenge.id });
    setBusy(true);
    setMessage('');
    setElement(null);
    try {
      const params = new URLSearchParams({ kind: 'tug', challenge: challenge.id, q: search, skip: progress.heard.join(',') });
      const body = (await (await fetch(`${GAME_API}&${params}`, { cache: 'no-store' })).json()) as { element: GameElement | null };
      if (!body.element) {
        setMessage(search ? `No song matched “${search}” for this one. Clear the search and try again.` : 'Nothing found for this one yet.');
        return;
      }
      setElement(body.element);
      const a = audio.current;
      if (a) {
        /* Steady and calm players hear a mood bed under the TUG; quick players get it bare. */
        if (sense.pace !== 'quick') void nugs.bedUnder(a, MOODS_FOR[challenge.id] ?? []);
        void playVoice(a, body.element.src).catch(() => setMessage('Tap play to listen.'));
      }
    } catch {
      setMessage('That did not load. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function answer(yes: boolean) {
    if (!active || !element) return;
    sense.tap();
    gameEvent('game_finish', { game: 'can-i', round: active.id });
    if (element.reference) {
      void sendAnswer({ type: 'did-it', reference: element.reference, challenge: active.id, ask: active.ask, answer: yes ? 'yes' : 'no' });
    }
    const updated: Progress = {
      answered: progress.answered.includes(active.id) ? progress.answered : [...progress.answered, active.id],
      heard: element.reference ? [...progress.heard, element.reference].slice(-40) : progress.heard,
    };
    setProgress(updated);
    saveProgress(KEY, updated);
    setMessage(yes ? 'The song wins this one!' : 'You win this one. Try another challenge.');
    setLast({ id: active.id, yes });
    setElement(null);
    setActive(null);
    audio.current?.pause();
    nugs.stop();
    /* Quick players get a snip as the round's sting. */
    if (sense.pace === 'quick') void nugs.playAlone(MOODS_FOR[active.id] ?? []);
  }

  return (
    <div>
      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#FFD54F]">
          {next ? `Level ${next.level}` : 'All 3 levels cleared'} · {done} of 7 challenges
        </p>
        {next && <p className="mt-1 text-sm text-[#D7CCC8]">Answer {next.need - done} more to clear level {next.level}.</p>}
      </div>

      <label className="mt-6 block">
        <span className="text-sm text-[#D7CCC8]">Optional: pick a song or a word to search</span>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="e.g. home, or a song title"
          className="mt-2 w-full rounded-2xl border border-white/20 bg-black/40 px-4 py-3 text-white placeholder:text-white/40" />
      </label>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {challenges.map((c) => {
          const tried = progress.answered.includes(c.id);
          return (
            <button key={c.id} type="button" disabled={busy} onClick={() => play(c)}
              className={`min-h-14 rounded-2xl border px-4 py-3 text-left text-lg font-bold ${active?.id === c.id ? 'border-[#FFD54F] bg-[#FFD54F] text-black' : 'border-white/30 text-white'} disabled:opacity-60`}>
              {c.ask} {tried && <span className="text-sm font-normal opacity-70">· answered</span>}
              {suggested === c.id && active?.id !== c.id && <span className="ml-2 rounded-full bg-[#FFD54F]/20 px-2 py-0.5 text-xs font-bold text-[#FFD54F]">try next</span>}
            </button>
          );
        })}
      </div>

      <VoicePlayer ref={audio} className="mt-6 w-full" />

      {element && active && (
        <div className="mt-4 rounded-2xl border border-[#FFD54F]/40 bg-black/40 p-4">
          <p className="text-xl font-bold">“{element.words}”</p>
          <p className="mt-1 text-sm text-[#D7CCC8]">from {element.song} · a TUG</p>
          <p className="mt-4 font-bold">{active.ask} Did it?</p>
          <div className="mt-3 flex gap-3">
            <button type="button" onClick={() => answer(true)} className="min-h-12 flex-1 rounded-2xl bg-[#FFD54F] px-4 py-3 font-bold text-black">Yes</button>
            <button type="button" onClick={() => answer(false)} className="min-h-12 flex-1 rounded-2xl border border-white/30 px-4 py-3 font-bold">No</button>
          </div>
        </div>
      )}

      {message && <p className="mt-4 text-[#D7CCC8]" role="status">{message}</p>}

      {last && !active && again && (
        <button type="button" disabled={busy} onClick={() => play(again)}
          className="mt-3 min-h-12 w-full rounded-2xl bg-[#FFD54F] px-4 py-3 text-lg font-bold text-black disabled:opacity-60">
          Play again: {again.ask}
        </button>
      )}

      {cleared.map((l) => (
        <PrizeClaim key={l.level} game="can-i" level={l.level} prize={PRIZES[l.prize]} reference={progress.heard.at(-1) ?? null} />
      ))}
    </div>
  );
}
