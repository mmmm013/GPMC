import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type CatalogLane = {
  id: 'ino-pix' | 'lt-pix';
  label: string;
  title: string;
};

const catalogLanes: CatalogLane[] = [
  {
    id: 'ino-pix',
    label: 'GPM IN/O-PIX',
    title: 'Approved IN/O-PIX records',
  },
  {
    id: 'lt-pix',
    label: 'GPM LT-PIX',
    title: 'Approved LT-PIX records',
  },
];

export const metadata: Metadata = {
  title: 'Shop Songs',
  description:
    'Browse the controlled G Putnam Music IN/O-PIX and LT-PIX retail catalog shell. Pricing and checkout remain held pending final approval.',
};

export default function SongsPage() {
  return (
    <main className="min-h-screen bg-[#100804] text-[#F7E7C8]">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-10 sm:py-16">
        <p className="text-sm font-black uppercase tracking-[0.34em] text-[#FFD36A]">
          G Putnam Music catalog
        </p>
        <h1 className="mt-5 max-w-5xl text-5xl font-black leading-[0.95] text-[#FFD36A] sm:text-7xl">
          Complete-song catalog
        </h1>
        <p className="mt-6 max-w-4xl text-xl font-bold leading-relaxed text-[#F7E7C8]/82">
          This controlled shell is reserved for approved GPM IN/O-PIX and LT-PIX records. No K-KUTs, iMeants, pricing, or checkout are included.
        </p>

        <div className="mt-8 rounded-2xl border border-[#FFD36A]/25 bg-[#201106] p-5 text-sm font-bold leading-7 text-[#F7E7C8]/72">
          The first public song set, public lane descriptions, retail download formats, prices, and customer-use license remain held for GD approval. Until then, this page presents the correct catalog structure without making a sales claim.
        </div>

        <div className="mt-10 grid gap-8">
          {catalogLanes.map((lane) => (
            <section
              key={lane.id}
              id={lane.id}
              className="scroll-mt-28 rounded-[2rem] border border-[#D4A017]/30 bg-[#201106] p-7 sm:p-10"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FFD36A]">
                    {lane.label}
                  </p>
                  <h2 className="mt-3 text-4xl font-black leading-tight text-[#F7E7C8]">
                    {lane.title}
                  </h2>
                </div>
                <span className="inline-flex w-fit rounded-full border border-[#FFD36A]/30 bg-[#FFD36A]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#FFD36A]">
                  Catalog connection held
                </span>
              </div>

              <div className="mt-8 rounded-[1.5rem] border border-dashed border-[#D4A017]/35 bg-black/20 p-7 text-center sm:p-10">
                <p className="text-xl font-black text-[#F7E7C8]">
                  No public records loaded in this implementation packet.
                </p>
                <p className="mx-auto mt-3 max-w-3xl text-sm font-bold leading-7 text-[#F7E7C8]/62">
                  Only records that pass the approved GPMC / KKr eligibility gate may appear here. The future song card will show approved artwork, title, artist, lane, preview, duration, download format, and a purchase control only after all retail locks are approved.
                </p>
              </div>
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-[2rem] border border-[#D4A017]/30 bg-[#201106] p-7 sm:p-10">
          <h2 className="text-3xl font-black text-[#FFD36A]">What remains separate</h2>
          <p className="mt-4 max-w-4xl text-base font-bold leading-8 text-[#F7E7C8]/72">
            K-KUT, HUG, TUG, and other derived music moments remain on K-KUT. Professional sync and commercial licensing remain in the Licensing lane. This page is only for complete G Putnam Music song records prepared for future retail download.
          </p>
        </section>
      </section>

      <Footer />
    </main>
  );
}
