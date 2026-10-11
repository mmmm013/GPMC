'use client';

import { useRef, useState } from 'react';

type Track = { id: string; artist: string; title: string; src: string };

/* One player for every G Putnam Music song. Every row shows artist and title
   (GD, 2026-10-11: "STREAMS SHOW ... ARTIST & TITLE, MINIMUM"). Stream only. */
export default function SongPlayer({ tracks }: { tracks: Track[] }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [current, setCurrent] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [q, setQ] = useState('');

  const shown = q.trim()
    ? tracks.filter((t) => `${t.artist} ${t.title}`.toLowerCase().includes(q.trim().toLowerCase()))
    : tracks;

  function play(t: Track) {
    const a = audio.current;
    if (!a) return;
    if (current?.id === t.id) {
      if (a.paused) void a.play();
      else a.pause();
      return;
    }
    setCurrent(t);
    a.src = t.src;
    void a.play();
  }

  function next() {
    if (!current) return;
    const i = shown.findIndex((t) => t.id === current.id);
    if (i >= 0 && i + 1 < shown.length) play(shown[i + 1]);
  }

  return (
    <div>
      <div className="sticky top-0 z-20 rounded-2xl border border-[#C8A882]/50 bg-[#2A1506] p-4 text-[#F5E6D3] shadow-lg">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFD54F]">Now playing</p>
        <p className="mt-1 text-lg font-black">
          {current ? `${current.artist} · ${current.title}` : 'Tap any song to play'}
        </p>
        <audio
          ref={audio}
          controls
          controlsList="nodownload"
          preload="none"
          className="mt-3 w-full"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={next}
        />
      </div>

      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Find a song or singer"
        aria-label="Find a song or singer"
        className="mt-5 w-full rounded-full border border-[#8B4513]/30 bg-white px-5 py-3 text-base text-[#2C2418]"
      />

      <ul className="mt-4 divide-y divide-[#8B4513]/15 rounded-2xl border border-[#8B4513]/20 bg-white">
        {shown.map((t) => {
          const on = current?.id === t.id;
          return (
            <li key={t.id} className="flex items-center gap-3 px-4 py-3">
              <button
                type="button"
                onClick={() => play(t)}
                aria-label={`${on && playing ? 'Pause' : 'Play'} ${t.artist} – ${t.title}`}
                className={`h-12 w-12 shrink-0 rounded-full text-lg font-black ${on ? 'bg-[#8B4513] text-white' : 'bg-[#FFD54F] text-[#2A1506]'}`}
              >
                {on && playing ? '❚❚' : '▶'}
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-black text-[#2C2418]">{t.title}</p>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8B4513]">{t.artist}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
