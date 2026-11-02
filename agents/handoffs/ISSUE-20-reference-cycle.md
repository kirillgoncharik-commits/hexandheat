# Issue #20 — real-motion reference cycle

2026-11-02; baseline PR #27 /1c2170e6229e871fb48cc48ed986699545412fb8. PO accepted repair/adaptation plan and confirmed no Spine license. Dedicated branch: agent/animation/20-reference-cycle.

Inputs: M03 frame10 and prior head identity reference; three new registered Imagegen master edits; pinned CMU BVH conversion commit09a07f54f3bbb58797325f009282d0b2048a2871. No synced project sources edited.

Outputs: reference.html+preview modules, six registered PNGs/layers descriptor, three real-motion derived JSONs, deterministic motion/art/export tools, manifest/provenance, weighted Spine-import package and review documentation. Main game/math/wallet untouched. See docs/m04/REFERENCE_CYCLE_RU.md and reports/M04_REFERENCE_CYCLE_REVIEW.md for exact evidence and limitations.

Validation:71 required tests, BVH synthetic FK tests, byte-exact regeneration of all three source arrays, bind geometry and independent export traversal, desktop browser phase/control checks. No real-device or native-editor claim. All old checks retained; manifest expectation updated for ten new registered assets.

Rights: original generated project art; tool version/account entitlement unknown, human review pending. CMU permits use inside commercial products but prohibits sale of data itself; preserve CMU/NSF/Bruce Hahn credit. No purchased packs, accounts, accepted commercial terms or third-party code executed.

Heavy masters and source ZIP are outside checkout at ../hexheat-reference-cycle-media. Preserve them before cleanup; they are not a managed-worktree archive. Runtime working assets and checksums are in Git. Raw BVH remain ignored research inputs, downloadable from pinned hashes.

Exact next action: artist reviews three phrases and repaired static source; refine shoulder/hair and foreshortened forearm/hand poses. When a licensed Spine Professional editor is available, import candidate JSON, verify weights/constraints/draw order, save native.spine and re-export with pinned runtime. Only then consider promotion and four remaining states. Art/native gates stay open.
