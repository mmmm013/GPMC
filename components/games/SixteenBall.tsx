'use client';

import { gameEvent } from '@/lib/games/gameEvent';
import VoicePlayer from './VoicePlayer';
import { playVoice } from '@/lib/games/clearVoice';
import { useEffect, useRef, useState } from 'react';
import { MOODS_FOR_PACE, SERENADE, useNugPlayer, usePlayerSense } from '@/lib/games/adaptive';
import {
  CHEEKY, COMFORT, EASY, GAME_API, LISTEN_HREF, ROUNDS, STORE_KEY, TONE_WEIGHTS,
  loadProgress, readQuestion, saveProgress, type GameElement, type Round, type Tone,
} from '@/lib/games/seer';
import { WARLOCK_APPROVED, hushGuide, playClip, speakSorceress, warlockClip, type Slot } from '@/lib/games/guideVoice';

/* The Sorceress or Warlock (it began as 16-Ball, the old fortune toy remade).
   GD, 2026-10-23: "Let's make it The Sorceress or Warlock. with air of kindness
   & goodness amidst darkness in the world. Avoid MAGIC AND BALL & "16". Instead,
   refer in magical terms, past, present, OR future. Default to past. ... Offer
   choices upfront, maybe in several ways but do not overwhelm user." Then "use
   all suggestions you made" (the fortune-game research): the answer rises
   slowly out of a haze, a weighted yes/maybe/not-yet pool, teasing maybes, a
   phone shake with a button fallback, a swirl, a buzz and a chime, asking out
   loud (typing optional), ask again, its own look (a glowing record), sending
   the answer on as a link, a circle with a light score, themed rounds, the song
   named under the answer, a grand answer now and then, an answer of the day,
   and a joke for shaking far too hard. Then "can we adopt all?" of the names
   offered: four guides (Kind Sorceress, Kind Warlock, Lantern Keeper, Seer of
   Yesterday), three ways to ask (Three Candles, Seven Stars, Thirteen), and
   "What the Stars Remember" for the answer of the day. And "How to manage
   answers & arrays of answers? Want it DYNAMIC and "sensitive"": answers are
   drawn live, never repeat in a sitting, and fit the question (see readQuestion
   in lib/games/seer.ts).
   The Kind Warlock speaks in Michael Clay's recorded voice (only clips GD has
   approved) and the Kind Sorceress in the phone's computer voice, per GD's
   ruling in lib/games/guideVoice.ts; the other guides' lines stay on screen.
   Every sung answer is a real Element. A circle plays: a couple, friends, ideally up to 8, but anyone can
   join. The question stays on this phone unless the player chooses to send it.
   Internal ids (16-ball, the store key) are unchanged. */
type Guide = 'sorceress' | 'warlock' | 'lantern' | 'seer';
type Way = 'candles' | 'stars' | 'thirteen';
type Time = 'past' | 'present' | 'future';
type Score = { yes: number; maybe: number; no: number };
type Circle = { players: string[]; turn: number; guide: Guide; way: Way; round: Round; scores: Score[]; lit: number; day: string };
type Found = { element: GameElement | null; tone: Tone; line: string; grand: boolean; time: Time };
type Shown = Found & { element: GameElement };
type Arrival = { word: string; time: Time; guide: Guide; q: string };

const SOMEONE_ELSE = -1;
const ALL_OF_US = -2;
const nameOf = (players: string[], i: number) => players[i]?.trim() || `Player ${i + 1}`;
const join = GAME_API.includes('?') ? '&' : '?';
const today = () => new Date().toISOString().slice(0, 10);
const shuffle = <T,>(list: T[]) => [...list].sort(() => Math.random() - 0.5);
const NO_SCORE: Score = { yes: 0, maybe: 0, no: 0 };

const GUIDES: Record<Guide, { name: string; sign: string; line: string }> = {
  sorceress: { name: 'The Kind Sorceress', sign: '☾', line: 'Wise and warm, a light in a dark world.' },
  warlock: { name: 'The Kind Warlock', sign: '✶', line: 'Gentle and good, a keeper of the light.' },
  lantern: { name: 'The Lantern Keeper', sign: '✺', line: 'Holds a small flame up against the night.' },
  seer: { name: 'The Seer of Yesterday', sign: '☉', line: 'Remembers what the years have kept for you.' },
};

const WAYS: Record<Way, { name: string; count: number; line: string }> = {
  candles: { name: 'Three Candles', count: 3, line: 'One question, three answers: the past, the present, the future.' },
  stars: { name: 'Seven Stars', count: 7, line: 'Seven questions around the circle, one star for each.' },
  thirteen: { name: 'Thirteen', count: 13, line: 'The party circle: thirteen answers, a light score, questions for all.' },
};

const TIMES: Record<Time, { label: string; look: (g: string) => string; says: (g: string) => string }> = {
  past: { label: 'The past', look: (g) => `${g} looks back through the years.`, says: (g) => `From the past, ${inLine(g)} brings you` },
  present: { label: 'The present', look: (g) => `${g} reads this very moment.`, says: (g) => `For now, ${inLine(g)} offers` },
  future: { label: 'The future', look: (g) => `${g} gazes down the road ahead.`, says: (g) => `Ahead, ${inLine(g)} sees` },
};
const CANDLE_TIMES: Time[] = ['past', 'present', 'future'];
/* A guide's name inside a sentence: "Ask the Lantern Keeper", not "Ask The Lantern Keeper". */
const inLine = (name: string) => name.replace(/^The /, 'the ');

