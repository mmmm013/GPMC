// GPM Heart-Tap Gift Protocol - Shared Types & Helpers

export type GiftTier = 'tap' | 'double_tap' | 'long_press' | 'hold_heart';

export interface TierConfig {
  tier: GiftTier;
  displayName: string;
  amountCents: number;
  label: string;
  emoji: string;
  grandPrizeEntries: number;
  description: string;
  color: string;
}

/* SHOWN AGAIN. GD, 2026-11-28 hid the ringtone tiers ("yes, hide the ringtones"), then the same day
   chose to bring all four back, ringtones included, so the KEZ "give" path for the Scherer family
   works through Christmas. Ringtones get discussed later. While true, the footer's /gift links show.
   docs/governance/GIFT-RINGTONE-TIERS-HIDDEN-2026-11-28.md */
export const HEART_TAP_SHOWN = true;

export const GIFT_TIERS: TierConfig[] = [
  {
    tier: 'tap',
    displayName: 'Quick Tap',
    amountCents: 199,
    label: '$1.99',
    emoji: '\u2764\uFE0F',
    grandPrizeEntries: 0,
    description: '1 digital sticker or ringtone',
    color: 'from-red-400 to-red-600',
  },
  {
    tier: 'double_tap',
    displayName: 'Double Tap',
    amountCents: 499,
    label: '$4.99',
    emoji: '\uD83E\uDDE1',
    grandPrizeEntries: 1,
    description: '2 items + 1 grand prize entry',
    color: 'from-orange-400 to-orange-600',
  },
  {
    tier: 'long_press',
    displayName: 'Long Press',
    amountCents: 999,
    label: '$9.99',
    emoji: '\uD83D\uDC9C',
    grandPrizeEntries: 3,
    description: '3 items + unreleased clip + 3 entries',
    color: 'from-purple-400 to-purple-600',
  },
  {
    tier: 'hold_heart',
    displayName: 'Hold My Heart',
    amountCents: 2499,
    label: '$24.99',
    emoji: '\uD83D\uDC96',
    grandPrizeEntries: 10,
    description: '5 items + studio pass + merch code + 10 entries',
    color: 'from-pink-400 to-pink-600',
  },
];

export function getTierByKey(key: GiftTier): TierConfig | undefined {
  return GIFT_TIERS.find((t) => t.tier === key);
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function getGrandPrizeLabel(entries: number): string {
  if (entries === 0) return '';
  if (entries === 1) return '1 grand prize entry';
  return `${entries} grand prize entries`;
}

// Hardware link for the K-503 / M-kut integrations
export const HARDWARE_LINK = 'https://www.gputnammusic.com/hardware';

// Asset types available in the Digital Mixed Bag
export const ASSET_TYPES = [
  'sticker',
  'ringtone',
  'wallpaper',
  'voice_note',
  'mini_mix',
  'unreleased_clip',
  'merch_code',
  'studio_pass',
] as const;

export type AssetType = (typeof ASSET_TYPES)[number];

// Items per tier
export const ITEMS_PER_TIER: Record<GiftTier, number> = {
  tap: 1,
  double_tap: 2,
  long_press: 3,
  hold_heart: 5,
};

// Checkout helper
export async function initiateCheckout(params: {
  tier: GiftTier;
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  message?: string;
  isAnonymous?: boolean;
}): Promise<{ sessionId: string; url: string }> {
  const res = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Checkout failed');
  }

  return res.json();
}
