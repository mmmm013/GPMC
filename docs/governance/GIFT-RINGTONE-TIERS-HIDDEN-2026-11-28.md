# gputnammusic.com /gift: the Heart-Tap ringtone tiers, hidden and then brought back

## CURRENT STATE: SHOWN. Reversed by GD the same day, 2026-11-28.

GD chose option a: bring all four Heart-Tap tiers back for now, ringtones included. The reason:
the KEZ "give" path for the Scherer family (/scherer, "Become a KEZ") goes to /gift, and with the
tiers hidden that path had no way to give. It has to work through Christmas. **Ringtones get
discussed later.**

- `HEART_TAP_SHOWN` in `lib/gift-protocol.ts` is `true` again.
- The footer's /gift links ("Gift", and "Send a HUG" on the KLEIGH domain) show again.
- The "Heart-Tap gifts are not offered right now." page is removed; /gift is exactly as it was
  before the hide.
- The ringtone question is open, not closed. Raise it with GD after Christmas.

Everything below is the record of the first ruling, kept as it was written.

---

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
