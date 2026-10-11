import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

/**
 * HOME. GD, 2026-10-11, "do A": point the home page at Listen with one line.
 * The previous home page (an internal explainer) is kept, unrouted, in
 * app/page.before-listen-home.tsx.
 */
export default function HomePage() {
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
      </section>
      <Footer />
    </main>
  );
}
