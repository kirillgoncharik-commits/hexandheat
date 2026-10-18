# Milestone 02 technical report

Date: 2026-10-18  
Issue: #17  
Status: Integrated Technical Prototype ready for stacked review; not production or submission ready

## Repository and governance audit

- PR #14 is open, mergeable, targets `main`, has successful CI and no review.
- PR #16 is open, mergeable, targets PR #14's branch, has successful CI and no review.
- Issue #15 remains open because PR #16 is unmerged.
- Correct order: review/merge #14; retarget/rebase and review/merge #16; then review Issue #17. No direct `main` write or automatic merge occurred.
- Work used an isolated worktree from PR #16; pre-existing edits in the original checkout were untouched.

## Gate A — official SDK integration: technical PASS

`sdk-lock.json` pins Math SDK `a6dccd86de740cc5d318079483cb6204cc5c19bc` and Web SDK `1843d60cedb94b390e641b563f32ad64353bec5e`.

The official scatter unit test passed 3/3. The reduced sample reproduced the bonus payout-hash assertion. Bonus book and LUT were equal; `_payout_ints` accumulated the previous base mode and produced a 200-entry sidecar for a 100-entry bonus book. The committed one-line reset made base and bonus payout hash/count checks pass on a clean rerun. Tiny-sample RTP/volatility warnings were retained.

Hex & Heat exports official `index.json`, weighted lookup CSV and Zstandard JSONL. The review book contains loss, normal win, cascade, multiplier, five-win chain and natural 5,000× cap. SHA-256 evidence:

- book source: `f3daeaf8a2f808ab4b9c034029d210abe5207556ca67c92bfe47ac29022bd886`;
- lookup: `2ac6f2147f1bafa30b3fc08060023a056e53c94f7ef044c0469ee7e2071c89f3`;
- payout array: `c7970b2923cb369b0d91fb9e68b892009092cfa66c5c3d1fe276bfb1ddd50314`.

The independent verifier rejects tampered lookup payout, malformed order and final-payout disagreement. The format-aligned paytable remains explicitly unbalanced and is not a production RTP candidate.

## Web/RGS integration

The default local path implements authenticate → play → end-round and documented replay URL shape. It selects the committed Math outcome, returns official scatter-style BookEvents, and maps them once into the existing presentation contract. Mock RGS is opt-in (`?rgs=mock`).

Live local-browser evidence:

- first $1.00 loss settled balance $100.00 → $99.00;
- next $1.00 book paid $0.30 and settled balance at $98.30;
- Fast Play replayed the same round with balance remaining $98.30;
- desktop and 390×844 emulated layouts rendered;
- no captured console warning/error.

No Studio account, live RGS, wallet or external Stake endpoint was used.

## Gate B — witch/music technology: PARTIAL PASS

- IDLE has four intermediate anchor-A points, reducing the reaction target from 4.2 s to 1.05 s.
- Win/bonus loops still complete a full cycle; priority coalescing and potion-independent FX remain.
- The opt-in synthetic POC generated two safe local clips, played them through two native video layers, preloaded/crossfaded them and retained CSS fallback.
- Temporary Web Audio oscillator stems implement BASE/ENERGY/HOT/BONUS, beat-aligned gain ramps, one-shots, mute and resume.
- Video/audio failure tests demonstrate that settlement continues.

Real Safari/iOS/Android, dual-codec files, decoder memory/FPS, long soak and real audio stems remain unverified and block production media approval.

## Gate C — integrated vertical slice: local PASS

`Verified Math Outcome → Stake-format book → local compatible RGS → BookEvent mapper → board + witch + music`.

Spin, cascades, multiplier, final payout, Fast Play and Replay are covered. Replay issues no new wager. Presentation/media controllers have no wallet or payout write path.

## Automated verification

```bash
python3 tools/verify_milestone.py
```

Current result: 3 repository checks, 14 math/replay/Stake adapter tests and 22 browser/RGS/witch/video/audio tests pass (39 total). Official SDK reproduction is a separate Python 3.12 procedure in the smoke report.

## Actuals, estimate and recommendation

Recorded execution: approximately 1.5 wall-clock agent hours, $0 cash, local CPU/browser only, plus public GitHub and package downloads. No paid tool or final asset was used.

Next validation gate: 40–80 engineering/reviewer hours and $0–$1,500 for approved Studio access, production-scale math exploration/independent review, dual-codec real-device media lab and real-stem audio POC. Final content production remains separately estimated at $2,500–$12,000.

Recommendation: **GO** to technical review and live-RGS/real-device validation. **Do not** start production art/video/music or claim commercial math. Pivot only video to spritesheets if device decode/memory fails; kill if independent payout or platform replay/resume cannot be verified.
