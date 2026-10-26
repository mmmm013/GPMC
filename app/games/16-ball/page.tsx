import { permanentRedirect } from 'next/navigation';

/* The game's old address. It is now SootheSinger (GD, 2026-10-24);
   old links keep working, and search engines move to the new address. */
export default function OldAddress() {
  permanentRedirect('/games/soothesinger');
}
