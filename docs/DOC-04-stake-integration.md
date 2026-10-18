---
id: DOC-04
version: 1.1.0-rc1
date: 2026-10-18
status: LOCAL_OFFICIAL_CONTRACT_INTEGRATED_SUBMISSION_PENDING
dependencies: [DOC-03]
related: [DOC-05, DOC-06, DOC-12]
confidence: HIGH_FOR_PUBLIC_DOCS
---

# Stake Engine Integration Specification

## Verified platform model

As of 2026-10-18, official public docs describe static frontend files and precomputed math outcomes. Each mode maps compressed books and a weighted CSV through `index.json`; `/play` returns the selected outcome’s events. The official SDKs are optional, but selected here to reduce integration risk.

## Required integration behavior

- Authenticate and use every bet level provided by RGS; bets remain within `minBet`/`maxBet` and divisible by `stepBet`.
- Money travels as integers with six-decimal API precision (`1,000,000 = 1.00`); presentation localizes currency without changing game logic.
- Consume events sequentially. Call `end-round` according to official lifecycle so interrupted winning rounds can resume correctly.
- Frontend builds to a static site. Images and fonts for submission load from Engine CDN; no secret or private runtime service.
- Show balance, bet, exact non-zero final win, rules/paytable, RTP and max win per mode; describe mode costs, triggers and all special-symbol values.
- Provide mute. Spacebar maps to bet. Autoplay, if present, asks for explicit confirmation. Fast play must keep combinations, amounts and popups legible.
- Support common mobile sizes and the small popout without board distortion. Do not ship sample SDK visuals/audio.

## Replay — mandatory

Detect `replay=true` and parse `game`, `version`, `mode`, `event`, `rgs_url`; optionally `currency`, `amount`, `lang`, `device`, `social`, `demo`. Fetch `GET https://{rgs_url}/bet/replay/{game}/{version}/{mode}/{event}`. Auto-load, then require a Play gesture; disable/hide betting and all authenticated session calls; show full round and final cost/win; provide Play Again; handle missing/invalid optional values and 404 safely; support small popout and social wording.

Test IDs per mode: loss, normal win, big win, max win and bonus trigger if applicable.

The Milestone 02 prototype parses `sessionID`, `rgs_url`, `lang`, `currency`, game/version/mode parameters; defaults to a Stake-compatible local RGS; and uses `/wallet/authenticate`, `/wallet/play`, `/wallet/end-round` and `/bet/replay/...`. Replay makes no play or wallet call and was browser-verified with an unchanged balance. The old Mock RGS is explicit `?rgs=mock` fallback only. A live Studio session and account-specific resume/replay behavior remain mandatory before submission.

## Pin and compatibility boundary

`sdk-lock.json` pins Math SDK `a6dccd86de740cc5d318079483cb6204cc5c19bc` and Web SDK `1843d60cedb94b390e641b563f32ad64353bec5e`. The browser keeps the proven UX instead of copying official sample visuals; its adapter follows the pinned `rgs-requests` payloads and `apps/scatter` BookEvent vocabulary. A later full Svelte/Pixi migration is optional unless packaging or performance evidence requires it.

Local integration is not ACP certification. Authentication is a test session, the six-entry book is evidence only, bonus mode is absent, and no external Stake endpoint or account was called.

## Statelessness and content

Every bet is independent. No jackpot, gamble, continuation, early cashout or cross-bet cauldron/streak state. Assets must be original, lawful, non-Station-branded, non-explicit and not appealing to minors. The adult witch requires human content review before paid production. Post-approval math, modes and mechanics are effectively frozen; submit only a finalized candidate.

## Quality target

The 3-star target is an internal quality bar, not guaranteed approval. Public guidance emphasizes originality/depth, cohesive professional art and animation, device testing, good sound and optimized bundle size. Generic AI assets and shallow gameplay lower rating. Build evidence around these criteria rather than treating “AI-generated” as value.

## Submission package

1. Published frontend version and math version in ACP.
2. `index.json`, books `.jsonl.zst`, weighted CSV and configs/hashes.
3. Rules/paytable/RTP/max-win content and promo blurb.
4. Replay event IDs and device/browser matrix.
5. Rights/provenance register and security/performance report.
6. Social-mode/jurisdiction copy audit.
7. Release checksum manifest and rollback source tag.

Exact account-visible checklist must be re-read immediately before G5; public pages note that requirements can vary by team.

## Commercial choice

Official distribution docs currently make launch distribution a per-game, fixed-at-launch choice. Public rates currently shown: Only on Stake 10% actual GGR or 7.5% expected GGR; network option 5%/3.75% per operator with different promotion. These are volatile commercial terms, not guaranteed revenue. Recommendation: model Only on Stake, decide at submission after rereading terms and performance strategy.

## Primary sources accessed 2026-10-18

- [Official Web SDK](https://github.com/engineio/web-sdk)
- [Official Math SDK](https://github.com/engineio/math-sdk)
- [Official documentation source](https://github.com/engineio/docs)
- [Bet replay requirement and contract](https://github.com/engineio/docs/blob/main/src/routes/docs/api/bet-replay/%2Bpage.svx)
- [Math SDK quick start and required artifacts](https://github.com/engineio/docs/blob/main/src/routes/docs/math-sdk/quick-start/%2Bpage.svx)
- [Official integration examples](https://github.com/engineio/integration)

## Confidence rules

“Verified” covers only statements visible in the sources on the access date. Commercial/distribution figures from earlier research were not re-confirmed in the public source set used for this milestone and must not drive a budget or launch decision. Asset byte limits, complete language list, account-specific checklist and adult-content treatment are **not confirmed in public material** and must be checked in ACP/support before production assumptions are made.
