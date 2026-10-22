import Link from 'next/link';
import { CoupleGame } from '@/components/games/ClientGames';

export const metadata = { title: 'HUGs, Kisses & Fantastic Wishes | G Putnam Music Games' };

export default function CoupleGamePage() {
  return (
    <main className="min-h-screen bg-[#1a1207] px-4 pb-16 pt-24 text-white">
      <section className="mx-auto max-w-3xl">
        <Link href="/games" className="text-sm font-bold text-[#FFD54F]">← Games</Link>
        <h1 className="mt-2 text-5xl font-black tracking-tight">HUGs, Kisses & Fantastic Wishes</h1>
        <p className="mt-3 text-[#D7CCC8]">
          A game for two, on one phone. Pass it back and forth: guess each other's HUGs, trade sung love notes for kisses, and finish with a Fantastic Wish and a free HUG for you both.
        </p>
        <div className="mt-6">
          <CoupleGame />
        </div>
      </section>
    </main>
  );
}
