/* EVERY GPM VIDEO, ON THE FLAGSHIP. GD, 2026-10-28: "I want all videos on
   flagship. Keep KLEIGH videos as are on KLEIGH. Remember, KLEIGH on KLEIGH."

   Nothing here is copied. Each video plays from where it already lives, so a
   video replaced there is replaced here too (GD, 2026-10-12: "ensure link simply
   updates where it exists"). */

export type PlayVideo = {
  slug: string;
  title: string;
  note: string;
  seconds: number;
  portrait?: boolean;
  src: string;
  poster: string;
};

/* A video sold or gifted elsewhere: shown as a link to its own page, never as a file. */
export type LinkVideo = { title: string; note: string; href: string; until?: string };

/* MICHAEL CLAY (KLEIGH). The same files 2kleigh.com/videos plays, in the same
   running order (2kleigh config/michael-clay-videos.ts; #1 is Memories, GD,
   2026-10-22). They stay on 2kleigh.com; this page only points at them. */
const KLEIGH = 'https://www.2kleigh.com/videos/michael-clay';

function kleigh(slug: string, title: string, note: string, seconds: number, portrait = false): PlayVideo {
  return { slug, title, note, seconds, portrait, src: `${KLEIGH}/${slug}.mp4`, poster: `${KLEIGH}/${slug}.jpg` };
}

export const michaelClayVideos: PlayVideo[] = [
  kleigh('memories-acoustic', 'Memories', 'Acoustic', 317),
  kleigh('forever-its-goodbye-live', "Forever It's Goodbye", 'Live at the Golden Vine, Bendigo', 217, true),
  kleigh('over-and-over', 'Over and Over', 'Lyric video', 222),
  kleigh('youre-my-star', "You're My Star", 'Music video', 231),
  kleigh('naked', 'Naked', 'Industrial cinematic', 331),
  kleigh('this-highway', 'This Highway', 'Music video', 282),
  kleigh('if-i-only-had-a-brain', 'If I Only Had a Brain', 'Music video', 171),
];

/* HALLOWEEN. Bought or gifted at k-kut.com, watched on the buyer's private link.
   The public page for both is the Halloween classroom page, so that is where
   these point. They leave with Halloween, the same day the home page banner
   does (app/page.tsx). */
export const halloweenVideos: LinkVideo[] = [
  {
    title: 'The Cemetery Stomp',
    note: 'Halloween lyric video',
    href: 'https://www.k-kut.com/halloween-classroom',
    until: '2026-11-01T12:00:00Z',
  },
  {
    title: 'Tricks or Treats',
    note: 'Halloween video',
    href: 'https://www.k-kut.com/halloween-classroom',
    until: '2026-11-01T12:00:00Z',
  },
];

/* YOUTUBE: GD's channel "G Putnam Music, LLC - Normal" (@Songwriters-Normal).
   Not read yet, so nothing is listed. Add each video here as it is confirmed
   (title, note, and its youtube.com watch link); none are invented. */
export const youtubeVideos: LinkVideo[] = [];
