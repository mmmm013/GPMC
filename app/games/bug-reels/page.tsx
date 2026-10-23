import Link from 'next/link';
import { BugReels } from '@/components/games/ClientGames';

export const metadata = { title: 'BUG Reels | G Putnam Music Games' };

export default function BugReelsPage() {
  return (
    <main className="min-h-screen bg-[#1a1207] px-4 pb-16 pt-24 text-white">
      <section className="mx-auto max-w-3xl">
        <Link href="/games" className="text-sm font-bold text-[#FFD54F]">← Games</Link>
        <h1 className="mt-2 text-5xl font-black tracking-tight">BUG Reels</h1>
        <p className="mt-3 text-[#D7CCC8]">
          Free to play, nothing to buy. Pull the lever and three reels stop on three words. Each word is sung, in order,
          from a real song. Every pull sings a line.
        </p>
        <p className="mt-2 text-[#D7CCC8]">
          Hold a word you like, nudge a reel one step, and find a Sweet Line like &ldquo;I love you&rdquo; for a star.
          Three stars open a Golden Pull with a fourth reel. Send any line on, free.
        </p>
        <div className="mt-8">
          <BugReels />
        </div>
        <details className="mt-10 rounded-2xl border border-white/10 bg-black/30 p-4 text-[#D7CCC8]">
          <summary className="cursor-pointer font-bold text-white">Where the reels come from</summary>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
            <li>The first three-reel lever machines were built in San Francisco in the 1890s. Here the reels hold words.</li>
            <li>In the early 1900s some machines gave out a stick of gum with every pull. That is where the fruit pictures came from. Here every pull gives you a sung line.</li>
            <li>British machines added Hold and Nudge, so players could keep a reel or step it along. They are here too.</li>
            <li>Video machines of the 1990s added a bonus round. Here three stars open a Golden Pull.</li>
            <li>What is new: the line you pull is a message, sung, that you can send to someone.</li>
          </ul>
        </details>
      </section>
    </main>
  );
}
