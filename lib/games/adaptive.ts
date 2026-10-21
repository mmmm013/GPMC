'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GAME_API } from '@/lib/games/meantsGame';

/* Games that adapt to each player as they play (GD, 2026-10-21: "in games, find
   realtime ways to optimize experiences based on users' input, responses, calmness
   of actions, etc. Music can help in snips or in serenade"). He chose all four:
     pace       quick taps get short snips; calm play gets a mood bed under each Element
     answers    each answer steers what is offered next
     calm-down  rapid, repeated taps bring a soft NUG serenade and a slower round
     mood bed   a NUG under each vocal Element, chosen by mood, stretched or repeated
                to fit the Element, played alongside it and never mixed into it
   Everything is worked out in this browser, from this visit only; nothing personal
   is stored or sent. */

export type Pace = 'quick' | 'steady' | 'calm';

/* The catalogue's own mood tags for each "Can I…?" feeling, used to pick a NUG. */
export const MOODS_FOR: Record<string, string[]> = {
  laugh: ['Fun', 'Playful', 'Quirky', 'Happy', 'Upbeat'],
  'tear-up': ['Emotive', 'Reflective', 'Romantic', 'Moody'],
  worry: ['Tension', 'Mysterious', 'Dark', 'Dramatic'],
  inspire: ['Uplifting', 'Hopeful', 'Epic', 'Powerful', 'Building'],
  help: ['Warm', 'Positive', 'Hopeful', 'Confident'],
  comfort: ['Warm', 'Dreamy', 'Reflective', 'Light'],
  excite: ['Energetic', 'Driving', 'Party', 'Intense', 'Upbeat'],
};
export const SERENADE = ['Dreamy', 'Warm', 'Reflective', 'Light', 'Atmospheric'];
/* With no feeling to go on, the bed follows the player's pace. */
export const MOODS_FOR_PACE: Record<Pace, string[]> = {
  quick: ['Fun', 'Playful', 'Upbeat', 'Energetic'],
  steady: ['Cinematic', 'Atmospheric', 'Cool', 'Bright'],
  calm: SERENADE,
};

/** Reads pace and frustration from the player's own taps. */
export function usePlayerSense() {
  const taps = useRef<number[]>([]);
  const [pace, setPace] = useState<Pace>('steady');
  const [frustrated, setFrustrated] = useState(false);

  const tap = useCallback(() => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 60_000), now];
    const gaps = taps.current.slice(1).map((t, i) => t - taps.current[i]);
    if (gaps.length >= 2) {
      const avg = gaps.slice(-5).reduce((a, b) => a + b, 0) / Math.min(gaps.length, 5);
      setPace(avg < 2500 ? 'quick' : avg > 9000 ? 'calm' : 'steady');
    }
    /* Four taps inside two seconds reads as frustration, not play. */
    if (taps.current.filter((t) => now - t < 2000).length >= 4) setFrustrated(true);
  }, []);

  const settle = useCallback(() => {
    taps.current = [];
    setFrustrated(false);
  }, []);

  return { pace, frustrated, tap, settle };
}

type Nug = { id: string; seconds: number; src: string };

async function fetchNug(moods: string[], avoid: string[]): Promise<Nug | null> {
  try {
    const params = new URLSearchParams({ kind: 'nug', mood: moods.join(','), avoid: avoid.join(',') });
    const body = (await (await fetch(`${GAME_API}&${params}`, { cache: 'no-store' })).json()) as { nug: Nug | null };
    return body.nug;
  } catch {
    return null;
  }
}

/** Plays NUGs: alone as a snip or serenade, or as a bed under a vocal Element. */
export function useNugPlayer() {
  const bed = useRef<HTMLAudioElement | null>(null);
  const heard = useRef<string[]>([]);
  const stopper = useRef<(() => void) | null>(null);

  useEffect(() => () => stopper.current?.(), []);

  const stop = useCallback(() => {
    stopper.current?.();
    stopper.current = null;
  }, []);

  const start = useCallback(async (moods: string[], volume: number) => {
    stop();
    const nug = await fetchNug(moods, heard.current.slice(-20));
    if (!nug) return null;
    heard.current.push(nug.id);
    const a = bed.current ?? new Audio();
    bed.current = a;
    a.src = nug.src;
    a.volume = volume;
    return { a, nug };
  }, [stop]);

  /** One NUG on its own: a snip for quick play, a serenade to calm things down. */
  const playAlone = useCallback(async (moods: string[]) => {
    const got = await start(moods, 0.9);
    if (!got) return;
    got.a.loop = false;
    got.a.playbackRate = 1;
    stopper.current = () => got.a.pause();
    void got.a.play().catch(() => {});
  }, [start]);

  /** A quiet NUG repeating under a run of short Elements (a BUG-Story), until stop(). */
  const ambient = useCallback(async (moods: string[]) => {
    const got = await start(moods, 0.25);
    if (!got) return;
    got.a.loop = true;
    got.a.playbackRate = 1;
    stopper.current = () => got.a.pause();
    void got.a.play().catch(() => {});
  }, [start]);

  /** A NUG under `voice`, fitted to it: stretched up to 2x, else repeated, and ended with it. */
  const bedUnder = useCallback(async (voice: HTMLAudioElement, moods: string[]) => {
    const got = await start(moods, 0.28);
    if (!got) return;
    const { a, nug } = got;
    const fit = () => {
      const length = Number.isFinite(voice.duration) ? voice.duration : 0;
      const slower = length > 0 ? nug.seconds / length : 1;
      (a as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = true;
      if (slower >= 0.5) {
        a.loop = false;
        a.playbackRate = Math.min(1, slower);
      } else {
        a.loop = true;
        a.playbackRate = 1;
      }
    };
    const fade = () => {
      const step = () => {
        a.volume = Math.max(0, a.volume - 0.04);
        if (a.volume > 0) requestAnimationFrame(step);
        else a.pause();
      };
      step();
    };
    const begin = () => {
      fit();
      a.currentTime = 0;
      void a.play().catch(() => {});
    };
    voice.addEventListener('play', begin);
    voice.addEventListener('pause', fade);
    voice.addEventListener('ended', fade);
    stopper.current = () => {
      voice.removeEventListener('play', begin);
      voice.removeEventListener('pause', fade);
      voice.removeEventListener('ended', fade);
      a.pause();
    };
    if (!voice.paused) begin();
  }, [start]);

  return { playAlone, ambient, bedUnder, stop };
}

/** Steers the next offer from the player's answers: after a "no", offer a different feeling;
    after a "yes", offer a neighbouring one. */
const NEIGHBOURS: Record<string, string[]> = {
  laugh: ['excite', 'help'],
  'tear-up': ['comfort', 'worry'],
  worry: ['comfort', 'inspire'],
  inspire: ['help', 'excite'],
  help: ['comfort', 'inspire'],
  comfort: ['tear-up', 'help'],
  excite: ['laugh', 'inspire'],
};
export function nextSuggestion(last: { id: string; yes: boolean } | null, all: string[], answered: string[]): string | null {
  if (!last) return null;
  const open = all.filter((id) => id !== last.id && !answered.includes(id));
  const pool = open.length ? open : all.filter((id) => id !== last.id);
  const near = (NEIGHBOURS[last.id] ?? []).filter((id) => pool.includes(id));
  if (last.yes && near.length) return near[0];
  const far = pool.filter((id) => !near.includes(id));
  return (far.length ? far : pool)[0] ?? null;
}
