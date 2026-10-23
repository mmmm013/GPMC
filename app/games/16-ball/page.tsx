import { permanentRedirect } from 'next/navigation';

/* The game's old address. It is now The Sorceress or Warlock (GD, 2026-10-23);
   old links keep working, and search engines move to the new address. */
export default function OldAddress() {
  permanentRedirect('/games/sorceress-or-warlock');
}
