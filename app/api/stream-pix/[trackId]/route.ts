import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

const SIGNED_URL_TTL = 3600;
const UUID_RX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type TrackRow = {
  id?: number | string;
  track_id?: string;
  url?: string | null;
  file_path?: string | null;
  [key: string]: unknown;
};

function normalizeStoragePath(input: string): string {
  return input
    .replace(/^https?:\/\/[^/]+\/storage\/v1\/object\/(public|sign)\/[a-zA-Z0-9_-]+\//, '')
    .replace(/^\/+/, '')
    .replace(/^tracks\//, '');
}

function looksLikeUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

async function isPlayableDirectUrl(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        Range: 'bytes=0-1',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
      signal: controller.signal,
    });

    if (!(res.status === 200 || res.status === 206)) return false;

    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    if (!contentType) return true;
    if (contentType.includes('application/json') || contentType.includes('text/html')) return false;
    return contentType.startsWith('audio/') || contentType.includes('octet-stream');
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

async function findTrack(trackId: string): Promise<TrackRow | null> {
  const isUuid = UUID_RX.test(trackId);
  const asNumber = Number(trackId);
  const isNumeric = Number.isFinite(asNumber);

  const candidates: Array<PromiseLike<TrackRow | null>> = [];

  // Main catalog table lookups
  if (isUuid || isNumeric) {
    candidates.push(
      supabaseAdmin
        .from('tracks')
        .select('*')
        .eq('id', isNumeric ? asNumber : trackId)
        .maybeSingle()
        .then(({ data }) => (data as TrackRow | null) ?? null)
    );
  }

  candidates.push(
    supabaseAdmin
      .from('tracks')
      .select('*')
      .eq('track_id', trackId)
      .maybeSingle()
      .then(({ data }) => (data as TrackRow | null) ?? null)
  );

  // NOTE: KUT audio (K-KUT / mK / KPD / SWSP) lives in k_kut_assets and is
  // NEVER served through this route. KUTs are pre-made, immutable, and always
  // accessed via k_kut_codes → k_kut_assets.storage_path → signed URL.
  // This route is for full PIX (tracks table) only.

  const resolved = await Promise.all(candidates);
  return resolved.find(Boolean) ?? null;
}

async function signTrackPath(path: string): Promise<string | null> {
  const normalized = normalizeStoragePath(path);
  if (!normalized) return null;

  const { data, error } = await supabaseAdmin.storage
    .from('tracks')
    .createSignedUrl(normalized, SIGNED_URL_TTL);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

async function resolveStreamUrl(trackId: string): Promise<string | null> {
  const row = await findTrack(trackId);
  if (!row) return null;

  const filePath =
    typeof row.file_path === 'string'
      ? row.file_path
      : (typeof row.storage_path === 'string' ? row.storage_path : null);
  const candidates = [filePath, row.url].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (looksLikeUrl(candidate) && !candidate.includes('/storage/v1/object/')) {
      const ok = await isPlayableDirectUrl(candidate);
      if (ok) return candidate;
      continue;
    }

    // Some catalogs store full-track audio in a public bucket (for example
    // site-catalog). In those cases the URL is already directly streamable.
    if (looksLikeUrl(candidate) && candidate.includes('/storage/v1/object/public/')) {
      const ok = await isPlayableDirectUrl(candidate);
      if (ok) return candidate;
      continue;
    }

    const signed = await signTrackPath(candidate);
    if (signed) return signed;
  }

  // Last resort: try known naming conventions in the private `tracks` bucket.
  // Current catalog convention is mostly `gpm-pix-{track_id}.mp3`.
  const fallbackNames = [`gpm-pix-${trackId}.mp3`, `track_${trackId}.mp3`, `${trackId}.mp3`];

  for (const name of fallbackNames) {
    const signed = await signTrackPath(name);
    if (!signed) continue;

    const ok = await isPlayableDirectUrl(signed);
    if (ok) return signed;
  }

  return null;
}

type ResolveAudioResult = {
  url?: string;
  signedUrl?: string;
  access?: string;
  message?: string;
};

async function resolveViaFeaturedRoute(trackId: string, origin: string): Promise<ResolveAudioResult | null> {
  try {
    const url = `${origin}/api/resolve-audio?track_id=${encodeURIComponent(trackId)}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
      cache: 'no-store',
    });

    const body = (await res.json().catch(() => null)) as ResolveAudioResult | null;
    if (!body) return null;
    return body;
  } catch {
    return null;
  }
}

async function handle(trackId: string, origin: string) {
  if (!trackId) {
    return NextResponse.json({ error: 'Track ID is required' }, { status: 400 });
  }

  try {
    const url = await resolveStreamUrl(trackId);
    if (!url) {
      const fallback = await resolveViaFeaturedRoute(trackId, origin);
      if (fallback?.url) {
        return NextResponse.json({
          url: fallback.url,
          signedUrl: fallback.signedUrl ?? fallback.url,
          access: fallback.access ?? 'free',
          source: 'resolve-audio-fallback',
        });
      }

      if (fallback?.access === 'purchase_required') {
        return NextResponse.json(
          {
            error: fallback.message ?? 'Track requires purchase or is not currently featured',
            access: 'purchase_required',
          },
          { status: 403 }
        );
      }

      return NextResponse.json({ error: 'Track not found or not streamable' }, { status: 404 });
    }

    return NextResponse.json({ url, signedUrl: url });
  } catch (err) {
    console.error('[stream-pix] unexpected error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(_req: NextRequest, context: { params: Promise<{ trackId: string }> }) {
  const { trackId } = await context.params;
  return handle(trackId, _req.nextUrl.origin);
}

export async function POST(_req: NextRequest, context: { params: Promise<{ trackId: string }> }) {
  const { trackId } = await context.params;
  return handle(trackId, _req.nextUrl.origin);
}
