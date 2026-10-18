---
id: DOC-08
version: 0.9.0
date: 2026-10-18
status: POC_REQUIRED
dependencies: [DOC-05, DOC-07]
related: [DOC-10, ASSET_REGISTER]
confidence: MEDIUM_LOW
---

# Character Animation & Video Pipeline

## Decision

Pilot native video in a fixed rectangular background plate, not transparent video. Deliver both WebM VP9 and MP4 H.264; capability probe chooses. This avoids fragile mobile alpha support. If plate blending or decode fails, pivot to WebP/AVIF sprite atlases at reduced FPS. No runtime AI generation.

## State set: one continuous stitched dance

**Fixed Product Owner decision (2026-10-18): ALL witch states are multi-second dance loops, including IDLE, SMALL_WIN, MEDIUM_WIN, BIG_WIN and BONUS.** They must connect to one another without flicker, pose teleportation or a blank frame. Witch motion never stops simply because the RGS round settles.

| State | Prototype loop | Choreography | Exit |
|---|---:|---|---|
| IDLE | 4.2 s | restrained continuous sway | any requested higher-energy loop, at seam |
| SMALL_WIN | 3.6 s | light dance variation | next stronger requested tier, or IDLE |
| MEDIUM_WIN | 4.2 s | more energetic continuous dance | BIG/BONUS or IDLE |
| BIG_WIN | 4.8 s | dramatic, expressive firelit dance | BONUS or IDLE |
| BONUS | 4.8 s | special dance interacting with cauldron | next eligible neutral seam after bonus ends |

Durations are **prototype timing proposals**, not locked video lengths; validate latency against final footage. Small and Big are not one-shot clips: each is a complete repeating performance. A requested win tier must receive at least one complete cycle before downgrading to IDLE.

**Universal seam/anchor A:** all clips in all tiers share compatible full-body pose, limb positions, camera, crop, scale, exposure and background at both first and last frames. This enables any state to connect directly to any other state (including repeated loops) without producing N×N custom transition videos. Motion between anchors remains free, expressive and distinct per tier.

A potion uses its own short magical FX overlay and changes multiplier according to the math event; it does **not** select BONUS. BONUS is reserved for a real bonus-start event and is out of current pilot math scope.

## Production workflow

Canonical still and pose sheet → image-to-video controlled motion candidates → identity/costume/anatomy review → choose frames and trim at anchor pose → temporal cleanup/stabilization → plate/color match → FFmpeg transcodes → ffprobe manifest → browser loop/transition QA → content-addressed storage.

Primary POC generator: Runway API/model available at execution time because it exposes deterministic automation and public per-second API pricing; reserve Luma API. Both commercial rights and content-policy fit must be captured at purchase. Adobe Firefly is the rights-safety reserve for key frames. Tool quality changes rapidly, so model names are recorded per asset rather than hard-coded as permanent architecture.

## Smooth switching: controller contract

- The independent `WitchDanceController` holds the current looping clip. Fast sequences of `win` events queue/coalesce the highest requested dance tier instead of resetting the character on every book event.
- `boardReveal` and `cascade` never force IDLE. A Potion event emits an independent visual accent and does not switch the character loop.
- The current loop plays to its **compatible seam marker** (last anchor A frame); only then may the controller switch. Every new non-idle dance gets a whole loop even if the bet has already settled. Game settlement does **not** await the dance.
- The pilot uses two overlapping CSS figure layers with anchor-matched 0%/100% keyframes. Prepare the hidden layer from anchor A and crossfade opacity over approximately 180 ms while the outgoing figure reaches its endpoint. Both layers remain within the Witch Stage; no changes to math, wallet or RGS.
- Production runtime replaces CSS with two pre-decoded videos (active/incoming), each showing the same witch identity and plate. Preload the incoming first frame, synchronize to the decoded clip seam rather than relying solely on wall-clock timers, crossfade, then release the prior decoder. The clip itself loops continuously when no state change is pending.
- While a sequence is open, maintain the current high-energy loop if no stronger request arrives. At round end, finish the active loop, consume any queued higher-tier loop for at least one full cycle, then return to IDLE at a seam.
- A new Spin may start while the previous character performance is completing. It must not instantly cut the current clip. Audio layers may change independently with their own beat/bar timing.
- Priority: `BONUS > BIG_WIN > MEDIUM_WIN > SMALL_WIN > IDLE`. Fast Play can select reduced-motion or poster fallback, but never change payout math or reorder RGS events.
- Error/decode failure: return to the nearest safe neutral state or static witch; decorative media never blocks settlement or replay completion.

**Response-latency risk:** waiting for a whole 4–5 second clip can delay reaction to a win. POC-B must measure cue-to-motion latency. If unacceptable, choreograph additional compatible anchor A seam markers inside every clip or use matching short transition clips; never cut at arbitrary frame indices or reintroduce per-event image flipping.

Pseudo-contract:

```ts
requestDanceTier(tier: WitchTier): void // queue at next safe seam
onLoopSeam(): void                      // media-confirmed seam, run transition
playPotionAccent(multiplier: number): void
finishRound(): void                     // does not block RGS settlement
```

## Encoding matrix

Masters: mezzanine lossless/intraframe, not Git. Runtime candidates: VP9 WebM and H.264 MP4, 24/30 fps, no audio, identical crop/frame count where possible. Generate 1× and low-tier resolution; measure bytes, decode FPS, dropped frames, memory, first-frame and seek/loop seam. Alpha experiments are separate and cannot replace baseline without iOS/Android evidence.

## Preload policy

Critical: IDLE poster + chosen low-tier clip. Near-term: SMALL/MEDIUM. Deferred: BIG/BONUS. Use manifest SHA and AbortController; one active plus one standby decode; unload large unused clips on constrained devices. Respect data-saver/reduced-motion by selecting poster/atlas.

## POC-B pass/fail

Test current Safari iOS, Chrome Android, desktop Chrome/Safari on named real devices. Pass if identity/costume approved in 3 core states; ≥95% of 20 blinded transitions show no hard pose/background jump; loops run 10 minutes without drift/crash; frame-rate floor 30 FPS while board animates; first-frame and total transfer meet DOC-06 budgets. Pivot to atlas if any target browser cannot sustain decode/memory or transition score after two bounded iteration rounds.

## Cost stop-loss

Generation budget proposal $100–250 plus optional editor time; do not purchase before G2. Store rejected-output count and effective cost per accepted second.
