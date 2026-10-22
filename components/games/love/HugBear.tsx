import type { BearLook } from '@/lib/games/loveGame';

/* The HUG Bear archer, drawn here and nowhere else: a round bear with a bow.
   Female wears a ribbon bow on one ear, male a bow tie, unisex a heart badge.
   Black or white fur; cute has big shining eyes and blush, bold has brows and
   a steady look. An original drawing, not modelled on any branded bear. */
export default function HugBear({ look, size = 120, flame = false }: { look: BearLook; size?: number; flame?: boolean }) {
  const fur = look.fur === 'black' ? '#2B2420' : '#F4EFE6';
  const line = look.fur === 'black' ? '#0E0B09' : '#8D7B68';
  const muzzle = look.fur === 'black' ? '#6D5A4C' : '#E3D3BF';
  const eye = look.fur === 'black' ? '#FFF8E1' : '#1A1410';
  const arrowTip = flame ? '#FF3D00' : '#EC407A';
  return (
    <svg viewBox="0 0 140 150" width={size} height={size * (150 / 140)} role="img" aria-label={`A ${look.mood} ${look.fur} HUG Bear archer`}>
      {/* bow and arrow, held on the right */}
      <path d="M112 34 Q140 80 112 126" fill="none" stroke="#8D6E63" strokeWidth="5" strokeLinecap="round" />
      <line x1="112" y1="34" x2="112" y2="126" stroke="#EDE7F6" strokeWidth="1.5" />
      <line x1="70" y1="80" x2="132" y2="80" stroke="#BCAAA4" strokeWidth="3" />
      <path d="M132 80 l-8 -6 v12 z" fill={arrowTip} />
      {flame && <path d="M134 80 q8 -8 4 -16 q10 8 2 16 q8 8 -2 14 q4 -6 -4 -14z" fill="#FF6E40" opacity="0.9" />}
      {/* feather on the arrow: this is what tickles */}
      <path d="M70 80 q-10 -10 -4 -16 q4 8 10 10 z M70 80 q-10 10 -4 16 q4 -8 10 -10 z" fill={flame ? '#FFAB91' : '#F8BBD0'} />
      {/* ears */}
      <circle cx="38" cy="30" r="14" fill={fur} stroke={line} strokeWidth="2" />
      <circle cx="90" cy="30" r="14" fill={fur} stroke={line} strokeWidth="2" />
      <circle cx="38" cy="30" r="7" fill={muzzle} />
      <circle cx="90" cy="30" r="7" fill={muzzle} />
      {/* body and head */}
      <ellipse cx="64" cy="112" rx="34" ry="32" fill={fur} stroke={line} strokeWidth="2" />
      <circle cx="64" cy="58" r="34" fill={fur} stroke={line} strokeWidth="2" />
      <ellipse cx="64" cy="70" rx="15" ry="11" fill={muzzle} />
      <ellipse cx="64" cy="65" rx="6" ry="4.5" fill="#1A1410" />
      <path d="M58 75 q6 6 12 0" fill="none" stroke="#1A1410" strokeWidth="2" strokeLinecap="round" />
      {look.mood === 'cute' ? (
        <>
          <circle cx="50" cy="52" r="6" fill={eye} />
          <circle cx="78" cy="52" r="6" fill={eye} />
          <circle cx="52" cy="50" r="2" fill={look.fur === 'black' ? '#1A1410' : '#FFFFFF'} />
          <circle cx="80" cy="50" r="2" fill={look.fur === 'black' ? '#1A1410' : '#FFFFFF'} />
          <ellipse cx="42" cy="66" rx="6" ry="3.5" fill="#F48FB1" opacity="0.7" />
          <ellipse cx="86" cy="66" rx="6" ry="3.5" fill="#F48FB1" opacity="0.7" />
        </>
      ) : (
        <>
          <ellipse cx="50" cy="53" rx="5" ry="3.5" fill={eye} />
          <ellipse cx="78" cy="53" rx="5" ry="3.5" fill={eye} />
          <path d="M42 44 l14 4 M86 44 l-14 4" stroke={look.fur === 'black' ? '#FFF8E1' : '#1A1410'} strokeWidth="3" strokeLinecap="round" />
          <path d="M28 40 l8 -3 M100 40 l-8 -3" stroke="#D32F2F" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      {look.kind === 'female' && (
        <g transform="translate(92 22)">
          <path d="M0 0 l-12 -8 v16 z M0 0 l12 -8 v16 z" fill="#EC407A" />
          <circle r="3.5" fill="#AD1457" />
        </g>
      )}
      {look.kind === 'male' && (
        <g transform="translate(64 90)">
          <path d="M0 0 l-12 -7 v14 z M0 0 l12 -7 v14 z" fill="#1E63D6" />
          <circle r="3" fill="#0D47A1" />
        </g>
      )}
      {look.kind === 'unisex' && (
        <path d="M64 120 c-8 -8 -14 -12 -8 -18 c4 -4 8 0 8 2 c0 -2 4 -6 8 -2 c6 6 0 10 -8 18z" fill="#EC407A" />
      )}
    </svg>
  );
}
