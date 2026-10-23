/* The guides' voices. GD, 2026-10-23: "Pull from MC interview & scripts, so
   all choices for male. Female, use computer until can find female."

   - The Kind Warlock speaks in Michael Clay's own recorded voice: short clips
     cut by time from his interview and his guide-script recording on k-kut.com
     (word times: /mnt/project-files/games/warlock-mc-clips.json). The interview
     is not approved for public use, so a clip plays ONLY while its id is in
     WARLOCK_APPROVED, which holds only what GD has approved.
     No clip ever says the retired store name.
   - The Kind Sorceress speaks with the phone's own computer voice (a female
     voice where the phone has one). GD: TEMPORARY, replaced once a female
     voice is recorded from a script.
   - The Lantern Keeper and the Seer of Yesterday have no voice yet: their
     words stay on screen.
   Slots with no Warlock clip (maybe, not yet, a heavy question, danger and
   988, goodbye, passing the phone) stay as words on screen. */
export type Slot = 'welcome' | 'choose' | 'after_pick' | 'ask_again' | 'yes' | 'past' | 'present' | 'future' | 'kindness'
  | 'asking' | 'maybe' | 'not_yet' | 'heavy' | 'danger' | 'pass' | 'goodbye';
export type Clip = { id: string; slot: Slot; text: string; src: string; start: number; end: number };

const INTERVIEW = 'https://www.k-kut.com/voices/mc-bot/welcome.m4a';
const GUIDE_SCRIPT = 'https://www.k-kut.com/audio/mc-bot/tug/script-whole-2.m4a';

export const WARLOCK_CLIPS: Clip[] = [
  { id: 'w01', slot: 'welcome', text: "Welcome.", src: GUIDE_SCRIPT, start: 2.82, end: 3.3 },
  { id: 'w02', slot: 'welcome', text: "You're in the right place.", src: GUIDE_SCRIPT, start: 97.02, end: 98.52 },
  { id: 'w03', slot: 'welcome', text: "We'll keep this simple.", src: GUIDE_SCRIPT, start: 98.88, end: 99.86 },
  // Re-cut 2026-10-23: the first w04 (28.22-29.98) actually said "Start here. This is the".
  { id: 'w04', slot: 'choose', text: "Choose the feeling you want to send.", src: GUIDE_SCRIPT, start: 20.9, end: 22.85 },
  { id: 'w05', slot: 'choose', text: "Start by listening first.", src: GUIDE_SCRIPT, start: 6.6, end: 8.12 },
  { id: 'w06', slot: 'choose', text: "Press play first.", src: GUIDE_SCRIPT, start: 11.78, end: 12.88 },
  { id: 'w07', slot: 'choose', text: "Hear the song moment.", src: GUIDE_SCRIPT, start: 13.58, end: 14.52 },
  { id: 'w08', slot: 'after_pick', text: "Good choice.", src: GUIDE_SCRIPT, start: 89.86, end: 90.4 },
  { id: 'w09', slot: 'after_pick', text: "I'll keep guiding you one step at a time.", src: GUIDE_SCRIPT, start: 91.36, end: 93.68 },
  { id: 'w10', slot: 'ask_again', text: "No problem.", src: GUIDE_SCRIPT, start: 77.36, end: 78.34 },
  { id: 'w11', slot: 'ask_again', text: "Let's start over", src: GUIDE_SCRIPT, start: 83.72, end: 84.82 },
  { id: 'w12', slot: 'ask_again', text: "Next, compare this one.", src: GUIDE_SCRIPT, start: 35.74, end: 37.58 },
  { id: 'w13', slot: 'yes', text: "It's going to be okay", src: INTERVIEW, start: 363.8, end: 364.66 },
  { id: 'w14', slot: 'yes', text: "This works.", src: INTERVIEW, start: 302.34, end: 302.96 },
  { id: 'w15', slot: 'yes', text: "It's not futile", src: INTERVIEW, start: 354.58, end: 355.9 },
  { id: 'w16', slot: 'yes', text: "That's just amazing.", src: INTERVIEW, start: 322.12, end: 322.58 },
  { id: 'w17', slot: 'yes', text: "I really needed to hear that today", src: INTERVIEW, start: 312.94, end: 314.66 },
  { id: 'w18', slot: 'past', text: "when I was younger", src: INTERVIEW, start: 29.66, end: 30.24 },
  { id: 'w19', slot: 'past', text: "got me through", src: INTERVIEW, start: 289.06, end: 289.54 },
  { id: 'w20', slot: 'past', text: "from above", src: INTERVIEW, start: 342.6, end: 343.14 },
  { id: 'w21', slot: 'present', text: "right now", src: INTERVIEW, start: 185.74, end: 186.22 },
  { id: 'w22', slot: 'present', text: "in the moment", src: INTERVIEW, start: 220.1, end: 220.78 },
  { id: 'w23', slot: 'present', text: "just living life", src: INTERVIEW, start: 221.2, end: 222.4 },
  { id: 'w24', slot: 'present', text: "a precious moment", src: INTERVIEW, start: 231.24, end: 231.94 },
  { id: 'w25', slot: 'future', text: "tomorrow you'll see things more clearly", src: INTERVIEW, start: 182.2, end: 185.06 },
  { id: 'w26', slot: 'future', text: "let me help you make it through the night", src: INTERVIEW, start: 187.32, end: 189.26 },
  { id: 'w27', slot: 'kindness', text: "heart of gold", src: INTERVIEW, start: 190.44, end: 190.96 },
  { id: 'w28', slot: 'kindness', text: "the treasure you hold", src: INTERVIEW, start: 191.32, end: 192.02 },
  { id: 'w29', slot: 'kindness', text: "this makes people feel", src: INTERVIEW, start: 302.96, end: 304.4 },
  { id: 'w30', slot: 'kindness', text: "other people need it too", src: INTERVIEW, start: 368.34, end: 369.36 },
  { id: 'w31', slot: 'kindness', text: "uplifting people", src: INTERVIEW, start: 359.46, end: 360.76 },
];

