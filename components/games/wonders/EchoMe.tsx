'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchNug, rollGolden } from '@/lib/games/wonders';

/* Echo me: the game plays a pattern on four glowing pads, each its own sound,
   and the player taps it back. Each round grows one longer; every third round
   one pad quietly changes its sound, so it grows stranger too. */
const PAD_COLORS = ['#FFD54F', '#FF7043', '#29B6F6', '#AB47BC'];
const PAD_MOODS = [['Bright', 'Playful'], ['Energetic', 'Driving'], ['Cool', 'Atmospheric'], ['Mysterious', 'Quirky']];

export default function EchoMe() {
  const pads = useRef<(HTMLAudioElement | null)[]>([null, null, null, null]);
  const ids = useRef<string[]>([]);
  const [pattern, setPattern] = useState<number[]>([]);
  const [lit, setLit] = useState<number | null>(null);
  const [step, setStep] = useState(0);
  const [state, setState] = useState<'idle' | 'loading' | 'showing' | 'yours' | 'over'>('idle');
  const [best, setBest] = useState(0);

  useEffect(() => () => pads.current.forEach((a) => a?.pause()), []);

  async function loadPad(i: number) {
    const n = await fetchNug(PAD_MOODS[i], ids.current);
    if (!n) return;
    ids.current.push(n.id);
    const a = new Audio(n.src);
    a.preload = 'auto';
    pads.current[i] = a;
  }

  async function sound(i: number) {
    const a = pads.current[i];
    setLit(i);
    if (a) {
      a.currentTime = 0;
      void a.play().catch(() => {});
    }
    await new Promise((r) => setTimeout(r, 550));
    a?.pause();
    setLit(null);
    await new Promise((r) => setTimeout(r, 150));
  }

  async function show(p: number[]) {
    setState('showing');
    for (const i of p) await sound(i);
    setStep(0);
    setState('yours');
  }

  async function start() {
    setState('loading');
    await Promise.all([0, 1, 2, 3].map(loadPad));
    const p = [Math.floor(Math.random() * 4)];
    setPattern(p);
    await show(p);
  }

  async function tap(i: number) {
    if (state !== 'yours') return;
    void sound(i);
    if (pattern[step] !== i) {
      setBest((b) => Math.max(b, pattern.length - 1));
      setState('over');
      return;
    }
    if (step + 1 < pattern.length) return setStep(step + 1);
    const p = [...pattern, Math.floor(Math.random() * 4)];
    if (p.length % 3 === 0) await loadPad(Math.floor(Math.random() * 4));
    rollGolden();
    setPattern(p);
    await new Promise((r) => setTimeout(r, 700));
    await show(p);
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="grid w-full max-w-xs grid-cols-2 gap-3">
        {PAD_COLORS.map((c, i) => (
          <button key={c} type="button" onClick={() => tap(i)} aria-label={`Pad ${i + 1}`}
            className="aspect-square rounded-3xl transition-all duration-100"
            style={{ background: c, opacity: lit === i ? 1 : 0.35, transform: lit === i ? 'scale(1.06)' : 'none', boxShadow: lit === i ? `0 0 40px ${c}` : 'none' }} />
        ))}
      </div>
      <p className="min-h-6 font-bold" role="status">
        {state === 'idle' && 'Listen, then tap it back.'}
        {state === 'loading' && 'Tuning the pads…'}
        {state === 'showing' && `Round ${pattern.length}: listen.`}
        {state === 'yours' && 'Your turn.'}
        {state === 'over' && `You echoed ${pattern.length - 1}. Best: ${Math.max(best, pattern.length - 1)}.`}
      </p>
      {(state === 'idle' || state === 'over') && (
        <button type="button" onClick={start} className="min-h-12 rounded-2xl bg-[#FFD54F] px-6 font-bold text-black">
          {state === 'over' ? 'Again' : 'Start'}
        </button>
      )}
    </div>
  );
}
