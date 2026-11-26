import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FreeSendStrip from '@/components/FreeSendStrip';

/**
 * gputnammusic.com/free -- the short address for the business cards and their QR code.
 * GD, 2026-11-26: "All my business cards say gputnammusic.com, so I've really got to take advantage of
 * that"; then "make the short gputnammusic.com/free link and QR code". Opens straight on the free HUG/TUG
 * send (its list and dates live on k-kut.com). When that is closed the shop link below still works, so a
 * printed card never lands on an empty page.
 */
export const metadata: Metadata = {
  title: 'Send a HUG or a TUG, free | G Putnam Music',
  description: 'Hear a moment of a real song, then send it to anyone, free. No sign-in, nothing kept.',
  alternates: { canonical: 'https://www.gputnammusic.com/free' },
  openGraph: {
    title: 'Send a HUG or a TUG, free.',
    description: 'Hear a moment of a real song, then send it to anyone. No sign-in, nothing kept.',
    url: 'https://www.gputnammusic.com/free',
    siteName: 'G Putnam Music',
    type: 'website',
  },
};

export default function FreePage() {
  return (
    <main className="min-h-screen bg-[#FFF0F5] text-[#2C2418]">
      <Header />
      <section className="mx-auto max-w-3xl px-6 py-12">
        <FreeSendStrip />
        <a
          href="https://www.k-kut.com/motivation"
          className="mt-10 block rounded-3xl bg-[#3B1E12] px-7 py-6 text-left text-white shadow-xl hover:bg-[#4A2617]"
        >
          <span className="block text-2xl font-black leading-tight">See every HUG, TUG and BUG →</span>
          <span className="mt-2 block text-base text-white/85">A single sung word $1.99 · a line $4.99 · a whole verse or chorus $7.99</span>
        </a>
      </section>
      <Footer />
    </main>
  );
}
