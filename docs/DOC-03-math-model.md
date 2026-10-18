---
id: DOC-03
version: 0.9.0
date: 2026-10-18
status: HYPOTHESIS_NOT_BALANCED
dependencies: [DOC-02]
related: [DOC-04, DOC-10, DOC-12]
confidence: MEDIUM
---

# Math Model & Simulation Specification

## Baseline and authority

Use the official [Stake Engine Math SDK](https://github.com/engineio/math-sdk) pinned by commit, currently requiring Python ≥3.12. Even a custom generator must publish the official required format: `index.json`, per-mode weighted `uint64` CSV, and Zstandard-compressed JSON-lines books. The RGS-selected book is authoritative; frontend code cannot alter payouts.

## Candidate targets — PO and independent review required

| Metric | Exploration band | Status |
|---|---:|---|
| RTP base mode | 96.00% target, tolerance defined before approval | Hypothesis |
| Volatility | medium-high | Hypothesis, quantify from distribution |
| Hit frequency | 25–35% paid rounds | Exploration band |
| Max win | 5,000× | Hypothesis |
| Bonus frequency | N/A pilot | Deferred |
| Duplicate exposure | production library ≥100k diverse books/mode per official guidance | Minimum candidate |

RTP is computed from integer weights: `RTP = Σ(weight_i × payout_i/cost) / Σ(weight_i)`. Report zero-win rate, conditional average win, standard deviation, percentiles, tail mass, max-win probability, cascade-depth distribution, multiplier contribution and symbol/threshold hit rates.

## Model decomposition

1. Sample 30 symbols from defined weighted sources/reels using seeded simulation RNG.
2. Find every regular symbol count meeting its highest threshold.
3. Calculate base award in integer hundredths of bet; emit `win` snapshot.
4. Apply only modifier data already present in the simulated state; emit multiplier update.
5. Remove winning positions, collapse each column, refill, emit full board and repeat.
6. Enforce max-win cap and terminal event.
7. Record book payout and criteria; lookup payout must exactly equal book payout.

No cross-bet state. If bonus is added, it is wholly encoded within one outcome/book or independent allowed mode; never persisted from a prior stake.

## Event contract example

```json
{
  "id": 1042,
  "payoutMultiplier": 1850,
  "events": [
    {"index": 0, "type": "boardReveal", "board": [["L1"]]},
    {"index": 1, "type": "win", "cascade": 0, "amount": 250, "positions": [0,3,7,9,12,18,22,29]},
    {"index": 2, "type": "multiplier", "from": 1, "increment": 2, "to": 3},
    {"index": 3, "type": "cascade", "cascade": 1, "board": [["H1"]]},
    {"index": 4, "type": "finalWin", "amount": 1850}
  ]
}
```

Illustrative abbreviated board only. All amounts use the SDK’s documented integer convention; schema definitions must specify units explicitly.

## Reproducibility

Commit config, source, dependency lock, SDK SHA and seed-set manifest. Production books stay outside Git; commit SHA-256, byte size, mode, row count and storage URI. A build is reproducible when the same container/toolchain and inputs regenerate identical canonical configs and statistically equivalent books; exact book identity is required only when seeds and SDK parallelism guarantee ordering.

## Verification ladder

1. Unit tests: threshold selection, position union, cascade gravity, multiplier timing, cap, rounding.
2. Property tests: no negative weights/payouts; board always 6×5; event indices monotonic; final payout equals sum according to rules; cauldron reset.
3. Fixture replay: frontend consumes representative loss, normal, long cascade, high multiplier, cap and malformed books.
4. Simulation smoke: ≥10k for development, uncompressed sample for review.
5. Candidate: ≥100k diverse books/mode, optimization and PAR/distribution report.
6. Independent verifier reads only exported books/CSV/config and recomputes RTP, hashes, cap and invariants.

Statistical acceptance must state confidence interval or exact weighted expectation; “simulation looks close” is insufficient. A second agent may review code, but a qualified human or independently implemented verifier signs off before G3.

## AI-agent boundary

Agents may scaffold SDK game files, tests, reports and anomaly detection. They may not approve RTP, volatility, wagering compliance or payout correctness. Any optimizer change, manual CSV edit, floating-point-to-integer conversion or event/payout mismatch blocks release.

## Official references

- [Math file format](https://stake-engine.com/docs/math/math-file-format)
- [Quick start and production-size guidance](https://stake-engine.com/docs/math/quick-start)
- [Events](https://stake-engine.com/docs/math/game-state-structure/events)
- [Output files](https://stake-engine.com/docs/math/source-files/outputs)
