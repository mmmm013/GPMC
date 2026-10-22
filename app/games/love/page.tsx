import Link from 'next/link';
import { LoveGame } from '@/components/games/ClientGames';

export const metadata = { title: 'Love Game | G Putnam Music Games' };

export default function LoveGamePage() {
  return (
    <main className="min-h-screen bg-[#1a1207] px-4 pb-16 pt-24 text-white">
      <section className="mx-auto max-w-3xl">
        <Link href="/games" className="text-sm font-bold text-[#FFD54F]">← Games</Link>
        <h1 className="mt-2 text-5xl font-black tracking-tight">Love Game</h1>
        <p className="mt-3 text-[#D7CCC8]">
          Step up to the fair. Pick your lover name and your HUG Bear, aim your arrows of love, and win a ribbon and a prize for your love. Play quick, short or the full fair.
        </p>
        <div className="mt-6">
          <LoveGame />
        </div>
      </section>
    </main>
  );
}
