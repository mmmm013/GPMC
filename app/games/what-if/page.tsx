import Link from 'next/link';
import { WhatIfGame } from '@/components/games/ClientGames';

export const metadata = { title: 'What if…? | G Putnam Music Games' };

export default function WhatIfPage() {
  return (
    <main className="min-h-screen bg-[#1a1207] px-4 pb-16 pt-24 text-white">
      <section className="mx-auto max-w-3xl">
        <Link href="/games" className="text-sm font-bold text-[#FFD54F]">← Games</Link>
        <h1 className="mt-2 text-5xl font-black tracking-tight">What if…?</h1>
        <p className="mt-3 text-[#D7CCC8]">
          Pick a What if. Listen to the songs that fit, and choose the one you would send. Or send one word, sung. Answer seven to clear all three levels.
        </p>
        <div className="mt-6">
          <WhatIfGame />
        </div>
      </section>
    </main>
  );
}
