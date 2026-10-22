'use client';

import { useRef, useState } from 'react';
import { audioContext, fetchNug, rollGolden } from '@/lib/games/wonders';

/* Hum to summon: the player hums, claps or whistles for three seconds, and the
   game answers with a sound whose mood is closest to what it heard: low or high,
   soft or loud, steady or sharp. The microphone is used only after the player
   says yes, only in this browser, and nothing is recorded or sent. */
function moodsFor(pitch: number, loud: number, sharp: number): { moods: string[]; heard: string } {
  if (sharp > 0.5) return { moods: ['Playful', 'Quirky', 'Fun', 'Upbeat'], heard: 'claps' };
  if (pitch > 700) return { moods: ['Bright', 'Light', 'Playful', 'Happy'], heard: 'a whistle' };
  if (pitch && pitch < 180) return { moods: ['Dark', 'Moody', 'Mysterious', 'Dramatic'], heard: 'a low hum' };
  if (loud > 0.15) return { moods: ['Energetic', 'Powerful', 'Driving', 'Intense'], heard: 'a strong voice' };
  return { moods: ['Dreamy', 'Warm', 'Reflective', 'Atmospheric'], heard: 'a soft hum' };
}

/** The strongest repeating period in the signal, in Hz (0 if none). */
function pitchOf(buf: Float32Array, rate: number): number {
  let best = 0;
  let bestLag = 0;
  for (let lag = Math.floor(rate / 1200); lag < Math.floor(rate / 70); lag++) {
    let s = 0;
    for (let i = 0; i < buf.length - lag; i++) s += buf[i] * buf[i + lag];
    if (s > best) {
      best = s;
      bestLag = lag;
    }
  }
  return bestLag ? rate / bestLag : 0;
}

export default function HumToSummon() {
  const [state, setState] = useState<'idle' | 'listening' | 'answering'>('idle');
  const [said, setSaid] = useState('');
  const audio = useRef<HTMLAudioElement | null>(null);

  async function listen() {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setSaid('The game needs your yes to hear you. Nothing is recorded.');
      return;
    }
    setState('listening');
    setSaid('Listening… hum, clap or whistle.');
    const ac = audioContext();
    const src = ac.createMediaStreamSource(stream);
    const an = ac.createAnalyser();
    an.fftSize = 2048;
    src.connect(an);
    const buf = new Float32Array(an.fftSize);
    const pitches: number[] = [];
    let loudSum = 0;
    let frames = 0;
    let peaks = 0;
    let last = 0;
    const until = performance.now() + 3000;
    await new Promise<void>((done) => {
      const tick = () => {
        an.getFloatTimeDomainData(buf);
        let sum = 0;
        for (const v of buf) sum += v * v;
        const level = Math.sqrt(sum / buf.length);
        loudSum += level;
        frames++;
        if (level > 0.2 && last < 0.08) peaks++;
        last = level;
        /* Pitch is costly to find, so look a few times a second, not every frame. */
        if (level > 0.02 && frames % 6 === 0) {
          const p = pitchOf(buf, ac.sampleRate);
          if (p) pitches.push(p);
        }
        if (performance.now() < until) requestAnimationFrame(tick);
        else done();
      };
      tick();
    });
    stream.getTracks().forEach((t) => t.stop());
    src.disconnect();

    pitches.sort((a, b) => a - b);
    const pitch = pitches.length ? pitches[Math.floor(pitches.length / 2)] : 0;
    const { moods, heard } = moodsFor(pitch, loudSum / frames, Math.min(1, peaks / 4));
    setState('answering');
    const nug = await fetchNug(moods);
    if (!nug) {
      setState('idle');
      setSaid('Nothing answered. Try again.');
      return;
    }
    setSaid(`I heard ${heard}. Here is my answer.`);
    const a = audio.current ?? new Audio();
    audio.current = a;
    a.src = nug.src;
    a.onended = () => setState('idle');
    void a.play().catch(() => setState('idle'));
    rollGolden();
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <button type="button" onClick={listen} disabled={state !== 'idle'}
        className={`h-36 w-36 rounded-full text-lg font-black text-black ${state === 'listening' ? 'animate-pulse bg-[#FF7043]' : 'bg-[#FFD54F]'} disabled:opacity-80`}>
        {state === 'listening' ? 'Listening' : state === 'answering' ? 'Answering' : 'Hum to summon'}
      </button>
      <p className="min-h-6 text-[#D7CCC8]" role="status">{said || 'Tap, allow the microphone, and make a sound for three seconds.'}</p>
    </div>
  );
}