/* GD, 2026-10-23: "Auto-approve all. Issues will come from VOC." Every clip
   plays; a clip someone flags through VOC comes off this list. A clip that
   says the retired store name is never added (none of these 31 does). */
// GD, 2026-10-23, after listening: "Warlock clips YES: 1, 2, 3, 5, 6, 7, 8, 9, 10. NO: 4".
// w11 to w31 stay approved under his earlier "Auto-approve all". He then said "redo 4",
// heard the re-cut w04 above, and said "YES!" (2026-10-23).
const WARLOCK_REFUSED: string[] = [];
export const WARLOCK_APPROVED: string[] = WARLOCK_CLIPS.map((c) => c.id).filter((id) => !WARLOCK_REFUSED.includes(id));

/* Whether Michael's recorded voice plays in games. GD, 2026-10-23: "for now,
   using already agreed-upon voice for CMG. So, use now." Set false to keep
   the Warlock's words on screen only. */
export const MC_VOICE_IN_GAMES = true;

export function warlockClip(slot: Slot): Clip | null {
  if (!MC_VOICE_IN_GAMES) return null;
  const ok = WARLOCK_CLIPS.filter((c) => c.slot === slot && WARLOCK_APPROVED.includes(c.id));
  return ok.length ? ok[Math.floor(Math.random() * ok.length)] : null;
}

/* Plays one clip from its source, by time, then stops. A little air either
   side so no word is cut short. */
export function playClip(a: HTMLAudioElement, clip: Clip): Promise<void> {
  return new Promise((done) => {
    const from = Math.max(0, clip.start - 0.08);
    const to = clip.end + 0.12;
    const stop = () => {
      if (a.currentTime >= to) {
        a.pause();
        a.removeEventListener('timeupdate', stop);
        done();
      }
    };
    a.src = `${clip.src}#t=${from},${to}`;
    a.addEventListener('timeupdate', stop);
    a.onended = () => done();
    a.currentTime = from;
    a.play().catch(() => done());
  });
}

/* The Sorceress in Lisa's own voice. GD, 2026-10-23: "Lisa's Voice for Sorceress."
   She recorded all 27 script lines (two takes each of lines 16 and 17); each file is the
   whole line, cut clean. A line not approved stays in the phone's voice. */
