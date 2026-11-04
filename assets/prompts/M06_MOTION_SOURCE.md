# M06 authored motion provenance

- Date: 2026-11-04; Issue #31; author: Codex offline staging.
- Tool: Node.js 24.9.0, bundled `@napi-rs/canvas` 0.1.100 and `sharp` 0.35.5; original repository mesh/skeleton functions. No new generative model or external motion source. No purchases, external service account, terms acceptance or licensed Spine Runtime.
- Art references: `apps/web/assets/witch/reference-cycle/layers-v7.json`, its registered body/head/leg textures, `assets/prompts/M04_SHOULDER_REPAIR.md`. Original v7 art provenance/entitlement uncertainty remains inherited; no new cleared-rights claim.
- Source: editable `apps/web/src/m06-motion-source.js`, eight storyboard moments for each four-second phrase, cubic Hermite channels, common periodic breathing, delayed hair/cloth, localized face-mesh eye closure and small mouth-corner displacement. Existing CMU/rig animation arrays are not used.
- Renderer: `tools/export_m06_media.mjs`; canonical triangles are rasterized using deterministic pixel-centre barycentric coordinates and premultiplied bilinear texture sampling, avoiding per-triangle Canvas antialias cracks. Shared camera `[90,105,900,720]` and uniform `7/15` scale give 420×336.
- Delivery: alpha-preserving 256-entry indexed PNG derivatives (`palette=true`, `colours=256`, `dither=.2`, `effort=10`, `compressionLevel=9`). Original full-RGBA pre-quantization pixels are reproducible from registered textures, motion source and exporter. Palette compression may need human edge/flicker review.
- Timebase: exact direct samples `i/fps` for 6/8/12; 24/32/48 displayed PNGs. Separate 4.00s control endpoint is never displayed. No duplicated endpoint hold.
- Register: `apps/web/assets/m06/manifest.json` records source hash, art/source/export hashes, each ordered frame path, timestamp, hash, byte count, delivery face landmarks and budgets. The reproducible small delivery files are tracked; no unregistered heavy motion master is required for reconstruction.
- Reproduction: `CODEX_PRIMARY_RUNTIME_NODE_MODULES=<bundled node_modules> node tools/export_m06_media.mjs`. Optional positional output directory; `--preview` renders 8 FPS only as technical preview and must not replace a full manifest for publication.
- Status: EDITED — ART REVIEW REQUIRED; no human acceptance, physical-device measurement, video master, native Spine/editor or certified production-rights claim.
