# M07 — постановка поля

Источник результата — immutable book. Presentation не пересчитывает сумму, группы или multiplier. `motion-tokens.js` version `m07-field-1`; `ScenePresentation` и `BoardPlayer` используют общий SceneTransport и round generation CueDirector.

Normal: reveal420ms; group count250ms, общий focus140ms, затем каждая окончательная группа500ms; remove180ms; fall400ms + bounded column stagger5×28ms; settled80ms; Potion500ms; final450ms. Fast: reveal180ms, count60ms, focus60ms, group250ms, remove100ms, fall220ms +5×12ms, settled40ms, Potion250ms, final250ms. Body loops не задерживают поле. Для двух/трёх групп read time закономерно больше baseline; измеренные round durations сохраняет controls suite. Это предложенная постановка, не художественно принятый темп.

Win: точное объединение всех paid positions; неплатящие приглушены. Затем отдельная группа получает общий оттенок и строку `count × symbol · base amount × current multiplier = paid`. Связующих линий нет. При cap формула заменена на paid + CAP; computed остаётся в диагностике. Счётчик round total увеличивается на paid ровно один раз, final фиксирует тот же total.

Potion: активируется только событием multiplier после завершённой текущей выплаты. Энергия идёт из реальных позиций к plaque; multiplier остаётся старым до impact на80% маршрута. Текст показывает old→new и сумму increment. Следующая выплата использует новый multiplier. После quiet terminal последняя Potion не умножает прошлое. Число эффектов ограничено количеством Potion на board; DOM nodes удаляются при конце, отмене/смене раунда и destroy.

Cascade: pulse/исчезновение настоящего removed set; сохранённые объекты перемещаются в authoritative targets. В новых символах сохранён раздельный вертикальный старт; порядок survivors неизменен. Win/Potion/group classes сбрасываются до падения. После падения небольшой settled hold, затем следующая оценка.

Reduced: без больших перемещений, без Potion route, с тем же порядком/группами/точными суммами. Fast сокращает декорацию, Replay повторяет исход. Pause останавливает общие active clocks; timeout тоже в active time. Новая round generation отменяет старые неначатые cues. Нейтральная ведьма включена по умолчанию; `?witch=m06` сохраняет прежний кандидат для интеграционных проверок.

Loss завершается без победного звука/заголовка. Выплата ниже ставки — сдержанный тон; SMALL и MEDIUM различаются финальным accent/цветом, BIG получает существующее result window и отдельный accent; cap имеет собственную подпись. Новый body repertoire пока не произведён, поэтому различие персонажа в спокойном режиме намеренно отсутствует. Полнота artistic tier repertoire остаётся OPEN.

Звук — временные Web Audio oscillators: reveal/landing/dissolve/win/Potion/soft/medium/big, deduplicated по round/event key. Это синхронизационный прототип, не production soundtrack. Mute не влияет на исход.

Marker inspector: `/?fixture=B05&inspect=1`. Сначала ручной Spin; выбрать группу/paid/Potion/remove/fall/settled/final. На выбранном marker active clock останавливается, Continue идёт до следующего такого marker. Это review-инструмент; при обычном запуске отсутствует.
