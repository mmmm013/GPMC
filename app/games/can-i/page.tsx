import Link from 'next/link';
import { CanIGame } from '@/components/games/ClientGames';

export const metadata = { title: 'Can I…? | G Putnam Music Games' };

export default function CanIPage() {
  return (
    <main className="min-h-screen bg-[#1a1207] px-4 pb-16 pt-24 text-white">
      <section className="mx-auto max-w-3xl">
        <Link href="/games" className="text-sm font-bold text-[#FFD54F]">← Games</Link>
        <h1 className="mt-2 text-5xl font-black tracking-tight">Can I…?</h1>
        <p className="mt-3 text-[#D7CCC8]">
          The song asks. Pick a challenge, listen to a TUG, and say whether it did. Answer all seven to clear all three levels.
        </p>
        <div className="mt-6">
          <CanIGame />
        </div>
      </section>
    </main>
  );
}
