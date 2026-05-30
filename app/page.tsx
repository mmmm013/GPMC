import Link from "next/link";

const primaryLanes = [
  {
    lane: "BUYER",
    title: "I want to send a music gift",
    body: "Pick a feeling, hear real music samples, choose a K-KUT HUG, and order a private link.",
    href: "https://www.k-kut.com/hug",
    cta: "Send a HUG",
  },
  {
    lane: "ARTIST",
    title: "I make music",
    body: "Start a controlled review before any song, section, hook, or moment becomes public or productized.",
    href: "/kreator-intake",
    cta: "Start intake",
  },
  {
    lane: "RIGHTS HOLDER",
    title: "I control catalog",
    body: "Review how GPMx can evaluate source music, song sections, and future product uses without dumping assets publicly.",
    href: "/kreator-intake",
    cta: "Review catalog path",
  },
  {
    lane: "PARTNER / IP",
    title: "I need the invention view",
    body: "See GPMx as the control hub for K-KUT, HUG, TUG, SOM, PIX, STI, STI-Slots, BTIs, and 4PE.",
    href: "/contact",
    cta: "Start conversation",
  },
];

const secondaryLanes = [
  {
    lane: "TESTER",
    title: "Test the buyer path",
    href: "https://www.k-kut.com/find",
  },
  {
    lane: "BUSINESS",
    title: "Campaigns and promo uses",
    href: "/commercial",
  },
  {
    lane: "SUPERVISOR",
    title: "Music moments for scenes",
    href: "/commercial",
  },
  {
    lane: "FAN",
    title: "Listen, follow, support",
    href: "/who",
  },
  {
    lane: "LEGAL",
    title: "Patent / IP review",
    href: "/contact",
  },
];

const behaviorStack = [
  {
    key: "STI",
    title: "Song-to-intent behavior",
    body: "Source music mapped to user purpose, emotional use, and product direction.",
  },
  {
    key: "STI-Slots",
    title: "Controlled use slots",
    body: "Where a song, section, phrase, or moment can serve a defined user need.",
  },
  {
    key: "BTIs",
    title: "Behavior-triggered inventory",
    body: "Assets organized by what a user is trying to do, send, feel, prove, or place.",
  },
  {
    key: "PIX",
    title: "Source music objects",
    body: "Original human-made songs and catalog objects feeding review and future product life.",
  },
  {
    key: "K-KUT",
    title: "Song-section products",
    body: "Controlled real-audio sections derived from approved source music.",
  },
  {
    key: "HUG / TUG",
    title: "Private-link music gifts",
    body: "Sendable music moments built for personal or targeted-use delivery.",
  },
];

