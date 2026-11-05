import Link from 'next/link';
import { BugReels } from '@/components/games/ClientGames';
import HeroesNote from '@/components/games/HeroesNote';
import { HERO_REELS } from '@/lib/games/bugReels';

export const metadata = { title: 'Heroes Reels | G Putnam Music Games' };

/* Heroes Reels (GD, 2026-11-04: "create 3 Heroes\" games. One like Slots."): BUG
   Reels with words for thanking a hero. Free, no coins, nothing to buy. */
export default function HeroesReelsPage() {
  return (
    <main className="min-h-screen bg-[#1a1207] px-4 pb-16 pt-24 text-white">
      <section className="mx-auto max-w-3xl">
        <Link href="/games" className="text-sm font-bold text-[#FFD54F]">← Games</Link>
        <h1 className="mt-2 text-5xl font-black tracking-tight">Heroes Reels</h1>
        <p className="mt-3 text-[#D7CCC8]">
          Free to play, nothing to buy. Pull the lever and three reels stop on three words, each one sung from a real song.
          Every pull sings a thank-you line for a hero.
        </p>
        <p className="mt-2 text-[#D7CCC8]">
          Hold a word, nudge a reel one step, and find a Hero Line like &ldquo;we thank you&rdquo; or &ldquo;you stand tall&rdquo; for a star.
          Three stars open a Golden Pull with a fourth reel. Send your line to a hero, free.
        </p>
        <div className="mt-8">
          <BugReels set={HERO_REELS} />
        </div>
        <HeroesNote here="/games/heroes-reels" />
      </section>
    </main>
  );
}
