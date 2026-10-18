# Hex & Heat: Witch’s Wild Mixer

AI-first implementation and production record for an HTML5 casino game targeting Stake Engine. This repository is the single source of truth for product decisions, architecture, specifications, code, math, tests, agent instructions and asset metadata.

> **Current gate:** Work Task Milestone 02 authorizes a bounded official-SDK-format integration and temporary media technology POC. Final art/video/music, paid tools, commercial math claims and Stake submission remain blocked. Current status: **Integrated Technical Prototype ready for review on stacked PR history**.

## Start here

1. Read [`AGENTS.md`](AGENTS.md).
2. Read [`docs/DOC-00-project-index.md`](docs/DOC-00-project-index.md).
3. Read the specification(s) relevant to your task.
4. Work in a dedicated branch and open a Pull Request; never push directly to `main`.

## Repository map

| Path | Purpose |
|---|---|
| `docs/` | Approved and proposed product/technical documents DOC-00–DOC-15 plus registers |
| `apps/web/` | Stake-compatible local RGS vertical slice; Mock RGS is explicit fallback only |
| `src/` | Reserved for a later full Svelte/Pixi shell migration if justified |
| `math/` | Deterministic core, official BookEvent adapter, publish files and independent verifier |
| `assets/` | Asset manifests, prompts, licenses and lightweight previews; no heavy masters |
| `tests/` | Unit, integration, replay, performance and math verification tests |
| `tools/` | Reproducible validation and asset-pipeline utilities |
| `agents/` | Agent role contracts, task templates and handoff records |

## Proven prototype

- Official-format `index.json`, lookup CSV and compressed JSONL book covering loss, normal win, cascade, multiplier, long chain and natural max win; hashes and event/payout integrity are independently checked.
- Local RGS implements the pinned Web SDK request lifecycle (`authenticate`, `play`, `end-round`, replay) and maps official scatter-style BookEvents into the existing 6×5 presentation without recalculating payout.
- Responsive Witch Stage keeps all five multi-second loops; IDLE exposes four anchor-A points (≤1.05 s reaction target), while each win loop completes fully. An opt-in synthetic native-video POC preloads/crossfades two layers and falls back to CSS.
- Temporary Web Audio oscillator stems prove beat-aligned BASE/ENERGY/HOT/BONUS gain changes, one-shots, mute and resume without shipping a soundtrack.
- One command runs repository, math/replay and browser-domain checks without installing dependencies.

## Target production baseline (still gated)

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

Open <http://127.0.0.1:4173>. Add `?media=video` for the rights-safe runtime-generated video POC or `?rgs=mock` only to test the fallback. Node 20+ and Python 3.9+ are sufficient for the committed slice; reproducing the pinned official Math SDK sample requires Python 3.12.

## Approval workflow

Merge order is PR #14, then PR #16, then the Issue #17 Milestone 02 PR. Approval accepts only the demonstrated integration architecture. Production RTP, final media, real-device sign-off, paid tools and platform upload retain separate Product Owner gates.

## Local quality check

```bash
python3 tools/verify_milestone.py
```

No paid service, production asset generation, platform upload or release is authorized by this milestone.
