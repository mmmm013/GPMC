import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VideoStage from '@/components/videos/VideoStage';
import { halloweenVideos, michaelClayVideos, youtubeVideos, type LinkVideo } from '@/config/videos';

export const metadata: Metadata = {
  title: 'Videos | G Putnam Music',
  description: 'Every G Putnam Music video in one place.',
};

/* All videos on the flagship (config/videos.ts; GD, 2026-10-28: "I want all videos
   on flagship"). Michael Clay's play from 2kleigh.com, where they live; the
   Halloween videos are links to the page that sells them. */
export const revalidate = 3600;

function LinkList({ videos }: { videos: LinkVideo[] }) {
  return (
    <ul className="mt-4 divide-y divide-[#8B4513]/15 rounded-2xl border border-[#8B4513]/20 bg-white">
      {videos.map((v) => (
        <li key={`${v.title}-${v.href}`}>
          <a href={v.href} className="flex items-center gap-3 px-4 py-3 hover:bg-[#FFF0F5]">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFD54F] text-lg font-black text-[#2A1506]">
              ▶
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-base font-black text-[#2C2418]">{v.title}</span>
              <span className="block text-xs font-bold uppercase tracking-[0.14em] text-[#8B4513]">{v.note}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function VideosPage() {
  const now = Date.now();
  const halloween = halloweenVideos.filter((v) => !v.until || now < Date.parse(v.until));
  const total = michaelClayVideos.length + halloween.length + youtubeVideos.length;
  return (
    <main className="min-h-screen bg-[#FFF0F5] text-[#2C2418]">
      <Header />
      <section className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-4xl font-black uppercase tracking-tight text-[#8B4513] md:text-6xl">Videos</h1>
        <p className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-[#5D4037]">{total} videos · tap to watch</p>

        <h2 className="mt-10 text-2xl font-black uppercase tracking-tight text-[#8B4513]">Michael Clay</h2>
        <div className="mt-4">
          <VideoStage videos={michaelClayVideos} />
        </div>

        {halloween.length > 0 && (
          <>
            <h2 className="mt-12 text-2xl font-black uppercase tracking-tight text-[#8B4513]">Halloween</h2>
            <LinkList videos={halloween} />
          </>
        )}

        {youtubeVideos.length > 0 && (
          <>
            <h2 className="mt-12 text-2xl font-black uppercase tracking-tight text-[#8B4513]">G Putnam Music on YouTube</h2>
            <LinkList videos={youtubeVideos} />
          </>
        )}
      </section>
      <Footer />
    </main>
  );
}
