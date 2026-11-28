"use client";

/* Copied unchanged from k-kut.com (components/BraveAndBravo.tsx), so the flagship flies the same
   BRAVE and BRAVO. Change it there and copy it here; do not let the two drift. */

/**
 * BRAVE AND BRAVO, the two Heroes eagles.
 *
 * GD, 2026-10-21: "Eagle 2 must be created, animated & cool as hell, but
 * update Eagle 1 to be BEST! Eagle 1=BRAVE; EAGLE 2=BRAVO."
 *
 * BRAVE is the bald eagle that already flew on gputnammusic.com ("Brave on
 * patrol"), redrawn here in full. BRAVO is his new companion: a golden eagle
 * with a white star on the chest and a red, white and blue tail. Both are pure
 * SVG and CSS, so there is no image to load and nothing to download.
 *
 * Motion respects prefers-reduced-motion: the eagles then hold still.
 */

type Bird = "BRAVE" | "BRAVO";

const LOOK: Record<Bird, { body: string; wing: string; wingLight: string; head: string; tail: string[]; star: boolean }> = {
  BRAVE: {
    body: "#3a2415",
    wing: "#2b1a0f",
    wingLight: "#5a3a22",
    head: "#f8f4ea",
    tail: ["#f8f4ea", "#f8f4ea", "#f8f4ea"],
    star: false,
  },
  BRAVO: {
    body: "#7a4a1e",
    wing: "#5e3814",
    wingLight: "#b0742f",
    head: "#d69a3c",
    tail: ["#c62f3a", "#f8f4ea", "#2f5fb3"],
    star: true,
  },
};

/* One wing, drawn on the left. The right wing is the same path mirrored. */
const WING =
  "M90,52 C72,34 44,22 6,24 L18,31 L3,35 L19,40 L6,46 L23,48 L12,55 L31,55 C50,60 72,63 90,63 Z";
const WING_LIGHT = "M88,55 C70,42 48,33 22,32 C46,40 66,50 86,60 Z";

export function EagleSvg({
  bird,
  flap = "normal",
  className = "",
}: {
  bird: Bird;
  /** normal = flying; slow = hovering in place; still = no motion. */
  flap?: "normal" | "slow" | "still";
  className?: string;
}) {
  const c = LOOK[bird];
  const wingClass = flap === "still" ? "" : flap === "slow" ? "eagle-wing eagle-wing-slow" : "eagle-wing";
  return (
    <svg viewBox="0 0 200 130" className={className} role="img" aria-label={bird === "BRAVE" ? "BRAVE the eagle" : "BRAVO the eagle"}>
      {/* tail fan */}
      <path d="M88,86 L80,118 L94,112 L100,122 L106,112 L120,118 L112,86 Z" fill={c.tail[1]} />
      <path d="M88,86 L80,118 L94,112 L96,90 Z" fill={c.tail[0]} />
      <path d="M112,86 L120,118 L106,112 L104,90 Z" fill={c.tail[2]} />
      {/* wings */}
      <g className={wingClass} style={{ transformOrigin: "90px 57px", transformBox: "view-box" }}>
        <path d={WING} fill={c.wing} />
        <path d={WING_LIGHT} fill={c.wingLight} opacity="0.8" />
      </g>
      <g transform="translate(200,0) scale(-1,1)">
        <g className={wingClass} style={{ transformOrigin: "90px 57px", transformBox: "view-box" }}>
          <path d={WING} fill={c.wing} />
          <path d={WING_LIGHT} fill={c.wingLight} opacity="0.8" />
        </g>
      </g>
      {/* body */}
      <ellipse cx="100" cy="66" rx="17" ry="26" fill={c.body} />
      {c.star ? (
        <path
          d="M100,58 L102.9,64 L109.5,64.6 L104.5,69 L106,75.5 L100,72 L94,75.5 L95.5,69 L90.5,64.6 L97.1,64 Z"
          fill="#f8f4ea"
        />
      ) : null}
      {/* talons */}
      <path d="M93,90 l-3,6 M93,90 l0,7 M93,90 l3,6 M107,90 l-3,6 M107,90 l0,7 M107,90 l3,6" stroke="#e8b33c" strokeWidth="2.2" strokeLinecap="round" />
      {/* head */}
      <circle cx="100" cy="36" r="13" fill={c.head} />
      {bird === "BRAVO" ? <path d="M88,40 C92,48 108,48 112,40 C108,44 92,44 88,40 Z" fill="#b0742f" /> : null}
      {/* beak */}
      <path d="M104,38 C112,37 117,41 115,47 C113,44 109,43 104,44 Z" fill="#f2b632" />
      {/* eye, with a glint */}
      <circle cx="104" cy="33" r="2.6" fill="#1a1208" />
      <circle cx="104.9" cy="32.2" r="0.9" fill="#ffffff" />
      <path d="M100,30 L109,31" stroke={bird === "BRAVE" ? "#cfc7b4" : "#8a5a20"} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/**
 * The eagles flying across a strip, BRAVO on BRAVE's wing. `only="BRAVO"` flies BRAVO alone.
 * GD, 2026-11-09, on the Veterans Day banner: "I want the second one that has animation to be the
 * only one used."
 */
export function EaglesFlyBy({ height = 56, only }: { height?: number; only?: "BRAVO" }) {
  return (
    <div className="eagles-sky pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {only === "BRAVO" ? null : (
        <div className="eagle-path" style={{ top: 2, width: Math.round(height * 0.95 * 1.55) }}>
          <div className="eagle-bob">
            <EagleSvg bird="BRAVE" className="block" />
          </div>
        </div>
      )}
      <div className="eagle-path eagle-path-bravo" style={{ top: height * 0.35, width: Math.round(height * 0.95 * 1.3) }}>
        <div className="eagle-bob eagle-bob-bravo">
          <div className="eagle-roll">
            <EagleSvg bird="BRAVO" className="block" />
          </div>
        </div>
      </div>
      <EagleStyles />
    </div>
  );
}

