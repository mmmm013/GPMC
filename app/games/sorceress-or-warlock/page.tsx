import { toNewAddress } from '@/lib/games/oldAddress';

/* The game's earlier address. GD, 2026-10-23, on how "warlock" comes across to
   children: "Wizard, then? Yes." So old links land on the new name. */
export default async function SorceressOrWarlock({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return toNewAddress('/games/soothesinger', searchParams);
}
