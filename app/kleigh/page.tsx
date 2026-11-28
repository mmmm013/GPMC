import Header from '@/components/Header';
import Footer from '@/components/Footer';
import KleighT20Grid from '@/components/KleighT20Grid';
import { Mic2, BookOpen, Heart } from 'lucide-react';

export const metadata = {
  title: 'KLEIGH | G Putnam Music',
  description: 'KLEIGH — The Legacy Collection. Become a KUB and stream the vault.',
};

// BEHIND THE MUSIC: Vocalist stories from his own words
const TRACK_STORIES = [
  {
    title: 'Beautiful World (Album)',
    type: 'Album',
    quote: 'It was one of the most intense 10 days of my life.',
    story: `The album Beautiful World was recorded over an extraordinary 10-day session in Tari, North New South Wales. He traveled four hours from Apollo Bay to Bendigo, then another 16 hours by car to reach the studio. Working with an incredibly supportive producer, the sessions were so intense that he lost 13 kilograms during the recording \u2014 pushed hard in the studio, drenched in sweat, drinking five or six liters of water a day. The result is an album treasured by many.`,
  },
  {
    title: 'Devil Get Away from Me',
    type: 'Album',
    quote: 'This is a turning point and I\u2019m not going to put up with your crap anymore.',
    story: `Written during a major turning point while living in a suburb of Bendigo, Victoria. After leaving a six-year job and battling seven years of fear, paranoia, and illness, he set up a small home studio \u2014 black curtains, a modest PC, guitar, and piano. Devil Get Away from Me became the pilot album that led to the Beautiful World recording sessions in Tari. It is the sound of standing up, getting strong, and refusing to be held back any longer.`,
  },
  {
    title: 'A Better Me',
    type: 'Track',
    quote: 'It didn\u2019t click with me at first, but then with a bit more effort, it just turned.',
    story: `A Better Me almost didn\u2019t happen. He wasn\u2019t happy with the initial version \u2014 no guitars, something missing. Then friend and collaborator Bill stepped in at the new studio (the Purple Room at mum\u2019s place), came up with a guitar riff on the spot, and over a couple of hours laid down tracks that transformed the song. He reproduced the whole thing, re-sang it, and A Better Me came alive. It\u2019s about the universal pursuit of becoming a better self.`,
  },
  {
    title: 'Bounce Back',
    type: 'Track',
    quote: 'Sometimes you just got to ignore the haters.',
    story: `Born from years of dealing with jealousy and a lack of support from those closest to him, Bounce Back is his anthem of resilience. To this day, external listeners have resonated deeply with his music while those nearest have held back. The song is a lesson in self-belief \u2014 if you believe in what you\u2019ve got, that\u2019s a massive step forward, even when people deliberately choose not to give your work a chance.`,
  },
  {
    title: 'Beautiful World (Title Track)',
    type: 'Track',
    quote: 'My cat tore up the lyrics while I was recording.',
    story: `Written in Apollo Bay, Victoria, inside a two-story Western Red Cedar home overlooking the ocean. He had just recovered from bronchitis when the song came together \u2014 starting as nothing more than piano and vocal. The cat famously shredded the handwritten lyrics mid-session, but the pages were pieced back together for the pilot vocal. When a friend heard the demo, he shouted that it was amazing. Recorded later in Tari for the album, the title track captures a moment in a truly beautiful place.`,
  },
];

