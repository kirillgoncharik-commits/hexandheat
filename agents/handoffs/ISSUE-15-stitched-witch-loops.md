# Handoff — issue #15: stitched witch dance loops

Date: 2026-10-18
Branch: feat/witch-seamless-dance-loops
Parent branch: feat/milestone-1-functional-prototype (unmerged PR #14)

## Product Owner instruction

All dance reactions are multi-second loops and all clips must connect smoothly at universal anchor pose A. A rapid sequence of Spin/Win/Cascade/Potion events may not flicker through character scenes.

## Inputs

- Prototype: apps/web/src/app.js, domain.js, styles.css and fixture-driven Mock RGS.
- Specifications: DOC-02, DOC-08 and DOC-10.
- No third-party code, paid tools or production assets added.

## Deliverables

- `apps/web/src/witch-dance.js`: presentation-only loop scheduler, strongest pending tier, no hard cuts, full-loop completion and fail-safe cleanup.
- `apps/web/src/domain.js`: cue mapper returns null for neutral/no-change events; BONUS only from real bonusStart.
- `apps/web/src/app.js`: two CSS figure layers, incoming loop reset to anchor A, 180 ms crossfade at loop seam, potion aura independent from dance, nonblocking settlement.
- `apps/web/src/styles.css`: 3.6–4.8s cyclic motion with identical 0%/100% neutral body/arm poses.
- `apps/web/tests/witch-dance.test.js`: injected-clock tests for coalescing, no flicker, tiers, failure, and replay safety.
- `apps/web/tests/domain.test.js`, DOC-02, DOC-08, DOC-10 and README updated.

## Verification

Local isolated controller test was run with Node native test runner: 5 checks passed prior to GitHub write. Full repository CI / browser rendering must be verified on the PR; do not claim real-device video smoothness from CSS-only checks.

## Deferred / explicit gates

- Video decoder and true media seam synchronization are still POC-B work.
- Need matching identity, camera, costume, lighting, anchor at first/last frame for ALL videos.
- Waiting up to one 4.2s IDLE loop can delay the reaction; test cue-to-motion latency before art/video production.
- Real audio stems, music mixing, Free Spins, production math and Stake submission remain unapproved.

## Next

Review issue #15 follow-up PR against PR #14's feature branch; merge after tests and PO review. If PR #14 is merged first, retarget this patch onto updated main and re-run CI.
