'use client';

import { useEffect, useRef, useState } from 'react';
import { buzz, fetchNug, fetchRiff, rollGolden, watchHits, wired } from '@/lib/games/wonders';

/** Plays one riff (or a NUG if no riff comes), wired so a game can feel or draw it. */
function useStage() {
  const [playing, setPlaying] = useState(false);
  const [label, setLabel] = useState('');
  const live = useRef<{ el: HTMLAudioElement; analyser: AnalyserNode } | null>(null);
  const heard = useRef<string[]>([]);

  useEffect(() => () => live.current?.el.pause(), []);

  async function start(moods: string[]) {
    live.current?.el.pause();
    const riff = await fetchRiff(heard.current);
    const nug = riff ? null : await fetchNug(moods, heard.current);
    const src = riff?.src ?? nug?.src;
    if (!src) return null;
    heard.current.push(riff?.key ?? nug!.id);
    const w = wired(src);
    w.el.onended = () => setPlaying(false);
    live.current = w;
    setLabel(riff ? `a riff from ${riff.song}` : 'a special sound');
    setPlaying(true);
    await w.el.play().catch(() => setPlaying(false));
    rollGolden();
    return w;
  }
  function stop() {
    live.current?.el.pause();
    setPlaying(false);
  }
  return { start, stop, playing, label, live };
}

/** Feel the beat: the phone pulses in the hand on every hit. */
export function FeelTheBeat({ moods }: { moods: string[] }) {
  const stage = useStage();
  const [pulse, setPulse] = useState(0);
  const on = useRef(false);

  async function go() {
    const w = await stage.start(moods);
    if (!w) return;
    on.current = true;
    watchHits(w.analyser, (s) => {
      buzz(Math.round(20 + s * 40));
      setPulse((p) => p + 1);
    }, () => on.current && !w.el.paused);
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <button type="button" onClick={stage.playing ? () => { on.current = false; stage.stop(); } : go}
        className="relative h-40 w-40 rounded-full bg-[#FFD54F] text-xl font-black text-black">
        <span key={pulse} className="absolute inset-0 animate-ping rounded-full bg-[#FFD54F]/60" />
        <span className="relative">{stage.playing ? 'Stop' : 'Hold the phone. Tap.'}</span>
      </button>
      <p className="text-sm text-[#D7CCC8]">{stage.playing ? `Feeling ${stage.label}.` : 'On a phone, you feel each hit in your hand. On a computer, the circle pulses.'}</p>
    </div>
  );
}

/** Music you can see: shapes bloom and burst on each note, drawn live from the sound. */
export function MusicYouCanSee({ moods }: { moods: string[] }) {
  const stage = useStage();
  const canvas = useRef<HTMLCanvasElement>(null);

  async function go() {
    const w = await stage.start(moods);
    const c = canvas.current;
    if (!w || !c) return;
    const g = c.getContext('2d')!;
    const freq = new Uint8Array(w.analyser.frequencyBinCount);
    const blooms: { x: number; y: number; r: number; hue: number; life: number }[] = [];
    const seed = Math.random() * 360;
    watchHits(w.analyser, (s) => {
      blooms.push({ x: Math.random() * c.width, y: Math.random() * c.height, r: 10 + s * 60, hue: (seed + Math.random() * 120) % 360, life: 1 });
    }, () => !w.el.paused);
    const draw = () => {
      if (w.el.paused) return;
      w.analyser.getByteFrequencyData(freq);
      g.fillStyle = 'rgba(0,0,0,0.12)';
      g.fillRect(0, 0, c.width, c.height);
      const bars = 48;
      for (let i = 0; i < bars; i++) {
        const v = freq[Math.floor((i / bars) * freq.length * 0.6)] / 255;
        const a = (i / bars) * Math.PI * 2;
        const r = 40 + v * 110;
        g.strokeStyle = `hsla(${(seed + i * 7) % 360},90%,60%,${0.3 + v * 0.7})`;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(c.width / 2 + Math.cos(a) * 40, c.height / 2 + Math.sin(a) * 40);
        g.lineTo(c.width / 2 + Math.cos(a) * r, c.height / 2 + Math.sin(a) * r);
        g.stroke();
      }
      for (const b of blooms) {
        g.fillStyle = `hsla(${b.hue},95%,60%,${b.life * 0.6})`;
        g.beginPath();
        g.arc(b.x, b.y, b.r * (2 - b.life), 0, Math.PI * 2);
        g.fill();
        b.life -= 0.03;
      }
      while (blooms.length && blooms[0].life <= 0) blooms.shift();
      requestAnimationFrame(draw);
    };
    draw();
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvas} width={360} height={360} className="aspect-square w-full max-w-sm rounded-2xl bg-black" />
      <button type="button" onClick={stage.playing ? stage.stop : go} className="min-h-12 rounded-2xl bg-[#FFD54F] px-6 font-bold text-black">
        {stage.playing ? 'Stop' : 'Play and watch'}
      </button>
      {stage.playing && <p className="text-sm text-[#D7CCC8]">Watching {stage.label}. No two plays look the same.</p>}
    </div>
  );
}
