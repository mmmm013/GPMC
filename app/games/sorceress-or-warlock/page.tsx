import { permanentRedirect } from 'next/navigation';

/* The game's earlier address. GD, 2026-10-23, on how "warlock" comes across to
   children: "Wizard, then? Yes." So old links land on the new name. */
export default function SorceressOrWarlock() {
  permanentRedirect('/games/soothesinger');
}
