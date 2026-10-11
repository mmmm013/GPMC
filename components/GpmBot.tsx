'use client';
/**
 * GpmBot — Step-by-Step Journey Guide (Voice-Activated)
 *
 * Behavior:
 * - Greets the user on mount with the active bot's arrival greeting
 * - Displays journey steps in a vertical scroll window
 * - Active step: full contrast, animated pulse ring, bold label
 * - Previous steps (above): dimmed, ✓ check mark, still visible
 * - Next steps (below): dimmed, numbered, peeking to invite scroll
 * - User advances via "Next Step" button, keyboard (→), or VOICE COMMAND
 * - Voice commands: "next" / "back" / "go" / "done" / "collapse" / "expand"
 * - Can collapse to a compact bot-chip to stay non-intrusive
 *
 * Props:
 * bot - which bot persona to use (default: 'MC-BOT')
 * steps - optional custom journey steps (defaults to JOURNEY_PROTOCOL)
 * onStepChange - optional callback fired when activeStep changes
 */
import { useState, useEffect, useRef, useCallback, type KeyboardEvent } from 'react';
import { ChevronRight, ChevronDown, CheckCircle, Circle, Zap, X, Mic, MicOff } from 'lucide-react';
import { safePlay } from '@/lib/audio/safePlay';
import { AUDIO_UI_MESSAGES } from '@/lib/audio/messages';

// ---------------------------------------------------------------------------
// Bot config — mirrors BOT_PROFILES in /api/public/kkut-guide
// ---------------------------------------------------------------------------

export type BotName = 'MC-BOT' | 'LF-BOT' | 'GD-BOT' | 'PIXIE-BOT' | 'OPS-BOT' | 'P-LEC-BOT';

const BOT_CONFIG: Record<BotName, {
  label: string;
  color: string;
  ringColor: string;
  emoji: string;
  greeting: string;
  /** Single bold line shown on first-ever visit — the invention unveiling itself */
  firstVisitCue: string;
  /** Voice/persona descriptor shown as a sub-label */
  voice: string;
  /** Path to greeting audio file in /public/audio/ — undefined = TTS fallback */
  greetingAudio?: string;
}> = {
  /**
  * MC-BOT — KLEIGH, AUS
  * Australian dialect, warm, roguish, "Robin Hood" maverick energy.
  * Sounds like a close friend showing you the good stuff, not a salesperson.
  * First to greet every visitor; hands off to LF-BOT, GD-BOT, or PIXIE-BOT as needed.
  */
  'MC-BOT': {
    label: 'MC-BOT',
    color: '#C8A882',
    ringColor: 'ring-amber-500/60',
    emoji: '🎛️',
    voice: 'Your guide · KLEIGH, AUS',
    greetingAudio: '/audio/mc_bot_intro.m4a',
    greeting: "HAVE YOU EVER SENT A FEELING BEFORE? SEND A HUG; You can send a special feeling through beautiful vocals & brilliant music behind it. It's like a bitmoji-come-to-life.",
    firstVisitCue: "HAVE YOU EVER SENT A FEELING BEFORE? SEND A HUG; You can send a special feeling through beautiful vocals & brilliant music behind it. It's like a bitmoji-come-to-life.",
  },
  'LF-BOT': {
    label: 'LF-BOT',
    color: '#4ade80',
    ringColor: 'ring-green-400/60',
    emoji: '💌',
    voice: 'Lisa Farmer · IL, USA',
    greetingAudio: '/audio/lcf_intro.m4a',
    greeting: "Hi there — I'm LF-BOT, Lisa Farmer from Illinois. I'll walk you through every step nice and clear. Licensing, rights, deal questions — I turn all the complex stuff into plain English. Your work and your buyer's needs are fully respected here. Let's go!",
    firstVisitCue: "Hi! I'm LF-BOT — Lisa Farmer from IL. Say \"NEXT\" or tap → and I'll guide you through every step with warmth and clarity. Nothing complicated, I promise!",
  },
  'GD-BOT': {
    label: 'GD-BOT',
    color: '#6ee7b7',
    ringColor: 'ring-emerald-400/60',
    emoji: '📊',
    voice: 'Founder · Normal, USA',
    greetingAudio: '/audio/gpm_intro.m4a',
    greeting: "GD-BOT online. Direct. Energetic. ALIVE! I'm the Founder — Normal, USA. I find the next best move for you right now: pricing, campaigns, HUG focus. Customer is always right, and the right move is always forward. Let's GO.",
    firstVisitCue: "GD-BOT online. ALIVE! I'm the Founder. Say \"NEXT\" or tap → and we level this up together. Direct, fast, and always rooting for you.",
  },
  'PIXIE-BOT': {
    label: 'PIXIE-BOT',
    color: '#a78bfa',
    ringColor: 'ring-violet-400/60',
    emoji: '✨',
    voice: 'PIXIE · Creative Stylist',
    greetingAudio: '/audio/pixie_intro.m4a',
    greeting: "Hi, I'm PIXIE-BOT ✨ Jane Burton, creative stylist and your guide to perfect music moments. I shape HUG experiences, curate PIXIE's playlist, and help you find the exact note that speaks. Say \"NEXT\" or tap → and let's create something beautiful.",
    firstVisitCue: "I'm PIXIE-BOT ✨ Say \"NEXT\" or tap → and I'll shape your perfect music moment — personal, curated, exactly right.",
  },
  'OPS-BOT': {
    label: 'OPS-BOT',
    color: '#93c5fd',
    ringColor: 'ring-blue-300/60',
    emoji: '⚙️',
    voice: 'Ops & Admin · Platform',
    greeting: "OPS-BOT online. Platform status nominal. I monitor cron jobs, migration health, and admin alerts. Ask me anything about system status or pipeline health. Let's keep things running clean.",
    firstVisitCue: "OPS-BOT here ⚙️ Say \"NEXT\" or tap → and I'll walk you through the platform dashboard — clean, fast, no guesswork.",
  },
  'P-LEC-BOT': {
    label: 'P-LEC-BOT',
    color: '#fca5a5',
    ringColor: 'ring-rose-400/70',
    emoji: '🎯',
    voice: 'Sniper Watchdog · Intake Control',
    greeting: 'P-LEC-BOT online. Sniper intake is active: I tag all incoming bots, report every arrival, and maintain hold until GPME admin clears by email.',
    firstVisitCue: 'P-LEC-BOT active 🎯 Say "NEXT" or tap → for intake watch status and control policy.',
  },
};

