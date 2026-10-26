import { permanentRedirect } from 'next/navigation';

type Params = Promise<Record<string, string | string[] | undefined>>;

/* An old game address sends its visitor on to the new one, keeping the query:
   a shared SootheSinger answer carries its word, time, guide and question there. */
export async function toNewAddress(path: string, searchParams: Params): Promise<never> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    for (const v of Array.isArray(value) ? value : value === undefined ? [] : [value]) query.append(key, v);
  }
  const q = query.toString();
  permanentRedirect(q ? `${path}?${q}` : path);
}
