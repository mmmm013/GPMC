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
          A game for a circle: the two of you, friends, family. Ask the ball anything, for yourself or for someone in
          the circle, and it answers with one word or sound sung from a real song. Read into it what you will.
        </p>
        <details className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-[#D7CCC8]" open>
          <summary className="cursor-pointer font-bold text-white">How to play</summary>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>Gather your circle. Two of you, friends or family. Best with up to 8, but anyone can join at any time.</li>
            <li>On your turn, choose who your question is for: yourself, or someone in the circle.</li>
            <li>For yourself, close your eyes and ask silently. For someone else, look at them and ask out loud, then hand them the phone.</li>
            <li>Breathe in, breathe out, and touch the ball. It listens, then answers with one sung word.</li>
            <li>Read into it what you will, then pass the phone to the next person.</li>
          </ol>
          <p className="mt-3 text-sm">Your question is never typed or sent. It stays in the room.</p>
        </details>
        <div className="mt-8">
          <SixteenBall />
        </div>
      </section>
    </main>
  );
}
