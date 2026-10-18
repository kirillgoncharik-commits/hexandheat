# Handoff — issue #17: official SDK integration and vertical slice

Date: 2026-10-18  
Branch: `agent/integration/17-milestone-02-sdk-vertical-slice`  
Parent: `feat/witch-seamless-dance-loops` / PR #16

## Inputs

- PR #14 functional prototype, PR #16 seamless witch loops and Issue #15.
- Math SDK `a6dccd86de740cc5d318079483cb6204cc5c19bc`.
- Web SDK `1843d60cedb94b390e641b563f32ad64353bec5e`.
- No paid service, production asset, external account or private secret.

## Deliverables

- SDK pin manifest and minimal Math SDK sidecar reset patch.
- Stake-format candidate, BookEvent adapter, six-case publish package and independent verifier.
- Stake-compatible local RGS/client/event mapper; Mock RGS explicit fallback only.
- 1.05-second IDLE anchors, native-video synthetic POC and CSS failure fallback.
- Temporary beat-aligned Web Audio controller with mute/resume/failure isolation.
- Updated controlled documents, backlog/risk registers and technical report.

## Commands and evidence

```bash
python3 tools/generate_stake_sample.py
python3 tools/verify_milestone.py
cd apps/web && npm start
```

Automated result: 39 checks pass. Browser: desktop and 390×844, Spin, Fast Play, Replay, unchanged replay balance, native-video POC and no captured console errors.

## Assumptions and unresolved risks

- Six rows prove formats/events only; paytable and weights are unbalanced.
- The compatibility patch requires Technical Reviewer approval or an upstream replacement.
- Live Studio active-round resume and account replay remain untested.
- Safari/iOS/Android codecs, memory/FPS and long soak remain untested.
- Real stems, final media, production rights/content review and submission remain gated.

## Licenses / generated content

Official donor repositories declare MIT at the pins. Synthetic video is generated locally from code and is not committed as media. Audio uses Web Audio oscillators. Math artifacts are reproducible from committed source and hashes.

## Exact next action

Review and merge PR #14, then PR #16. Rebase/retarget this branch only after both land; rerun the suite and request Technical Reviewer review for payout/math changes. Next approved engineering action is live Studio RGS plus real-device media validation—not content production.