/** Red, white and blue bunting: a row of pennants. */
export function Bunting() {
  const colors = ["#c62f3a", "#f8f4ea", "#2f5fb3"];
  return (
    <svg viewBox="0 0 300 26" preserveAspectRatio="none" className="block h-6 w-full" aria-hidden="true">
      <path d="M0,2 Q150,10 300,2" stroke="#cfd8e3" strokeWidth="1.5" fill="none" />
      {Array.from({ length: 15 }, (_, i) => {
        const x = i * 20 + 1;
        const sag = 2 + 8 * Math.sin((Math.PI * (x + 9)) / 300);
        return <path key={i} d={`M${x},${sag} L${x + 18},${sag} L${x + 9},${sag + 16} Z`} fill={colors[i % 3]} className="bunting-flag" style={{ animationDelay: `${(i % 5) * 0.2}s` }} />;
      })}
    </svg>
  );
}

const STAR = "M0,-6 L1.8,-1.9 L6,-1.9 L2.6,0.8 L3.7,5 L0,2.5 L-3.7,5 L-2.6,0.8 L-6,-1.9 L-1.8,-1.9 Z";

/** One arrival: a red-white-blue burst and a cloud of dust where an eagle lands. */
function Arrival({ delay }: { delay: number }) {
  const sparks = Array.from({ length: 12 }, (_, i) => i);
  const colors = ["#c62f3a", "#f8f4ea", "#2f5fb3"];
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 h-0" aria-hidden="true">
      <div className="absolute left-1/2 top-0">
        {sparks.map((i) => (
          <span
            key={i}
            className="arrival-spark"
            style={{
              background: colors[i % 3],
              animationDelay: `${delay}s`,
              ["--dx" as string]: `${Math.cos((i / 12) * 2 * Math.PI) * 70}px`,
              ["--dy" as string]: `${Math.sin((i / 12) * 2 * Math.PI) * 50 - 20}px`,
            }}
          />
        ))}
        {[-34, -12, 10, 32].map((dx, i) => (
          <span key={dx} className="arrival-dust" style={{ animationDelay: `${delay + 0.05 * i}s`, ["--dx" as string]: `${dx}px` }} />
        ))}
      </div>
    </div>
  );
}

/**
 * The two eagles land side by side: they swoop in, a red-white-blue burst and
 * a cloud of dust on arrival, then they hover under the stars. Every so often
 * BRAVO strikes -- a dive, talons first -- and climbs back to BRAVE's side.
 */
export function EaglesHover() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0a1e35] to-[#12263f] px-4 pb-6 pt-2">
      <Bunting />
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        {[[8, 30], [22, 62], [38, 22], [55, 48], [70, 18], [84, 58], [93, 30], [14, 80], [64, 78]].map(([x, y], i) => (
          <svg key={i} x={`${x}%`} y={`${y}%`} overflow="visible">
            <path d={STAR} fill="#f8f4ea" className="sky-star" style={{ animationDelay: `${(i * 0.37) % 2}s` }} />
          </svg>
        ))}
      </svg>
      <div className="relative mt-4 flex items-end justify-center gap-6 sm:gap-12" aria-label="BRAVE and BRAVO, the Heroes eagles">
        {(["BRAVE", "BRAVO"] as const).map((bird, i) => (
          <figure key={bird} className="relative flex flex-col items-center">
            <div className={i === 0 ? "eagle-arrive" : "eagle-arrive eagle-arrive-late"}>
              <div className={i === 0 ? "eagle-hover" : "eagle-hover eagle-hover-late eagle-strike"}>
                <EagleSvg bird={bird} flap="slow" className="h-28 w-44 sm:h-36 sm:w-56" />
              </div>
            </div>
            <Arrival delay={i === 0 ? 1.1 : 1.6} />
            <figcaption className="mt-2 text-sm font-black tracking-[0.3em] text-sky-100">{bird}</figcaption>
          </figure>
        ))}
      </div>
      <EagleStyles />
    </div>
  );
}

