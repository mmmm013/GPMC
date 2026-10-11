'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BraveEaglePromo from '@/components/BraveEaglePromo';

// BRANDING CONSTANTS
const COLORS = {
  AMBER: '#FFBF00',
  TAN: '#D2B48C',
  WHEAT: '#F5DEB3',
};

const HERO_PILLARS = [
  {
    id: 'military-marvels',
    title: 'MILITARY MARVELS ⚡',
    subtitle: 'Active Duty, Veterans, Reserves, and National Guard',
    borderColor: COLORS.AMBER,
    text: 'Dedicated to the US military for steadfastly protecting ALL Americans and our borders!',
  },
  {
    id: 'medical-angels',
    title: 'ER / ICU / ONCOLOGY ANGELS 👼',
    subtitle: 'Frontline Medical and Trauma Recovery Titans',
    borderColor: COLORS.TAN,
    text: 'For those serving in the high-intensity theater of care and recovery.',
  },
  {
    id: 'sovereign-mentors',
    title: 'SOVEREIGN MENTORS 🍎',
    subtitle: 'Teachers & Educators (KFS Silo C)',
    borderColor: COLORS.WHEAT,
    text: 'Guiding the next generation through the KFS Awesome Squad rhythm.',
  },
];

// GRANDPA'S STORY — the founding example
const GRANDPA_STORY = {
  name: "Grandpa's Story",
  hero: 'G. Putnam Sr.',
  category: 'MILITARY MARVELS ⚡',
  quote: '"He never talked about what he did. He just did what needed to be done."',
  body: `Our Grandpa served quietly and completely. A man of few words and enormous action, he answered
the call without fanfare, without fuss, and without asking for anything in return. He came home
the same way he left — steady, humble, and ready to get back to work.

He built a family, built a legacy, and never once asked for recognition. But we remember. We always
will. This platform — this whole music catalog — carries his spirit forward. Every song is a small
monument to people like him: those who served so others could simply live.

G Putnam Music is named in his memory. The MIP1 stream is his stream. Every Hero we recognize here
walks in his footsteps.`,
  pillars: ['Active Duty', 'Veteran'],
};

export default function HeroesPage() {
  const [form, setForm] = useState({ name: '', hero: '', category: '', story: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Future: POST to Supabase stories table
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Header />
      <BraveEaglePromo
        links={[
          { href: '/mip', label: 'MIP1 Recognition Form' },
          { href: '/gift', label: 'Gift Support' },
        ]}
      />
      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* PAGE HEADER */}
        <p className="mb-2 text-sm tracking-[0.25em] text-amber-400 uppercase">
          One-Stop Original Sync & Streaming OS — MIP1 Priority Stream
        </p>
        <h1 className="text-5xl font-extrabold mb-3 tracking-tighter">
          HERO RECOGNITION
        </h1>
        <p className="mb-12 text-lg opacity-70 uppercase tracking-widest">
          We honor those who serve. We share their stories.
        </p>

        {/* GRANDPA'S STORY — FEATURED EXAMPLE */}
        <div className="mb-16 border-2 border-amber-400/60 rounded-2xl p-8 bg-zinc-900 shadow-2xl relative overflow-hidden">
          <div className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest text-amber-400 border border-amber-400/30 rounded-full px-3 py-1">
            Featured Story
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400 mb-2">
            {GRANDPA_STORY.category}
          </p>
          <h2 className="text-3xl font-black mb-1">{GRANDPA_STORY.name}</h2>
          <p className="text-sm font-semibold opacity-60 mb-4 uppercase tracking-widest">
            {GRANDPA_STORY.hero} · {GRANDPA_STORY.pillars.join(' · ')}
          </p>
          <p className="text-xl italic text-amber-300 mb-6 leading-relaxed">{GRANDPA_STORY.quote}</p>
          <div className="text-base leading-relaxed opacity-85 whitespace-pre-line">{GRANDPA_STORY.body}</div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/mip">
              <button className="px-6 py-2 border border-amber-400 text-amber-400 font-bold hover:bg-amber-400 hover:text-black transition-colors uppercase text-sm tracking-widest">
                MIP1 Recognition Form
              </button>
            </Link>
          </div>
        </div>

        {/* HERO PILLARS */}
        <h2 className="text-2xl font-black uppercase tracking-widest mb-6 text-amber-400">Hero Categories</h2>
        <div className="grid gap-6 mb-16">
          {HERO_PILLARS.map((pillar) => (
            <div
              key={pillar.id}
              className="border-l-8 p-6 bg-zinc-900 shadow-xl transition-all hover:scale-[1.01]"
              style={{ borderLeftColor: pillar.borderColor }}
            >
              <h3 className="text-xl font-bold mb-1">{pillar.title}</h3>
              <p className="text-xs font-semibold opacity-60 mb-3 uppercase tracking-widest">
                {pillar.subtitle}
              </p>
              <p className="text-base leading-relaxed opacity-90">{pillar.text}</p>
            </div>
          ))}
        </div>

        {/* SHARE YOUR HERO STORY FORM */}
        <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-700 shadow-2xl">
          <h2 className="text-2xl font-black uppercase tracking-widest mb-2">Share a Hero Story</h2>
          <p className="text-sm opacity-60 mb-6">
            Honor someone who served. Your story can inspire others and live in your personal GPM Brand Space.
          </p>

          {submitted ? (
            <div className="text-center py-8">
              <p className="text-2xl font-black text-amber-400 mb-2">Thank You. ⭐</p>
              <p className="opacity-70 mb-6">Your Hero story has been received. We review every submission with care.</p>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: '', hero: '', category: '', story: '' }); }}
                className="px-6 py-2 border border-amber-400 text-amber-400 font-bold hover:bg-amber-400 hover:text-black transition-colors uppercase text-sm"
              >
                Share Another Story
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Your Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name (or 'Anonymous')"
                    className="w-full bg-black/50 border border-zinc-700 p-3 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Hero&apos;s Name</label>
                  <input
                    required
                    value={form.hero}
                    onChange={(e) => setForm({ ...form, hero: e.target.value })}
                    placeholder="Who are you honoring?"
                    className="w-full bg-black/50 border border-zinc-700 p-3 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Hero Category</label>
                <select
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-black/50 border border-zinc-700 p-3 rounded-lg text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="">Select a category...</option>
                  <option value="military">Military Marvels — Active Duty / Veteran</option>
                  <option value="medical">ER / ICU / Oncology Angel</option>
                  <option value="educator">Sovereign Mentor — Teacher / Educator</option>
                  <option value="other">Other Hero</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Their Story</label>
                <textarea
                  required
                  rows={6}
                  value={form.story}
                  onChange={(e) => setForm({ ...form, story: e.target.value })}
                  placeholder="Tell us about this person. What did they do? Why do they matter?"
                  className="w-full bg-black/50 border border-zinc-700 p-3 rounded-lg text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <button
                type="submit"
                className="self-start mt-2 bg-amber-500 text-black px-8 py-3 rounded-full font-black uppercase tracking-widest hover:bg-amber-400 transition-colors shadow-lg"
              >
                Submit Hero Story
              </button>
            </form>
          )}
        </div>

      </div>
      <Footer />
    </div>
  );
}