function pickTone(): Tone {
  const total = TONE_WEIGHTS.reduce((n, [, w]) => n + w, 0);
  let r = Math.random() * total;
  for (const [tone, w] of TONE_WEIGHTS) {
    if ((r -= w) < 0) return tone;
  }
  return 'yes';
}

/* The same word for everyone on the same day. */
function dailyWord(words: string[], day: string) {
  let h = 0;
  for (const c of day) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return words[h % words.length];
}

async function bugFor(word: string): Promise<GameElement | null> {
  try {
    const body = (await (await fetch(`${GAME_API}${join}${new URLSearchParams({ kind: 'bug', word })}`, { cache: 'no-store' })).json()) as { element: GameElement | null };
    return body.element;
  } catch {
    return null;
  }
}

/* One answer from a list of words: the first that is sung, else the old draw. */
async function firstSung(words: string[]): Promise<GameElement | null> {
  for (const w of words.slice(0, 4)) {
    const el = await bugFor(w);
    if (el) return el;
  }
  try {
    const body = (await (await fetch(`${GAME_API}${join}kind=ball`, { cache: 'no-store' })).json()) as { element: GameElement | null };
    return body.element;
  } catch {
    return null;
  }
}

/* A soft swirl while the light listens, a buzz on phones that can, and one chime when the answer lands. */
let sfx: AudioContext | null = null;
function audioCtx() {
  try {
    sfx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (sfx.state === 'suspended') void sfx.resume();
    return sfx;
  } catch {
    return null;
  }
}
function swirl() {
  try { navigator.vibrate?.([40, 60, 40]); } catch { /* no buzz */ }
  const c = audioCtx();
  if (!c) return;
  const len = c.sampleRate * 1.6;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.sin((Math.PI * i) / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const band = c.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.setValueAtTime(400, c.currentTime);
  band.frequency.linearRampToValueAtTime(1400, c.currentTime + 1.6);
  const vol = c.createGain();
  vol.gain.value = 0.12;
  src.connect(band).connect(vol).connect(c.destination);
  src.start();
}
function chime() {
  const c = audioCtx();
  if (!c) return;
  for (const [f, v] of [[660, 0.08], [990, 0.04]] as const) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.frequency.value = f;
    g.gain.setValueAtTime(v, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 1.4);
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + 1.5);
  }
}

