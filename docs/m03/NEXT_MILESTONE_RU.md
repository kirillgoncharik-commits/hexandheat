# Hex and Heat Архитектура запуска и задание M04

Дата 30 октября 2026. M04 начинается после визуального ревью M03. Его результат - release candidate для проверки в Stake Studio. Публикация и принятие коммерческих условий в этот этап автоматически не входят.

## Архитектурные границы

1. **Math pipeline**. Утверждённая конфигурация символов, выплат, Potion, Free Spins и cap → pinned Math SDK → weighted outcome books → независимый verifier → index.json, CSV и jsonl.zst. Генератор и verifier должны быть независимыми реализациями важных расчётов. Шесть примеров PR #18 нельзя использовать как production probability distribution.
2. **Stake platform boundary**. RGS выбирает book, ведёт баланс и active round. Frontend не содержит генератора случайного результата или бизнес-бэкенда. Static build размещается на Engine CDN; относительные пути ассетов. Local/mock RGS существует только в dev/test.
3. **Launch and session**. URL parser различает normal/replay до любой сети. Normal: валидировать launch config, authenticate, прочитать currency, betLevels/minBet/maxBet/stepBet, jurisdiction, gameModes, active round/event cursor. RGS host берётся из launch параметра, нормализуется по официальному контракту и валидируется. Строка без scheme не должна становиться относительным URL. Нет production demo-session fallback.
4. **Outcome adapter**. Проверяет структуру, версии, индексы, размеры поля, границы значений и terminal payout. Конвертирует Stake events в immutable domain events без изменения результата. Неизвестный event останавливает раунд и включает безопасное восстановление.
5. **Round coordinator**. READY → REQUESTING → PRESENTING → SETTLING → READY. Отдельные RECOVERING/SESSION_EXPIRED/RESTRICTED. Один play на нажатие; один активный раунд. Проверять `round.active`: zero-payout может уже закрываться ответом play и не требовать end-round. Не выдумывать новый balance при пропущенном ответе.
6. **Resume and checkpoints**. После ambiguous play повторить auth, а не play. Сохранённый book и `/bet/event` определяют presentation cursor. Reload не меняет ставку и mode активного раунда. Checkpoint не является дополнительной ставкой. Разделить ошибку сети до outcome, после outcome и при settlement; при неизвестном settlement status reconcile по auth.
7. **Presentation**. Board reducer, timeline, win counter, FX, audio и character player получают события только для чтения. Обязательное UI feedback имеет barrier; ведьма и декор barrier не блокируют. Normal/Fast/Reduced Motion/Replay сходятся в один итог. Сумма текущего каскада, total и final win не смешиваются.
8. **Asset service**. Manifest с hash, MIME, размерами, pivot, state/frame и provenance. Shell/board/idle - critical; реакции и звук - deferred. Ошибка decode включает static fallback. Runtime не генерирует AI-арт. Общий интерфейс WitchPlayer позволяет заменить RasterWitchPlayer на Spine без правки math или wallet.
9. **Content service**. Versioned rules content генерируется из math config; i18n и social словари отдельно. Mandatory content completeness проверяется в release build. Изменение math checksum требует повторной генерации rules и replay fixtures.
10. **Replay entry**. `replay=true` разбирается до session init. Из game/version/mode/event/rgs_url строится GET. Ответ поддерживает официальный `state`, payoutMultiplier/costMultiplier и отсутствие session. Без wallet endpoints. Сумма/валюта/язык optional: invalid optional значения не ломают replay. 404 может не иметь JSON body.
11. **Build and release**. Reproducible static directory с nonempty index.html; pinned dependencies; хеши фронтенда, math и content; smoke в CSP Engine; никакой внешней аналитики, remote fonts, секретов. Release manifest связывает frontend version, math version, asset version, rules version и replay event IDs. Логи редактируются, session identifiers не выводятся.

## Разрыв между этим контрактом и текущим кодом

