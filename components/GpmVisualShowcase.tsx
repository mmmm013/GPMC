'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const SHOWCASE_SLIDES = [
  {
    src: '/k-hero.jpg',
    alt: 'G Putnam Music artist portrait',
    eyebrow: 'Artist image',
    title: 'Music has a face.',
    position: 'center center',
  },
  {
    src: '/k-hero-alternate.JPG',
    alt: 'Alternate G Putnam Music artist portrait',
    eyebrow: 'Another angle',
    title: 'Every song carries a point of view.',
    position: 'center center',
  },
  {
    src: '/IMG_7429.JPG',
    alt: 'G Putnam Music studio portrait',
    eyebrow: 'Inside the room',
    title: 'Show where the music becomes real.',
    position: '30% center',
  },
  {
    src: '/assets/MC Agnst Stone Wall Knee Bent.jpg',
    alt: 'G Putnam Music outdoor artist portrait',
    eyebrow: 'Beyond the studio',
    title: 'A catalog built by people, not placeholders.',
    position: 'center center',
  },
  {
    src: '/assets/hero.jpg',
    alt: 'G Putnam Music catalog visual',
    eyebrow: 'The catalog',
    title: 'Complete songs. Human stories. One home.',
    position: 'center center',
  },
];

const GALLERY_ASSETS = [
  { src: '/IMG_7624.JPG', alt: 'G Putnam Music studio image', position: '30% center' },
  { src: '/IMG_7720.JPG', alt: 'G Putnam Music producer portrait', position: '30% 70%' },
  { src: '/assets/MC by Tree Looking Left.jpg', alt: 'G Putnam Music outdoor portrait', position: 'center center' },
  { src: '/assets/Front Pose.jpg', alt: 'G Putnam Music artist portrait', position: 'center top' },
  { src: '/assets/MOON-1[32199].jpg', alt: 'KLEIGH moon artwork', position: 'center center' },
];

export default function GpmVisualShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % SHOWCASE_SLIDES.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [paused]);

  const active = SHOWCASE_SLIDES[activeIndex];

  return (
    <>
      <section className="relative overflow-hidden border-b border-[#D4A017]/25 bg-black">
        <div className="relative min-h-[650px] lg:min-h-[760px]">
          {SHOWCASE_SLIDES.map((slide, index) => (
            <img
              key={slide.src}
              src={slide.src}
              alt={index === activeIndex ? slide.alt : ''}
              aria-hidden={index !== activeIndex}
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-[1400ms] ease-out ${
                index === activeIndex ? 'scale-100 opacity-100' : 'scale-[1.04] opacity-0'
              }`}
              style={{ objectPosition: slide.position }}
            />
          ))}

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,4,1,0.94)_0%,rgba(10,4,1,0.73)_43%,rgba(10,4,1,0.18)_76%,rgba(10,4,1,0.48)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(10,4,1,0.96)_0%,transparent_42%,rgba(10,4,1,0.22)_100%)]" />

          <div className="relative z-10 mx-auto flex min-h-[650px] max-w-7xl flex-col justify-between px-6 py-10 sm:px-10 lg:min-h-[760px] lg:py-14">
            <div className="flex items-center justify-between gap-4">
              <p className="rounded-full border border-[#FFD36A]/35 bg-black/35 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-[#FFD36A] backdrop-blur-md">
                G Putnam Music visual stage
              </p>
              <button
                type="button"
                onClick={() => setPaused((value) => !value)}
                className="rounded-full border border-white/25 bg-black/35 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/80 backdrop-blur-md transition hover:border-[#FFD36A]/70 hover:text-[#FFD36A]"
                aria-label={paused ? 'Resume image rotation' : 'Pause image rotation'}
              >
                {paused ? 'Play visuals' : 'Pause visuals'}
              </button>
            </div>

            <div className="max-w-4xl pb-8 pt-24 sm:pb-12">
              <p className="text-sm font-black uppercase tracking-[0.36em] text-[#FFD36A]">
                {active.eyebrow}
              </p>
              <h1 className="mt-5 text-5xl font-black leading-[0.92] text-white drop-shadow-2xl sm:text-7xl lg:text-8xl">
                {active.title}
              </h1>
              <p className="mt-6 max-w-3xl text-lg font-bold leading-8 text-white/78 sm:text-xl">
                Hear the catalog, see the people behind it, and move through complete G Putnam Music songs as a living body of work.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/songs"
                  className="inline-flex items-center justify-center rounded-full bg-[#FFD36A] px-7 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#201106] shadow-xl transition hover:bg-[#FFE7A3]"
                >
                  Enter the song catalog
                </Link>
                <Link
                  href="/who"
                  className="inline-flex items-center justify-center rounded-full border border-white/35 bg-black/25 px-7 py-4 text-sm font-black uppercase tracking-[0.14em] text-white backdrop-blur-sm transition hover:border-[#FFD36A] hover:text-[#FFD36A]"
                >
                  Meet the people
                </Link>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {SHOWCASE_SLIDES.map((slide, index) => (
                  <button
                    key={slide.src}
                    type="button"
                    onClick={() => {
                      setActiveIndex(index);
                      setPaused(true);
                    }}
                    className={`relative h-20 min-w-28 overflow-hidden rounded-xl border-2 transition sm:h-24 sm:min-w-36 ${
                      index === activeIndex
                        ? 'border-[#FFD36A] shadow-lg shadow-black/50'
                        : 'border-white/20 opacity-65 hover:opacity-100'
                    }`}
                    aria-label={`Show visual ${index + 1}: ${slide.eyebrow}`}
                  >
                    <img
                      src={slide.src}
                      alt=""
                      className="h-full w-full object-cover"
                      style={{ objectPosition: slide.position }}
                    />
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-black uppercase tracking-[0.16em] text-white/72 sm:text-xs">
                <div className="rounded-xl border border-white/15 bg-black/35 px-3 py-3 backdrop-blur-md">Complete songs</div>
                <div className="rounded-xl border border-white/15 bg-black/35 px-3 py-3 backdrop-blur-md">Human created</div>
                <div className="rounded-xl border border-white/15 bg-black/35 px-3 py-3 backdrop-blur-md">Rights aware</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#100804] px-6 py-16 text-[#F7E7C8] sm:px-10 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.32em] text-[#FFD36A]">Pictures from the work</p>
              <h2 className="mt-4 text-4xl font-black leading-tight text-white sm:text-6xl">Not stock. Not filler. Our people and our images.</h2>
              <p className="mt-5 max-w-xl text-base font-bold leading-8 text-[#F7E7C8]/68">
                The visual system should make the catalog feel inhabited. Photography leads; verified video can enter the same stage after its media authority is confirmed.
              </p>
            </div>

            <div className="grid auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[190px] sm:grid-cols-3">
              {GALLERY_ASSETS.map((asset, index) => (
                <figure
                  key={asset.src}
                  className={`group relative overflow-hidden rounded-2xl border border-[#D4A017]/25 bg-black ${
                    index === 0 ? 'row-span-2 sm:col-span-2' : ''
                  }`}
                >
                  <img
                    src={asset.src}
                    alt={asset.alt}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    style={{ objectPosition: asset.position }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-70" />
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
