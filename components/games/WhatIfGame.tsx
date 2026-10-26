'use client';

import { gameEvent } from '@/lib/games/gameEvent';
import VoicePlayer from './VoicePlayer';
import { playVoice } from '@/lib/games/clearVoice';
import { useEffect, useRef, useState } from 'react';
import { GAME_API, PRIZES, loadProgress, saveProgress, sendAnswer, type GameElement } from '@/lib/games/meantsGame';
import PrizeClaim from './PrizeClaim';

/* "What if...?" — GD, 2026-10-26: "Scenarios is my key." The game asks a What if
   in a mood picked at random, and the player picks what they would send: one of
   up to three TUGs that fit, or the BUG of a word they type. Every pick is filed
   so the catalogue's tags can be checked against real choices. Nothing is sent
   or charged. Moods are never mean. */
type Kind = { id: string; label: string };
type WhatIf = { id: string; kind: string; ask: string };
type Mood = { id: string; line: string };
type Progress = { answered: string[]; heard: string[] };

const KEY = 'meants-game:what-if:v1';
const LEVELS = [
  { level: 1, need: 3, prize: 'holiday-christmas-trio' },
  { level: 2, need: 5, prize: 'ten-free-downloads' },
  { level: 3, need: 7, prize: 'free-hug' },
] as const;