const crmFields = [
  "Client lane",
  "Relationship",
  "Current ask",
  "Best link",
  "Status",
  "Next follow-up",
  "Pain point",
  "Offer fit",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#100804] text-[#F7E7C8]">
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10 sm:py-14">
        <div className="overflow-hidden rounded-[2rem] border border-[#D4A017]/35 bg-[#201106] shadow-2xl shadow-black/45">
          <div className="grid lg:grid-cols-[1.06fr_0.94fr]">
            <div className="p-7 sm:p-10 lg:p-12">
              <p className="text-sm font-black uppercase tracking-[0.34em] text-[#FFD36A]">
                GPMx Flagship
              </p>

              <h1 className="mt-5 max-w-5xl text-5xl font-black leading-[0.92] text-[#FFD36A] sm:text-7xl">
                One music platform. Many client lanes.
              </h1>

              <p className="mt-6 max-w-4xl text-xl font-bold leading-relaxed text-[#F7E7C8]/82">
                G Putnam Music is the central hub for GPMx: music behavior
                infrastructure, creator intake, domain routing, STI, STI-Slots,
                BTIs, PIX, K-KUTs, HUGs, TUGs, and 4PE-controlled product life.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/hugs"
                  className="inline-flex items-center justify-center rounded-full bg-[#FFD36A] px-7 py-4 text-base font-black uppercase tracking-wide text-[#201106] transition hover:bg-[#FFE7A3]"
                >
                  HUGs for Ones Who Matter →
                </Link>

                <Link
                  href="/kreator-intake"
                  className="inline-flex items-center justify-center rounded-full border border-[#FFD36A]/45 px-7 py-4 text-base font-black uppercase tracking-wide text-[#FFD36A] transition hover:bg-[#FFD36A]/10"
                >
                  Creator intake
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-[#F7E7C8]/25 px-7 py-4 text-base font-black uppercase tracking-wide text-[#F7E7C8]/80 transition hover:bg-white/10"
                >
                  Partner / IP
                </Link>
              </div>

              <p className="mt-6 max-w-3xl text-sm font-bold leading-relaxed text-[#F7E7C8]/62">
                K-KUT is a live product domain. GPMx is the flagship control
                system behind source, behavior, access, review, delivery, and
                future use.
              </p>
            </div>

            <div className="relative min-h-[450px] border-t border-[#D4A017]/25 bg-black/25 lg:border-l lg:border-t-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,211,106,0.22),transparent_34%),radial-gradient(circle_at_72%_75%,rgba(212,160,23,0.16),transparent_32%)]" />

              <div className="relative z-10 flex h-full min-h-[450px] items-center justify-center p-8">
                <div className="w-full max-w-md rounded-[2rem] border border-[#FFD36A]/30 bg-[#100804]/80 p-6 shadow-2xl">
                  <p className="text-sm font-black uppercase tracking-[0.26em] text-[#FFD36A]">
                    CRM routing model
                  </p>

                  <h2 className="mt-4 text-3xl font-black leading-tight text-[#F7E7C8]">
                    Users rule by choosing their lane.
                  </h2>

                  <div className="mt-5 grid gap-2">
                    {[
                      "Buyer",
                      "Tester",
                      "Artist",
                      "Rights Holder",
                      "Business Client",
                      "Partner / Investor",
                      "Legal / IP",
                      "Supervisor / License",
                      "Fan / Supporter",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-xl border border-[#D4A017]/20 bg-black/25 px-4 py-3 text-sm font-black text-[#FFD36A]"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#D4A017]/25 p-7 sm:p-10">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FFD36A]">
              Primary doors
            </p>

            <div className="mt-6 grid gap-4 lg:grid-cols-4">
              {primaryLanes.map((path) => (
                <a
                  key={path.title}
                  href={path.href}
                  className="rounded-[1.5rem] border border-[#D4A017]/25 bg-black/20 p-5 transition hover:border-[#FFD36A]/70 hover:bg-[#FFD36A]/10"
                >
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D4A017]">
                    {path.lane}
                  </p>
                  <h2 className="mt-3 text-2xl font-black leading-tight text-[#FFD36A]">
                    {path.title}
                  </h2>
                  <p className="mt-3 text-sm font-bold leading-6 text-[#F7E7C8]/72">
                    {path.body}
                  </p>
                  <p className="mt-5 text-sm font-black uppercase tracking-wide text-[#FFD36A]">
                    {path.cta} →
                  </p>
                </a>
              ))}
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {secondaryLanes.map((path) => (
                <a
                  key={path.lane}
                  href={path.href}
                  className="rounded-2xl border border-[#D4A017]/20 bg-[#100804]/50 p-4 transition hover:border-[#FFD36A]/60 hover:bg-[#FFD36A]/10"
                >
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D4A017]">
                    {path.lane}
                  </p>
                  <p className="mt-2 text-sm font-black leading-5 text-[#F7E7C8]/86">
                    {path.title}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </div>

        <section className="mt-10 rounded-[2rem] border border-[#D4A017]/30 bg-[#201106] p-7 sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FFD36A]">
            Behavior stack
          </p>

          <h2 className="mt-4 max-w-5xl text-4xl font-black leading-tight text-[#F7E7C8] sm:text-5xl">
            GPMx organizes music by what it can do.
          </h2>

          <p className="mt-5 max-w-4xl text-base font-bold leading-8 text-[#F7E7C8]/72">
            A song is not only a track. It can become a section, a slot, a
            private message, a use case, a product, a proof object, or a
            controlled behavior inside a larger music-services platform.
          </p>

          <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {behaviorStack.map((item) => (
              <div
                key={item.key}
                className="rounded-[1.5rem] border border-[#D4A017]/25 bg-black/20 p-5"
              >
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#D4A017]">
                  {item.key}
                </p>
                <h3 className="mt-2 text-2xl font-black text-[#FFD36A]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm font-bold leading-6 text-[#F7E7C8]/72">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-[#D4A017]/30 bg-[#201106] p-7 sm:p-10">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FFD36A]">
              Live product proof
            </p>
            <h2 className="mt-4 text-4xl font-black leading-tight text-[#F7E7C8]">
              HUGs are featured proof, not the whole flagship.
            </h2>
            <p className="mt-5 text-base font-bold leading-8 text-[#F7E7C8]/72">
              The Mother’s Day K-KUT HUG path proves that GPMx can route a user
              from emotional intent to real music samples, a selected HUG,
              checkout, and private-link delivery.
            </p>
            <a
              href="https://www.k-kut.com/mom"
              className="mt-7 inline-flex items-center justify-center rounded-full bg-[#FFD36A] px-7 py-4 text-base font-black uppercase tracking-wide text-[#201106] transition hover:bg-[#FFE7A3]"
            >
              Open live HUG path
            </a>
          </div>

          <div className="rounded-[2rem] border border-[#D4A017]/30 bg-[#201106] p-7 sm:p-10">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FFD36A]">
              CRM control fields
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {crmFields.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[#D4A017]/20 bg-black/20 px-4 py-4 text-sm font-black text-[#F7E7C8]/82"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[2rem] border border-[#D4A017]/30 bg-[#201106] p-7 sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FFD36A]">
            Founder / platform message
          </p>
          <h2 className="mt-4 text-4xl font-black leading-tight text-[#F7E7C8]">
            GPMx is the operating system. Products are the outputs.
          </h2>
          <p className="mt-5 max-w-5xl text-base font-bold leading-8 text-[#F7E7C8]/72">
            K-KUT, HUG, TUG, SOM, PIX, STI, STI-Slots, BTIs, and 4PE are not
            loose ideas. They are connected parts of a music-services platform
            designed to turn human-made source music into controlled behaviors,
            private experiences, commercial products, and rights-aware future
            use.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/kreator-intake"
              className="inline-flex items-center justify-center rounded-full bg-[#FFD36A] px-7 py-4 text-base font-black uppercase tracking-wide text-[#201106] transition hover:bg-[#FFE7A3]"
            >
              Start creator intake
            </Link>
            <a
              href="https://www.k-kut.com/som"
              className="inline-flex items-center justify-center rounded-full border border-[#FFD36A]/45 px-7 py-4 text-base font-black uppercase tracking-wide text-[#FFD36A] transition hover:bg-[#FFD36A]/10"
            >
              Review K-KUT product domain
            </a>
          </div>
        </section>
      </section>
    </main>
  );
}
