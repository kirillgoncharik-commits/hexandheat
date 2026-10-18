---
id: DOC-13
version: 0.9.0
date: 2026-10-18
status: ESTIMATE_FOR_APPROVAL
dependencies: [DOC-05, DOC-08, DOC-09, DOC-12]
related: [DOC-14, RISK_REGISTER, PILOT_BACKLOG]
confidence: MEDIUM_LOW
---

# Production Plan, Budget & Risk Register

## 10-working-day pilot

| Day | Work and dependency | Evidence / PO checkpoint |
|---:|---|---|
| 1 | approve ADRs, targets, content and spend gates | G1 decision; unresolved choices logged |
| 2 | pin SDKs/toolchains; event schemas and fixtures | reproducible environment + contract tests |
| 3 | POC-A 6×5 evaluation/cascade/multiplier in Math SDK | deterministic unit/property tests |
| 4 | POC-A small books/CSV/replay fixtures; verifier | hash/RTP/invariant report |
| 5 | POC-B canonical character + 3 motion states | content/identity checkpoint |
| 6 | transcode, double-buffer transitions, mobile benchmark | GO/PIVOT video decision |
| 7 | POC-C 3 synchronized stems and Web Audio scheduler | loop/sync/suspend report |
| 8 | responsive shell and board/witch/audio integration | desktop/mobile review |
| 9 | POC-D event-driven vertical slice; replay/fast/mute | integrated evidence |
| 10 | device/chaos QA, cost forecast, human-needs audit | GO/PIVOT/KILL review |

Parallelism is allowed only after Day 1: Math track (2–4), video (5–6), audio (5–7) and UX shell (2–8); integration waits on all. Daily output is a PR/handoff, not a status paragraph.

## Pilot budget (USD, planning ranges)

| Category | Low | Expected | Cap before reapproval |
|---|---:|---:|---:|
| AI video/image generations | 100 | 250 | 350 |
| AI music/SFX generation | 50 | 150 | 250 |
| Object storage/CDN test | 0 | 25 | 50 |
| Optional real-device/cloud testing | 0 | 100 | 200 |
| Independent math/human specialist | 400 | 900 | 1,500 |
| Human cleanup/editor/composer reserve | 0 | 500 | 1,000 |
| **External cash** | **550** | **1,925** | **3,350** |

Owner/agent labor: approximately 100–160 combined agent-hours plus 20–35 Product Owner/reviewer hours; not priced as cash unless outsourced. Vendor prices/terms are checked on purchase day. No purchase is authorized by this estimate.

## Beyond pilot

- Lean playable MVP: 4–7 weeks after GO, expected external cash $3k–$9k plus owner labor; largest variables are accepted character seconds, art cleanup and math review.
- Submission-ready candidate: 8–14 weeks after GO, $8k–$25k external cash; includes full assets, human polish, device QA, independent math/compliance. This is an AI-first range, not a promise and not the inherited $20–35k assumption.
- Traditional small studio comparator: materially higher labor cost but lower supervision/consistency risk; obtain quotes after POC rather than inventing a universal number.

## GO / PIVOT / KILL

GO: all four POCs meet measurable criteria, expected completion ≤approved envelope and no unresolved compliance/licensing blocker. PIVOT: product loop works but video, audio or UI fails—swap only failing subsystem (spritesheets, conventional score, simpler layout). KILL: deterministic math/integration cannot be verified, adult content cannot pass review, mobile performance remains below floor after two bounded iterations, or forecast exceeds PO cap without credible retention value.

## Critical risks

See [RISK_REGISTER](RISK_REGISTER.md). Immediate stop-loss: two paid generation rounds per state; two codec/layout optimization rounds; no full asset set before POC-D; no bonus math before base verifier passes.
