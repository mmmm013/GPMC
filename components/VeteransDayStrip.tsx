'use client';

import { useEffect, useState } from 'react';

/**
 * Veterans Day strip under the flagship header, on every page that uses it.
 * GD, 2026-11-02: "Mention Veterans Day. Give a free hug to veterans. ... Add banner."
 *
 * The free HUG is the Heroes offer already live on k-kut.com/heroes
 * (config/heroes-free-hugs.v1.json there: veterans send every HUG free, on their word).
 * Opens and closes in the browser: four weeks before 11 November, through the
 * end of the day in the westernmost US time zone. Same window as k-kut.com.
 */
export const FREE_HUG_FOR_HEROES = 'https://www.k-kut.com/heroes';

export default function VeteransDayStrip() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const now = Date.now();
    const year = new Date().getUTCFullYear();
    const day = Date.UTC(year, 10, 11);
    const close = Date.UTC(year, 10, 12, 10);
    setOpen(now >= day - 28 * 86400000 && now < close);
  }, []);

  if (!open) return null;
  return (
    <a
      href={FREE_HUG_FOR_HEROES}
      className="block w-full bg-gradient-to-r from-[#0a1e35] via-[#163a63] to-[#0a1e35] border-b border-sky-300/30 px-4 py-3 text-center text-sm font-bold text-sky-50 hover:text-white"
    >
      <span aria-hidden="true">🦅 </span>
      Veterans Day, November 11. Thank you for serving. Veterans send every HUG free.{' '}
      <span className="underline underline-offset-2 text-[#FFD54F]">Send yours</span>
    </a>
  );
}
