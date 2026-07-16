import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GlobalPlayer from '@/components/GlobalPlayer';

export default function WhoPage() {
  return (
    <main className="min-h-screen bg-[#FFF0F5] text-[#2C2418]">
      <Header />
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h1 className="mb-8 text-5xl font-black uppercase tracking-tighter text-[#8B4513] md:text-7xl">
          Who Is <br />
          <span className="text-[#D0A520]">G Putnam Music?</span>
        </h1>
        <p className="mb-12 font-serif text-xl italic leading-relaxed text-[#5D4037]/80">
          “Music is what feelings sound like.”
        </p>

        <div className="relative mx-auto mb-12 w-full max-w-md overflow-hidden rounded-2xl shadow-2xl">
          <div className="relative h-[480px] w-full">
            <Image
              src="/IMG_7429.JPG"
              alt="Michael Scherer in the studio"
              fill
              className="object-cover object-[center_20%]"
              priority
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1A1206]/80 to-transparent p-4">
            <p className="text-sm font-bold text-[#C8A882]">Michael Scherer</p>
            <p className="text-xs text-[#F5E6C8]/70">
              Producer &amp; Jazz Vocalist — Eclipse Studio
            </p>
          </div>
        </div>

        <div className="prose prose-lg mx-auto text-[#2C2418]">
          <p>
            G Putnam Music is a multi-genre music company centered on original songs, controlled catalog presentation, and rights-aware music use. Its catalog includes work connected to KLEIGH, Michael Scherer, Michael Clay, and other approved GPM creators and collaborators.
          </p>
          <p>
            Complete-song retail preparation belongs on G Putnam Music. Sendable K-KUT music moments remain on the separate K-KUT product domain.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="mb-6 text-3xl font-black uppercase tracking-tight text-[#8B4513]">
            Gallery
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative h-[280px] w-full overflow-hidden rounded-xl">
              <Image
                src="/IMG_7624.JPG"
                alt="Michael Scherer"
                fill
                className="object-cover"
                style={{ objectPosition: '30% center' }}
              />
            </div>
            <div className="relative h-[280px] w-full overflow-hidden rounded-xl">
              <Image
                src="/IMG_7720.JPG"
                alt="Michael Scherer"
                fill
                className="object-cover"
                style={{ objectPosition: '30% center' }}
              />
            </div>
            <div className="relative h-[280px] w-full overflow-hidden rounded-xl">
              <Image
                src="/assets/MC by Tree Looking Left.jpg"
                alt="Michael Scherer by tree"
                fill
                className="object-cover"
                style={{ objectPosition: 'center center' }}
              />
            </div>
            <div className="relative h-[280px] w-full overflow-hidden rounded-xl">
              <Image
                src="/assets/Front Pose.jpg"
                alt="Michael Scherer front pose"
                fill
                className="object-cover"
                style={{ objectPosition: 'center top' }}
              />
            </div>
          </div>
        </div>
      </section>
      <Footer />
      <GlobalPlayer />
    </main>
  );
}
