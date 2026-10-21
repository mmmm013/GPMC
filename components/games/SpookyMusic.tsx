'use client';

import { useEffect, useRef, useState } from 'react';
import { GAME_API } from '@/lib/games/meantsGame';

/* Spooky music under a game, only when a player asks for it. Each piece is a
   passage from a G Putnam Music instrumental, streamed and never a
   download (GD, 2026-10-21: "SPOOKY & Haunted exact excerpts"). Only pieces
   GD has approved play, so until there is one this shows nothing. */
type Spot = { src: string; reference: string };

export default function SpookyMusic() {
  const audio = useRef<HTMLAudioElement>(null);
  const [spot, setSpot] = useState<Spot | null>(null);
  const [heard, setHeard] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    fetch(`${GAME_API}&kind=sweet-spot&mood=spooky`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((b: { spot: Spot | null }) => setAvailable(Boolean(b.spot)))
      .catch(() => setAvailable(false));
  }, []);

  async function play() {
    setBusy(true);
    setMessage('');
    try {
      const body = (await (
        await fetch(`${GAME_API}&kind=sweet-spot&mood=spooky&skip=${encodeURIComponent(heard.join(','))}`, { cache: 'no-store' })
      ).json()) as { spot: Spot | null };
      if (!body.spot) {
        setMessage('No spooky music just now.');
        return;
      }
      setSpot(body.spot);
      setHeard((h) => [...h, body.spot!.reference].slice(-40));
      const a = audio.current;
      if (a) {
        a.src = body.spot.src;
        a.loop = true;
        a.volume = 0.4;
        void a.play().catch(() => setMessage('Tap play to start the music.'));
      }
    } catch {
      setMessage('No spooky music just now.');
    } finally {
      setBusy(false);
    }
  }

  function stop() {
    audio.current?.pause();
    setSpot(null);
  }

  if (!available) return null;

  return (
    <div className="mt-10 w-full max-w-md rounded-2xl border border-white/15 p-4 text-center">
      <p className="font-bold">Want spooky music while you play?</p>
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={play} disabled={busy}
          className="min-h-12 rounded-2xl bg-[#AB47BC] px-5 font-bold text-white disabled:opacity-60">
          {spot ? 'Different spooky music' : 'Play spooky music'}
        </button>
        {spot && (
          <button type="button" onClick={stop} className="min-h-12 rounded-2xl border border-white/30 px-5 font-bold">
            Stop the music
          </button>
        )}
      </div>
      <audio ref={audio} controlsList="nodownload" className="hidden" />
      {message && <p className="mt-3 text-sm text-[#D7CCC8]" role="status">{message}</p>}
    </div>
  );
}
