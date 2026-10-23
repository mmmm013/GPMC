#!/usr/bin/env node

import { performance } from 'node:perf_hooks';

const ua =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

const checks = [
  {
    label: 'Flagship Home',
    url: 'https://www.gputnammusic.com/',
    type: 'html',
    maxTtfbMs: 1800,
    maxTotalMs: 5000,
    expectStatus: 200,
  },
  {
    label: 'Flagship Join',
    url: 'https://www.gputnammusic.com/join',
    type: 'html',
    maxTtfbMs: 1800,
    maxTotalMs: 5000,
    expectStatus: 200,
  },
  {
    label: 'Flagship Gift',
    url: 'https://www.gputnammusic.com/gift',
    type: 'html',
    maxTtfbMs: 1800,
    maxTotalMs: 5000,
    expectStatus: 200,
  },
  {
    label: 'Flagship mKUT',
    url: 'https://www.gputnammusic.com/mkut',
    type: 'html',
    maxTtfbMs: 1800,
    maxTotalMs: 5000,
    expectStatus: 200,
  },
  {
    label: 'K-KUT Pricing',
    url: 'https://k-kut.com/pricing',
    type: 'html',
    maxTtfbMs: 1800,
    maxTotalMs: 5000,
    expectStatus: 200,
  },
  {
    label: 'Checkout Attribution Redirect',
    url: 'https://www.gputnammusic.com/api/checkout-attribution?utm_source=perf&utm_medium=script&utm_campaign=prod_check&utm_content=buy_kk_now',
    type: 'redirect',
    expectStatus: 307,
    locationIncludesAny: [
      'https://k-kut.com/api/checkout/sovereign',
      'https://www.k-kut.com/api/checkout/sovereign',
    ],
    maxTtfbMs: 1800,
  },
  {
    label: 'Sovereign Redirect',
    url: 'https://k-kut.com/api/checkout/sovereign',
    type: 'redirect',
    expectStatus: 307,
    locationIncludesAny: [
      'https://buy.stripe.com/',
      'https://k-kut.com/pricing?checkout=not-configured',
      'https://www.k-kut.com/api/checkout/sovereign',
    ],
    maxTtfbMs: 1800,
  },
];

async function runHtmlCheck(check) {
  const start = performance.now();
  const res = await fetch(check.url, {
    headers: { 'user-agent': ua },
    redirect: 'follow',
  });
  const headersAt = performance.now();
  const body = await res.text();
  const end = performance.now();

  return {
    status: res.status,
    ttfbMs: Math.round(headersAt - start),
    totalMs: Math.round(end - start),
    bytes: Buffer.byteLength(body),
    contentType: res.headers.get('content-type') || 'unknown',
  };
}

async function runRedirectCheck(check) {
  const start = performance.now();
  const res = await fetch(check.url, {
    headers: { 'user-agent': ua },
    redirect: 'manual',
  });
  const end = performance.now();

  return {
    status: res.status,
    ttfbMs: Math.round(end - start),
    location: res.headers.get('location') || '',
  };
}

function fail(message) {
  console.error(message);
  failures += 1;
}

let failures = 0;

for (const check of checks) {
  try {
    const result = check.type === 'redirect' ? await runRedirectCheck(check) : await runHtmlCheck(check);

    if (result.status !== check.expectStatus) {
      fail(`${check.label}: expected status ${check.expectStatus}, got ${result.status}`);
      continue;
    }

    if (result.ttfbMs > check.maxTtfbMs) {
      fail(`${check.label}: TTFB ${result.ttfbMs}ms exceeded ${check.maxTtfbMs}ms`);
    }

    if (check.type === 'html') {
      if (result.totalMs > check.maxTotalMs) {
        fail(`${check.label}: total ${result.totalMs}ms exceeded ${check.maxTotalMs}ms`);
      }

      console.log(
        `${check.label} | status=${result.status} | ttfb=${result.ttfbMs}ms | total=${result.totalMs}ms | bytes=${result.bytes} | type=${result.contentType}`
      );
      continue;
    }

    if (check.locationIncludes && !result.location.includes(check.locationIncludes)) {
      fail(`${check.label}: redirect target mismatch: ${result.location || 'missing location header'}`);
    }

    if (
      check.locationIncludesAny &&
      !check.locationIncludesAny.some((target) => result.location.includes(target))
    ) {
      fail(
        `${check.label}: redirect target mismatch: ${result.location || 'missing location header'} (expected one of: ${check.locationIncludesAny.join(', ')})`
      );
    }

    console.log(
      `${check.label} | status=${result.status} | ttfb=${result.ttfbMs}ms | location=${result.location}`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    fail(`${check.label}: request failed: ${message}`);
  }
}

if (failures > 0) {
  console.error(`\nPerformance HTTP check failed with ${failures} issue(s).`);
  process.exit(1);
}

console.log('\nPerformance HTTP check passed.');
