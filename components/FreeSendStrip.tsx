'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * SEND ONE FREE. GD, 2026-11-26: "when people go to gputnammusic.com, let's feature a promotional tool
 * where they can go in and send a hug or a tug for free on our site. We don't keep that information. We
 * use and lose, and they can send something to themselves or to someone else." Chosen on a card: they
 * share a link themselves, a featured few, through Dec 31, 2026.
 *
 * The list and the sending live on k-kut.com (app/api/gpm-free-send there). Nothing shows here until GD
 * has approved the featured few and while the window is open: the API answers open:false and this renders
 * nothing. Previews are 13 seconds, never the whole piece; a link plays, never downloads.
 */
const API = 'https://www.k-kut.com/api/gpm-free-send';
const PREVIEW_SECONDS = 13;

type Featured = { id: string; tier: 'HUG' | 'TUG'; song: string; words: string; seconds: number; audio: string };

const SAY: Record<string, string> = {
  one_a_day: 'You have used today’s free one. Come back tomorrow for another.',
  not_open: 'The free send has ended. Thank you for trying it.',
};

export default function FreeSendStrip() {
  const [featured, setFeatured] = useState<Featured[]>([]);
  const [playing, setPlaying] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [sent, setSent] = useState<{ id: string; link: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const audio = useRef<HTMLAudioElement | null>(null);
  const stopAt = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(API, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setFeatured(d?.open && Array.isArray(d.featured) ? d.featured : []))
      .catch(() => setFeatured([]));
    return () => stop();
  }, []);

  function stop() {
    if (stopAt.current) clearTimeout(stopAt.current);
    audio.current?.pause();
    setPlaying(null);
  }

  function hear(f: Featured) {
    if (playing === f.id) return stop();
    stop();
    const a = audio.current ?? new Audio();
    audio.current = a;
    a.src = f.audio;
    a.currentTime = 0;
    void a.play().catch(() => setPlaying(null));
    setPlaying(f.id);
    a.onended = () => setPlaying(null);
    stopAt.current = setTimeout(stop, PREVIEW_SECONDS * 1000);
  }

  async function send(f: Featured) {
    stop();
    setBusy(f.id);
    setError('');
    setCopied(false);
    try {
      const r = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_option_id: f.id }),
      });
      const d = await r.json();
      if (!d?.ok || !d.link) {
        setError(SAY[d?.reason] ?? 'That did not go through. Please try again in a moment.');
        return;
      }
      setSent({ id: f.id, link: d.link });
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: `A ${f.tier} from G Putnam Music`, text: 'I sent you a song. Tap to hear it.', url: d.link }).catch(() => {});
      }
    } catch {
      setError('That did not go through. Please try again in a moment.');
    } finally {
      setBusy(null);
    }
  }

  async function copy(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  if (!featured.length) return null;

  return (
    <section className="mt-12 rounded-3xl bg-white px-6 py-8 text-left shadow-xl ring-1 ring-[#8B4513]/20">
      <p className="text-sm font-black uppercase tracking-[0.25em] text-[#8B4513]">Free from G Putnam Music</p>
      <h2 className="mt-2 text-3xl font-black leading-tight text-[#2C2418] md:text-4xl">Send a HUG or a TUG, free.</h2>
      <p className="mt-3 text-lg leading-relaxed text-[#2C2418]/80">
        Hear one, tap Send, and share the link with anyone &mdash; or keep it for yourself. We don&rsquo;t ask who you
        are, and we don&rsquo;t keep anything. One free a day.
      </p>
      <ul className="mt-6 space-y-3">
        {featured.map((f) => (
          <li key={f.id} className="rounded-2xl bg-[#FFF0F5] px-5 py-4">
            <p className="text-xs font-black uppercase tracking-widest text-[#8B4513]">
              {f.tier} · {f.song}
            </p>
            <p className="mt-1 text-lg font-bold leading-snug">&ldquo;{f.words}&rdquo;</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => hear(f)}
                className="min-h-12 rounded-full border-2 border-[#8B4513] px-5 py-2 text-base font-black text-[#8B4513]"
              >
                {playing === f.id ? '■ Stop' : '▶ Hear it'}
              </button>
              <button
                type="button"
                onClick={() => send(f)}
                disabled={busy !== null}
                className="min-h-12 rounded-full bg-[#FFD54F] px-6 py-2 text-base font-black text-[#2A1506] shadow disabled:opacity-60"
              >
                {busy === f.id ? 'Making your link…' : 'Send free →'}
              </button>
            </div>
            {sent?.id === f.id ? (
              <div className="mt-4 rounded-xl bg-white p-4">
                <p className="text-base font-bold">Your link is ready. Text it, email it, or open it yourself:</p>
                <p className="mt-2 break-all text-sm text-[#8B4513]">{sent.link}</p>
                <button
                  type="button"
                  onClick={() => copy(sent.link)}
                  className="mt-3 min-h-11 rounded-full bg-[#3B1E12] px-5 py-2 text-sm font-black text-white"
                >
                  {copied ? 'Copied ✓' : 'Copy link'}
                </button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      {error ? <p className="mt-4 text-base font-bold text-[#8B1E12]">{error}</p> : null}
    </section>
  );
}
