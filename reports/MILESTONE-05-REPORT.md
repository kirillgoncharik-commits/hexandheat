# M05 — truthful base round and mobile review

03.11.2026. Issue #29. **IMPLEMENTED FOR REVIEW** для ограниченного технического пакета; human art/UX acceptance PENDING; physical-device readiness UNAVAILABLE; `productionReady=false`. M04.1/M04.2, Issue #20, production math/FS и Stake submission не закрыты.

Основная сборка: https://hex-and-heat-m03.kirill-goncharik.chatgpt.site/ . Existing project `appgprj_6ae43bec02248191866ae51ec7721ec1`, прежняя public audience сохраняется. До native deployment success URL не считается обновлённым; точные version/deployment/source SHA записываются в итоговой квитанции и PR. Runtime `review-manifest.json` привязывает конкретный GitHub source commit, config/asset/rules/fixture versions и hashes файлов. Site source SHA и GitHub SHA — разные сущности.

Ветка `agent/product/29-m05-truthful-base-mobile`, dependency PR #28 / agent/animation/20-reference-cycle / 53b9a11. V7 сохранена отдельным 4614a31. Один основной draft PR в рамках #29; ни один старый PR не слит.

## Пакеты M05

| Пакет | Статус / результат | Evidence |
|---|---|---|
| M05-00 | PASS: исходники v7 сверены, dirty work сохранён, новая ветка, актуальный baseline | docs/m05/BASELINE_RU.md; baseline.txt |
| M05-01 | PASS: один snapshot integration config, фактические base rules/units/paytable | BASE_RULES_RU.md; BASE_PAYTABLE_RU.md; assets/m05/rules.json |
| M05-02 | PASS: 12 math IDs, 9 distinct ordinary rasters, полная семантика групп/Potion/remove/cap | SYMBOL_EVENT_CONTRACT_RU.md; registry/adapter/strict validator; m05.test.js |
| M05-03 | PASS: F01–F12 resolve_round + independent verifier; F13 rejected; F14 reproduced | fixtures.json; verification.json; Python/JS tests; ownership.json |
| M05-04 | PASS implementation: cascade / accumulated / final / applied m, exact sub-cent, cap and group details | controls-qa.json; F09/F12 screenshots; formatter tests. Human comprehension PENDING |
| M05-05 | PASS implementation: A/B, A recommended, five dimensions with no main-path scroll | viewports.json; financial-viewports.json; layout and rules screenshots; compare.html |
| M05-06 | PASS candidate integration: v7 SMALL_WIN opt-in, fallback/five states retained | candidate-witch-player.js; 25 selection pairs; 4.00s/120-frame VP8 export; recording.json. Human art PENDING |
| M05-07 | PASS implementation: existing clocks/barriers/modals/ownership/4000ms preserved | scene-sync tests; 48 controls runs; F14 Normal/Fast. Perception of old dance tail PENDING |
| M05-08 | PASS bounded QA and protocol; devices/human/physical measurements separated | final-verification.txt; browser-qa.json; controls-qa.json; USER_REVIEW_SCRIPT_RU.md |

## Проверка условий приёмки

| # | Условие | Результат и доказательство |
|---|---|---|
| 1 | База и более свежая работа | PASS — Site v7 runtime совпал с dirty local source; checkpoint 4614a31; original folder untouched |
| 2 | Разные math IDs не скрыты одной visual identity | PASS code/assets — 9 ordinary assets, high/low shapes, 3 large Potion values; human recognition PENDING |
| 3 | Позиции groups/Potion/removal проходят до сцены | PASS — independent events vs mapped events + actual DOM/identity tests |
| 4 | Основной review использует проверенный pack | PASS source — ReviewRgs default F06; all valid cases independently verified; legacy tools labelled separately |
| 5 | Суммы/cap/итог согласованы | PASS — engine unchanged; computed vs paid adapter metadata repaired; cap two-group test; LUT payout hash unchanged |
| 6 | Момент действия нового множителя явный | PASS implementation — win at old m, Potion from→to, next cascade, F09 exact .20 at ×3; human explanation PENDING |
| 7 | Sub-cent не исчезает | PASS — F12 .002, formatter .001/.000001, actual controls Normal/Fast/Reduced/replay |
| 8 | Mobile functional dimensions | PASS viewport — 360×640,390×844,480×320,1366×768,1440×900; ≥44px controls,6:5,no scroll; real devices UNAVAILABLE |
| 9 | Candidate loop в сцене | PASS integration — v7 SMALL_WIN opt-in; fallback default; art acceptance PENDING |
| 10 | 4s и sync сохранены | PASS automated — five 4000ms states/25 pairs, ownership, pause/cancel, F14; human transition quality PENDING |
| 11 | Прозрачные статусы/evidence | PASS — этот отчёт, JSON/logs/screenshots; непроверенное не отмечено PASS |
| 12 | Code/docs/fixtures/PR/manifest | PASS source package — regenerate --check, single config hash, source packaging guard; exact PR/publication metadata in receipt |
| 13 | Публикация или воспроизводимый local build | Prepared from saved source; native publication result recorded separately before final handoff; tools/build_m05_review.py reproduces dist |
| 14 | Human review + следующий этап | PASS preparation — 6–8 adult participant protocol, manual device/art checks; participation itself PENDING |

