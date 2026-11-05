# M07 — визуальная бета, первый пакет для просмотра

05.11.2026 · Issue #33 · branch `agent/visual/33-m07-beta-field`.

Запущен по прямому поручению PO «погнали работать над новым майлстоуном». Приложенный анализ сохранён как `INPUT_BRIEF_RU.txt`: его исторические заявления не заменяют новую проверку. Runtime база — актуальный PR #32, HEAD `7392b93a22a1c17fcd749b618fc17f4f5764dbe7`, сверенный через GitHub и fetch. PR #30 остаётся его базой. Ни один прежний PR не слит. Исходная M06 копия не изменялась; новая работа в отдельном worktree. Baseline: 3 repository + 17 math/replay + 73 JS = 93 PASS.

Existing Site `appgprj_6ae43bec02248191866ae51ec7721ec1`: до работы live v9, Site source `3fceb33ab546a43fa87aade73b6fa7b97a7c08d8`. Source helper сверил существующую копию; audience public сохраняется. Это отдельный репозиторий Site, не игровой GitHub ref.

## Реализуемая поставка

A. Сохранён F01–F14. Отдельный M07 pack: B01–B20 и семь дополнительных вариантов, 45 ordinary/tier + 135 граничных symbol/count cases. Только explicit pinned inputs → неизменённый resolver → независимый verifier → Stake-format book. Новые правила/веса/экономика не вводятся.

На основном экране виден selector и кнопка следующего сценария. «Разные раунды» — фиксированный curated playlist с seed/cursor в URL, следующий исход запускается вручную. Выбор/Next сохраняют последний результат до нового Spin. Replay повторяет исходный book и не меняет баланс. Полный config/book hash и ожидаемые группы доступны в Settings → диагностика. Эти инструменты скрыты при `?rgs=local`; это не production surface.

B. Golden B05: два разрозненных набора → раздельные paid awards → P1 → ×1→×2 → H2 каскад → final 1.9×. Группы показаны по очереди, суммы не перекрывают поле. Обычные symbol ID badges скрыты; +1/+2/+3 сохранены. Траектории новых символов не стартуют все в одной клетке; survivors сохраняют DOM instance и теряют старые highlights. Общие clocks управляют группами, полётом Potion, падением, settle и временными звуковыми accents.

C. Новый лист восьми перерисованных ключевых поз произведён встроенным image_gen с оригинальным `m06/neutral.png` как identity reference. Он показан отдельно в `/m07-art.html`; это концепт, не PNG-loop. Face/anatomy/gesture review PENDING. Поза 1 и 8 различаются; C1 seam и интервалы не проверены. В игре по умолчанию спокойный портрет для оценки поля; прежние M06 кандидаты доступны в Settings.

## Раздельные статусы

| Область | Статус |
|---|---|
| Scenario pack / selector / field implementation | IMPLEMENTED FOR REVIEW |
| Новые books и exact mapping | INDEPENDENTLY VERIFIED, см. verification.json/tests |
| Браузерные controls/viewport | Только фактически сохранённые результаты в reports/m07 |
| Поле: читаемость/темп/понимание PO | ART / PRODUCT REVIEW OPEN |
| M06 танец | REWORK по входному отзыву PO |
| M07 8 key poses | PRODUCED; human art review PENDING |
| Новый SMALL_WIN 4000ms / IDLE | NOT PRODUCED; после разбора поз |
| Новые MEDIUM/BIG/BONUS | NOT PRODUCED; после принятого эталона |
| Physical iOS/Android, hardware thermal/memory/input/AV, 30min soak | OPEN / UNAVAILABLE |
| 6–8 взрослых участников | NOT RUN |
| Полная visual beta acceptance | OPEN |

Golden field review и key-pose review — конкретные следующие точки решения. Производство пяти циклов из непроверенного листа не выдаётся за завершение C/D. M07 в целом не закрыт. Реальные средства отсутствуют; curated outcomes не моделируют hit rate/RTP. Production math/LUT/FS/live recovery/public replay/Stake submission остаются отдельными задачами. Production autoplay, bonus buy и покупки не добавлены.
