'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { clockWorld } from '@/lib/games/wonders';
import { FeelTheBeat, MusicYouCanSee } from './FeelAndSee';
import SoundAllAround from './SoundAllAround';
import TiltAndShake from './TiltAndShake';
import HumToSummon from './HumToSummon';
import { DreamMode, MysteryDoors, StrangeStacks } from './Surprises';
import EchoMe from './EchoMe';
import GoldenNug from './GoldenNug';

/* The twelve Extraordinary experiences, one open at a time. The whole page
   takes its colours and its moods from the player's own clock and season. */
type Moods = { moods: string[] };
const PLAYS: { id: string; title: string; feel: string; senses: string; Play?: (p: Moods) => JSX.Element }[] = [
  { id: 'feel', title: 'Feel the beat', feel: 'The phone pulses in your hand on every hit.', senses: 'touch · sound', Play: FeelTheBeat },
  { id: 'see', title: 'Music you can see', feel: 'Colours bloom and burst on each note. Every play looks different.', senses: 'sight · sound', Play: MusicYouCanSee },
  { id: 'around', title: 'Sound all around', feel: 'With headphones, sounds circle you, creep up behind you and fly past.', senses: 'sound in 3D', Play: SoundAllAround },
  { id: 'tilt', title: 'Tilt and shake', feel: 'Tilt to steer through a fantasy world; shake for a burst of sound.', senses: 'motion · touch', Play: TiltAndShake },
  { id: 'hum', title: 'Hum to summon', feel: 'Hum, clap or whistle, and the game answers with the sound closest to yours.', senses: 'voice · sound', Play: () => <HumToSummon /> },
  { id: 'doors', title: 'Mystery doors', feel: 'Three doors. Spooky, historic, futuristic or fantasy: you never know.', senses: 'surprise · sound', Play: () => <MysteryDoors /> },
  { id: 'stacks', title: 'Strange stacks', feel: 'Spin three sounds that play together, each its own. Stop any one.', senses: 'sound', Play: StrangeStacks },
  { id: 'echo', title: 'Echo me', feel: 'Hear a pattern, tap it back. It grows longer, and stranger.', senses: 'rhythm · memory', Play: () => <EchoMe /> },
  { id: 'dream', title: 'Dream mode', feel: 'One tap starts an endless, never-repeating chain of words, sounds and riffs.', senses: 'sound · surprise', Play: DreamMode },
  { id: 'clock', title: 'The world changes with the clock', feel: 'This page looks and sounds different by night, by morning and by season.', senses: 'sight · time' },
  { id: 'golden', title: 'Strike gold', feel: 'About one play in fifty, anywhere here, turns gold and wins you a free BUG to send.', senses: 'surprise' },
  { id: 'together', title: 'Everyone at once', feel: 'On Sunday riff runs, the screen glows brighter as more people listen at the same moment.', senses: 'togetherness' },
];

const DAYPART = { night: 'the night', morning: 'the morning', day: 'the day', evening: 'the evening' } as const;
const SEASON = { halloween: 'Halloween', veterans: 'Veterans Day', christmas: 'Christmas' } as const;

export default function Wonders() {
  const [world, setWorld] = useState(() => clockWorld());
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setWorld(clockWorld()), 60_000);
    return () => clearInterval(t);
  }, []);

  const now = world.season ? `${SEASON[world.season]}, in ${DAYPART[world.daypart]}` : DAYPART[world.daypart];
  return (
    <div className={`-mx-4 rounded-3xl bg-gradient-to-b px-4 py-6 transition-colors duration-[3000ms] ${world.sky}`}>
      <GoldenNug />
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#FFD54F]">Right now it is {now}</p>
      <div className="mt-4 grid gap-3">
        {PLAYS.map(({ id, title, feel, senses, Play }) => (
          <div key={id} className={`rounded-2xl border bg-black/40 p-5 ${open === id ? 'border-[#FFD54F]' : 'border-white/15'}`}>
            <button type="button" onClick={() => setOpen(open === id ? null : id)} className="w-full text-left" aria-expanded={open === id}>
              <p className="text-2xl font-black">{title}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-[#FFD54F]">{senses}</p>
              <p className="mt-2 text-[#D7CCC8]">{feel}</p>
            </button>
            {open === id && (
              <div className="mt-5">
                {Play ? <Play moods={world.moods} /> : null}
                {id === 'clock' && <p className="text-[#D7CCC8]">Every sound on this page leans toward {now}. Come back at another hour, or another season, and it changes.</p>}
                {id === 'golden' && <p className="text-[#D7CCC8]">It is hidden in every experience above. Just play.</p>}
                {id === 'together' && (
                  <Link href="/riff-runs" className="inline-block rounded-2xl bg-[#FFD54F] px-6 py-3 font-bold text-black">Go to the riff runs</Link>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
