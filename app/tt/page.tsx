'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BraveEaglePromo from '@/components/BraveEaglePromo';

const TT_RULES = [
  'Stories are private by default — only you can see your story unless you choose to share.',
  'You may share your story publicly via URU for a small per-share fee (volume is the goal, not per-visit profit).',
  'All stories must be original — your own words, your own truth.',
  'No hate, no slander, no harm. Stories violating these terms are removed without notice.',
  'GPM reserves the right to feature exceptional stories (anonymized or credited, your choice) on the Heroes page.',
  'You retain ownership of your story. GPM only stores and distributes it per your settings.',
];

export default function TaleTellPage() {
  const [form, setForm] = useState({
    title: '',
    story: '',
    isPrivate: true,
    authorName: '',
    shareToHeroes: false,
  });
  const [step, setStep] = useState<'rules' | 'write' | 'done'>('rules');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Future: POST to Supabase tales table
    setStep('done');
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-sans">
      <Header />
      <BraveEaglePromo
        links={[
          { href: '/heroes', label: 'Back to Heroes' },
          { href: '/mip', label: 'MIP1 Recognition Form' },
          { href: '/uru', label: 'URU Playlists' },
          { href: '/gift', label: 'Gift Support' },
        ]}
      />
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* HEADER */}
        <p className="mb-2 text-xs tracking-[0.3em] text-amber-400 uppercase font-bold">
          G Putnam Music — Private Story Engine
        </p>
        <h1 className="text-5xl font-extrabold mb-3 tracking-tighter">TT</h1>
        <p className="text-xl font-serif italic text-amber-300/80 mb-2">Tale Tell</p>
        <p className="text-sm opacity-60 mb-10 leading-relaxed max-w-xl">
          Your story. Your rules. Share with yourself, share with the world — or let it live
          privately forever. TT is where your truth finds its music.
        </p>

        {/* STEP: RULES */}
        {step === 'rules' && (
          <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-700 shadow-2xl">
            <h2 className="text-lg font-black uppercase tracking-widest mb-6 text-amber-400">
              Community Rules
            </h2>
            <ul className="space-y-4 mb-8">
              {TT_RULES.map((rule, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed">
                  <span className="text-amber-400 font-black mt-0.5 shrink-0">{i + 1}.</span>
                  <span className="opacity-85">{rule}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-zinc-700 pt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <p className="text-xs opacity-50 max-w-sm">
                By continuing, you agree to these rules and our{' '}
                <Link href="/terms" className="underline hover:text-amber-300">Terms of Service</Link>{' '}
                and{' '}
                <Link href="/privacy" className="underline hover:text-amber-300">Privacy Policy</Link>.
              </p>
              <button
                onClick={() => setStep('write')}
                className="shrink-0 bg-amber-500 text-black px-8 py-3 rounded-full font-black uppercase tracking-widest hover:bg-amber-400 transition-colors shadow-lg"
              >
                I Agree — Tell My Tale
              </button>
            </div>
          </div>
        )}

        {/* STEP: WRITE */}
        {step === 'write' && (
          <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-2xl p-8 border border-zinc-700 shadow-2xl flex flex-col gap-5">
            <h2 className="text-lg font-black uppercase tracking-widest text-amber-400 mb-2">
              Write Your Tale
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-1">
                Story Title
              </label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Give your story a name..."
                className="w-full bg-black/50 border border-zinc-700 p-3 rounded-lg text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-1">
                Your Story
              </label>
              <textarea
                required
                rows={10}
                value={form.story}
                onChange={(e) => setForm({ ...form, story: e.target.value })}
                placeholder="Begin your tale here. This is your space — raw, real, true."
                className="w-full bg-black/50 border border-zinc-700 p-3 rounded-lg text-white focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-1">
                Your Name (optional)
              </label>
              <input
                value={form.authorName}
                onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                placeholder="Leave blank to remain anonymous"
                className="w-full bg-black/50 border border-zinc-700 p-3 rounded-lg text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* PRIVACY TOGGLE */}
            <div className="flex flex-col gap-3 border border-zinc-700 rounded-xl p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="privacy"
                  checked={form.isPrivate}
                  onChange={() => setForm({ ...form, isPrivate: true })}
                  className="accent-amber-400 w-4 h-4"
                />
                <span className="text-sm font-semibold">
                  Private — only I can see this story
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="privacy"
                  checked={!form.isPrivate}
                  onChange={() => setForm({ ...form, isPrivate: false })}
                  className="accent-amber-400 w-4 h-4"
                />
                <span className="text-sm font-semibold">
                  Share via{' '}
                  <Link href="/uru" className="text-amber-400 underline hover:text-amber-300">
                    URU
                  </Link>{' '}
                  <span className="opacity-50 font-normal">(small per-share fee applies)</span>
                </span>
              </label>
            </div>

            {/* HEROES FEATURE OPT-IN */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.shareToHeroes}
                onChange={(e) => setForm({ ...form, shareToHeroes: e.target.checked })}
                className="accent-amber-400 w-4 h-4 mt-0.5"
              />
              <span className="text-sm opacity-70 leading-relaxed">
                I&apos;d like GPM to consider featuring this story on the{' '}
                <Link href="/heroes" className="text-amber-400 underline hover:text-amber-300">Heroes</Link>{' '}
                page (GPM may anonymize or credit you — your choice at review time).
              </span>
            </label>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => setStep('rules')}
                className="px-5 py-2 border border-zinc-600 font-bold uppercase text-xs tracking-widest hover:border-white transition-colors rounded-full"
              >
                ← Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-amber-500 text-black px-8 py-3 rounded-full font-black uppercase tracking-widest hover:bg-amber-400 transition-colors shadow-lg"
              >
                Save My Tale
              </button>
            </div>
          </form>
        )}

        {/* STEP: DONE */}
        {step === 'done' && (
          <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-700 shadow-2xl text-center">
            <p className="text-4xl mb-4">📖</p>
            <h2 className="text-2xl font-black text-amber-400 mb-2">Your Tale Is Saved.</h2>
            <p className="opacity-70 mb-8 max-w-md mx-auto">
              It lives safely in your GPM space.{' '}
              {form.isPrivate
                ? 'Only you can see it — private and protected.'
                : 'You chose to share it via URU. A small sharing fee applies when distributed.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => { setStep('write'); setForm({ title: '', story: '', isPrivate: true, authorName: '', shareToHeroes: false }); }}
                className="px-6 py-2 border border-amber-400 text-amber-400 font-bold hover:bg-amber-400 hover:text-black transition-colors uppercase text-sm tracking-widest rounded-full"
              >
                Tell Another Tale
              </button>
              <Link href="/uru">
                <button className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 font-bold transition-colors uppercase text-sm tracking-widest rounded-full">
                  Go to URU →
                </button>
              </Link>
            </div>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}
