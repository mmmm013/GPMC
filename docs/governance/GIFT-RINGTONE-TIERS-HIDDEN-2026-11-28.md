# gputnammusic.com /gift: the Heart-Tap ringtone tiers are hidden

Ruling: GD, 2026-11-28.

> "yes, hide the ringtones"

The question he answered (the Christmas walk-through, decision 4): gputnammusic.com /gift sells
"Heart-Tap" tiers ($1.99 to $24.99) that deliver a "Digital Mixed Bag" of ringtones, digital
stickers and other items. A ringtone is a download, and no Element is ever a download. Remove,
or keep?

## What "hide" means here

- **Hidden, not deleted.** He wants to look into ringtones later. All the code stays.
- One switch: `HEART_TAP_SHOWN` in `lib/gift-protocol.ts`, now `false`.
- Every tier is filled from the same Mixed Bag, whose items include `ringtone` and `sticker`
  (`ASSET_TYPES`), so all four tiers (Quick Tap, Double Tap, Long Press, Hold My Heart) are
  hidden, not only the $1.99 one that names them.
- With no tier left, /gift says "Heart-Tap gifts are not offered right now." with a Listen
  button, and the footer's /gift links ("Gift", and "Send a HUG" on the KLEIGH domain) are
  hidden. The header nav never linked /gift.

## Still pointing at /gift (left as they are, for GD)

These are page links, not nav or footer, and some sit on pages he is still deciding:
/scherer ("Become a KEZ"), /kleigh, /join, /kupid, /valentines, /heroes and /mip ("Gift Support"),
/tt, the PromoBar, CashSprintBanner and the chat guide. They now land on the "not offered right
now" page.

## To bring it back

Set `HEART_TAP_SHOWN = true`. The page, its tiers, checkout and both footer links return
exactly as they were.
