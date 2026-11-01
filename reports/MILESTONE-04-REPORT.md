# M04.1 implementation report

Date: 2026-11-01. Parent: Issue #20. Status: **FIRST CODE / ART / DOCUMENTATION SLICE FOR REVIEW**. M04.1 acceptance and M04.2 release readiness remain open.

## Authorization and baseline

PO explicitly requested starting M04 code, art and documentation. Implementation extends the existing M03 stack at `b7b88761c64439b09c45d4bbbe9720543681f52f` on a separate branch. Main and older PRs are not auto-merged. Scope input is PR #22 / `1535bb3fbf3bd770671a4c5364ec41adb1e83da2`.

## Implemented

| Package | Current evidence |
|---|---|
| SYNC-01 | Shared active-time SceneTransport, ordered per-frame subscribers, round-owned CueDirector, required completion/deadline/cancellation, bounded trace |
| SYNC-02 | Persistent board nodes, canonical survivor mapping, reveal/highlight/count/read/remove/fall/refill/settle; predecode symbol assets with deadline/text fallback |
| SYNC-03 | Shared controller/raster phase, all 5 body states 4000ms; previous pending reactions cleared on new round; protected active entry and sparse-frame neutral-pose recovery |
| SYNC-04 | Generation-owned ModalManager, native focus trap, synchronized panel/backdrop/duck; settings/rules, Big Win and clearly labelled BONUS motion fixture |
| SYNC-05 | Scene/audio mapping, common tier-to-mood policy, strongest mood retained within round, keyed one-shots, mute/duck/visibility handling; no forced BASE on network/presentation finally |
| SYNC-06 | Active-time pause/resume, page lifecycle/BFCache policy, Fast/Reduced/Replay presentation paths and renderer timeout fallback |
| DESIGN-01 | New original 4×5 witch atlas, 2 generation passes, alpha WebP export, manifest/provenance; motion guide and reproducible editable SVG board |
| QA-01 | Motion lab with sample selection, phase/mood readout, pause/resume, 200ms fault injection, responsive frames and trace download; automated contract tests and browser smoke |

The implementation uses a small transport-controlled tween adapter instead of WAAPI. Rationale and the exact late-frame policy are in [ADR](../docs/m04/ADR_SCENE_TRANSPORT_RU.md). This is a raster-specific neutral-pose recovery policy, not permission to cut a protected body cycle or a ready-made Spine implementation.

## Verification

`python3 tools/verify_milestone.py`: repository validation plus **58 tests**: 3 repository/asset, 14 math/replay and 41 JavaScript. Meaningful new coverage includes shared timestamps, active-time pause, exact-once cancellation/fallback, 25 ordered body state pairs, stale previous-round reactions, sparse/jittered frames, canonical/noncanonical board targets, modal interruption, audio deduplication and final-state convergence through the real CueDirector.

The prior inventory test explicitly expected the 33 M03 assets. It now expects manifest v3 and 34 assets, including the 20-cell/4000ms M04 atlas; byte/hash/uniqueness/rights checks remain in place. No math implementation, sample payout or generated math book changed.

Browser smoke on managed desktop Chromium:

- Main sample win: balance 100 → 107 for bet 1 / payout 8; next Fast loss → 106; replay retained 106.
- Settings open/close and Reduced Motion exercised; one native modal owns focus.
- Motion fixture Big Win shows exact 20.00 in the result window without wallet changes.
- Pause in the Potion sequence freezes scene/body/required presentation together; resume continues the current presentation.
- Responsive iframe checks cover desktop plus mobile/compact sizes; these are viewport checks, **not real-device certification**.
- Captured console errors seen during smoke originate from the browser extension metadata channel, not the application. Physical AV skew and p95 input timing have not been measured.

The first browser pass exposed a too-narrow late-frame seam window that could retain a dance for extra cycles at sparse frame rates. The controller now accepts a late frame only while the common first raster pose is visible and at least 4000ms has elapsed since the protected entry; it retries inside the same neutral window. A dedicated sparse/jittered-frame regression test was added. Human visual seam review is still required.

