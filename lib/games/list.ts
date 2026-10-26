/* The games on gputnammusic.com, in the order the Games page lists them.
   Catalogued in k-kut (config/kleigh-games.v1.json). */
export type GameCard = { href: string; title: string; tag: string; blurb: string };

export const GAMES: GameCard[] = [
  /* New on 2026-10-26: GD's Scenarios game ("Scenarios is my key"). */
  {
    href: '/games/what-if',
    title: 'What if…?',
    tag: 'New · TUGs and BUGs · free · 3 levels',
    blurb: 'What if a hurricane is coming and you have one final text? Pick a What if, listen to the songs that fit, and choose the one you would send.',
  },
  /* New on 2026-10-23 and no visits yet, so it leads the list (GD, 2026-10-23: "do 1"). */
  {
    href: '/games/bug-reels',
    title: 'BUG Reels',
    tag: 'New · BUGs · free · pull the lever',
    blurb: 'Pull the lever and three reels stop on three words, each one sung from a real song. Hold, nudge, find a Sweet Line, and send your line to someone.',
  },
  {
    href: '/games/can-i',
    title: 'Can I…?',
    tag: 'TUGs · free · 3 levels',
    blurb: 'Can a G Putnam Music song make you laugh, tear up, worry, inspire, help, comfort or excite you? Pick a challenge, listen, and tell us if it did.',
  },
  {
    href: '/games/bug-story',
    title: 'BUG-Story',
    tag: 'BUGs · free · 3 levels',
    blurb: 'Type three words and hear them sung, one word at a time, as a tiny story.',
  },
  {
    href: '/games/soothesinger',
    title: 'SootheSinger',
    tag: 'BUGs · free · for a circle',
    blurb: 'A kind guide in a dark world. Ask of the past, the present or the future, for yourself or someone in your circle, and the answer is one sung word.',
  },
  {
    href: '/games/love',
    title: 'Love Game',
    tag: 'HUGs · free · county fair',
    blurb: 'Be Romeo, Juliette or a lover from the future. Your HUG Bear shoots tickling arrows of love and Red Flame arrows that sing, to win a ribbon and a HUG for your love.',
  },
  {
    href: '/games/hugs-kisses-wishes',
    title: 'HUGs, Kisses & Fantastic Wishes',
    tag: 'for two · free · one phone',
    blurb: 'A game for couples. Guess which HUG your partner picked, send each other sung love words for kisses, make Fantastic Wishes, and win a free HUG together.',
  },
  {
    href: '/games/extraordinary',
    title: 'Extraordinary',
    tag: 'free · 12 experiences',
    blurb: 'Feel the beat in your hand, watch music bloom, hear sounds circle your head, hum to summon one, and more.',
  },
];

/* One game a day, the same for everyone that day (UTC), walking the list in
   order so every game gets its day. /games/today sends a visitor to it, so one
   link can be shared every day and still lead somewhere new. */
export function gameOfTheDay(now: Date = new Date()): GameCard {
  const day = Math.floor(now.getTime() / 86_400_000);
  return GAMES[day % GAMES.length];
}
