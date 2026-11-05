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

/* One machine's words. BUG Reels and Heroes Reels play the same machine with different reels. */
export type ReelSet = {
  game: string;
  key: string;
  reels: string[][];
  bonus: string[];
  sweet: string[];
  /* What a star line is called on this machine. */
  sweetName: string;
  first: string[];
  /* How often a spinning reel shows its next word, in ms. Heroes Reels spins slower and calmer. */
  spinMs: number;
  /* What the sent link says. */
  sendNote: string;
};

export const BUG_REELS: ReelSet = {
  game: 'bug-reels',
  key: 'meants-game:bug-reels:v1',
  reels: REELS,
  bonus: BONUS_REEL,
  sweet: SWEET_LINES,
  sweetName: 'Sweet Line',
  first: ['i', 'love', 'you'],
  spinMs: 70,
  sendNote: 'a line sung just for you',
};

/* Heroes Reels (GD, 2026-11-04: "create 3 Heroes\" games. One like Slots."): the
   same machine, with words for thanking a hero. Every word below was checked to
   have a sung BUG on k-kut.com/api/kleigh-game (scope=all) on 2026-11-04. Words
   with no BUG yet (hero, courage, honor, serve, salute) are left out. */
export const HERO_REELS: ReelSet = {
  game: 'heroes-reels',
  key: 'meants-game:heroes-reels:v1',
  reels: [
    ['i', 'we', 'you', 'they'],
    ['thank', 'love', 'remember', 'need', 'believe', 'carry', 'lift', 'stand', 'keep', 'hold', 'walk', 'come', 'rise', 'shine', 'miss', 'help'],
    ['you', 'home', 'safe', 'strong', 'brave', 'proud', 'tall', 'free', 'together', 'today', 'again', 'forever', 'light', 'back', 'me', 'us', 'bright'],
  ],
  bonus: ['again', 'forever', 'together', 'today'],
  sweet: [
    'i thank you',
    'we thank you',
    'we remember you',
    'we love you',
    'i miss you',
    'we need you',
    'i believe you',
    'you stand tall',
    'they stand tall',
    'we stand together',
    'we stand strong',
    'you carry us',
    'you carry me',
    'you lift me',
    'you lift us',
    'you keep us',
    'you come home',
    'they come home',
    'you walk free',
    'you rise again',
    'you shine bright',
  ],
  sweetName: 'Hero Line',
  first: ['we', 'thank', 'you'],
  spinMs: 220,
  sendNote: 'a thank-you sung for a hero',
};

export function reelFor(i: number, set: ReelSet = BUG_REELS): string[] {
  return set.reels[i] ?? set.bonus;
}

export function isSweet(words: string[], set: ReelSet = BUG_REELS): boolean {
  const three = words.slice(0, 3);
  return set.sweet.includes(three.join(' ')) || (three.length === 3 && new Set(three).size === 1);
}

/** A line someone sent (?line=i,love,you): kept only when every word is on its reel. */
export function lineFromParam(raw: string | null, set: ReelSet = BUG_REELS): string[] | null {
  if (!raw) return null;
  const words = raw.toLowerCase().split(',').map((w) => w.trim());
  if (words.length < 3 || words.length > 4) return null;
  return words.every((w, i) => reelFor(i, set).includes(w)) ? words : null;
}
