import { randomInt } from 'crypto';

/* The Riff-OFF draw. Every voter who left an email that week has the same
   chance, however many browsers they voted from: entries are counted by email. */
export type Vote = { voter_id: string; email: string | null };

export function entrants(votes: Vote[]): Vote[] {
  const byEmail = new Map<string, Vote>();
  for (const v of votes) {
    const email = v.email?.trim().toLowerCase();
    if (email && !byEmail.has(email)) byEmail.set(email, { voter_id: v.voter_id, email });
  }
  return [...byEmail.values()];
}

export function drawOne(pool: Vote[]): Vote | null {
  return pool.length ? pool[randomInt(pool.length)] : null;
}

/** A week is drawn once its voting has closed: the same day its winner reaches the nameboard. */
export function isClosed(week: string, now = new Date()): boolean {
  const closes = Date.parse(`${week}T00:00:00Z`) + 8 * 24 * 3600e3;
  return Number.isFinite(closes) && now.getTime() >= closes;
}
