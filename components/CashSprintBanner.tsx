'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type CashSprintBannerProps = {
  endIso: string;
  source: string;
};

function formatRemaining(ms: number) {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export default function CashSprintBanner({ endIso, source }: CashSprintBannerProps) {
  const endTime = useMemo(() => new Date(endIso).getTime(), [endIso]);
  const [remaining, setRemaining] = useState('--:--:--');

  useEffect(() => {
    const updateRemaining = () => {
      const left = endTime - Date.now();
      setRemaining(formatRemaining(left));
    };

    updateRemaining();

    const iv = setInterval(() => {
      updateRemaining();
    }, 1000);

    return () => clearInterval(iv);
  }, [endTime]);

  // /api/k-kut-referral does not exist (404). GD, 2026-10-11, "do A": the working store.
  const checkoutHref = `https://www.k-kut.com/motivation?utm_source=${encodeURIComponent(source)}&utm_medium=site&utm_campaign=gpm_artist_opportunity_2026&utm_content=countdown`;

  return (
    <section className="px-4 pt-3">
      <div className="max-w-7xl mx-auto rounded-xl border border-[#FFD54F]/60 bg-[#241302] p-3 sm:p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-[#FFD54F]">24H Cash Sprint</span>
          <span className="text-[#F5E6C8] text-sm sm:text-base font-bold">Ends in {remaining}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={checkoutHref}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-full bg-[#FFD54F] text-[#2A1506] text-xs font-extrabold tracking-wider hover:bg-[#FFE082] transition-colors"
          >
            Send a HUG
          </a>
          <Link
            href="/gift"
            className="px-4 py-2 rounded-full border border-[#C8A882]/70 text-[#C8A882] text-xs font-bold tracking-wider hover:bg-[#C8A882]/10 transition-colors"
          >
            SEND A GIFT
          </Link>
        </div>
      </div>
    </section>
  );
}
