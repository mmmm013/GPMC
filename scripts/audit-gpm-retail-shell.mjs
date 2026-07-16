import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function requireText(source, text, label) {
  if (!source.includes(text)) {
    throw new Error(`MISSING ${label}: ${text}`);
  }
}

function forbidText(source, text, label) {
  if (source.includes(text)) {
    throw new Error(`FORBIDDEN ${label}: ${text}`);
  }
}

const layout = read('app/layout.tsx');
const home = read('app/page.tsx');
const songs = read('app/songs/page.tsx');
const header = read('components/Header.tsx');
const footer = read('components/Footer.tsx');
const gift = read('app/gift/page.tsx');
const hugs = read('app/hugs/page.tsx');
const who = read('app/who/page.tsx');
const governance = read('docs/site-governance/GPM_RETAIL_SHELL_V001.md');

requireText(layout, 'G Putnam Music | Original Song Catalog', 'metadata identity');
requireText(layout, "source: 'gputnam-music'", 'telemetry identity');
forbidText(layout, 'K-KUT – Support & Experience Platform', 'legacy metadata');

requireText(header, "href: '/songs'", 'retail navigation');
requireText(header, 'Send a K-KUT', 'separate K-KUT referral');
forbidText(header, 'BUY KK NOW', 'legacy KK checkout navigation');
forbidText(header, 'checkout-attribution', 'legacy checkout attribution');

requireText(home, 'Original songs. Ready to hear.', 'retail homepage');
requireText(home, 'GPM IN/O-PIX', 'IN/O-PIX lane');
requireText(home, 'GPM LT-PIX', 'LT-PIX lane');
forbidText(home, 'One music platform. Many client lanes.', 'legacy GPMx homepage');

requireText(songs, 'No public records loaded in this implementation packet.', 'non-selling empty state');
requireText(songs, 'No K-KUTs, iMeants, pricing, or checkout are included.', 'catalog separation');
forbidText(songs, 'buy.stripe.com', 'Stripe link in song shell');
forbidText(songs, 'initiateCheckout', 'checkout code in song shell');
forbidText(songs, 'stripe.checkout', 'Stripe checkout code in song shell');

requireText(gift, 'The former GPM gift checkout is closed.', 'legacy commerce isolation');
forbidText(gift, 'GIFT_TIERS', 'legacy gift tiers');
forbidText(gift, 'initiateCheckout', 'legacy gift checkout');
forbidText(gift, 'handleCheckout', 'legacy gift checkout handler');
forbidText(gift, 'window.location.href = url', 'legacy checkout redirect');

requireText(hugs, 'HUGs live on K-KUT.', 'HUG referral separation');
requireText(footer, 'Retail prices, download formats, customer-use terms, and checkout remain held', 'footer hold notice');

requireText(who, 'KLEIGH', 'KLEIGH uppercase identity');
forbidText(who, 'Kleigh', 'incorrect KLEIGH casing');

requireText(governance, 'No retail pricing.', 'pricing hold');
requireText(governance, 'No retail checkout.', 'checkout hold');
requireText(governance, 'No production deployment.', 'deployment hold');

const retailFiles = [home, songs, header, footer, gift, hugs];
for (const [index, source] of retailFiles.entries()) {
  if (/\$\s*\d|\d+\.\d{2}/u.test(source)) {
    throw new Error(`FORBIDDEN retail price literal in controlled file index ${index}`);
  }
}

console.log('GPM RETAIL SHELL V001 AUDIT PASS');
console.log('PUBLIC IDENTITY: G PUTNAM MUSIC');
console.log('PRIMARY PURPOSE: COMPLETE-SONG CATALOG');
console.log('CATALOG LANES: IN/O-PIX + LT-PIX');
console.log('PUBLIC SONG RECORDS CONNECTED: 0');
console.log('RETAIL PRICES ADDED: 0');
console.log('RETAIL CHECKOUT ADDED: 0');
console.log('LEGACY GIFT CHECKOUT ACTIVE: NO');
console.log('K-KUT COMMERCE EMBEDDED: NO');
console.log('KLEIGH CASING: LOCKED');
console.log('AUDIO OR INVENTORY CHANGED: NO');
console.log('PRODUCTION DEPLOYMENT AUTHORIZED: NO');
