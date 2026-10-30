# Issue 19 handoff

Inputs: PO instruction 2026-10-30, prior context and Stake research, current GitHub stacked PRs, official public Stake documentation, user-selected Figma team.

Read docs/m03/MASTER_SPEC_RU.md first; M03 overrides older video and mixed-duration proposals. Production math stays unchanged. Do not auto-merge old PRs or submit the game.

Implementation: apps/web original raster UI, RasterWitchPlayer, 20 character frames/12 item images/background, screen library and content contract. Asset manifest and prompt record contain hashes/provenance and human-review gaps. Figma is a real editable design file, not an imported screenshot.

Verification: python3 tools/verify_milestone.py passes 42 checks; see reports/MILESTONE-03-REPORT.md for browser evidence and limits.

Next action: PO reviews main scene, all 30 state layouts and first art pass; art reviewer resolves identity/seam/crop issues. M04 issue #20 contains architecture, math/RGS/public replay/bonus/content/device QA requirements. Its implementation and submission are not automatically started by M03.

Figma final status and compact/replay evidence will be appended after the current refinement finishes.

Final status: Figma refinement finished; 30 desktop + 8 mobile + 2 compact layouts preserved, journey branches/coverage notes and 33 original assets in section 03. Native layer tree and S03 1440×900 frame/image fills were inspected. All viewport fixtures (390×844 / 360×640 / 480×320) have 30 cells and exact document dimensions without scrolling. Mock spin settled at $107 from $100 on a $1/$8 outcome; replay kept $107; no failed images or application warnings/errors. Private review hosting succeeded. See PR #21. UI copy/layout and animation art remain first-pass review material; no production math/sign-off was claimed.
