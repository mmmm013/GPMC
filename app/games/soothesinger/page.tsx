import Link from 'next/link';
import { SixteenBall } from '@/components/games/ClientGames';

/* SootheSinger. GD, 2026-10-24: "NEEDS Catchy name!!!"; spelled "SootheSinger" (GD, 2026-10-26). The flagship
   version plays ALL FMs and every vocalist (GD, 2026-10-26); 2kleigh.com's plays KLEIGH.
   (Was The Sorceress or Wizard; before that 16-Ball. Old addresses redirect here.) */
export const metadata = { title: 'SootheSinger | G Putnam Music Games' };

export default function SootheSingerPage() {
  return (
    <main className="min-h-screen bg-[#140b22] px-4 pb-16 pt-24 text-white">
      <section className="mx-auto max-w-3xl">
        <Link href="/games" className="text-sm font-bold text-[#FFD54F]">← Games</Link>
        <h1 className="mt-2 text-5xl font-black tracking-tight">SootheSinger</h1>
        <p className="mt-1 text-lg font-bold text-[#FFD54F]">Ask the Sorceress, the Wizard or The Singster.</p>
        <p className="mt-3 text-[#D7CCC8]">
          Four kind guides, each a light in a dark world. Ask of the past, the present or the future, for yourself or for someone
          in your circle, and the answer comes as one word or sound sung from a real song. Read into it what you will.
        </p>
        <details className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-[#D7CCC8]" open>
          <summary className="cursor-pointer font-bold text-white">How to play</summary>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>Choose your voice: the Kind Sorceress, the Kind Wizard or The Singster.</li>
            <li>Choose how to ask: Three Candles (one answer each from the past, the present and the future), Seven Stars (seven questions around the circle) or Thirteen (the party circle, with a light score).</li>
            <li>Gather your circle. Two of you, friends or family. Best with up to 8, but anyone can join at any time.</li>
            <li>On your turn, choose a time (the past, unless you pick the present or the future) and who your question is for.</li>
            <li>For yourself, close your eyes and ask silently. For someone else, look at them and ask out loud, then hand them the phone.</li>
            <li>Breathe in, breathe out, and touch the light, or shake the phone. The guide listens, then answers with one sung word.</li>
          </ol>
          <p className="mt-3 text-sm">You can type your question too, if you like. It stays on this phone and is only sent if you choose to send it.</p>
        </details>
        <div className="mt-8">
          <SixteenBall />
        </div>
      </section>
    </main>
  );
}
