---
id: DOC-01
version: 0.9.0
date: 2026-10-18
status: PROPOSED_FOR_PO_APPROVAL
dependencies: [DOC-00]
related: [DOC-02, DOC-06, DOC-07, DOC-13]
confidence: MEDIUM
---

# Master Product Concept

## Vision

**Hex & Heat: Witch’s Wild Mixer** — premium dark-fantasy casino game, где каждое подтверждённое математикой усиление раунда превращается в синхронную эскалацию поля, котла, танца взрослой ведьмы и музыкальных слоёв. Главная эмоция — «я раскручиваю опасный алхимический номер», но игра никогда не внушает, что презентация меняет шанс выигрыша.

## Audience и positioning

Целевая аудитория: совершеннолетние игроки Stake, предпочитающие визуально насыщенные cascade/scatter игры, dark fantasy и короткие эмоциональные сессии. Позиционирование: не generic AI slot, а цельный интерактивный cabaret act с персонажем-ведущей. Нельзя использовать признаки юности, school-coded элементы, наготу, explicit-контент или Stake branding.

## Core и emotional loops

`Bet → RGS outcome → 6×5 reveal → win groups → cascade(s) → potion/multiplier update → final payout → reset`.

Параллельно: `calm → interest → heat → climax → clean reset`. Интенсивность выводится только из outcome events: размер текущего/итогового выигрыша, cascade depth и multiplier tier. Проигрыш не маскируется celebratory FX.

## Product pillars

1. **Truthful spectacle:** каждый cue имеет событие-источник и одинаково воспроизводится в normal, fast play и replay.
2. **Character continuity:** ведьма всегда узнаваема; переходы важнее количества дорогих клипов.
3. **Readable math:** поле, выигрышные позиции, multiplier и итог видны поверх шоу.
4. **Mobile dignity:** мобильная версия сохраняет character hook, не уменьшая игровое поле до нечитаемого состояния.
5. **AI with receipts:** происхождение, лицензия и human review записаны для каждого asset.

## MVP boundaries

**10-day pilot:** технические прототипы с test fixtures; не commercial game. **Lean playable MVP:** base mode, 6×5, pay-anywhere, cascades, potion modifier, per-bet cauldron multiplier, 3–5 character states, 3 music layers, replay, responsive UI. **Commercial candidate:** после доказательств — full art/audio set, accessibility, localization, device QA; Free Spins только по отдельному PO decision и новой math verification.

Out of scope до G4: jackpots, gamble, persistent progression, cross-bet streak bonuses, real-time generative media, multiplayer, backend outside RGS. Такие механики также конфликтуют с stateless model Stake Engine.

## USP and quality bar

USP: pre-rendered performance that behaves like a live responsive host while remaining deterministic. Quality acceptance:

- unique, cohesive art—no sample SDK assets or visibly generic AI residue;
- readable outcome at 360×640, desktop 1366×768 and small popout;
- first meaningful frame target ≤3 s on representative 4G and warm replay ≤1 s (internal budgets, POC validates);
- gameplay 60 FPS target, graceful 30 FPS floor on pilot low-tier device;
- no audio click, visible loop jump or character identity drift in accepted clips;
- all outcome paths replay exactly and do not call session APIs in replay mode.

## Commercial assumptions

Stake Engine currently documents 10% actual GGR or 7.5% expected GGR for Only on Stake, with lower rates for network distribution; this is volatile and is not a revenue forecast. 3-star positioning requires originality, polish, device testing and optimized bundle size. Commercial success therefore depends more on retention and presentation quality than cheap volume of AI assets.

## Success metrics

Pilot GO if POC-A deterministic, POC-B passes mobile playback and transition bar, POC-C stays synchronized, and POC-D shows truthful event-driven integration within cost/time caps. Product metrics for later closed tests: tutorial comprehension, bet-to-bet latency, early-exit rate, mute rate, replay completion and performance errors; no dark patterns.

## PO decisions

Approve: audience/content boundary; base-only MVP; architecture/stack; math hypotheses for exploration; storage/provider spend; whether Free Spins enter commercial scope. Rejecting video baseline triggers spritesheet/hybrid pivot without changing product loop.
