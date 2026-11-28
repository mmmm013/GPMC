import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GlobalPlayer from '@/components/GlobalPlayer';

export default function WhoPage() {
  return (
    <main className="min-h-screen bg-[#FFF0F5] text-[#2C2418]">
      <Header />
      <section className="py-20 max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-black uppercase text-[#8B4513] mb-8 tracking-tighter">
          Who Is <br/><span className="text-[#D0A520]">G Putnam Music?</span>
        </h1>
        <p className="text-xl font-serif italic text-[#5D4037]/80 mb-12 leading-relaxed">
          "Music is what feelings sound like."
        </p>
        {/* Michael Scherer Studio Portrait */}
        <div className="relative w-full max-w-md mx-auto mb-12 rounded-2xl overflow-hidden shadow-2xl">
          <div className="relative w-full h-[480px]">
            <Image
              src="/IMG_7429.JPG"
              alt="Michael Scherer in the studio"
              fill
                            className="object-cover object-[center_20%]"
              priority
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1a1206]/80 to-transparent p-4">
            <p className="text-[#C8A882] text-sm font-bold">Michael Scherer</p>
            <p className="text-[#f5e6c8]/70 text-xs">Producer & Jazz Vocalist — Eclipse Studio</p>
          </div>
        </div>
        <div className="prose prose-lg mx-auto text-[#2C2418]">
          <p>
            G Putnam Music is a multi-genre production house dedicated to the art of the stream.
            From the legacy vocals of Kleigh to the smooth jazz of Michael Scherer, we build soundscapes
            that match your moment.
          </p>
        </div>

                  {/* Artist Gallery */}
          <div className="mt-12">
            <h2 className="text-3xl font-black uppercase text-[#8B4513] mb-6 tracking-tight">Gallery</h2>
            <div className="grid grid-cols-2 gap-4">
                            <div className="relative w-full h-[280px] rounded-xl overflow-hidden">
                <Image src="/IMG_7624.JPG" alt="Michael Scherer" fill className="object-cover" style={{ objectPosition: '30% center' }} />
              </div>
                            <div className="relative w-full h-[280px] rounded-xl overflow-hidden">
                <Image src="/IMG_7720.JPG" alt="Michael Scherer" fill className="object-cover" style={{ objectPosition: '30% center' }} />
              </div>
                            <div className="relative w-full h-[280px] rounded-xl overflow-hidden">
                <Image src="/assets/MC by Tree Looking Left.jpg" alt="Michael Scherer by tree" fill className="object-cover" style={{ objectPosition: 'center center' }} />
              </div>
                            <div className="relative w-full h-[280px] rounded-xl overflow-hidden">
                <Image src="/assets/Front Pose.jpg" alt="Michael Scherer front pose" fill className="object-cover" style={{ objectPosition: 'center top' }} />
              </div>
                          </div>
          </div>
      </section>
      <Footer />
      <GlobalPlayer />
    </main>
  );
}
