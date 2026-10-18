# Hex & Heat: Witch’s Wild Mixer

AI-first production blueprint for an HTML5 casino game targeting Stake Engine. This repository is the single source of truth for product decisions, architecture, specifications, code, math, tests, agent instructions and asset metadata.

> **Phase gate:** gameplay implementation is forbidden until the Product Owner approves the architecture and technology stack in the documentation Pull Request. Current status: **documentation review**.

## Start here

1. Read [`AGENTS.md`](AGENTS.md).
2. Read [`docs/DOC-00-project-index.md`](docs/DOC-00-project-index.md).
3. Read the specification(s) relevant to your task.
4. Work in a dedicated branch and open a Pull Request; never push directly to `main`.

## Repository map

| Path | Purpose |
|---|---|
| `docs/` | Approved and proposed product/technical documents DOC-00–DOC-14 plus registers |
| `src/` | Frontend application; intentionally empty until the phase gate opens |
| `math/` | Stake Math SDK game package and generated-math manifests |
| `assets/` | Asset manifests, prompts, licenses and lightweight previews; no heavy masters |
| `tests/` | Unit, integration, replay, performance and math verification tests |
| `tools/` | Reproducible validation and asset-pipeline utilities |
| `agents/` | Agent role contracts, task templates and handoff records |

## Chosen baseline (pending approval)

- Frontend: official Stake Engine Web SDK pinned to a reviewed commit; TypeScript, Svelte 5, PixiJS 8, Vite and XState.
- Math: official Stake Engine Math SDK pinned to a reviewed commit; Python 3.12; independently verified weighted outcome books.
- Runtime contract: immutable RGS outcome events drive a deterministic presentation timeline. Visuals and audio never affect payout.
- Character: pre-rendered dual-format video loops in a fixed background plate, with a spritesheet fallback and anchor-pose transitions.
- Audio: Web Audio scheduling of sample-aligned stems; decorative layers degrade safely without affecting round completion.

See [`docs/TECH_STACK_DECISIONS.md`](docs/TECH_STACK_DECISIONS.md) for rationale and alternatives.

## Approval workflow

The Product Owner approves the architecture by approving and merging the documentation PR. A merge alone authorizes only the work described by approved pilot issues. Math targets, visual content, paid tools and commercial asset generation each retain their own explicit gates.

## Local quality check

```bash
python3 tools/validate_repo.py
python3 -m unittest discover -s tests -p 'test_*.py'
```

No paid service, production asset generation, platform upload or gameplay implementation is authorized by this blueprint.
