/**
 * GPMC Proxy (Next.js 16+ replaces middleware.ts with proxy.ts)
 *
 * Merged from middleware.ts + proxy.ts. Layers (in order):
 *  1. Social subdomain redirects
 *  2. 2kleigh.com domain routing → /kleigh
 *  3. OFAC sanctions country blocking
 *  4. Bad-bot / scraper UA blocking — hard deny (403)
 *  5. Good-bot tagging — allow but stamp X-Bot-Class header
 *  6. Security headers — HSTS, CSP, X-Frame-Options, etc.
 *  7. Intrusion signal logging — structured JSON for Vercel Log Drains / SIEM
 *
 * Standards: OWASP Top-10, NIST SP 800-53 AU-2/SI-3, CIS Benchmark bot controls.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// SOCIAL MEDIA SUBDOMAIN REDIRECTS
// ---------------------------------------------------------------------------
// Maps subdomains to external social media profiles
// VERIFIED profiles marked with ✓, NEED INFO marked with ?
const SOCIAL_REDIRECTS: Record<string, string> = {
  // ✓ VERIFIED - Instagram @gregputnammusic
  'ig': 'https://instagram.com/gregputnammusic',

  // ✓ VERIFIED - Facebook page
  'fb': 'https://www.facebook.com/p/G-Putnam-Music-LLC-100083396467797/',

  // ? NEED INFO - X/Twitter profile URL needed
  // 'x': 'https://x.com/NEED_PROFILE',
  // 'twitter': 'https://x.com/NEED_PROFILE',

  // ✓ VERIFIED - YouTube channel
  'yt': 'https://www.youtube.com/@Musicmakers-Normal',
  'youtube': 'https://www.youtube.com/@Musicmakers-Normal',

  // ? NEED INFO - TikTok profile URL needed
  // 'tiktok': 'https://tiktok.com/@NEED_PROFILE',
  // 'tt': 'https://tiktok.com/@NEED_PROFILE',

  // ✓ VERIFIED - LinkedIn company page
  'linkedin': 'https://www.linkedin.com/company/g-putnam-music-llc',
  'li': 'https://www.linkedin.com/company/g-putnam-music-llc',

  // ✓ VERIFIED - Spotify artist
  'spotify': 'https://open.spotify.com/artist/7KSeVeJFgVn116BUHlvlX4',

  // ✓ VERIFIED - Apple Music artist
  'apple': 'https://music.apple.com/us/artist/g-putnam-music/1577755253',

  // ? NEED INFO - SoundCloud profile URL needed
  // 'soundcloud': 'https://soundcloud.com/NEED_PROFILE',
  // 'sc': 'https://soundcloud.com/NEED_PROFILE',
};

// ---------------------------------------------------------------------------
// OFAC COMPLIANCE: SANCTIONED COUNTRIES (ISO 3166-1 Alpha-2 Codes)
// ---------------------------------------------------------------------------
// As of January 2026, these regions are subject to US trade restrictions
const BLOCKED_COUNTRIES = [
  'RU', // Russia
  'IR', // Iran
  'KP', // North Korea
  'CU', // Cuba
  'SY', // Syria
];

// ---------------------------------------------------------------------------
// BOT CLASSIFICATION LISTS
// ---------------------------------------------------------------------------

/**
 * Malicious / aggressive bots — BLOCK (403).
 * Source: OWASP Bad Bot list + observed patterns.
 */
const BLOCKED_BOT_PATTERNS: RegExp[] = [
  /ahrefsbot/i,
  /semrushbot/i,
  /dotbot/i,
  /blexbot/i,
  /mj12bot/i,
  /petalbot/i,
  /serpstatbot/i,
  /zgrab/i,
  /masscan/i,
  /sqlmap/i,
  /nikto/i,
  /nmap/i,
  /nessus/i,
  /openvas/i,
  /python-requests\/[0-9]/i,
  /go-http-client\/[0-9]/i,
  /curl\/[0-9]/i,
  /wget\//i,
  /libwww-perl/i,
  /scrapy/i,
  /phantomjs/i,
  /headlesschrome/i,
  /headless/i,
  /dataforseo/i,
  /bytespider/i,
  /ccbot/i,
  /gptbot/i,           // OpenAI training crawler — not authorized on this platform
  /google-extended/i,  // Google Bard/Gemini training crawler
  /claudebot/i,        // Anthropic training crawler
  /cohere-training/i,
  /meta-externalagent/i,
  // SNPR's list from k-kut.com (GD, 2026-10-10 "BLOCK BOTs"; 2026-10-22 "can we
  // stop all BOTs? take such steps on everchanging basis"): the same doors, all sites.
  /chatgpt-user|oai-searchbot|claude-web|claude-user|claude-searchbot|anthropic-ai/i,
  /perplexitybot|perplexity-user|amazonbot|applebot-extended|meta-externalfetcher|facebookbot/i,
  /cohere-ai|diffbot|youbot|imagesiftbot|omgili|timpibot|kangaroo bot|pangubot|ai2bot/i,
  /deepseekbot|mistralai-user|googleother|img2dataset/i,
  /megaindex|seekportbot|barkrowler|zoominfobot|mail\.ru_bot|sogou/i,
  /puppeteer|playwright|selenium|webdriver/i,
  /python-urllib|aiohttp|httpx|okhttp|java\/|apache-httpclient|httrack|node-fetch|axios\/|undici|^node$/i,
  // facebookexternalhit is NOT here: it draws the preview when a listener shares a
  // link, and sharing is the product (SNPR's own rule on k-kut.com).
];

