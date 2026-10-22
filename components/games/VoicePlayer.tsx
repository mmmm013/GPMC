'use client';

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { replayVoice } from '@/lib/games/clearVoice';

/* The player under every game's TUG or BUG: the usual controls, and a big
   Replay that plays it again slower still (GD, 2026-10-22). */
const VoicePlayer = forwardRef<HTMLAudioElement | null, { className?: string }>(function VoicePlayer({ className }, ref) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  useImperativeHandle(ref, () => audio.current as HTMLAudioElement);
  return (
    <div className={className}>
      <audio ref={audio} controls controlsList="nodownload noplaybackrate" crossOrigin="anonymous" className="w-full"
        onLoadedData={() => setLoaded(true)} onEmptied={() => setLoaded(false)} />
      {loaded && (
        <button type="button" onClick={() => audio.current && void replayVoice(audio.current).catch(() => {})}
          className="mt-3 min-h-12 w-full rounded-2xl border-2 border-[#FFD54F] px-4 py-2 text-lg font-bold text-[#FFD54F]">
          ↻ Replay, slower
        </button>
      )}
    </div>
  );
});
export default VoicePlayer;
