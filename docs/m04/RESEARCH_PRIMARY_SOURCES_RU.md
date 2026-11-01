# Исследование: как согласуют игровые анимации

Проверено 01.11.2026. Изучены документация движков и открытый scatter example SDK. Внутренний код коммерческих игр на Stake не исследовался; приписывать конкретной студии скрытую архитектуру оснований нет. Ниже отделены подтверждённые механизмы от наших проектных решений.

## Подтверждённые подходы

| Источник | Как реализовано | Что берём для Hex & Heat |
|---|---|---|
| [Stake Development Kits: flowchart](https://engineio.github.io/math-sdk/fe_docs/flowchart/) | `playBookEvents` последовательно ожидает handlers; `broadcastAsync` ждёт Promise-ответы компонентов | Последовательность book events и барьеры завершения, а не цепочка предполагаемых задержек |
| [Stake SDK: task breakdown](https://engineio.github.io/math-sdk/fe_docs/task_bd/) | Tumble разделён на init, explode, remove, slideDown, settle; взрыв и падение ожидаются отдельно | Поле оформляем как несколько проверяемых этапов; одновременно запускаем только действительно параллельные действия |
| [Phaser: Time](https://docs.phaser.io/phaser/concepts/time) | Scene Clock задаёт время систем сцены и поддерживает управление временем | Одна политика pause/resume и времени сцены; миграция на Phaser не нужна |
| [PixiJS 8: Ticker](https://pixijs.com/8.x/guides/components/ticker) | Общий per-frame update, порядок listeners; `minFPS` ограничивает delta | Один порядок обновления; не интегрировать музыкальную фазу из clamped delta и не путать ticker с готовым режиссёром событий |
| [Spine: Applying Animations](https://esotericsoftware.com/spine-applying-animations) | AnimationState: очередь, mixing, tracks и update/apply | Основное тело отдельно от локальных реакций; переходы на разрешённых стыках; один источник времени |
| [Spine: callbacks / mixing](https://us.esotericsoftware.com/spine-unity-events) | `Complete` у loop приходит каждый оборот; `End` означает удаление; события при mixing регулируются EventThreshold | Отдельно определять seam и cleanup, привязывать callback к конкретному entry, исключать двойные SFX. C# пример не копируется в web |
| [GSAP: Timeline](https://gsap.com/docs/v3/GSAP/Timeline/) | Timeline объединяет вложенные анимации, общий play/pause/seek и относительные позиции | Партитура с labels `impact`, `readable`, `exit`; перестановка одного этапа не требует переписывать все задержки |
| [Web Animations: currentTime](https://developer.mozilla.org/en-US/docs/Web/API/Animation/currentTime), [finished](https://developer.mozilla.org/en-US/docs/Web/API/Animation/finished) | Время анимации можно задавать, в том числе на паузе; есть Promise завершения воспроизведения | Нативный кандидат для существующего DOM; отмена и завершение управляемых вручную cues требуют нашего явного контракта |
| [Web Audio sequencing](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques) | Lookahead заранее назначает звук на audio clock; рисование живёт отдельно | Звук планируем по точному времени, а не считаем `setTimeout` моментом звучания. 25/100 мс в статье — пример, не стандарт |
| [AudioContext.getOutputTimestamp](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/getOutputTimestamp) | Пара contextTime/performanceTime связывает оценку аудиовыхода с performance clock | AudioClockAdapter и измерение сдвига; браузер и аудиоустройство не имеют буквально одних физических часов |
| [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) | Timestamp общий для callbacks кадра; частота зависит от экрана; фоновые callbacks обычно приостанавливаются | Считать время по timestamp, не по числу кадров; политика возврата обязательна |

## Проверка открытого SDK по коду

Проверен конкретный snapshot `engineio/web-sdk@1843d60cedb94b390e641b563f32ad64353bec5e`. Это исследованный пример, не решение обновить зависимость нашего проекта.

- [createPlayBookUtils.ts](https://github.com/engineio/web-sdk/blob/1843d60cedb94b390e641b563f32ad64353bec5e/packages/utils-book/src/createPlayBookUtils.ts): `sequence` и `await playBookEvent`.
- [createEventEmitter.ts](https://github.com/engineio/web-sdk/blob/1843d60cedb94b390e641b563f32ad64353bec5e/packages/utils-event-emitter/src/createEventEmitter.ts): fire-and-forget `broadcast` и `broadcastAsync` через `Promise.all`.
- [scatter/bookEventHandlerMap.ts](https://github.com/engineio/web-sdk/blob/1843d60cedb94b390e641b563f32ad64353bec5e/apps/scatter/src/game/bookEventHandlerMap.ts): explode и slideDown ожидаются по очереди; win counter также ожидается до hide.

Практический вывод: event emitter сам по себе не решает отмену, timeout, отсутствие подписчика и зависший Promise. Эти гарантии нужно добавить в нашем director. Бесконечный loop ведьмы нельзя включать в общий `Promise.all` обязательного этапа.

## Аудит нашей текущей реализации

Все ссылки закреплены на M03 commit `b7b88761c64439b09c45d4bbbe9720543681f52f`.

| Файл | Наблюдение в коде | Следствие |
|---|---|---|
| [domain.js](https://github.com/kirillgoncharik-commits/hexandheat/blob/b7b88761c64439b09c45d4bbbe9720543681f52f/apps/web/src/domain.js) | `playOutcome` применяет event, вызывает onEvent и затем delay по токену | Фиксированная выдержка не подтверждает, что конкретный renderer закончил движение |
| [witch-dance.js](https://github.com/kirillgoncharik-commits/hexandheat/blob/b7b88761c64439b09c45d4bbbe9720543681f52f/apps/web/src/witch-dance.js) | Отдельные повторные setTimeout; pending — tier без round/cue ownership | Возможны дрейф callback-границ и устаревшие отложенные реакции |
| [raster-witch.js](https://github.com/kirillgoncharik-commits/hexandheat/blob/b7b88761c64439b09c45d4bbbe9720543681f52f/apps/web/src/raster-witch.js) | rAF считает собственный startedAt; switchTo сбрасывает его; два слоя дают opacity crossfade | Контроллер и кадры не имеют общего phase origin; crossfade не исправляет несовпадение поз |
| [adaptive-music.js](https://github.com/kirillgoncharik-commits/hexandheat/blob/b7b88761c64439b09c45d4bbbe9720543681f52f/apps/web/src/adaptive-music.js) | Отдельный audio clock; nextBeat не привязан к body epoch; ENERGY threshold отличается от witch tier | Нет общей фазы и единого решения о настроении сцены |
| [app.js](https://github.com/kirillgoncharik-commits/hexandheat/blob/b7b88761c64439b09c45d4bbbe9720543681f52f/apps/web/src/app.js) | Пересоздание поля; `finally` возвращает музыку в BASE | Нет устойчивых объектов для tumble; победная музыка может закончиться раньше танца |
| [visual-ui.js](https://github.com/kirillgoncharik-commits/hexandheat/blob/b7b88761c64439b09c45d4bbbe9720543681f52f/apps/web/src/visual-ui.js) | Прямые showModal/close | Нет общего времени входа окна, dim, duck и передачи focus |

Это статический аудит, не измерение качества на устройствах. Скриншоты, запись latency и trace фаз ещё предстоит получить в M04.1.

## Рекомендация

Сочетать три паттерна: **последовательные события и completion barriers** из SDK, **общий transport и партитуры** из scene/timeline подходов, **слои и разрешённые стыки** для персонажа. Звук синхронизировать через mapping audio/performance time, сохранив мгновенный UI feedback и отдельный декоративный ритм.

120 BPM — наша проверяемая гипотеза: beat 500 мс, два такта 4/4 = 4000 мс. Она удобно совпадает с принятой длиной ведьмы, но не является требованием Spine или Stake. Окончательный темп и музыкальная фраза уточняются с sound designer; ритм не должен замедлять управление.
