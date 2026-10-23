/* The Sorceress or Warlock: the answer words and the choices around them.
   GD, 2026-10-23: "use all suggestions you made" (the fortune-game research,
   /mnt/project-files/games/fortune-ball-research.md), under his rules of the
   same day: no "magic", "ball" or "16"; past, present or future, past by
   default; a kind light amid darkness.

   The answer pool is weighted the classic way, 8 yes : 4 maybe : 4 not yet,
   so it leans toward hope. Each round (theme) has its own words, and no word
   repeats in a sitting until the pool runs dry. Every word below was checked on 2026-10-23
   to have a BUG on k-kut.com/api/kleigh-game (scope=all); a word that loses
   its BUG later is skipped and another from the same tone is tried. */
export { GAME_API, loadProgress, saveProgress, type GameElement } from './meantsGame';

export const STORE_KEY = 'meants-game:sixteen-ball:v4';
/* "Hear the whole song" goes to the full-song stream on this site. */
export const LISTEN_HREF = '/listen';

export type Tone = 'yes' | 'maybe' | 'no';
export type Round = 'everyday' | 'love' | 'holiday' | 'wedding';

export const TONE_WEIGHTS: [Tone, number][] = [['yes', 8], ['maybe', 4], ['no', 4]];

export const ROUNDS: Record<Round, { label: string } & Record<Tone, string[]>> = {
  everyday: {
    label: 'Everyday',
    yes: ['yes', 'yeah', 'sure', 'true', 'right', 'okay', 'believe', 'forever'],
    maybe: ['maybe', 'wait', 'wonder', 'sometimes', 'somehow', 'someday', 'soon', 'later', 'oh', 'really', 'dream', 'whoa'],
    no: ['no', 'stop', 'nothing', 'nowhere'],
  },
  love: {
    label: 'Love',
    yes: ['love', 'heart', 'forever', 'together', 'kiss', 'mine', 'yours', 'sweet', 'darling', 'promise', 'yes'],
    maybe: ['maybe', 'dream', 'wonder', 'someday', 'wait', 'oh'],
    no: ['no', 'stop', 'nothing'],
  },
  holiday: {
    label: 'Holiday',
    yes: ['christmas', 'snow', 'bells', 'santa', 'holiday', 'home', 'peace', 'winter', 'treat', 'yes'],
    maybe: ['maybe', 'wait', 'wonder', 'someday', 'soon'],
    no: ['no', 'stop', 'nothing'],
  },
  wedding: {
    label: 'Wedding',
    yes: ['vow', 'ring', 'promise', 'forever', 'together', 'wedding', 'love', 'true', 'home', 'yes'],
    maybe: ['maybe', 'someday', 'soon', 'dream', 'wait'],
    no: ['no', 'stop', 'nothing'],
  },
};

/* The third ask of the same question gets a cheeky answer ("you heard me"). */
export const CHEEKY = ['told', 'heard', 'again'];
/* Shaking far too hard: a sung "slow down". */
export const EASY = ['slow', 'slowly', 'breathe', 'calm'];

/* Words that comfort, for a question about loss, grief or illness. */
export const COMFORT = ['love', 'heart', 'forever', 'home', 'together', 'believe', 'dream', 'true', 'promise'];

/* Reading the typed question, so the answer fits it (the "sensitive" rule):
   - harm: a question about self-harm or danger gets no fortune at all, only a
     kind line and where to find help.
   - grief: loss, grief or illness never gets a "not yet", only comfort.
   - love: a love question is answered from the Love round's words.
   - plain: everything else, from tonight's round.
   Every answer word is one that names nobody's gender (no baby, girl, him, her),
   so it fits whoever sends it and whoever hears it. A question that was never
   typed is read as plain. Nothing typed ever leaves the phone. */
export type Reading = 'harm' | 'grief' | 'love' | 'plain';

const HARM = /\b(suicid\w*|kill (my ?self|me)|end (my|it all)|want to die|wanna die|better off dead|hurt(ing)? my ?self|self[- ]?harm|cut(ting)? my ?self|overdose|no reason to live|not (want to )?be here|hits? me|hurts? me|abus\w*|in danger|unsafe at home)\b/i;
const GRIEF = /\b(died|dies|dying|death|dead|passed( away| on)?|funeral|grave|grief|griev\w*|mourn\w*|heaven|cancer|sick|illness|ill|hospital|hospice|surgery|diagnos\w*|chemo|miss(ing)? (my|him|her|them)|lost my|loss)\b/i;
const LOVE = /\b(love[sd]?|loving|crush|date|dating|marr(y|ied|iage)|wedding|propos\w*|kiss\w*|boyfriend|girlfriend|husband|wife|partner|fianc\w*|romance|romantic|soulmate|like[sd]? me|ex)\b/i;

export function readQuestion(q: string): Reading {
  if (HARM.test(q)) return 'harm';
  if (GRIEF.test(q)) return 'grief';
  if (LOVE.test(q)) return 'love';
  return 'plain';
}
