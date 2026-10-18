---
id: DOC-14
version: 0.9.0
date: 2026-10-18
status: READY_AFTER_G1
dependencies: [DOC-11, DOC-13]
related: [PILOT_BACKLOG]
confidence: HIGH
---

# Agent-Ready Implementation Backlog

Every task is blocked by G1 unless it is documentation/review. Effort is agent-hours plus reviewer time; cash excludes already-owned tools.

| ID | Task / owner | Depends | Deliverables | Effort / cash | Acceptance / test |
|---|---|---|---|---|---|
| PILOT-01 | Architecture approval / PO+Reviewer | docs | signed ADR decisions | 2–4h / $0 | PR approved; open questions assigned |
| PILOT-02 | Pin SDKs & schemas / Integration | 01 | lock/SHA manifest, event/asset schemas | 8–12h / $0 | clean setup; schema tests pass |
| PILOT-03 | POC-A evaluator / Math | 02 | 6×5 scatter, cascade, multiplier test model | 16–24h / $0 | seeded tests + invariants |
| PILOT-04 | POC-A books/verifier / Math+Reviewer | 03 | small books/CSV/hash/PAR and independent check | 12–20h / $400–900 | exact lookup/book match and recomputed RTP |
| PILOT-05 | Character key / Art | 01 | adult-safe canonical sheet, provenance | 8–12h / $30–80 | human identity/content approval |
| PILOT-06 | POC-B motion / Animation | 02,05 | 3 states, 2 codecs, atlas fallback, benchmark | 20–30h / $100–270 | DOC-08 pass or explicit pivot |
| PILOT-07 | POC-C stems / Audio | 01 | 3 phase-aligned stems, rights record | 8–12h / $50–150 | sample/loop inspection passes |
| PILOT-08 | POC-C runtime / Frontend Audio | 02,07 | scheduler, transitions, suspend/mute tests | 12–18h / $0 | timing thresholds pass |
| PILOT-09 | Responsive shell / UI | 02 | desktop/portrait/popout shell | 16–24h / $0 | DOC-06 matrix readable |
| PILOT-10 | POC-D vertical slice / Integration | 04,06,08,09 | one deterministic round across all systems | 20–30h / $0 | normal/fast/replay converge |
| PILOT-11 | QA/perf/compliance / QA | 10 | device/chaos/security report | 12–20h / $0–200 | no critical blocker; budgets measured |
| PILOT-12 | Forecast & gate / Producer | 04,06,08,11 | actual cost/time, human gaps, recommendation | 6–10h / $0 | PO records GO/PIVOT/KILL |

## Required issue body fields

Each GitHub Issue expands its row with required reading, exact input commits/checksums, selected tools, cost cap, test commands, Definition of Done and handoff target. Dependencies are blocking: downstream work may prepare fixtures but cannot claim completion before upstream acceptance.

## First ready assignments after approval

Integration Agent: PILOT-02. Math Agent: PILOT-03 only after 02. Art Agent: PILOT-05. UI Agent may draft layout tokens after 02; Animation and Audio may not purchase/generate until G2. Technical Reviewer prepares independent criteria before seeing author implementation.
