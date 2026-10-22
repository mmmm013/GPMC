'use client';

import { useEffect, useRef, useState } from 'react';
import type { GameElement } from '@/lib/games/meantsGame';
import {
  DEFAULT_BEAR,
  FUTURISTIC_NAMES,
  HISTORIC_NAMES,
  LOVE_WORDS,
  PROMISE_KEY,
  ROMANTIC_PHRASES,
  fetchLoveBug,
  lawfulName,
  ribbonFor,
  type BearLook,
  type Ribbon,
} from '@/lib/games/loveGame';
import HugBear from './HugBear';
import Gallery, { type Target } from './Gallery';
import PrizePicker from './PrizePicker';
import { FailButton } from './FailButton';

/* The Love Game. Pick a lover name and a HUG Bear, then play a round at the
   fair: the HUG Bear Booth (tickling arrows at romantic phrases) or Red Flame
   (arrows that sing 1, 2 or 3 love BUGs as they soar at True Blue hearts).
   Every finish wins a ribbon (Blue Ribbon is 1st Place) and a prize HUG. */
type Round = 'booth' | 'flame';
type Screen = 'setup' | Round | 'ribbon' | 'prize' | 'freebie';
const SHOTS: Record<Round, number> = { booth: 10, flame: 6 };

function Choice<T extends string>({ value, options, onChange, label }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFD54F]">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o.id} type="button" onClick={() => onChange(o.id)} aria-pressed={value === o.id}
            className={`min-h-11 rounded-2xl border px-4 font-bold ${value === o.id ? 'border-[#FFD54F] bg-[#FFD54F] text-black' : 'border-white/30 text-white'}`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function LoveGame() {
  const audio = useRef<HTMLAudioElement>(null);
  const [screen, setScreen] = useState<Screen>('setup');
  const [typed, setTyped] = useState('');
  const [lover, setLover] = useState('');
  const [problem, setProblem] = useState('');
  const [bear, setBear] = useState<BearLook>(DEFAULT_BEAR);
  const [round, setRound] = useState<Round>('booth');
  const [shots, setShots] = useState(0);
  const [hits, setHits] = useState(0);
  const [inFlight, setInFlight] = useState(false);
  const [ribbon, setRibbon] = useState<Ribbon | null>(null);
  const [message, setMessage] = useState('');
  const [promise, setPromise] = useState('');
  /* Red Flame: how many love BUGs each arrow sings, and the ones loaded on the string. */
  const [count, setCount] = useState<1 | 2 | 3>(1);
  const [loaded, setLoaded] = useState<GameElement[]>([]);
  const [sung, setSung] = useState<GameElement[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PROMISE_KEY);
      if (raw) setPromise((JSON.parse(raw) as { code?: string }).code ?? '');
    } catch {
      /* no promise kept in this browser */
    }
  }, []);

  /* Load the next Red Flame arrow with fresh love BUGs. */
  useEffect(() => {
    if (screen !== 'flame') return;
    let cancelled = false;
    setLoaded([]);
    void (async () => {
      const words = [...LOVE_WORDS].sort(() => Math.random() - 0.5);
      const got: GameElement[] = [];
      for (const w of words) {
        if (got.length >= count) break;
        const bug = await fetchLoveBug(w);
        if (bug) got.push(bug);
      }
      if (!cancelled) setLoaded(got);
    })();
    return () => {
      cancelled = true;
    };
  }, [screen, count, shots]);

  function choose(name: string) {
    const { name: ok, problem: p } = lawfulName(name);
    setProblem(p);
    if (ok) setLover(ok);
  }

  function start(r: Round) {
    if (!lover) {
      setProblem('Pick a lover name first.');
      return;
    }
    setRound(r);
    setShots(0);
    setHits(0);
    setMessage('');
    setSung([]);
    setLoaded([]);
    setScreen(r);
  }

  /* A chain of BUGs sings one after another as the flame flies. */
  function sing(chain: GameElement[]) {
    const a = audio.current;
    if (!a || !chain.length) return;
    let i = 0;
    a.onended = () => {
      i += 1;
      if (i < chain.length) {
        a.src = chain[i].src;
        void a.play().catch(() => {});
      } else a.onended = null;
    };
    a.src = chain[0].src;
    void a.play().catch(() => setMessage('Tap play to hear the arrow sing.'));
  }

  function onShoot() {
    setInFlight(true);
    setShots((s) => s + 1);
    if (round === 'flame') {
      setSung(loaded);
      sing(loaded);
    }
  }

  function onLand(hit: Target | null) {
    setInFlight(false);
    if (hit) {
      setHits((h) => h + 1);
      setMessage(round === 'booth' ? `Tickled “${hit.label}”!` : 'A True Blue heart!');
    } else setMessage(round === 'booth' ? 'Missed. Aim for a phrase.' : 'So close. Aim for a heart.');
  }

  /* The round ends after the last arrow lands. */
  useEffect(() => {
    if ((screen === 'booth' || screen === 'flame') && shots >= SHOTS[round] && !inFlight) {
      const t = setTimeout(() => {
        setRibbon(ribbonFor(hits, shots));
        setScreen('ribbon');
      }, round === 'flame' ? 1800 : 600);
      return () => clearTimeout(t);
    }
  }, [screen, shots, inFlight, hits, round]);

  const left = SHOTS[round] - shots;
  const names = (list: readonly string[]) => list.map((n) => (
    <button key={n} type="button" onClick={() => { setTyped(''); choose(n); }} aria-pressed={lover === n}
      className={`min-h-11 rounded-2xl border px-3 font-bold ${lover === n ? 'border-[#EC407A] bg-[#EC407A] text-white' : 'border-white/30 text-white'}`}>
      {n}
    </button>
  ));

  return (
    <div>
      {/* The Red Flame arrows sing through this player; the prize table has its own. */}
      <audio ref={audio} controls controlsList="nodownload" className={screen === 'flame' ? 'w-full' : 'hidden'} />

      {screen === 'setup' && (
        <div className="mt-6 grid gap-6">
          {promise && (
            <div className="rounded-2xl border border-[#FFD54F] bg-black/40 p-4">
              <p className="font-bold">We did not forget. Your freebie ({promise}) is waiting.</p>
              <button type="button" onClick={() => setScreen('freebie')} className="mt-3 min-h-11 rounded-2xl bg-[#FFD54F] px-4 font-bold text-black">Pick my free HUG</button>
            </div>
          )}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFD54F]">Who are you tonight?</p>
            <p className="mt-2 text-sm text-[#D7CCC8]">Lovers from old stories</p>
            <div className="mt-2 flex flex-wrap gap-2">{names(HISTORIC_NAMES)}</div>
            <p className="mt-4 text-sm text-[#D7CCC8]">Lovers from the future</p>
            <div className="mt-2 flex flex-wrap gap-2">{names(FUTURISTIC_NAMES)}</div>
            <label className="mt-4 block">
              <span className="text-sm text-[#D7CCC8]">Or type your own (it stays in this browser)</span>
              <input value={typed} onChange={(e) => { setTyped(e.target.value); choose(e.target.value); }} maxLength={24} placeholder="Your lover name"
                className="mt-2 w-full rounded-2xl border border-white/20 bg-black/40 px-4 py-3 text-white placeholder:text-white/40" />
            </label>
            {problem && <p className="mt-2 text-sm text-[#FF8A80]" role="status">{problem}</p>}
          </div>

          <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 sm:flex-row sm:items-start">
            <HugBear look={bear} size={140} />
            <div className="grid gap-4">
              <Choice label="Your HUG Bear" value={bear.kind} onChange={(kind) => setBear({ ...bear, kind })}
                options={[{ id: 'female', label: 'Female' }, { id: 'male', label: 'Male' }, { id: 'unisex', label: 'Unisex' }]} />
              <Choice label="Fur" value={bear.fur} onChange={(fur) => setBear({ ...bear, fur })}
                options={[{ id: 'black', label: 'Black' }, { id: 'white', label: 'White' }]} />
              <Choice label="Aim" value={bear.mood} onChange={(mood) => setBear({ ...bear, mood })}
                options={[{ id: 'cute', label: 'Cute' }, { id: 'bold', label: 'Bold' }]} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => start('booth')} className="rounded-2xl border border-[#FFD54F] bg-[#7B1F2B] p-4 text-left">
              <p className="text-2xl font-black">HUG Bear Booth</p>
              <p className="mt-1 text-sm text-[#F5E6C8]">Shoot tickling arrows of love at romantic phrases. 10 arrows.</p>
            </button>
            <button type="button" onClick={() => start('flame')} className="rounded-2xl border border-[#1E63D6] bg-[#2A0E12] p-4 text-left">
              <p className="text-2xl font-black">Red Flame</p>
              <p className="mt-1 text-sm text-[#F5E6C8]">Flaming arrows sing love words as they soar at True Blue hearts. 6 arrows.</p>
            </button>
          </div>
        </div>
      )}

      {(screen === 'booth' || screen === 'flame') && (
        <div className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#FFD54F]">{lover} · {left} {left === 1 ? 'arrow' : 'arrows'} left · {hits} hits</p>
            <button type="button" onClick={() => setScreen('setup')} className="text-sm font-bold text-[#D7CCC8] underline">Leave the booth</button>
          </div>
          {screen === 'flame' && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Choice label="Love BUGs per arrow" value={String(count) as '1' | '2' | '3'} onChange={(v) => setCount(Number(v) as 1 | 2 | 3)}
                options={[{ id: '1', label: '1' }, { id: '2', label: '2' }, { id: '3', label: '3' }]} />
              <p className="text-sm text-[#D7CCC8]">
                On the string: {loaded.length ? loaded.map((b) => `“${b.words}”`).join(' ') : 'loading…'}
              </p>
            </div>
          )}
          <div className="relative mt-3">
            <Gallery
              labels={ROMANTIC_PHRASES}
              style={screen === 'booth' ? 'phrase' : 'heart'}
              flightMs={screen === 'booth' ? 450 : 1300}
              disabled={inFlight || left <= 0 || (screen === 'flame' && !loaded.length)}
              onShoot={onShoot}
              onLand={onLand}
            />
            <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2">
              <HugBear look={bear} size={84} flame={screen === 'flame'} />
            </div>
          </div>
          <p className="mt-3 min-h-6 text-center font-bold" role="status">{message || 'Tap where to aim.'}</p>
          {screen === 'flame' && sung.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-[#D7CCC8]">
              <span>The last arrow sang:</span>
              {sung.map((b) => (
                <span key={b.reference ?? b.words} className="flex items-center gap-1">
                  “{b.words}”{b.reference && <FailButton game="love" reference={b.reference} />}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {screen === 'ribbon' && ribbon && (
        <div className="mt-8 flex flex-col items-center text-center">
          <svg viewBox="0 0 100 140" width="140" height="196" role="img" aria-label={ribbon.name}>
            <path d="M30 70 L18 136 L38 122 L46 140 L50 74 Z M70 70 L82 136 L62 122 L54 140 L50 74 Z" fill={ribbon.color} stroke="#5D4037" strokeWidth="2" />
            <circle cx="50" cy="50" r="40" fill={ribbon.color} stroke="#5D4037" strokeWidth="3" />
            <circle cx="50" cy="50" r="28" fill="none" stroke={ribbon.place === 3 ? '#9E9E9E' : '#FFFFFF'} strokeWidth="2" strokeDasharray="4 3" />
            <text x="50" y="58" textAnchor="middle" fontSize="24" fontWeight="900" fill={ribbon.place === 3 ? '#5D4037' : '#FFFFFF'}>
              {ribbon.place === 1 ? '1st' : ribbon.place === 2 ? '2nd' : '3rd'}
            </text>
          </svg>
          <p className="mt-4 text-4xl font-black">{ribbon.name}!</p>
          <p className="mt-2 text-lg">{ribbon.place === 1 ? '1st Place' : ribbon.place === 2 ? '2nd Place' : '3rd Place'} · {hits} of {shots} hits</p>
          <p className="mt-4 text-[#D7CCC8]">{lover}, every lover at this fair goes home with a prize. Yours is a HUG for your love.</p>
          <button type="button" onClick={() => setScreen('prize')} className="mt-6 min-h-12 rounded-2xl bg-[#EC407A] px-6 font-bold text-white">Claim my prize</button>
        </div>
      )}

      {(screen === 'prize' || screen === 'freebie') && (
        <PrizePicker lover={lover} freebie={screen === 'freebie' ? promise : undefined}
          onDone={() => {
            /* A kept freebie clears the promise; a new one may have been made. */
            try {
              const raw = window.localStorage.getItem(PROMISE_KEY);
              setPromise(raw ? (JSON.parse(raw) as { code?: string }).code ?? '' : '');
            } catch {
              setPromise('');
            }
            setScreen('setup');
          }} />
      )}
    </div>
  );
}