export default function WhatIfGame() {
  const audio = useRef<HTMLAudioElement>(null);
  const [kinds, setKinds] = useState<Kind[]>([]);
  const [whatIfs, setWhatIfs] = useState<WhatIf[]>([]);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [kind, setKind] = useState('');
  const [progress, setProgress] = useState<Progress>(() => loadProgress<Progress>(KEY, { answered: [], heard: [] }));
  const [active, setActive] = useState<WhatIf | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [choices, setChoices] = useState<GameElement[]>([]);
  const [playing, setPlaying] = useState('');
  const [word, setWord] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`${GAME_API}&kind=what-ifs`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((b: { kinds?: Kind[]; scenarios?: WhatIf[]; moods?: Mood[] }) => {
        setKinds(b.kinds ?? []);
        setWhatIfs(b.scenarios ?? []);
        setMoods(b.moods ?? []);
        setKind(b.kinds?.[0]?.id ?? '');
      })
      .catch(() => setMessage('The game is loading slowly. Please refresh in a moment.'));
  }, []);

  const done = progress.answered.length;
  const cleared = LEVELS.filter((l) => done >= l.need);
  const next = LEVELS.find((l) => done < l.need);

  async function ask(whatIf: WhatIf, sameMood = false) {
    const m = sameMood && mood ? mood : moods[Math.floor(Math.random() * moods.length)] ?? null;
    setActive(whatIf);
    setMood(m);
    setChoices([]);
    setPlaying('');
    setWord('');
    setMessage('');
    setBusy(true);
    audio.current?.pause();
    if (!sameMood) gameEvent('game_start', { game: 'what-if', round: whatIf.id });
    try {
      const shown = sameMood ? choices.map((c) => c.reference).filter((r): r is string => Boolean(r)) : [];
      const params = new URLSearchParams({ kind: 'what-if', scenario: whatIf.id, mood: m?.id ?? '', skip: [...progress.heard, ...shown].join(',') });
      const body = (await (await fetch(`${GAME_API}&${params}`, { cache: 'no-store' })).json()) as { elements?: GameElement[] };
      const found = body.elements ?? [];
      setChoices(found);
      if (!found.length) setMessage('No song fits this one yet. Type a word below, or try another What if.');
    } catch {
      setMessage('That did not load. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function findWord() {
    const w = word.trim().toLowerCase();
    if (!w || w.includes(' ')) {
      setMessage('Type one word.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const params = new URLSearchParams({ kind: 'bug', word: w, sendable: '1', bare: '1' });
      const body = (await (await fetch(`${GAME_API}&${params}`, { cache: 'no-store' })).json()) as { element: GameElement | null };
      if (!body.element) {
        setMessage(`No song sings “${w}” yet. Try another word.`);
        return;
      }
      setChoices((c) => [...c.filter((e) => e.tier !== 'BUG'), body.element as GameElement]);
      listen(body.element);
    } catch {
      setMessage('That did not load. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function listen(element: GameElement) {
    const a = audio.current;
    if (!a) return;
    setPlaying(element.src);
    void playVoice(a, element.src).catch(() => setMessage('Tap play to listen.'));
  }

  function pick(element: GameElement) {
    if (!active) return;
    gameEvent('game_finish', { game: 'what-if', round: active.id });
    if (element.reference) {
      void sendAnswer({
        type: 'would-send',
        reference: element.reference,
        scenario: active.id,
        ask: active.ask,
        mood: mood?.id ?? '',
        tier: element.tier,
      });
    }
    const offered = choices.map((c) => c.reference).filter((r): r is string => Boolean(r));
    const updated: Progress = {
      answered: progress.answered.includes(active.id) ? progress.answered : [...progress.answered, active.id],
      heard: [...progress.heard, ...offered].slice(-60),
    };
    setProgress(updated);
    saveProgress(KEY, updated);
    setMessage(`Good pick: “${element.words}”. Saved. Try another What if.`);
    setActive(null);
    setChoices([]);
    audio.current?.pause();
  }

  return (
    <div>
      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#FFD54F]">
          {next ? `Level ${next.level}` : 'All 3 levels cleared'} · {done} What if{done === 1 ? '' : 's'} answered
        </p>
        {next && <p className="mt-1 text-sm text-[#D7CCC8]">Answer {next.need - done} more to clear level {next.level}.</p>}
      </div>

      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Kinds of What if">
        {kinds.map((k) => (
          <button key={k.id} type="button" role="tab" aria-selected={kind === k.id} onClick={() => setKind(k.id)}
            className={`min-h-12 rounded-full border px-4 py-2 font-bold ${kind === k.id ? 'border-[#FFD54F] bg-[#FFD54F] text-black' : 'border-white/30 text-white'}`}>
            {k.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3">
        {whatIfs.filter((w) => w.kind === kind).map((w) => (
          <button key={w.id} type="button" disabled={busy} onClick={() => ask(w)}
            className={`min-h-14 rounded-2xl border px-4 py-3 text-left text-lg font-bold ${active?.id === w.id ? 'border-[#FFD54F] bg-[#FFD54F] text-black' : 'border-white/30 text-white'} disabled:opacity-60`}>
            {w.ask} {progress.answered.includes(w.id) && <span className="text-sm font-normal opacity-70">· answered</span>}
          </button>
        ))}
      </div>

      {active && (
        <div className="mt-6 rounded-2xl border border-[#FFD54F]/40 bg-black/40 p-4">
          <p className="text-2xl font-black">{active.ask}</p>
          {mood && <p className="mt-1 text-[#FFD54F]">{mood.line}</p>}
          <p className="mt-3 text-[#D7CCC8]">Listen, then pick the one you would send.</p>

          <div className="mt-4 grid gap-3">
            {choices.map((c) => (
              <div key={c.src} className={`rounded-2xl border p-3 ${playing === c.src ? 'border-[#FFD54F]' : 'border-white/20'}`}>
                <p className="text-lg font-bold">“{c.words}”</p>
                <p className="text-sm text-[#D7CCC8]">{c.tier === 'BUG' ? 'a BUG, one word' : `from ${c.song} · a TUG`}</p>
                <div className="mt-3 flex gap-3">
                  <button type="button" onClick={() => listen(c)} className="min-h-12 flex-1 rounded-2xl border border-white/30 px-4 py-2 font-bold">▶ Listen</button>
                  <button type="button" onClick={() => pick(c)} className="min-h-12 flex-1 rounded-2xl bg-[#FFD54F] px-4 py-2 font-bold text-black">I would send this</button>
                </div>
              </div>
            ))}
          </div>

          {/* The player sits under the choices, so Replay is in reach on a phone. */}
          <VoicePlayer ref={audio} className="mt-4 w-full" />

          {choices.some((c) => c.tier === 'TUG') && (
            <button type="button" disabled={busy} onClick={() => ask(active, true)}
              className="mt-3 min-h-12 w-full rounded-2xl border border-white/30 px-4 py-2 font-bold disabled:opacity-60">
              None of these. Show me others
            </button>
          )}

          <form className="mt-4" onSubmit={(e) => { e.preventDefault(); void findWord(); }}>
            <label className="block text-sm text-[#D7CCC8]" htmlFor="what-if-word">Or send one word, sung</label>
            <div className="mt-2 flex gap-3">
              <input id="what-if-word" value={word} onChange={(e) => setWord(e.target.value)} placeholder="e.g. home"
                className="min-h-12 flex-1 rounded-2xl border border-white/20 bg-black/40 px-4 py-2 text-white placeholder:text-white/40" />
              <button type="submit" disabled={busy} className="min-h-12 rounded-2xl border border-[#FFD54F] px-4 py-2 font-bold text-[#FFD54F] disabled:opacity-60">Find it</button>
            </div>
          </form>
        </div>
      )}

      {message && <p className="mt-4 text-[#D7CCC8]" role="status">{message}</p>}

      {cleared.map((l) => (
        <PrizeClaim key={l.level} game="what-if" level={l.level} prize={PRIZES[l.prize]} reference={progress.heard.at(-1) ?? null} />
      ))}
    </div>
  );
}
