'use client';

import { useRef, useState } from 'react';

type Track = { id: string; artist: string; title: string; src: string };
export type SadList = { name: string; tracks: Track[] };

/* The six SAD playlists, played the way /listen plays (components/listen/SongPlayer):
   one player, artist and title on every row, stream only, nothing to download.
   A song plays through to the next song in its own list, and stops at the list's end. */
export default function SadPlayer({ lists }: { lists: SadList[] }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [current, setCurrent] = useState<{ list: number; track: number } | null>(null);
  const [playing, setPlaying] = useState(false);

  const now = current ? lists[current.list].tracks[current.track] : null;

  function play(list: number, track: number) {
    const a = audio.current;
    if (!a) return;
    if (current?.list === list && current.track === track) {
      if (a.paused) void a.play();
      else a.pause();
      return;
    }
    setCurrent({ list, track });
    a.src = lists[list].tracks[track].src;
    void a.play();
  }

  function next() {
    if (!current) return;
    if (current.track + 1 < lists[current.list].tracks.length) play(current.list, current.track + 1);
  }

  return (
    <div>
      <div className="sticky top-0 z-20 rounded-2xl border border-[#C8A882]/50 bg-[#2A1506] p-4 text-[#F5E6D3] shadow-lg">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFD54F]">
          {current ? `Now playing · ${lists[current.list].name}` : 'Now playing'}
        </p>
        <p className="mt-1 text-lg font-black">{now ? `${now.artist} · ${now.title}` : 'Tap any song to play'}</p>
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

      {lists.map((list, li) => (
        <section key={list.name} className="mt-8">
          <h2 className="text-2xl font-black uppercase tracking-tight text-[#8B4513]">{list.name}</h2>
          <ul className="mt-3 divide-y divide-[#8B4513]/15 rounded-2xl border border-[#8B4513]/20 bg-white">
            {list.tracks.map((t, ti) => {
              const on = current?.list === li && current.track === ti;
              return (
                <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => play(li, ti)}
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
        </section>
      ))}
    </div>
  );
}
