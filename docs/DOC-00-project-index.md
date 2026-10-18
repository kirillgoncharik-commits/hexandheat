---
id: DOC-00
version: 0.9.0
date: 2026-10-18
status: PROPOSED_FOR_PO_APPROVAL
dependencies: []
related: [DOC-01, DOC-05, DOC-13, DOC-14]
confidence: MEDIUM
---

# Project Index & Decision Register

## Назначение и phase gates

Этот документ — входная точка и реестр решений. GitHub — единый source of truth. Статус `PROPOSED` означает, что решение можно обсуждать, но нельзя реализовывать. Переход к pilot implementation разрешается только после одобрения и merge архитектурного PR Product Owner’ом.

| Gate | Условие | Разрешает |
|---|---|---|
| G0 Documentation | DOC-00–14 и registers согласованы | Планирование и бесплатные проверки |
| G1 Architecture | ADR-001–009 одобрены PO | POC-код в pilot issues |
| G2 Paid tools/assets | Бюджет, лицензии, storage одобрены | Платные генерации и хранение masters |
| G3 Math candidate | Независимая проверка распределения | Интеграцию candidate books |
| G4 Vertical slice | POC-D и device matrix пройдены | Lean MVP |
| G5 Submission | Compliance/release checklist закрыт | Загрузку в Stake Engine ACP |

## Комплект документов

| ID | Документ | Статус | Главный выход |
|---|---|---|---|
| DOC-01 | [Master Product Concept](DOC-01-master-product-concept.md) | Proposed | vision, MVP, USP |
| DOC-02 | [Game Design Document](DOC-02-game-design.md) | Proposed | правила и состояния |
| DOC-03 | [Math Model](DOC-03-math-model.md) | Hypothesis | math contract и validation |
| DOC-04 | [Stake Integration](DOC-04-stake-integration.md) | Verified/Proposed | platform requirements |
| DOC-05 | [Architecture](DOC-05-technical-architecture.md) | Proposed | modules, contracts, stack |
| DOC-06 | [UX/UI](DOC-06-ux-ui-responsive.md) | Proposed | responsive layouts |
| DOC-07 | [Art Direction](DOC-07-art-direction.md) | Proposed | visual bible, inventory |
| DOC-08 | [Character Video](DOC-08-character-animation.md) | POC required | video pipeline/fallback |
| DOC-09 | [Music & Sound](DOC-09-music-sound.md) | POC required | adaptive audio system |
| DOC-10 | [FX & Sync](DOC-10-fx-event-sync.md) | Proposed | deterministic timeline |
| DOC-11 | [AI Agents](DOC-11-ai-agents-pipeline.md) | Proposed | roles and handoffs |
| DOC-12 | [QA/Security/Compliance](DOC-12-qa-security-compliance.md) | Proposed | test matrix/release gate |
| DOC-13 | [Plan/Budget/Risks](DOC-13-production-plan.md) | Estimate | 10-day plan and cost |
| DOC-14 | [Implementation Backlog](DOC-14-agent-backlog.md) | Ready after G1 | agent-ready tasks |

Registers: [TECH_STACK_DECISIONS](TECH_STACK_DECISIONS.md), [ASSET_REGISTER](ASSET_REGISTER.md), [DEPENDENCY_MAP](DEPENDENCY_MAP.md), [RISK_REGISTER](RISK_REGISTER.md), [OPEN_QUESTIONS](OPEN_QUESTIONS.md), [PILOT_BACKLOG](PILOT_BACKLOG.md).

## Decision register

| ADR | Решение | Статус | Уверенность |
|---|---|---|---|
| ADR-001 | Official Web SDK baseline: Svelte 5 + PixiJS 8 + TypeScript/Vite/XState, pin by commit | PO APPROVAL REQUIRED | High compatibility |
| ADR-002 | Official Math SDK, Python 3.12, pinned commit; no custom RGS | PO APPROVAL REQUIRED | High |
| ADR-003 | 6×5 pay-anywhere ≥8, cascades, per-bet cauldron multiplier | Product hypothesis | Medium |
| ADR-004 | Pilot excludes Free Spins and production balancing | Proposed | High |
| ADR-005 | RGS events are immutable domain input; presentation cannot calculate payout | Proposed | High |
| ADR-006 | Witch runtime: opaque dual-codec loops + spritesheet fallback, not alpha-video baseline | POC required | Medium |
| ADR-007 | Adaptive stems via Web Audio scheduling; SDK audio wrapper preferred | POC required | Medium |
| ADR-008 | Heavy assets outside Git in versioned object storage; Git stores manifest/checksums | PO storage approval | High |
| ADR-009 | “Only on Stake” is commercial default for model comparison, not launch commitment | PO approval at submission | Medium |

## Термины

- **Book/outcome** — заранее вычисленный раунд, выбранный RGS по весу.
- **Domain event** — факт результата (`boardReveal`, `win`, `cascade`, `multiplier`, `finalWin`).
- **Presentation cue** — детерминированная визуальная/звуковая реакция на domain event.
- **Bet scope** — граница независимого раунда; multiplier не переносится между ставками.
- **Anchor pose** — одинаковая нейтральная поза начала/конца клипа для переходов.
- **POC** — ограниченный эксперимент с заранее заданными pass/fail и stop-loss.
- **Evidence** — воспроизводимый тест, commit, fixture, checksum или device log.

## Критические открытые вопросы

1. Подтвердить RTP target (рабочая гипотеза 96.00%), max win (5,000×) и volatility band.
2. Разрешить ли full-version Free Spins; pilot остаётся base-only.
3. Одобрить ли sensual art direction после безопасного character key art review.
4. Одобрить бюджеты POC-B/C и provider terms на дату покупки.
5. Выбрать object storage и правила retention.
6. Подтвердить distribution только при submission; по умолчанию моделируется Only on Stake.

## Top risks и готовность

| Risk | Сейчас | Exit evidence |
|---|---|---|
| Video consistency / seams | Red | 5 states, 20 transitions, no visible hard cut in ≥95% review trials |
| Mobile decode/memory | Red | target-device matrix, stable 30 FPS, no crash, documented memory |
| Math balance | Red | reproducible books + independent recomputation |
| Audio phase/latency | Amber | 15-minute stress run, sample-aligned transitions |
| Content approval | Amber | adult-character review + jurisdiction copy audit |
| AI asset rights | Amber | per-asset provenance and paid-plan rights evidence |

Readiness: documentation **80%**, architecture **proposed**, math/video/audio **not proven**, submission **not ready**.

## Source policy

Platform statements are based on official Stake Engine docs/repositories accessed 2026-10-18. Volatile prices, versions and terms must be rechecked at procurement and again before submission. Research supplied by the Product Owner is contextual, not authority over current official requirements.
