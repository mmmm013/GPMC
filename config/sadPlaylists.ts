/* SIX SAD PLAYLISTS. GD, 2026-10-28: "Sad people need safe place to go & feel
   sad. I want to create 6 such SAD playlists w/ 9 discrete tracks. strive for diff
   tracks among. Divide by NEW SAD sub-categories." Then: "I approve. Flagship gets
   all, somehow. KLEIGH on KLEIGH, right?"

   Picked from the DISCO catalogue export (k-kut data/disco/exports/
   GPM-DISCO-FULL-POOL-2026-09-23.csv) by its own Mood/feel and Lyric-theme tags.
   54 tracks, every one distinct. Heartbreak first listed WORLD OF WORDS twice (two
   versions); the duet (72663750) came out and its slot went to My Eyes Tell It All
   (163579851), the next Heartbreak/Heartbroken-tagged vocal, slow, not a cover.

   `stream` is the song's id in k-kut.com/api/fm -- the same signed, expiring,
   stream-only list /listen plays (k-kut config/gpm-fms.v1.json). null means the song
   is not in that list yet, so it does not show: nothing is faked. Fill the id in
   when the song is added there and it appears.

   WHERE ARE YOU NOW? (DISCO 170829911) streams from the KLEIGH file the list keeps
   under its older DISCO id 113922063: same title, same artist, one ASCAP work. */

export type SadTrack = { discoId: string; title: string; artist: string; stream: string | null };
export type SadPlaylist = { name: string; tracks: SadTrack[] };

