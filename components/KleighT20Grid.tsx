'use client';

/**
 * KleighT20Grid
 *
 * The TOP-20 activity grid for the KLEIGH page.
 *
 * Key rules:
 *  • ONLY KLEIGH PIX play here — no Supabase mood queries, no general catalog.
 *  • Tracks are mood-tagged. When a user taps an activity tile, we queue all
 *    KLEIGH tracks for that mood and play them in order.
 *  • When that mood's queue exhausts (all tracks played), we automatically
 *    advance to the NEXT mood category and continue.
 *  • Occasional Michael Clay instros are sprinkled into the queue (~1 per
 *    mood group) as a palate-cleansing bridge between categories.
 *  • No KUTs page, no KKr links anywhere in this component.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Activity, T20_ACTIVITIES } from './T20Grid';

// ---------------------------------------------------------------------------
// KLEIGH PIX MANIFEST
// Each track is tagged with one or more mood IDs from T20_ACTIVITIES.
// ---------------------------------------------------------------------------

interface KleighPix {
  title: string;
  vocalist: string;
  src: string;
  moods: string[]; // matches Activity.id values
  isInstro?: boolean;
  artist?: string;  // for Michael Clay instros
}

const KLEIGH_PIX: KleighPix[] = [
  // ── KLEIGH VOCAL TRACKS ──────────────────────────────────────────────────
  { title: 'Reflections',               vocalist: 'Kleigh', src: '/pix/kleigh--reflections.mp3',                                moods: ['chill', 'wind-down', 'yoga'] },
  { title: 'Bought Into Your Game',     vocalist: 'Kleigh', src: '/pix/kleigh--bought-into-your-game-amin-87bpm-edit-master.mp3', moods: ['driving', 'road-trip', 'commute'] },
  { title: 'Breathing Serenity',        vocalist: 'Kleigh', src: '/pix/kleigh--breathing-serenity.mp3',                         moods: ['yoga', 'chill', 'morning'] },
  { title: 'Down (Stripped)',           vocalist: 'Kleigh', src: '/pix/kleigh--down-(stripped)-with-reverb--69bpm-fmaj.mp3',    moods: ['wind-down', 'romance', 'study'] },
  { title: 'Down (Prod)',               vocalist: 'Kleigh', src: '/pix/kleigh--down-(prod)--69bpm-fmaj.mp3',                    moods: ['romance', 'dinner'] },
  { title: 'A Calm Evening',            vocalist: 'Kleigh', src: '/pix/kleigh--a-calm-evening.mp3',                             moods: ['dinner', 'chill', 'background'] },
  { title: 'Waterfall',                 vocalist: 'Kleigh', src: '/pix/kleigh--waterfall.mp3',                                  moods: ['outdoor', 'morning', 'yoga'] },
  { title: 'Nightfall',                 vocalist: 'Kleigh', src: '/pix/kleigh--nightfall.mp3',                                  moods: ['wind-down', 'chill', 'background'] },
  { title: 'Tall Forest',               vocalist: 'Kleigh', src: '/pix/kleigh--tall-forest.mp3',                                moods: ['outdoor', 'road-trip', 'focus'] },
  { title: 'Solace',                    vocalist: 'Kleigh', src: '/pix/kleigh--solace.mp3',                                     moods: ['yoga', 'study', 'background'] },
  { title: 'Optimistic Expectations',   vocalist: 'Kleigh', src: '/pix/kleigh--optimistic-expectations.mp3',                    moods: ['morning', 'workout', 'running'] },
  { title: 'Is It Us? (Prod)',          vocalist: 'Kleigh', src: '/pix/kleigh--is-it-us-prod-amin-84bpm-master.mp3',            moods: ['romance', 'party', 'driving'] },
  // ── MICHAEL CLAY INSTROS (occasional palate cleansers) ──────────────────
  { title: 'Rhythm Play',               vocalist: 'Kleigh', src: '/pix/rhythm-play.mp3',      moods: ['party', 'gaming', 'workout'],   isInstro: true, artist: 'Kleigh' },
  { title: 'I Am a Fighter (Instro)',   vocalist: 'Kleigh', src: '/pix/i-am-a-fighter--el-mix-instro.mp3', moods: ['workout', 'running', 'driving'], isInstro: true, artist: 'Kleigh' },
  { title: 'I Live Free (Instro)',      vocalist: 'Kleigh', src: '/pix/i-live-free--instro.mp3', moods: ['morning', 'outdoor', 'road-trip'], isInstro: true, artist: 'Kleigh' },
  { title: 'Score 3: The End',          vocalist: 'Kleigh', src: '/pix/score-3--the-end.mp3', moods: ['background', 'study', 'coffee'],  isInstro: true, artist: 'Kleigh' },
];

// Ordered list of mood IDs to cycle through when auto-advancing
const MOOD_ORDER: string[] = T20_ACTIVITIES.map((a) => a.id);

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

/** Build ordered queue: KLEIGH tracks for this mood, then sprinkle 1 Clay instro */
function buildQueue(moodId: string): KleighPix[] {
  const kleighTracks = KLEIGH_PIX.filter(
    (t) => !t.isInstro && t.moods.includes(moodId)
  );
  const instros = KLEIGH_PIX.filter(
    (t) => t.isInstro && t.moods.includes(moodId)
  );
  // Splice 1 instro near the middle if available
  if (instros.length > 0 && kleighTracks.length > 0) {
    const splice = Math.floor(kleighTracks.length / 2);
    const pick = instros[Math.floor(Math.random() * instros.length)];
    kleighTracks.splice(splice, 0, pick);
  }
  return kleighTracks;
}

