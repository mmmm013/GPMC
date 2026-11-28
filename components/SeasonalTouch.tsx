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

export default function SeasonalTouch() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: script }} />
      <div className="gpm-season-garland" aria-hidden="true" />
    </>
  );
}
