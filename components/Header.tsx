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
  { href: '/songs', label: 'Songs' },
  { href: '/songs#ino-pix', label: 'IN/O-PIX' },
  { href: '/songs#lt-pix', label: 'LT-PIX' },
  { href: '/commercial', label: 'Licensing' },
  { href: '/who', label: 'People + Pictures' },
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
    <nav className="sticky top-0 z-50 w-full border-b border-[#FFD36A]/15 bg-[#140a04]/88 shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#FFD36A]/45 to-transparent" />
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 pt-[env(safe-area-inset-top)] sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-[#FFD36A]/45 shadow-lg shadow-black/35 transition group-hover:border-[#FFD36A]">
            <Image
              src={stiLogo}
              alt="G Putnam Music logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black leading-tight tracking-wide text-[#F5E6C8] transition-colors group-hover:text-[#FFD54F] sm:text-lg">
              {isKleighDomain ? 'KLEIGH' : companyName}
            </span>
            <span className="text-[9px] font-bold uppercase leading-tight tracking-[0.2em] text-[#C8A882]/70 sm:text-[10px]">
              {isKleighDomain ? 'A G Putnam Music artist' : 'Songs · People · Pictures'}
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-4 lg:flex">
          {retailLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-2 py-2 text-xs font-black uppercase tracking-[0.1em] text-[#F5E6C8]/72 transition hover:bg-white/5 hover:text-[#FFD54F] xl:text-sm"
            >
              {item.label}
            </Link>
          ))}
          <a
            href="https://www.k-kut.com/browse"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#FFD54F] px-5 py-2.5 text-xs font-black uppercase tracking-[0.1em] text-[#2A1506] shadow-lg shadow-black/25 transition hover:bg-[#FFE082] xl:text-sm"
          >
            Send a K-KUT ↗
          </a>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/5 p-2 lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className={`h-0.5 w-6 bg-[#FFD54F] transition-transform ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`h-0.5 w-6 bg-[#FFD54F] transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`h-0.5 w-6 bg-[#FFD54F] transition-transform ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </div>

      {menuOpen && (
        <div className="max-h-[calc(100vh-68px)] overflow-y-auto border-t border-[#FFD36A]/15 bg-[#140a04]/98 px-4 py-5 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {retailLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex min-h-[50px] items-center rounded-xl px-4 text-sm font-black uppercase tracking-[0.12em] text-[#F5E6C8]/85 transition hover:bg-white/5 hover:text-[#FFD54F]"
              >
                {item.label}
              </Link>
            ))}
            <a
              href="https://www.k-kut.com/browse"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="mt-3 rounded-full bg-[#FFD54F] px-4 py-4 text-center text-sm font-black uppercase tracking-[0.12em] text-[#2A1506]"
            >
              Send a K-KUT ↗
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
