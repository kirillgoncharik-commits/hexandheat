# M06 — крупная сцена и два PNG-кандидата

04.11.2026 · Issue #31. **Review package; human art acceptance PENDING, physical device gate OPEN.** `productionReady=false`, sample outcomes, no real funds. Это техническая поставка к просмотру, не продуктовое закрытие M06 и не Stake release.

Основа: PR #30, актуальный GitHub delivery `586d2f3`; сохранённая локальная подготовка `05c9d1d`. До работы Site v8/source `84d64e9`, runtime GitHub `8b6fee8`. Работа в `agent/animation/31-m06-media-mobile`, PR направлен на ветку M05; предыдущие PR не слиты. **Existing Site version9 опубликована, native status succeeded.** GitHub runtime `6dc59ae6cce1f51b9f1a413722a9c761ce291262`; отдельный Site source `3fceb33ab546a43fa87aade73b6fa7b97a7c08d8`; deployment `appgdep_6aeb19b0a820819191267f69bf83cf56`. [Review](https://hex-and-heat-m03.kirill-goncharik.chatgpt.site/?witch=m06), [draft PR32](https://github.com/kirillgoncharik-commits/hexandheat/pull/32). Квитанция `reports/m06/deployment.json`; runtime hashes `/review-manifest.json`.

Результат:

- Portrait hero180/240/265px над полем; компактный котёл; Spin в нижней зоне без сдвига на выигрышах. На360×640 минимум лица44.92px,390×844 —48.84px,430×932 —54.07px,844×390 —34.60px,480×320 —30.04px. Landmarks лоб→подбородок на всех выбранных кадрах, не размер canvas. Все7 viewport PASS, portrait cells≥42px, targets≥44px, ratio6:5, без основного scroll. F09/long amounts/modals PASS. `layout.json` и MOBILE_COMPOSITION_RU.md.
- **Два новых authored candidate clips**, IDLE и SMALL_WIN, исходный взрослый образ v7. Новые asymmetric staging curves, breath, head inclination, ограниченная eyelid/smile mesh deformation, delayed hair/cloth. Прежняя CMU фраза не переэкспортирована.4s, общий pose/C1 seam.208 согласованных PNG во всех6/8/12 вариантах, прямые timestamps, отдельные endpoint controls. Source hashes и reproducible exporter зарегистрированы.
- Основной кандидат **PNG420×336: IDLE6FPS/40ms, SMALL_WIN12FPS/20ms**. Download двух выбранных наборов+poster3,930,581B (3.748MiB); initial poster+IDLE1,365,764B (1.303MiB). CPU decoded38.76MiB, CPU+GPU77.52MiB до canvas/poster/driver overhead — расчёт, не инструментальное измерение. Все альтернативы загружаются только в сравнительном стенде. Видео motion master NOT PRODUCED; WebM preview экспортирует эту же PNG-постановку.
- Main Settings → M06 / `?witch=m06`; переключение на seam. Прежний renderer сохранён. MEDIUM_WIN/BIG_WIN/BONUS: neutral той же семьи, coverage явно диагностируется. Canvas blending, bounded preload/decode, timeout/poster, Reduced cleanup, pause/modal/visibility, late-ready seam и destroy. Media не владеет settlement и не блокирует Spin.
- `/compare.html` — M05/M06 на одной фазе/viewport; архив старого сравнения сохранён. `/media.html` —6/8/12, fade0/short, scrub/pause,120s cadence и loop export. `/m06-qa.html` — измеримая вёрстка, `/controls-qa.html?m06=1` — реальные48 сценариев. Исходники HTML/CSS редактируемые; native Figma не изменена.

Проверка:

- Baseline85 PASS. Final93 PASS (3 repository/asset +17 math/replay +73 JavaScript); verifier и генератор M05 — фактический лог `reports/m06/verification.txt`; новые asset/timestamp/seam/lifecycle/fault tests добавлены без ослабления существующих.
-48/48 actual controls: Normal/Fast/Reduced/local replay, exact terminal board/multiplier/amount, repeated click one debit, Replay не меняет баланс, modal Space/focus. `reports/m06/controls.json`.
-Browser F14 Normal/Fast: old SMALL_WIN body + new zero result, Spin enabled; `f14.json`. Injected decode/manifest failures retain F09 0.20/×3 and available Spin (`faults.json`).
-7/7 viewport: `layout.json`; одинаковые snapshots M05/M06 и scene captures в `reports/m06/`.
-30min active-clock sampling no drift;200 transitions and cleanup/decode/late-seam tests. Это ускоренная проверка, не30мин device wall-clock soak.
- Browser wall-clock cadence:30 IDLE и30 SMALL_WIN self-loops,120s на состояние,0 missed poses на6/8/12. IDLE p95≤15.80ms; SMALL_WIN p95 16.60–16.73ms (верхний результат на0.07ms выше ориентира16.67ms одного60Hz кадра). Max включает первый отсчёт текущей позы в произвольной фазе; его нельзя трактовать как чистую renderer latency. Это desktop measurement, не mobile certification. JSON `cadence-*.json`. p95/missed poses зафиксированы фактически, без обещания hardware-mobile FPS. Записи PNG loops сохраняются вне Git, их checksum/paths — `recordings.json`.
- `git diff 586d2f3 -- math apps/web/assets/m05 apps/web/src/domain.js apps/web/src/stake-events.js apps/web/src/stake-rgs.js apps/web/src/review-rgs.js` пустой: финансовый исходник/конфигурация/fixtures неизменны. generate_m05 --check PASS.

Открыто:

1. PO art/identity/hands/face/seam/gesture и layout ACCEPTED/REWORK. Экспортный manifest содержит EDITED — ART REVIEW REQUIRED; technical checks не являются художественным решением. Нужен просмотр на реальном размере, в особенности короткий crop360 и compact landscape; IDLE сознательно сдержанный, полноценного поворота головы/iris tracking нет.
2. Физические iOS Safari/Android/desktop Safari, cold/warm throttling, memory/thermal/input/AV p95 и30мин реального device soak — UNAVAILABLE. Chromium desktop проверен, узкий viewport не назван телефоном.
3. Качественный video-generation/master отсутствует. PNG это самостоятельный путь, сравнение с отсутствующим видео не объявлено codec benchmark. Полноценная запись игрового экрана на физических устройствах не сделана; source-loop exports и main-scene snapshots доступны.
4. Native Figma и исходный backlog DOCX недоступны. M05 work task прочитан; scope HH13/15/16 покрыт в пределах M06. Новые внешние лицензии/покупки/production math/FS/recovery/submission не выполнялись.

Воспроизведение: `python3 tools/verify_milestone.py`; `python3 tools/generate_m05.py --check`; `CODEX_PRIMARY_RUNTIME_NODE_MODULES=<bundled-node_modules> node tools/export_m06_media.mjs <output-dir>` (сравнить manifest SHA); `node apps/web/scripts/dev-server.js 4176`. Сборка сохранённого commit: `python3 tools/build_m06_review.py <existing-Site-checkout>/dist`.


Опубликованный smoke PASS: manifest source/media hash совпали; F12Fast0.002 при ставке0.01,30 клеток, доступный Spin; Replay сохранил99.992 без нового списания. `published-manifest.json`, `published-smoke.json`, `published-360x640.png`. Manifest прочитан в обычном браузере; отдельный неавторизованный HTTP-клиент вернул403, поэтому его file-by-file проверка не объявляется пройденной. CI source6dc59ae [success run41822731146](https://github.com/kirillgoncharik-commits/hexandheat/actions/runs/41822731146). Последующий receipt-only commit не меняет опубликованные runtime/code/assets.
