---
id: DOC-11
version: 0.9.0
date: 2026-10-18
status: PROPOSED
dependencies: [DOC-00, DOC-05, DOC-12]
related: [AGENTS, DOC-14]
confidence: HIGH
---

# AI Agents Production Pipeline

## Operating model

Product Owner is accountable for scope, spend, content, math targets and release. Agents operate through GitHub Issues → isolated branches → PR → automated evidence → independent review → PO gate. ChatGPT Work coordinates research/review; coding agents modify the repository; external media tools run only after explicit approval. GitHub is authoritative.

## Roles

| Agent | Inputs | Outputs | Automation | Human gate |
|---|---|---|---|---|
| Game Design | DOC-01, research | rules/AC, unresolved choices | consistency checks | product decisions |
| Math Engineer | DOC-02/03, SDK SHA | model, books manifest, PAR | unit/sim/property | independent math sign-off |
| Frontend Dev | DOC-04/05/10, fixtures | static app, replay | lint/test/e2e | UX/compliance review |
| UI/UX | DOC-06, devices | layouts/spec/evidence | visual regression/a11y | readability approval |
| Art Generation | DOC-07 | registered assets | checksum/style triage | adult/content/quality |
| Character Animation | DOC-08 | encoded clips/benchmarks | ffprobe/browser metrics | seam/identity review |
| Audio Production | DOC-09 | stems/SFX/mix report | loop/peak/sync tests | rights/mix approval |
| Integration | contracts + assets | vertical slice | contract/chaos/e2e | G4 decision |
| QA & Testing | DOC-12 | matrix/defects/release report | CI/device runs | release readiness |
| Technical Reviewer | PR + evidence | approve/request changes | diff/check aggregation | cannot author same high-risk change |

## Task template

```markdown
Goal / Non-goals / Required reading / Inputs + versions / Deliverables
Dependencies / Cost cap / Acceptance criteria / Test procedure
Rights & security / PO decisions / Handoff recipient / Stop conditions
```

Every prompt instructs the agent to read README, AGENTS and named specs; work only on its issue branch; make assumptions explicit; avoid paid actions; run tests; update registers and provide a reproducible handoff.

## Handoff contract

`agents/handoffs/ISSUE.md` records issue, branch/commit, input hashes, tool/model versions, outputs/URIs/hashes, test commands/results, costs, licenses, open risks and next task. A prose claim without evidence is not a deliverable.

## Review segregation

- Author agent cannot be sole reviewer.
- Math verifier uses exported artifacts, not author internals.
- Licensing reviewer checks saved terms evidence, not vendor marketing copy.
- QA derives tests from specifications, then adds adversarial cases.
- PO resolves scope/value tradeoffs; agents must not silently “optimize” product goals.

## What can and cannot be delegated

High automation: scaffolding, schema/tests, build, static analysis, media probing, manifests, traceability and report generation. Supervised: math design, art consistency, animation editing, mix decisions, UX and performance. Human/independent mandatory: final math approval, legal/licensing judgment, adult-content suitability, real-device perceptual review, spend and submission.

## Failure policy

Stop when required input/version is absent, acceptance cannot be measured, tool terms are unclear, cost cap would be exceeded, output depicts unsafe content, or three bounded attempts repeat the same failure. Open a decision record with evidence; do not expand scope or swap architecture without review.
