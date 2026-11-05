# M07 — first field / scenario / key-pose review

2026-11-05 · Issue #33. Runtime continues PR #32 `7392b93`, with no merge of the existing stack. This is a first M07 review increment; full visual beta acceptance remains OPEN.

Implemented: 27 reproducible B cases/variants and preserved F01–F14; 45 symbol tiers +135 boundary cases; a main-screen selector, Next, exact replay and deterministic seeded manual playlist; per-group scatter focus and paid formula, Potion routes from real positions, persistent survivors with clean classes, settled hold, paid-only cap explanation and differentiated temporary audio. Default neutral character isolates field review. Marker inspector (`?fixture=B05&inspect=1`) stops on group/paid/Potion/remove/fall/settled/final without modifying the book.

Character: eight new redrawn key-pose concepts generated from original project art, prompt/provenance/hash registered, shown separately in `/m07-art.html`. No new animation loop or family is claimed. M06 movement remains REWORK; M07 pose/field acceptance PENDING.

## Technical evidence

- Baseline before edits:93 PASS (3 repository,17 math/replay,73 JavaScript).
- Final reproducibility and repository checks: `reports/m07/local-verification.txt`, `reports/m07/verification.json`; regenerate via `python3 tools/generate_m07.py --check`. Pinned config unchanged. All207 books reproduce from explicit boards/refills and pass the independent verifier; JS validates full converted outcomes. Normal/Fast/Reduced/Replay scene tests cover27×4 cases.
- Actual controls browser suite: results/clock labels are saved under `reports/m07/`; do not infer completion from the existence of a test page.
- Two first accelerated actual-control runs stopped after85 PASS because one delayed tick completed a read hold and its earlier watchdog together. The watchdog incorrectly won the promise race despite a completed participant. Preserved original failure reports. CueDirector now drains that tick's promise jobs before declaring timeout; the active-time deadline is unchanged. A regression checks simultaneous completion AND true stalled fallback. A third run then correctly fell back when the fourfold wall-clock driver amplified a browser GC stall before the amount became visible. The QA driver now advances fixed50ms active steps rather than multiplying browser stalls; the watchdog threshold is unchanged. Real-tempo controls are verified separately.
- No body loops, configured payout, group allocation, Potion values, weights or cap changed.

## Acceptance / limits

IMPLEMENTED and locally technically verified is separate from PO art/product acceptance. Physical iOS Safari/Android, hardware memory/thermal/input/AV,30-minute wall-clock device soak and6–8-adult comprehension sessions are UNAVAILABLE / NOT RUN. Browser viewport and accelerated clocks do not replace these. Continuous gameplay screen recordings and silhouette/phone-crop key-pose verification are OPEN. New4000ms SMALL_WIN/IDLE, then MEDIUM/BIG/BONUS, require further production and review; this delivery does not complete them. Native Figma untouched. No production FS/math/LUT/live recovery/public replay/submission claim; productionReady=false and no real funds.

Source/version/deployment and latest completed browser receipts are appended after publication. Existing Site identity and public audience are preserved.
