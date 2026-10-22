import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

/* The Love Game's stream addresses, sealed. A player's page only ever sees
   /api/love-game/audio?t=…; the k-kut address behind it (which names the song's
   catalogue id) stays on the server (GD, 2026-10-22: no proprietary info in the
   frontend). Sealed with AES-256-GCM and good for one hour. */
const TTL_MS = 60 * 60 * 1000;
const ALLOWED_HOSTS = /(^|\.)k-kut\.com$|\.vercel-storage\.com$|\.supabase\.co$/;

function key(): Buffer {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!secret) throw new Error('No sealing secret');
  return createHash('sha256').update(`love-game-audio:${secret}`).digest();
}

export function seal(src: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', key(), iv);
  const body = Buffer.concat([c.update(JSON.stringify({ src, exp: Date.now() + TTL_MS }), 'utf8'), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), body]).toString('base64url');
}

export function unseal(token: string): string | null {
  try {
    const raw = Buffer.from(token, 'base64url');
    const d = createDecipheriv('aes-256-gcm', key(), raw.subarray(0, 12));
    d.setAuthTag(raw.subarray(12, 28));
    const { src, exp } = JSON.parse(Buffer.concat([d.update(raw.subarray(28)), d.final()]).toString('utf8')) as { src: string; exp: number };
    if (Date.now() > exp) return null;
    const url = new URL(src);
    return url.protocol === 'https:' && ALLOWED_HOSTS.test(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
}
