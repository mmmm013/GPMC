'use client';

import { useEffect, useRef, useState } from 'react';
import { GOLDEN_EVENT, fetchBug, fetchNug } from '@/lib/games/wonders';
import { playVoice, replayVoice } from '@/lib/games/clearVoice';
import type { GameElement } from '@/lib/games/meantsGame';

/* Golden NUG (shown to players as "Strike gold": NUG is not a buyer word): about one play in fifty, anywhere in the Extraordinary
   experiences, the screen turns gold, a special sound plays, and the player wins
   a free BUG to send: one real word, sung in a real song. They leave an email
   and the BUG reaches them to send. Once per visit at most. */
export default function GoldenNug() {
  const [open, setOpen] = useState(false);
  const [bug, setBug] = useState<GameElement | null>(null);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState('');
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const strike = async () => {
      try {
        if (sessionStorage.getItem(GOLDEN_EVENT)) return;
        sessionStorage.setItem(GOLDEN_EVENT, '1');
      } catch {
        /* still golden */
      }
      setOpen(true);
      const [nug, word] = await Promise.all([fetchNug(['Epic', 'Uplifting', 'Joyful', 'Bright']), fetchBug()]);
      setBug(word);
      if (nug) {
        const a = audio.current ?? new Audio();
        audio.current = a;
        a.src = nug.src;
        if (word) a.onended = () => { a.onended = null; void playVoice(a, word.src).catch(() => {}); };
        void a.play().catch(() => {});
      }
    };
    window.addEventListener(GOLDEN_EVENT, strike);
    return () => window.removeEventListener(GOLDEN_EVENT, strike);
  }, []);

  async function claim(e: React.FormEvent) {
    e.preventDefault();
    if (!bug?.reference) return;
    try {
      const res = await fetch('/api/game-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'prize-claim', prize: 'golden-nug-free-bug', game: 'extraordinary', reference: bug.reference, email }),
      });
      const body = (await res.json()) as { error?: string };
      setSent(res.ok ? 'It is yours. Watch your email.' : body.error ?? 'Try again in a moment.');
    } catch {
      setSent('Try again in a moment.');
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#FFD54F] via-[#FFB300] to-[#FF8F00] p-4 text-black" role="dialog" aria-label="You struck gold">
      <div className="w-full max-w-md text-center">
        <p className="text-sm font-black uppercase tracking-[0.3em]">One in fifty</p>
        <p className="mt-2 text-5xl font-black">You found gold!</p>
        <p className="mt-4 text-lg font-bold">Your prize: a free BUG to send.</p>
        {bug && <p className="mt-2 text-3xl font-black">“{bug.words}”</p>}
        {bug && <p className="text-sm">from {bug.song}</p>}
        {bug && (
          <button type="button" onClick={() => { const a = audio.current; if (a) void (a.src === bug.src ? replayVoice(a) : playVoice(a, bug.src)).catch(() => {}); }}
            className="mt-3 min-h-12 rounded-2xl border-2 border-black px-5 font-bold">↻ Hear it again, slower</button>
        )}
        {bug?.reference && !sent && (
          <form onSubmit={claim} className="mt-6 flex flex-col gap-3">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email"
              className="min-h-12 rounded-2xl border-2 border-black/30 bg-white/80 px-4 text-black" />
            <button type="submit" className="min-h-12 rounded-2xl bg-black font-bold text-[#FFD54F]">Claim it</button>
          </form>
        )}
        {sent && <p className="mt-6 font-bold" role="status">{sent}</p>}
        <button type="button" onClick={() => { audio.current?.pause(); setOpen(false); }} className="mt-6 text-sm font-bold underline">Back to play</button>
      </div>
    </div>
  );
}
