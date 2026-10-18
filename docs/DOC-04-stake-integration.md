---
id: DOC-04
version: 0.9.0
date: 2026-10-18
status: VERIFIED_BASELINE_WITH_OPEN_ACCOUNT_CHECKS
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

## Sources accessed 2026-10-18

- [Official docs index](https://stake-engine.com/docs)
- [Web SDK](https://github.com/engineio/web-sdk) and [frontend docs](https://stake-engine.com/docs/front-end)
- [Math SDK](https://github.com/engineio/math-sdk)
- [General approval](https://stake-engine.com/docs/approval-guidelines)
- [Frontend communication](https://stake-engine.com/docs/approval-guidelines/front-end-communication)
- [Game replay](https://stake-engine.com/docs/approval-guidelines/game-replay-requirements)
- [RGS and money](https://stake-engine.com/docs/rgs)
- [Game quality rankings](https://stake-engine.com/docs/approval-guidelines/game-quality-rankings)
- [Distribution](https://stake-engine.com/docs/distribution)

## Confidence rules

“Verified” covers only statements visible in the sources on the access date. Asset byte limits, complete language list, account-specific checklist and any Naughty-category treatment are **not confirmed in public material** and must be checked in ACP/support before production assumptions are made.
