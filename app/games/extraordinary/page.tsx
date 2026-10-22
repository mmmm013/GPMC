import Link from 'next/link';
import { Wonders } from '@/components/games/ClientGames';

export const metadata = { title: 'Extraordinary | G Putnam Music Games' };

export default function ExtraordinaryPage() {
  return (
    <main className="min-h-screen bg-[#1a1207] px-4 pb-16 pt-24 text-white">
      <section className="mx-auto max-w-3xl">
        <Link href="/games" className="text-sm font-bold text-[#FFD54F]">← Games</Link>
        <h1 className="mt-2 text-5xl font-black tracking-tight">Extraordinary</h1>
        <p className="mt-3 text-[#D7CCC8]">
          Twelve ways to feel, see, steer and summon G Putnam Music. Odd, surprising, and never the same twice.
        </p>
        <div className="mt-8">
          <Wonders />
        </div>
      </section>
    </main>
  );
}
