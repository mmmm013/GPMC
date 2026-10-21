'use client';

import { useEffect, useRef, useState } from 'react';
import { GAME_API, loadProgress, saveProgress, sendAnswer, type GameElement } from '@/lib/games/meantsGame';

/* "Can I…?" — the song asks, the listener answers. Each challenge plays a
   TUG whose catalogue tags fit it, and every "Did it?" is filed so the tags can
   be checked against real listeners. Songs only, nothing personal. */
type Challenge = { id: string; ask: string };
type Progress = { answered: string[]; heard: string[] };

const KEY = 'meants-game:can-i:v1';
const LEVELS = [
  { level: 1, need: 3 },
  { level: 2, need: 5 },
  { level: 3, need: 7 },
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

  useEffect(() => {
    fetch(`${GAME_API}&kind=challenges`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((b: { challenges?: Challenge[] }) => setChallenges(b.challenges ?? []))
      .catch(() => setMessage('The game is loading slowly. Please refresh in a moment.'));
  }, []);

  const done = progress.answered.length;
  const cleared = LEVELS.filter((l) => done >= l.need);
  const next = LEVELS.find((l) => done < l.need);

  async function play(challenge: Challenge) {
    setActive(challenge);
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
        a.src = body.element.src;
        void a.play().catch(() => setMessage('Tap play to listen.'));
      }
    } catch {
      setMessage('That did not load. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function answer(yes: boolean) {
    if (!active || !element) return;
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
    setElement(null);
    setActive(null);
    audio.current?.pause();
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
            </button>
          );
        })}
      </div>

      <audio ref={audio} controls controlsList="nodownload" className="mt-6 w-full" />

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

      {cleared.map((l) => (
          <p key={l.level} className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-[#D7CCC8]">
            Level {l.level} cleared!
          </p>
      ))}
    </div>
  );
}
