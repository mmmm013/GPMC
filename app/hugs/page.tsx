import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HugsPage() {
  return (
    <main className="min-h-screen bg-[#100804] text-[#F7E7C8]">
      <Header />

      <section className="relative min-h-[calc(100vh-70px)] overflow-hidden">
        <img
          src="/k-hero-alternate.JPG"
          alt="G Putnam Music artist portrait"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: 'center center' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#100804]/94 via-[#100804]/65 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#100804] via-transparent to-black/25" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-70px)] max-w-7xl items-end px-6 py-16 sm:px-10 sm:py-24">
          <div className="max-w-3xl rounded-[2rem] border border-[#FFD36A]/25 bg-black/38 p-7 shadow-2xl shadow-black/45 backdrop-blur-md sm:p-12">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FFD36A]">
              Separate K-KUT product lane
            </p>
            <h1 className="mt-5 text-5xl font-black leading-[0.94] text-white sm:text-7xl">
              HUGs live on K-KUT.
            </h1>
            <p className="mt-6 max-w-3xl text-lg font-bold leading-8 text-white/76">
              G Putnam Music is the complete-song catalog. K-KUT remains the focused home for sendable K-KUT, HUG, and TUG music moments.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="https://www.k-kut.com/browse"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#FFD36A] px-7 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#201106] shadow-xl transition hover:bg-[#FFE7A3]"
              >
                Open K-KUT ↗
              </a>
              <a
                href="/songs"
                className="inline-flex items-center justify-center rounded-full border border-white/35 bg-black/25 px-7 py-4 text-sm font-black uppercase tracking-[0.14em] text-white backdrop-blur-sm transition hover:border-[#FFD36A] hover:text-[#FFD36A]"
              >
                Browse complete songs
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
