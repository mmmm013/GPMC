import riffs from './riffs.json';

/* Riff runs: Sunday mornings before football, from 9:00 AM wherever the listener
   is (GD, 2026-10-21). Each riff plays at its own length; the music decided its
   edges ("Riffs run own length. content drives CCs."). Riff-OFF: two riffs
   compete, listeners vote, the winning riff goes on the nameboard as Riff of the
   Week, and every voter who leaves an email is in the draw for a free BUG to send. */

export type Riff = { key: string; song: string; loop: boolean; seconds: number };
export const RIFFS = riffs as Riff[];
const BY_KEY = new Map(RIFFS.map((r) => [r.key, r]));
export const riffByKey = (key: string) => BY_KEY.get(key);

export const RUN_STARTS_HOUR = 9;
export const RUN_ENDS_HOUR = 12;

/** The week a listener is in, named by its Sunday in their own time zone. */
export function weekOf(local: Date): string {
  const d = new Date(local.getFullYear(), local.getMonth(), local.getDate() - local.getDay());
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function isRunOn(local: Date): boolean {
  return local.getDay() === 0 && local.getHours() >= RUN_STARTS_HOUR && local.getHours() < RUN_ENDS_HOUR;
}

/** The next Sunday 9:00 AM in the listener's own time zone. */
export function nextRun(local: Date): Date {
  const d = new Date(local.getFullYear(), local.getMonth(), local.getDate(), RUN_STARTS_HOUR);
  const ahead = (7 - local.getDay()) % 7;
  d.setDate(d.getDate() + ahead);
  if (d.getTime() + (RUN_ENDS_HOUR - RUN_STARTS_HOUR) * 3600e3 <= local.getTime()) d.setDate(d.getDate() + 7);
  return d;
}

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

/** A Riff-OFF takes votes from its Sunday through the following Saturday, wherever the voter is. */
export function isVotableWeek(week: string, now = new Date()): boolean {
  const t = Date.parse(`${week}T00:00:00Z`);
  if (!Number.isFinite(t) || new Date(t).getUTCDay() !== 0) return false;
  const age = now.getTime() - t;
  return age > -36 * 3600e3 && age < 7.5 * 24 * 3600e3;
}
