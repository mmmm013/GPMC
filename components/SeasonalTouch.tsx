import calendar from '@/config/seasonal-calendar.json';

/**
 * A seasonal touch on every public page of gputnammusic.com and 2kleigh.com.
 *
 * GD, 2026-11-28: "let's add a little Christmassy stuff to every platform, right? And we do that
 * seasonally, and we do that for holidays, for general holidays."
 *
 * The calendar is config/seasonal-calendar.json. Only an entry whose status is "live" and which has a
 * look is sent to the browser; a draft shows nothing. The look itself is CSS only (app/seasonal.css),
 * keyed on <html data-season="...">. This tiny script only decides the date, in the calendar's time
 * zone, before the page paints, so a cached page still turns itself on and off on the right day.
 *
 * Preview for GD before a date: add ?season-preview=<look> to any page (or ?season-preview=off).
 * It only shows a look that has been built; it changes nothing for anyone else.
 */

type Holiday = { id: string; status: string; look: string | null; start: string | null; end: string | null };

// The looks that exist in app/seasonal.css. A preview can only ask for one of these.
export const BUILT_LOOKS = ['christmas'] as const;

const live = (calendar.holidays as Holiday[])
  .filter((h) => h.status === 'live' && h.look && h.start && h.end)
  .map((h) => ({ look: h.look, start: h.start, end: h.end }));

const script = `(function(){try{
var L=${JSON.stringify(live)},B=${JSON.stringify(BUILT_LOOKS)},r=document.documentElement;
if(/^\\/admin(\\/|$)/.test(location.pathname))return;
var q=new URLSearchParams(location.search).get('season-preview');
if(q){if(B.indexOf(q)>-1)r.setAttribute('data-season',q);return;}
var m='',d='';new Intl.DateTimeFormat('en-US',{timeZone:${JSON.stringify(calendar.time_zone)},month:'2-digit',day:'2-digit'}).formatToParts(new Date()).forEach(function(p){if(p.type==='month')m=p.value;if(p.type==='day')d=p.value;});
var t=m+'-'+d;
for(var i=0;i<L.length;i++){var s=L[i].start,e=L[i].end;if(s<=e?(t>=s&&t<=e):(t>=s||t<=e)){r.setAttribute('data-season',L[i].look);return;}}
}catch(e){}})();`;

/* ---- Christmas corners: a string of lights draped across each top corner, and a small tree in each. ----
   GD, 2026-11-28, on the first pictures: "I need to see at the top corners, put some Christmas lights
   or put a Christmas tree in there or do something." and "Pink, number one, pink and red are not my
   colors." So the bulbs are evergreen, light amber and warm white only. Drawn inline; no image files. */

type Pt = [number, number];
type Seg = { from: Pt; ctrl: Pt; to: Pt };

// A point and the wire's slope on a quadratic curve, so each bulb hangs straight down off the wire.
const at = ({ from, ctrl, to }: Seg, t: number) => {
  const u = 1 - t;
  const x = u * u * from[0] + 2 * t * u * ctrl[0] + t * t * to[0];
  const y = u * u * from[1] + 2 * t * u * ctrl[1] + t * t * to[1];
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
};

const BULBS = ['gpm-bulb-amber', 'gpm-bulb-white', 'gpm-bulb-green'] as const;

function Strand({ segs, start = 0 }: { segs: Seg[]; start?: number }) {
  const d = segs.map((s, i) => `${i === 0 ? `M${s.from[0]},${s.from[1]} ` : ''}Q${s.ctrl[0]},${s.ctrl[1]} ${s.to[0]},${s.to[1]}`).join(' ');
  const bulbs = segs.flatMap((s) => [0.18, 0.5, 0.82].map((t) => at(s, t)));
  return (
    <>
      <path d={d} fill="none" stroke="#1f6b3d" strokeWidth="1.6" strokeLinecap="round" />
      {bulbs.map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y})`}>
          <rect x="-1.8" y="0" width="3.6" height="3" rx="0.8" fill="#4a3a22" />
          <ellipse className={BULBS[(i + start) % BULBS.length]} cx="0" cy="7.4" rx="3.3" ry="4.8" />
        </g>
      ))}
    </>
  );
}

// The small tree: three evergreen tiers, a light amber star, warm white and light amber baubles.
function Tree() {
  return (
    <g transform="translate(3 5) scale(1.05)">
      <path d="M20,4 L5,20 L12,20 L2,32 L11,32 L0,44 L40,44 L29,32 L38,32 L28,20 L35,20 Z" fill="#1f6b3d" />
      <path d="M20,4 L5,20 L12,20 L2,32 L11,32 L0,44 L20,44 Z" fill="#185832" />
      <rect x="16.5" y="44" width="7" height="5" rx="1" fill="#6b4423" />
      <path className="gpm-bulb-amber" d="M20,-1.5 l1.6,3.4 3.7,0.4 -2.8,2.5 0.8,3.6 -3.3,-1.9 -3.3,1.9 0.8,-3.6 -2.8,-2.5 3.7,-0.4 Z" />
      <circle className="gpm-bulb-white" cx="16" cy="16" r="1.9" />
      <circle className="gpm-bulb-amber" cx="25" cy="23" r="1.9" />
      <circle className="gpm-bulb-white" cx="12" cy="30" r="1.9" />
      <circle className="gpm-bulb-amber" cx="28" cy="36" r="1.9" />
      <circle className="gpm-bulb-white" cx="19" cy="39" r="1.9" />
    </g>
  );
}

const LEFT: Seg[] = [
  { from: [46, 3], ctrl: [76, 30], to: [108, 9] },
  { from: [108, 9], ctrl: [142, 32], to: [176, 4] },
];

export default function SeasonalTouch() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: script }} />
      {/* A band of its own at the very top of the page: it reserves the corners, so the lights and the
          tree never sit on the header, the nav or a button. Hidden unless a look is on. */}
      <div className="gpm-season-garland" aria-hidden="true">
        <svg className="gpm-season-corner gpm-season-corner-left" viewBox="0 0 180 58" width="180" height="58" focusable="false">
          <Tree />
          <Strand segs={LEFT} />
        </svg>
        <svg className="gpm-season-corner gpm-season-corner-right" viewBox="0 0 180 58" width="180" height="58" focusable="false">
          {/* the same tree and drape, hung from the right-hand corner (the whole drawing is mirrored) */}
          <Tree />
          <Strand segs={LEFT} start={1} />
        </svg>
      </div>
    </>
  );
}
