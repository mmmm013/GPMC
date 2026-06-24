# WAV Track Intake Queue Triage — 2026-06-23

Status: TRIAGE  
Authority: GPMC / GPMC-C  
Reason: Active WAV Track Intake Queue draft was stopped before commit because one TSV row became malformed during terminal paste/output handling.

## Decision

Do not promote the malformed active WAV queue draft.

Do not commit the malformed active queue as an active registry.

Send the attempted queue to triage and move on.

## Affected Draft

Attempted files:

- docs/registry/gpmc_active_wav_track_intake_queue_20260623.tsv
- docs/registry/GPMC_ACTIVE_WAV_TRACK_INTAKE_QUEUE_README_20260623.md

## Intended Candidates Still Known

The five intended active source-path candidates remain known from the prior source resolution registry:

1. Back to the Water.wav
2. Best Birthday.wav
3. home-is-sunny-instro-84-5bpm-cminor.wav
4. cornfield-elle.wav
5. cornfield-instro-100bpm-gmaj.wav

## Control

This triage note does not create final Track IDs.

This triage note does not create PIX or LT-PIX records.

This triage note does not copy audio files.

Next valid work should restart Track intake from the merged source resolution registry, not from the malformed draft queue.