export default function SixteenBall() {
  const audio = useRef<HTMLAudioElement>(null);
  const guideAudio = useRef<HTMLAudioElement>(null);
  const [voiceOn, setVoiceOn] = useState(true);
  const [circle, setCircle] = useState<Circle>(() =>
    loadProgress<Circle>(STORE_KEY, { players: [], turn: 0, guide: 'sorceress', way: 'stars', round: 'everyday', scores: [], lit: 0, day: '' }),
  );
  const [draft, setDraft] = useState<string[]>(() => (circle.players.length ? circle.players : ['', '']));
  const [guide, setGuide] = useState<Guide>(circle.guide);
  const [way, setWay] = useState<Way>(circle.way);
  const [round, setRound] = useState<Round>(circle.round);
  const [gathering, setGathering] = useState(circle.players.length === 0);
  const [arrival, setArrival] = useState<Arrival | null>(null);
  const [forWhom, setForWhom] = useState<number | null>(null);
  const [time, setTime] = useState<Time>('past');
  const [candle, setCandle] = useState(0);
  const [question, setQuestion] = useState('');
  const [asks, setAsks] = useState(0);
  const [shown, setShown] = useState<Shown | null>(null);
  const [care, setCare] = useState(false);
  const [withQ, setWithQ] = useState(false);
  const [clear, setClear] = useState(false);
  const [spin, setSpin] = useState(0);
  const [busy, setBusy] = useState(false);
  const [bubbles, setBubbles] = useState(false);
  const [motion, setMotion] = useState<'off' | 'on' | 'none'>('off');
  const [message, setMessage] = useState('');
  const sense = usePlayerSense();
  const nugs = useNugPlayer();
  const touchRef = useRef<() => void>(() => {});
  const tooHardRef = useRef<() => void>(() => {});
  /* Words already sung this sitting: none comes back until its pool runs dry. */
  const used = useRef(new Set<string>());

  /* An answer someone sent: ?w=word&t=past&g=sorceress&q=… */
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const word = (p.get('w') ?? '').toLowerCase();
    if (!/^[a-z']{1,24}$/.test(word)) return;
    const t = p.get('t');
    const gd = p.get('g') ?? '';
    setArrival({
      word,
      time: t === 'present' || t === 'future' ? t : 'past',
      guide: gd in GUIDES ? (gd as Guide) : 'sorceress',
      q: (p.get('q') ?? '').slice(0, 120),
    });
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof DeviceMotionEvent === 'undefined') setMotion('none');
  }, []);

  /* Shaking the phone: three strong jolts touch the light; shaking on and on is too hard. */
  useEffect(() => {
    if (motion !== 'on') return;
    let jolts: number[] = [];
    const onMove = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a || a.x == null || a.y == null || a.z == null) return;
      const force = Math.abs(Math.hypot(a.x, a.y, a.z) - 9.8);
      if (force < 12) return;
      const now = Date.now();
      jolts = [...jolts.filter((t) => now - t < 3000), now];
      if (jolts.length >= 14) {
        jolts = [];
        tooHardRef.current();
      } else if (jolts.filter((t) => now - t < 1000).length === 3) {
        touchRef.current();
      }
    };
    window.addEventListener('devicemotion', onMove);
    return () => window.removeEventListener('devicemotion', onMove);
  }, [motion]);

  async function wakeMotion() {
    const D = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> };
    try {
      if (typeof D.requestPermission === 'function') {
        setMotion((await D.requestPermission()) === 'granted' ? 'on' : 'none');
      } else {
        setMotion('on');
      }
    } catch {
      setMotion('none');
    }
  }

  /* A fresh word from a list: the first that is sung, never one already sung tonight. */
  async function pick(words: string[], first?: string) {
    let left = words.filter((w) => !used.current.has(w));
    if (!left.length) {
      words.forEach((w) => used.current.delete(w));
      left = words;
    }
    const el = await firstSung(first ? [first, ...shuffle(left.filter((w) => w !== first))] : shuffle(left));
    if (el) used.current.add(el.words.toLowerCase());
    return el;
  }

  /* Too hard: the haze fills with bubbles and a sung "slow down" before it clears. */
  async function tooHard() {
    if (bubbles) return;
    audio.current?.pause();
    nugs.stop();
    setBubbles(true);
    setBusy(true);
    setMessage('Easy… the light needs a breath.');
    const el = await firstSung(shuffle(EASY));
    const a = audio.current;
    if (el && a) void playVoice(a, el.src).catch(() => {});
    else void nugs.playAlone(SERENADE);
    setTimeout(() => {
      setBubbles(false);
      setBusy(false);
      setMessage('');
      sense.settle();
    }, 4500);
  }
  tooHardRef.current = () => void tooHard();

  /* Rapid taps read as the same thing as shaking too hard. */
  useEffect(() => {
    if (sense.frustrated) void tooHard();
  }, [sense.frustrated]); // eslint-disable-line react-hooks/exhaustive-deps

  const players = circle.players;
  const asker = players.length ? circle.turn % players.length : 0;
  const askerName = nameOf(players, asker);
  const nextName = nameOf(players, (asker + 1) % Math.max(1, players.length));
  const g = GUIDES[arrival?.guide ?? circle.guide];
  const w = WAYS[circle.way];
  const askTime: Time = circle.way === 'candles' ? CANDLE_TIMES[candle] : time;

  function keep(next: Circle) {
    setCircle(next);
    saveProgress(STORE_KEY, next);
  }

  /* The guide speaks, when it has a voice: the Sorceress says the words on
     screen; the Warlock plays one approved clip for the moment, or stays quiet. */
  const hasVoice = (k: Guide) => k === 'sorceress' ? typeof window !== 'undefined' && 'speechSynthesis' in window : k === 'warlock' && WARLOCK_APPROVED.length > 0;
  function say(k: Guide, slot: Slot | null, text: string) {
    if (!voiceOn || !hasVoice(k)) return;
    if (k === 'sorceress') {
      if (text) void speakSorceress(text);
      return;
    }
    const clip = slot && warlockClip(slot);
    const a = guideAudio.current;
    if (clip && a) void playClip(a, clip);
  }

  function begin() {
    sense.tap();
    const names = draft.map((d) => d.trim().slice(0, 24));
    keep({ ...circle, players: names, turn: 0, guide, way, round, scores: names.map(() => NO_SCORE), lit: 0 });
    setGathering(false);
    resetTurn();
    /* After the turn screen (and its guide player) is on screen. */
    setTimeout(() => say(guide, 'welcome', `${GUIDES[guide].name}. ${GUIDES[guide].line}`), 300);
  }

  function resetTurn() {
    hushGuide(guideAudio.current);
    setForWhom(null);
    setTime('past');
    setCandle(0);
    setQuestion('');
    setWithQ(false);
    setAsks(0);
    setShown(null);
    setCare(false);
    setClear(false);
    setMessage('');
  }

  /* Anyone can join, any time: a new player takes a seat at the end of the circle. */
  function seat() {
    keep({ ...circle, players: [...players, ''], scores: [...circle.scores, NO_SCORE] });
    setDraft([...players, '']);
  }

  /* The reveal: a swirl and a hum while the light listens (never an instant
     answer), then the word rises out of the haze as the voice fades up. */
  async function reveal(find: () => Promise<Found>) {
    sense.tap();
    nugs.stop();
    audio.current?.pause();
    hushGuide(guideAudio.current);
    setBusy(true);
    setMessage('');
    setShown(null);
    setClear(false);
    setSpin((s) => s + 540 + Math.floor(Math.random() * 360));
    swirl();
    void nugs.ambient(['Atmospheric', 'Dreamy']);
    const [found] = await Promise.all([find(), new Promise((r) => setTimeout(r, 2200))]);
    nugs.stop();
    setBusy(false);
    if (!found.element) {
      setMessage('The mists are thick. Touch the light again.');
      return null;
    }
    const el = found.element;
    setShown({ ...found, element: el });
    chime();
    setTimeout(() => setClear(true), 60);
    const a = audio.current;
    if (a) {
      if (found.grand) void nugs.bedUnder(a, ['Cinematic', 'Epic', 'Uplifting']);
      else if (sense.pace !== 'quick') void nugs.bedUnder(a, MOODS_FOR_PACE[sense.pace]);
      a.onended = sense.pace === 'quick' && !found.grand ? () => void nugs.playAlone(MOODS_FOR_PACE.quick) : null;
      void playVoice(a, el.src).catch(() => setMessage('Tap play to hear the answer.'));
      /* When the sung answer ends, the guide speaks its line. */
      const k = arrival?.guide ?? circle.guide;
      const follow = [found.line, 'Offered with kindness. Carry it gently.'].filter(Boolean).join(' ');
      const slot: Slot | null = found.tone === 'maybe' || found.tone === 'no' || found.line.startsWith(GUIDES[k].name + ' looks back') ? null : found.grand ? 'yes' : 'kindness';
      a.addEventListener('ended', () => say(k, slot, follow), { once: true });
      /* The voice arrives from far away. */
      a.volume = 0;
      const t0 = Date.now();
      const rise = setInterval(() => {
        const v = Math.min(1, (Date.now() - t0) / 1200);
        a.volume = v;
        if (v >= 1) clearInterval(rise);
      }, 50);
    }
    return found;
  }

  async function touch() {
    if (busy || care || forWhom === null || (shown && asks === 0)) return;
    /* The typed question decides how the guide may answer; it is read here, on the phone, and never sent. */
    const reading = readQuestion(question);
    if (reading === 'harm') {
      gameEvent('game_start', { game: '16-ball', round: 'care' });
      setCare(true);
      return;
    }
    const pool = ROUNDS[reading === 'love' ? 'love' : circle.round];
    const day = today();
    const cheeky = asks >= 2;
    const daily = !cheeky && asks === 0 && circle.day !== day && reading === 'plain';
    const t = askTime;
    gameEvent('game_start', { game: '16-ball', round: `${forWhom === asker ? 'self' : forWhom === ALL_OF_US ? 'all' : 'other'}:${t}:${circle.way}:${circle.round}` });
    const found = await reveal(async () => {
      if (cheeky) return { element: await pick(CHEEKY), tone: 'maybe', line: 'You heard me.', grand: false, time: t };
      if (reading === 'grief') {
        return { element: await pick(COMFORT), tone: 'yes', line: `${g.name} looks back to where love was, and where it still is.`, grand: false, time: 'past' };
      }
      if (daily) {
        return { element: await pick(pool.yes, dailyWord(pool.yes, day)), tone: 'yes', line: "What the Stars Remember: everyone's first answer today is this one.", grand: false, time: t };
      }
      const tone = pickTone();
      const line =
        tone === 'maybe'
          ? `${g.name} is thinking… ask again, if you dare.`
          : tone === 'no'
            ? circle.way === 'thirteen' ? `Not yet, says ${inLine(g.name)}. The night is young.` : `Not yet. ${g.name} answers gently.`
            : '';
      return { element: await pick(pool[tone]), tone, line, grand: tone === 'yes' && Math.random() < 1 / 8, time: t };
    });
    if (!found) return;
    gameEvent('game_finish', { game: '16-ball', round: found.tone });
    const scores = players.map((_, i) => circle.scores[i] ?? NO_SCORE);
    if (scores[asker]) scores[asker] = { ...scores[asker], [found.tone]: scores[asker][found.tone] + 1 };
    const counts = asks === 0 && circle.way !== 'candles';
    keep({ ...circle, scores, lit: counts ? circle.lit + 1 : circle.lit, day: daily ? day : circle.day });
  }
  touchRef.current = () => void (arrival ? hearSent() : touch());

  async function hearSent() {
    if (!arrival || busy || shown) return;
    await reveal(async () => ({ element: await firstSung([arrival.word]), tone: 'yes', line: '', grand: false, time: arrival.time }));
  }

  function askAgain() {
    say(circle.guide, 'ask_again', '');
    setAsks((n) => n + 1);
    setShown(null);
    setClear(false);
    setMessage('');
  }

  function nextCandle() {
    sense.tap();
    audio.current?.pause();
    setCandle((c) => c + 1);
    say(circle.guide, CANDLE_TIMES[candle + 1], TIMES[CANDLE_TIMES[candle + 1]].look(g.name));
    setAsks(0);
    setShown(null);
    setClear(false);
    setMessage('');
  }

  function passOn() {
    sense.tap();
    nugs.stop();
    audio.current?.pause();
    keep({ ...circle, turn: circle.turn + 1 });
    resetTurn();
  }

  function beginAgain() {
    sense.tap();
    nugs.stop();
    audio.current?.pause();
    keep({ ...circle, turn: circle.turn + 1, lit: 0, scores: players.map(() => NO_SCORE) });
    resetTurn();
  }

  function askYourOwn() {
    window.history.replaceState(null, '', window.location.pathname);
    audio.current?.pause();
    setArrival(null);
    resetTurn();
  }

  const light = (onTouch: () => void, ready: boolean) => (
    <button type="button" onClick={onTouch} disabled={!ready} aria-label="Touch the light"
      className={`relative mt-8 aspect-square w-72 max-w-full rounded-full shadow-[0_0_90px_rgba(255,171,64,0.45)] disabled:cursor-default ${ready ? '' : 'opacity-60'}`}>
      {/* A record in the dark, its grooves catching an amber and rose glow. */}
      <span className="absolute inset-0 rounded-full"
        style={{ background: 'repeating-radial-gradient(circle, #1b0f12 0 2px, #2c1a20 2px 4px)' }} />
      <span className="absolute inset-0 rounded-full transition-transform duration-[2200ms] ease-out"
        style={{ background: 'conic-gradient(from 0deg, transparent, rgba(255,193,7,0.35), transparent 30%, rgba(236,64,122,0.3), transparent 60%, rgba(255,193,7,0.3), transparent)', transform: `rotate(${spin}deg)` }} />
      <span className={`absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,236,179,0.35),transparent_60%)] ${busy ? 'animate-pulse' : ''}`} />
      {bubbles && (
        <span className="absolute inset-0 overflow-hidden rounded-full" aria-hidden>
          {Array.from({ length: 14 }, (_, i) => (
            <span key={i} className="absolute animate-ping rounded-full border border-white/60"
              style={{ left: `${10 + ((i * 37) % 80)}%`, top: `${10 + ((i * 53) % 80)}%`, width: 10 + (i % 4) * 8, height: 10 + (i % 4) * 8, animationDelay: `${(i % 5) * 0.2}s` }} />
          ))}
        </span>
      )}
      <span className="absolute left-1/2 top-1/2 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[radial-gradient(circle,#ffcc80,#f06292_70%,#4a148c)] p-2 text-[#1b0f12]">
        {busy ? (
          <span className="text-sm font-black uppercase tracking-[0.15em] text-white">Listening…</span>
        ) : shown ? (
          <span className={`text-2xl font-black leading-tight transition-all duration-[1500ms] ${clear ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-3 opacity-0 blur-md'}`}>
            {shown.element.words}
          </span>
        ) : (
          <span className="text-5xl text-white" aria-hidden>{g.sign}</span>
        )}
      </span>
    </button>
  );

  const wake = motion === 'off' && (
    <button type="button" onClick={() => void wakeMotion()} className="mt-4 text-sm font-bold text-[#FFD54F] underline-offset-4 hover:underline">
      Wake the light, so a shake of the phone works too
    </button>
  );

  const answerBlock = shown && (
    <div className="mt-4 w-full max-w-md">
      {shown.grand && <p className="text-lg font-black uppercase tracking-[0.2em] text-[#FFD54F]">✦ A grand answer ✦</p>}
      {shown.line && <p className="text-base italic text-[#EDE7F6]">{shown.line}</p>}
      {shown.element.song && (
        <p className="mt-2 text-sm text-[#D7CCC8]">
          Sung in {shown.element.song}.{' '}
          <a href={LISTEN_HREF} className="font-bold text-[#FFD54F] underline-offset-4 hover:underline">Hear the whole song</a>
        </p>
      )}
      <p className="mt-2 text-base italic text-[#EDE7F6]">Offered with kindness. Carry it gently.</p>
    </div>
  );

  /* Someone sent an answer: they touch their own light to hear it. */
  if (arrival) {
    return (
      <div className="flex flex-col items-center text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#FFD54F]">An answer was sent to you</p>
        <p className="mt-3 max-w-md text-lg text-[#EDE7F6]">
          {shown ? `${TIMES[arrival.time].says(g.name)}:` : `Someone asked ${inLine(g.name)} of ${TIMES[arrival.time].label.toLowerCase()}, for you.`}
        </p>
        {arrival.q && <p className="mt-2 max-w-md text-lg font-bold">&ldquo;{arrival.q}&rdquo;</p>}
        {light(() => void hearSent(), !busy && !shown)}
        {!shown && !busy && <p className="mt-3 text-sm text-[#D7CCC8]">Breathe in, breathe out, and touch the light.</p>}
        {wake}
        <VoicePlayer ref={audio} className="mt-8 w-full max-w-md" />
        {answerBlock}
        {message && <p className="mt-4 text-[#D7CCC8]" role="status">{message}</p>}
        <button type="button" onClick={askYourOwn} className="mt-6 min-h-12 rounded-2xl bg-[#FFD54F] px-6 font-bold text-black">
          Ask your own
        </button>
      </div>
    );
  }

  const step = 'mt-8 text-sm font-bold uppercase tracking-[0.2em] text-[#FFD54F]';
  if (gathering) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <p className={step.replace('mt-8', 'mt-0')}>1 · Choose your guide</p>
        <div className="mt-3 grid w-full grid-cols-2 gap-3" role="radiogroup" aria-label="Guide">
          {(Object.keys(GUIDES) as Guide[]).map((k) => (
            <button key={k} type="button" role="radio" aria-checked={guide === k} onClick={() => setGuide(k)}
              className={`rounded-2xl border-2 p-3 ${guide === k ? 'border-[#FFD54F] bg-[#2a1840]' : 'border-white/20 bg-black/30'}`}>
              <span className="block text-3xl text-[#FFD54F]" aria-hidden>{GUIDES[k].sign}</span>
              <span className="mt-1 block text-base font-black leading-tight">{GUIDES[k].name}</span>
              <span className="mt-1 block text-xs text-[#D7CCC8]">{GUIDES[k].line}</span>
            </button>
          ))}
        </div>

        <p className={step}>2 · Choose how to ask</p>
        <div className="mt-3 grid w-full gap-2" role="radiogroup" aria-label="How to ask">
          {(Object.keys(WAYS) as Way[]).map((k) => (
            <button key={k} type="button" role="radio" aria-checked={way === k} onClick={() => setWay(k)}
              className={`rounded-2xl border-2 px-4 py-3 text-left ${way === k ? 'border-[#FFD54F] bg-[#2a1840]' : 'border-white/20 bg-black/30'}`}>
              <span className="block text-lg font-black">{WAYS[k].name}</span>
              <span className="block text-sm text-[#D7CCC8]">{WAYS[k].line}</span>
            </button>
          ))}
        </div>

        <p className={step}>3 · Gather your circle</p>
        <p className="mt-2 text-xl font-bold">How many are seated?</p>
        <div className="mt-4 flex items-center gap-6">
          <button type="button" aria-label="One fewer" disabled={draft.length <= 1} onClick={() => setDraft(draft.slice(0, -1))}
            className="h-14 w-14 rounded-full border-2 border-[#FFD54F] text-3xl font-black text-[#FFD54F] disabled:opacity-30">−</button>
          <span className="w-16 text-5xl font-black">{draft.length}</span>
          <button type="button" aria-label="One more" onClick={() => setDraft([...draft, ''])}
            className="h-14 w-14 rounded-full border-2 border-[#FFD54F] text-3xl font-black text-[#FFD54F]">+</button>
        </div>
        <p className="mt-2 text-sm text-[#D7CCC8]">Two of you, friends, family. Best with up to 8, but there is always room for one more.</p>
        <div className="mt-5 grid w-full gap-2">
          {draft.map((d, i) => (
            <input key={i} value={d} maxLength={24} aria-label={`Name of player ${i + 1}`} placeholder={`Player ${i + 1} (a first name, if you like)`}
              onChange={(e) => setDraft(draft.map((x, j) => (j === i ? e.target.value : x)))}
              className="min-h-12 rounded-2xl border border-white/20 bg-black/40 px-4 text-lg text-white placeholder:text-white/40" />
          ))}
        </div>
        <p className="mt-2 text-xs text-[#D7CCC8]">Names stay on this phone. Nothing is sent.</p>

        <p className={step}>4 · Tonight&apos;s round</p>
        <div className="mt-3 grid w-full grid-cols-2 gap-2" role="radiogroup" aria-label="Round">
          {(Object.keys(ROUNDS) as Round[]).map((k) => (
            <button key={k} type="button" role="radio" aria-checked={round === k} onClick={() => setRound(k)}
              className={`min-h-12 rounded-2xl px-2 text-base font-black ${round === k ? 'bg-[#FFD54F] text-black' : 'border border-white/30 text-white'}`}>
              {ROUNDS[k].label}
            </button>
          ))}
        </div>

        <button type="button" onClick={begin} className="mt-8 min-h-14 w-full rounded-2xl bg-[#FFD54F] px-6 text-xl font-black text-black">
          Begin
        </button>
        <p className="mt-2 text-xs text-[#D7CCC8]">Everything is already chosen for you. Change only what you like.</p>
      </div>
    );
  }

  const others = players.map((_, i) => i).filter((i) => i !== asker);
  const party = circle.way === 'thirteen';
  const done = circle.way !== 'candles' && circle.lit >= w.count;
  const look = TIMES[askTime].look(g.name);
  function ritualFor(fw: number) {
    const target = fw === asker ? 'self' : fw === SOMEONE_ELSE ? 'someone not here' : fw === ALL_OF_US ? 'all' : nameOf(players, fw);
    return target === 'self'
      ? `${askerName}, ask your question out loud, or close your eyes and ask it silently. ${look} Breathe in, breathe out, then touch the light.`
      : target === 'someone not here'
        ? `${askerName}, picture them and ask for them, out loud or in your mind. ${look} Breathe in, breathe out, then touch the light.`
        : target === 'all'
          ? `Everyone, lean in close. ${askerName}, ask out loud for the whole circle. ${look} Together, touch the light.`
          : `${askerName}, look at ${target} and ask your question out loud. ${target}, take the phone. ${look} Breathe in, breathe out, then touch the light.`;
  }
  function choose(fw: number) {
    setForWhom(fw);
    say(circle.guide, askTime, ritualFor(fw));
  }
  const byYes = players.map((_, i) => i).filter((i) => (circle.scores[i]?.yes ?? 0) > 0).sort((a, b) => (circle.scores[b]?.yes ?? 0) - (circle.scores[a]?.yes ?? 0));
  const favored = players.length > 1 ? byYes[0] : undefined;
  const count =
    circle.way === 'candles'
      ? `Candle ${candle + 1} of 3 · ${TIMES[askTime].label}`
      : `${circle.way === 'stars' ? 'Star' : 'Answer'} ${Math.min(w.count, circle.lit + (shown ? 0 : 1))} of ${w.count}`;
  const link = shown
    ? `${window.location.origin}${window.location.pathname}?${new URLSearchParams({ w: shown.element.words.toLowerCase(), t: shown.time, g: circle.guide, ...(withQ && question.trim() ? { q: question.trim().slice(0, 120) } : {}) })}`
    : '';

  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-3xl font-black"><span className="text-[#FFD54F]" aria-hidden>{g.sign}</span> {g.name}</p>
      <p className="mt-1 text-sm font-bold text-[#D7CCC8]">{w.name} · {count}</p>
      {hasVoice(circle.guide) && (
        <button type="button" aria-pressed={voiceOn} onClick={() => { if (voiceOn) hushGuide(guideAudio.current); setVoiceOn(!voiceOn); }}
          className="mt-2 text-sm font-bold text-[#FFD54F] underline-offset-4 hover:underline">
          {voiceOn ? `${g.name.replace(/^The /, '')} speaks · turn off` : `${g.name.replace(/^The /, '')} is quiet · let them speak`}
        </button>
      )}
      <audio ref={guideAudio} preload="none" className="hidden" />

      <div className="mt-4 flex flex-wrap justify-center gap-2" aria-label="The circle">
        {players.map((_, i) => {
          const s = circle.scores[i] ?? NO_SCORE;
          return (
            <span key={i} className={`rounded-full px-3 py-1 text-sm font-bold ${i === asker ? 'bg-[#FFD54F] text-black' : 'border border-white/20 text-[#D7CCC8]'}`}>
              {nameOf(players, i)}
              {party && <span className="ml-1 font-normal opacity-80">{s.yes}·{s.maybe}·{s.no}</span>}
            </span>
          );
        })}
        <button type="button" onClick={seat} className="rounded-full border border-dashed border-[#FFD54F]/70 px-3 py-1 text-sm font-bold text-[#FFD54F]">
          + Someone joins
        </button>
      </div>
      {party && (
        <p className="mt-2 text-xs text-[#D7CCC8]">
          yes · maybe · not yet{favored !== undefined ? ` — ${inLine(g.name)} favors ${nameOf(players, favored)}` : ''}
        </p>
      )}

      <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-[#FFD54F]">{askerName}, it is your turn</p>

      {care ? (
        <div className="mt-4 w-full max-w-md rounded-2xl border-2 border-[#FFD54F] bg-black/50 p-5 text-left" role="alert">
          <p className="text-xl font-black">{g.name} sets the light down.</p>
          <p className="mt-3 text-lg text-[#EDE7F6]">
            This question matters too much for a game&apos;s answer, so there is no fortune for it. You matter, and you do not have to carry
            this alone.
          </p>
          <p className="mt-3 text-lg text-[#EDE7F6]">
            In the US, call or text <a href="tel:988" className="font-black text-[#FFD54F] underline">988</a> any time, day or night, to reach
            someone who will listen. If you are in danger right now, call <a href="tel:911" className="font-black text-[#FFD54F] underline">911</a>.
          </p>
          <a href="https://988lifeline.org" target="_blank" rel="noopener" className="mt-3 block font-bold text-[#FFD54F] underline">988lifeline.org</a>
          <button type="button" onClick={() => { setCare(false); setQuestion(''); }} className="mt-5 min-h-12 w-full rounded-2xl border-2 border-[#FFD54F] px-6 font-bold text-[#FFD54F]">
            Back to the circle
          </button>
        </div>
      ) : forWhom === null ? (
        <div className="mt-3 w-full max-w-md">
          {circle.way !== 'candles' && (
            <>
              <p className="text-xl font-bold">Ask {inLine(g.name)} of…</p>
              <div className="mt-3 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Which time">
                {(Object.keys(TIMES) as Time[]).map((k) => (
                  <button key={k} type="button" role="radio" aria-checked={time === k} onClick={() => setTime(k)}
                    className={`min-h-12 rounded-2xl px-2 text-base font-black ${time === k ? 'bg-[#FFD54F] text-black' : 'border border-white/30 text-white'}`}>
                    {TIMES[k].label}
                  </button>
                ))}
              </div>
            </>
          )}
          {circle.way === 'candles' && <p className="text-lg text-[#EDE7F6]">Three candles: one answer from the past, one from the present, one from the future.</p>}
          <p className="mt-6 text-xl font-bold">Who is your question for?</p>
          <div className="mt-3 grid gap-3">
            <button type="button" onClick={() => choose(asker)} className="min-h-12 rounded-2xl bg-[#7E57C2] px-4 text-lg font-black text-white">
              For me
            </button>
            {others.map((i) => (
              <button key={i} type="button" onClick={() => choose(i)} className="min-h-12 rounded-2xl border-2 border-[#7E57C2] px-4 text-lg font-black text-white">
                For {nameOf(players, i)}
              </button>
            ))}
            {others.length > 0 && party && (
              <button type="button" onClick={() => choose(ALL_OF_US)} className="min-h-12 rounded-2xl border-2 border-dashed border-[#7E57C2] px-4 text-lg font-black text-white">
                For all of us
              </button>
            )}
            <button type="button" onClick={() => choose(SOMEONE_ELSE)} className="min-h-12 rounded-2xl border-2 border-[#7E57C2]/60 px-4 text-lg font-black text-white">
              For someone who is not here
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 w-full max-w-md">
          <p className="text-lg text-[#EDE7F6]">
            {shown
              ? `${TIMES[shown.time].says(g.name)}:`
              : candle > 0 || asks > 0
                ? `${look} Touch the light.`
                : ritualFor(forWhom)}
          </p>
          {!shown && !busy && asks === 0 && candle === 0 && (
            <input value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={120}
              aria-label="Your question, if you want to type it" placeholder="Type it too, if you like (stays on this phone)"
              className="mt-4 min-h-12 w-full rounded-2xl border border-white/20 bg-black/40 px-4 text-base text-white placeholder:text-white/40" />
          )}
        </div>
      )}

      {!care && light(() => void touch(), !busy && forWhom !== null && (!shown || asks > 0))}
      {!care && wake}

      <VoicePlayer ref={audio} className="mt-8 w-full max-w-md" />

      {answerBlock}

      {shown && (
        <div className="mt-4 flex w-full max-w-md flex-col gap-3">
          <button type="button" onClick={askAgain} className="min-h-12 rounded-2xl border-2 border-[#FFD54F] px-6 font-bold text-[#FFD54F]">
            Ask again
          </button>
          {circle.way === 'candles' && candle < 2 ? (
            <button type="button" onClick={nextCandle} className="min-h-12 rounded-2xl bg-[#FFD54F] px-6 font-bold text-black">
              Light the next candle: {TIMES[CANDLE_TIMES[candle + 1]].label.toLowerCase()}
            </button>
          ) : done ? (
            <div className="rounded-2xl border-2 border-[#FFD54F] bg-[#2a1840] p-4">
              <p className="text-xl font-black text-[#FFD54F]">
                {circle.way === 'stars' ? 'All seven stars are lit.' : 'Thirteen answers, and the circle is complete.'}
              </p>
              {favored !== undefined && <p className="mt-2 text-[#EDE7F6]">Tonight {inLine(g.name)} favored {nameOf(players, favored)}.</p>}
              <button type="button" onClick={beginAgain} className="mt-4 min-h-12 w-full rounded-2xl bg-[#FFD54F] px-6 font-bold text-black">
                Begin again
              </button>
            </div>
          ) : (
            <button type="button" onClick={passOn} className="min-h-12 rounded-2xl bg-[#FFD54F] px-6 font-bold text-black">
              {players.length > 1 ? `Pass the phone to ${nextName}` : 'A new question'}
            </button>
          )}
          <SendAnswer link={link} guide={g.name} time={shown.time} hasQuestion={!!question.trim()} withQ={withQ} setWithQ={setWithQ} />
        </div>
      )}
      {message && <p className="mt-4 text-[#D7CCC8]" role="status">{message}</p>}
      <button type="button" onClick={() => { setDraft(players.length ? players : ['', '']); setGuide(circle.guide); setWay(circle.way); setRound(circle.round); setGathering(true); }}
        className="mt-8 text-sm font-bold text-[#FFD54F] underline-offset-4 hover:underline">
        Change the guide, the way, the circle or the round
      </button>
    </div>
  );
}

