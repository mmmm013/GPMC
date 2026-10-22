'use client';

import { useEffect, useRef, useState } from 'react';
import { playVoice } from '@/lib/games/clearVoice';
import { WORLDS, fetchBug, fetchNug, fetchRiff, rollGolden, type World } from '@/lib/games/wonders';

/** Mystery doors: three doors, each hiding a sound from a world the player never knows in advance. */
export function MysteryDoors() {
  const [doors, setDoors] = useState<World[]>(() => deal());
  const [opened, setOpened] = useState<number | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  function deal(): World[] {
    const all = Object.keys(WORLDS) as World[];
    return [0, 1, 2].map(() => all[Math.floor(Math.random() * all.length)]);
  }
  useEffect(() => () => audio.current?.pause(), []);

  async function open(i: number) {
    setOpened(i);
    const nug = await fetchNug([...WORLDS[doors[i]].moods]);
    if (!nug) return;
    const a = audio.current ?? new Audio();
    audio.current = a;
    a.src = nug.src;
    void a.play().catch(() => {});
    rollGolden();
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="grid w-full max-w-md grid-cols-3 gap-3">
        {doors.map((w, i) => (
          <button key={i} type="button" onClick={() => open(i)} disabled={opened !== null}
            className={`flex aspect-[1/2] flex-col items-center justify-center rounded-t-full border-4 text-lg font-black transition-transform ${opened === i ? 'scale-105 border-[#FFD54F] bg-[#FFD54F] text-black' : 'border-[#8D6E63] bg-[#3E2723] text-[#FFD54F]'} disabled:cursor-default`}>
            {opened === i ? WORLDS[w].name : opened === null ? '?' : ''}
          </button>
        ))}
      </div>
      {opened !== null && (
        <button type="button" onClick={() => { audio.current?.pause(); setDoors(deal()); setOpened(null); }}
          className="min-h-12 rounded-2xl bg-[#FFD54F] px-6 font-bold text-black">New doors</button>
      )}
    </div>
  );
}

/** Strange stacks: three sounds spin up and play together, side by side, each stoppable on its own. */
export function StrangeStacks({ moods }: { moods: string[] }) {
  const [stack, setStack] = useState<{ id: string; on: boolean }[]>([]);
  const players = useRef<HTMLAudioElement[]>([]);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => () => players.current.forEach((a) => a.pause()), []);

  async function spin() {
    players.current.forEach((a) => a.pause());
    setSpinning(true);
    const odd = ['Quirky', 'Mysterious', 'Playful', 'Dark', 'Dreamy', 'Driving'];
    const picks: string[] = [];
    const nugs = [];
    for (let i = 0; i < 3; i++) {
      const pool = [odd[Math.floor(Math.random() * odd.length)], ...moods.slice(0, 1)];
      const n = await fetchNug(pool, picks);
      if (n) {
        picks.push(n.id);
        nugs.push(n);
      }
    }
    players.current = nugs.map((n) => {
      const a = new Audio(n.src);
      a.loop = true;
      a.volume = 0.7;
      return a;
    });
    setStack(nugs.map((n) => ({ id: n.id, on: true })));
    setSpinning(false);
    players.current.forEach((a, i) => setTimeout(() => void a.play().catch(() => {}), i * 400 + Math.random() * 300));
    rollGolden();
  }
  function toggle(i: number) {
    const a = players.current[i];
    if (!a) return;
    if (a.paused) void a.play().catch(() => {});
    else a.pause();
    setStack((s) => s.map((x, j) => (j === i ? { ...x, on: !a.paused } : x)));
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-3">
        {[0, 1, 2].map((i) => (
          <button key={i} type="button" onClick={() => toggle(i)} disabled={!stack[i]}
            className={`h-24 w-20 rounded-2xl text-3xl font-black ${spinning ? 'animate-bounce bg-[#AB47BC]' : stack[i]?.on ? 'bg-[#29B6F6] text-black' : 'bg-white/10 text-white/60'}`}
            style={{ animationDelay: `${i * 120}ms` }}>
            {spinning ? '?' : stack[i] ? (stack[i].on ? '♪' : '·') : '–'}
          </button>
        ))}
      </div>
      <button type="button" onClick={spin} disabled={spinning} className="min-h-12 rounded-2xl bg-[#FFD54F] px-6 font-bold text-black">Spin</button>
      <p className="text-sm text-[#D7CCC8]">Tap any of the three to stop or start it on its own.</p>
    </div>
  );
}

/** Dream mode: one tap starts an endless, never-repeating chain of words, sounds and riffs. */
export function DreamMode({ moods }: { moods: string[] }) {
  const [on, setOn] = useState(false);
  const [now, setNow] = useState('');
  const run = useRef(0);
  const audio = useRef<HTMLAudioElement | null>(null);
  const heard = useRef<string[]>([]);

  useEffect(() => () => { run.current++; audio.current?.pause(); }, []);

  async function next(mine: number, step: number) {
    if (mine !== run.current) return;
    const kind = ['nug', 'bug', 'nug', 'riff'][step % 4];
    let src = '';
    let label = '';
    if (kind === 'bug') {
      const b = await fetchBug();
      if (b && !heard.current.includes(`${b.words}|${b.song}`)) {
        heard.current.push(`${b.words}|${b.song}`);
        src = b.src;
        label = `“${b.words}”`;
      }
    } else if (kind === 'riff') {
      const r = await fetchRiff(heard.current);
      if (r) {
        heard.current.push(r.key);
        src = r.src;
        label = r.name;
      }
    } else {
      const n = await fetchNug(moods, heard.current);
      if (n) {
        heard.current.push(n.id);
        src = n.src;
        label = 'a special sound';
      }
    }
    if (mine !== run.current) return;
    if (!src) return void setTimeout(() => next(mine, step + 1), 300);
    const a = audio.current ?? new Audio();
    audio.current = a;
    a.onended = () => setTimeout(() => next(mine, step + 1), 250 + Math.random() * 900);
    setNow(label);
    if (kind === 'bug') {
      /* A word is always heard slow, loud and whole (lib/games/clearVoice). */
      void playVoice(a, src).catch(() => setOn(false));
    } else {
      a.defaultPlaybackRate = 1;
      a.src = src;
      a.playbackRate = 1;
      void a.play().catch(() => setOn(false));
    }
    if (step % 8 === 7) rollGolden();
  }

  function toggle() {
    run.current++;
    if (on) {
      audio.current?.pause();
      setOn(false);
      setNow('');
    } else {
      setOn(true);
      void next(run.current, 0);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <button type="button" onClick={toggle}
        className={`h-40 w-40 rounded-full text-xl font-black ${on ? 'animate-pulse bg-gradient-to-br from-[#AB47BC] to-[#29B6F6] text-white' : 'bg-[#FFD54F] text-black'}`}>
        {on ? 'Wake up' : 'Fall in'}
      </button>
      <p className="min-h-6 italic text-[#D7CCC8]" role="status">{now}</p>
    </div>
  );
}
