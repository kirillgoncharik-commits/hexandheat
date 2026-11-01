# Issue #20 — M04.1 first implementation handoff

Date: 2026-11-01. Status: code/art/docs implemented for review, milestone still open.

## Inputs / authorization

PO: «начинаем разработку кода, арта и документации по мл 4». Base: M03 b7b88761c64439b09c45d4bbbe9720543681f52f. Scope: PR #22 / 1535bb3fbf3bd770671a4c5364ec41adb1e83da2. Dedicated branch `agent/presentation/20-m04-scene`; older PRs and main remain unmerged.

## Changed outputs

- SceneTransport, CueDirector, BoardPlayer, ScenePresentation, ModalManager and shared motion tokens.
- App/witch/raster/music integration, visibility/BFCache handling, result and BONUS-fixture windows.
- Motion lab: sample scenes, modes, pause, fault injection, viewports, phase/trace and SVG download.
- Original M04 20-pose atlas in WebP; manifest v3, prompt/provenance record; M03 fallbacks retained.
- M04 scope/work task status, ADR, motion guide, editable SVG plus generator, implementation report and tests.

## Commands / evidence

`python3 tools/verify_milestone.py` passes: 58 tests and repository validation. `python tools/generate_motion_board.py` reproduces both SVG copies. `git diff --check` and Markdown link checks run before commit. Browser samples verified 100→107→106 with replay unchanged; Big Win motion fixture displays 20.00; settings, Reduced Motion, pause/resume and responsive frames exercised. See reports/MILESTONE-04-REPORT.md for exact verification limits.

## Risks / assumptions / licenses

No production math change or release-readiness claim. Runtime audio is synthesized POC. Four-pose art remains coarse; all visual seams/rights/content need review. Native Figma page, real devices, physical AV/input measurements and human perception acceptance remain pending. Sparse-frame transitions use the first shared neutral raster pose after a seam while preserving a minimum 4000ms protected entry; dense Spine needs a separate marker policy. Some inherited sample boards require explicit reconciliation.

No new paid dependency, purchase, legal acceptance or Stake upload. Original artwork generated with built-in OpenAI tool; provenance/terms and unknown model/plan recorded, rights approval not claimed.

## Exact next action

Review the synchronized sample scene and atlas. Import the editable motion SVG and atlas into the existing native Figma file when tooling is available; run device/AV/UX acceptance. Keep M04.2 platform blockers explicit and Issue #20 open. Hosting preserves the existing Site's observed public access; only sample outcomes are deployed.
