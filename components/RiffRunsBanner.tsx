'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

/* GD ticked it, 2026-10-25: a "Sunday Riff Runs" banner on the home page, shown
   Thursday to Sunday by the visitor's own clock, linking to /riff-runs. Riff
   Runs start Sundays at 9 AM, listener-local (lib/riffRuns/schedule.ts). */
export default function RiffRunsBanner() {
  const [day, setDay] = useState<number | null>(null);
  useEffect(() => setDay(new Date().getDay()), []);
  if (day === null || !(day === 0 || day >= 4)) return null;
  return (
    <Link
      href="/riff-runs"
      className="mt-8 block rounded-2xl bg-[#2A1506] px-6 py-5 text-left text-white shadow-lg hover:bg-[#3A2010]"
    >
      <span className="block text-sm font-bold uppercase tracking-widest text-[#FFD54F]">
        {day === 0 ? 'Today' : 'This Sunday'} · 9 AM, your time
      </span>
      <span className="mt-1 block text-2xl font-black">Sunday Riff Runs</span>
      <span className="mt-4 inline-block rounded-full bg-[#FFD54F] px-6 py-2 text-lg font-black text-[#2A1506]">
        Listen →
      </span>
    </Link>
  );
}
