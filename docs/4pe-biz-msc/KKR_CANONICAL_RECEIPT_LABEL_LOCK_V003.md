# KKr Canonical Receipt-Label Lock V003

**Status:** PERMANENT CANONICAL LAW  
**Owner and final authority:** GD / G Putnam Music, LLC  
**Currency:** USD  
**Source authority:** GPMC  
**Supersedes for naming scope:** KKR_CANONICAL_PRODUCT_PRICE_LOCK_V002 marketing-language interpretation

## Purpose

This version separates internal structure, storefront wording, receipt wording, and fulfillment records so one naming correction cannot silently rewrite unrelated systems.

## Receipt-only naming law

For a customer purchase whose underlying structure is either **mKUT** or **sBLK**, the customer-visible receipt label is exactly:

**MyK**

This receipt label does not redefine or merge the underlying structures.

## Structural law preserved

- mKUT remains mKUT.
- sBLK remains one identified structural segment of a BLK, such as Verse 1a, Verse 1b, Verse 2a, or Verse 2b.
- mKUT is not an sBLK.
- BLK remains BLK.

## Canonical prices preserved

- Vocal-note or typed-message add-on: $0.99
- mKUT: $1.99
- sBLK: $4.99
- BLK: $7.99
- Promotional HUG: $11.99
- Standard HUG: $14.99

## Public-surface preservation

This receipt-label law does not authorize any change to:

- storefront wording;
- public page titles or descriptions;
- URLs or routes;
- use-case names;
- story copy;
- inventory family names;
- audio identity or audio content;
- Stripe account access;
- checkout availability;
- product prices;
- fulfillment status.

Those remain unchanged unless GD separately authorizes a specific change.

## Four-layer naming control

1. **Structural identity:** mKUT, sBLK, BLK.
2. **Storefront wording:** existing approved customer-facing copy; unchanged by this lock.
3. **Receipt label:** MyK for mKUT and sBLK purchases only.
4. **Fulfillment evidence:** preserves both the receipt label and the underlying structural identity as separate fields.

No layer may be used as authority to silently rewrite another layer.

## Receipt proof rule

The receipt label is not proven by source code, an environment-variable name, a Stripe object name, or an internal fulfillment record. It is proven only when an actual customer-visible receipt from the correct checkout displays **MyK** and the canonical amount.

## Webhook separation rule

Webhook health is operational evidence only. It is never naming authority and must not be used to rename products, structures, pages, receipts, or inventory.

Historical webhook failures are historical evidence only and must not be described as a current failure without a current test.

## Change control

Any amendment requires:

- an explicit GD decision;
- a new numbered authority file;
- a GPMC source commit;
- a matching K-KUT control update;
- a passing build audit;
- no silent public-copy changes.
