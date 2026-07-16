import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HugsPage() {
  return (
    <main className="min-h-screen bg-[#100804] text-[#F7E7C8]">
      <Header />

      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-10 sm:py-24">
        <div className="rounded-[2rem] border border-[#D4A017]/30 bg-[#201106] p-8 text-center shadow-2xl shadow-black/40 sm:p-12">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FFD36A]">
            Separate K-KUT product lane
          </p>
          <h1 className="mt-5 text-4xl font-black leading-tight text-[#F7E7C8] sm:text-6xl">
            HUGs live on K-KUT.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg font-bold leading-8 text-[#F7E7C8]/72">
            G Putnam Music is the complete-song catalog. K-KUT remains the focused home for sendable K-KUT, HUG, and TUG music moments.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="https://www.k-kut.com/browse"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-[#FFD36A] px-7 py-4 text-base font-black uppercase tracking-wide text-[#201106] transition hover:bg-[#FFE7A3]"
            >
              Open K-KUT ↗
            </a>
            <a
              href="/songs"
              className="inline-flex items-center justify-center rounded-full border border-[#FFD36A]/45 px-7 py-4 text-base font-black uppercase tracking-wide text-[#FFD36A] transition hover:bg-[#FFD36A]/10"
            >
              Browse Complete Songs
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
