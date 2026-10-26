import Link from 'next/link';
import { GAMES, gameOfTheDay } from '@/lib/games/list';

/* The MEANTs games for the GPM domains: the KLEIGH games of 2kleigh.com, played
   with every G Putnam Music song (GD, 2026-10-21). Catalogued in k-kut
   (config/kleigh-games.v1.json). */
export const metadata = { title: 'Games | G Putnam Music' };
/* The Game of the day changes at midnight UTC, so the page is rebuilt hourly. */
export const revalidate = 3600;


export default function GamesPage() {
  const today = gameOfTheDay();
  return (
    <main className="min-h-screen bg-[#1a1207] px-4 pb-16 pt-24 text-white">
      <section className="mx-auto max-w-3xl">
        <h1 className="text-5xl font-black tracking-tight">Games</h1>
        <p className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-[#FFD54F]">All about the songs</p>
        <Link href="/games/today" className="mt-8 block rounded-2xl border-2 border-[#FFD54F] bg-[#FFD54F]/10 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFD54F]">Game of the day</p>
          <p className="mt-1 text-3xl font-black">{today.title}</p>
          <p className="mt-3 text-[#D7CCC8]">{today.blurb}</p>
          <p className="mt-3 text-sm font-black text-[#FFD54F]">Play today&apos;s game →</p>
        </Link>
        <div className="mt-6 grid gap-4">
          {GAMES.map((g) => (
            <Link key={g.href} href={g.href} className="rounded-2xl border border-white/15 bg-black/30 p-5 hover:border-[#FFD54F]">
              <p className="text-3xl font-black">{g.title}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-[#FFD54F]">{g.tag}</p>
              <p className="mt-3 text-[#D7CCC8]">{g.blurb}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
