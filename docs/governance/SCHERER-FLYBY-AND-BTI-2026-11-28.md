# Michael Scherer's sweet spots fly by; BTI off display; the MSJ card says what it is

Rulings: GD, 2026-11-28.

## 1. BTI comes off display

BTI is Branded Template Item, an internal term.
- /kleigh: "KLEIGH · BTI Library" now reads "KLEIGH Library" (components/KleighT20Grid.tsx).
- /kleigh: "BEHIND THE MUSIC — BTI ASSETS" was a code comment, not shown; it now reads "BEHIND THE
  MUSIC". The heading people see was already "Behind the Music".
- Neither block has a link. The library's 16 songs all stream from /pix and exist.
- The internal STI/BTI/FP item types in code are unchanged. This is display only.

## 2. The MSJ Jazz Pack card on /join

> "I don't like stems"

The card now reads "Support Michael Scherer's family". "+ unlock 3 exclusive jazz stems" is gone:
the card goes to the family's GoFundMe (KEZ-GOES-TO-GOFUNDME-2026-11-28.md), which delivers no
stems, so the card promises nothing GoFundMe does not deliver.

## 3. Michael's sweet spots, everywhere he appears

> "we got to make sure they hear some Michael whenever they get their anything doing with dealing
> with Michael. He's got some tremendous sweet spots. We just got to rotate those and do promos,
> flyby promos I've done with Brave and Bravo, not even on Heroes, but in regular pages."

- The flyby is his own: BRAVE and BRAVO from k-kut.com (components/BraveAndBravo.tsx, copied
  unchanged), flying across a strip that says "Hear Michael Scherer" with a Play button.
- One sweet spot per visit, rotating song by song. Press to play; nothing plays until pressed.
  Stream only (/api/scherer/sweet-spot), never a download; no song name, file or path is shown.
- No new cuts. Every clip is one already cut and already streaming on Sunday Riff Runs. Each song
  was checked against ASCAP (SCHERER, MICHAEL DOUGLAS / SHERER, MICHAEL D.): I Live Free,
  Blinkin' About You, Am Missin' You, I Like To Like, Bounce Along, Fast Lanes. 28 clips in
  all, listed in lib/scherer/sweetSpots.ts.
- Where it shows: /scherer (under the KEZ buttons at the top), /join (the Michael Scherer Jazz /
  KEZ panel), and his creator page /creator/msj (sign-in screen and dashboard).
