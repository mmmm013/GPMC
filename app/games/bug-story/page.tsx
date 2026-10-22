import Link from 'next/link';
import { BugStoryGame } from '@/components/games/ClientGames';

export const metadata = { title: 'BUG-Story | G Putnam Music Games' };

export default function BugStoryPage() {
  return (
    <main className="min-h-screen bg-[#1a1207] px-4 pb-16 pt-24 text-white">
      <section className="mx-auto max-w-3xl">
        <Link href="/games" className="text-sm font-bold text-[#FFD54F]">← Games</Link>
        <h1 className="mt-2 text-5xl font-black tracking-tight">BUG-Story</h1>
        <p className="mt-3 text-[#D7CCC8]">
          Free to play. Type three words and hear each one sung, in order, as a tiny story.
        </p>
        <div className="mt-6">
          <BugStoryGame />
        </div>
      </section>
    </main>
  );
}