const BOT_STEP_HINTS: Record<BotName, string[]> = {
  'MC-BOT': [
    "Who's special who's on your mind now? Love? Encouragement? Casual? Supportive? I'll find options, such as an intro and meaningful 1st verse or a bridge and a final chorus.",
    "You can send a special feeling through beautiful vocals & brilliant music behind it. It's like a bitmoji-come-to-life. Truly help moments stand out in ways NEVER done before.",
    "Make noise the healthy way! Send a HUG, & also see TUGs and BUGs [lines, words] and K-kUpIds, which are all about romance... at different levels to suit your love interest.",
    "Tap the link. No app, no account, no faff. Just the feeling, delivered instantly. A digital moment perfectly delivered.",
    "Mission accomplished. You've sent more than a link — you've sent a feeling. The rhythm stays with you. Drive on."
  ],
  'LF-BOT': [
    "Welcome! I'm so glad you're here. Let's take this one step at a time. You'll browse through the catalog, or simply tell us your mood or occasion, and we'll find that perfect music moment together. It's all very straightforward, I promise!",
    "Now here's where it gets really neat — a HUG is a private link that opens to a whole section of a song. A TUG streams just one line or phrase. Both protect your rights fully, and your buyer's needs are completely respected throughout. I want you to know that.",
    "K-kUpId is the gifting layer — and this is where things get exciting from a licensing standpoint! Every link is properly resolved. Your work is protected. Buyers get a clear, honest experience. And if you ever have questions about rights or deal terms, I'm right here for you.",
    "Just tap the link — no app required, no account to create. The experience opens directly, clean and clear. Fully above board. That's exactly how we do things here.",
    "And we've arrived! You've been wonderful to walk through this with. Music has always been the best gift, and now you can send exactly the right note with complete peace of mind. Thank you so much for being here — it truly means a lot.",
  ],
  'GD-BOT': [
    "Let's GO. The catalog is ALIVE with Sweet Spots — those exact moments in a track that land differently. Browse it, filter by mood, or tell me what you need right now. I'll find the move.",
    "A HUG is the performance vehicle. One tap. Opens the exact moment you want the listener to hear. A TUG handles one line. Both designed for maximum impact — shareable, trackable, campaign-ready. That's leverage.",
    "K-kUpId is your pricing and gifting engine. This is where you set the experience level — romance skin, full capsule, pricing tier. Every link you generate here is a campaign asset. Think about what that means for your catalog.",
    "Tap the link. That's the whole product. Zero friction. No account required. The Sweet Spot plays instantly. Customer is always right — and the right experience is always immediate.",
    "That's the destination. But the strategy doesn't stop here — this is where we plan the NEXT campaign, the next HUG drop, the next level. You've got the tools. The rhythm stays with you. Drive on.",
  ],
  'PIXIE-BOT': [
    "Oh, let's find your perfect music moment ✨ Think of a feeling, a memory, a scene in your mind. The catalog holds it — we just have to find it together. What's the mood today, love?",
    "A HUG is like a little gift box for a song moment 💎 One link that opens to exactly the right part. A TUG captures one line — just the part that speaks. Both are shareable, giftable, and beautifully simple.",
    "K-kUpId is where we dress the experience ✨ Choose a track, find your moment, then decide — is this a gift, a romantic gesture, or a full digital moment? Every detail can be tailored to the feeling you want to send.",
    "Tap and listen. No friction, no forms — just the music, exactly as intended. That's the artistry of it. Pure and precise. A moment perfectly delivered.",
    "Last song, mate. You've reached the destination, but the rhythm stays with you. Drive on 🌿 Music is the most personal gift — and you've just learned how to send exactly the right note. Beautiful work.",
  ],
  'OPS-BOT': [
    "Platform check — everything starts here. I monitor cron job health, migration status, and admin alerts in real time. No guesswork, just clean signal.",
    "Cron jobs fire on schedule: rotate-promotions every 3 hours, free-gift every hour. Any deviation shows up in Vercel logs. I watch them all.",
    "Migration pipeline is versioned and sequential. Each migration in supabase/migrations/ runs exactly once. Rollbacks are manual — flag me if anything needs unwinding.",
    "API health: all endpoints return 200 in normal operation. /api/health is your quick check. /api/admin/lt-pix-mkut-check verifies coverage. Both are CRON_SECRET-guarded.",
    "Status nominal. All systems operational. Keep an eye on the Vercel dashboard for edge function timing. If you need a full audit, I'm right here.",
  ],
  'P-LEC-BOT': [
    'Sniper intake online. Every incoming bot is tagged immediately and logged for traceability.',
    'All arrivals are reported in full. No silent pass-through and no untracked sessions.',
    'Tracking persistence is strict: once tagged, monitoring remains active until explicit GPME admin release by email.',
    'Internal edit-power is not open access. It is available only through Rent a Ripper: annual term or 1-year monthly-payment term, with signed agreement required.',
    'Termination is breakable by either side, but only through email with GPME admin. Policy enforced.',
    'Execution objective: create new free time and reduce stress by preventing inaccuracies, mis-timings, miscommunication, and mis-information before release.',
  ],
};

