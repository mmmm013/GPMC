import Link from 'next/link';
import { SixteenBall } from '@/components/games/ClientGames';

export const metadata = { title: '16-Ball | G Putnam Music Games' };

export default function SixteenBallPage() {
  return (
    <main className="min-h-screen bg-[#1a1207] px-4 pb-16 pt-24 text-white">
      <section className="mx-auto max-w-3xl">
        <Link href="/games" className="text-sm font-bold text-[#FFD54F]">← Games</Link>
        <h1 className="mt-2 text-5xl font-black tracking-tight">16-Ball</h1>
        <p className="mt-3 text-[#D7CCC8]">
          A party game. Ask anything, shake the ball, and the ball answers with one word or sound from a real song.
          Read into it what you like.
        </p>
        <div className="mt-8">
          <SixteenBall />
        </div>
      </section>
    </main>
  );
}
