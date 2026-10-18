---
id: DOC-12
version: 0.9.0
date: 2026-10-18
status: PROPOSED
dependencies: [DOC-03, DOC-04, DOC-05, DOC-10]
related: [DOC-13]
confidence: HIGH
---

# Quality Assurance, Security & Compliance

## Test matrix

| Area | Automated | Human/device | Release blocker |
|---|---|---|---|
| Math | unit/property, exact weighted RTP, CSV/book/hash match | independent model review | yes |
| Events/replay | schema, fixtures, normal/fast/replay convergence | requested event IDs | yes |
| Frontend | type/lint/component/e2e/visual diff | UX/readability | yes |
| Video | codec probe, dropped frames, memory, failure injection | identity/seams on real devices | yes |
| Audio | sample length, peak, transition timestamps, suspend/mute | mix/loop listening | yes |
| Performance | bundle/asset budgets, FPS/long tasks | low-tier phone thermal run | yes |
| Security | dependency/license/secret scan, CSP review, no unsafe dynamic HTML | threat-model review | yes |
| Compliance | rules fields, social wording, replay/no-session | content/jurisdiction checklist | yes |

## Browser/device baseline

Latest stable and previous major where practical: Chrome/Edge desktop, Safari macOS/iOS, Chrome Android; representative low/mid/high mobile; portrait, landscape and small popout. Record exact OS/browser/device/date. Emulation cannot close the mobile video/audio gate.

## Math independence

Verifier recomputes every lookup row relationship and exact expected RTP from integer weights, validates payout cap, unique IDs, required keys, probability sums/overflow, event order and sample rule calculations. Compare an independently written evaluator against author fixtures. Any unexplained delta blocks G3.

## Security model

- Static frontend; no application secrets client-side.
- Allowlist/validate `rgs_url` according to official integration patterns; no arbitrary fetch target.
- Parse external outcome/replay data as untrusted; schema and range validation before rendering.
- Avoid `innerHTML`; sanitize localization; restrict CDN origins with CSP compatible with Engine.
- Pin dependencies/actions by reviewed versions/SHAs, generate SBOM for release and scan critical vulnerabilities.
- Never log session IDs, balances or replay URL secrets; redact diagnostic exports.
- Provenance/checksums for media and generated math; least-privilege object storage.

## Compliance checks

Stateless bets; exact RGS values; replay mandatory/no authenticated calls; all bet levels; balance/win/rules/RTP/max win/paytable/special values; explicit autoplay confirmation; fast play legibility; mute; Space=bet; mobile/popout; unique original assets; no minors/child-like cues, explicit/offensive material or Stake branding; social-mode language; general disclaimer; rights evidence.

## CI gates

PR gates: repository/document validation, test suite, source lint/typecheck when present, schema fixtures, dependency/secret checks, file-size policy. Implementation gates add deterministic replay, Playwright, Storybook, frontend static build, math smoke and budgets. Release workflow is manual, requires approvals and immutable artifact checksums; it never modifies production math.

## Release readiness checklist

- [ ] All PO and architecture decisions approved; no critical open question.
- [ ] Exact frontend/math versions and toolchain locked.
- [ ] Math independent report signed and fixture IDs supplied.
- [ ] Replay/no-session and resume flows passed.
- [ ] Device matrix and 30-minute soak passed; no critical console/network errors.
- [ ] Rules/paytable/RTP/max win/costs/localization/social copy complete.
- [ ] Asset originality, provenance and licenses complete.
- [ ] Performance/bundle/media budgets passed.
- [ ] Security findings resolved or explicitly accepted.
- [ ] ACP/account-specific checklist re-read; submission blurb and rollback tag ready.