export interface JourneyStep {
  title: string;
  hint?: string;
  href?: string;
  action?: string;
}

export const DEFAULT_STEPS: JourneyStep[] = [
  {
    title: 'Discover your music moment',
    hint: 'You know that one moment in a song — the hook that wrecks you? We call that the Sweet Spot. Browse the catalog or tell me your mood, occasion, or artist.',
    action: 'Browse Catalog',
    href: '/#t20',
  },
  {
    title: 'Choose a HUG, TUG or BUG',
    hint: 'HUGs, TUGs and BUGs are pre-made and ready to send in one tap.',
    action: 'Send a HUG',
    href: '/kupid',
  },
  {
    title: 'Select or resolve your link',
    hint: 'K-kUpId is the gifting layer. Select a pre-made KK/mK/KPD, then share the full digital experience. MIP2 custom work is handled outside GPME by request.',
    action: 'Open a Pre-Made HUG',
    href: '/kkut/create',
  },
  {
    title: 'Open & play your experience',
    hint: 'Tap the link. No app. No account. Just tap and hear the exact Sweet Spot. That\'s the whole move.',
    action: 'Play a Track',
    href: '/k',
  },
  {
    title: 'Share or gift your K-kUpId',
    hint: "Last song, mate. You've reached the destination, but the rhythm stays with you. Drive on. Music has always been the best gift — now you can send exactly the right note.",
    action: 'Gift It',
    href: '/gift',
  },
];

