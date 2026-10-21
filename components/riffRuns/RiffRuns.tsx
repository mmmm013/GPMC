'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { isRunOn, nextRun, riffOff, runOrder, weekOf, type Riff } from '@/lib/riffRuns/schedule';

type Board = { week: string; song: string; key: string; votes: number }[];

const VOTER_KEY = 'gpm-riff-voter';
const voterId = () => {
  try {
    let id = localStorage.getItem(VOTER_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VOTER_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
};

async function riffUrl(key: string) {
  const res = await fetch(`/api/riff-runs/audio?key=${encodeURIComponent(key)}`);
  if (!res.ok) throw new Error('unavailable');
  return (await res.json()).url as string;
}

const fmtDay = (d: Date) => d.toLocaleString(undefined, { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export default function RiffRuns() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [runIndex, setRunIndex] = useState<number | null>(null);
  const [problem, setProblem] = useState('');

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const week = now ? weekOf(now) : null;
  const order = useMemo(() => (week ? runOrder(week) : []), [week]);
  const live = now ? isRunOn(now) : false;

  async function play(riff: Riff, onEnd?: () => void) {
    setProblem('');
    const el = audio.current;
    if (!el) return;
    try {
      el.src = await riffUrl(riff.key);
      el.onended = () => {
        setPlaying(null);
        onEnd?.();
      };
      await el.play();
      setPlaying(riff.key);
    } catch {
      setPlaying(null);
      setProblem('That riff would not play. Try again in a moment.');
    }
  }

  function stop() {
    audio.current?.pause();
    setPlaying(null);
    setRunIndex(null);
  }

  function runFrom(i: number) {
    if (i >= order.length) return stop();
    setRunIndex(i);
    void play(order[i], () => runFrom(i + 1));
  }

  if (!now || !week) return <div className="mt-8 h-40" />;

  return (
    <div className="mt-8 grid gap-6">
      <audio ref={audio} preload="none" controlsList="nodownload noplaybackrate" onContextMenu={(e) => e.preventDefault()} />

      <section className="rounded-2xl border border-white/15 bg-black/30 p-5">
        {live ? (
          <>
            <p className="text-2xl font-black">The riff run is on</p>
            <p className="mt-2 text-[#D7CCC8]">{order.length} riffs from G Putnam Music instrumentals, each at its own length, until noon your time.</p>
            {runIndex === null ? (
              <button onClick={() => runFrom(0)} className="mt-4 rounded-full bg-[#FFD54F] px-6 py-3 text-lg font-black text-[#1a1207]">▶ Start the run</button>
            ) : (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <p className="text-lg">Now: riff from <b>{order[runIndex].song}</b></p>
                <button onClick={() => runFrom(runIndex + 1)} className="rounded-full border border-white/30 px-4 py-2">Next riff</button>
                <button onClick={stop} className="rounded-full border border-white/30 px-4 py-2">Stop</button>
              </div>
            )}
          </>
        ) : (
          <>
            <p className="text-2xl font-black">Next riff run</p>
            <p className="mt-2 text-lg text-[#FFD54F]">{fmtDay(nextRun(now))}</p>
            <p className="mt-2 text-[#D7CCC8]">Every Sunday from 9:00 AM to noon, wherever you are. Vote in this week&apos;s Riff-OFF any time.</p>
          </>
        )}
      </section>

      <RiffOff week={week} playing={playing} play={(r) => { setRunIndex(null); void play(r); }} stop={stop} />
      <Nameboard />
      {problem && <p className="text-[#FFAB91]">{problem}</p>}
    </div>
  );
}

function RiffOff({ week, playing, play, stop }: { week: string; playing: string | null; play: (r: Riff) => void; stop: () => void }) {
  const pair = useMemo(() => riffOff(week), [week]);
  const [pick, setPick] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    try {
      setPick(localStorage.getItem(`gpm-riff-off:${week}`));
    } catch {}
  }, [week]);

  useEffect(() => {
    if (!pick) return;
    fetch(`/api/riff-runs/vote?week=${week}`).then((r) => (r.ok ? r.json() : null)).then((d) => d && setCounts(d.counts)).catch(() => {});
  }, [pick, week]);

  async function vote(key: string) {
    setStatus('Saving your vote…');
    const res = await fetch('/api/riff-runs/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ week, riff: key, voter: voterId(), email: email.trim() || null }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok) return setStatus(data.error ?? 'Your vote did not save. Try again.');
    setPick(key);
    if (data.counts) setCounts(data.counts);
    try {
      localStorage.setItem(`gpm-riff-off:${week}`, key);
    } catch {}
    setStatus(email.trim() ? "Vote saved, and you're in this week's draw for a free BUG to send." : 'Vote saved.');
  }

  const total = counts ? pair.reduce((n, r) => n + (counts[r.key] ?? 0), 0) : 0;

  return (
    <section className="rounded-2xl border border-[#FFD54F]/40 bg-black/30 p-5">
      <p className="text-2xl font-black">Riff-OFF</p>
      <p className="mt-2 text-[#D7CCC8]">Two riffs, one winner. Listen to both, then vote. The winner becomes Riff of the Week, and every voter who leaves an email is in the draw for a free BUG to send.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {pair.map((r, i) => (
          <div key={r.key} className={`rounded-xl border p-4 ${pick === r.key ? 'border-[#FFD54F]' : 'border-white/15'}`}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFD54F]">Riff {i ? 'B' : 'A'}</p>
            <p className="mt-1 text-lg font-black">from {r.song}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => (playing === r.key ? stop() : play(r))} className="rounded-full border border-white/30 px-4 py-2">{playing === r.key ? '■ Stop' : '▶ Listen'}</button>
              <button onClick={() => vote(r.key)} className="rounded-full bg-[#FFD54F] px-4 py-2 font-black text-[#1a1207]">{pick === r.key ? 'Your vote ✓' : 'Vote'}</button>
            </div>
            {counts && total > 0 && <p className="mt-2 text-sm text-[#D7CCC8]">{Math.round(((counts[r.key] ?? 0) / total) * 100)}% of {total} votes</p>}
          </div>
        ))}
      </div>
      <label htmlFor="riff-off-email" className="mt-4 block text-sm text-[#D7CCC8]">Email for the draw (optional)</label>
      <input id="riff-off-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1 w-full max-w-sm rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white" />
      {status && <p className="mt-3 text-sm text-[#FFD54F]">{status}</p>}
    </section>
  );
}

function Nameboard() {
  const [board, setBoard] = useState<Board | null>(null);
  useEffect(() => {
    fetch('/api/riff-runs/nameboard').then((r) => (r.ok ? r.json() : null)).then((d) => setBoard(d?.board ?? [])).catch(() => setBoard([]));
  }, []);
  return (
    <section className="rounded-2xl border border-white/15 bg-black/30 p-5">
      <p className="text-2xl font-black">Riffs of the Week</p>
      {!board ? (
        <p className="mt-2 text-[#D7CCC8]">Loading the nameboard…</p>
      ) : board.length === 0 ? (
        <p className="mt-2 text-[#D7CCC8]">The first Riff of the Week goes up here when this week&apos;s Riff-OFF closes.</p>
      ) : (
        <ol className="mt-3 grid gap-2">
          {board.map((w) => (
            <li key={w.week} className="flex justify-between gap-3 border-t border-white/10 pt-2">
              <span>Week of {new Date(`${w.week}T12:00:00`).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}: riff from <b>{w.song}</b></span>
              <span className="text-[#D7CCC8]">{w.votes} votes</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
