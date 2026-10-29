import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SadPlayer, { type SadList } from '@/components/sad/SadPlayer';
import { SAD_PLAYLISTS } from '@/config/sadPlaylists';

export const metadata: Metadata = {
  title: 'Sad Playlists | G Putnam Music',
  description: 'A safe place to feel sad. Six playlists: Loss, Heartbreak, Loneliness, Longing, Regret, and Fragile.',
};

/* Six SAD playlists (config/sadPlaylists.ts; GD, 2026-10-28). The songs and their
   signed stream addresses come from k-kut.com/api/fm, the same list /listen plays:
   stream only, never handed over as a file. A song that list does not carry yet is
   left out, not faked. */
export const dynamic = 'force-dynamic';

type FmTrack = { id: string; artist: string; title: string; src: string };

async function streams(): Promise<Map<string, FmTrack>> {
  try {
    const res = await fetch('https://www.k-kut.com/api/fm', {
      cache: 'no-store',
      headers: { 'User-Agent': 'GPM-flagship/1' },
    });
    if (!res.ok) return new Map();
    const body = (await res.json()) as { tracks?: FmTrack[]; onRequest?: FmTrack[] };
    return new Map([...(body.tracks ?? []), ...(body.onRequest ?? [])].map((t) => [t.id, t]));
  } catch {
    return new Map();
  }
}

export default async function SadPage() {
  const byId = await streams();
  /* Artist and title as /listen shows them; no download offer on this page. */
  const lists: SadList[] = SAD_PLAYLISTS.map((p) => ({
    name: p.name,
    tracks: p.tracks.flatMap((t) => {
      const fm = t.stream ? byId.get(t.stream) : undefined;
      return fm ? [{ id: fm.id, artist: fm.artist, title: fm.title, src: fm.src }] : [];
    }),
  })).filter((p) => p.tracks.length > 0);

  return (
    <main className="min-h-screen bg-[#FFF0F5] text-[#2C2418]">
      <Header />
      <section className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-4xl font-black uppercase tracking-tight text-[#8B4513] md:text-6xl">Sad Playlists</h1>
        <p className="mt-3 text-lg text-[#5D4037]">A safe place to feel sad. Stay as long as you like.</p>
        <div className="mt-6">
          {lists.length ? (
            <SadPlayer lists={lists} />
          ) : (
            <p className="rounded-2xl border border-[#8B4513]/20 bg-white p-6">
              The songs are loading slowly. Please refresh in a moment.
            </p>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
