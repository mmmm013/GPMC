'use client';

import { useState } from 'react';
import { sendLove } from '@/lib/games/loveGame';

/* Every MEANT is approved until someone hears it fail. A Fail goes straight to
   Triage, where it is re-cut or held (GD, 2026-10-21). */
const WHY = [
  { id: 'cut_off', label: 'Cut off' },
  { id: 'wrong_word', label: 'Wrong words' },
  { id: 'sound_quality', label: 'Sounds bad' },
];

export function FailButton({ game, reference }: { game: string; reference: string }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  if (done) return <span className="self-center text-sm text-[#D7CCC8]">Thanks. Sent to be fixed.</span>;
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="min-h-11 px-2 text-sm text-[#D7CCC8] underline">
        Sounds wrong?
      </button>
    );
  }
  return (
    <span className="flex flex-wrap items-center gap-2">
      {WHY.map((w) => (
        <button key={w.id} type="button"
          onClick={() => { void sendLove({ type: 'fail', why: w.id, game, reference }); setDone(true); }}
          className="min-h-11 rounded-2xl border border-[#FF7043] px-3 text-sm font-bold text-[#FF7043]">
          {w.label}
        </button>
      ))}
    </span>
  );
}
