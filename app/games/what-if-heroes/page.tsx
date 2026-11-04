import Link from 'next/link';
import { WhatIfGame } from '@/components/games/ClientGames';
import HeroesNote from '@/components/games/HeroesNote';

export const metadata = { title: 'What if…? Heroes | G Putnam Music Games' };

/* "What if...? Heroes" (GD, 2026-11-04): What if...? with hero scenarios. */
export default function WhatIfHeroesPage() {
  return (
    <main className="min-h-screen bg-[#1a1207] px-4 pb-16 pt-24 text-white">
      <section className="mx-auto max-w-3xl">
        <Link href="/games" className="text-sm font-bold text-[#FFD54F]">← Games</Link>
        <h1 className="mt-2 text-5xl font-black tracking-tight">What if…? Heroes</h1>
        <p className="mt-3 text-[#D7CCC8]">
          What if your hero is coming home today? Pick a What if, listen to the songs that fit, and choose the one you would send them.
          Or send one word, sung. Answer seven to clear all three levels.
        </p>
        <div className="mt-6">
          <WhatIfGame heroes />
        </div>
        <HeroesNote here="/games/what-if-heroes" />
      </section>
    </main>
  );
}
