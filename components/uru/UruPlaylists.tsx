'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

/* URU playlists (GD, 2026-11-27). Kept on this phone only (localStorage, wrapped: a private window or blocked
   storage still plays, it just does not remember). A playlist holds song ids, never a stream address: the
   addresses are signed and expire, so they are looked up fresh from the songs this page was given. Shared by a
   link that carries the list itself (?l=), so nothing about anyone is stored by us. Stream only. */

type Track = { id: string; artist: string; title: string; src: string };
type Playlist = { id: string; name: string; ids: string[] };

const KEY = 'uru.playlists.v1';
const MAX_SONGS = 200;

function load(): Playlist[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v.filter((p) => p && typeof p.name === 'string' && Array.isArray(p.ids)) : [];
  } catch {
    return [];
  }
}
function save(lists: Playlist[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(lists));
  } catch {
    /* storage blocked: the page still works for this visit */
  }
}
const newId = () => Math.random().toString(36).slice(2, 10);

function encodeShare(p: Playlist): string {
  const json = JSON.stringify({ n: p.name.slice(0, 60), i: p.ids.slice(0, MAX_SONGS) });
  return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function decodeShare(s: string): Playlist | null {
  try {
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
    const v = JSON.parse(decodeURIComponent(escape(atob(b64))));
    if (!v || !Array.isArray(v.i)) return null;
    const ids = v.i.filter((x: unknown) => typeof x === 'string').slice(0, MAX_SONGS);
    return { id: 'shared', name: String(v.n || 'A shared playlist').slice(0, 60), ids };
  } catch {
    return null;
  }
}

export default function UruPlaylists({ tracks, onRequest = [] }: { tracks: Track[]; onRequest?: Track[] }) {
  const byId = useMemo(() => new Map([...tracks, ...onRequest].map((t) => [t.id, t])), [tracks, onRequest]);
  const [lists, setLists] = useState<Playlist[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [shared, setShared] = useState<Playlist | null>(null);
  const [q, setQ] = useState('');
  const [nowId, setNowId] = useState<string>('');
  const [queue, setQueue] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const audio = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const l = load();
    setLists(l);
    setActiveId(l[0]?.id ?? '');
    const s = new URLSearchParams(window.location.search).get('l');
    if (s) setShared(decodeShare(s));
  }, []);

  function update(next: Playlist[]) {
    setLists(next);
    save(next);
  }
  const active = lists.find((p) => p.id === activeId) ?? null;

  function newPlaylist(name = 'My playlist', ids: string[] = []) {
    const p = { id: newId(), name, ids };
    update([...lists, p]);
    setActiveId(p.id);
    return p;
  }
  function add(t: Track) {
    const target = active ?? newPlaylist();
    if (target.ids.includes(t.id)) return setNote(`"${t.title}" is already in ${target.name}.`);
    if (target.ids.length >= MAX_SONGS) return setNote(`A playlist holds up to ${MAX_SONGS} songs.`);
    const next = (active ? lists : [...lists.filter((p) => p.id !== target.id), target]).map((p) =>
      p.id === target.id ? { ...p, ids: [...p.ids, t.id] } : p,
    );
    update(next);
    setNote(`Added "${t.title}" to ${target.name}.`);
  }
  function edit(fn: (p: Playlist) => Playlist) {
    if (!active) return;
    update(lists.map((p) => (p.id === active.id ? fn(p) : p)));
  }
  function move(i: number, d: number) {
    edit((p) => {
      const ids = [...p.ids];
      const j = i + d;
      if (j < 0 || j >= ids.length) return p;
      [ids[i], ids[j]] = [ids[j], ids[i]];
      return { ...p, ids };
    });
  }

  function playIds(ids: string[], from = 0) {
    const playable = ids.filter((id) => byId.has(id));
    if (!playable.length) return setNote('None of these songs can play right now.');
    setQueue(playable);
    start(playable[Math.min(from, playable.length - 1)]);
  }
  function start(id: string) {
    const t = byId.get(id);
    const a = audio.current;
    if (!t || !a) return;
    setNowId(id);
    a.src = t.src;
    void a.play().catch(() => setNote('Tap play on the player to start.'));
  }
  function next() {
    const i = queue.indexOf(nowId);
    if (i >= 0 && i + 1 < queue.length) start(queue[i + 1]);
    else setNowId('');
  }

  async function share(p: Playlist) {
    const url = `${window.location.origin}/uru?l=${encodeShare(p)}`;
    try {
      if (navigator.share) return void (await navigator.share({ title: p.name, text: 'A playlist for you from G Putnam Music', url }));
    } catch {
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setNote('Link copied. Paste it in a text or email.');
    } catch {
      setNote(url);
    }
  }

  /* One row per song id: the list can carry the same song twice (and a search adds the on-request songs). */
  const unique = (l: Track[]) => l.filter((t, i) => l.findIndex((u) => u.id === t.id) === i);
  const shown = unique(
    q.trim()
      ? [...tracks, ...onRequest].filter((t) => `${t.artist} ${t.title}`.toLowerCase().includes(q.trim().toLowerCase()))
      : tracks,
  );
  const now = byId.get(nowId);

  const row = 'flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm';
  const small = 'min-h-11 rounded-full border-2 border-[#8B4513] px-4 text-sm font-black text-[#8B4513]';
  const main = 'min-h-12 rounded-full bg-[#FFD54F] px-6 text-base font-black text-[#2A1506] shadow';

  const listView = (p: Playlist, mine: boolean) => (
    <div className="rounded-3xl bg-white p-5 shadow-xl ring-1 ring-[#8B4513]/20">
      {mine ? (
        <input
          aria-label="Playlist name"
          value={p.name}
          maxLength={60}
          onChange={(e) => edit((x) => ({ ...x, name: e.target.value }))}
          className="w-full rounded-lg border border-[#8B4513]/30 px-3 py-2 text-2xl font-black"
        />
      ) : (
        <p className="text-2xl font-black">{p.name}</p>
      )}
      <p className="mt-1 text-sm font-bold text-[#5D4037]">{p.ids.length} song{p.ids.length === 1 ? '' : 's'}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className={main} onClick={() => playIds(p.ids)} disabled={!p.ids.length}>▶ Play all</button>
        {mine ? (
          <button type="button" className={small} onClick={() => share(p)} disabled={!p.ids.length}>Share</button>
        ) : (
          <button type="button" className={small} onClick={() => { newPlaylist(p.name, p.ids); setShared(null); setNote('Saved to your playlists.'); }}>Save to my playlists</button>
        )}
      </div>
      <ol className="mt-4 space-y-2">
        {p.ids.map((id, i) => {
          const t = byId.get(id);
          return (
            <li key={`${id}-${i}`} className={`${row} ${nowId === id ? 'ring-2 ring-[#FFD54F]' : ''}`}>
              <button type="button" className="min-h-11 min-w-0 flex-1 text-left" onClick={() => playIds(p.ids, i)} disabled={!t}>
                <span className="block truncate font-black">{t ? t.title : 'This song is not playing right now'}</span>
                {t ? <span className="block truncate text-sm text-[#5D4037]">{t.artist}</span> : null}
              </button>
              {mine ? (
                <span className="flex shrink-0 gap-1">
                  <button type="button" aria-label="Move up" className="h-11 w-11 rounded-full bg-[#FFF0F5] font-black" onClick={() => move(i, -1)}>↑</button>
                  <button type="button" aria-label="Move down" className="h-11 w-11 rounded-full bg-[#FFF0F5] font-black" onClick={() => move(i, 1)}>↓</button>
                  <button type="button" aria-label="Remove" className="h-11 w-11 rounded-full bg-[#FFF0F5] font-black" onClick={() => edit((x) => ({ ...x, ids: x.ids.filter((_, k) => k !== i) }))}>✕</button>
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
      {mine && !p.ids.length ? <p className="mt-3 text-base text-[#5D4037]">Add songs from the list below.</p> : null}
      {mine ? (
        <button
          type="button"
          className="mt-5 text-sm font-bold text-[#8B1E12] underline"
          onClick={() => { if (window.confirm(`Delete "${p.name}"?`)) { const rest = lists.filter((x) => x.id !== p.id); update(rest); setActiveId(rest[0]?.id ?? ''); } }}
        >
          Delete this playlist
        </button>
      ) : null}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="sticky top-0 z-20 rounded-2xl bg-[#2A1506] p-4 text-[#F5E6D3] shadow-lg">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFD54F]">Now playing</p>
        <p className="mt-1 text-lg font-black">{now ? `${now.artist} · ${now.title}` : 'Press Play all on a playlist'}</p>
        <audio ref={audio} controls controlsList="nodownload" preload="none" className="mt-3 w-full" onEnded={next} />
      </div>

      {note ? <p className="rounded-xl bg-white px-4 py-3 font-bold" role="status">{note}</p> : null}

      {shared ? (
        <section>
          <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-[#8B4513]">Someone shared this playlist with you</p>
          {listView(shared, false)}
        </section>
      ) : null}

      <section>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-black">Your playlists</h2>
          <button type="button" className={small} onClick={() => newPlaylist(`Playlist ${lists.length + 1}`)}>+ New playlist</button>
        </div>
        {lists.length > 1 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {lists.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveId(p.id)}
                className={`min-h-11 rounded-full px-4 text-sm font-black ${p.id === activeId ? 'bg-[#3B1E12] text-white' : 'bg-white text-[#3B1E12]'}`}
              >
                {p.name || 'Untitled'}
              </button>
            ))}
          </div>
        ) : null}
        <div className="mt-4">
          {active ? listView(active, true) : <p className="rounded-2xl bg-white p-5 text-base">Tap + Add on any song below and your first playlist starts itself. It stays on this phone; nothing to sign up for.</p>}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-black">Songs</h2>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Find a song or artist"
          className="mt-3 w-full rounded-xl border border-[#8B4513]/30 bg-white px-4 py-3 text-base"
        />
        <ul className="mt-3 space-y-2">
          {shown.map((t) => (
            <li key={t.id} className={row}>
              <button type="button" className="min-h-11 min-w-0 flex-1 text-left" onClick={() => { setQueue([t.id]); start(t.id); }}>
                <span className="block truncate font-black">{t.title}</span>
                <span className="block truncate text-sm text-[#5D4037]">{t.artist}</span>
              </button>
              <button type="button" className={`${small} shrink-0`} onClick={() => add(t)}>+ Add</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
