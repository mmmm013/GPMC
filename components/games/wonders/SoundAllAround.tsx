'use client';

import { useEffect, useRef, useState } from 'react';
import { audioContext, fetchNug, rollGolden, wired } from '@/lib/games/wonders';

/* Sound all around: with headphones, sounds circle the player's head, creep up
   behind them, and fly past. Each sound is placed in space on its own. */
const PATHS = [
  { name: 'circles you', at: (t: number) => [Math.sin(t * 2) * 3, 0, -Math.cos(t * 2) * 3] },
  { name: 'creeps up behind you', at: (t: number) => [Math.sin(t * 5) * 0.4, 0, 8 - t * 7] },
  { name: 'flies past', at: (t: number) => [-10 + t * 20, 1, -1.5] },
  { name: 'rises over your head', at: (t: number) => [0, -4 + t * 8, 0.5] },
] as const;

const SPOOKY = ['Dark', 'Mysterious', 'Tension', 'Spooky', 'Atmospheric'];

export default function SoundAllAround({ moods }: { moods: string[] }) {
  const [now, setNow] = useState('');
  const stopRef = useRef<(() => void) | null>(null);
  const heard = useRef<string[]>([]);

  useEffect(() => () => stopRef.current?.(), []);

  async function go() {
    stopRef.current?.();
    const nug = await fetchNug([...SPOOKY, ...moods], heard.current);
    if (!nug) return setNow('No sound came. Try again.');
    heard.current.push(nug.id);
    const ac = audioContext();
    const panner = new PannerNode(ac, { panningModel: 'HRTF', distanceModel: 'inverse', refDistance: 1 });
    const w = wired(nug.src, panner);
    const path = PATHS[Math.floor(Math.random() * PATHS.length)];
    w.el.loop = true;
    const seconds = Math.max(4, nug.seconds * 3);
    const begin = performance.now();
    let on = true;
    const move = () => {
      if (!on) return;
      const t = Math.min(1, (performance.now() - begin) / 1000 / seconds);
      const [x, y, z] = path.at(t);
      panner.positionX.value = x;
      panner.positionY.value = y;
      panner.positionZ.value = z;
      if (t >= 1) {
        on = false;
        w.el.pause();
        setNow('');
        return;
      }
      requestAnimationFrame(move);
    };
    stopRef.current = () => {
      on = false;
      w.el.pause();
    };
    move();
    setNow(`Something ${path.name}…`);
    await w.el.play().catch(() => setNow(''));
    rollGolden();
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <p className="text-[#D7CCC8]">Put on headphones and close your eyes.</p>
      <button type="button" onClick={go} className="min-h-14 rounded-2xl bg-[#FFD54F] px-8 text-lg font-black text-black">
        {now ? 'Another' : 'Begin'}
      </button>
      <p className="min-h-6 text-lg font-bold" role="status">{now}</p>
    </div>
  );
}
