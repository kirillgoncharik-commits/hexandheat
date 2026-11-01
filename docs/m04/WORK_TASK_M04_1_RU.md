# Work task — M04.1: синхронная игровая сцена

Статус: **READY FOR REVIEW / NOT STARTED**. Parent: [Issue #20](https://github.com/kirillgoncharik-commits/hexandheat/issues/20). Этот текст предназначен для постановки следующей работы; подготовка задания сама по себе не запускает runtime-разработку.

## Цель

На существующем главном экране связать reveal/win/Potion/cascade/final, окна, растровую ведьму и звук общим transport и CueDirector. Игрок получает немедленный отклик и понятный ритм; авторитетные данные и финансовый lifecycle сохраняются.

## Required reading

1. README, действующий AGENTS.md и DOC-00 в принятом implementation baseline.
2. [M04 scope](MILESTONE_SCOPE_RU.md), [synchronization contract](SYNCHRONIZATION_DESIGN_RU.md), [research](RESEARCH_PRIMARY_SOURCES_RU.md).
3. M03 MASTER_SPEC_RU, ART_GUIDE_RU, STAKE_TRACEABILITY_RU, NEXT_MILESTONE_RU и reports/MILESTONE-03-REPORT из [M03 snapshot](https://github.com/kirillgoncharik-commits/hexandheat/tree/b7b88761c64439b09c45d4bbbe9720543681f52f).
4. Реальный код `domain.js`, `witch-dance.js`, `raster-witch.js`, `adaptive-music.js`, `visual-ui.js`, `app.js`; проверить изменения после audit SHA.

## Условие старта

Review/merge существующего stack, включая [PR #21](https://github.com/kirillgoncharik-commits/hexandheat/pull/21), либо отдельное явно разрешённое основание ветки. Этот documentation PR основан на main и не переносит непринятый runtime незаметно. После принятия baseline — отдельная issue-linked implementation branch по действующему AGENTS; main не переписывать.

Production math, live Stake operations, paid licenses и submission остаются вне разрешений этого task. Для motion proof достаточно существующих sample fixtures с явной маркировкой; бонусные fixtures не выдавать за работающую платформенную функцию.

## Первая поставка: spike SYNC-01

В первые 1–2 инженерных дня собрать один сценарий с выигрышем, Potion и каскадом. Общий rAF snapshot, anchored 4000ms body phase, один `impact` для FX/котла/SFX, реальный completion barrier поля, отмена и pause/resume. Добавить debug trace. Удалить принудительный music BASE из `finally` в пользу SceneMood release policy, сохранив финансовые guards.

Использовать существующий DOM и локальные PNG. Проверить WAAPI adapter; другой timeline helper допустим только с кратким ADR и теми же acceptance guarantees, без полной миграции игры. Показать, что новая схема улучшает один и тот же sample outcome по сравнению с M03, и уточнить оценку остальных пакетов.

## Затем выполнить

- SYNC-02: устойчивые symbol instances, reveal/highlight/remove/fall/refill/settle, точные числа и read holds.
- SYNC-03: единый phase source body/controller, current-round pending policy, независимые акценты и все 25 seam cases.
- SYNC-04: ModalManager для справочных/result/system окон; bonus intro/summary пока через fixtures, если их domain/schema ещё не приняты.
- SYNC-05: audio mapping, общие tier/mood, dedupe markers, mute и route/lifecycle handling.
- SYNC-06: Normal/Fast/Replay/Reduced, cancellation, hidden tab и asset failures.
- DESIGN-01: Figma motion page и raster seam/pivot/identity polish; не менять без необходимости принятую структуру экранов.
- QA-01: meaningful clock/barrier/integrity tests, review recordings, device/soak и UX comparison. Полная матрица в sync contract.

## Acceptance и handoff

Код не пересчитывает outcome, не задерживает Spin ради body и не вводит второй бонус. Все 5 циклов 4000ms с разрешённым seam; inactive/pending прошлых раундов не запускают новые празднования. Required cues завершаются однократно; отключённый звук и декор не ломают correctness. Пройти внутренние цели latency/skew, доступные real-device проверки и UX gate, указать непройденные и недоступные проверки.

Передать PR с Issue #20, ADR/tokens/cue sheets, motion lab, Figma node links, hashes/provenance изменённых ассетов, tests/trace/video/device report, список рисков и точный следующий шаг M04.2. Не объявлять milestone завершённым по одному автоматическому тесту или видео с desktop.

## Вне первой поставки

Production RTP/distribution, live wallet/resume, публичный replay entry, реальная бонусная математика, весь финальный soundtrack, покупка/обязательный переход на Spine, публикация на Stake. Эти задачи сохраняются в M04.2/backlog Issue #20 с прежними gates.
