# GPMC Tracked Public Audio Audit — 2026-06-23

Status: Public audio audit  
Authority: GPMC / GPMC-C  
Repo visibility: Public

## Finding

GPMC currently tracks public MP3/M4A audio assets.

The current audit found no tracked WAV, WAVE, AIF, or AIFF source files in public GPMC.

## Control

Do not commit private/source WAV audio to public GPMC.

Do not delete existing tracked MP3/M4A assets until each item is classified.

Deleting from Git does not automatically remove public Git history.

## Required Review

Each tracked public audio item must be classified as one of:

- PUBLIC_SITE_ASSET_APPROVED
- PUBLIC_DEMO_APPROVED
- DOWNSTREAM_DISPLAY_COPY
- NEEDS_REPLACEMENT_OR_REMOVAL_PLAN
- HOLD
- UNKNOWN_REVIEW_REQUIRED

## Public / Private Rule

Public GPMC may store:

- registry data
- review packets
- hashes
- manifests
- public-facing approved demo/display assets

Private audio vault must store:

- protected WAV source files
- source masters not approved for public repo distribution
- active WAV SSOT audio copies
