import { NextRequest, NextResponse } from 'next/server';

// k-kut.com/api/checkout/sovereign no longer exists (404). GD, 2026-10-11: fix the
// buy button -- it goes to the working store.
const DEFAULT_TARGET = 'https://www.k-kut.com/motivation';

function appendUtmParams(target: URL, source: URLSearchParams) {
  const keys = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'ref',
  ];

  for (const key of keys) {
    const value = source.get(key);
    if (value) target.searchParams.set(key, value);
  }
}

export async function GET(request: NextRequest) {
  const sourceParams = request.nextUrl.searchParams;
  const safeTarget = new URL(DEFAULT_TARGET);

  appendUtmParams(safeTarget, sourceParams);

  const event = {
    at: new Date().toISOString(),
    target: safeTarget.toString(),
    utm_source: sourceParams.get('utm_source') || null,
    utm_medium: sourceParams.get('utm_medium') || null,
    utm_campaign: sourceParams.get('utm_campaign') || null,
    utm_content: sourceParams.get('utm_content') || null,
    utm_term: sourceParams.get('utm_term') || null,
    ref: sourceParams.get('ref') || null,
    ip:
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      null,
    referer: request.headers.get('referer') || null,
    user_agent: request.headers.get('user-agent') || null,
  };

  console.info('[checkout-attribution]', JSON.stringify(event));

  return NextResponse.redirect(safeTarget, { status: 307 });
}
