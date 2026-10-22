import type { GameElement } from '@/lib/games/meantsGame';

/* The Love Game (GD, 2026-10-22): a county-fair booth for lovers. The player is
   Romeo or Juliette, or another historic or futuristic lover; a HUG Bear archer
   shoots tickling arrows of love at romantic phrases, and Red Flame arrows soar
   singing love BUGs at True Blue hearts. Every finish wins a ribbon and a prize
   HUG. Catalogued in k-kut (config/kleigh-games.v1.json, love-game).

   Names are public-domain lovers from old stories and history, or ones invented
   here: no trademarked character, no living person. The player's name never
   leaves this browser. */
export const HISTORIC_NAMES = [
  'Romeo', 'Juliette', 'Tristan', 'Isolde', 'Orpheus', 'Eurydice', 'Pyramus', 'Thisbe',
  'Lancelot', 'Guinevere', 'Abelard', 'Héloïse', 'Antony', 'Cleopatra', 'Layla', 'Majnun',
] as const;
export const FUTURISTIC_NAMES = [
  'Lumira', 'Astrael', 'Solenne', 'Kaelix', 'Veyra', 'Orionel', 'Zephyrine', 'Quorin',
] as const;

/* Famous trademarked characters a typed name may not borrow. */
const TRADEMARKED = /\b(barbie|mickey|minnie|elsa|olaf|shrek|kermit|snoopy|pikachu|mario|luigi|lotso|care ?bears?|teddy ruxpin|tenderheart)\b/i;

export function lawfulName(raw: string): { name: string; problem: string } {
  const name = raw.replace(/[^\p{L}\p{M}' -]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 24);
  if (!name) return { name: '', problem: 'Pick a name, or type your own.' };
  if (TRADEMARKED.test(name)) return { name: '', problem: 'That name belongs to someone else. Try another.' };
  return { name, problem: '' };
}

export type BearLook = {
  kind: 'female' | 'male' | 'unisex';
  fur: 'black' | 'white';
  mood: 'cute' | 'bold';
};
export const DEFAULT_BEAR: BearLook = { kind: 'unisex', fur: 'white', mood: 'cute' };

/* Original lines written for the booth: no lyrics, no film quotes. */
export const ROMANTIC_PHRASES = [
  'Sweet on you', 'Hold my hand', 'Stay a while', 'My heart says yes', 'Dance with me',
  'Two hearts, one beat', 'Moonlight and you', 'Here is my heart', 'You light me up',
  'Always and always', 'Kiss me twice', 'Yours, truly',
];

/* Words the Red Flame arrows sing, each one a real BUG in the catalogue. */
export const LOVE_WORDS = [
  'love', 'heart', 'true', 'forever', 'kiss', 'hold', 'baby', 'sweet', 'mine',
  'together', 'dream', 'touch', 'angel', 'dance', 'smile', 'tonight', 'you', 'yours',
];

/* A county fair: Blue Ribbon is 1st Place (GD, 2026-10-22), then Red, then White. */
export type Ribbon = { place: 1 | 2 | 3; name: string; color: string };
export const RIBBONS: Ribbon[] = [
  { place: 1, name: 'Blue Ribbon', color: '#1E63D6' },
  { place: 2, name: 'Red Ribbon', color: '#D32F2F' },
  { place: 3, name: 'White Ribbon', color: '#F5F5F5' },
];
export function ribbonFor(hits: number, shots: number): Ribbon {
  const share = shots ? hits / shots : 0;
  return share >= 0.7 ? RIBBONS[0] : share >= 0.4 ? RIBBONS[1] : RIBBONS[2];
}

/** One prize HUG, never one already offered. `wish` searches every HUG. Asked of
    this site's own /api/love-game, which keeps everything behind the HUG on the server. */
export async function fetchHug(skip: string[], wish = ''): Promise<GameElement | null> {
  try {
    const params = new URLSearchParams({ kind: 'hug', skip: skip.join(','), wish });
    const body = (await (await fetch(`/api/love-game?${params}`, { cache: 'no-store' })).json()) as { element: GameElement | null };
    return body.element;
  } catch {
    return null;
  }
}

/** The BUG for one love word, with its song left unnamed. */
export async function fetchLoveBug(word: string): Promise<GameElement | null> {
  try {
    const params = new URLSearchParams({ kind: 'bug', word });
    const body = (await (await fetch(`/api/love-game?${params}`, { cache: 'no-store' })).json()) as { element: GameElement | null };
    return body.element;
  } catch {
    return null;
  }
}

/* The freebie promise: shown to the player, kept in this browser, and filed with
   GPM so it is honoured ("we will not forget"). */
export const PROMISE_KEY = 'meants-game:love:promise:v1';
/* The prize is a free HUG, one per player (GD, 2026-10-22: "free HUG only").
   This browser remembers a claim and its link; it is one per email. */
export const CLAIMED_KEY = 'meants-game:love:claimed:v1';
export function alreadyClaimed(): boolean {
  try {
    return Boolean(window.localStorage.getItem(CLAIMED_KEY));
  } catch {
    return false;
  }
}
export function newPromiseCode(): string {
  const a = new Uint8Array(4);
  crypto.getRandomValues(a);
  return `LOVE-${Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

/** The private link of the prize this browser claimed, when it kept one. */
export function claimedLink(): string {
  try {
    const v = window.localStorage.getItem(CLAIMED_KEY) ?? '';
    return v.startsWith('https://') ? v : '';
  } catch {
    return '';
  }
}

export async function sendLove(body: Record<string, string>): Promise<{ ok: boolean; error?: string; link?: string }> {
  try {
    const res = await fetch('/api/game-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const out = (await res.json().catch(() => ({}))) as { error?: string; link?: string };
    return { ok: res.ok, error: out.error, link: out.link };
  } catch {
    return { ok: false, error: 'Try again in a moment.' };
  }
}
