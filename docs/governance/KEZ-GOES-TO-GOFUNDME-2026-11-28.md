# Every KEZ goes to the Scherer family's GoFundMe

Ruling: GD, 2026-11-28.

> "All micro donations need to go to his GoFundMe… You tie to that."

The campaign is the Scherer family's, organized by Michael Scherer:
https://www.gofundme.com/f/support-3-yr-augusts-recovery-after-dog-attack

## What this means on gputnammusic.com

- Every KEZ donate button goes straight to that GoFundMe page, in a new tab
  (`target="_blank" rel="noopener"`). We take no money for a KEZ; GoFundMe does.
- The URL lives in one place: `KEZ_DONATE_URL` in `config/kez.ts`. A button never spells it out.
- Button words and the page copy about the family are unchanged. Nothing is added.

## The buttons, 2026-11-28

- /scherer: "🎹 Become a KEZ — Help Michael" (top) and "🎹 Become a KEZ" (bottom). Both went
  to /gift (Heart-Tap) before.
- /join: "Become a KEZ" in the KEZ — Keys for a Keyboard panel. It was a button that went nowhere.
- /creator/[brand]: no KEZ donate button there. `KEZ_CAMPAIGN` in config/creators.ts is an asset
  upload scope, not a link, so it is unchanged.

## Added the same day: the MSJ Jazz Pack card on /join

GD, 2026-11-28:

> "yes, send it to the GoFundMe."

The /join flash card "MSJ Jazz Pack" ("Support Michael Scherer + unlock 3 exclusive jazz stems.")
went to /gift (Heart-Tap). Its GRAB IT button now opens `KEZ_DONATE_URL` in a new tab
(`rel="noopener"`). The card's words are unchanged except its price: "One-time $4.99." is removed,
because GoFundMe sets no fixed amount. Nothing else on the card changed.

## Not changed

- /gift's Heart-Tap tiers stay as they are (GD, option a). They are gifts, not the KEZ path.
- "Join the KEZ Crew →" on /scherer still goes to /join. It is not a donate button.
