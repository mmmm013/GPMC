'use client';

import { useEffect, useState } from 'react';

/* After a $1.99 song is paid for, Stripe brings the buyer back to the screen
   they bought it on with ?dl=<receipt>. The song downloads right here.
   GD, 2026-10-14: "DO NOT make users GO there ... User stays put." */
export default function DownloadReturn() {
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    const dl = new URLSearchParams(window.location.search).get('dl') ?? '';
    if (!/^cs_[A-Za-z0-9_]{10,200}$/.test(dl)) return;
    const url = `https://www.k-kut.com/api/song-download?session_id=${encodeURIComponent(dl)}`;
    setHref(url);
    window.location.assign(url);
  }, []);

  if (!href) return null;
  return (
    <div className="mb-5 rounded-2xl border border-[#8B4513]/30 bg-[#FFF8E1] p-4 text-[#2C2418]">
      <p className="text-base font-black">Thank you — your song is downloading.</p>
      <p className="mt-1 text-sm">
        If it didn&apos;t start,{' '}
        <a href={href} className="font-black text-[#8B4513] underline">
          tap here to download it
        </a>
        . Keep this page; the link works again any time.
      </p>
    </div>
  );
}
