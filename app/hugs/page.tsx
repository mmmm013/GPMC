export default function HugsPage() {
  return (
    <main className="min-h-screen bg-[#fffdf2] text-[#08254a] px-6 py-10">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-[28px] border-4 border-[#08254a] bg-white p-8 shadow-[10px_10px_0_#f4c400]">
          <p className="mb-4 inline-flex rounded-full border-2 border-[#08254a] px-4 py-2 text-xs font-black tracking-[0.16em]">
            GPMx PRODUCT LANE
          </p>

          <h1 className="text-4xl font-black leading-tight md:text-6xl">
            HUGs for Ones Who Matter
          </h1>

          <p className="mt-4 max-w-3xl text-xl font-bold text-[#147a33]">
            Send a private music moment when words alone are not enough.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border-2 border-[#08254a] bg-[#fffdf2] p-5">
              <h2 className="text-xl font-black">Choose the feeling</h2>
              <p className="mt-2 font-semibold">
                Start from the emotional need, not a generic song search.
              </p>
            </div>

            <div className="rounded-2xl border-2 border-[#08254a] bg-[#fffdf2] p-5">
              <h2 className="text-xl font-black">Send the link</h2>
              <p className="mt-2 font-semibold">
                K-KUT handles the clean HUG buyer and receiver path.
              </p>
            </div>

            <div className="rounded-2xl border-2 border-[#08254a] bg-[#fffdf2] p-5">
              <h2 className="text-xl font-black">Just press play</h2>
              <p className="mt-2 font-semibold">
                No download. No search. No checkout on the gift page.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="https://www.k-kut.com/hug"
              className="rounded-full border-2 border-[#08254a] bg-[#08254a] px-5 py-3 font-black text-white shadow-[4px_4px_0_#f4c400]"
            >
              Start a HUG
            </a>

            <a
              href="/"
              className="rounded-full border-2 border-[#08254a] bg-white px-5 py-3 font-black text-[#08254a] shadow-[4px_4px_0_#f4c400]"
            >
              Return to GPMx
            </a>
          </div>
        </div>

        <section className="mt-8 rounded-[24px] border-2 border-[#08254a] bg-white p-6">
          <h2 className="text-2xl font-black">How GPMx and K-KUT work together</h2>
          <p className="mt-3 font-semibold leading-relaxed">
            The flagship contains the larger GPMx world: source music, product lanes,
            review paths, invention context, and platform authority. K-KUT remains the focused
            HUG home for buyers and receivers.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl bg-[#eef6ff] p-4">
              <strong>GPMx / flagship</strong>
              <p className="mt-1">Authority, catalog, source context, and system explanation.</p>
            </div>

            <div className="rounded-xl bg-[#eef6ff] p-4">
              <strong>K-KUT</strong>
              <p className="mt-1">HUG selection, sending, receiving, and private-link flow.</p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
