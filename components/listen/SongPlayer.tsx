'use client';

import { useMemo, useRef, useState } from 'react';
import DownloadReturn from './DownloadReturn';
import { withDisplayTitle } from '@/lib/displayTitle';

export type Track = {
  id: string;
  artist: string;
  title: string;
  src: string;
  buyDownloadUrl?: string;
  /* Which playlists this song fits, read from its own catalogue tags at k-kut.com
     (config/gpm-playlist-fit.v1.json there). A song fits only where its tags say. */
  playlists?: string[];
  /* Whose song it is. Everything that streams today is 'gpm'. */
  silo?: string;
};
export type Playlist = { key: string; label: string; enabled: boolean };

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

/* GD, 2026-11-27: "The listener can, we have it up to 8 hours." */
const LENGTHS = [
  { label: '30 minutes', sec: 30 * 60 },
  { label: '1 hour', sec: 60 * 60 },
  { label: '2 hours', sec: 2 * 60 * 60 },
  { label: '4 hours', sec: 4 * 60 * 60 },
  { label: '8 hours', sec: 8 * 60 * 60 },
];
const DEFAULT_LENGTH = 1;

/* GD, 2026-11-27: GPM first; another artist's song "sparingly" = 1 in 10. */
const OTHER_EVERY = 10;

function shuffled<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* One pass through a playlist: GPM songs in a fresh order, with at most one song
   from outside GPM in every ten places. */
function onePass(songs: Track[], avoidFirst?: string): Track[] {
  const gpm = shuffled(songs.filter((t) => (t.silo ?? 'gpm') === 'gpm'));
  const other = shuffled(songs.filter((t) => (t.silo ?? 'gpm') !== 'gpm'));
  if (gpm.length > 1 && gpm[0].id === avoidFirst) gpm.push(gpm.shift() as Track);
  const out: Track[] = [];
  while (gpm.length) {
    out.push(gpm.shift() as Track);
    if (out.length % OTHER_EVERY === OTHER_EVERY - 1 && other.length) out.push(other.shift() as Track);
  }
  return out;
}

/* One player for every G Putnam Music song. Every row shows artist and title
   (GD, 2026-10-11: "STREAMS SHOW ... ARTIST & TITLE, MINIMUM"). Stream only. */
/* `onRequest`: holiday songs outside their holiday. They play in no list, and a
   listener who searches for one by name finds it (GD, 2026-10-26: "can be found
   UPON REQUEST"). */
/* Playlists (GD, 2026-11-27: "yes to all, go live, build the first step"): pick one
   and only the songs that fit it play, looping until the chosen time is up. Each
   song plays whole; the stream ends after the song playing when the time runs out. */
