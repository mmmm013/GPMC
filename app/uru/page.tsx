import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UruPlaylists from '@/components/uru/UruPlaylists';
import { displayTitle } from '@/lib/displayTitle';

/* URU -- your own playlists. GD, 2026-11-27: "URU playlists: let users build their own playlists." On a card
   he chose: full songs (from /listen), kept on the person's own phone (no sign-in, nothing kept by us),
   shareable by a link, and this page replaces the old sponsor-snippet URU page, whose per-second prices broke
   his rule that length never counts. Songs and their signed stream addresses come from k-kut.com/api/fm, the
   same as /listen; a playlist stores only song ids, so a saved or shared list never holds an address that
   expires. Stream only. */
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'URU · Your playlists | G Putnam Music',
  description: 'Make your own playlists of G Putnam Music songs. No sign-in. Share one with a link.',
  alternates: { canonical: 'https://www.gputnammusic.com/uru' },
  openGraph: {
    title: 'URU: make your own playlist.',
    description: 'Pick the songs, put them in your order, share it with a link. No sign-in.',
    url: 'https://www.gputnammusic.com/uru',
    siteName: 'G Putnam Music',
    type: 'website',
  },
};

type Track = { id: string; artist: string; title: string; src: string };

async function tracks(): Promise<{ tracks: Track[]; onRequest: Track[] }> {
  try {
    const res = await fetch('https://www.k-kut.com/api/fm', { cache: 'no-store', headers: { 'User-Agent': 'GPM-flagship/1' } });
    if (!res.ok) return { tracks: [], onRequest: [] };
    const body = (await res.json()) as { tracks?: Track[]; onRequest?: Track[] };
    const slim = (l?: Track[]) => (l ?? []).map(({ id, artist, title, src }) => ({ id, artist, title: displayTitle(title), src }));
    return { tracks: slim(body.tracks), onRequest: slim(body.onRequest) };
  } catch {
    return { tracks: [], onRequest: [] };
  }
}

export default async function UruPage() {
  const { tracks: list, onRequest } = await tracks();
  return (
    <main className="min-h-screen bg-[#FFF0F5] text-[#2C2418]">
      <Header />
      <section className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-5xl font-black tracking-tight text-[#8B4513] md:text-7xl">URU</h1>
        <p className="mt-2 text-lg font-bold text-[#5D4037]">Your playlists. Pick the songs, put them in your order, play them, share them.</p>
        <div className="mt-6">
          {list.length ? (
            <UruPlaylists tracks={list} onRequest={onRequest} />
          ) : (
            <p className="rounded-2xl border border-[#8B4513]/20 bg-white p-6">The songs are loading slowly. Please refresh in a moment.</p>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