/* Send the answer on, stream only: the link carries the word (and the
   question, only when the player ticks it); the friend touches their own light
   to hear it sung. Same three buttons as the Love Game's SendOn. */
function SendAnswer({ link, guide, time, hasQuestion, withQ, setWithQ }: {
  link: string; guide: string; time: Time; hasQuestion: boolean; withQ: boolean; setWithQ: (v: boolean) => void;
}) {
  const [note, setNote] = useState('');
  const message = `${guide} has an answer for you, from ${TIMES[time].label.toLowerCase()}. Touch the light to hear it.`;
  const text = `${message}\n${link}`;

  async function dm() {
    gameEvent('prize_sent', { game: '16-ball', how: 'dm' });
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ text: message, url: link });
        return;
      } catch {
        /* closed the sheet: copy instead */
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setNote('Copied. Paste it into your message.');
    } catch {
      setNote('Press and hold the link below to copy it.');
    }
  }

  const big = 'block min-h-12 w-full rounded-2xl px-4 py-3 text-center text-lg font-black';
  return (
    <div className="mt-2 flex flex-col gap-3 rounded-2xl border border-[#FFD54F]/40 bg-black/40 p-4">
      <p className="text-lg font-black text-[#FFD54F]">Send this answer to someone</p>
      {hasQuestion && (
        <label className="flex items-center justify-center gap-2 text-sm text-[#D7CCC8]">
          <input type="checkbox" checked={withQ} onChange={(e) => setWithQ(e.target.checked)} className="h-5 w-5" />
          Include my question
        </label>
      )}
      <a href={`sms:?&body=${encodeURIComponent(text)}`} onClick={() => gameEvent('prize_sent', { game: '16-ball', how: 'text' })} className={`${big} bg-[#EC407A] text-white`}>Text it</a>
      <button type="button" onClick={dm} className={`${big} bg-[#FFD54F] text-black`}>DM it</button>
      <a href={link} target="_blank" rel="noopener" onClick={() => gameEvent('prize_sent', { game: '16-ball', how: 'open' })} className={`${big} border border-white/30`}>Open it</a>
      {note && <p className="text-sm font-bold text-[#FFD54F]" role="status">{note}</p>}
    </div>
  );
}
