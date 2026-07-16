import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const catalogLanes = [
  {
    id: 'ino-pix',
    label: 'GPM IN/O-PIX',
    title: 'Browse the IN/O-PIX lane',
    body: 'Approved G Putnam Music records classified in the IN/O-PIX catalog lane. Public lane wording remains held for GD approval.',
  },
  {
    id: 'lt-pix',
    label: 'GPM LT-PIX',
    title: 'Browse the LT-PIX lane',
    body: 'Approved G Putnam Music records classified in the LT-PIX catalog lane. Public lane wording remains held for GD approval.',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#100804] text-[#F7E7C8]">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10 sm:py-16">
        <div className="overflow-hidden rounded-[2rem] border border-[#D4A017]/35 bg-[#201106] shadow-2xl shadow-black/45">
          <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="p-7 sm:p-10 lg:p-14">
              <p className="text-sm font-black uppercase tracking-[0.34em] text-[#FFD36A]">
                G Putnam Music
              </p>
              <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.95] text-[#FFD36A] sm:text-7xl">
                Original songs. Ready to hear.
              </h1>
              <p className="mt-6 max-w-3xl text-xl font-bold leading-relaxed text-[#F7E7C8]/82">
                Listen to approved G Putnam Music songs and explore the controlled IN/O-PIX and LT-PIX catalog lanes.
              </p>
              <p className="mt-4 max-w-3xl text-base font-bold leading-7 text-[#F7E7C8]/62">
                Retail pricing, download formats, customer-use terms, checkout, and the first sellable song set remain held until GD approves the final catalog locks.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/songs"
                  className="inline-flex items-center justify-center rounded-full bg-[#FFD36A] px-7 py-4 text-base font-black uppercase tracking-wide text-[#201106] transition hover:bg-[#FFE7A3]"
                >
                  Browse Songs
                </Link>
                <Link
                  href="/commercial"
                  className="inline-flex items-center justify-center rounded-full border border-[#FFD36A]/45 px-7 py-4 text-base font-black uppercase tracking-wide text-[#FFD36A] transition hover:bg-[#FFD36A]/10"
                >
                  Commercial Licensing
                </Link>
              </div>
            </div>

            <div className="flex min-h-[420px] items-center justify-center border-t border-[#D4A017]/25 bg-[radial-gradient(circle_at_50%_35%,rgba(255,211,106,0.23),transparent_36%),radial-gradient(circle_at_70%_76%,rgba(212,160,23,0.17),transparent_34%)] p-8 lg:border-l lg:border-t-0">
              <div className="w-full max-w-md rounded-[2rem] border border-[#FFD36A]/30 bg-[#100804]/85 p-7 shadow-2xl">
                <p className="text-xs font-black uppercase tracking-[0.26em] text-[#FFD36A]">
                  Controlled retail preparation
                </p>
                <h2 className="mt-4 text-3xl font-black leading-tight text-[#F7E7C8]">
                  Approved songs only.
                </h2>
                <div className="mt-6 grid gap-3">
                  {[
                    'Canonical GPM catalog identity retained',
                    'IN/O-PIX and LT-PIX classifications retained',
                    'No K-KUTs or iMeants sold here',
                    'No price or checkout until approved',
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-[#D4A017]/20 bg-black/25 px-4 py-3 text-sm font-black text-[#F7E7C8]/82"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-10 grid gap-5 lg:grid-cols-2">
          {catalogLanes.map((lane) => (
            <article
              key={lane.id}
              id={lane.id}
              className="rounded-[2rem] border border-[#D4A017]/30 bg-[#201106] p-7 sm:p-10"
            >
              <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FFD36A]">
                {lane.label}
              </p>
              <h2 className="mt-4 text-4xl font-black leading-tight text-[#F7E7C8]">
                {lane.title}
              </h2>
              <p className="mt-5 text-base font-bold leading-8 text-[#F7E7C8]/72">
                {lane.body}
              </p>
              <Link
                href={`/songs#${lane.id}`}
                className="mt-7 inline-flex items-center justify-center rounded-full border border-[#FFD36A]/45 px-6 py-3 text-sm font-black uppercase tracking-wide text-[#FFD36A] transition hover:bg-[#FFD36A]/10"
              >
                Open lane shell
              </Link>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-[2rem] border border-[#D4A017]/30 bg-[#201106] p-7 sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FFD36A]">
            Separate product path
          </p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-4xl font-black leading-tight text-[#F7E7C8]">
                Looking for a sendable music moment?
              </h2>
              <p className="mt-4 max-w-3xl text-base font-bold leading-8 text-[#F7E7C8]/72">
                K-KUT remains the separate home for K-KUT, HUG, TUG, and derived music-moment products. Complete GPM songs stay here.
              </p>
            </div>
            <a
              href="https://www.k-kut.com/browse"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-[#FFD36A] px-7 py-4 text-base font-black uppercase tracking-wide text-[#201106] transition hover:bg-[#FFE7A3]"
            >
              Visit K-KUT ↗
            </a>
          </div>
        </section>
      </section>

      <Footer />
    </main>
  );
}
