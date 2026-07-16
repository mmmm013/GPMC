import Header from '@/components/Header';
import Footer from '@/components/Footer';

const gallery = [
  { src: '/IMG_7429.JPG', alt: 'G Putnam Music studio portrait', position: '30% center', span: 'sm:col-span-2 sm:row-span-2' },
  { src: '/k-hero.jpg', alt: 'G Putnam Music artist portrait', position: 'center center', span: '' },
  { src: '/k-hero-alternate.JPG', alt: 'Alternate G Putnam Music artist portrait', position: 'center center', span: '' },
  { src: '/IMG_7624.JPG', alt: 'G Putnam Music studio image', position: '30% center', span: '' },
  { src: '/IMG_7720.JPG', alt: 'G Putnam Music producer portrait', position: '30% 70%', span: 'sm:col-span-2' },
  { src: '/assets/MC Agnst Stone Wall Knee Bent.jpg', alt: 'G Putnam Music outdoor artist portrait', position: 'center center', span: '' },
  { src: '/assets/MC by Tree Looking Left.jpg', alt: 'G Putnam Music outdoor portrait', position: 'center center', span: '' },
  { src: '/assets/Front Pose.jpg', alt: 'G Putnam Music artist portrait', position: 'center top', span: '' },
  { src: '/assets/MOON-1[32199].jpg', alt: 'KLEIGH moon artwork', position: 'center center', span: '' },
];

export default function WhoPage() {
  return (
    <main className="min-h-screen bg-[#100804] text-[#F7E7C8]">
      <Header />

      <section className="relative min-h-[620px] overflow-hidden border-b border-[#D4A017]/25">
        <div className="absolute inset-0 grid grid-cols-3">
          <img src="/k-hero.jpg" alt="" className="h-full w-full object-cover" />
          <img src="/IMG_7429.JPG" alt="" className="h-full w-full object-cover" style={{ objectPosition: '30% center' }} />
          <img src="/assets/MC Agnst Stone Wall Knee Bent.jpg" alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#100804]/96 via-[#100804]/66 to-[#100804]/32" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#100804] via-transparent to-black/20" />

        <div className="relative z-10 mx-auto flex min-h-[620px] max-w-7xl flex-col justify-end px-6 py-16 sm:px-10 sm:py-20">
          <p className="text-sm font-black uppercase tracking-[0.34em] text-[#FFD36A]">
            People + pictures
          </p>
          <h1 className="mt-5 max-w-5xl text-5xl font-black leading-[0.92] text-white sm:text-7xl lg:text-8xl">
            Music is made by people. Show them.
          </h1>
          <p className="mt-6 max-w-4xl text-lg font-bold leading-8 text-white/76 sm:text-xl">
            G Putnam Music is a human-created catalog, a working studio story, and a growing visual archive—not a faceless file list.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-10 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FFD36A]">
              Who is G Putnam Music?
            </p>
            <h2 className="mt-4 text-4xl font-black leading-tight text-white sm:text-6xl">
              Original songs, controlled presentation, and the people who made the work possible.
            </h2>
            <div className="mt-6 space-y-4 text-base font-bold leading-8 text-[#F7E7C8]/70">
              <p>
                G Putnam Music is a multi-genre music company centered on original songs, approved catalog identity, rights-aware use, and clear separation between complete songs and derived K-KUT products.
              </p>
              <p>
                The catalog includes approved work connected to <strong className="text-white">KLEIGH</strong>, Michael Scherer, Michael Clay, and other GPM creators and collaborators. Public presentation must always follow confirmed identity and rights authority.
              </p>
              <p>
                Complete-song retail preparation belongs on G Putnam Music. Sendable K-KUT music moments remain on the separate K-KUT domain.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="rounded-2xl border border-[#D4A017]/25 bg-[#201106] p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FFD36A]">KLEIGH</p>
                <p className="mt-2 text-sm font-bold leading-6 text-[#F7E7C8]/68">Vocal-song catalog and artist presentation remain a later controlled phase. KLEIGH is always uppercase.</p>
              </div>
              <div className="rounded-2xl border border-[#D4A017]/25 bg-[#201106] p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FFD36A]">GPM Visual Archive</p>
                <p className="mt-2 text-sm font-bold leading-6 text-[#F7E7C8]/68">Photos, artwork, studio images, and verified video should travel with the music rather than sit unused in storage.</p>
              </div>
            </div>
          </div>

          <div className="grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] sm:grid-cols-3">
            {gallery.map((asset) => (
              <figure
                key={asset.src}
                className={`group relative overflow-hidden rounded-2xl border border-[#D4A017]/25 bg-black ${asset.span}`}
              >
                <img
                  src={asset.src}
                  alt={asset.alt}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  style={{ objectPosition: asset.position }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-65" />
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#D4A017]/20 bg-[#201106] px-6 py-16 sm:px-10 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FFD36A]">Next visual layer</p>
            <h2 className="mt-4 text-4xl font-black leading-tight text-white sm:text-6xl">MOVs and videos need names, poster frames, and permission—not a blind autoplay loop.</h2>
            <p className="mt-5 max-w-4xl text-base font-bold leading-8 text-[#F7E7C8]/70">
              The repository previously supported a larger video inventory concept. Before any footage enters the public experience, each item should be normalized through a visual-media manifest with subject, title, duration, orientation, rights status, public-use status, poster image, and destination lane.
            </p>
          </div>
          <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] border border-[#D4A017]/30">
            <img src="/assets/MOON-1[32199].jpg" alt="KLEIGH moon artwork" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/15 to-transparent" />
            <p className="absolute bottom-7 left-7 right-7 text-sm font-black uppercase tracking-[0.22em] text-white">Artwork can become the poster frame</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