export default function SongPlayer({
  tracks: initialTracks,
  onRequest = [],
  playlists = [],
}: {
  tracks: Track[];
  onRequest?: Track[];
  playlists?: Playlist[];
}) {
  const audio = useRef<HTMLAudioElement>(null);
  const [tracks, setTracks] = useState(initialTracks);
  const [current, setCurrent] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [q, setQ] = useState('');

  const [listKey, setListKey] = useState<string | null>(null);
  const [lengthIx, setLengthIx] = useState(DEFAULT_LENGTH);
  const [showMore, setShowMore] = useState(false);
  const [done, setDone] = useState(false);
  const queue = useRef<Track[]>([]);
  const listened = useRef(0);
  const lastTime = useRef(0);
  const retried = useRef<string | null>(null);

  /* Only playlists that are switched on and have a song that fits right now. */
  const buttons = useMemo(
    () => playlists.filter((p) => p.enabled && tracks.some((t) => t.playlists?.includes(p.key))),
    [playlists, tracks],
  );
  const active = buttons.find((p) => p.key === listKey) ?? null;
  const inList = (t: Track) => !active || (t.playlists ?? []).includes(active.key);

  const shown = q.trim()
    ? [...tracks, ...onRequest].filter((t) => `${t.artist} ${t.title}`.toLowerCase().includes(q.trim().toLowerCase()))
    : tracks.filter(inList);

  function start(t: Track) {
    const a = audio.current;
    if (!a) return;
    setCurrent(t);
    lastTime.current = 0;
    a.src = t.src;
    void a.play();
  }

  function play(t: Track) {
    const a = audio.current;
    if (!a) return;
    if (current?.id === t.id) {
      if (a.paused) void a.play();
      else a.pause();
      return;
    }
    setDone(false);
    start(t);
  }

  function pickList(key: string | null) {
    setQ('');
    setDone(false);
    setListKey(key);
    listened.current = 0;
    const p = buttons.find((b) => b.key === key);
    if (!p) {
      queue.current = [];
      return;
    }
    queue.current = onePass(tracks.filter((t) => (t.playlists ?? []).includes(p.key)));
    const first = queue.current.shift();
    if (first) start(first);
  }

  function next() {
    if (!current) return;
    if (active && !q.trim()) {
      if (listened.current >= LENGTHS[lengthIx].sec) {
        setDone(true);
        return;
      }
      if (!queue.current.length) queue.current = onePass(tracks.filter(inList), current.id);
      const t = queue.current.shift();
      if (t) start(t);
      return;
    }
    const i = shown.findIndex((t) => t.id === current.id);
    if (i >= 0 && i + 1 < shown.length) start(shown[i + 1]);
  }

  /* Count only time actually heard, so a pause never eats the listener's hour. */
  function onTime() {
    const a = audio.current;
    if (!a) return;
    const d = a.currentTime - lastTime.current;
    if (d > 0 && d < 5) listened.current += d;
    lastTime.current = a.currentTime;
  }

  /* Stream addresses expire after some hours; an 8-hour stream outlives them.
     On an error, fetch fresh addresses once and carry on with the same song. */
  async function onError() {
    if (!current || retried.current === current.id) return;
    retried.current = current.id;
    try {
      const res = await fetch('https://www.k-kut.com/api/fm', { cache: 'no-store' });
      if (!res.ok) return;
      const body = (await res.json()) as { tracks?: Track[] };
      const fresh = (body.tracks ?? []).map(withDisplayTitle);
      if (!fresh.length) return;
      setTracks(fresh);
      const byId = new Map(fresh.map((t) => [t.id, t]));
      queue.current = queue.current.map((t) => byId.get(t.id) ?? t);
      const again = byId.get(current.id);
      if (again) start(again);
    } catch {
      /* nothing more to do: the listener can tap the song again */
    }
  }

  return (
    <div>
      <DownloadReturn />
      <div className="sticky top-0 z-20 rounded-2xl border border-[#C8A882]/50 bg-[#2A1506] p-4 text-[#F5E6D3] shadow-lg">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFD54F]">
          {active ? `Now playing · ${active.label} · ${LENGTHS[lengthIx].label}` : 'Now playing'}
        </p>
        <p className="mt-1 text-lg font-black">
          {done
            ? `Your ${LENGTHS[lengthIx].label} of ${active?.label ?? 'music'} is done. Tap a playlist to play more.`
            : current
              ? `${current.artist} · ${current.title}`
              : 'Pick a playlist, or tap any song'}
        </p>
        <audio
          ref={audio}
          controls
          controlsList="nodownload"
          preload="none"
          className="mt-3 w-full"
          onPlay={() => {
            setPlaying(true);
            retried.current = null;
          }}
          onPause={() => setPlaying(false)}
          onTimeUpdate={onTime}
          onEnded={next}
          onError={() => void onError()}
        />
      </div>

      {buttons.length ? (
        <section className="mt-5" aria-label="Playlists">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5D4037]">Pick a playlist</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {buttons.map((p) => {
              const on = p.key === listKey;
              return (
                <button
                  key={p.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => pickList(on ? null : p.key)}
                  className={`rounded-full px-4 py-2 text-sm font-black ${on ? 'bg-[#8B4513] text-white' : 'border border-[#8B4513]/30 bg-white text-[#8B4513] hover:bg-[#FFD54F]'}`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-sm text-[#5D4037]">
            Plays for <span className="font-black">{LENGTHS[lengthIx].label}</span>.{' '}
            <button
              type="button"
              onClick={() => setShowMore((s) => !s)}
              aria-expanded={showMore}
              className="font-bold text-[#8B4513] underline"
            >
              {showMore ? 'Fewer choices' : 'More choices'}
            </button>
          </p>
          {showMore ? (
            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="How long to play">
              {LENGTHS.map((l, i) => (
                <button
                  key={l.label}
                  type="button"
                  role="radio"
                  aria-checked={i === lengthIx}
                  onClick={() => setLengthIx(i)}
                  className={`rounded-full px-3 py-1.5 text-xs font-black ${i === lengthIx ? 'bg-[#2A1506] text-[#FFD54F]' : 'border border-[#2A1506]/30 bg-white text-[#2A1506]'}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

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
