'use client';

import { useEffect, useRef, useState } from 'react';

/* The county-fair shooting gallery both rounds share. Targets slide or bob in
   lanes; the player taps where to aim, an arrow flies from the bear at the
   bottom, and it hits whatever target is under that point when it lands. */
export type Target = { id: number; label: string };
type Live = Target & { lane: number; x: number; speed: number; phase: number; tickled: number };
type Arrow = { id: number; x: number; y: number; flying: boolean };

const LANES = [16, 38, 60];

export default function Gallery({
  labels,
  style,
  flightMs,
  disabled,
  onShoot,
  onLand,
}: {
  labels: string[];
  style: 'phrase' | 'heart';
  flightMs: number;
  disabled: boolean;
  onShoot: () => void;
  onLand: (hit: Target | null) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const els = useRef(new Map<number, HTMLDivElement>());
  const live = useRef<Live[]>([]);
  const next = useRef(0);
  const [, setFrame] = useState(0);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  /* Each lane keeps one speed and direction, so its two targets never overlap. */
  const laneSpeed = useRef(LANES.map((_, i) => (i % 2 ? -1 : 1) * (9 + Math.random() * 9)));
  const pick = () => labels[Math.floor(Math.random() * labels.length)];

  function spawn(lane: number): Live {
    const speed = laneSpeed.current[lane];
    const label = style === 'heart' ? '' : pick();
    return { id: next.current++, label, lane, x: speed > 0 ? -20 : 110, speed, phase: Math.random() * 6, tickled: 0 };
  }

  useEffect(() => {
    live.current = [0, 1, 2, 0, 1, 2].map((lane, i) => ({ ...spawn(lane), x: i < 3 ? 5 + lane * 10 : 60 + lane * 10 }));
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      live.current = live.current.map((t) => {
        if (t.tickled) return t;
        const x = t.x + t.speed * dt;
        return x > 115 || x < -25 ? spawn(t.lane) : { ...t, x, phase: t.phase + dt * 3 };
      });
      setFrame((f) => f + 1);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function shoot(e: React.PointerEvent<HTMLDivElement>) {
    if (disabled || !box.current) return;
    const r = box.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    if (y > 82) return;
    const id = next.current++;
    onShoot();
    setArrows((a) => [...a, { id, x, y, flying: false }]);
    requestAnimationFrame(() => requestAnimationFrame(() => setArrows((a) => a.map((v) => (v.id === id ? { ...v, flying: true } : v)))));
    setTimeout(() => {
      const px = r.left + (x / 100) * r.width;
      const py = r.top + (y / 100) * r.height;
      const hit = live.current.find((t) => {
        const el = els.current.get(t.id);
        if (!el || t.tickled) return false;
        const b = el.getBoundingClientRect();
        return px >= b.left - 10 && px <= b.right + 10 && py >= b.top - 10 && py <= b.bottom + 10;
      });
      setArrows((a) => a.filter((v) => v.id !== id));
      if (hit) {
        live.current = live.current.map((t) => (t.id === hit.id ? { ...t, tickled: Date.now() } : t));
        setTimeout(() => {
          live.current = live.current.map((t) => (t.id === hit.id ? spawn(t.lane) : t));
        }, 800);
      }
      onLand(hit ? { id: hit.id, label: hit.label } : null);
    }, flightMs);
  }

  return (
    <div ref={box} onPointerDown={shoot} role="application" aria-label="Tap where to aim"
      className={`relative h-[22rem] w-full touch-none select-none overflow-hidden rounded-3xl border-4 ${style === 'heart' ? 'border-[#1E63D6] bg-gradient-to-b from-[#0B1A3A] to-[#2A0E12]' : 'border-[#FFD54F] bg-[repeating-linear-gradient(90deg,#7B1F2B_0_40px,#F5E6C8_40px_80px)]'} ${disabled ? 'cursor-wait' : 'cursor-crosshair'}`}>
      {style === 'phrase' && LANES.map((y) => (
        <div key={y} className="absolute left-0 right-0 h-1 bg-[#5D4037]/70" style={{ top: `calc(${y}% + 2.4rem)` }} />
      ))}
      {live.current.map((t) => {
        const bob = style === 'heart' ? Math.sin(t.phase) * 6 : 0;
        return (
          <div key={t.id} ref={(el) => { if (el) els.current.set(t.id, el); else els.current.delete(t.id); }}
            className={`absolute -translate-x-1/2 ${t.tickled ? 'animate-bounce' : ''}`}
            style={{ left: `${t.x}%`, top: `${LANES[t.lane] + bob}%` }}>
            {style === 'phrase' ? (
              <span className={`block whitespace-nowrap rounded-xl border-2 border-[#5D4037] px-3 py-2 text-sm font-black shadow ${t.tickled ? 'bg-[#F8BBD0] text-[#AD1457]' : 'bg-white text-[#7B1F2B]'}`}>
                {t.tickled ? 'Hee hee!' : t.label}
              </span>
            ) : (
              <svg viewBox="0 0 32 30" width="56" height="52" aria-hidden="true">
                <path d="M16 29 C6 21 0 15 0 8.5 C0 3.5 4 0 8.5 0 C12 0 14.5 2 16 4.5 C17.5 2 20 0 23.5 0 C28 0 32 3.5 32 8.5 C32 15 26 21 16 29Z"
                  fill={t.tickled ? '#FFD54F' : '#1E63D6'} stroke="#BBDEFB" strokeWidth="1.5" />
              </svg>
            )}
          </div>
        );
      })}
      {arrows.map((a) => (
        <div key={a.id} className="pointer-events-none absolute"
          style={{
            left: a.flying ? `${a.x}%` : '50%',
            top: a.flying ? `${a.y}%` : '92%',
            transition: `left ${flightMs}ms ease-out, top ${flightMs}ms ease-out`,
          }}>
          {style === 'heart' ? (
            <span className="block h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#FFEB3B_0%,#FF6E40_45%,#D50000_75%,transparent_76%)] shadow-[0_0_24px_8px_rgba(255,61,0,0.6)]" />
          ) : (
            <span className="block -translate-x-1/2 -translate-y-1/2 text-2xl">➶</span>
          )}
        </div>
      ))}
    </div>
  );
}
