# Issue #31 — M06 handoff

04.11.2026. Branch `agent/animation/31-m06-media-mobile`, base PR #30 / `586d2f399c8d31968955e3d412300dc964c04fa6`; preserved initial local inputs/baseline `05c9d1d`. Exact delivered runtime commit is in published `review-manifest.json`, separate Site source/version in `reports/m06/deployment.json`.

Inputs: attached M06 v1.1 + current issue, M05 report/work task, M03 spec, M04 synchronization/dance/reference, registered original v7 textures. New authored motion curves and deterministic offline raster rendering; no CMU motion sample reuse. No purchases or accepted terms.

Changed: full-width mobile hero/crop and compact cauldron, PNG player/lifecycle, seam window, modal pause ownership, comparison/review/QA pages; authored IDLE/SMALL_WIN 6/8/12 exports, registered manifests/source/provenance; tests/docs/build helper. No math, weights, paytable, outcome, wallet or fixture edits. Old renderer retained; new media opt-in; neutral other three states.

Validation: `python3 tools/verify_milestone.py` 93 PASS; `python3 tools/generate_m05.py --check`; `git diff --check`; 48/48 actual controls; seven viewport budgets/landmarks/targets/long amounts/Potion/modals; 30 real-time desktop loops per state at each rate, zero skipped poses; unit 200 transitions + 30min active-time sampling; real browser F14 Normal/Fast and injected media faults. Logs and snapshots in `reports/m06`. No thresholds weakened. Preview WebM native metadata4s/420×336/120 samples verified; recordings are PNG derivatives, not new motion masters or gameplay screen captures.

Selected delivery: PNG420×336, IDLE6fps/fade40ms, SMALL_WIN12fps/fade20ms, 3.748MiB poster+two sets. CPU+GPU estimate77.52MiB before overhead; no hardware memory measurement. Original AI-art rights/entitlement review inherited and pending; no cleared-rights claim. New code/exporter and original registered textures reconstruct all small committed PNGs; no unique unregistered heavy new master.

Acceptance: technical review package; human art/layout ACCEPTED/REWORK pending. Physical iOS Safari/Android/Safari desktop, cold/warm throttling, thermal/memory and30min device soak UNAVAILABLE. Native Figma untouched. Production math/FS/live recovery/submission remain separate. Do not auto-merge or close issue on technical evidence alone.

Next action: reviewer opens `/media.html`, `/compare.html`, and main `?witch=m06`; PO records separate IDLE, SMALL_WIN and mobile-layout decisions using `docs/m06/REVIEW_PROTOCOL_RU.md`. Fix specific poses if REWORK; run documented physical-device matrix. Only then decide the next bounded package for the remaining three logical clips.
