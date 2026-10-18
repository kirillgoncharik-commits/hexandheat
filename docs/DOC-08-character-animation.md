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

## State set

| State | Duration/loop | Entry/exit |
|---|---:|---|
| IDLE | 4–6 s seamless loop | neutral anchor A |
| SMALL_WIN | 1.5–2.5 s one-shot | A → gesture → A |
| MEDIUM_WIN | 2.5–3.5 s | A → dance → A |
| BIG_WIN | 3.5–5 s | A → climax → A |
| BONUS | 4–6 s | A → cauldron action → A |

Create optional `A_TO_ACTION` transitions only after the neutral-anchor method is proven insufficient. Pilot needs IDLE, MEDIUM and BIG first; BONUS can use a static placeholder when bonus math is out of scope.

## Production workflow

Canonical still and pose sheet → image-to-video controlled motion candidates → identity/costume/anatomy review → choose frames and trim at anchor pose → temporal cleanup/stabilization → plate/color match → FFmpeg transcodes → ffprobe manifest → browser loop/transition QA → content-addressed storage.

Primary POC generator: Runway API/model available at execution time because it exposes deterministic automation and public per-second API pricing; reserve Luma API. Both commercial rights and content-policy fit must be captured at purchase. Adobe Firefly is the rights-safety reserve for key frames. Tool quality changes rapidly, so model names are recorded per asset rather than hard-coded as permanent architecture.

## Smooth switching

- Every accepted clip begins/ends within tolerance of anchor A: head/shoulder/key landmarks, exposure and background.
- Two `<video>` elements remain aligned in the same plate. Active A plays; standby B is decoded to first frame.
- Requests queue by priority `BONUS/BIG > MEDIUM > SMALL > IDLE`; a higher tier does not interrupt before an allowed exit marker unless deadline forces fallback.
- At loop/exit marker, start B and crossfade opacity/audio-free video over 120–180 ms; then recycle A. POC tunes value.
- Coalesce repeated requests; never show a tier before its domain event. Fast mode shows a short accent or representative static pose and settles immediately.

Pseudo-contract:

```ts
play(state, deadline) -> Promise<{played:boolean; fallback:boolean; reason?:string}>
```

Promise always resolves; media cannot block settlement.

## Encoding matrix

Masters: mezzanine lossless/intraframe, not Git. Runtime candidates: VP9 WebM and H.264 MP4, 24/30 fps, no audio, identical crop/frame count where possible. Generate 1× and low-tier resolution; measure bytes, decode FPS, dropped frames, memory, first-frame and seek/loop seam. Alpha experiments are separate and cannot replace baseline without iOS/Android evidence.

## Preload policy

Critical: IDLE poster + chosen low-tier clip. Near-term: SMALL/MEDIUM. Deferred: BIG/BONUS. Use manifest SHA and AbortController; one active plus one standby decode; unload large unused clips on constrained devices. Respect data-saver/reduced-motion by selecting poster/atlas.

## POC-B pass/fail

Test current Safari iOS, Chrome Android, desktop Chrome/Safari on named real devices. Pass if identity/costume approved in 3 core states; ≥95% of 20 blinded transitions show no hard pose/background jump; loops run 10 minutes without drift/crash; frame-rate floor 30 FPS while board animates; first-frame and total transfer meet DOC-06 budgets. Pivot to atlas if any target browser cannot sustain decode/memory or transition score after two bounded iteration rounds.

## Cost stop-loss

Generation budget proposal $100–250 plus optional editor time; do not purchase before G2. Store rejected-output count and effective cost per accepted second.
