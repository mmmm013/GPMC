import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * A K-KUT is an exact audio excerpt from an original PIX (PIX-PCK package)
 * delivered through the 4PE-BIZ-MSC pipeline.
 * ALL items in this stream are K-KUTs — never text-only mini-KUTs.
 */
export interface KutItem {
  id: number | string;
  title: string;
  artist: string;
  /** Direct audio URL for this PIX excerpt */
  url: string;
  duration?: number | string;
  tags?: string;
  /** Always 'K-KUT' — every item is an audio excerpt from an original PIX */
  type: 'K-KUT';
}

/**
 * Fetches the Top 13 K-KUT audio excerpts from the GPM-Warehouse / Supabase pipeline.
 *
 * ALL K-KUTs are exact audio excerpts of original PIX via 4PE-BIZ-MSC.
 *
 * Content priority (ADMIN DIRECTIVE):
 *  1. "Love Renews" PIX excerpts lead
 *  2. Remaining Top 13 PIX excerpts follow
 *
 * Only tracks with an actual audio URL are included (real PIX excerpts only).
 * Falls back to static seed data if the DB is unavailable or empty.
 */
export async function getFeaturedKuts(): Promise<KutItem[]> {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return FALLBACK_KUTS;
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Primary: fetch "Love Renews" PIX excerpts first (ADMIN DIRECTIVE)
    const { data: loveRenews } = await supabase
      .from('tracks')
      .select('id, title, artist, url, duration, tags')
      .or('title.ilike.%Love Renews%,tags.ilike.%love_renews%,tags.ilike.%love renews%')
      .not('url', 'is', null)
      .limit(5);

    // Secondary: remaining PIX excerpts (tracks with audio URL, most recent first)
    const loveRenewsIds = (loveRenews ?? []).map((t) => t.id);

    // Cast IDs to numbers (tracks.id is a numeric primary key); filter out any NaN values
    const safeIds = loveRenewsIds
      .map((id) => Number(id))
      .filter((id) => !Number.isNaN(id) && id > 0);

    let restQuery = supabase
      .from('tracks')
      .select('id, title, artist, url, duration, tags')
      .not('url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20);

    const filteredRestQuery =
      safeIds.length > 0
        ? (restQuery as any).not('id', 'in', `(${safeIds.join(',')})`)
        : restQuery;

    const { data: rest } = await filteredRestQuery;

    // All items are K-KUT audio excerpts from original PIX via 4PE-BIZ-MSC
    const combined: KutItem[] = [
      ...(loveRenews ?? []).map((t) => ({ ...t, type: 'K-KUT' as const })),
      ...(rest ?? []).map((t) => ({ ...t, type: 'K-KUT' as const })),
    ].slice(0, 13);

    return combined.length > 0 ? combined : FALLBACK_KUTS;
  } catch {
    return FALLBACK_KUTS;
  }
}

/**
 * Static fallback seed — used when DB is unreachable.
 * ALL items are K-KUT audio excerpts from original PIX via 4PE-BIZ-MSC.
 * "Love Renews" PIX excerpts lead per ADMIN DIRECTIVE.
 */
export const FALLBACK_KUTS: KutItem[] = [
  { id: 'lr-01', title: 'Love Renews', artist: 'KLEIGH', url: '', type: 'K-KUT', tags: 'love_renews' },
  { id: 'lr-02', title: 'Love Renews (Reprise)', artist: 'KLEIGH', url: '', type: 'K-KUT', tags: 'love_renews' },
  { id: 'lr-03', title: 'Love Renews (Hook)', artist: 'KLEIGH', url: '', type: 'K-KUT', tags: 'love_renews' },
  { id: 'kk-01', title: 'Midnight Jazz', artist: 'G Putnam Music', url: '', type: 'K-KUT', tags: 'jazz' },
  { id: 'kk-02', title: 'Wounded & Willing', artist: 'G Putnam Music', url: '', type: 'K-KUT', tags: 'healing' },
  { id: 'kk-03', title: 'High Energy', artist: 'G Putnam Music', url: '', type: 'K-KUT', tags: 'energy' },
  { id: 'kk-04', title: 'Deep Focus', artist: 'G Putnam Music', url: '', type: 'K-KUT', tags: 'focus' },
  { id: 'kk-05', title: 'Sunrise Vibes', artist: 'G Putnam Music', url: '', type: 'K-KUT', tags: 'uplifting' },
  { id: 'kk-06', title: 'Late Night Soul', artist: 'G Putnam Music', url: '', type: 'K-KUT', tags: 'night' },
  { id: 'kk-07', title: 'Heart Tap', artist: 'KLEIGH', url: '', type: 'K-KUT', tags: 'emotional' },
  { id: 'kk-08', title: 'Melancholy Blues', artist: 'G Putnam Music', url: '', type: 'K-KUT', tags: 'melancholy' },
  { id: 'kk-09', title: 'Dreamy State', artist: 'G Putnam Music', url: '', type: 'K-KUT', tags: 'dreamy' },
  { id: 'kk-10', title: 'Cloud Nine', artist: 'KLEIGH', url: '', type: 'K-KUT', tags: 'uplifting' },
];
