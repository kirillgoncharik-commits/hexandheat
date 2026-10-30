# Hex and Heat Регламент графики и анимации

## Арт направление

Premium dark fantasy, кабаре и алхимическая мастерская. Ведьма явно взрослая, около 35 лет; единая идентичность, burgundy волосы, plum платье, непрозрачный костюм, медные и jade акценты. Никаких заимствованных персонажей, логотипов Stake, explicit изображений или детских черт. Черновые генерации не считаются content approval площадки.

## Первая итерация

| Группа | Состав | Runtime |
|---|---|---|
| Witch | IDLE, SMALL_WIN, MEDIUM_WIN, BIG_WIN, BONUS; по четыре изображения | 20 PNG, frame-00–19, 280×280, прозрачность |
| High symbols | Moon Goblet, Raven Mask, Thorn Rose, Crystal Eye | item-00–03 PNG 256×256 |
| Low symbols | Amber triangular vial, Violet moon vial, Jade diamond vial, Rose thorn vial, Blue star vial | item-04–08 PNG 256×256 |
| Specials | Potion flask, Coven Seal | item-09–10 PNG 256×256 |
| Cauldron | Copper-footed black cauldron | item-11 PNG 256×256 |
| Environment | Alchemy atelier with clear board area | atelier.webp 1440×810 |
| UI | Board frame, button, panels, amount cells, settings/info/close, overlays | Editable HTML/CSS and Figma layers |
| FX first pass | Winning tile glow, state crossfade, Potion accent | Runtime presentation; future particle pack |

Распределение всех 9 regular symbols в math ещё не включено: текущий тестовый renderer использует 5 regular IDs плюс Potion. Наличие полного набора картинок не меняет probability model. Scatter/bonus ассеты готовы только для дизайн-итерации. Marketing tile/cover и production audio не входят в эту первую графическую итерацию; требования экспорта нужно получить из Studio в M04.

## Четыре кадра на стейт

У каждого состояния ровно четыре raster изображения, frame 0/1/2/3, по 1000 мс, цикл ровно 4000 мс. Между кадрами мягкий dissolve 180 мс; это аниматик из рисунков, а не smooth skeletal motion. `currentState` и `pendingState` выбираются с приоритетом BONUS > BIG_WIN > MEDIUM_WIN > SMALL_WIN > IDLE. Переключать tier только в конце полного цикла, включая IDLE. Potion является отдельным accent, не переключает BONUS. Ведьма не задерживает settlement и не меняет шанс выигрыша.

Для final art frame 0 всех стейтов должен иметь совместимые pivot, позу и свет; frame 3 возвращаться к ней. В текущей генерации совместимость не полная: есть вариации лица/костюма, crop и конечностей, а extreme poses отличаются в seam. Это открытая задача paintover. Не исправлять расхождения простым обещанием «плавно», проверить глазами на loop и между tiers. В Reduced Motion показывать статичный кадр, сохранять числа/пояснения.

## Как переходить к Spine

Растровая секвенция не является Spine проектом. Для настоящего rig подготовить layered PSD/PNG с отдельными head/face/hair-front/hair-back/hat/torso/arms/forearms/hands/skirt/legs/boots и перекрывающимися зонами под суставами. Художник дорисовывает скрытые участки. Animator создаёт bones, slots, meshes, weights, constraints и 5 timelines; общий pivot и neutral anchor обязательны. Экспорт: исходный .spine, runtime JSON либо .skel, .atlas и texture PNG/WebP по совместимости выбранного runtime. Зафиксировать версию editor/export/runtime и лицензию. Никакие платные лицензии сейчас не приобретаются.

Заменять через интерфейс `start`, `switchTo(state)`, `setReducedMotion`, `destroy`; RGS/domain не должны зависеть от Spine. Cross-state seam остаётся 4000 мс, idle постоянно работает. Энергия различается glow/amplitude/speed внутри цикла, общая длительность не меняется.

## Регламент экспорта и приёмки

PNG с реальным alpha; не baked checkerboard. Единую fixed cell/pivot сохранять при crop; не trim каждый кадр по-разному. Runtime размеры измерять в интерфейсе, не апскейлить и не называть master. Для web сохранять локальные относительные пути. Каждый файл: ID, SHA256, bytes, dimensions, source/tool/date, полный prompt, rights-review status.

Художник проверяет контактный лист в 100% и 25%, силуэт предметов в 64px, края alpha на светлом и тёмном фоне, ноги/руки/пальцы, повторы, движение ткани и стабильность лица. В основном экране проверять контраст над фоном, символы не конкурируют с рамкой, Potion и Scatter различимы без текста. После paintover заново обновить hashes и review status.

Генерации сделаны встроенной генерацией изображений OpenAI 30.10.2026. Версия модели и account plan не предоставлены ответом инструмента; не выдумывать. Оригинальные prompts и known issues находятся в assets/prompts/M03_PROMPTS.md. Terms: https://openai.com/policies/terms-of-use/ - ссылку сохраняем для review, соответствие прав и account entitlement не объявляем проверенными.
