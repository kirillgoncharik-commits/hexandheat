# M04 — motion guide для дизайна и Figma

Статус: первая исполняемая итерация, 01.11.2026. Runtime source: `apps/web/src/motion-tokens.js`. Live review: `/motion.html`.

| Этап | Normal | Fast | Завершение |
|---|---:|---:|---|
| Reveal | 420ms | 180ms | Все symbol nodes в конечном положении |
| Win | 750ms | 310ms | Count-up ≤250/60ms; затем чтение не менее 450/250ms |
| Potion | 500ms | 250ms | Exact multiplier, общий glow/SFX marker, возврат свечения |
| Remove | 180ms | 100ms | Выигравшие узлы исчезли |
| Fall/refill | 400ms + 5×28ms | 220ms + 5×12ms | Устойчивые конечные координаты всех колонок |
| Final | 450ms | 250ms | Точный payout, без смешивания current cascade и total |
| Modal enter / exit | 220 / 160ms | 220 / 160ms | Commit opacity/position, focus ownership |
| Body | 4000ms | 4000ms | Только seam; 4 позы ×1000ms |

Easing — cubic out для входов и падения. Цифры не имеют overshoot. Column stagger — преднамеренный сдвиг; light/cauldron/SFX одного impact имеют один marker. Reduced Motion оставляет точные значения, читаемость и focus, убирает перемещение/scale и фиксирует кадр ведьмы.

Справочные окна, Big Win и BONUS motion fixture используют один ModalManager. Реальные max-win/bonus/system flow и их данные ещё входят в оставшиеся интеграционные задачи; motion fixture не выдаёт награду или Free Spins.

Для Figma подготовлена редактируемая векторная доска `design/M04_MOTION_BOARD.svg`: тайминг, слои, body grid, окна и checklist S01–S30. Импортировать на страницу `M04 / Motion & Timing` существующего файла, сохранить исходные screen IDs и добавить связь с journey. Atlas импортируется отдельно из `apps/web/assets/witch/witch-atlas-m04.webp`.

**Native Figma page не обновлена в этом code slice:** подключённого Figma инструмента в этой сессии нет. SVG и регламент подготовлены для продолжения в исходном файле. Это открытый deliverable, а не выполненный native export.

Чеклист каждого screen node: trigger → enter → impact/readable → exit; источник данных/текста, required barrier, доступность Spin/keyboard, fallback, Normal/Fast/Reduced, мобильное поведение. У S13–S16 и S26–S29 явно отличать fixture от интеграции.
