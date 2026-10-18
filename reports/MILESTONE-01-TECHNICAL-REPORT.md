# Milestone 01 technical report

Date: 2026-10-18
Status: Functional Prototype ready for Product Owner review; not submission-ready

## Delivered

- Primitive responsive browser game: 6×5 board, spin, balance/bet/win display,
  scatter-style wins, cascades, potion cues, round-scoped multiplier, fast play
  and exact replay.
- Local mock RGS that returns immutable precomputed event streams, validates an
  entire response before debit and keeps replay isolated from wallet mutation.
- Dependency-free Python math core with seeded outcome generation, immutable
  weighted books, canonical serialization/hashing, exact replay and a separately
  implemented invariant verifier.
- Candidate simulation reporting with explicit non-production disclaimers.
- Controlled documentation, donor register, agent contract and CI gate.

## Evidence

Run `python3 tools/verify_milestone.py` from the repository root. The milestone
requires repository policy checks, controlled-document tests, all math/replay
tests and all browser-domain tests to pass. The seeded 10,000-round report uses
root seed `20261018`; its hash is recorded in `SIMULATION_10000.json`.

A browser smoke run on the local server settled the first fixture from a $100.00
demo balance to $107.00 after a $1.00 bet and $8.00 payout, displayed ×3, then
replayed the same seven events while the balance remained $107.00.

Official sample evidence and the upstream Math SDK blocker are recorded in
`OFFICIAL_SDK_SMOKE_2026-10-18.md`.

## What is proven

- A deterministic outcome can be computed once, serialized, hashed and replayed
  without RNG or payout recalculation.
- Multiplier state starts at ×1 for every independent round and can affect only
  later cascades in that outcome.
- Normal, fast and replay presentation paths consume the same ordered events and
  converge on the same final display state.
- Replaying a settled mock round causes no new play, debit or settlement.
- The primitive layout works at desktop and 390×844 portrait dimensions.

## What is not proven

- The candidate paytable/weights are not balanced; 96% remains a hypothesis.
- The local books are not yet official Math SDK publish artifacts.
- The browser prototype is not yet wired to the official Web SDK/RGS client.
- The official Math SDK scatter smoke run has an unresolved bonus book/LUT hash
  mismatch at the tested upstream SHA.
- No Free Spins decision, Stake account submission, production security review,
  real-device matrix, video/audio runtime or final art has been approved.

## Gate recommendation

**Conditional GO for the next engineering slice:** accept the functional
mechanics and event-boundary approach, then prioritize (1) resolving or pinning
around the official Math SDK sample failure, (2) mapping the implemented events
into the official `typesBookEvent.ts`/`bookEventHandlerMap.ts` pattern and (3)
running Stake-compatible replay against a local RGS tool. Keep production math,
art, video, music and paid generation blocked.
