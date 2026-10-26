import Link from 'next/link';
import RiffRunsBanner from '@/components/RiffRunsBanner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
          <a
            href="https://www.k-kut.com/motivation"
            className="rounded-full border-2 border-[#8B4513] px-10 py-5 text-xl font-black text-[#8B4513] hover:bg-[#8B4513] hover:text-white"
          >
            Send a HUG
          </a>
        </div>
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