interface GpmBotProps {
  bot?: BotName;
  steps?: JourneyStep[];
  onStepChange?: (index: number) => void;
  startCollapsed?: boolean;
  className?: string;
}

export default function GpmBot({
  bot = 'MC-BOT',
  steps = DEFAULT_STEPS,
  onStepChange,
  startCollapsed = false,
  className = '',
}: GpmBotProps) {
  const profile = BOT_CONFIG[bot];
  const [activeStep, setActiveStep] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(startCollapsed);
  const [greeted, setGreeted] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [moodAck, setMoodAck] = useState('');
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = `gpmbot_visited_${bot}`;
    const visited = localStorage.getItem(key);
    if (!visited) {
      setIsFirstVisit(true);
      setIsCollapsed(false);
      localStorage.setItem(key, '1');
    }
  }, [bot]);

  useEffect(() => {
    if (!isFirstVisit) return;
    const t = setTimeout(() => setIsFirstVisit(false), 3000);
    return () => clearTimeout(t);
  }, [isFirstVisit]);

  useEffect(() => {
    const handler = (e: CustomEvent<{ mood: string; emoji: string }>) => {
      const { mood, emoji } = e.detail ?? {};
      if (!mood) return;
      setMoodAck(`${emoji ?? '🎵'} ${mood} vibes — switching now`);
      setIsCollapsed(false);
      setTimeout(() => setMoodAck(''), 3500);
    };
    window.addEventListener('t20-mood-change', handler as EventListener);
    return () => window.removeEventListener('t20-mood-change', handler as EventListener);
  }, []);

  useEffect(() => {
    if (isCollapsed) return;
    const t = setTimeout(() => {
      setShowGreeting(true);
      setGreeted(true);
    }, 400);
    return () => clearTimeout(t);
  }, [isCollapsed]);

  useEffect(() => {
    if (!showGreeting) return;
    const t = setTimeout(() => setShowGreeting(false), 6000);
    return () => clearTimeout(t);
  }, [showGreeting]);

  useEffect(() => {
    if (!showGreeting) return;
    const src = profile.greetingAudio;
    if (src) {
      const audio = new Audio(src);
      audioRef.current = audio;
      safePlay(audio, 'GpmBot-greeting', { track: profile.label, url: src }).then((result) => {
        if (result.ok) return;
        setVoiceStatus(AUDIO_UI_MESSAGES.playbackBlocked);
        setTimeout(() => setVoiceStatus(''), 2000);
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          const utt = new SpeechSynthesisUtterance(profile.greeting);
          window.speechSynthesis.speak(utt);
        }
      });
      return () => {
        audio.pause();
        audioRef.current = null;
      };
    } else {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const utt = new SpeechSynthesisUtterance(profile.greeting);
        window.speechSynthesis.speak(utt);
      }
    }
  }, [showGreeting, profile.greetingAudio, profile.greeting]);

  useEffect(() => {
    const el = stepRefs.current[activeStep];
    if (el) {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    onStepChange?.(activeStep);
  }, [activeStep, onStepChange]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      setActiveStep((s) => Math.min(s + 1, steps.length - 1));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      setActiveStep((s) => Math.max(s - 1, 0));
    }
  }, [steps.length]);

  const handleVoiceCommand = useCallback((transcript: string) => {
    const cmd = transcript.toLowerCase().trim();
    if (cmd.includes('next') || cmd.includes('forward') || cmd.includes('proceed')) {
      setActiveStep((s) => Math.min(s + 1, steps.length - 1));
      setVoiceStatus('→ Next');
    } else if (cmd.includes('back') || cmd.includes('previous') || cmd.includes('prev')) {
      setActiveStep((s) => Math.max(s - 1, 0));
      setVoiceStatus('← Back');
    } else if (cmd.includes('done') || cmd.includes('finish') || cmd.includes('close') || cmd.includes('collapse')) {
      setIsCollapsed(true);
      setVoiceStatus('Done ✓');
    } else if (cmd.includes('expand') || cmd.includes('open') || cmd.includes('show')) {
      setIsCollapsed(false);
      setVoiceStatus('Expanded');
    } else if (cmd.includes('go') || cmd.includes('action') || cmd.includes('click')) {
      const step = steps[activeStep];
      if (step?.href) window.location.href = step.href;
      setVoiceStatus('Going →');
    }
    setTimeout(() => setVoiceStatus(''), 2000);
  }, [steps, activeStep]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (!recognitionRef.current) {
      const r = new SR();
      r.continuous = true;
      r.lang = 'en-US';
      r.interimResults = false;
      r.onresult = (event: any) => {
        const t = event.results[event.results.length - 1][0].transcript;
        handleVoiceCommand(t);
      };
      r.onerror = () => {};
      r.onend = () => {
        if (isListening) { try { r.start(); } catch (_) {} }
      };
      recognitionRef.current = r;
    }
    if (isListening) {
      try { recognitionRef.current.start(); } catch (_) {}
    } else {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
    };
  }, [isListening, handleVoiceCommand]);

  const goNext = () => setActiveStep((s) => Math.min(s + 1, steps.length - 1));
  const goPrev = () => setActiveStep((s) => Math.max(s - 1, 0));
  const isFirst = activeStep === 0;
  const isLast = activeStep === steps.length - 1;

  if (isCollapsed) {
    return (
      <button
        onClick={() => {
          setIsCollapsed(false);
          if (!greeted) {
            setTimeout(() => { setShowGreeting(true); setGreeted(true); }, 200);
          }
        }}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase transition-all hover:brightness-110 ${className}`}
        style={{ borderColor: `${profile.color}40`, color: profile.color, background: `${profile.color}10` }}
        aria-label={`Open ${profile.label} guide`}
      >
        <span>{profile.emoji}</span>
        <span>{profile.label}</span>
        <span className="text-[9px] text-white/40">STEP {activeStep + 1}/{steps.length}</span>
        <Mic className="w-2.5 h-2.5 opacity-30" />
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>
    );
  }

  return (
    <div
      className={`relative w-full max-w-sm rounded-2xl border bg-black/80 backdrop-blur-md overflow-hidden ${isFirstVisit ? 'ring-2 ring-offset-1 ring-offset-black animate-pulse' : ''} ${className}`}
      style={{ borderColor: `${profile.color}30`, ...(isFirstVisit ? { '--tw-ring-color': `${profile.color}80` } as React.CSSProperties : {}) }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label={`${profile.label} journey guide`}
    >
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: `${profile.color}20`, background: `${profile.color}08` }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{profile.emoji}</span>
          <div>
            <span className="text-[10px] font-black tracking-[0.25em] uppercase" style={{ color: profile.color }}>
              {profile.label}
            </span>
            <span className="block text-[9px] text-white/40 tracking-wide">
              {profile.voice}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {voiceStatus && (
            <span className="text-[9px] font-bold tracking-wider" style={{ color: profile.color }}>
              {voiceStatus}
            </span>
          )}
          <button
            onClick={() => setIsListening((v) => !v)}
            className={`p-1.5 rounded-full transition-all ${
              isListening
                ? 'animate-pulse'
                : 'hover:bg-white/10'
            }`}
            style={isListening ? { background: `${profile.color}30`, color: profile.color } : {}}
            aria-label={isListening ? 'Stop voice control' : 'Start voice control'}
            title={isListening ? 'Voice active — say: next / back / go / done' : 'Enable voice control'}
          >
            {isListening ? (
              <Mic className="w-3.5 h-3.5" style={{ color: profile.color }} />
            ) : (
              <MicOff className="w-3.5 h-3.5 text-white/30" />
            )}
          </button>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Collapse bot"
          >
            <X className="w-3.5 h-3.5 text-white/40" />
          </button>
        </div>
      </div>

      {moodAck && (
        <div
          className="mx-4 mt-3 px-3 py-2 rounded-xl text-xs font-bold text-white leading-snug animate-pulse"
          style={{ background: `${profile.color}20`, border: `1px solid ${profile.color}40` }}
        >
          <span style={{ color: profile.color }}>{moodAck}</span>
        </div>
      )}

      {showGreeting && !moodAck && (
        <div
          className="mx-4 mt-3 px-3 py-2.5 rounded-xl leading-relaxed"
          style={{ background: `${profile.color}15`, border: `1px solid ${profile.color}25` }}
        >
          {isFirstVisit ? (
            <p className="text-sm font-black text-white leading-snug">
              {profile.firstVisitCue}
            </p>
          ) : (
            <p className="text-xs text-white/80">
              <Zap className="inline w-3 h-3 mr-1 mb-0.5" style={{ color: profile.color }} />
              {profile.greeting}
            </p>
          )}
        </div>
      )}

      <div className="px-3 py-3 flex flex-col gap-1.5 max-h-72 overflow-y-auto scrollbar-hide">
        {steps.map((step, i) => {
          const isPast = i < activeStep;
          const isCurrent = i === activeStep;
          return (
            <div
              key={i}
              ref={(el) => { stepRefs.current[i] = el; }}
              onClick={() => setActiveStep(i)}
              className={`relative flex items-start gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 select-none ${
                isCurrent
                  ? `ring-2 ${profile.ringColor} bg-white/5`
                  : isPast
                  ? 'opacity-45 hover:opacity-60'
                  : 'opacity-35 hover:opacity-55'
              }`}
              style={isCurrent ? { borderColor: `${profile.color}40` } : {}}
              aria-current={isCurrent ? 'step' : undefined}
              role="button"
              tabIndex={-1}
            >
              <div className="flex-shrink-0 mt-0.5">
                {isPast ? (
                  <CheckCircle className="w-4 h-4" style={{ color: profile.color }} />
                ) : isCurrent ? (
                  <span
                    className="flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-black animate-pulse"
                    style={{ background: profile.color, color: '#000' }}
                  >
                    {i + 1}
                  </span>
                ) : (
                  <Circle className="w-4 h-4 text-white/25" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-xs font-semibold leading-snug ${isCurrent ? 'text-white' : 'text-white/60'}`}
                >
                  {step.title}
                </p>
                {isCurrent && (step.hint || BOT_STEP_HINTS[bot]?.[i]) && (
                  <p className="mt-1 text-[10px] text-white/50 leading-relaxed">
                    {BOT_STEP_HINTS[bot]?.[i] ?? step.hint}
                  </p>
                )}
                {isCurrent && step.href && (
                  <a
                    href={step.href}
                    className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full transition-all hover:brightness-110"
                    style={{
                      background: `${profile.color}20`,
                      color: profile.color,
                      border: `1px solid ${profile.color}40`,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {step.action ?? 'Go'}
                    <ChevronRight className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="flex items-center justify-between px-4 py-3 border-t"
        style={{ borderColor: `${profile.color}20` }}
      >
        <button
          onClick={goPrev}
          disabled={isFirst}
          className="text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full transition-all disabled:opacity-20 hover:bg-white/10"
          style={{ color: profile.color }}
        >
          ← Back
        </button>
        <span className="flex gap-1">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              className="rounded-full transition-all"
              style={{
                width: i === activeStep ? '14px' : '6px',
                height: '6px',
                background: i === activeStep ? profile.color : `${profile.color}40`,
              }}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </span>
        {isLast ? (
          <button
            onClick={() => setIsCollapsed(true)}
            className="text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full transition-all hover:brightness-110"
            style={{ background: `${profile.color}20`, color: profile.color, border: `1px solid ${profile.color}40` }}
          >
            Done ✓
          </button>
        ) : (
          <button
            onClick={goNext}
            className="text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full transition-all hover:brightness-110"
            style={{ background: `${profile.color}20`, color: profile.color, border: `1px solid ${profile.color}40` }}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
