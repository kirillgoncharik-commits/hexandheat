# Issue #20 — dense animation handoff

2026-11-01. Parent baseline M04.1 ba7d1e6370c0b7c331e6f55869d353c4c3953799. PO explicitly requested 25–30 FPS raster or Spine. This branch implements 30 FPS cutout playback and exports 120 frames per state /600 total, 768×1024 with alpha.

Inputs: original M03 character reference, newly generated eight-part Imagegen kit, shared SceneTransport. Outputs: rig data/player, texture parts, deterministic extraction/export tools, Spine 4.2 import candidate, tests, manifest/provenance and dense-animation guide/report. Saved animation archive is outside Git; filename and size are recorded in the report.

Verification: 61 tests pass; browser confirms cutout renderer and 30-FPS sampling metadata. No physical-device frame-rate/AV claim. Source/source-alpha extraction and rig neutral/foot invariants are reproducible. All existing domain/math/replay tests continue to pass.

Risks: paper-doll joint/cloth polish, static expression, rigid lower dress and native Spine import validation. Source PNG needed standard FFmpeg normalization for this Canvas decoder; no semantic retouch was performed. New art rights/content review pending. No purchases, final licensing decision, official Spine runtime integration or Stake upload.

Next action: review the 30-FPS animation in the existing motion lab; compare `witch=legacy` only as a labelled older fallback. Import the Spine candidate into the appropriate licensed editor and refine cloth/facial/joint animation before final art acceptance. Keep Issue #20 open.
