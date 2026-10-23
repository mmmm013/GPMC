'use client';

import { useRef, useState } from 'react';
import DownloadReturn from './DownloadReturn';

type Track = { id: string; artist: string; title: string; src: string; video?: string; buyDownloadUrl?: string };

/* The Download button is a form, not a link. Only a POST opens a $1.99 checkout
   at k-kut.com; link scanners and prefetchers that follow every link were opening
   unpaid checkouts (2026-10-21: 50 in 76 minutes), and none of them submit forms. */
function buyForm(url?: string): { action: string; song: string; returnTo: string } | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const song = u.searchParams.get('song');
    return song ? { action: `${u.origin}${u.pathname}`, song, returnTo: u.searchParams.get('return') ?? '' } : null;
  } catch {
    return null;
  }
}

/* One player for every G Putnam Music song. Every row shows artist and title
   (GD, 2026-10-11: "STREAMS SHOW ... ARTIST & TITLE, MINIMUM"). Stream only.
   A song that has its own visual plays it, like any music video (GD, 2026-10-23:
   "play videos as typical, when each respective song plays"); a song without one
   plays as before. ONE media element for both, so the next song can start on its
   own on a phone, which only lets an element the listener already tapped keep
   playing. */
export default function SongPlayer({ tracks }: { tracks: Track[] }) {
  const audio = useRef<HTMLVideoElement>(null);
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
    a.src = t.video ?? t.src;
    void a.play();
  }

  function next() {
    if (!current) return;
    const i = shown.findIndex((t) => t.id === current.id);
    if (i >= 0 && i + 1 < shown.length) play(shown[i + 1]);
  }

  return (
    <div>
      <DownloadReturn />
      <div className="sticky top-0 z-20 rounded-2xl border border-[#C8A882]/50 bg-[#2A1506] p-4 text-[#F5E6D3] shadow-lg">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFD54F]">Now playing</p>
        <p className="mt-1 text-lg font-black">
          {current ? `${current.artist} · ${current.title}` : 'Tap any song to play'}
        </p>
        <video
          ref={audio}
          controls
          controlsList="nodownload"
          disablePictureInPicture
          playsInline
          preload="none"
          className={current?.video ? 'mt-3 aspect-video w-full rounded-xl bg-black' : 'mt-3 h-14 w-full'}
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
          const buy = buyForm(t.buyDownloadUrl);
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
              {buy ? (
                <form method="post" action={buy.action} className="shrink-0">
                  <input type="hidden" name="song" value={buy.song} />
                  <input type="hidden" name="return" value={buy.returnTo} />
                  <button
                    type="submit"
                    className="rounded-full border border-[#8B4513]/40 px-3 py-2 text-xs font-black text-[#8B4513] hover:bg-[#8B4513] hover:text-white"
                    aria-label={`Download ${t.artist} – ${t.title} for $1.99`}
                  >
                    Download · $1.99
                  </button>
                </form>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
