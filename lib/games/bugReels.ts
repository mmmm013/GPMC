/* BUG Reels: the old three-reel lever machine, remade as a free word machine
   (GD, 2026-10-22: "Kreate NEW game: make slot machine using BUGs. See slot
   gmes history & adapt to tomorrow's fun entertsinment.").

   What it keeps from the history, and how it is changed:
   - Three reels and a lever (the 1890s San Francisco original): here each reel
     stops on a word, and the three words are sung, in order, from real songs.
   - A prize with every pull (the early-1900s gum machines, whose fruit and BAR
     symbols came from the gum they gave out): every pull sings a line. Nothing
     is lost, nothing is paid, nothing is bought.
   - Hold and Nudge (the British fruit machines): keep a word you like, or step
     one reel by one word.
   - The bonus round (1990s video machines): three stars open a Golden Pull with
     a fourth reel.
   - Tomorrow: the line you pull is a message. Send it on, and it is sung again
     on their own phone.

   Every word below was checked to have a sung BUG on k-kut.com/api/kleigh-game
   (scope=all) on 2026-10-22. A word that loses its BUG later just shows as "not
   sung yet" and the player nudges or pulls again. */
export const REELS: string[][] = [
  ['i', 'you', 'we', 'baby', 'girl', 'they', 'love', 'heart'],
  ['love', 'need', 'want', 'feel', 'sing', 'dance', 'hold', 'miss', 'kiss', 'find', 'fly', 'shine', 'dream', 'smile', 'believe', 'know', 'see', 'run'],
  ['you', 'me', 'home', 'tonight', 'forever', 'light', 'love', 'sky', 'sun', 'star', 'night', 'time', 'music', 'together', 'again', 'everything', 'friend', 'world', 'free'],
];

/* The Golden Pull's fourth reel: one more word to end the line. */
export const BONUS_REEL = ['again', 'forever', 'tonight', 'together'];

/* A star for a Sweet Line, or for the same word on all three reels (the old
   machines' top prize was three of one symbol; here only "love" can do it). */
export const SWEET_LINES = [
  'i love you',
  'you love me',
  'i need you',
  'i miss you',
  'we dance tonight',
  'we sing together',
  'i believe you',
  'baby hold me',
  'baby kiss me',
  'we run free',
  'i dream forever',
  'you light home',
];

export const STARS_FOR_GOLDEN = 3;

export function reelFor(i: number): string[] {
  return REELS[i] ?? BONUS_REEL;
}

export function isSweet(words: string[]): boolean {
  const three = words.slice(0, 3);
  return SWEET_LINES.includes(three.join(' ')) || (three.length === 3 && new Set(three).size === 1);
}

/** A line someone sent (?line=i,love,you): kept only when every word is on its reel. */
export function lineFromParam(raw: string | null): string[] | null {
  if (!raw) return null;
  const words = raw.toLowerCase().split(',').map((w) => w.trim());
  if (words.length < 3 || words.length > 4) return null;
  return words.every((w, i) => reelFor(i).includes(w)) ? words : null;
}