const LISA = 'https://www.k-kut.com/voices/sorceress';
export const SORCERESS_CLIPS: Clip[] = [
  { id: 's01', slot: 'welcome', text: 'Come in. The candle is lit, and you are welcome here.', src: `${LISA}/s01.mp3`, start: 0, end: 4.86 },
  { id: 's02', slot: 'welcome', text: 'The night outside is long. In here there is a little light, and it is yours.', src: `${LISA}/s02.mp3`, start: 0, end: 6.27 },
  { id: 's03', slot: 'welcome', text: 'Sit with me. Ask what your heart is holding.', src: `${LISA}/s03.mp3`, start: 0, end: 3.68 },
  { id: 's04', slot: 'past', text: 'Shall I look back, into what has been? That is where I see most clearly.', src: `${LISA}/s04.mp3`, start: 0, end: 6.09 },
  { id: 's05', slot: 'present', text: 'Or shall I look at now, at this very hour?', src: `${LISA}/s05.mp3`, start: 0, end: 3.5 },
  { id: 's06', slot: 'future', text: 'Or shall we lift the curtain on what may come?', src: `${LISA}/s06.mp3`, start: 0, end: 3.19 },
  { id: 's07', slot: 'asking', text: 'Say your question out loud, or hold it quietly. I will hear it either way.', src: `${LISA}/s07.mp3`, start: 0, end: 6.14 },
  { id: 's08', slot: 'asking', text: 'Breathe once. Now let the answer find its way to you.', src: `${LISA}/s08.mp3`, start: 0, end: 4.99 },
  { id: 's09', slot: 'yes', text: 'The stars remember this. Yes.', src: `${LISA}/s09.mp3`, start: 0, end: 3.21 },
  { id: 's10', slot: 'yes', text: 'What was planted then has grown. Yes, and kindly so.', src: `${LISA}/s10.mp3`, start: 0, end: 6.71 },
  { id: 's11', slot: 'yes', text: 'The old roads all lead here. Yes.', src: `${LISA}/s11.mp3`, start: 0, end: 3.76 },
  { id: 's12', slot: 'yes', text: 'Your candle burns steady. Yes.', src: `${LISA}/s12.mp3`, start: 0, end: 3.66 },
  { id: 's13', slot: 'maybe', text: 'The mist has not lifted yet. Ask me again when the moon turns.', src: `${LISA}/s13.mp3`, start: 0, end: 5.56 },
  { id: 's14', slot: 'maybe', text: 'Some answers are still being woven. Be patient with this one.', src: `${LISA}/s14.mp3`, start: 0, end: 5.41 },
  { id: 's15', slot: 'maybe', text: 'I see two paths, and both are lit. The choice is still yours.', src: `${LISA}/s15.mp3`, start: 0, end: 6.32 },
  { id: 's16', slot: 'not_yet', text: 'Not this time. But nothing kind is ever wasted.', src: `${LISA}/s16.mp3`, start: 0, end: 4.26 },
  { id: 's16b', slot: 'not_yet', text: 'Not this time. But nothing kind is ever wasted.', src: `${LISA}/s16b.mp3`, start: 0, end: 4.18 },
  { id: 's17a', slot: 'not_yet', text: 'The door is closed for now. Doors open again.', src: `${LISA}/s17a.mp3`, start: 0, end: 4.26 },
  { id: 's17b', slot: 'not_yet', text: 'The door is closed for now. Doors open again.', src: `${LISA}/s17b.mp3`, start: 0, end: 3.94 },
  { id: 's18', slot: 'not_yet', text: 'Not yet. Hold on to what is good while you wait.', src: `${LISA}/s18.mp3`, start: 0, end: 4.31 },
  { id: 's19', slot: 'heavy', text: 'What you loved is kept. The past holds it safely, and so do you.', src: `${LISA}/s19.mp3`, start: 0, end: 6.87 },
  { id: 's20', slot: 'heavy', text: 'This is a hard road. You do not walk it alone.', src: `${LISA}/s20.mp3`, start: 0, end: 4.52 },
  { id: 's21', slot: 'heavy', text: 'I cannot read this one in the stars. I can only tell you that you matter.', src: `${LISA}/s21.mp3`, start: 0, end: 6.48 },
  { id: 's22', slot: 'danger', text: 'Please stay. You matter more than any answer. Call or text 988 now. Someone kind is there, right now.', src: `${LISA}/s22.mp3`, start: 0, end: 13.3 },
  { id: 's23', slot: 'ask_again', text: 'Another question? The candle is still lit.', src: `${LISA}/s23.mp3`, start: 0, end: 4.0 },
  { id: 's24', slot: 'ask_again', text: 'Ask again, or ask for someone you love.', src: `${LISA}/s24.mp3`, start: 0, end: 3.94 },
  { id: 's25', slot: 'pass', text: 'Pass the candle to the next one in the circle.', src: `${LISA}/s25.mp3`, start: 0, end: 3.63 },
  { id: 's26', slot: 'goodbye', text: 'Go gently. Carry a little light with you.', src: `${LISA}/s26.mp3`, start: 0, end: 3.66 },
  { id: 's27', slot: 'goodbye', text: 'Come back whenever the night is long.', src: `${LISA}/s27.mp3`, start: 0, end: 3.03 },
];
/* Only what GD has heard and said yes to plays. */
export const SORCERESS_APPROVED: string[] = [];

export function sorceressClip(slot: Slot): Clip | null {
  const ok = SORCERESS_CLIPS.filter((c) => c.slot === slot && SORCERESS_APPROVED.includes(c.id));
  return ok.length ? ok[Math.floor(Math.random() * ok.length)] : null;
}

/* The Sorceress's other lines: the phone's own voice, a female one where it has one. */
const FEMALE = /female|samantha|victoria|karen|moira|tessa|fiona|serena|zira|susan|allison|ava|joanna|salli|kendra|kimberly|emma|amy|jenny|aria|google uk english female|google us english/i;
export function speakSorceress(text: string): Promise<void> {
  return new Promise((done) => {
    try {
      const synth = window.speechSynthesis;
      if (!synth) return done();
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const voices = synth.getVoices().filter((v) => v.lang.startsWith('en'));
      u.voice = voices.find((v) => FEMALE.test(v.name)) ?? voices[0] ?? null;
      u.rate = 0.88;
      u.pitch = 1.05;
      u.onend = () => done();
      u.onerror = () => done();
      synth.speak(u);
    } catch {
      done();
    }
  });
}

export function hushGuide(a?: HTMLAudioElement | null) {
  try { window.speechSynthesis?.cancel(); } catch { /* none */ }
  a?.pause();
}
