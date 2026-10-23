import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SongPlayer from '@/components/listen/SongPlayer';

export const metadata: Metadata = {
  title: 'Listen | G Putnam Music',
  description: 'Every G Putnam Music song, ready to play.',
};

/* Every G Putnam Music song that can play. The list and its signed stream
   addresses come from k-kut.com/api/fm; audio streams from there and is never
   handed over as a file. GD, 2026-10-11: "Flagship uses all!" */
export const dynamic = 'force-dynamic';

type Track = { id: string; artist: string; title: string; src: string; video?: string; buyDownloadUrl?: string };

async function tracks(): Promise<Track[]> {
  try {
    const res = await fetch('https://www.k-kut.com/api/fm', {
      cache: 'no-store',
      headers: { 'User-Agent': 'GPM-flagship/1' },
    });
    if (!res.ok) return [];
    const body = (await res.json()) as { tracks?: Track[] };
    return body.tracks ?? [];
  } catch {
    return [];
  }
}

export default async function ListenPage() {
  const list = await tracks();
  return (
    <main className="min-h-screen bg-[#FFF0F5] text-[#2C2418]">
      <Header />
      <section className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-4xl font-black uppercase tracking-tight text-[#8B4513] md:text-6xl">Listen</h1>
        <p className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-[#5D4037]">
          {list.length} songs · tap to play
        </p>
        <div className="mt-6">
          {list.length ? (
            <SongPlayer tracks={list} />
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
