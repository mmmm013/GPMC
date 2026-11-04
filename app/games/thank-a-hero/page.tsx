import Link from 'next/link';
import { CanIGame } from '@/components/games/ClientGames';
import HeroesNote from '@/components/games/HeroesNote';

export const metadata = { title: 'Can I Thank a Hero? | G Putnam Music Games' };

/* "Can I Thank a Hero?" (GD, 2026-11-04): Can I...? with the seven Heroes roles. */
export default function ThankAHeroPage() {
  return (
    <main className="min-h-screen bg-[#1a1207] px-4 pb-16 pt-24 text-white">
      <section className="mx-auto max-w-3xl">
        <Link href="/games" className="text-sm font-bold text-[#FFD54F]">← Games</Link>
        <h1 className="mt-2 text-5xl font-black tracking-tight">Can I Thank a Hero?</h1>
        <p className="mt-3 text-[#D7CCC8]">
          Pick a hero: a veteran, someone serving far from home, a nurse, a firefighter, a police officer, an EMT or a doctor.
          Listen to a TUG and say whether it would thank them. Answer all seven to clear all three levels.
        </p>
        <div className="mt-6">
          <CanIGame heroes />
        </div>
        <HeroesNote here="/games/thank-a-hero" />
      </section>
    </main>
  );
}