`StakeRgs` в PR #18 пока имеет локальный default session, не нормализует bare rgs host, не восстанавливает active round, игнорирует min/max/step при fallback levels и всегда пытается settle. `getReplay` зависит от session/lastRound и не является отдельным публичным entry. В `domain.js` нет bonus events и вывод денег ограничен двумя знаками. CSP разрешает только same-origin connect; production RGS origin необходимо безопасно согласовать с Engine hosting. M03 эти финансовые контракты не меняет; это обязательные задачи M04, а не косметические замечания.

## Рабочие пакеты M04

| Пакет | Владелец роли | Выход | Проверка приёмки |
|---|---|---|---|
| M04 A Math and rules lock | math engineer плюс независимый reviewer и PO | Конфигурация base + один Free Spins, распределение, статистика, все modifier values, rules export | Совпадение CSV/book, точный weighted RTP, cap exposure, bonus frequency и hit rate; актуальные critical tests Studio; независимый sign-off |
| M04 B Session and wallet | frontend/integration engineer | Production URL/auth/bet/play/end/resume/errors | Mocked contract tests плюс live Studio: active/closed round, lost response, expired session, reload, insufficient balance; ни двойной оплаты, ни потерянного выигрыша |
| M04 C Public replay | frontend/integration engineer | S26–S29 без session | Нет auth/wallet/play/end запросов; 404 без JSON; Play/Play Again; optional params; Popout S; по пять event ID на mode |
| M04 D Bonus timeline | game frontend | S13–S16 и расширенная event schema | Один book и одно списание; retrigger только если утверждён; multiplier reset по rules; normal/fast/replay дают один итог |
| M04 E UI and content completion | UI engineer и designer | Все S01–S30 с фактическими числами, count-up, каскады, точная валюта, локализация/social | Полная traceability, keyboard/modal focus, zero and sub-cent win, все auth bet levels, читаемый Fast, mobile/popout |
| M04 F Art and animation refinement | 2D artist/animator | Исправленная identity/seam, чистые alpha, символы 64px; raster polish или настоящий Spine | Side-by-side review, 20 transitions, Reduced Motion, low-tier FPS/memory; Spine version/atlas/runtime совместимы |
| M04 G Audio and QA | sound designer, QA, release owner | Оригинальные stems/SFX, устройство matrix, QA report, release archive | Реальные iOS/Android/Safari, 30 min soak, сеть/console без ошибок, mute и lifecycle, hashes/rights/security review |

Внутренняя оценка после доступа к Studio и утверждения механики: 8–12 рабочих дней для integration/content/bonus/QA плюс 3–5 дней math review и 2–4 дня art refinement, часть задач можно совмещать. Это оценка объёма, не обещанный календарь. Работа математика, лицензии Spine, согласование контента и доступ к Studio могут изменить срок. Бюджет не одобрялся; покупки не начинать.

## Порядок исполнения

Сначала A и контрактный audit B/C, затем B/C/D/E, затем F/G и live QA. Не закреплять payout numbers и trigger copy до A. Весь branch содержит `productionReady=false`, пока все release blockers не закрыты. Старые PR #14/#16/#18 и M03 должны быть reviewed как stack; merge порядок определяется ревью, main не переписывается.

## Gate готовности к submission

- Все mandatory platform rows имеют evidence, а не только макет.
- Frontend и math versions опубликованы в Studio и соответствуют release manifest.
- Для каждого mode есть loss, normal, big, cap и bonus replay IDs если применимо.
- Нет TBD в production rules/paytable; суммы, лимиты, feature rules совпадают с math.
- Реальные устройства, compact, locale/currency/social, resume и network faults пройдены.
- Оригинальность, авторские права, содержание и runtime лицензии проверены человеком.
- Account-specific checklist повторно прочитан в Studio; KYB/contracting entity и distribution решены PO.
- PO и технический reviewer разрешили отправку. Создание preview на Sites этим разрешением не является.

После approval допускаются главным образом мелкие визуальные правки; math/modes/mechanics необходимо завершить до отправки. Источник: [Stake approval](https://stake-engine.com/docs/approval-guidelines), проверено 30.10.2026.
