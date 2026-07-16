import Link from 'next/link';

const footerLinks = [
  { href: '/songs', label: 'Shop Songs' },
  { href: '/songs#ino-pix', label: 'IN/O-PIX' },
  { href: '/songs#lt-pix', label: 'LT-PIX' },
  { href: '/commercial', label: 'Licensing' },
  { href: '/who', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#5C3A1E]/30 bg-[#1A100E]">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-wrap justify-center gap-2">
          {footerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-[44px] items-center px-3 text-sm text-[#C4A882]/75 transition-colors hover:text-[#FFD54F]"
            >
              {item.label}
            </Link>
          ))}
          <a
            href="https://www.k-kut.com/browse"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] items-center px-3 text-sm font-bold text-[#FFD54F] transition-colors hover:text-[#FFE082]"
          >
            Send a K-KUT ↗
          </a>
        </div>

        <div className="mx-auto mt-6 max-w-3xl text-center">
          <p className="text-sm font-bold text-[#F5E6C8]/70">
            Original songs, controlled catalog presentation, and professional licensing from G Putnam Music.
          </p>
          <p className="mt-3 text-xs text-[#C4A882]/45">
            Retail prices, download formats, customer-use terms, and checkout remain held until final GD approval.
          </p>
        </div>

        <p className="mt-7 text-center text-xs text-[#C4A882]/40">
          G Putnam Music, LLC. All Rights Reserved.
        </p>
        <p className="mt-2 text-center text-xs tracking-widest text-[#C4A882]/50">
          <span className="inline-block rounded border border-[#C4A882]/30 px-2 py-0.5">
            ah<sup>c</sup>
          </span>{' '}
          — All Human Created
        </p>
      </div>
    </footer>
  );
}