export default function KleighPage() {
  return (
    <main className="min-h-screen bg-[#FFFDF5] text-[#2C241B]">
      <Header />

      {/* ══════════════════════════════════════════════
          HERO — Artist KLEIGH
      ══════════════════════════════════════════════ */}
      <section className="relative pt-20 pb-20 bg-gradient-to-br from-[#D2B48C] to-[#C8A882] text-[#FFFDF5]">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-[#FFFDF5]/10 blur-3xl rounded-full" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-[#2C241B]/75 mb-4">
            G Putnam Music, LLC Presents
          </p>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#FFFDF5]/10 backdrop-blur-md mb-6 border border-[#FFFDF5]/20">
            <Mic2 size={40} />
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">Kleigh</h1>
          <p className="text-xl font-serif italic opacity-80">The Legacy Collection</p>
          <p className="max-w-2xl mx-auto mt-6 text-sm md:text-base leading-relaxed text-[#FFFDF5]/88">
            KLEIGH is the Tier 2 product brand. G Putnam Music remains the parent label, and this
            collection exists to preserve the voice, catalog, and story while inviting supporters
            to become KUBs.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/gift"
              className="inline-flex items-center justify-center rounded-full bg-[#2C241B] px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-[#FFFDF5] transition hover:bg-[#1E1812]"
            >
              🐨 Become a KUB
            </a>
            <a
              href="#audio-vault"
              className="inline-flex items-center justify-center rounded-full border border-[#FFFDF5]/40 px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-[#FFFDF5] transition hover:bg-[#FFFDF5]/10"
            >
              Enter The Vault ↓
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TIER STRUCTURE CARDS
      ══════════════════════════════════════════════ */}
      <section className="py-10 bg-[#F4E6CF] border-y border-[#C8A882]/25">
        <div className="max-w-4xl mx-auto px-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#C8A882]/25 bg-[#FFF9EE] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#8F714F] mb-2">Tier 1</p>
            <p className="text-lg font-bold uppercase">G Putnam Music, LLC</p>
            <p className="mt-2 text-sm leading-relaxed text-[#5C4A37]">
              Corporate identity, catalog stewardship, and platform governance.
            </p>
          </div>
          <div className="rounded-2xl border border-[#C8A882]/25 bg-[#FFF9EE] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#8F714F] mb-2">Tier 2</p>
            <p className="text-lg font-bold uppercase">KLEIGH</p>
            <p className="mt-2 text-sm leading-relaxed text-[#5C4A37]">
              The public-facing product brand for legacy vocal storytelling and curated listening.
            </p>
          </div>
          <div className="rounded-2xl border border-[#C8A882]/25 bg-[#FFF9EE] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#8F714F] mb-2">Support Action</p>
            <p className="text-lg font-bold uppercase">KUBs 🐨</p>
            <p className="mt-2 text-sm leading-relaxed text-[#5C4A37]">
              Sponsorship tied to the koala promo. Support the artist directly — real impact.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TOP 20 STREAMING ACTIVITIES — KLEIGH PIX ONLY
      ══════════════════════════════════════════════ */}
      <section id="audio-vault" className="bg-[#0d0a06] py-2">
        <div className="max-w-7xl mx-auto px-2">
          <div className="pt-8 pb-2 px-4">
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#C8A882]/40 mb-1">KLEIGH Vault</p>
            <h2 className="text-lg font-bold text-[#C8A882] tracking-wide">
              Play The Vault — Pick Your Mood
            </h2>
            <p className="text-xs text-[#C8A882]/40 mt-1">
              Tap any activity. KLEIGH PIX stream exclusively. When a mood&apos;s tracks finish,
              the player advances to the next category automatically.
            </p>
          </div>
          <KleighT20Grid />
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          BEHIND THE MUSIC
      ══════════════════════════════════════════════ */}
      <section className="py-16 bg-[#2C241B] text-[#FFFDF5]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-10">
            <BookOpen size={28} className="text-[#C8A882]" />
            <h2 className="text-2xl font-bold uppercase tracking-widest text-[#C8A882]">Behind the Music</h2>
          </div>
          <p className="text-[#FFFDF5]/60 text-sm mb-12 max-w-2xl">
            In his own words — the stories, struggles, and turning points behind the vocal tracks.
          </p>

          <div className="space-y-8">
            {TRACK_STORIES.map((item, i) => (
              <div
                key={i}
                className="border border-[#C8A882]/20 rounded-xl p-6 md:p-8 hover:border-[#C8A882]/40 transition"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#C8A882]/10 text-[#C8A882] border border-[#C8A882]/20">
                    {item.type}
                  </span>
                  <h3 className="text-lg md:text-xl font-bold text-[#FFFDF5]">{item.title}</h3>
                </div>
                <blockquote className="text-[#C8A882] font-serif italic text-base md:text-lg mb-4 pl-4 border-l-2 border-[#C8A882]/30">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <p className="text-[#FFFDF5]/70 text-sm leading-relaxed">
                  {item.story}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          KUB FOOTER CTA
      ══════════════════════════════════════════════ */}
      <section className="w-full bg-gradient-to-r from-[#2C241B] to-[#1a1207] border-t border-[#C8A882]/20 py-14 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <Heart className="w-7 h-7 text-[#C8A882] fill-[#C8A882]/30 mx-auto" />
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#C8A882]">
            🐨 KUB — KLEIGH&apos;s Koala Crew
          </p>
          <h2 className="text-2xl font-black text-[#FFFDF5]">Support The Artist. Become a KUB.</h2>
          <p className="text-sm text-[#FFFDF5]/60 leading-relaxed max-w-xl mx-auto">
            Every KUB sponsorship goes directly to KLEIGH&apos;s legacy, catalog preservation, and
            creative development. Your support keeps this voice in the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <a
              href="/gift"
              className="bg-[#C8A882] text-[#2C241B] px-10 py-4 rounded-full font-black uppercase tracking-wider hover:bg-[#D4B490] transition-colors shadow-xl"
            >
              🐨 Become a KUB
            </a>
            <a
              href="/join"
              className="bg-white/5 border border-[#C8A882]/30 text-[#C8A882] px-10 py-4 rounded-full font-black uppercase tracking-wider hover:bg-white/10 transition-colors"
            >
              Join the Community →
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