// ---------------------------------------------------------------------------
// SINGLE TILE (reused style identical to T20Grid)
// ---------------------------------------------------------------------------

function ActivityTile({
  activity,
  isActive,
  isExhausted,
  onClick,
}: {
  activity: Activity;
  isActive: boolean;
  isExhausted: boolean;
  onClick: (a: Activity) => void;
}) {
  return (
    <button
      onClick={() => onClick(activity)}
      className={`
        group relative flex flex-col items-center justify-center gap-1.5
        rounded-xl border transition-all duration-200
        min-h-[80px] md:min-h-[96px] px-2 py-3 w-full
        active:scale-95
        ${isActive
          ? 'bg-[#1a0f22] border-[#C8A882] shadow-[0_0_12px_rgba(200,168,130,0.35)]'
          : isExhausted
          ? 'bg-[#0a0a0a] border-[#2C1F10]/30 opacity-50'
          : 'bg-[#1a1207] border-[#5C3A1E]/40 hover:border-[#C8A882]/60 hover:bg-[#221508]'
        }
      `}
      aria-label={`Stream ${activity.label}`}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl transition-opacity duration-200"
        style={{ background: activity.accent, opacity: isActive ? 1 : isExhausted ? 0.1 : 0.35 }}
      />
      <span className="text-xl md:text-2xl leading-none" role="img" aria-hidden>{activity.emoji}</span>
      <span
        className={`text-[10px] md:text-xs font-bold uppercase tracking-wider leading-tight text-center transition-colors ${
          isActive ? 'text-[#C8A882]' : isExhausted ? 'text-[#C8A882]/25' : 'text-[#C8A882]/70 group-hover:text-[#C8A882]'
        }`}
      >
        {activity.label}
      </span>
      {isActive && (
        <span className="absolute bottom-1.5 inline-flex gap-[3px]">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-[3px] rounded-full bg-[#C8A882] animate-pulse"
              style={{ height: `${6 + i * 3}px`, animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
      )}
      {isExhausted && !isActive && (
        <span className="absolute bottom-1 text-[8px] text-[#C8A882]/30 uppercase tracking-widest font-bold">done</span>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------

export default function KleighT20Grid() {
  const [activeMoodId, setActiveMoodId] = useState<string | null>(null);
  const [exhaustedMoods, setExhaustedMoods] = useState<Set<string>>(new Set());
  const [nowPlaying, setNowPlaying] = useState<KleighPix | null>(null);
  const [queueRef] = useState<{ items: KleighPix[]; pos: number }>({ items: [], pos: 0 });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Mobile carousel (same pattern as T20Grid)
  const [groupIndex, setGroupIndex] = useState(0);
  const MOBILE_GROUP_SIZE = 3;
  const mobileGroups: Activity[][] = [];
  for (let i = 0; i < T20_ACTIVITIES.length; i += MOBILE_GROUP_SIZE) {
    mobileGroups.push(T20_ACTIVITIES.slice(i, i + MOBILE_GROUP_SIZE));
  }
  const mobileTiles = mobileGroups[groupIndex] ?? [];

  useEffect(() => {
    const interval = setInterval(() => {
      setGroupIndex((prev) => (prev + 1) % mobileGroups.length);
    }, 60_000);
    return () => clearInterval(interval);
  }, [mobileGroups.length]);

  // Ensure only one audio instance exists
  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;

    const handleEnded = () => {
      advanceQueue();
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stop if another player fires — but NEVER stop ourselves
  useEffect(() => {
    const handleStop = (e: Event) => {
      const source = (e as CustomEvent).detail?.source;
      // Ignore our own stop signals — we manage our own audio lifecycle
      if (source === 'kleigh-t20') return;
      audioRef.current?.pause();
      setNowPlaying(null);
    };
    window.addEventListener('stop-all-audio', handleStop);
    return () => window.removeEventListener('stop-all-audio', handleStop);
  }, []);

  // Find next non-exhausted mood starting after currentMoodId
  const findNextMood = useCallback(
    (currentMoodId: string | null): string | null => {
      const startIdx = currentMoodId ? MOOD_ORDER.indexOf(currentMoodId) : -1;
      for (let i = 1; i <= MOOD_ORDER.length; i++) {
        const candidate = MOOD_ORDER[(startIdx + i) % MOOD_ORDER.length];
        if (!exhaustedMoods.has(candidate)) {
          const q = buildQueue(candidate);
          if (q.length > 0) return candidate;
        }
      }
      return null; // all moods exhausted
    },
    [exhaustedMoods]
  );

  const playTrack = useCallback((track: KleighPix) => {
    const audio = audioRef.current;
    if (!audio) return;
    setNowPlaying(track);
    // Signal all other players to yield BEFORE we start, so our audio is exclusive
    window.dispatchEvent(new CustomEvent('stop-all-audio', { detail: { source: 'kleigh-t20' } }));
    audio.src = track.src;
    audio.play().catch(() => {/* autoplay blocked — user will need to tap again */});
    // NOTE: We do NOT dispatch 'play-track' here. KleighT20Grid manages its own
    // audio lifecycle independently. The Now Playing strip below shows current state.
    // Dispatching play-track would cause GlobalPlayer to also load + play the same
    // URL, resulting in double audio.
  }, []);

  const advanceQueue = useCallback(() => {
    queueRef.pos += 1;
    if (queueRef.pos < queueRef.items.length) {
      // Still tracks in this mood
      playTrack(queueRef.items[queueRef.pos]);
    } else {
      // Mood exhausted — mark it and find next
      const exhaustedMood = activeMoodId;
      if (exhaustedMood) {
        setExhaustedMoods((prev) => new Set(prev).add(exhaustedMood));
      }
      const nextMood = findNextMood(exhaustedMood);
      if (nextMood) {
        startMood(nextMood, true);
      } else {
        setNowPlaying(null);
        setActiveMoodId(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMoodId, playTrack, findNextMood]);

  // Keep advanceQueue in sync (closure over activeMoodId changes)
  const advanceRef = useRef(advanceQueue);
  useEffect(() => { advanceRef.current = advanceQueue; }, [advanceQueue]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handler = () => advanceRef.current();
    audio.addEventListener('ended', handler);
    return () => audio.removeEventListener('ended', handler);
  }, []);

  function startMood(moodId: string, auto = false) {
    const queue = buildQueue(moodId);
    if (queue.length === 0) {
      // No KLEIGH tracks for this mood — skip to next
      const next = findNextMood(moodId);
      if (next) startMood(next, auto);
      return;
    }
    queueRef.items = queue;
    queueRef.pos = 0;
    setActiveMoodId(moodId);
    if (!auto) {
      // Manual tap — clear exhausted list for a fresh session
      setExhaustedMoods(new Set());
    }
    playTrack(queue[0]);
  }

  const handleTileClick = (activity: Activity) => {
    startMood(activity.id, false);
  };

  return (
    <section className="w-full bg-[#0d0a06] border-t border-[#C8A882]/15 py-6 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#C8A882]/40 mb-0.5">
              KLEIGH · BTI Library
            </p>
            <h2 className="text-sm md:text-base font-bold text-[#C8A882] tracking-wide">
              Top 20 Streaming Activities
            </h2>
            <p className="text-[10px] text-[#C8A882]/40 mt-0.5">
              KLEIGH only · Moods cycle automatically
            </p>
          </div>
          {/* Mobile dots. Each is a 44px touch target, so they wrap instead of pushing the page
              sideways on a phone (it scrolled sideways at 390px). */}
          <div className="md:hidden flex flex-wrap items-center justify-end gap-1 max-w-[55%]">
            {mobileGroups.map((_, i) => (
              <button
                key={i}
                onClick={() => setGroupIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === groupIndex ? 'bg-[#C8A882] w-3' : 'bg-[#5C3A1E]/60'
                }`}
                aria-label={`Show group ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Now Playing strip */}
        {nowPlaying && (
          <div className="mb-4 flex items-center gap-3 bg-[#1a1207] border border-[#C8A882]/20 rounded-xl px-4 py-2.5">
            <span className="inline-flex gap-[3px] flex-shrink-0">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-[3px] rounded-full bg-[#C8A882] animate-pulse"
                  style={{ height: `${8 + i * 3}px`, animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#C8A882] truncate">{nowPlaying.title}</p>
              <p className="text-[10px] text-[#C8A882]/50 truncate">
                {nowPlaying.vocalist}
                {nowPlaying.isInstro && (
                  <span className="ml-2 text-[#D4A017]/60 font-bold uppercase tracking-wider">· INSTRO</span>
                )}
              </p>
            </div>
            <button
              onClick={() => { audioRef.current?.pause(); setNowPlaying(null); }}
              className="flex-shrink-0 text-[10px] text-[#C8A882]/50 hover:text-[#C8A882] uppercase tracking-widest font-bold transition-colors"
            >
              Stop
            </button>
          </div>
        )}

        {/* ── DESKTOP: all 20 ── */}
        <div className="hidden md:grid md:grid-cols-5 lg:grid-cols-10 gap-2">
          {T20_ACTIVITIES.map((activity) => (
            <ActivityTile
              key={activity.id}
              activity={activity}
              isActive={activeMoodId === activity.id}
              isExhausted={exhaustedMoods.has(activity.id)}
              onClick={handleTileClick}
            />
          ))}
        </div>

        {/* ── MOBILE: 3-tile carousel ── */}
        <div className="md:hidden grid grid-cols-3 gap-2">
          {mobileTiles.map((activity) => (
            <ActivityTile
              key={activity.id}
              activity={activity}
              isActive={activeMoodId === activity.id}
              isExhausted={exhaustedMoods.has(activity.id)}
              onClick={handleTileClick}
            />
          ))}
        </div>

        <p className="md:hidden text-center text-[9px] text-[#C8A882]/25 mt-3 tracking-wide">
          Tap any mood · KLEIGH only · Cycles automatically
        </p>
      </div>
    </section>
  );
}
