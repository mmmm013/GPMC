# GPMC Track ID Assignment Draft — Clean/Global Import

Date: 2026-06-24  
Status: DRAFT_TRACK_ID_ASSIGNMENT_PENDING_REVIEW  
Authority: GPMC Master Track Registry pre-import control  
Source import draft: `docs/registry/registry-import-drafts/gpmc_master_track_registry_import_draft_clean_global_20260624.tsv`  
Assignment TSV: `docs/registry/track-id/gpmc_track_id_assignment_draft_clean_global_20260624.tsv`  

---

## Purpose

This file assigns draft GPMC Track IDs to the 504-row clean/global registry import draft.

This is a bridge file only.

It maps:

- registry import batch ID
- import row number
- source queue row number
- source CSV
- source ID
- source title
- proposed display title
- artist
- album
- assigned GPMC Track ID
- assignment status
- downstream object statuses

---

## Track ID Format Used

Official format:

`GPMC-TRK-######`

Assignment range used in this draft:

`GPMC-TRK-000001` through `GPMC-TRK-000504`

---

## Control Points

This draft does not make any row official.

This draft does not create final Track records.

This draft does not create PIX records.

This draft does not create LT-PIX records.

This draft does not start KKr.

This draft does not create KKs, naked KKs, sKs, or CIs.

This draft does not approve public use.

This draft does not change or copy source audio.

---

## Required Review Before Final Import

Before final import, confirm:

1. All 504 assigned IDs match expected sequence.
2. No duplicate assigned GPMC Track IDs exist.
3. Every assignment maps to exactly one import draft row.
4. Rows still belong in the clean/global import set.
5. No row requires pullback to triage.
6. No row already has an existing official GPMC Track record.
7. Admin approves converting draft assignments into official registry rows.

---

## Count Check

Expected source rows: 504  
Actual source rows: 504  
Assignment rows created: 504  
Result: PASS

---

## Locked Reminder

Track IDs are stable registry identifiers.

Track IDs do not contain artist, title, source platform ID, filename, key, BPM, variant, rights status, or public display metadata.

