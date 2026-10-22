/* Riff runs: Sunday mornings before football, from 9:00 AM wherever the listener
   is (GD, 2026-10-21). Each riff plays at its own length; the music decided its
   edges ("Riffs run own length. content drives CCs."). Riff-OFF: two riffs
   compete, listeners vote, the winning riff goes on the nameboard as Riff of the
   Week, and every voter who leaves an email is in the draw for a free BUG to send.

   This file is the clock only, and is safe in the browser. Which riff is which
   lives in lib/riffRuns/catalog.ts on the server: a listener only ever sees a
   riff's public number (GD, 2026-10-22: "UI disconnects from all backend ties"). */

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

/** A Riff-OFF takes votes from its Sunday through the following Saturday, wherever the voter is. */
export function isVotableWeek(week: string, now = new Date()): boolean {
  const t = Date.parse(`${week}T00:00:00Z`);
  if (!Number.isFinite(t) || new Date(t).getUTCDay() !== 0) return false;
  const age = now.getTime() - t;
  return age > -36 * 3600e3 && age < 7.5 * 24 * 3600e3;
}
