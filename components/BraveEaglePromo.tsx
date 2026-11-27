'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type PromoLink = {
  href: string;
  label: string;
};

type BraveEaglePromoProps = {
  links?: PromoLink[];
};

const DEFAULT_LINKS: PromoLink[] = [
  { href: '/mip', label: 'MIP1 Recognition Form' },
  { href: '/uru', label: 'URU Playlists' },
  { href: '/tt', label: 'TT Tale Tell' },
  { href: '/gift', label: 'Gift Support' },
];

export default function BraveEaglePromo({ links = DEFAULT_LINKS }: BraveEaglePromoProps) {
  const promoLinks = useMemo(() => links.slice(0, 4), [links]);
  const [isSwooping, setIsSwooping] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    const runSwoop = () => {
      setIsSwooping(true);
      window.setTimeout(() => setIsSwooping(false), 7600);
    };

    const initial = window.setTimeout(runSwoop, 2400);
    const timer = window.setInterval(runSwoop, 42000);

    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        @keyframes brave-swoop {
          0% {
            transform: translateX(0) translateY(0) rotate(-6deg);
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          38% {
            transform: translateX(44vw) translateY(-14px) rotate(2deg);
            opacity: 1;
          }
          64% {
            transform: translateX(88vw) translateY(8px) rotate(5deg);
            opacity: 1;
          }
          100% {
            transform: translateX(112vw) translateY(10px) rotate(8deg);
            opacity: 0;
          }
        }
      `}</style>
      {isSwooping && (
        <button
          type="button"
          onClick={() => setIsPanelOpen(true)}
          aria-label="Open Brave promo panel"
          className="fixed top-24 left-[-140px] z-30 flex items-center gap-2 rounded-full border border-amber-300/40 bg-black/75 px-3 py-2 text-xs font-black uppercase tracking-widest text-amber-200 shadow-xl animate-[brave-swoop_7.6s_linear_forwards]"
        >
          <span className="text-lg leading-none">🦅</span>
          <span className="whitespace-nowrap">Brave on patrol</span>
        </button>
      )}

      <div className="fixed bottom-6 right-6 z-30">
        <button
          type="button"
          onClick={() => setIsPanelOpen((v) => !v)}
          aria-label="Toggle Brave promo links"
          className="group flex items-center gap-2 rounded-full border border-amber-300/40 bg-zinc-950/85 px-4 py-2 text-xs font-black uppercase tracking-widest text-amber-200 shadow-2xl backdrop-blur-sm transition hover:border-amber-200 hover:text-amber-100"
        >
          <span className="text-base leading-none transition group-hover:scale-110">🦅</span>
          <span>Brave / Bravo</span>
        </button>

        {isPanelOpen && (
          <div className="mt-2 w-[260px] rounded-2xl border border-amber-300/25 bg-black/90 p-4 text-sm shadow-2xl backdrop-blur-sm">
            <p className="mb-2 text-xs font-black uppercase tracking-widest text-amber-300">
              Heroes Promos
            </p>
            <p className="mb-3 text-xs text-zinc-300">
              Confident sweep. Light touch. Pick a route.
            </p>
            <div className="grid gap-2">
              {promoLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-xs font-semibold text-zinc-100 transition hover:border-amber-300/40 hover:text-amber-100"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
