import { toNewAddress } from '@/lib/games/oldAddress';

/* The game's old address. It is now SootheSinger (GD, 2026-10-24);
   old links keep working, and search engines move to the new address. */
export default async function OldAddress({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return toNewAddress('/games/soothesinger', searchParams);
}
