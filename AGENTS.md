# AI Agent Operating Contract

## Mandatory reading order

Every agent must start with: (1) `README.md`, (2) this file, (3) `docs/DOC-00-project-index.md`, (4) its assigned issue, and (5) every specification listed under that issue’s **Required reading**. If instructions conflict, stop and ask the Product Owner; never silently choose a different product direction.

## Phase gate

Work Task 01 authorizes Phase 0 and the primitive Phase 1 functional prototype. Agents may maintain the dependency-free math/replay core, mock-RGS browser prototype, tests, CI and evidence needed for Gate 1. They must not begin Phase 2 interaction work or Phase 3 art/audio production, claim production RTP, generate paid assets, upload to Stake Engine, publish the game or purchase tools without the next explicit Product Owner gate.

## Git and review rules

- One task per branch: `agent/<role>/<issue>-<slug>`; branch from the latest `main`.
- No direct writes to `main`, no force-push to shared branches, no unrelated changes.
- Every change uses a Pull Request linked to an Issue. PRs must describe inputs, outputs, tests, risks, generated content and remaining uncertainty.
- At least one review is required. Math, payout, compliance, licensing and security changes require the Technical Reviewer plus explicit Product Owner approval.
- Required checks must pass. Agents may not weaken tests, thresholds or branch protections to make a PR green.
- Generated files must be reproducible from committed source/configuration or registered in `assets/ASSET_MANIFEST.json` with a checksum and provenance.

## Source-of-truth boundaries

- GitHub is authoritative for text, code, configuration, decisions, issues, checksums and asset manifests.
- Heavy media masters live in approved object storage, not Git. Google Drive is reserved for material that genuinely needs a separate presentation format.
- Stake outcomes are authoritative for math. Frontend state, animation, FX and audio are presentation-only.
- Do not edit generated math output by hand. Regenerate it from pinned inputs and record the toolchain SHA.

## Agent handoff

Each handoff in `agents/handoffs/` must state: issue/commit, inputs, files changed, commands/tests, acceptance evidence, assumptions, unresolved risks, licenses, and exact next action. Never claim a visual, audio, math or device result without an attached reproducible artifact or test record.

## Safety and quality

- Keep secrets and personal data out of commits and logs.
- Use original assets only; record model/tool, plan, terms URL, date, prompts, source references and human edits.
- The witch must be unmistakably adult; no child-like traits, nudity or explicit sexual content.
- Do not imply that animation, streaks or audio affect probability.
- Fast play, mute, replay, mobile and reduced-motion paths must preserve legibility and deterministic outcomes.
- If a requirement is unverified, label it `HYPOTHESIS` and create a verification task.

## Definition of Done

The issue acceptance criteria are met; relevant automated checks pass; the PR is reviewable; documentation and registers are updated; no untracked heavy binary exists; handoff evidence is present; and a human reviewer can reproduce the result without private context.
