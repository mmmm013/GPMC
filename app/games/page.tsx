import Link from 'next/link';

/* The MEANTs games for the GPM domains: the KLEIGH games of 2kleigh.com, played
   with every G Putnam Music song (GD, 2026-10-21). Catalogued in k-kut
   (config/kleigh-games.v1.json). */
export const metadata = { title: 'Games | G Putnam Music' };

const GAMES = [
  {
    href: '/games/can-i',
    title: 'Can I…?',
    tag: 'TUGs · free · 3 levels',
    blurb: 'Can a G Putnam Music song make you laugh, tear up, worry, inspire, help, comfort or excite you? Pick a challenge, listen, and tell us if it did.',
  },
  {
    href: '/games/bug-story',
    title: 'BUG-Story',
    tag: 'BUGs · free · 3 levels',
    blurb: 'Type three words and hear them sung, one word at a time, as a tiny story.',
  },
  {
    href: '/games/16-ball',
    title: '16-Ball',
    tag: 'BUGs · free · party game',
    blurb: 'Ask the person across from you anything, shake the kaleidoscope ball, and the ball answers with one word from a real song.',
  },
];

export default function GamesPage() {
  return (
    <main className="min-h-screen bg-[#1a1207] px-4 pb-16 pt-24 text-white">
      <section className="mx-auto max-w-3xl">
        <h1 className="text-5xl font-black tracking-tight">Games</h1>
        <p className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-[#FFD54F]">All about the songs</p>
        <div className="mt-8 grid gap-4">
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