/** Legitimate search / indexing bots — ALLOW, TAG as 'indexed-search'. */
const INDEXED_SEARCH_BOT_PATTERNS: RegExp[] = [
  /googlebot/i,
  /bingbot/i,
  /applebot/i,
  /duckduckbot/i,
  /yandexbot/i,
  /slurp/i,
  /baiduspider/i,
];

/** GPM-internal bots — ALLOW, TAG as 'gpmc-internal'. */
const INTERNAL_BOT_PATTERNS: RegExp[] = [
  /mc-bot/i,
  /lf-bot/i,
  /gd-bot/i,
  /pixie-bot/i,
  /gpmc-bot/i,
  /4pe-engine/i,
];

// ---------------------------------------------------------------------------
// SECURITY HEADERS (OWASP / CIS hardened set)
// ---------------------------------------------------------------------------

function securityHeaders(): Record<string, string> {
  return {
    'X-Frame-Options': 'SAMEORIGIN',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(self)',
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    'Cross-Origin-Resource-Policy': 'same-site',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://vercel.live",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in https://www.2kleigh.com https://2kleigh.com", // video posters on /videos come from 2kleigh.com (GD, 2026-10-28)
      "media-src 'self' blob: https://*.supabase.co https://*.supabase.in https://www.k-kut.com https://k-kut.com https://www.2kleigh.com https://2kleigh.com", // songs on /listen stream from k-kut.com (GD, 2026-10-11); Michael Clay's videos on /videos play from 2kleigh.com (GD, 2026-10-28)
      "connect-src 'self' https://www.k-kut.com https://*.supabase.co https://*.supabase.in https://api.stripe.com https://api.twilio.com", // the visit counter at k-kut.com/api/visit (GD, 2026-10-12)
      "frame-src https://js.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://checkout.stripe.com", // a Download tap posts here, then goes on to Stripe's checkout (2026-10-21)
    ].join('; '),
  };
}

// ---------------------------------------------------------------------------
// INTRUSION SIGNAL LOGGING
// ---------------------------------------------------------------------------

type BotClass = 'blocked' | 'indexed-search' | 'gpmc-internal' | 'unknown';

interface IntrusionLog {
  ts: string;
  event: 'bot_blocked' | 'bot_tagged' | 'request_ok';
  bot_class: BotClass;
  ua: string;
  ip: string;
  method: string;
  path: string;
  country: string;
}

function emitSecurityLog(entry: IntrusionLog): void {
  console.log(JSON.stringify({ source: 'gpmc-security', ...entry }));
}

function classifyBot(ua: string): { blocked: boolean; botClass: BotClass } {
  if (!ua) return { blocked: false, botClass: 'unknown' };
  for (const pattern of BLOCKED_BOT_PATTERNS) {
    if (pattern.test(ua)) return { blocked: true, botClass: 'blocked' };
  }
  for (const pattern of INTERNAL_BOT_PATTERNS) {
    if (pattern.test(ua)) return { blocked: false, botClass: 'gpmc-internal' };
  }
  for (const pattern of INDEXED_SEARCH_BOT_PATTERNS) {
    if (pattern.test(ua)) return { blocked: false, botClass: 'indexed-search' };
  }
  return { blocked: false, botClass: 'unknown' };
}

function hasValidHealthcheckBypass(req: NextRequest): boolean {
  const configured = process.env.PROXY_HEALTHCHECK_TOKEN;
  if (!configured) return false;
  const provided = req.headers.get('x-gpm-healthcheck-token');
  return Boolean(provided && provided === configured);
}

// ---------------------------------------------------------------------------
// PROXY ENTRY POINT
// ---------------------------------------------------------------------------

export function proxy(req: NextRequest) {
  // 1. Social subdomain redirects
  const hostname = req.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];
  if (SOCIAL_REDIRECTS[subdomain]) {
    return NextResponse.redirect(SOCIAL_REDIRECTS[subdomain], 308);
  }

  // 2. 2kleigh.com → /kleigh
  if (hostname.includes('2kleigh.com') && req.nextUrl.pathname === '/') {
    const url = req.nextUrl.clone();
    url.pathname = '/kleigh';
    return NextResponse.rewrite(url);
  }

  // 3. OFAC sanctions check
  const geo = (req as any).geo;
  const country = geo?.country || req.headers.get('x-vercel-ip-country') || 'US';
  if (BLOCKED_COUNTRIES.includes(country)) {
    const url = req.nextUrl.clone();
    url.pathname = '/blocked';
    return NextResponse.rewrite(url);
  }

  // 4–6. Bot classification + security headers
  const ua = req.headers.get('user-agent') ?? '';
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';
  const path = req.nextUrl.pathname;
  const method = req.method;

  const { blocked, botClass } = classifyBot(ua);

  const baseLog: Omit<IntrusionLog, 'event'> = {
    ts: new Date().toISOString(),
    bot_class: botClass,
    ua: ua.slice(0, 200),
    ip,
    method,
    path,
    country,
  };

  if (blocked && !hasValidHealthcheckBypass(req)) {
    emitSecurityLog({ ...baseLog, event: 'bot_blocked' });
    return new NextResponse(
      JSON.stringify({ error: 'Access denied' }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          ...securityHeaders(),
          'X-Bot-Class': 'blocked',
        },
      }
    );
  }

  const response = NextResponse.next();
  if (blocked) {
    response.headers.set('X-Bot-Class', 'blocked-bypass');
  }
  for (const [key, value] of Object.entries(securityHeaders())) {
    response.headers.set(key, value);
  }
  if (botClass !== 'unknown') {
    response.headers.set('X-Bot-Class', botClass);
    emitSecurityLog({ ...baseLog, event: 'bot_tagged' });
  }

  return response;
}

// Run on all paths except Next.js internals and static assets
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|eot)).*)',
  ],
};
