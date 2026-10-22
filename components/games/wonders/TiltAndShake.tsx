'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchNug, rollGolden } from '@/lib/games/wonders';

/* Tilt and shake: tilt the phone to steer a light through a fantasy world and
   catch the glowing stars; each star sounds. Shake to make a sound burst out.
   On a computer, the arrow keys or the mouse steer. */
const FANTASY = ['Dreamy', 'Atmospheric', 'Playful', 'Quirky', 'Light'];
const W = 360;
const H = 480;

export default function TiltAndShake({ moods }: { moods: string[] }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [started, setStarted] = useState(false);
  const [caught, setCaught] = useState(0);
  const tilt = useRef({ x: 0, y: 0 });
  const audio = useRef<HTMLAudioElement | null>(null);
  const heard = useRef<string[]>([]);

  async function sound() {
    const nug = await fetchNug([...FANTASY, ...moods], heard.current);
    if (!nug) return;
    heard.current.push(nug.id);
    const a = audio.current ?? new Audio();
    audio.current = a;
    a.src = nug.src;
    void a.play().catch(() => {});
    rollGolden();
  }

  async function start() {
    /* iPhones ask the player before a page may read the tilt. */
    const D = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof D?.requestPermission === 'function') {
      try {
        await D.requestPermission();
      } catch {
        /* steering by touch still works */
      }
    }
    setStarted(true);
  }

  useEffect(() => {
    if (!started) return;
    const c = canvas.current!;
    const g = c.getContext('2d')!;
    const me = { x: W / 2, y: H / 2 };
    const stars = Array.from({ length: 5 }, () => ({ x: 30 + Math.random() * (W - 60), y: 30 + Math.random() * (H - 60), p: Math.random() * 6 }));
    let shakeAt = 0;
    let on = true;

    const orient = (e: DeviceOrientationEvent) => {
      tilt.current = { x: (e.gamma ?? 0) / 30, y: ((e.beta ?? 0) - 30) / 30 };
    };
    const motion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      const force = Math.hypot(a?.x ?? 0, a?.y ?? 0, a?.z ?? 0);
      if (force > 25 && performance.now() - shakeAt > 1200) {
        shakeAt = performance.now();
        void sound();
      }
    };
    const keys = (e: KeyboardEvent) => {
      const k: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      if (k[e.key]) tilt.current = { x: k[e.key][0], y: k[e.key][1] };
      if (e.key === ' ') void sound();
    };
    const point = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * W;
      const y = ((e.clientY - r.top) / r.height) * H;
      tilt.current = { x: Math.max(-1, Math.min(1, (x - me.x) / 60)), y: Math.max(-1, Math.min(1, (y - me.y) / 60)) };
    };
    window.addEventListener('deviceorientation', orient);
    window.addEventListener('devicemotion', motion);
    window.addEventListener('keydown', keys);
    c.addEventListener('pointermove', point);

    const draw = () => {
      if (!on) return;
      me.x = Math.max(12, Math.min(W - 12, me.x + tilt.current.x * 4));
      me.y = Math.max(12, Math.min(H - 12, me.y + tilt.current.y * 4));
      const grad = g.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#1b0f3a');
      grad.addColorStop(1, '#0b2a2a');
      g.fillStyle = grad;
      g.fillRect(0, 0, W, H);
      for (const s of stars) {
        s.p += 0.05;
        g.fillStyle = `hsla(${(s.p * 40) % 360},95%,70%,${0.6 + Math.sin(s.p) * 0.4})`;
        g.beginPath();
        g.arc(s.x, s.y, 9 + Math.sin(s.p) * 3, 0, Math.PI * 2);
        g.fill();
        if (Math.hypot(s.x - me.x, s.y - me.y) < 22) {
          s.x = 30 + Math.random() * (W - 60);
          s.y = 30 + Math.random() * (H - 60);
          setCaught((n) => n + 1);
          void sound();
        }
      }
      g.fillStyle = '#FFD54F';
      g.shadowColor = '#FFD54F';
      g.shadowBlur = 20;
      g.beginPath();
      g.arc(me.x, me.y, 10, 0, Math.PI * 2);
      g.fill();
      g.shadowBlur = 0;
      requestAnimationFrame(draw);
    };
    draw();
    return () => {
      on = false;
      audio.current?.pause();
      window.removeEventListener('deviceorientation', orient);
      window.removeEventListener('devicemotion', motion);
      window.removeEventListener('keydown', keys);
      c.removeEventListener('pointermove', point);
    };
  }, [started]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      {started ? (
        <>
          <canvas ref={canvas} width={W} height={H} className="w-full max-w-sm touch-none rounded-2xl" />
          <p className="text-sm text-[#D7CCC8]">Stars caught: {caught}. Shake the phone (or press space) for a burst of sound.</p>
        </>
      ) : (
        <button type="button" onClick={start} className="min-h-14 rounded-2xl bg-[#FFD54F] px-8 text-lg font-black text-black">Enter the world</button>
      )}
    </div>
  );
}
