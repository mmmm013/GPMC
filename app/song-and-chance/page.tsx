import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GlobalPlayer from '@/components/GlobalPlayer';
import { Music2, PenLine, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Song & Chance | G Putnam Music',
  description:
    'Gregory D Putnam writes the words. Michael Scherer takes the chances. Original songs from the G Putnam Music catalogue.',
};

/**
 * SONG & CHANCE — the duo.
 *
 * GD named it himself, 2026-10-01: "Song & Chance?" — and it beat the five I
 * offered, because it rides "song and dance" and so needs no explaining, and
 * because "chance" is the truer word for what a jazz player does. The changes
 * are the chart. The chance is the playing.
 *
 * WHY THIS PAGE EXISTS AND WHY IT LOOKS LIKE THIS
 *
 * DOMAIN_STRATEGY.lock sets a CONTROL RULE: a domain may not launch until it
 * declares a user type, an intent, an entry action and an exit routing. GD
 * approved all four on 2026-10-01:
 *
 *   USER TYPE      someone who heard the name — a listener, a venue, a sync
 *                  supervisor, a player who wants in
 *   INTENT         artist brand. Find out who Song & Chance are, and hear them
 *   ENTRY ACTION   listen
 *   EXIT ROUTING   gputnammusic.com to buy the song (PIX retail)
 *                  k-kut.com to send a piece of one
 *
 * So this is an ENTRY POINT into the existing GPMx system, not a parallel one.
 * No new database, no duplicate inventory — the strategy forbids both.
 *
 * WHAT SONG & CHANCE IS, EXACTLY
 *
 * GD, 2026-10-01: "we merely look like a band but we do our own music & music
 * style. Michael is Jazz, mostly. I am FMs." And then, correcting me when I
 * swung too far the other way: "we have collaborated on several FMs. I am
 * speaking generally."
 *
 * So both things are true and the page has to hold both. Two artists with
 * separate catalogues and separate styles — Scherer jazz, Putnam songs — AND a
 * real body of work they made together. My first draft implied Scherer plays
 * what Putnam writes, which was wrong. My second said "not one band", which
 * was wrong the other way and erased the records they actually share.
 *
 * The name carries it: Song AND Chance is two nouns side by side. Song is his
 * half. Chance is Scherer's. The ampersand is where they meet.
 *
 * It is deliberately spare. There is no catalogue under this name yet, and a
 * page that pretends otherwise is worse than one that does not. A holding page
 * works precisely because it does not pretend.
 *
 * The colour: midnight blue with the house gold. GD, 2026-10-01: "Let's leave
 * brown and develop stunning blue." The gold stays because it is the GPMx
 * header and footer this page sits between, and because under the colour law
 * amber means action and value — here, the two ways out.
 */
export default function SongAndChancePage() {
  return (
    <main className="min-h-screen bg-[#070d1a] text-[#F5e6c8]">
      <Header />

      {/* The name */}
      <section className="relative overflow-hidden px-6 pt-28 pb-24 text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 50% at 50% 18%, rgba(59,130,246,0.22), transparent 70%),' +
              'radial-gradient(45% 40% at 72% 60%, rgba(255,213,79,0.10), transparent 70%)',
          }}
        />
        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="mb-8 inline-flex items-center justify-center gap-4">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#FFD54F]/50 text-[#FFD54F]">
              <PenLine size={24} />
            </span>
            <span className="text-2xl font-light text-[#7DB3FF]">&amp;</span>
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#7DB3FF]/50 text-[#7DB3FF]">
              <Music2 size={24} />
            </span>
          </div>

          <h1 className="text-5xl font-black uppercase tracking-tight text-white sm:text-7xl">
            Song <span className="text-[#7DB3FF]">&amp;</span> Chance
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-[#C8A882]">
            Two artists, each with his own music and his own style — and the
            songs we have made together.
          </p>
          <p className="mt-4 text-base text-[#C8A882]/80">
            Michael Scherer plays jazz. Gregory D Putnam writes songs.
          </p>
        </div>
      </section>

      {/* What the two of them are */}
      <section className="px-6 pb-20">
        <div className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2">
          <article className="rounded-2xl border border-[#FFD54F]/20 bg-[#0d1628] p-7">
            <PenLine size={20} className="text-[#FFD54F]" />
            <h2 className="mt-4 text-xl font-bold text-white">Gregory D Putnam</h2>
            <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-[#FFD54F]">
              The song
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[#C8A882]">
              Songs. Lyrics and the melodies that carry them, cut as finished
              recordings — written to say the thing a person cannot say
              themselves.
            </p>
          </article>

          <article className="rounded-2xl border border-[#7DB3FF]/20 bg-[#0d1628] p-7">
            <Music2 size={20} className="text-[#7DB3FF]" />
            <h2 className="mt-4 text-xl font-bold text-white">Michael Scherer</h2>
            <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-[#7DB3FF]">
              The chance
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[#C8A882]">
              Jazz, mostly. Playing whose work has carried television across the
              country — and a line taken live, with no net under it.
            </p>
          </article>
        </div>
      </section>

      {/* The two ways out — the exit routing the control rule requires */}
      <section className="border-t border-[#FFD54F]/10 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-[#C8A882]">
            Hear the catalogue
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <a
              href="https://www.gputnammusic.com"
              className="group flex items-center justify-between rounded-xl border border-[#FFD54F]/30 bg-[#0d1628] px-6 py-5 no-underline transition hover:border-[#FFD54F]"
            >
              <span>
                <span className="block font-bold text-white">Buy a song</span>
                <span className="mt-1 block text-sm text-[#C8A882]">
                  The full recordings, to keep
                </span>
              </span>
              <ArrowRight
                size={18}
                className="shrink-0 text-[#FFD54F] transition group-hover:translate-x-1"
              />
            </a>

            <a
              href="https://www.k-kut.com"
              className="group flex items-center justify-between rounded-xl border border-[#7DB3FF]/30 bg-[#0d1628] px-6 py-5 no-underline transition hover:border-[#7DB3FF]"
            >
              <span>
                <span className="block font-bold text-white">Send a piece of one</span>
                <span className="mt-1 block text-sm text-[#C8A882]">
                  One line, sent to one person
                </span>
              </span>
              <ArrowRight
                size={18}
                className="shrink-0 text-[#7DB3FF] transition group-hover:translate-x-1"
              />
            </a>
          </div>

          <p className="mt-10 text-sm leading-relaxed text-[#C8A882]">
            Bookings, licensing and anything else —{' '}
            <a
              href="mailto:reachus@gputnammusic.com"
              className="font-semibold text-[#FFD54F] underline-offset-4 hover:underline"
            >
              reachus@gputnammusic.com
            </a>
          </p>

          <p className="mt-10 text-xs text-[#C8A882]/60">
            Song &amp; Chance is an imprint of G Putnam Music, LLC.
          </p>
        </div>
      </section>

      <Footer />
      <GlobalPlayer />
    </main>
  );
}
