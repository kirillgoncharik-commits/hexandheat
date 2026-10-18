# Hex & Heat: Witch’s Wild Mixer

AI-first implementation and production record for an HTML5 casino game targeting Stake Engine. This repository is the single source of truth for product decisions, architecture, specifications, code, math, tests, agent instructions and asset metadata.

> **Current gate:** Work Task 01 authorizes Phase 0 and the primitive Phase 1 functional prototype; a bounded follow-up authorizes the event-driven CSS Witch Stage placeholder. Final art, character video, production audio, paid tools, balancing claims and platform submission remain blocked. Current status: **Functional Prototype ready for Gate 1 review**.

## Start here

1. Read [`AGENTS.md`](AGENTS.md).
2. Read [`docs/DOC-00-project-index.md`](docs/DOC-00-project-index.md).
3. Read the specification(s) relevant to your task.
4. Work in a dedicated branch and open a Pull Request; never push directly to `main`.

## Repository map

| Path | Purpose |
|---|---|
| `docs/` | Approved and proposed product/technical documents DOC-00–DOC-15 plus registers |
| `apps/web/` | Dependency-free functional browser prototype and mock RGS |
| `src/` | Reserved for the future official Web SDK adaptation |
| `math/` | Dependency-free deterministic prototype core; future official Math SDK adapter |
| `assets/` | Asset manifests, prompts, licenses and lightweight previews; no heavy masters |
| `tests/` | Unit, integration, replay, performance and math verification tests |
| `tools/` | Reproducible validation and asset-pipeline utilities |
| `agents/` | Agent role contracts, task templates and handoff records |

## Proven prototype

- Responsive 6×5 colored-square browser game with Spin, balance, bet, cascades, potion cues, a per-round cauldron multiplier, fast play and exact replay.
- Separate compact debug panel and responsive Witch Stage with deterministic presentation-only placeholder states during Spin and Replay.
- Immutable, precomputed Python outcome books with canonical SHA-256, external weighted selection and an independent verifier.
- One command runs repository, math/replay and browser-domain checks without installing dependencies.

## Target production baseline (pending Gate 1 approval)

- Frontend: official Stake Engine Web SDK pinned to a reviewed commit; TypeScript, Svelte 5, PixiJS 8, Vite and XState.
- Math: official Stake Engine Math SDK pinned to a reviewed commit; Python 3.12; independently verified weighted outcome books.
- Runtime contract: immutable RGS outcome events drive a deterministic presentation timeline. Visuals and audio never affect payout.
- Character: pre-rendered dual-format video loops in a fixed background plate, with a spritesheet fallback and anchor-pose transitions.
- Audio: Web Audio scheduling of sample-aligned stems; decorative layers degrade safely without affecting round completion.

See [`docs/TECH_STACK_DECISIONS.md`](docs/TECH_STACK_DECISIONS.md) for rationale and alternatives.

## Run and verify

```bash
python3 tools/verify_milestone.py
cd apps/web && npm start
```

Open <http://127.0.0.1:4173>. Node 20+ and Python 3.9+ are sufficient for this prototype; the official Math SDK path requires Python 3.12.

## Approval workflow

The Product Owner accepts Gate 1 by approving and merging the milestone PR. This approves the demonstrated functional architecture, not production RTP, commercial math, final content or later-phase spend. Interaction technology, visual content, paid tools and commercial asset generation retain separate gates.

## Local quality check

```bash
python3 tools/verify_milestone.py
```

No paid service, production asset generation, platform upload or release is authorized by this milestone.