/* Shared by every eagle on the page, so it carries no per-instance sizes. */
function EagleStyles() {
  return (
    <style>{`
      .eagle-wing { animation: eagle-flap 0.9s ease-in-out infinite alternate; }
      .eagle-wing-slow { animation-duration: 1.6s; }
      @keyframes eagle-flap { from { transform: rotate(-24deg); } to { transform: rotate(16deg); } }

      .eagle-path { position: absolute; left: 0; animation: eagle-cross 16s linear infinite; }
      .eagle-path-bravo { animation-delay: 0.9s; }
      @keyframes eagle-cross {
        0% { transform: translateX(-30vw); opacity: 0; }
        4% { opacity: 1; }
        58% { transform: translateX(110vw); opacity: 1; }
        62%, 100% { transform: translateX(120vw); opacity: 0; }
      }
      .eagle-bob { animation: eagle-bob 2.4s ease-in-out infinite; }
      .eagle-bob-bravo { animation-duration: 2.1s; animation-delay: 0.4s; }
      @keyframes eagle-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
      .eagle-roll { animation: eagle-roll 16s ease-in-out infinite; animation-delay: 0.9s; }
      @keyframes eagle-roll {
        0%, 26% { transform: rotate(0deg) scaleY(1); }
        31% { transform: rotate(-12deg) scaleY(-1); }
        36%, 100% { transform: rotate(0deg) scaleY(1); }
      }

      .eagle-hover { animation: eagle-bob 3s ease-in-out infinite; filter: drop-shadow(0 10px 18px rgba(0,0,0,0.45)); }
      .eagle-hover-late { animation-delay: 1.1s; }
      .eagle-strike { animation: eagle-bob 3s ease-in-out infinite, eagle-strike 9s ease-in 3s infinite; }
      @keyframes eagle-strike {
        0%, 84%, 100% { translate: 0 0; rotate: 0deg; }
        88% { translate: 26px -30px; rotate: -18deg; }
        92% { translate: -10px 34px; rotate: 22deg; }
        96% { translate: 0 0; rotate: 0deg; }
      }

      .eagle-arrive { animation: eagle-arrive 1.1s cubic-bezier(.2,.8,.3,1.1) both; }
      .eagle-arrive-late { animation-delay: 0.5s; }
      @keyframes eagle-arrive {
        from { transform: translate(-40vw, -220px) rotate(-25deg) scale(0.6); opacity: 0; }
        70% { opacity: 1; }
        to { transform: none; opacity: 1; }
      }
      .arrival-spark { position: absolute; left: -3px; top: -3px; width: 6px; height: 6px; border-radius: 9999px; opacity: 0;
        animation: arrival-spark 0.9s ease-out both; }
      @keyframes arrival-spark {
        0% { transform: translate(0,0) scale(1.4); opacity: 1; }
        100% { transform: translate(var(--dx), var(--dy)) scale(0.2); opacity: 0; }
      }
      .arrival-dust { position: absolute; left: -18px; top: -14px; width: 36px; height: 28px; border-radius: 9999px; opacity: 0;
        background: radial-gradient(circle, rgba(214,190,150,0.75), rgba(214,190,150,0)); animation: arrival-dust 1.6s ease-out both; }
      @keyframes arrival-dust {
        0% { transform: translateX(0) scale(0.3); opacity: 0.9; }
        100% { transform: translateX(var(--dx)) translateY(-14px) scale(2.4); opacity: 0; }
      }
      .sky-star { animation: sky-twinkle 2.2s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: center; }
      @keyframes sky-twinkle { from { opacity: 0.25; transform: scale(0.7); } to { opacity: 0.95; transform: scale(1.1); } }
      .bunting-flag { animation: bunting-wave 2.4s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: top center; }
      @keyframes bunting-wave { from { transform: skewX(-6deg); } to { transform: skewX(6deg); } }

      @media (prefers-reduced-motion: reduce) {
        .eagle-wing, .eagle-path, .eagle-bob, .eagle-roll, .eagle-hover, .eagle-arrive, .sky-star, .bunting-flag { animation: none !important; }
        .arrival-spark, .arrival-dust { display: none; }
        .eagle-path { transform: translateX(8vw); }
        .eagle-path-bravo { transform: translateX(22vw); }
      }
    `}</style>
  );
}
