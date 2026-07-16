import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GpmVisualShowcase from '@/components/GpmVisualShowcase';

const catalogLanes = [
  {
    id: 'ino-pix',
    label: 'GPM IN/O-PIX',
    title: 'The opening world',
    image: '/assets/hero.jpg',
    position: 'center center',
    body: 'Approved G Putnam Music records classified in the IN/O-PIX catalog lane. Exact public lane wording remains held for GD approval.',
  },
  {
    id: 'lt-pix',
    label: 'GPM LT-PIX',
    title: 'The complete lyric-and-vocal world',
    image: '/assets/MOON-1[32199].jpg',
    position: 'center center',
    body: 'Approved G Putnam Music records classified in the LT-PIX catalog lane. Exact public lane wording remains held for GD approval.',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#100804] text-[#F7E7C8]">
      <Header />
      <GpmVisualShowcase />

      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.32em] text-[#FFD36A]">
              Complete-song catalog
            </p>
            <h2 className="mt-4 text-5xl font-black leading-[0.94] text-white sm:text-7xl">
              Original songs. Ready to hear.
            </h2>
          </div>
          <div className="rounded-[2rem] border border-[#D4A017]/25 bg-[#201106] p-6 sm:p-8">
            <p className="text-lg font-bold leading-8 text-[#F7E7C8]/78">
              This is the future retail home for approved G Putnam Music song downloads. The catalog structure is ready; public song records, pricing, formats, customer-use terms, and checkout remain held until GD locks them.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {catalogLanes.map((lane) => (
            <article
              key={lane.id}
              id={lane.id}
              className="group relative min-h-[470px] overflow-hidden rounded-[2rem] border border-[#D4A017]/30 bg-[#201106] shadow-2xl shadow-black/30"
            >
              <img
                src={lane.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition duration-1000 group-hover:scale-105"
                style={{ objectPosition: lane.position }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#100804] via-[#100804]/72 to-black/12" />
              <div className="relative flex min-h-[470px] flex-col justify-end p-7 sm:p-10">
                <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FFD36A]">
                  {lane.label}
                </p>
                <h3 className="mt-3 max-w-xl text-4xl font-black leading-tight text-white sm:text-5xl">
                  {lane.title}
                </h3>
                <p className="mt-4 max-w-xl text-base font-bold leading-7 text-white/72">
                  {lane.body}
                </p>
                <Link
                  href={`/songs#${lane.id}`}
                  className="mt-7 inline-flex w-fit items-center justify-center rounded-full border border-[#FFD36A]/55 bg-black/25 px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#FFD36A] backdrop-blur-sm transition hover:bg-[#FFD36A] hover:text-[#201106]"
                >
                  Enter this catalog lane
                </Link>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-10 overflow-hidden rounded-[2rem] border border-[#D4A017]/30 bg-[#201106]">
          <div className="grid lg:grid-cols-[0.86fr_1.14fr]">
            <div className="relative min-h-[360px]">
              <img
                src="/IMG_7720.JPG"
                alt="G Putnam Music producer portrait"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: '30% 70%' }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#201106] lg:block" />
            </div>
            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
              <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FFD36A]">
                Motion belongs here
              </p>
              <h2 className="mt-4 text-4xl font-black leading-tight text-white sm:text-6xl">
                Film the work. Frame the people. Let the music lead.
              </h2>
              <p className="mt-5 text-base font-bold leading-8 text-[#F7E7C8]/72">
                A verified MOV and video rail will occupy this stage after each media file has a confirmed title, subject, rights status, poster frame, and public-use approval. Until then, the site uses proven GPM photography and never autoplays unknown footage.
              </p>
              <Link
                href="/who"
                className="mt-7 inline-flex w-fit items-center justify-center rounded-full bg-[#FFD36A] px-7 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#201106] transition hover:bg-[#FFE7A3]"
              >
                Open the visual story
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[2rem] border border-[#D4A017]/30 bg-[#201106] p-7 sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FFD36A]">
            Separate product path
          </p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-4xl font-black leading-tight text-white">
                Want to send a selected music moment?
              </h2>
              <p className="mt-4 max-w-3xl text-base font-bold leading-8 text-[#F7E7C8]/72">
                K-KUT remains the separate home for K-KUT, HUG, TUG, and derived music-moment products. Complete GPM songs and their visual stories stay here.
              </p>
            </div>
            <a
              href="https://www.k-kut.com/browse"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-[#FFD36A] px-7 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#201106] transition hover:bg-[#FFE7A3]"
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
