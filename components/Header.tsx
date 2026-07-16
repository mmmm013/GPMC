'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
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

const retailLinks = [
  { href: '/songs', label: 'Shop Songs' },
  { href: '/songs#ino-pix', label: 'IN/O-PIX' },
  { href: '/songs#lt-pix', label: 'LT-PIX' },
  { href: '/commercial', label: 'Licensing' },
  { href: '/who', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isKleighDomain, setIsKleighDomain] = useState(false);
  const [templateSlots, setTemplateSlots] = useState<Record<string, unknown>>({});

  useEffect(() => {
    const host = window.location.hostname;
    setIsKleighDomain(host.includes('2kleigh.com'));

    fetch(`/api/sti-template?host=${encodeURIComponent(host)}`)
      .then((response) => response.json())
      .then((data: StiTemplateResponse) => {
        setTemplateSlots(data.slots ?? {});
      })
      .catch(() => {
        setTemplateSlots({});
      });
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const companyName = asText(templateSlots.ui_company_name, 'G Putnam Music');

  return (
    <nav className="relative z-50 w-full border-b border-[#5C3A1E]/40 bg-[#2A1506] shadow-lg">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 pt-[env(safe-area-inset-top)]">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-[#C8A882]/60 shadow-md">
            <Image
              src={stiLogo}
              alt="G Putnam Music logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-tight tracking-wide text-[#C8A882] transition-colors group-hover:text-[#FFD54F]">
              {isKleighDomain ? 'KLEIGH' : companyName}
            </span>
            <span className="text-[10px] uppercase leading-tight tracking-widest text-[#C8A882]/70">
              {isKleighDomain ? 'A G Putnam Music artist' : 'Original Song Catalog'}
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-5 md:flex">
          {retailLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-bold tracking-wide text-[#F5E6C8]/80 transition-colors hover:text-[#FFD54F]"
            >
              {item.label}
            </Link>
          ))}
          <a
            href="https://www.k-kut.com/browse"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#FFD54F] px-4 py-2 text-sm font-black text-[#2A1506] transition-colors hover:bg-[#FFE082]"
          >
            Send a K-KUT ↗
          </a>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1.5 p-2 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className={`h-0.5 w-6 bg-[#C8A882] transition-transform ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`h-0.5 w-6 bg-[#C8A882] transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`h-0.5 w-6 bg-[#C8A882] transition-transform ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </div>

      {menuOpen && (
        <div className="flex flex-col gap-1 border-t border-[#5C3A1E]/40 bg-[#2A1506] px-4 py-4 md:hidden">
          {retailLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="flex min-h-[44px] items-center text-sm font-bold tracking-wide text-[#F5E6C8]/85 hover:text-[#FFD54F]"
            >
              {item.label}
            </Link>
          ))}
          <a
            href="https://www.k-kut.com/browse"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="mt-2 rounded-full bg-[#FFD54F] px-4 py-3 text-center text-sm font-black text-[#2A1506]"
          >
            Send a K-KUT ↗
          </a>
        </div>
      )}
    </nav>
  );
}
