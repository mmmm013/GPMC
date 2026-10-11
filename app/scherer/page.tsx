'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SongPlayer from '@/components/listen/SongPlayer';
import { Heart, Music2, MapPin } from 'lucide-react';

type Track = { id: string; artist: string; title: string; src: string };

/* Michael Scherer's instrumentals. The list and its signed stream addresses
   come from C-OP (k-kut.com/api/scherer); this page never reads a database.
   GD, 2026-10-11: "YES, REBUILD SCHERER PAGE". The page before this one is
   kept beside it as page.before-c-op.tsx. */
export default function SchererPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('https://www.k-kut.com/api/scherer', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : { tracks: [] }))
      .then((body: { tracks?: Track[] }) => {
        if (!cancelled) setTracks(body.tracks ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen flex flex-col text-white bg-black">
      <Header />

      {/* ═══════════════════════════════════════════
          KEZ PLZ — LOVE & RECOVERY CAMPAIGN HERO
      ═══════════════════════════════════════════ */}
      <section className="relative w-full bg-gradient-to-b from-[#1a0505] via-[#2d0a0a] to-black border-b border-red-900/30 py-16 px-4 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-800/10 blur-3xl rounded-full" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-red-600/20 border border-red-500/30 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-red-300">
            <Heart className="w-3 h-3 fill-red-400 text-red-400" />
            KEZ PLZ — A Campaign of Love &amp; Recovery
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
            Michael Scherer<br />
            <span className="text-red-400">Needs Us Now.</span>
          </h1>

          {/* Personal story */}
          <p className="text-lg text-white/80 leading-relaxed max-w-2xl mx-auto">
            Michael is a truly, deeply soulful person — a devout believer — and one hell of a
            performer. His wife and three gorgeous daughters are fighting alongside him through
            overwhelming, over-burdening medical bills that have made even lunches a struggle.
            This great, wonderful family needs our help.
          </p>

          {/* Cities */}
          <div className="flex flex-wrap justify-center gap-3 text-xs font-bold text-red-300/80 uppercase tracking-widest">
            {['Decatur, IL', 'Hollywood, CA', 'Michigan', 'Nashville, TN'].map((city) => (
              <span key={city} className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {city}
              </span>
            ))}
          </div>

          {/* Publishing note */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white/70 leading-relaxed max-w-xl mx-auto">
            <Music2 className="w-4 h-4 text-amber-400 mx-auto mb-2" />
            <p>
              G Putnam is donating most of the publishing on Michael&apos;s originals, and
              <strong className="text-white"> all of both sides</strong> on the great hits
              they&apos;ve co-written together. Every stream, every purchase, every KEZ — it goes
              to Michael&apos;s family directly. He is dynamite to work with. Truly a JOY.
            </p>
          </div>

          {/* KEZ framing */}
          <p className="text-sm font-black uppercase tracking-[0.2em] text-red-300">
            🎹 KEZ = Keys for a Keyboard — Every key pressed keeps Michael playing.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <a
              href="/gift"
              className="bg-red-600 text-white px-10 py-4 rounded-full font-black uppercase tracking-wider text-base hover:bg-red-500 transition-colors shadow-2xl shadow-red-900/60"
            >
              🎹 Become a KEZ — Help Michael
            </a>
            <a
              href="#catalog"
              className="bg-white/10 border border-white/20 text-white px-10 py-4 rounded-full font-black uppercase tracking-wider text-base hover:bg-white/15 transition-colors"
            >
              Stream His Music ↓
            </a>
          </div>
        </div>
      </section>

      <section id="catalog" className="w-full bg-[#FFF0F5] px-4 py-12 text-[#2C2418]">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-4xl font-black uppercase tracking-tight text-[#8B4513] md:text-5xl">Michael Scherer</h2>
          <p className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-[#5D4037]">
            {loading ? 'Loading…' : `${tracks.length} instrumentals · tap to play`}
          </p>
          <div className="mt-6">
            {tracks.length ? (
              <SongPlayer tracks={tracks} />
            ) : !loading ? (
              <p className="rounded-2xl border border-[#8B4513]/20 bg-white p-6">
                The music is loading slowly. Please refresh in a moment.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          KEZ PLZ FOOTER CALL TO ACTION
      ═══════════════════════════════════════════ */}
      <section className="w-full bg-gradient-to-r from-red-950 to-zinc-900 border-t border-red-800/30 py-14 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <Heart className="w-8 h-8 text-red-400 fill-red-400 mx-auto" />
          <p className="text-xs font-black uppercase tracking-[0.25em] text-red-400">
            KEZ PLZ — Keys for a Keyboard
          </p>
          <h2 className="text-3xl font-black text-white">
            A Devout Man. A Beautiful Family.<br />A Real Crisis.
          </h2>
          <p className="text-base text-white/70 leading-relaxed max-w-2xl mx-auto">
            Michael Scherer — performer in Decatur IL, Hollywood CA, Michigan, and Nashville TN —
            is one of the most soulful people in this business. His wife and three gorgeous daughters
            are fighting through crushing medical debt. They need help with the basics right now.
          </p>
          <p className="text-sm text-red-300/80 font-bold max-w-xl mx-auto">
            G Putnam has donated most of the publishing on Michael&apos;s originals and all of both
            sides on their co-written hits. Every stream and every KEZ goes straight to this family.
          </p>
          <p className="text-xs text-white/40 font-bold uppercase tracking-widest">
            🎹 Every Key Pressed Keeps Michael Playing
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <a
              href="/gift"
              className="bg-red-600 text-white px-10 py-4 rounded-full font-black uppercase tracking-wider hover:bg-red-500 transition-colors shadow-xl shadow-red-900/50"
            >
              🎹 Become a KEZ
            </a>
            <a
              href="/join"
              className="bg-white/10 border border-white/20 text-white px-10 py-4 rounded-full font-black uppercase tracking-wider hover:bg-white/20 transition-colors"
            >
              Join the KEZ Crew →
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
