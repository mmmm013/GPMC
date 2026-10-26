'use client';

import { useState } from 'react';
import { sendAnswer, type Prize } from '@/lib/games/meantsGame';

/* A cleared level's prize, claimed with an email. The claim goes to G Putnam
   Music, which sends the downloads from gputnammusic.com. */
export default function PrizeClaim({ game, level, prize, reference }: { game: string; level: number; prize: Prize; reference: string | null }) {
  const key = `meants-game:claimed:${game}:${prize.id}`;
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'open' | 'sending' | 'claimed' | 'error'>(() => {
    try {
      return window.localStorage.getItem(key) ? 'claimed' : 'open';
    } catch {
      return 'open'; /* storage blocked: the form simply shows */
    }
  });

  async function claim(e: React.FormEvent) {
    e.preventDefault();
    if (!reference) return;
    setState('sending');
    const ok = await sendAnswer({ type: 'prize-claim', reference, prize: prize.id, game, level: String(level), email });
    if (ok) {
      try {
        window.localStorage.setItem(key, '1');
      } catch {
        /* nothing to remember it in */
      }
    }
    setState(ok ? 'claimed' : 'error');
  }

  return (
    <div className="mt-4 rounded-2xl border border-[#FFD54F]/50 bg-[#FFD54F]/10 p-4">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#FFD54F]">Level {level} cleared · you won</p>
      <p className="mt-1 text-xl font-black">{prize.title}</p>
      <p className="mt-1 text-sm text-[#D7CCC8]">{prize.what}</p>
      {state === 'claimed' ? (
        <p className="mt-3 font-bold">Claimed! G Putnam Music will email your prize.</p>
      ) : (
        <form onSubmit={claim} className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email"
            className="min-h-12 flex-1 rounded-2xl border border-white/20 bg-black/40 px-4 text-white placeholder:text-white/40" />
          <button type="submit" disabled={state === 'sending' || !reference}
            className="min-h-12 rounded-2xl bg-[#FFD54F] px-5 font-bold text-black disabled:opacity-60">
            {state === 'sending' ? 'Sending…' : 'Claim my prize'}
          </button>
        </form>
      )}
      {state === 'error' && <p className="mt-2 text-sm text-[#FFAB91]">That did not go through. Please try again.</p>}
    </div>
  );
}
