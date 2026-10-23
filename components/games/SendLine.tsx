'use client';

import { gameEvent } from '@/lib/games/gameEvent';
import { useState } from 'react';

/* Send a pulled line on: it is sung again, from the start, on the other phone.
   Same three buttons as the Love Game's SendOn: "Text it" opens the player's own
   Messages with it typed, "DM it" opens the phone's share sheet, "Open it" shows
   the link. GPM texts nobody and keeps no number. The link holds only the words. */
export default function SendLine({ words, game }: { words: string[]; game: string }) {
  const [note, setNote] = useState('');
  const link = `${window.location.origin}${window.location.pathname}?line=${words.map(encodeURIComponent).join(',')}`;
  const message = `"${words.join(' ')}" — a line sung just for you`;
  const text = `${message}\n${link}`;

  async function dm() {
    gameEvent('prize_sent', { game, how: 'dm' });
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ text: message, url: link });
        return;
      } catch {
        /* closed the sheet: copy instead */
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setNote('Copied. Paste it into your message.');
    } catch {
      setNote('Press and hold the link below to copy it.');
    }
  }

  const big = 'block min-h-12 w-full rounded-2xl px-4 py-3 text-center text-lg font-black';
  return (
    <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#FFD54F]/40 bg-black/40 p-4">
      <p className="text-lg font-black text-[#FFD54F]">Send this line to someone</p>
      <p className="text-sm text-[#D7CCC8]">Free. They hear it sung on their own phone.</p>
      <a href={`sms:?&body=${encodeURIComponent(text)}`} onClick={() => gameEvent('prize_sent', { game, how: 'text' })} className={`${big} bg-[#EC407A] text-white`}>Text it</a>
      <button type="button" onClick={dm} className={`${big} bg-[#FFD54F] text-black`}>DM it</button>
      <a href={link} target="_blank" rel="noopener" onClick={() => gameEvent('prize_sent', { game, how: 'open' })} className={`${big} border border-white/30`}>Open it</a>
      {note && <p className="text-sm font-bold text-[#FFD54F]" role="status">{note}</p>}
      <p className="break-all rounded-xl border border-white/20 p-3 text-xs text-[#D7CCC8]">{link}</p>
    </div>
  );
}