A sampled managed-browser iframe trace showed roughly 1-second render intervals and two safe cascade deadline fallbacks in an early pass. Sub-timelines now use absolute anchors, numeric read holds begin after actual value commit, and deadline slack adapts to observed frame spacing with a 3000ms cap. The early trace is retained as regression evidence, not a smooth-frame performance claim. The final trace completed all 7 cues with no deadline fallback; body entries were IDLE at 0, SMALL at 4104.8ms, MEDIUM at 8670.4ms and IDLE at 12736.3ms (see the JSON trace for exact values).

The 30-minute no-drift check uses a deterministic clock simulation. It is **not** a 30-minute physical-device soak.

## Art

`witch-atlas-m04.webp`: 1122×1402 RGBA, 367012 bytes; 4 columns ×5 states, 4 poses/state. First pass was rejected for insufficient padding, second selected as a refined animatic. Existing 20 PNGs remain a fallback. Original M03 asset hashes are unchanged. Prompt text and limitations: [M04_PROMPTS](../assets/prompts/M04_PROMPTS.md).

The common first pose and identity are improved but approximate. Four raster poses do not provide production-quality smooth body motion. Some hand/hem/silhouette differences remain. All 25 actual visual seam pairs and adult-character/content review require human acceptance. No final licensing or Stake art approval is claimed; no real Spine rig or paid purchase was made.

## Figma and motion documentation

Native Figma tooling is unavailable in this session. The existing native Figma file was **not modified**. The editable [motion board](../design/M04_MOTION_BOARD.svg), its [generator](../tools/generate_motion_board.py), [motion guide](../docs/m04/MOTION_GUIDE_RU.md), runtime tokens and atlas are ready to import into `M04 / Motion & Timing`. The SVG can be downloaded from the motion lab. S01–S30 IDs and the existing player journey remain the reference.

## Review hosting

The existing Site is reused with explicit mock sample outcomes. Its current access was inspected and is **public**, despite earlier conversation descriptions calling the preview private. Access settings are preserved; this build has no live wallet, real funds or Stake distribution. The URL retains its existing M03 slug while displaying M04 content. Deployment status/version are recorded in the implementation handoff after publication.

## Remaining acceptance work

1. Native Figma motion page and node links; designer review of timing and all 25 visual seams.
2. Real iPhone/Safari and Android/Chrome, physical AV/input measurements, 30-minute device soak and 4–6-person perception comparison.
3. Late/decode-failure browser scenarios beyond the automated stub/deadline coverage; compare current main-thread performance on target hardware.
4. Final music/stems/SFX and sound-design review. Current oscillators demonstrate scheduling and ownership only.
5. Replace or regenerate noncanonical historical motion fixtures for production-style gravity. Current renderer logs board.reconcile and always commits the authoritative target.
6. Max-win, real bonus intro/retrigger/summary, complete platform error/recovery and public replay integration. The current BONUS window is a motion fixture only.
7. All original M04.2 production math/rules/session/wallet/resume/replay/content/release packages retain their gates. Inherited live RGS recovery/ambiguous settlement weaknesses remain blockers for any production use.

Next implementation step: native design integration and perception review, then close the remaining motion/device evidence before proceeding to the gated platform release work. Do not close Issue #20 or declare launch readiness based on this slice.

## Published review build

Implementation PR: https://github.com/kirillgoncharik-commits/hexandheat/pull/23 . Code/art commit: `6127739fde01d58f855ef06c2b62a3f62897f185`. Existing Site version **2** deployed successfully: https://hex-and-heat-m03.kirill-goncharik.chatgpt.site . Deployment `appgdep_6ae7798ebba88191b0607ca65b5b9313`; source `661b6ffaddad2bbd489b9bd4f677165ea2bc3885`. Public sample-only audience is unchanged.
