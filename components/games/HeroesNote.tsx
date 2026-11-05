import Link from 'next/link';

/* Under every Heroes game: the games are free to everyone, and every HUG is free
   to Heroes (GD, 2026-10-10 and 2026-11-04: "GAMES & HUGs are free to Heroes").
   The free HUGs for Heroes live on k-kut.com/heroes. */
export const FREE_HUGS_FOR_HEROES = 'https://www.k-kut.com/heroes';

export const HEROES_GAMES = [
  { href: '/games/heroes-reels', title: 'Heroes Reels' },
  { href: '/games/thank-a-hero', title: 'Can I Thank a Hero?' },
  { href: '/games/what-if-heroes', title: 'What if…? Heroes' },
];

export default function HeroesNote({ here }: { here: string }) {
  return (
    <aside className="mt-10 rounded-2xl border border-sky-300/40 bg-[#0a1e35] p-5 text-[#D7CCC8]">
      <p className="text-lg font-black text-white">Are you a hero?</p>
      <p className="mt-1">
        If you serve in the US military, served, or work as police, fire, an EMT, a nurse or a doctor, every HUG you send is free.
        No limit. These games are free for everyone.
      </p>
      <a href={FREE_HUGS_FOR_HEROES} className="mt-3 inline-block min-h-12 rounded-2xl bg-[#FFD54F] px-5 py-3 font-black text-black">
        Send a free HUG
      </a>
      <p className="mt-4 text-sm font-bold uppercase tracking-[0.2em] text-sky-200">More Heroes games</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {HEROES_GAMES.filter((g) => g.href !== here).map((g) => (
          <li key={g.href}>
            <Link href={g.href} className="inline-block min-h-11 rounded-full border border-white/30 px-4 py-2 font-bold text-white">
              {g.title}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
