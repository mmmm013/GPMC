/* SERVER ONLY. Michael Scherer's sweet spots for the flyby promo on every page about him.
   GD, 2026-11-28: "we got to make sure they hear some Michael whenever they get their anything
   doing with dealing with Michael. He's got some tremendous sweet spots. We just got to rotate
   those and do promos, flyby promos I've done with Brave and Bravo ... in regular pages."

   Nothing here is a new cut. Every clip is one already cut and already streaming on Sunday Riff
   Runs (lib/riffRuns/riffs.json, bucket audio-output/riff-runs/). Each song was checked against
   ASCAP (k-kut data/rights/ASCAP-WORKS-CATALOG-2026-10-08.csv), where Michael is a writer as
   SCHERER, MICHAEL DOUGLAS / SHERER, MICHAEL D. The ASCAP title is beside each song.
   No storage path, clip name or song title ever reaches a page or a response. */

type Song = { ascap: string; keys: string[] };

const SONGS: Song[] = [
  { ascap: 'I LIVE FREE - INSTRUMENTAL', keys: ['swsp_175180466_04'] },
  { ascap: "BLINKIN' ABOUT YOU - INSTRUMENTAL", keys: ['swsp_84628320_03'] },
  { ascap: "AM MISSIN' YOU - INSTRUMENTAL", keys: ['swsp_84628321_04', 'swsp_84628321_06'] },
  {
    ascap: 'I LIKE TO LIKE - INSTRUMENTAL',
    keys: [
      'swsp_85598810_02', 'swsp_85598810_03', 'swsp_85598810_05', 'swsp_85598810_06', 'swsp_85598810_07',
      'swsp_85598810_08', 'swsp_85598810_09', 'swsp_85598810_10', 'swsp_85598810_11', 'swsp_85598810_14',
      'swsp_85598810_17', 'swsp_85598810_20', 'swsp_85598810_27', 'swsp_85598810_30', 'swsp_85598810_31',
      'swsp_85598810_33', 'swsp_85598810_35',
    ],
  },
  { ascap: 'BOUNCE ALONG - INSTRUMENTAL', keys: ['swsp_94642662_02', 'swsp_94642662_04'] },
  {
    ascap: 'FAST LANES - INSTRUMENTAL',
    keys: ['swsp_94642663_02', 'swsp_94642663_03', 'swsp_94642663_04', 'swsp_94642663_05', 'swsp_94642663_06'],
  },
];

/** The clip for a visit's number: a song first, so every song comes round, then one of its clips. */
export function sweetSpotKey(n: number): string {
  const i = Math.abs(Math.trunc(n)) || 0;
  const song = SONGS[i % SONGS.length];
  return song.keys[Math.floor(i / SONGS.length) % song.keys.length];
}
