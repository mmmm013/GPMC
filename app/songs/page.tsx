import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const catalogLanes = [
  {
    id: 'ino-pix',
    label: 'GPM IN/O-PIX',
    title: 'Approved IN/O-PIX records',
    image: '/assets/hero.jpg',
    position: 'center center',
  },
  {
    id: 'lt-pix',
    label: 'GPM LT-PIX',
    title: 'Approved LT-PIX records',
    image: '/k-hero-alternate.JPG',
    position: 'center center',
  },
];

export const metadata: Metadata = {
  title: 'Songs | G Putnam Music',
  description:
    'Browse the controlled G Putnam Music IN/O-PIX and LT-PIX complete-song catalog shell. Pricing and checkout remain held pending final approval.',
};

export default function SongsPage() {
  return (
    <main className="min-h-screen bg-[#100804] text-[#F7E7C8]">
      <Header />

      <section className="relative min-h-[520px] overflow-hidden border-b border-[#D4A017]/25">
        <div className="absolute inset-0 grid grid-cols-2">
          <img
            src="/k-hero.jpg"
            alt=""
            className="h-full w-full object-cover"
            style={{ objectPosition: 'center center' }}
          />
          <img
            src="/IMG_7429.JPG"
            alt=""
            className="h-full w-full object-cover"
            style={{ objectPosition: '30% center' }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#100804]/96 via-[#100804]/78 to-[#100804]/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#100804] via-transparent to-black/20" />

        <div className="relative z-10 mx-auto flex min-h-[520px] max-w-7xl flex-col justify-end px-6 py-14 sm:px-10 sm:py-16">
          <p className="text-sm font-black uppercase tracking-[0.34em] text-[#FFD36A]">
            G Putnam Music catalog
          </p>
          <h1 className="mt-5 max-w-5xl text-5xl font-black leading-[0.92] text-white sm:text-7xl lg:text-8xl">
            Complete songs deserve a complete stage.
          </h1>
          <p className="mt-6 max-w-4xl text-lg font-bold leading-8 text-white/76 sm:text-xl">
            This controlled shell is reserved for approved GPM IN/O-PIX and LT-PIX records. No K-KUTs, iMeants, pricing, or checkout are included.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-10 sm:py-20">
        <div className="rounded-[2rem] border border-[#FFD36A]/25 bg-[#201106] p-6 text-base font-bold leading-8 text-[#F7E7C8]/72 sm:p-8">
          The first public song set, public lane descriptions, retail download formats, prices, and customer-use license remain held for GD approval. This page now presents the correct visual structure without making a sales claim.
        </div>

        <div className="mt-10 grid gap-7">
          {catalogLanes.map((lane) => (
            <section
              key={lane.id}
              id={lane.id}
              className="scroll-mt-28 overflow-hidden rounded-[2rem] border border-[#D4A017]/30 bg-[#201106] shadow-2xl shadow-black/25"
            >
              <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
                <div className="relative min-h-[360px] lg:min-h-[470px]">
                  <img
                    src={lane.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ objectPosition: lane.position }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#201106]" />
                </div>

                <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FFD36A]">
                        {lane.label}
                      </p>
                      <h2 className="mt-3 text-4xl font-black leading-tight text-white sm:text-5xl">
                        {lane.title}
                      </h2>
                    </div>
                    <span className="inline-flex w-fit rounded-full border border-[#FFD36A]/30 bg-[#FFD36A]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#FFD36A]">
                      Catalog connection held
                    </span>
                  </div>

                  <div className="mt-8 rounded-[1.5rem] border border-dashed border-[#D4A017]/35 bg-black/20 p-7 sm:p-9">
                    <p className="text-xl font-black text-white">
                      No public records loaded in this implementation packet.
                    </p>
                    <p className="mt-3 text-sm font-bold leading-7 text-[#F7E7C8]/62">
                      Only records that pass the approved GPMC / KKr eligibility gate may appear here. Future song cards can show approved artwork, title, artist, lane, preview, duration, download format, and a purchase control only after every retail lock is approved.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>

        <section className="mt-10 grid gap-5 lg:grid-cols-[1fr_0.72fr]">
          <div className="rounded-[2rem] border border-[#D4A017]/30 bg-[#201106] p-7 sm:p-10">
            <h2 className="text-3xl font-black text-[#FFD36A]">What remains separate</h2>
            <p className="mt-4 max-w-4xl text-base font-bold leading-8 text-[#F7E7C8]/72">
              K-KUT, HUG, TUG, and other derived music moments remain on K-KUT. Professional sync and commercial licensing remain in the Licensing lane. This page is only for complete G Putnam Music song records prepared for future retail download.
            </p>
          </div>
          <div className="relative min-h-[280px] overflow-hidden rounded-[2rem] border border-[#D4A017]/30">
            <img
              src="/assets/MOON-1[32199].jpg"
              alt="KLEIGH moon artwork"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/12 to-transparent" />
            <p className="absolute bottom-6 left-6 right-6 text-sm font-black uppercase tracking-[0.22em] text-white">
              Artwork belongs beside the music
            </p>
          </div>
        </section>
      </section>

      <Footer />
    </main>
  );
}