export const SAD_PLAYLISTS: SadPlaylist[] = [
  {
    name: "Loss",
    tracks: [
      { discoId: "175178233", title: "BATTLE CRIES", artist: "G Putnam Music", stream: "4e0e805e240b" },
      { discoId: "121721711", title: "LOVE RENEWS", artist: "KLEIGH", stream: "76bcc8e218c1" },
      { discoId: "167047442", title: "I'll Always Be Around", artist: "KLEIGH", stream: "0b383fa11b7a" },
      { discoId: "167047423", title: "Hurt Me For", artist: "KLEIGH", stream: "c62b608ef672" },
      { discoId: "69168056", title: "SOMEWHERE INSIDE", artist: "Cindy Youngren", stream: "c9a7bbbfd493" },
      { discoId: "73381075", title: "MY BABY LEFT ME - Female", artist: "Katie Beste", stream: "5fd8dc3c9164" },
      { discoId: "104069113", title: "DARK CLOUD - 1 - Piano", artist: "Katie Beste", stream: null },
      { discoId: "144130006", title: "TOUGH PEOPLE DO - S/S", artist: "KLEIGH", stream: null },
      { discoId: "148166619", title: "MEMORIES", artist: "KLEIGH", stream: "d2d94a280cb6" },
    ],
  },
  {
    name: "Heartbreak",
    tracks: [
      { discoId: "125624840", title: "WORLD OF WORDS LILLI-MICHAEL", artist: "Lilli O'Dowd & KLEIGH", stream: null },
      { discoId: "148168984", title: "Back to the Water", artist: "KLEIGH", stream: null },
      { discoId: "141693667", title: "HEART FOR MY SOUL", artist: "KLEIGH", stream: "758bb18b669b" },
      { discoId: "148168733", title: "SUBSONIC BLUES", artist: "KLEIGH", stream: "385630b4f370" },
      { discoId: "145591582", title: "WHEN THE HEART GETS IT WRONG", artist: "KLEIGH", stream: "36cf136ef062" },
      { discoId: "167047545", title: "Never Ever Ever", artist: "KLEIGH", stream: "02a4c5e47c69" },
      { discoId: "152025173", title: "WE'LL BE FREE", artist: "KLEIGH", stream: "9d3cbd0bf918" },
      { discoId: "69167992", title: "YOU AIN'T SAYIN'", artist: "Kris Bradley", stream: null },
      { discoId: "163579851", title: "My Eyes Tell It All", artist: "Sandy Sugar Smith", stream: "343cead0a903" },
    ],
  },
  {
    name: "Loneliness",
    tracks: [
      { discoId: "85638364", title: "MISTY MIDNIGHT BLUE - SINGER SONGWRITER MIX", artist: "Natu Visinia", stream: null },
      { discoId: "118995307", title: "DREAM OF YOU", artist: "Linda Putnam", stream: "b9a647364030" },
      { discoId: "123174367", title: "WITHOUT A SOUL", artist: "KLEIGH", stream: "35821e124119" },
      { discoId: "92181388", title: "BEIN' WITHOUT YOU", artist: "G Putnam Music", stream: "b391a5b488aa" },
      { discoId: "106875238", title: "THE ONLY FOREVER", artist: "Lloyd G Miller", stream: null },
      { discoId: "148171321", title: "EMPTY SPACE", artist: "KLEIGH", stream: "f854968e9507" },
      { discoId: "162491798", title: "The Meltdown", artist: "KLEIGH", stream: null },
      { discoId: "167047493", title: "LOOKIN' FOR AN ANGEL", artist: "Zach Jackson", stream: null },
      { discoId: "170829911", title: "WHERE ARE YOU NOW?", artist: "KLEIGH", stream: "5179e037bd2f" },
    ],
  },
  {
    name: "Longing",
    tracks: [
      { discoId: "161322850", title: "ALL THE THINGS", artist: "KLEIGH", stream: "9bc2cf6cd6ee" },
      { discoId: "146291500", title: "MORE THAN A FEELING TO ME", artist: "KLEIGH", stream: "cd50634f63d8" },
      { discoId: "148189121", title: "GOTTA BREATHE", artist: "KLEIGH", stream: "4334fe6eeaa9" },
      { discoId: "161323556", title: "GOD ONLY KNOWS", artist: "KLEIGH", stream: "81a49a6ce644" },
      { discoId: "166991126", title: "Hang On", artist: "NATU Visinia", stream: "3423771c935d" },
      { discoId: "167947802", title: "DIVE RIGHT INTO YOU", artist: "KLEIGH", stream: "022521200fe0" },
      { discoId: "74170651", title: "INTO THE LIGHT - DUO Harmonies", artist: "Emily Hope, Erik W Nelson", stream: null },
      { discoId: "118377375", title: "DREAMER'S DANCE", artist: "KLEIGH", stream: "77d91c0688a4" },
      { discoId: "121721707", title: "YOUR HEART POUNDIN'", artist: "KLEIGH", stream: "b42f284c732b" },
    ],
  },
  {
    name: "Regret",
    tracks: [
      { discoId: "64057123", title: "CROSSIN' WIRES - 1988", artist: "Scott Monti", stream: "7d3e00897eab" },
      { discoId: "167191228", title: "Thinkin' about You", artist: "Lilli O'Dowd", stream: null },
      { discoId: "64059751", title: "SAYING GOODBYE - Rec'd 1988 - East Houston", artist: "Amanda Johnson", stream: "561ce81d955c" },
      { discoId: "103578063", title: "BABY WE'RE THROUGH", artist: "Mick Fury", stream: "5e1eb3f6ece4" },
      { discoId: "163578890", title: "Didn't Mean To Fall", artist: "Rhonda Lester", stream: "6fa96500b7a9" },
      { discoId: "182116622", title: "Watched You Walk Away", artist: "KLEIGH", stream: "aa0a7a5e8e04" },
      { discoId: "152025176", title: "BOUGHT INTO YOUR GAME", artist: "KLEIGH", stream: "f746ef1a3ff3" },
      { discoId: "116639052", title: "FOREVER IT'S GOODBYE (for Victims of Abuse!)", artist: "KLEIGH", stream: "3264eb8ba0a0" },
      { discoId: "142442066", title: "BELIEVE IN LOVE", artist: "Elle Christine", stream: "6a7a4b365ad4" },
    ],
  },
  {
    name: "Fragile",
    tracks: [
      { discoId: "167047385", title: "Here in the Night", artist: "Lilli O'Dowd", stream: "752940298401" },
      { discoId: "143240033", title: "WHERE'S MY FRIEND?", artist: "KLEIGH", stream: "bac852b46268" },
      { discoId: "146291483", title: "MY REALITY", artist: "KLEIGH", stream: "49d4f43f9e80" },
      { discoId: "148170813", title: "CHANGED YOUR MIND", artist: "KLEIGH", stream: "574d4a7bd3fb" },
      { discoId: "174385235", title: "Live Free", artist: "KLEIGH", stream: null },
      { discoId: "148169111", title: "THE LAST TIME", artist: "KLEIGH", stream: "b15b886dcd30" },
      { discoId: "148169165", title: "DEVIL GET AWAY FROM ME", artist: "KLEIGH", stream: "7be667195ebb" },
      { discoId: "152025172", title: "I NEED AN ANGEL", artist: "KLEIGH", stream: "a5a05ea157e0" },
      { discoId: "148167092", title: "SAVING GRACE", artist: "KLEIGH", stream: "aa78073e0d7c" },
    ],
  },
];
