'use client';

import { useEffect, useRef, useState } from 'react';
import { EaglesFlyBy } from '@/components/BraveAndBravo';

/* The flyby promo on every page about Michael Scherer: BRAVE and BRAVO fly across, and one of
   his sweet spots waits behind a Play button. One per visit, a different one next visit.
   Press to play, stream only, never a download, nothing plays until it is pressed.
   GD, 2026-11-28 (lib/scherer/sweetSpots.ts; docs/governance/SCHERER-FLYBY-AND-BTI-2026-11-28.md). */
export default function SchererFlyBy() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [n, setN] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [problem, setProblem] = useState(false);

  useEffect(() => {
    setN(Math.floor(Math.random() * 1000));
  }, []);

  async function toggle() {
    const el = audio.current;
    if (!el || n === null) return;
    if (playing) {
      el.pause();
      setPlaying(false);
      return;
    }
    setProblem(false);
    if (!el.src) el.src = `/api/scherer/sweet-spot?n=${n}`;
    try {
      await el.play();
      setPlaying(true);
    } catch {
      setProblem(true);
    }
  }

  return (
    <div className="relative mx-auto my-6 flex min-h-[72px] max-w-3xl items-center justify-center gap-4 overflow-hidden rounded-2xl border border-amber-300/30 bg-gradient-to-r from-[#1a1207] via-[#2a1d0c] to-[#1a1207] px-4 py-3 text-center">
      <EaglesFlyBy height={56} />
      <span className="relative text-sm font-black uppercase tracking-widest text-amber-100">Hear Michael Scherer</span>
      <button
        type="button"
        onClick={toggle}
        disabled={n === null}
        className="relative shrink-0 whitespace-nowrap rounded-full bg-[#FFD54F] px-5 py-2 text-sm font-black text-[#2A1506] hover:bg-[#FFE082] disabled:opacity-50"
      >
        {playing ? '■ Stop' : '▶ Play'}
      </button>
      {problem && <span className="relative text-xs text-amber-200/80">Try again in a moment.</span>}
      <audio
        ref={audio}
        preload="none"
        controlsList="nodownload noplaybackrate"
        onContextMenu={(e) => e.preventDefault()}
        onEnded={() => setPlaying(false)}
      />
    </div>
  );
}
