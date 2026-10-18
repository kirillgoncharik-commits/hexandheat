---
id: DOC-13
version: 1.1.0-rc1
date: 2026-10-18
status: UPDATED_AFTER_MILESTONE_02_TECHNICAL_PROTOTYPE
dependencies: [DOC-05, DOC-12]
related: [DOC-14, RISK_REGISTER, PILOT_BACKLOG]
confidence: MEDIUM
---

# Production Plan, Budget & Risks

## Corrected 10-working-day pilot

The critical path is math/events → browser integration → replay → QA. Final art,
video and music do not belong in the first ten days. A placeholder interaction
spike may start only after the Product Owner accepts the functional gate.

| Day | Owner agent | Work | Output and acceptance |
|---:|---|---|---|
| 1 | SDK Integration | Pin official repositories; build donor register; verify toolchains | SHA/license register; Web and Math sample commands recorded |
| 2 | Architecture + QA | Lock domain-event contract, units, phase gates and CI | schemas/ADRs; clean one-command validation |
| 3 | Math | 6×5 evaluator, ≥8 scatter wins, cascades | deterministic unit tests and explicit candidate inputs |
| 4 | Math + independent verifier | Potion timing, round multiplier, immutable books/replay | recomputation catches tampering; seeded report reproducible |
| 5 | Frontend | Primitive responsive board, spin and test balance | desktop/portrait shell runs with no production assets |
| 6 | Frontend + Integration | Consume precomputed events, show win/multiplier/cascades | presentation contains no payout/RNG logic |
| 7 | Integration | Exact replay and mock RGS settlement boundary | replay produces no wallet/session mutation |
| 8 | QA | Fast play, malformed data, keyboard/mobile/reduced-motion | normal/fast/replay converge; invalid outcome fails closed |
| 9 | SDK Integration | Map contract to official BookEvents and local RGS tooling | official adapter branch/build; blockers evidenced |
| 10 | Technical Review + PO | Full regression, known issues, budget and gate review | PR with GO/PIVOT/KILL recommendation |

Days 1–9 are now represented by the stacked technical prototype. The Math SDK
failure is isolated to accumulated sidecar payouts and passes after the committed
one-line compatibility patch. Day 10 remains Product Owner and Technical Reviewer
approval; PR #14 and #16 must land before the Milestone 02 PR.

## Cost model (USD, planning ranges; no spend authorized)

| Phase | Calendar after approval | External cash | Owner/reviewer time | Main uncertainty |
|---|---:|---:|---:|---|
| Functional prototype | 1–2 weeks | $0–$900 | 12–25h | independent math review and SDK blocker |
| Interaction prototype | 1–2 weeks | $0–$750 | 8–18h | real-device video/audio tests, small POC assets |
| Art/video/audio production | 3–7 weeks | $2,500–$12,000 | 20–50h | accepted character seconds, rights, cleanup, stems |
| Commercial release/QA | 2–5 weeks | $3,000–$13,000 | 20–45h | math certification, devices, compliance, revisions |
| **Total donor-based path** | **7–16 weeks** | **$5,500–$26,650** | **60–138h** | gate outcomes dominate |

AI/tool subscriptions, generation credits, storage and device-cloud charges must
be itemized from current provider quotes at the spend gate. No provider price or
commercial right is assumed from marketing copy.

## Donor-based versus from-scratch

| Approach | Engineering effort | Integration risk | Cash tendency | Decision |
|---|---|---|---|---|
| Donor-based official SDK path | lower for RGS, replay, components and formats | upstream pin/sample drift | lower until polish | preferred |
| From scratch | highest; must recreate and prove platform contracts | high approval and replay risk | higher engineering cost | reject unless a documented SDK blocker persists |

The donor approach does not eliminate independent math, rights review, final
device QA or human quality judgment.

## GO / PIVOT / KILL

- **GO:** local functional checks pass, official adapter plan is credible, no
  license blocker and forecast stays inside the approved phase cap.
- **PIVOT:** mechanics/replay work but an SDK, video, audio or UI subsystem fails;
  replace only that subsystem and preserve the event contract.
- **KILL:** deterministic payout/replay cannot be verified, Stake requirements or
  adult-content review cannot be satisfied, or forecast exceeds the PO cap with
  no credible commercial case.

## Milestone 02 actuals and next-stage estimate

Recorded execution used approximately 1.5 wall-clock agent hours, local CPU/browser resources, two public SDK clones and one isolated Python dependency install. Cash spend was **$0**; no paid generation, external media, account, wallet or Stake service was used. This timing is automation elapsed time, not a human-equivalent estimate.

Recommended next gate: 40–80 engineering/reviewer hours and $0–$1,500 cash for a live Studio session, production-sized math experiment, independent math review, dual-codec synthetic/device lab and real audio-stem POC. Final art/video/music production remains the existing $2,500–$12,000 planning range and requires a separate purchase/rightsholder decision.

Current recommendation: **GO for review and real-device/live-RGS validation; do not enter content production yet**. PIVOT only the video runtime to spritesheets if mobile decode/memory fails. KILL remains appropriate if independent payout verification or platform replay/resume cannot be closed.
