import { NextResponse } from 'next/server';

type DomainCode = 'FLAGSHIP' | 'KLEIGH';

type TemplatePayload = {
  domain_code: DomainCode;
  host: string;
  slots: Record<string, unknown>;
  btis: Array<{ bti_key: string; payload: unknown }>;
};

type SupabaseAdminClient = {
  from: (table: string) => any;
  schema: (name: string) => { from: (table: string) => any };
};

const DEFAULT_SLOT_KEYS = [
  'ui_logo',
  'ui_company_name',
  'top_row_spacer',
  'menu_item_heroes',
  'menu_item_uru',
  'menu_item_tells_tale',
  'menu_item_artists',
  'menu_item_video_klips',
  'menu_item_brand',
  'menu_item_art_gallery',
  'menu_item_sponsorships',
  'featured_playlist',
  'k_kuts_featured',
] as const;

function normalizeHost(raw: string): string {
  return raw.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split(':')[0];
}

function getDomainCode(host: string): DomainCode {
  const normalized = normalizeHost(host);
  if (normalized.includes('2kleigh.com')) return 'KLEIGH';
  // Guard typo variant seen in deployment notes/user requests.
  if (normalized.includes('gputnammmusic.com')) return 'FLAGSHIP';
  return 'FLAGSHIP';
}

async function getSupabaseAdminClient(): Promise<SupabaseAdminClient | null> {
  try {
    const mod = await import('@/lib/supabaseAdmin');
    return mod.supabaseAdmin as SupabaseAdminClient;
  } catch (error) {
    console.error('sti-template admin client unavailable', error);
    return null;
  }
}

async function resolveSlots(client: SupabaseAdminClient, domainCode: DomainCode): Promise<Record<string, unknown>> {
  const { data, error } = await client
    .from('v_sti_resolved')
    .select('slot_key, payload')
    .eq('domain_code', domainCode);

  if (error) {
    console.error('sti-template slots error', error);
    return {};
  }

  const slots: Record<string, unknown> = {};
  for (const row of data ?? []) {
    slots[row.slot_key] = row.payload;
  }

  // Strict-template guard: always return known keys, even when missing in DB.
  for (const key of DEFAULT_SLOT_KEYS) {
    if (!(key in slots)) slots[key] = null;
  }

  return slots;
}

// The app_private schema is not exposed to the API (PGRST106), so this read
// failed on every visit and always came back empty. Header and Footer only use
// `slots`, so btis stays an empty list -- the same result visitors already got,
// without the failing database call. (GD 2026-11-01: "Fix")
async function resolveBtis(_client: SupabaseAdminClient, _domainCode: DomainCode): Promise<Array<{ bti_key: string; payload: unknown }>> {
  return [];
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const hostParam = url.searchParams.get('host') ?? '';
  const requestHost = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? '';
  const host = normalizeHost(hostParam || requestHost || 'gputnammusic.com');
  const domainCode = getDomainCode(host);

  const client = await getSupabaseAdminClient();
  if (!client) {
    const emptySlots = Object.fromEntries(DEFAULT_SLOT_KEYS.map((key) => [key, null]));
    return NextResponse.json(
      {
        domain_code: domainCode,
        host,
        slots: emptySlots,
        btis: [],
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
        },
      }
    );
  }

  let slots = await resolveSlots(client, domainCode);
  let btis = await resolveBtis(client, domainCode);

  // Ensure 2kleigh never gets empty template payloads during rollout.
  if (domainCode === 'KLEIGH' && btis.length === 0) {
    const fallbackSlots = await resolveSlots(client, 'FLAGSHIP');
    const fallbackBtis = await resolveBtis(client, 'FLAGSHIP');
    slots = { ...fallbackSlots, ...slots };
    btis = fallbackBtis;
  }

  const payload: TemplatePayload = {
    domain_code: domainCode,
    host,
    slots,
    btis,
  };

  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
    },
  });
}
