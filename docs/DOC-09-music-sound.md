---
id: DOC-09
version: 1.0.0-rc1
date: 2026-10-18
status: TEMPORARY_WEB_AUDIO_CONTROLLER_PROVEN
dependencies: [DOC-05]
related: [DOC-10, ASSET_REGISTER]
confidence: MEDIUM
---

# Music & Sound Design

## Milestone 02 result

`AdaptiveMusicController` creates temporary oscillator stems for BASE, ENERGY and HOT plus a BONUS gain state. All stems start on one calculated beat; transitions use scheduled gain ramps, while win and potion one-shots are independent. Mute, suspended-context resume, Fast Play and Replay share the event mapping. Initialization or one-shot failure is caught and never enters settlement.

The tones are technical signals only and have no asset/licensing claim. No final composition, samples or paid service were used. Automated tests verify common start time, beat-aligned ramps, mute/unmute, resume and blocked-audio degradation. **HYPOTHESIS / open gate:** real stems still require phase/null inspection, Safari gesture/interruption tests and a 15-minute device soak before production approval.

## Direction

Dark cabaret / occult lounge at proposed 96–108 BPM, minor/modal harmony, brushed percussion, upright-bass color, detuned piano and glass/alchemy textures. Avoid direct artist imitation. BASE must remain comfortable for long play; escalation adds density, not just loudness.

## Deliverables

| Layer | Function | Loop |
|---|---|---|
| BASE | harmony + pulse | 8 or 16 bars |
| ENERGY | percussion/ostinato | exactly phase-aligned |
| HOT | bass/brass/texture | exactly phase-aligned |
| BONUS | separate compatible phase | full sequence |
| Stings | small/medium/big, potion, cap | one-shot on quantized cue |
| SFX | spin/reveal/win/cascade/cauldron/UI/error | one-shot variants |

## Runtime

Use Web Audio `AudioContext` through the official SDK utility where practical. Decode sample-aligned alternate encodes into buffers, start all music stems on the same audio-clock origin at gain 0/1, and change gains at the next beat/bar boundary with short ramps. Maintain master/music/SFX buses and side-chain music during speech-like UI or large win stings. Unlock audio only after user gesture; on suspended context, present a clear muted/unlock state and continue gameplay silently.

State changes are idempotent and derived from events. Proposed mapping: cascade 1 BASE; cascade 2 ENERGY; cascade ≥3 or high multiplier HOT; final big win sting; bonus dedicated phase. Fast play may shorten stings and defer layer changes, but never alters outcome pacing required for legibility.

## Format and loudness

Master 48 kHz/24-bit WAV in external storage. Runtime candidates Ogg Vorbis + AAC/M4A (or the best matrix proven by target browsers); Web Audio decoding removes container playback gap if buffers are sample-trimmed. SFX mono where spatial width adds no value. Proposed internal target around −16 LUFS-I for music and ≤−1 dBTP master ceiling; final mix is verified in context, not normalized blindly.

## AI workflow and rights

Primary POC: Eleven Music if its current paid plan provides broad commercial rights and synchronized stems (public materials advertise up to six stems); reserve: commission a human composer to deliver locked stems. AI output is not accepted until BPM, key, exact loop length, stem phase, rights, prohibited-input compliance and provenance are documented. Do not use free-plan output for commercial assets where terms exclude it.

## POC-C

Produce a 30–60 s test cue with BASE/ENERGY/HOT, no final brand commitment. Pass: stems null/phase as intended; loops show no click/gap in 15-minute run; 100 randomized state transitions land within 20 ms of target scheduling on desktop and 50 ms on pilot mobile; suspend/resume, mute, background tab and device interruption recover; CPU/memory stay inside integrated slice budget.

Budget proposal: $50–150 generation/editing plus 4–8 hours mix cleanup; human-composer reserve is separately quoted after POC. Product Owner approves plan/terms before any paid generation.

## Event mapping acceptance

Every SFX/music cue has a domain event, priority, quantization, duration, ducking rule and fast/mute behavior in a versioned table. An audio error never blocks event completion. Replay starts from a clean audio graph and produces the same cue sequence after the Play gesture.
