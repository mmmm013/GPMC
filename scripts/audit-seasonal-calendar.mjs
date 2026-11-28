#!/usr/bin/env node
/**
 * Guard: the seasonal calendar (config/seasonal-calendar.json).
 *
 * GD, 2026-11-28: "let's add a little Christmassy stuff to every platform, right? And we do that
 * seasonally, and we do that for holidays, for general holidays." Each look is built and shown to GD
 * before its date. So:
 *   - a "draft" holiday carries no look, and shows nothing;
 *   - a "live" holiday has a look that really exists in app/seasonal.css and in BUILT_LOOKS,
 *     and a start and end in MM-DD form;
 *   - Christmas turns itself off after Dec 26;
 *   - the general holidays are all on the calendar;
 *   - the dates are read in America/Chicago;
 *   - no red and no pink in any look. GD, 2026-11-28: "Pink, number one, pink and red are not my colors."
 * A guard that silently checks nothing is worse than no guard (LLBP-004): it fails if it finds no holidays.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cal = JSON.parse(readFileSync(path.join(root, 'config/seasonal-calendar.json'), 'utf8'));
const css = readFileSync(path.join(root, 'app/seasonal.css'), 'utf8');
const tsx = readFileSync(path.join(root, 'components/SeasonalTouch.tsx'), 'utf8');
const layout = readFileSync(path.join(root, 'app/layout.tsx'), 'utf8');

const fail = [];
const MMDD = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const built = (tsx.match(/BUILT_LOOKS = \[([^\]]*)\]/)?.[1] ?? '').match(/'[^']+'/g)?.map((s) => s.slice(1, -1)) ?? [];

if (cal.time_zone !== 'America/Chicago') fail.push(`time_zone is ${cal.time_zone}, not America/Chicago`);
const list = Array.isArray(cal.holidays) ? cal.holidays : [];
if (!list.length) fail.push('no holidays found: this guard would check nothing');

for (const h of list) {
  if (!['live', 'draft'].includes(h.status)) fail.push(`${h.id}: status "${h.status}" is neither live nor draft`);
  if (h.status === 'draft' && h.look) fail.push(`${h.id}: a draft carries a look ("${h.look}") before GD has seen it`);
  if (h.status === 'live') {
    if (!h.look) fail.push(`${h.id}: live with no look`);
    else {
      if (!built.includes(h.look)) fail.push(`${h.id}: look "${h.look}" is not in BUILT_LOOKS`);
      if (!css.includes(`html[data-season="${h.look}"]`)) fail.push(`${h.id}: look "${h.look}" has no CSS in app/seasonal.css`);
    }
    if (!MMDD.test(h.start ?? '') || !MMDD.test(h.end ?? '')) fail.push(`${h.id}: start/end must be MM-DD`);
  }
}

const xmas = list.find((h) => h.id === 'christmas');
if (!xmas) fail.push('christmas is missing');
else if (xmas.status === 'live' && xmas.end !== '12-26') fail.push(`christmas ends ${xmas.end}, not 12-26`);

const general = ['new-years', 'valentines', 'st-patricks', 'easter', 'mothers-day', 'memorial-day', 'fathers-day', 'independence-day', 'halloween', 'thanksgiving'];
for (const id of general) if (!list.some((h) => h.id === id)) fail.push(`${id} is missing from the calendar`);

if (!/<SeasonalTouch\s*\/>/.test(layout)) fail.push('app/layout.tsx does not render <SeasonalTouch />, so no page gets the look');
if (!/prefers-reduced-motion:\s*reduce/.test(css)) fail.push('app/seasonal.css does not respect prefers-reduced-motion');
if (/@keyframes[^{]*\{[^}]*opacity/.test(css)) fail.push('a seasonal animation changes opacity: nothing may flash or blink');

// No red, no pink: every color a look draws, by hue. Browns (hue ~20-45) are the sites' own and pass.
function hue(hex) {
  const h = hex.length === 4 ? hex.slice(1).split('').map((c) => c + c).join('') : hex.slice(1, 7);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (d === 0) return { h: 0, s: 0 };
  let H = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  H = (H * 60 + 360) % 360;
  const l = (max + min) / 2;
  return { h: H, s: d / (1 - Math.abs(2 * l - 1)) };
}
for (const [file, text] of [['app/seasonal.css', css], ['components/SeasonalTouch.tsx', tsx]]) {
  const code = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  for (const hex of code.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g) ?? []) {
    const { h, s } = hue(hex);
    if (s > 0.3 && (h < 15 || h > 290)) fail.push(`${file}: ${hex} is red or pink`);
  }
  for (const m of code.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g)) {
    const hex = '#' + [m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('');
    const { h, s } = hue(hex);
    if (s > 0.3 && (h < 15 || h > 290)) fail.push(`${file}: ${m[0]}) is red or pink`);
  }
  if (/\b(red|pink|crimson|hotpink|deeppink|magenta)\b\s*[;,)]/i.test(code)) fail.push(`${file}: names a red or pink color`);
}

if (fail.length) {
  console.error('[seasonal-calendar] FAIL');
  for (const f of fail) console.error('  - ' + f);
  process.exit(1);
}
const liveIds = list.filter((h) => h.status === 'live').map((h) => h.id);
console.log(`[seasonal-calendar] OK: ${list.length} holidays, live: ${liveIds.join(', ') || 'none'}, the rest draft with no look.`);
