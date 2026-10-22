'use client';

import VoicePlayer from './VoicePlayer';
import { playVoice } from '@/lib/games/clearVoice';
import { useEffect, useRef, useState } from 'react';
import { GAME_API, loadProgress, saveProgress, type GameElement } from '@/lib/games/meantsGame';
import { MOODS_FOR_PACE, SERENADE, useNugPlayer, usePlayerSense } from '@/lib/games/adaptive';

/* BUG-Story: free to play. Type three words; each word sung in a G Putnam Music song plays as
   its BUG, one after another, and the three tell a tiny story. A BUG shows only
   for a word the player asked for. Songs only, nothing personal. */
type Progress = { stories: number; mixed: boolean };
const KEY = 'meants-game:bug-story:v1';

export default function BugStoryGame() {
  const audio = useRef<HTMLAudioElement>(null);
  const [words, setWords] = useState(['', '', '']);
  const [story, setStory] = useState<GameElement[]>([]);
  const [missing, setMissing] = useState<string[]>([]);
  const [now, setNow] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState<Progress>(() => loadProgress<Progress>(KEY, { stories: 0, mixed: false }));
  const sense = usePlayerSense();
  const nugs = useNugPlayer();

  /* Calm-down: rapid taps bring a soft serenade and a short pause. */
  useEffect(() => {
    if (!sense.frustrated) return;
    audio.current?.pause();
    void nugs.playAlone(SERENADE);
    setMessage('Take a breath. Here is something calm.');
    setBusy(true);
    const t = setTimeout(() => {
      setBusy(false);
      sense.settle();
    }, 5000);
    return () => clearTimeout(t);
  }, [sense.frustrated]); // eslint-disable-line react-hooks/exhaustive-deps

  const level = progress.stories >= 3 && progress.mixed ? 3 : progress.mixed ? 2 : progress.stories >= 1 ? 1 : 0;
  const goal = [
    'Level 1: play a 3-word story.',
    'Level 2: make a story whose 3 words come from 3 different songs.',
    'Level 3: play three stories in all.',
    'All 3 levels cleared!',
  ][level];

  function playFrom(list: GameElement[], i: number) {
    const a = audio.current;
    if (!a || i >= list.length) {
      setNow(-1);
      nugs.stop();
      /* Quick players get a snip to close the story. */
      if (a && list.length && sense.pace === 'quick') void nugs.playAlone(MOODS_FOR_PACE.quick);
      return;
    }
    /* Steady and calm players hear a quiet bed under the whole story. */
    if (i === 0 && sense.pace !== 'quick') void nugs.ambient(MOODS_FOR_PACE[sense.pace]);
    setNow(i);
    a.onended = () => playFrom(list, i + 1);
    void playVoice(a, list[i].src).catch(() => setMessage('Tap play to listen.'));
  }

  async function tell(e: React.FormEvent) {
    e.preventDefault();
    sense.tap();
    nugs.stop();
    const asked = words.map((w) => w.trim()).filter(Boolean);
    if (asked.length !== 3 || asked.some((w) => w.includes(' '))) {
      setMessage('Type one word in each box.');
      return;
    }
    setBusy(true);
    setMessage('');
    setStory([]);
    setMissing([]);
    const found: GameElement[] = [];
    const notFound: string[] = [];
    try {
      for (const word of asked) {
        const params = new URLSearchParams({ kind: 'bug', word, avoid: found.map((f) => f.song).join(',') });
        const body = (await (await fetch(`${GAME_API}&${params}`, { cache: 'no-store' })).json()) as { element: GameElement | null };
        if (body.element) found.push(body.element);
        else notFound.push(word);
      }
    } catch {
      setMessage('That did not load. Please try again.');
      setBusy(false);
      return;
    }
    setBusy(false);
    setMissing(notFound);
    if (notFound.length) {
      setMessage('Not every word is sung yet. Swap the missing ones and try again.');
      return;
    }
    setStory(found);
    const updated: Progress = {
      stories: progress.stories + 1,
      mixed: progress.mixed || new Set(found.map((f) => f.song)).size === 3,
    };
    setProgress(updated);
    saveProgress(KEY, updated);
    playFrom(found, 0);
  }

  return (
    <div>
      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#FFD54F]">
          {progress.stories} {progress.stories === 1 ? 'story' : 'stories'} played
        </p>
        <p className="mt-1 text-sm text-[#D7CCC8]">{goal}</p>
      </div>

      <form onSubmit={tell} className="mt-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {words.map((w, i) => (
            <input key={i} value={w} aria-label={`Word ${i + 1}`} placeholder={['e.g. love', 'e.g. home', 'e.g. tonight'][i]}
              onChange={(e) => setWords(words.map((x, j) => (j === i ? e.target.value : x)))}
              className={`min-h-12 rounded-2xl border bg-black/40 px-4 text-lg text-white placeholder:text-white/40 ${missing.includes(w.trim()) ? 'border-[#FFAB91]' : 'border-white/20'}`} />
          ))}
        </div>
        <button type="submit" disabled={busy} className="mt-4 min-h-12 w-full rounded-2xl bg-[#FFD54F] px-5 font-bold text-black disabled:opacity-60">
          {busy ? 'Finding the words…' : 'Tell my story'}
        </button>
      </form>

      <VoicePlayer ref={audio} className="mt-6 w-full" />

      {story.length > 0 && (
        <div className="mt-4 rounded-2xl border border-[#FFD54F]/40 bg-black/40 p-4">
          <p className="text-2xl font-black">
            {story.map((s, i) => (
              <button key={i} type="button" onClick={() => playFrom(story, i)} className={`mr-2 ${now === i ? 'text-[#FFD54F]' : ''}`}>
                {s.words}
              </button>
            ))}
          </p>
          <p className="mt-2 text-sm text-[#D7CCC8]">{story.map((s) => s.song).join(' · ')}</p>
          <p className="mt-3 text-sm text-[#D7CCC8]">
            Three different words in a row like this can be sent to someone as a STORY.{' '}
            <a href="https://www.k-kut.com/bug" className="font-bold text-[#FFD54F] underline-offset-4 hover:underline">See how</a>
          </p>
        </div>
      )}

      {missing.length > 0 && <p className="mt-4 text-[#FFAB91]">Not sung yet: {missing.join(', ')}</p>}
      {message && <p className="mt-2 text-[#D7CCC8]" role="status">{message}</p>}
    </div>
  );
}
