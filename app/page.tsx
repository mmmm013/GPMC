import Link from 'next/link';
import RiffRunsBanner from '@/components/RiffRunsBanner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FreeSendStrip from '@/components/FreeSendStrip';

/**
 * HOME. GD, 2026-10-11, "do A": point the home page at Listen with one line.
 * The previous home page (an internal explainer) is kept, unrouted, in
 * app/page.before-listen-home.tsx.
 */
// GD, 2026-10-21, "Both": a Halloween banner pointing at the free games.
// It drops itself after Halloween.
const HALLOWEEN_ENDS = Date.parse('2026-11-01T12:00:00Z');
export const revalidate = 3600;

export default function HomePage() {
  const showHalloween = Date.now() < HALLOWEEN_ENDS;
  return (
    <main className="min-h-screen bg-[#FFF0F5] text-[#2C2418]">
      <Header />
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-4xl font-black leading-tight text-[#8B4513] md:text-6xl">
          Songs by G Putnam Music. Tap to listen.
        </h1>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/listen"
            className="rounded-full bg-[#FFD54F] px-10 py-5 text-xl font-black text-[#2A1506] shadow-lg hover:bg-[#FFE082]"
          >
            ▶ Listen
          </Link>
        </div>
        {/*
          GD, 2026-11-13: "we need to get a link, a very opulent link, on the Gputnam Music site on the
          landing page, alerting people to the opportunity to send a sentiment ... people are going to
          Gputnam Music and you don't even see anything about MEANTs." Wording approved; "Replace it":
          this card takes the place of the small outlined "Send a HUG" button that used to sit beside
          Listen. Prices are the three live tiers (k-kut config/payment-links.json). The card goes to the
          one page that takes money.
        */}
        <a
          href="https://www.k-kut.com/motivation"
          className="mt-12 block rounded-3xl bg-[#3B1E12] px-7 py-8 text-left text-white shadow-2xl ring-1 ring-[#FFD54F]/40 hover:bg-[#4A2617]"
        >
          <span className="block text-sm font-black uppercase tracking-[0.25em] text-[#FFD54F]">
            New · SentiMEANTs
          </span>
          <span className="mt-2 block text-3xl font-black leading-tight md:text-4xl">
            Send a feeling, not a card.
          </span>
          <span className="mt-4 block text-lg leading-relaxed text-white/90">
            A moment of a real song, chosen for exactly what you mean, sent privately to one person. They
            tap. They hear it. No app, no sign-in, nothing to download.
          </span>
          <span className="mt-4 block text-base font-bold text-[#FFE082]">
            A single sung word $1.99 · a line $4.99 · a whole verse or chorus $7.99
          </span>
          <span className="mt-6 inline-block rounded-full bg-[#FFD54F] px-8 py-3 text-xl font-black text-[#2A1506] shadow-lg">
            Send one now →
          </span>
        </a>
        {/* GD, 2026-11-26: a free HUG or TUG to send, use and lose. Shows only while k-kut.com says it is open. */}
        <FreeSendStrip />
        <RiffRunsBanner />
        {/* GD, 2026-10-23: "Games must be SUB-level." The games are reached from the footer, not from home. */}
        {showHalloween && (
          <a
            href="https://www.k-kut.com/halloween-classroom"
            className="mt-12 block rounded-2xl bg-[#2A1B3D] px-6 py-5 text-left text-white shadow-lg hover:bg-[#3A2652]"
          >
            <span className="block text-sm font-bold uppercase tracking-widest text-[#F4A340]">
              🎃 Halloween
            </span>
            <span className="mt-1 block text-2xl font-black">The Cemetery Stomp</span>
            <span className="mt-1 block text-lg">Two free Halloween games for kids:</span>
            <span className="mt-2 block text-base leading-relaxed text-white/90">
              🎃 81 silly creature moves to act out
              <br />
              🎃 A word hunt where every word is sung
              <br />
              🎃 Ages 4 and up · No sign-in · Nothing to install
            </span>
            <span className="mt-4 inline-block rounded-full bg-[#F4A340] px-6 py-2 text-lg font-black text-[#2A1506]">
              Play free →
            </span>
          </a>
        )}
      </section>
      <Footer />
    </main>
  );
}
