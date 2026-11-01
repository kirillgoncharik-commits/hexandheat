# AI Agent Operating Contract

## Mandatory reading order

Every agent must start with: (1) `README.md`, (2) this file, (3) `docs/DOC-00-project-index.md`, (4) its assigned issue, and (5) every specification listed under that issue’s **Required reading**. If instructions conflict, stop and ask the Product Owner; never silently choose a different product direction.

## M04 implementation authorization effective 2026-11-01

Product Owner explicitly requested: «начинаем разработку кода, арта и документации по мл 4». M04.1 implementation, original raster refinement and documentation are now authorized under Issue #20 and docs/m04/. Continue the existing M03 implementation stack in a separate branch; the M04 scope PR #22 is a documentation input. Do not auto-merge older PRs. This bounded start supersedes NOT STARTED/proposed implementation gates in the scope documents. Full 4000ms witch body cycles, including IDLE, remain required. Production math sign-off, paid tools, commercial terms, live Stake operations/submission and real-device certification retain their separate gates. The review build uses explicit sample outcomes.

## M03 authorization effective 2026-10-30

Product Owner explicitly authorizes Issue #19: first-pass raster art, 4-frame/4000ms witch cycles, Figma full journey/layouts, styled main screen, launch architecture and M04 task. This supersedes the prior draft-art/video gate below for this bounded work. Branch from the PR #18 head to preserve its stacked implementation; do not auto-merge older PRs. Production math, paid purchases, legal terms and Stake submission remain gated. The private Sites review build uses explicit mock sample outcomes only. M03 files under docs/m03/ take precedence over older video/duration proposals. All five states switch only at full-cycle end, including IDLE.

## Phase gate

Work Task 01 authorized Phase 0 and the primitive Phase 1 functional prototype. Issue #15 authorized the seamless CSS Witch Stage. Work Task Milestone 02 / Issue #17 additionally authorizes a bounded official SDK-format adapter, Stake-compatible local RGS, synthetic video technology POC and temporary Web Audio controller. Agents may implement and verify those interfaces, but must not create final video/audio/art, claim production RTP, accept commercial/legal terms, upload to Stake Engine, publish the game or purchase tools without a later explicit Product Owner gate.

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
