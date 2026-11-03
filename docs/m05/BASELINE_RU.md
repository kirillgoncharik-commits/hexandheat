# M05-00 — подтверждённая база

03.11.2026. Issue #29. Рабочая ветка `agent/product/29-m05-truthful-base-mobile`.

| Источник | Ветка / commit | Сборка | built / integrated / accepted |
|---|---|---|---|
| GitHub PR #28, открыт | agent/animation/20-reference-cycle / 53b9a11aff738193c999a850ac3ed6d81c80488e | Reference v6; игровой renderer v3 expressive | built; main scene v3 integrated; human art acceptance OPEN |
| Исходная dirty рабочая папка hexandheat-m04-animation | тот же HEAD + 18 изменённых/новых файлов v7 | Reference v7 | built; только лаборатория; не accepted |
| Existing Site v7 source repository | main / 52c45bcb8ca241bbaef412e74193399a4522ee85 | опубликованная v7 | built/deployed; отдельно от GitHub ref |
| Сохранённая v7 в новой ветке M05 | 4614a31 | те же исходники и 4 текстуры v7 | reproducible built; main scene opt-in в M05; art acceptance PENDING |
| M05 | текущая ветка, точный commit в опубликованном review-manifest.json | основной M05 pack / layout A | implementation for review; productionReady=false |

Site исходники получены штатным source helper в отдельную папку hexandheat-m05-site. `diff -qr` исходной apps/web и dist v7 выявил только `data-review-mode="mock"` в index.html и отсутствующий на Site reference-cycle.test.js. Все runtime JS/CSS, reference HTML, motion arrays и рабочие текстуры совпали побайтно. Остальные dirty изменения — исходная документация, tests, exporter и provenance. Они сохранены отдельным коммитом перед изменениями M05. Исходная рабочая папка осталась нетронутой. SHA Site не использовался как GitHub ref.

GitHub перепроверен: открыты #13/#14/#16/#18/#21–#28; самый свежий head #28 — 53b9a11. Main bootstrap не взят за основу. Ничего не слито, не закрыто и не переписано force push. Issue #20 остаётся открытой. Новая реальная задача: https://github.com/kirillgoncharik-commits/hexandheat/issues/29 .

Baseline до M05: `python3 tools/verify_milestone.py`, PASS: 3 repository/asset + 14 math/replay + 56 JavaScript = 73. Полный фактический лог: reports/m05/baseline.txt. Падений baseline нет. Python 3.9+ / Node 20+; фактический Node 24.9.0. Generated integration book регенерирован после расширения метаданных; payout/LUT SHA сохранён, event/book SHA закономерно изменился.

Команды:

```sh
python3 tools/generate_m05.py --check
python3 tools/verify_milestone.py
node apps/web/scripts/dev-server.js 4175
```

Открыть http://127.0.0.1:4175/ — default использует ReviewRgs и только проверенные fixtures. `?rgs=local` оставлен для integration tools; это не live RGS. `/qa.html` — реальный DOM с ускоренными часами; `/controls-qa.html` — реальные controls/replay в обычном времени. `/compare.html` — редактируемые варианты и общий pose.

Ограничения входов: HexHeat_Product_Backlog_2026-11-03.docx отсутствует в Downloads и synced sources; HH-реестр ниже является overlay по явному scope ТЗ, исходные 21 карточка не переписывались. Native Figma capability отсутствует, HTML/CSS comparison предоставлен. Оригинальные v7 masters доступны рядом в hexheat-reference-cycle-media, provenance/checksums сохранены; тяжёлые masters в Git не добавлялись. Эти ограничения не блокируют независимый код.

Старые phase gates интерпретируются с учётом прямого поручения M05: разрешены bounded code, existing art reuse и обновление existing sample review; не разрешены production math lock, submission, новые modes, покупки или принятие terms.
