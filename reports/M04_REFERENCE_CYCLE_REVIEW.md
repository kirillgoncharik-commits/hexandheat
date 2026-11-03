# Reference cycle review — 2026-11-02

Baseline: PR #27, `1c2170e6229e871fb48cc48ed986699545412fb8`. User accepted the plan to repair source preparation and adapt real dance motion; user confirmed no Spine license is available. Work is an isolated review candidate on `agent/animation/20-reference-cycle`, with no automatic merge or game-renderer replacement.

## V7 shoulder repair — supersedes v6 source assembly

User rejected the v6 shoulder/dress overlap. Two new registered Imagegen masters now supply a connected shoulders/arms/corset/skirt painting and a clean head/hair source without attached clothing. V6 textures and renderer remain intact for a synchronized before/after comparison. The review page defaults to this comparison and a shoulder close-up.

The new body uses alpha-traced adaptive triangles, with edge/interior sampling to preserve the narrow underarm gaps. Shoulder caps follow the chest and blend into arm controls; the separator follows the source gap, keeping sleeve edges off the waist and skirt edges off the arms. Two elbow support controls preserve sleeve volume. A disjoint hand/front partition shares the body vertices/weights, avoiding independent shoulder patches. Four textures, five draw partitions, 24 bones, 32617 exported vertex entries (body arrays shared between two partitions), 22125 triangles. No source rescaling.

Verification: `tools/verify_milestone.py` passed 3 repository/asset +14 math/replay +56 JavaScript =73 tests. Six reference tests cover registered bind reconstruction, raw/loop retention, all three motions in both modes across all121 keys, continuous shoulder/draw partition boundaries, arm/skirt separation, a narrow alpha-slit regression, and independently traversed exported bone/skin transforms. Tests validate data and geometry, not artistic quality.

Desktop browser inspection: A loop at2.40s, B raw at3.20s, C loop at1.60s, synchronized with v6. The v6 shoulder caps and dangling costume fragments are absent in the repaired assembly; underarm cloth spikes found during iteration were removed by contour-aware topology and corrected edge weights. Source assembly also rendered on dark/off-white/gray. Final public comparison: `/reference?v=7`. Native editor validation, human art acceptance, strong-foreshortening hand fixes and the remaining state cycles stay open.

Rebuild source crops/contours with `tools/prepare_continuous_art.mjs` using the preserved masters; export the import candidate with `tools/export_reference_cycle.mjs <external-output-directory>`. Masters/prompts/checksums and corrected source package are documented in `assets/prompts/M04_SHOULDER_REPAIR.md`.

## V6 delivery history — rejected shoulder assembly

- Three original whole/setup, garment-overlap and hidden-leg Imagegen paintings; exact prompts and master hashes recorded. Heavy masters retained outside the Git checkout, and included in the local source package.
- Six registered working PNGs, 1024×1536 source geometry, no per-part aspect scaling. One connected garment, complete sleeves crossing the elbow, collar overlap and covered leg reconstruction. Static assembly checked on dark/off-white/gray.
- Real CMU 49_12, 05_12 and 05_02 data, SHA-verified pinned BVH source and reproducible FK/loop processing. Raw and corrected arrays retained separately. 49_22 was a research probe and excluded from the final comparison because it mainly held a balance.
- Art-only `/reference.html`: three candidates, source/loop comparison, shared phase, pause/step/scrub, setup, mesh overlay, game-size and Reduced Motion. Existing `/dance.html` links to it. Main game renderer and domain/math/wallet code untouched.
- One 4s/30Hz weighted-mesh Spine 4.2 import candidate, 22 bones, 870 vertices, 1456 triangles; 121 keys including endpoint, six PNG pages, atlas and import instructions.

## Verification actually performed

`tools/verify_milestone.py` passed: 3 repository/asset +14 math/replay +54 JavaScript =71 tests. Four new tests verify exact bind reconstruction, separately retained raw/closed source data, all retarget poses, and an independent traversal of exported noScale bone transforms and weighted vertices against preview geometry at six phases. This is data/math validation, not official editor validation.

`python3 tools/motion/bvh_motion.py` passed synthetic channel-order, parent FK, End Site, shortest-arc SLERP and interleaved-channel cases. `prepare_reference_motions.py --check` reproduced all three runtime JSONs byte-for-byte. `git diff --check` passed.

Browser: local IAB rendered the new page; paused/scrubbed A at1.60s, B at1.60s and C at3.20s. Setup+wire overlay displayed the registered source assembly. Reduced Motion changed the displayed sample to0.00s; game-size view remained legible. Screenshot evidence records C at3.20s on the same phase/camera as the manikin. This is desktop browser evidence; mobile layout, real-device FPS, AV timing, long soak and all25 state transitions are not measured here.

An initial transfer using attenuated projected angles and fixed limb lengths visibly directed forearms into the chest. Corrected to full projected angles and per-segment axial foreshortening; child-joint placement, skin vertices and export all use the same transform. Arms are drawn in front of hair for the chosen frontal phrase. No claim that all shoulder/hand intersections are fixed.

## Remaining blockers and art limits

- No licensed Spine editor installed, and user has no license. No native `.spine`, editor import/re-export, or licensed Spine runtime integration. The package is explicitly an import candidate. No purchase or acceptance of commercial terms performed.
- Source art is a new reconstruction, requiring face/costume identity approval. Hair/shoulder/sleeve intersections and hand orientation under strong foreshortening still need manual work.
- Projection ratio is clamped at0.58; some forearm frames have source ratios near0.26, so those frames are deliberately approximate and need redraw/pose correction. The manuscript and UI make no full3D-rotation claim.
- IK uses art lengths and limited target height, not a full sole-contact solver. Some original captured poses cross legs or hold still; cloth follow is authored and subtle. No face/finger capture or animation.
- Raw→loop preparation has a0.4s overlap and0.9× playback. Pose seam is closed, but captured noise and velocity variation remain. Human loop/character review remains open.
- Other four states, common state anchor and transitions are not generated from this study. Do that only after one loop is approved. M04 animation and release gates remain open.

Next concrete action after source review: refine shoulder/hair masks and forearm/hand depth poses, then import/save in Spine Professional when available. Do not promote this prototype to the game default on the strength of passing tests.
