# GPMC Track ID Assignment Format Decision

Date: 2026-06-24  
Decision status: Locked pending PR approval  
Applies to: GPMC Master Track Registry  
Import affected: 504-row clean/global registry import draft  
Authority level: Registry control / pre-import decision  

---

## Decision

The official GPMC Track ID format is:

`GPMC-TRK-000001`

Pattern:

`GPMC-TRK-######`

Where:

- `GPMC` = catalog / system namespace
- `TRK` = track-record object type
- `######` = six-digit permanent global sequence number

Example IDs:

- `GPMC-TRK-000001`
- `GPMC-TRK-000002`
- `GPMC-TRK-000003`

---

## Core Rule

A Track ID identifies a GPMC track record.

A Track ID does not identify:

- a song/composition
- a PIX
- an LT-PIX
- a KK
- a naked KK
- an sK
- a CI
- a DISCO source row
- a filename
- a source-audio hash
- a public display title
- an artist name
- an album name

Those are separate fields, relations, or downstream objects.

---

## Why the ID Contains No Metadata

The Track ID must not include title, artist, source, platform, genre, date, key, BPM, rights status, or public display language.

Reason:

- titles can change
- artist attribution can be corrected
- source filenames can be wrong
- albums can be reclassified
- rights can be clarified later
- imported rows can be merged or split
- public display decisions can change
- platform source IDs are not GPMC authority

The Track ID must remain stable even when metadata changes.

---

## Sequence Rule

Track IDs are assigned from a single global GPMC Track sequence.

The number is never reused.

If a record is voided, merged, deprecated, or superseded, its Track ID remains reserved and must not be reassigned.

---

## Official Format

Required format:

`GPMC-TRK-######`

Regex:

`^GPMC-TRK-[0-9]{6}$`

Invalid examples:

- `GPMC-TRACK-1`
- `GPMC-TRK-1`
- `GPMC-TRK-000001-INSTRO`
- `GPMC-TRK-20260624-000001`
- `GPMC-ZACH-000001`
- `DISCO-44077375`
- `GPMC-WAV-META-20260623-001`

---

## Relationship to Source IDs

DISCO/source platform IDs may be preserved in source metadata fields.

They are not GPMC Track IDs.

Example:

- DISCO source ID: `44077375`
- GPMC Track ID: `GPMC-TRK-000001`

Both may appear on the same row, but they are not interchangeable.

---

## Relationship to WAV Metadata IDs

WAV metadata IDs are source-audio metadata records.

They are not Track IDs.

Example:

- WAV metadata ID: `GPMC-WAV-META-20260623-001`
- GPMC Track ID: `GPMC-TRK-000001`

The WAV metadata ID points to an audio-source/control record.

The Track ID points to a registry track record.

---

## Relationship to PIX / LT-PIX / KK / sK / CI

Track IDs are upstream.

PIX, LT-PIX, KKs, naked KKs, sKs, and CIs may derive from or relate to a Track ID, but they must receive their own object IDs under their own object rules.

A Track ID does not become a CI.

A track, PIX, LT-PIX, KK, or sK becomes a CI only after transaction/customer-cost conversion.

---

## Import Draft Rule

The 504-row clean/global registry import draft must not become official until Track IDs are assigned under this format.

The import draft currently remains draft only.

Current draft statuses remain correct:

- `TRACK_RECORD_NOT_CREATED`
- `TRACK_ID_NOT_ASSIGNED`
- `PIX_NOT_CREATED`
- `LT_PIX_NOT_CREATED`
- `KKR_NOT_STARTED`
- `CI_NOT_CREATED`

No row becomes official merely because this format is locked.

---

## Assignment Order Rule for the 504-Row Draft

When the final import plan is approved, Track IDs should be assigned in preserved import-draft row order unless an earlier review identifies:

- duplicate source record
- already-existing GPMC Track record
- split-track issue
- merged-track issue
- rights/source conflict
- title/source mismatch requiring triage
- row that should be pulled back from clean/global import

Rows pulled back from import do not receive final Track IDs until resolved.

---

## Variant / Instrumental Rule

Instrumental versions, alternate mixes, vocal versions, demos, edits, stems, and remasters may receive separate Track IDs when they are distinct track records.

Their relationship must be captured in metadata fields, not encoded in the Track ID.

Example:

- `GPMC-TRK-000101` — Home Is Sunny
- `GPMC-TRK-000102` — Home Is Sunny - INSTRO

The `- INSTRO` suffix belongs in display title metadata, not inside the Track ID.

---

## Provisional / Draft Handling

Before final assignment, rows may use status fields such as:

- `TRACK_ID_NOT_ASSIGNED`
- `TRACK_ID_PENDING`
- `TRACK_ID_RESERVED_PENDING_REVIEW`

Do not write fake final IDs into official registry rows.

Do not create final Track IDs in a working queue unless the assignment file is approved.

---

## Required Future Control Files

Before final import, create a Track ID assignment file that maps:

- registry import batch ID
- import row number
- source queue row number
- source ID
- proposed display title
- assigned GPMC Track ID
- assignment status
- assignment note

That assignment file becomes the bridge between the draft import and the official Master Track Registry import.

---

## Locked Decision Summary

Use:

`GPMC-TRK-######`

Do not encode metadata inside the ID.

Do not reuse IDs.

Do not make the 504-row import official yet.

Create a separate Track ID assignment file before final import.

