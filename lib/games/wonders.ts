'use client';

import { GAME_API, type GameElement } from '@/lib/games/meantsGame';
import { weekOf } from '@/lib/riffRuns/schedule';

/* Shared pieces of the Extraordinary experiences (GD, 2026-10-21: "seek fun,
   different, unpredictable, odd, unbelievable, fantastical, extraordinary,
   multi-sensory experience. Find ways." He chose to build all twelve.) Every
   sound streams on a signed, expiring link; nothing is a file and nothing
   personal is kept. Sounds that play together play side by side, never mixed
   into one ("NOTHING gets blended"). */

export type Nug = { id: string; seconds: number; src: string };

export async function fetchNug(moods: string[] = [], avoid: string[] = []): Promise<Nug | null> {
  try {
    const params = new URLSearchParams({ kind: 'nug', mood: moods.join(','), avoid: avoid.slice(-20).join(',') });
    const body = (await (await fetch(`${GAME_API}&${params}`, { cache: 'no-store' })).json()) as { nug: Nug | null };
    return body.nug;
  } catch {
    return null;
  }
}

/** One word sung in a real song, the same draw SootheSinger uses. */
export async function fetchBug(): Promise<GameElement | null> {
  try {
    const body = (await (await fetch(`${GAME_API}&kind=ball`, { cache: 'no-store' })).json()) as { element: GameElement | null };
    return body.element;
  } catch {
    return null;
  }
}

/** A riff from the Sunday riff runs, known only by its public number and name. */
let riffNumbers: { riff: number; name: string }[] | null = null;
export async function fetchRiff(avoid: string[] = []): Promise<{ key: string; name: string; src: string } | null> {
  try {
    riffNumbers ??= ((await (await fetch(`/api/riff-runs/week?week=${weekOf(new Date())}`)).json()) as { order?: { riff: number; name: string }[] }).order ?? [];
  } catch {
    return null;
  }
  if (!riffNumbers.length) return null;
  const pool = riffNumbers.filter((n) => !avoid.includes(`riff-${n.riff}`));
  const from = pool.length ? pool : riffNumbers;
  const { riff, name } = from[Math.floor(Math.random() * from.length)];
  return { key: `riff-${riff}`, name, src: `/api/riff-runs/audio?riff=${riff}` };
}

/* One AudioContext for the page, opened on the player's first tap (browsers
   keep sound off until then). */
let ctx: AudioContext | null = null;
export function audioContext(): AudioContext {
  if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** An audio element wired through Web Audio, so a game can hear it, draw it, or
    place it in space (`through`, e.g. a panner, sits between the sound and the speakers). */
export function wired(src: string, through?: AudioNode) {
  const ac = audioContext();
  const el = new Audio();
  el.crossOrigin = 'anonymous';
  el.src = src;
  el.setAttribute('controlsList', 'nodownload');
  const source = ac.createMediaElementSource(el);
  const analyser = ac.createAnalyser();
  analyser.fftSize = 1024;
  if (through) {
    source.connect(through);
    through.connect(analyser);
  } else {
    source.connect(analyser);
  }
  analyser.connect(ac.destination);
  return { el, ac, analyser };
}

/** Calls `onHit` on each strong onset in the sound: a sudden jump in loudness. */
export function watchHits(analyser: AnalyserNode, onHit: (strength: number) => void, isOn: () => boolean) {
  const data = new Uint8Array(analyser.fftSize);
  let avg = 0;
  let last = 0;
  const tick = () => {
    if (!isOn()) return;
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (const v of data) sum += ((v - 128) / 128) ** 2;
    const level = Math.sqrt(sum / data.length);
    const now = performance.now();
    if (level > avg * 1.6 && level > 0.04 && now - last > 120) {
      last = now;
      onHit(Math.min(1, level * 3));
    }
    avg = avg * 0.92 + level * 0.08;
    requestAnimationFrame(tick);
  };
  tick();
}

/** A short buzz in the hand where the phone can do it. */
export function buzz(ms: number) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* not every phone can */
  }
}

/* The world changes with the clock: the same games look and sound different by
   time of day and by season. */
export type Season = 'halloween' | 'veterans' | 'christmas' | null;
export type Daypart = 'night' | 'morning' | 'day' | 'evening';

export function clockWorld(now = new Date()) {
  const h = now.getHours();
  const daypart: Daypart = h < 5 || h >= 21 ? 'night' : h < 11 ? 'morning' : h < 17 ? 'day' : 'evening';
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const season: Season =
    m === 10 && d >= 15 ? 'halloween' : m === 11 && d <= 11 ? 'veterans' : m === 12 && d <= 26 ? 'christmas' : null;
  const moods =
    season === 'halloween' ? ['Dark', 'Mysterious', 'Tension', 'Spooky']
    : season === 'christmas' ? ['Warm', 'Joyful', 'Light', 'Happy']
    : season === 'veterans' ? ['Epic', 'Powerful', 'Uplifting', 'Hopeful']
    : daypart === 'night' ? ['Dreamy', 'Atmospheric', 'Moody', 'Reflective']
    : daypart === 'morning' ? ['Bright', 'Hopeful', 'Light', 'Positive']
    : daypart === 'evening' ? ['Warm', 'Cool', 'Romantic', 'Reflective']
    : ['Upbeat', 'Fun', 'Energetic', 'Playful'];
  const sky =
    season === 'halloween' ? 'from-[#1a0b2e] via-[#2b1405] to-[#0a0a0a]'
    : season === 'christmas' ? 'from-[#0b2a1a] via-[#3a0d12] to-[#0a1410]'
    : season === 'veterans' ? 'from-[#0b1e3a] via-[#2a0d14] to-[#0a0f1a]'
    : daypart === 'night' ? 'from-[#050816] via-[#0d1033] to-[#000000]'
    : daypart === 'morning' ? 'from-[#3a2a0d] via-[#5a3a1a] to-[#1a1207]'
    : daypart === 'evening' ? 'from-[#2a0d2e] via-[#4a1a0d] to-[#1a1207]'
    : 'from-[#1a1207] via-[#2a1d0b] to-[#1a1207]';
  return { daypart, season, moods, sky };
}

/* Golden NUG: about one play in fifty turns gold and wins a free BUG to send. */
export const GOLDEN_ODDS = 50;
export const isGolden = () => Math.random() < 1 / GOLDEN_ODDS;
export const GOLDEN_EVENT = 'gpm-golden-nug';
/** Every experience calls this after a play; one in fifty opens the golden moment. */
export function rollGolden() {
  if (isGolden()) window.dispatchEvent(new Event(GOLDEN_EVENT));
}

/* Mystery doors: four worlds, each heard through the catalogue's own mood tags. */
export const WORLDS = {
  spooky: { name: 'Spooky', moods: ['Dark', 'Mysterious', 'Tension', 'Spooky'] },
  historic: { name: 'Historic', moods: ['Epic', 'Cinematic', 'Dramatic', 'Powerful'] },
  futuristic: { name: 'Futuristic', moods: ['Electronic', 'Driving', 'Cool', 'Intense'] },
  fantasy: { name: 'Fantasy', moods: ['Dreamy', 'Atmospheric', 'Playful', 'Quirky'] },
} as const;
export type World = keyof typeof WORLDS;
