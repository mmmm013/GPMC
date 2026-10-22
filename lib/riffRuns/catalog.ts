import riffs from './riffs.json';
import numbers from './numbers.json';
import names from './names.json';

/* Server only. Which public riff number is which clip, and from which song.
   None of this reaches a page or a response: a listener sees "Riff 17" and
   nothing else (GD, 2026-10-22: "We do NOT share ANY proprietary info AT ALL.
   Name or number these, however, but UI disconnects from all backend ties").
   Each riff also has a made-up musical name ("Lve Names!", GD 2026-10-22), checked
   so that no word of it appears in a song title or in the ASCAP catalogue. */

export type Riff = { key: string; song: string; loop: boolean; seconds: number; number: number; name: string };
const NUMBER = numbers as Record<string, number>;
const NAME = names as Record<string, string>;
export const RIFFS: Riff[] = (riffs as Omit<Riff, 'number' | 'name'>[]).map((r) => ({ ...r, number: NUMBER[r.key], name: NAME[r.key] }));
/** What a page may know: a riff's number and its public name. */
export const publicRiff = (r: Riff) => ({ riff: r.number, name: r.name });
const BY_NUMBER = new Map(RIFFS.map((r) => [r.number, r]));
export const riffByNumber = (n: unknown) => BY_NUMBER.get(Number(n));

function seeded(week: string) {
  let h = 2166136261;
  for (const c of week) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/** The same order for every listener that week, so a run is shared. */
export function runOrder(week: string): Riff[] {
  const rnd = seeded(week);
  const a = [...RIFFS];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** This week's Riff-OFF: two riffs from two different songs. */
export function riffOff(week: string): [Riff, Riff] {
  const order = runOrder(`riff-off:${week}`);
  const first = order[0];
  return [first, order.find((r) => r.song !== first.song)!];
}

