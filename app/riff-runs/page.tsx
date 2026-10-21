import RiffRuns from '@/components/riffRuns/RiffRuns';

export const metadata = { title: 'Riff Runs | G Putnam Music' };

export default function RiffRunsPage() {
  return (
    <main className="min-h-screen bg-[#1a1207] px-4 pb-16 pt-24 text-white">
      <section className="mx-auto max-w-3xl">
        <h1 className="text-5xl font-black tracking-tight">Riff Runs</h1>
        <p className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-[#FFD54F]">Sunday mornings before football · 9:00 AM your time</p>
        <RiffRuns />
      </section>
    </main>
  );
}
