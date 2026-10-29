'use client';

import { useEffect, useRef, useState } from 'react';
import type { PlayVideo } from '@/config/videos';

function clock(s: number) {
  return `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
}

/* The stage 2kleigh.com/videos uses (2kleigh components/mc/SongVideos.tsx): one
   video at a time, nothing plays until the viewer taps, numbered in running order,
   and each video has its own link (/videos?v=slug). No download. */
export default function VideoStage({ videos }: { videos: PlayVideo[] }) {
  const [current, setCurrent] = useState(0);
  const [shared, setShared] = useState(false);
  const stage = useRef<HTMLVideoElement>(null);
  const v = videos[current];

  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('v');
    const i = videos.findIndex((item) => item.slug === slug);
    if (i > 0) setCurrent(i);
  }, [videos]);

  function choose(i: number) {
    setCurrent(i);
    setShared(false);
    window.history.replaceState(null, '', `?v=${videos[i].slug}`);
    setTimeout(() => {
      stage.current?.play().catch(() => {});
      stage.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  }

  async function share() {
    const url = `${window.location.origin}/videos?v=${v.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: v.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared(true);
    } catch {
      /* The viewer closed the share sheet. */
    }
  }

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-[#C8A882]/50 bg-black">
        <video
          ref={stage}
          key={v.slug}
          src={v.src}
          poster={v.poster}
          controls
          playsInline
          preload="metadata"
          controlsList="nodownload"
          className={`mx-auto w-full bg-black ${v.portrait ? 'max-h-[70vh] object-contain' : 'aspect-video'}`}
        />
      </div>
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-lg font-black text-[#2C2418]">
          <span className="text-[#8B4513]">#{current + 1}</span> {v.title}{' '}
          <span className="text-sm font-bold text-[#5D4037]">· {v.note}</span>
        </p>
        <button
          type="button"
          onClick={share}
          className="rounded-full border border-[#8B4513]/40 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#8B4513] hover:bg-[#8B4513] hover:text-white"
        >
          {shared ? 'Link copied' : 'Share this video'}
        </button>
      </div>

      <ol className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {videos.map((item, i) => (
          <li key={item.slug}>
            <button
              type="button"
              onClick={() => choose(i)}
              aria-current={i === current}
              className={`relative w-full overflow-hidden rounded-xl border bg-white text-left transition ${
                i === current ? 'border-[#8B4513]' : 'border-[#8B4513]/20 hover:border-[#8B4513]/50'
              }`}
            >
              <span className="absolute left-2 top-2 rounded-full bg-black/75 px-2 py-0.5 text-xs font-black text-[#FFD54F]">
                #{i + 1}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.poster} alt="" loading="lazy" className="aspect-video w-full bg-black object-cover" />
              <span className="block px-3 py-2">
                <span className="block text-sm font-black text-[#2C2418]">{item.title}</span>
                <span className="block text-xs text-[#5D4037]">
                  {item.note} · {clock(item.seconds)}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
