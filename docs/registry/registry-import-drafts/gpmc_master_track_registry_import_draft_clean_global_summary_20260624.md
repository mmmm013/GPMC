# GPMC Master Track Registry Import Draft — Clean/Global Working Queue

Date: 2026-06-24  
Batch ID: GPMC-REG-IMPORT-DRAFT-CLEAN-GLOBAL-20260624  
Source queue: `docs/registry/batch-intake-working-queues/gpmc_clean_global_track_working_queue_20260624.tsv`  
Draft TSV: `docs/registry/registry-import-drafts/gpmc_master_track_registry_import_draft_clean_global_20260624.tsv`  
Source rows imported into draft: 504  

---

## Purpose

This draft prepares the conservative clean/global working queue for later GPMC Master Track Registry import review.

This file is an import draft only.

It does not create final Track IDs, PIX records, LT-PIX records, KKs, sKs, CIs, rights records, publishing records, or public approvals.

---

## Source Control

The source queue was created from the 586-track batch intake audit.

The source queue contains only conservative clean/global rows.

Rows excluded from this draft remain in extra triage and must not be imported through this clean/global batch.

---

## Import Boundaries

This draft does not:

- create Track IDs
- create PIX records
- create LT-PIX records
- create KKs
- create naked KKs
- create sKs
- create CIs
- approve public display
- approve public sale
- commit source audio
- resolve rights or publishing
- resolve performer/artist attribution
- override later admin review

---

## Draft Status Fields

Each row receives draft import control fields before the original source columns.

Key default statuses:

- `DRAFT_IMPORT_PENDING_REVIEW`
- `TRACK_RECORD_NOT_CREATED`
- `TRACK_ID_NOT_ASSIGNED`
- `PUBLIC_TITLE_DRAFT_ONLY`
- `PIX_NOT_CREATED`
- `LT_PIX_NOT_CREATED`
- `KKR_NOT_STARTED`
- `CI_NOT_CREATED`

---

## Required Next Review

1. Confirm source queue row count.
2. Confirm no TRIAGE_LATER rows entered this draft.
3. Confirm no cover/right-source-risk rows entered this draft.
4. Confirm no obvious title-character review rows entered this draft.
5. Confirm original source columns were preserved.
6. Decide Track ID assignment format.
7. Create final import plan only after admin approval.

---

## Count Check

Expected source rows: 504  
Actual source rows: 504  
Result: PASS

