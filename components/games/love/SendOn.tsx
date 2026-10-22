'use client';

import { gameEvent } from '@/lib/games/gameEvent';
import { useState } from 'react';

/* The prize's own private link, on the spot (GD, 2026-10-22: "The prize is
   created the moment they win ... They can send it on to their sweetheart").
   It goes from the player's own phone: "Text it" opens their Messages with it
   typed, "DM it" opens the phone's share sheet. GPM texts nobody and keeps no
   number. Same buttons as k-kut's own sends (app/g/[token]/send). */
export default function SendOn({ link, from, again }: { link: string; from: string; again?: boolean }) {
  const [note, setNote] = useState('');
  const message = from ? `A HUG for you, with love from ${from}` : 'A HUG for you, with love';
  const text = `${message}\n${link}`;

  async function dm() {
    gameEvent('prize_sent', { game: 'love', how: 'dm' });
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
    <div className="mt-4 flex flex-col gap-3">
      <p className="text-lg font-black text-[#FFD54F]">{again ? 'Your prize link' : 'It is yours, free. Here is its own link.'}</p>
      <p className="text-sm text-[#D7CCC8]">Send it to your sweetheart. It plays on their own private link.</p>
      <a href={`sms:?&body=${encodeURIComponent(text)}`} onClick={() => gameEvent('prize_sent', { game: 'love', how: 'text' })} className={`${big} bg-[#EC407A] text-white`}>Text it</a>
      <button type="button" onClick={dm} className={`${big} bg-[#FFD54F] text-black`}>DM it</button>
      <a href={link} target="_blank" rel="noopener" onClick={() => gameEvent('prize_sent', { game: 'love', how: 'open' })} className={`${big} border border-white/30`}>Open it</a>
      {note && <p className="text-sm font-bold text-[#FFD54F]" role="status">{note}</p>}
      <p className="break-all rounded-xl border border-white/20 p-3 text-xs text-[#D7CCC8]">{link}</p>
    </div>
  );
}
