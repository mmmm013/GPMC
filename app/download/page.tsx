import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Your song | G Putnam Music',
  robots: { index: false, follow: false },
};

/* Where a $1.99 song buyer lands after paying (GD, 2026-10-11: "WE DECIDED
   ... 1.99 DOWNLOADS"). k-kut.com asks Stripe which song this receipt paid
   for; the button hands over that song. The link works again any time. */
export const dynamic = 'force-dynamic';

type Info = { ok: boolean; artist?: string; title?: string; downloadUrl?: string; reason?: string };

async function info(sessionId: string): Promise<Info> {
  if (!sessionId) return { ok: false, reason: 'bad_session' };
  try {
    const res = await fetch(`https://www.k-kut.com/api/song-download/info?session_id=${encodeURIComponent(sessionId)}`, {
      cache: 'no-store',
      headers: { 'User-Agent': 'GPM-flagship/1' },
    });
    return (await res.json()) as Info;
  } catch {
    return { ok: false, reason: 'unreadable' };
  }
}

export default async function DownloadPage({ searchParams }: { searchParams?: Promise<{ session_id?: string }> }) {
  const sessionId = String((await searchParams)?.session_id ?? '');
  const d = await info(sessionId);
  return (
    <main className="min-h-screen bg-[#FFF0F5] text-[#2C2418]">
      <Header />
      <section className="mx-auto max-w-xl px-6 py-20 text-center">
        {d.ok ? (
          <>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#8B4513]">Thank you — it’s yours</p>
            <h1 className="mt-3 text-4xl font-black text-[#2C2418]">{d.title}</h1>
            <p className="mt-2 text-base font-bold uppercase tracking-[0.14em] text-[#8B4513]">{d.artist}</p>
            <a
              href={d.downloadUrl}
              className="mt-10 inline-block rounded-full bg-[#FFD54F] px-10 py-5 text-xl font-black text-[#2A1506] shadow-lg hover:bg-[#FFE082]"
            >
              Download your song
            </a>
            <p className="mt-6 text-sm text-[#5D4037]">Keep this page. The button works again any time.</p>
          </>
        ) : d.reason === 'not_paid' || d.reason === 'unreadable' || d.reason === 'not_configured' ? (
          <>
            <h1 className="text-3xl font-black">Your payment is still finishing.</h1>
            <p className="mt-4 text-base">Give it a minute, then refresh this page. You will not be charged twice.</p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-black">This link does not open a song.</h1>
            <p className="mt-4 text-base">Use the link from your receipt. If you lost it, email reachus@gputnammusic.com and we will send your song again.</p>
          </>
        )}
      </section>
      <Footer />
    </main>
  );
}
