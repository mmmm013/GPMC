/* Shared pieces of the MEANTs games on the GPM domains. They are the KLEIGH games
   of 2kleigh.com, played with ALL MEANTs instead of KLEIGH's alone (GD,
   2026-10-21: "make a KLEIGH version w/ KLEIGH-ONLY MEANTs and then ALL for GPM
   domains"). Catalogued in k-kut (config/kleigh-games.v1.json); each Element
   comes from k-kut.com/api/kleigh-game?scope=all one at a time, with a signed
   stream address. Songs only, nothing personal. */
const BASE = process.env.NEXT_PUBLIC_MEANTS_GAME_API || 'https://www.k-kut.com/api/kleigh-game';
/* Every call asks for ALL MEANTs; append further params with &. */
export const GAME_API = `${BASE}?scope=all`;

export type GameElement = {
  tier: 'TUG' | 'BUG';
  words: string;
  song: string;
  src: string;
  reference: string | null;
};

/* Progress lives in this browser only: a convenience, never a record. */
export function loadProgress<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? { ...fallback, ...(JSON.parse(raw) as T) } : fallback;
  } catch {
    return fallback;
  }
}

export function saveProgress(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private window or blocked storage: the game still plays */
  }
}

export async function sendAnswer(body: Record<string, string>) {
  try {
    const res = await fetch('/api/game-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}
