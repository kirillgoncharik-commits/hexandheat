# Contributing

## Before work

Confirm the architecture gate is open for the proposed scope, select an Issue, read its dependencies and specifications, and announce ownership. Use the smallest branch that can satisfy one acceptance contract.

## Branches and commits

- Branch: `agent/<role>/<issue>-<slug>` or `docs/<slug>`.
- Commits: imperative Conventional Commits (`docs:`, `test:`, `feat:`, `fix:`, `chore:`).
- Do not commit secrets, build output, raw AI generations, compressed outcome libraries, or licensed masters.

## Pull Request checklist

- [ ] Linked Issue and dependencies are resolved.
- [ ] Scope and non-goals are explicit.
- [ ] Required docs/registers updated.
- [ ] Tests and evidence included.
- [ ] Asset provenance and license evidence recorded.
- [ ] Math/payout changes independently reviewed.
- [ ] Replay, mobile, fast-play, mute and degraded modes considered.
- [ ] No file violates the repository asset-size policy.
- [ ] Product Owner decision requested where the specification says `PO GATE`.

## Reviews

Reviewers check correctness before style. A PR cannot self-approve. High-risk changes (math, RGS integration, platform compliance, security, licensing) need two perspectives: implementation and independent verification. AI review is advisory; the Product Owner remains the accountable approver.

## CI/CD policy

Pull requests run structure, document metadata, link/schema, secret-pattern, test and asset-size checks. After implementation begins, frontend build, math unit tests, deterministic replay fixtures, Playwright device smoke tests and bundle/performance budgets become required. Deployment is manual and approval-gated; CI never publishes to Stake Engine from an unreviewed branch.
