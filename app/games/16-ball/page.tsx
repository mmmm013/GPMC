import { redirect } from 'next/navigation';

/* The game's old address. It is now The Sorceress or Warlock (GD, 2026-10-23);
   old links keep working. */
export default function OldAddress() {
  redirect('/games/sorceress-or-warlock');
}
