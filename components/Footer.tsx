'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type StiTemplateResponse = {
  slots?: Record<string, unknown>;
};

const asText = (value: unknown, fallback: string): string => {
  if (typeof value === 'string' && value.trim()) return value;
  if (value && typeof value === 'object' && 'value' in value) {
    const candidate = (value as { value?: unknown }).value;
    if (typeof candidate === 'string' && candidate.trim()) return candidate;
  }
  return fallback;
};

const asMenuLabel = (slot: unknown, key: string, fallback: string): string => {
  if (!slot || typeof slot !== 'object') return fallback;
  const value = (slot as Record<string, unknown>)[key];
  return asText(value, fallback);
};

export default function Footer() {
  const [isKleighDomain, setIsKleighDomain] = useState(false);
  const [templateSlots, setTemplateSlots] = useState<Record<string, unknown>>({});

  useEffect(() => {
    setIsKleighDomain(window.location.hostname.includes('2kleigh.com'));

    const host = window.location.hostname;
    fetch(`/api/sti-template?host=${encodeURIComponent(host)}`)
      .then((r) => r.json())
      .then((data: StiTemplateResponse) => {
        setTemplateSlots(data.slots ?? {});
      })
      .catch(() => {
        setTemplateSlots({});
      });
  }, []);

  const menuHeroes = asMenuLabel(templateSlots.menu_item_heroes, 'heroes', 'Heroes');
  const menuGift = asText(templateSlots.menu_item_sponsorships, 'Gift');

  return (
    <footer className="w-full bg-[#1a100e] border-t border-[#5C3A1E]/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isKleighDomain && (
          <div className="mb-6 text-center">
            <Link
              href="/gift"
              className="inline-flex items-center rounded-full border border-[#D4A017]/40 bg-[#D4A017]/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#D4A017] hover:bg-[#D4A017]/20"
            >
              Send a HUG
            </Link>
          </div>
        )}

        {/* Footer Links Row - MOBILE FIX: 44px touch targets */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <Link href="/who" className="text-sm text-[#C4A882]/70 hover:text-[#D4A017] transition-colors min-h-[44px] flex items-center px-3">Who</Link>
          <Link href="/heroes" className="text-sm text-[#C4A882]/70 hover:text-[#D4A017] transition-colors min-h-[44px] flex items-center px-3">{menuHeroes}</Link>
          <Link href="/gift" className="text-sm text-[#C4A882]/70 hover:text-[#D4A017] transition-colors min-h-[44px] flex items-center px-3">{menuGift}</Link>
          <Link href="/games" className="text-sm text-[#C4A882]/70 hover:text-[#D4A017] transition-colors min-h-[44px] flex items-center px-3">Games</Link>
          {/* Flagship only: GD, 2026-10-28, "KLEIGH on KLEIGH". */}
          {!isKleighDomain && (
            <>
              <Link href="/videos" className="text-sm text-[#C4A882]/70 hover:text-[#D4A017] transition-colors min-h-[44px] flex items-center px-3">Videos</Link>
              <Link href="/sad" className="text-sm text-[#C4A882]/70 hover:text-[#D4A017] transition-colors min-h-[44px] flex items-center px-3">Sad Playlists</Link>
            </>
          )}
        </div>
        {/* Copyright */}
        <p className="text-center text-xs text-[#C4A882]/40">
          G Putnam Music, LLC. All Rights Reserved.
        </p>
        {isKleighDomain && (
          <p className="text-center text-[10px] text-[#C4A882]/35 mt-1 tracking-wider uppercase">
            KLEIGH is a G Putnam Music product brand
          </p>
        )}
        <p className="text-center text-xs text-[#C4A882]/50 mt-2 tracking-widest">
          <span className="inline-block border border-[#C4A882]/30 rounded px-2 py-0.5">ah<sup>c</sup></span> &mdash; All Human Created
        </p>
        <p className="text-center text-[10px] text-[#C4A882]/30 mt-1">One-Stop Sync &bull; MIP Owned &bull; Broadcast Ready</p>
      </div>
    </footer>
  );
}
