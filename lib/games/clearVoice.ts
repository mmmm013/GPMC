'use client';

/* Every TUG and BUG in a game is heard clearly (GD, 2026-10-22: "we must always
   ensure replay for MEANTs Tiers 2 - TUGs & 3 - BUGs, play slower, louder, so
   clearly audible. FAST is enemy slow is better than fast. Avoid fast but keep
   vocal/sound right." · "must be audible to human ear, which means slow & word
   start-to-end." · "make replay slower still").

   Slower: first play at 0.8x, Replay at 0.65x, with the voice's pitch kept, so it
   sounds like the singer, only unhurried. Louder: the voice is lifted through a
   compressor, so quiet words come up without loud ones clipping. Whole: always
   from the very start of the cut to its very end; nothing trims it. */
export const FIRST_PLAY_RATE = 0.8;
export const REPLAY_RATE = 0.65;
const LIFT = 2.2;

let ctx: AudioContext | null = null;
const lifted = new WeakSet<HTMLAudioElement>();

function lift(a: HTMLAudioElement) {
  if (lifted.has(a)) {
    if (ctx?.state === 'suspended') void ctx.resume();
    return;
  }
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const gain = ctx.createGain();
    gain.gain.value = LIFT;
    const level = ctx.createDynamicsCompressor();
    level.threshold.value = -18;
    level.ratio.value = 6;
    ctx.createMediaElementSource(a).connect(gain).connect(level).connect(ctx.destination);
    lifted.add(a);
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    /* Without Web Audio it still plays, at full volume. */
  }
}

function slow(a: HTMLAudioElement, rate: number) {
  const el = a as HTMLAudioElement & { preservesPitch?: boolean; webkitPreservesPitch?: boolean };
  el.preservesPitch = true;
  el.webkitPreservesPitch = true;
  a.defaultPlaybackRate = rate;
  a.playbackRate = rate;
  a.volume = 1;
}

/** Load and play one TUG or BUG: slow, lifted, start to end. */
export function playVoice(a: HTMLAudioElement, src: string): Promise<void> {
  a.crossOrigin = 'anonymous';
  a.loop = false;
  a.src = src;
  slow(a, FIRST_PLAY_RATE);
  lift(a);
  return a.play();
}

/** Hear it again, slower still, from its very first sound. */
export function replayVoice(a: HTMLAudioElement): Promise<void> {
  if (!a.src) return Promise.resolve();
  a.pause();
  a.currentTime = 0;
  slow(a, REPLAY_RATE);
  lift(a);
  return a.play();
}