Baseline: 73 tests, PASS. Final: **3 repository/asset + 17 math/replay + 65 JavaScript = 85 tests**, PASS. Никакие проверки/thresholds не ослаблены. `python3 tools/verify_milestone.py`; `python3 tools/generate_m05.py --check`. Генератор, paytable, weights, Potion values и cap не менялись. Поменялись только adapter metadata, generated event books и display contract; общий payout/LUT hash `c7970b2923cb369b0d91fb9e68b892009092cfa66c5c3d1fe276bfb1ddd50314` / `2ac6f2147f1bafa30b3fc08060023a056e53c94f7ef044c0469ee7e2071c89f3` сохранены.

Browser DOM matrix: 48/48 Normal/Fast/Reduced/local replay; actual BoardPlayer/CueDirector, terminal board/multiplier/total, no reconciliation/fallback. Fault injection: symbol fallback, candidate decode failure, unavailable AudioContext, active-clock pause/jank. 25 renderer selection pairs preserve other states. Accelerated soak: 720 rounds / 1800000ms active time; 30 DOM cells, zero retained transport listeners. Separate 3600-round data/wallet/replay soak passes. These are deterministic/accelerated equivalence checks, not 30-minute physical-device/FPS certification.

Actual-controls matrix: 48/48 through game buttons at real presentation speed, 186263ms measured run. Includes repeated click one debit, final amounts, all terminal boards/multipliers, ready controls, modal Space/focus ownership and local replay without balance mutation. Five viewport F09 runs additionally injected a real 200ms busy main-thread delay, preserved .20/×3 and a long balance US$8,999,999,999.20 with no horizontal amount overflow. Main scene, win/Potion and open rules screenshots exist at each required size.

F14 diagnostic (muted browser inspection; audio ownership отдельно в automated tests): `?sequence=F14&speed=normal` or fast. It plays two bounded sample rounds, waits for the existing SMALL_WIN seam, then shows a new loss while that protected body finishes. Exact snapshots in ownership.json. After capture the explicit diagnostic pauses; P resumes. This is a test path, not an autoplay product mode. Old pending reactions are cleared; new loss shows zero and “No cascade win”. Final amount remains visible when selecting the next scenario until the next round actually starts. Perceptual ambiguity of the remaining body tail requires human review.

Recording: `../hexheat-m05-media/m05-small-win-candidate.webm`, SHA/metadata in recording.json. Browser native decode: duration4.00s,1408×1792;120 timestamped VP8 frames. Source is the same v7 retarget/mesh. Initial host captureStream recordings were truncated; they were replaced by a deterministic WebCodecs/WebM export. This is a reproducible loop export plus main-scene screenshot, not evidence of measured 30FPS gameplay or a native Spine project. Heavy recording and original masters are outside Git; paths/checksums retained.

## Ограничения

- **Code**: bounded critical symbols/payout/removal checks PASS. Production balance/LUT weights, one complete FS/retrigger/carry, live RGS recovery/wallet and public sessionless replay remain separate tasks; sample replay does not close HH07, fixtures do not close HH03.
- **Art**: v7 source preserved, candidate available. Human identity, shoulder/hair/sleeve intersections, foreshortened hands, cloth/foot contact, entry/exit and seam velocity remain PENDING. Other four cycles are preserved, not newly generated. No licensed Spine editor/runtime/.spine claim. Heavy masters/recording retained locally; migration to an approved external media store has not been performed.
- **UX**: A is an engineering recommendation; F06/F07/F09 comprehension, old dance/new loss, symbol recognition and 6–8 real participant observations PENDING. No retention/market claim.
- **Devices**: physical iOS/Android/Safari, FPS30 target, input≤100ms p95, physical AV≤50ms p95 and real-time device soak UNAVAILABLE, not passed by viewport emulation.
- **Inputs**: original 21-card backlog DOCX and native Figma capability unavailable. Editable HTML/CSS and factual HH01–HH21 overlay supplied; original cards not overwritten. No invitations, purchases, terms acceptance or Stake submission.

Next action: independent M05 technical/math-metadata review and PO art/UX/device acceptance. Then a separate production math + one FS task, with approved rules/weights/independent verifier and live integration gates.
