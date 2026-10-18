---
id: DOC-14
version: 1.1.0-rc1
date: 2026-10-18
status: MILESTONE_02_IMPLEMENTED_REVIEW_AND_DEVICE_GATES_OPEN
dependencies: [DOC-11, DOC-13]
related: [PILOT_BACKLOG]
confidence: HIGH
---

# Agent-Ready Implementation Backlog

Work Task Milestone 02 authorized Issue #17's bounded SDK-format and temporary media slice. Production content and submission remain blocked. Effort is agent-hours plus reviewer time; cash excludes already-owned tools.

| ID | Task / owner | Depends | Deliverables | Effort / cash | Acceptance / test |
|---|---|---|---|---|---|
| PILOT-01 | Architecture review / PO+Reviewer | docs | ADRs and gate decision | 2–4h / $0 | **Current Gate 1 review** |
| PILOT-02 | Pin SDKs & schemas / Integration | 01 | SHA evidence, event/asset schemas | 8–12h / $0 | **Complete:** pins + diagnosed compatibility patch |
| PILOT-03 | Functional evaluator / Math | 02 | 6×5 scatter, cascade, multiplier test model | 16–24h / $0 | **Complete:** seeded tests + invariants |
| PILOT-04 | Local books/verifier / Math+Reviewer | 03 | immutable book/hash/report and independent check | 12–20h / $0–900 | **Technical complete:** official-format six-case book; human sign-off open |
| PILOT-05 | Character key / Art | 01 | adult-safe canonical sheet, provenance | 8–12h / $30–80 | human identity/content approval |
| PILOT-06 | POC-B motion / Animation | 02,05 | 3 states, 2 codecs, atlas fallback, benchmark | 20–30h / $100–270 | DOC-08 pass or explicit pivot |
| PILOT-07 | POC-C stems / Audio | 01 | 3 phase-aligned stems, rights record | 8–12h / $50–150 | sample/loop inspection passes |
| PILOT-08 | POC-C runtime / Frontend Audio | 02,07 | scheduler, transitions, suspend/mute tests | 12–18h / $0 | **Controller complete:** temporary oscillators; real stems/device soak open |
| PILOT-09 | Responsive shell / UI | 02 | desktop/portrait/popout shell | 16–24h / $0 | **Complete:** primitive desktop/portrait prototype |
| PILOT-10 | POC-D vertical slice / Integration | 04,06,08,09 | one deterministic round across all systems | 20–30h / $0 | **Technical complete:** official outcome/RGS/board/witch/music; review open |
| PILOT-11 | QA/perf/compliance / QA | 10 | device/chaos/security report | 12–20h / $0–200 | no critical blocker; budgets measured |
| PILOT-12 | Forecast & gate / Producer | 04,06,08,11 | actual cost/time, human gaps, recommendation | 6–10h / $0 | PO records GO/PIVOT/KILL |

## Required issue body fields

Each GitHub Issue expands its row with required reading, exact input commits/checksums, selected tools, cost cap, test commands, Definition of Done and handoff target. Dependencies are blocking: downstream work may prepare fixtures but cannot claim completion before upstream acceptance.

## First ready assignments after Milestone 02 review

Technical Reviewer: review the sidecar patch, payout-unit transform and event mapping. Integration/QA: connect an approved Studio session and test interrupted active rounds/replay URLs. Device QA: measure Safari/iOS/Android video/audio behavior. Math Reviewer: run a production-sized candidate only after the target paytable/metrics are approved. No paid or final media work starts before its explicit gate.
