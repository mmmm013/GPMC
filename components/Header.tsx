'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import stiLogo from '@/images/gpm_logo copy 2.png';

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

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [templateSlots, setTemplateSlots] = useState<Record<string, unknown>>({});

  useEffect(() => {
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

  // MOBILE FIX: Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const companyName = asText(templateSlots.ui_company_name, 'G Putnam Music');
  const menuMip1 = asText(templateSlots.menu_item_mip1, 'MIP1');
  const menuHeroes = asMenuLabel(templateSlots.menu_item_heroes, 'heroes', 'Heroes');
  const menuUru = asMenuLabel(templateSlots.menu_item_uru, 'uru', 'URU');
  const menuTT = asMenuLabel(templateSlots.menu_item_tells_tale, 'tt', 'TT');
  const menuMsj = asText(templateSlots.menu_item_msj, 'MSJ');
  const menuJoin = asText(templateSlots.menu_item_sponsorships, 'JOIN');
  const checkoutHref = '/api/checkout-attribution?utm_source=header&utm_medium=site&utm_campaign=cash_sprint_apr2026&utm_content=explore_kkuts';

  return (
    <nav className="w-full bg-[#2A1506] shadow-lg border-b border-[#5C3A1E]/40 relative z-50">
      {/* MOBILE FIX: safe-area-inset-top for notch devices */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between px-4 py-2 pt-[env(safe-area-inset-top)]">
        {/* LEFT: GPM Identity - Logo + Business Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#C8A882]/60 shadow-md">
            <Image
              src={stiLogo}
              alt="G Putnam Music Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-[#C8A882] tracking-wide leading-tight group-hover:text-[#D07CC8] transition-colors">{companyName}</span>
            <span className="text-[10px] text-[#C8A882]/70 uppercase tracking-widest leading-tight">
              The One Stop Song Shop
            </span>
          </div>
        </Link>

        {/* CENTER: Spacer */}
        <div className="flex-1" />

        {/* RIGHT: Desktop Menu */}
        <div className="hidden md:flex items-center gap-5">
          <a
            href={checkoutHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm bg-[#FFD54F] text-[#2A1506] px-4 py-1.5 rounded-full font-bold text-center hover:bg-[#FFE082] transition-colors tracking-wide"
          >
            BUY KK NOW
          </a>
          <Link href="/mip" className="text-sm text-[#FFD54F] hover:text-[#FFE082] font-bold tracking-wide transition-colors">{menuMip1}</Link>
          <Link href="/heroes" className="text-sm text-[#C4A882] hover:text-[#C8A882] font-medium tracking-wide transition-colors">{menuHeroes}</Link>
          <Link href="/uru" className="text-sm text-[#C4A882] hover:text-[#C8A882] font-medium tracking-wide transition-colors">{menuUru}</Link>
          <Link href="/tt" className="text-sm text-[#C4A882] hover:text-[#C8A882] font-medium tracking-wide transition-colors">{menuTT}</Link>
          <Link href="/scherer" className="text-sm text-[#C4A882] hover:text-[#C8A882] font-medium tracking-wide transition-colors">{menuMsj}</Link>
          <Link href="/commercial" className="text-sm text-[#C4A882] hover:text-[#C8A882] font-medium tracking-wide transition-colors">GPMCC</Link>
          <Link href="/join" className="text-sm bg-[#C8A882] text-[#2A1506] px-4 py-1.5 rounded-full font-bold text-center hover:bg-[#D07CC8] transition-colors tracking-wide">{menuJoin}</Link>
        </div>

        {/* Mobile Hamburger - MOBILE FIX: 44px+ touch target */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col items-center justify-center min-w-[44px] min-h-[44px] gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <span className={`w-6 h-0.5 bg-[#C8A882] transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`w-6 h-0.5 bg-[#C8A882] transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`w-6 h-0.5 bg-[#C8A882] transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu Dropdown - MOBILE FIX: 44px+ touch targets, body scroll lock */}
      {menuOpen && (
        <div className="md:hidden bg-[#2A1506] border-t border-[#5C3A1E]/40 px-4 py-4 flex flex-col gap-1">
          <Link href="/mip" onClick={() => setMenuOpen(false)} className="text-sm text-[#FFD54F] hover:text-[#FFE082] font-bold tracking-wide min-h-[44px] flex items-center">{menuMip1}</Link>
          <Link href="/heroes" onClick={() => setMenuOpen(false)} className="text-sm text-[#C4A882] hover:text-[#C8A882] font-medium tracking-wide min-h-[44px] flex items-center">{menuHeroes}</Link>
          <Link href="/uru" onClick={() => setMenuOpen(false)} className="text-sm text-[#C4A882] hover:text-[#C8A882] font-medium tracking-wide min-h-[44px] flex items-center">{menuUru}</Link>
          <Link href="/tt" onClick={() => setMenuOpen(false)} className="text-sm text-[#C4A882] hover:text-[#C8A882] font-medium tracking-wide min-h-[44px] flex items-center">{menuTT}</Link>
          <Link href="/scherer" onClick={() => setMenuOpen(false)} className="text-sm text-[#C4A882] hover:text-[#C8A882] font-medium tracking-wide min-h-[44px] flex items-center">{menuMsj}</Link>
          <Link href="/commercial" onClick={() => setMenuOpen(false)} className="text-sm text-[#C4A882] hover:text-[#C8A882] font-medium tracking-wide min-h-[44px] flex items-center">GPMCC</Link>
          <Link href="/join" onClick={() => setMenuOpen(false)} className="text-sm bg-[#C8A882] text-[#2A1506] px-4 py-3 rounded-full font-bold text-center hover:bg-[#D07CC8] transition-colors tracking-wide mt-2">{menuJoin}</Link>
          <a
            href={checkoutHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="text-sm bg-[#FFD54F] text-[#2A1506] px-4 py-3 rounded-full font-bold text-center hover:bg-[#FFE082] transition-colors tracking-wide"
          >
            BUY KK NOW
          </a>
        </div>
      )}
    </nav>
  );
}
