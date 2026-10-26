import { permanentRedirect } from 'next/navigation';

/* An old address of SootheSinger (GD, 2026-10-24). Old links keep working, and
   search engines move to the new address. */
export default function OldAddress() {
  permanentRedirect('/games/soothesinger');
}
