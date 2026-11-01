# Ведьма: 30 FPS, 120 кадров на цикл

Дата 01.11.2026. PO уточнил: нужны 25–30 **кадров в секунду**, а не 25–30 кадров на весь цикл. Выбран 30 FPS, цикл остаётся 4000ms. Пять состояний ×120 кадров =600 растровых изображений.

## Реализация

Оригинальный набор восьми раздельных частей нарисован встроенным Imagegen, затем разделён с сохранением alpha. Сборка и движение выполняются собственным небольшим Canvas cutout renderer. В сцене загружаются восемь текстур, а не 600 полных кадров. Плеер берёт phase из SceneTransport и выбирает 120 дискретных поз за четыре секунды. Это реальные движения отдельных плеч/предплечий, корпуса, головы и волос, а не перемещение одной цельной картинки.

Экспорт: 600 прозрачных WebP 768×1024, quality82, нумерация 000–119. Последний дублирующий кадр на 4.000s не записывается: loop возвращается к 000. Общая нейтральная поза и нулевая скорость на стыке совпадают во всех состояниях. Мировой якорь стоп математически фиксирован. Начатое состояние по-прежнему защищено полным циклом; body не блокирует settlement.

На смене состояния применяется короткое смешивание bone pose, а не opacity двух целых персонажей. Это смягчает поздний render callback в существующем neutral-window механизме. Старый четырёхкадровый плеер остаётся fallback при decode failure и доступен через `?witch=legacy&rgs=mock`.

30 FPS в UI означает целевую частоту sampling. Реальная частота экрана зависит от браузера/устройства, а скрытый или частично видимый iframe может сильно throttling-иться. Нельзя выдавать target за замер FPS. В экспортированном файле тайминг фиксирован: каждый кадр 1/30 секунды.

## Spine

Создан **Spine 4.2 Import Data candidate**: bones/slots/region attachments, пять rotation/translation timelines с 121 ключом включая closure, PNG textures и multi-page .atlas. Схема сопоставлена с официальным 4.2 SkeletonJson reader; собственные тесты проверяют ссылки и тайминг.

Нативный `.spine` проект и экспорт из редактора не создавались. Кандидат ещё нужно импортировать и визуально проверить в лицензированном редакторе. Официальный Spine Runtime не включён в игру. Для production-интеграции нужно подтвердить entitlement и совместимые версии; лицензия не покупалась.

Источники: [JSON format](https://en.esotericsoftware.com/spine-json-format), [export guide](https://us.esotericsoftware.com/spine-export/), [4.2 reader](https://github.com/EsotericSoftware/spine-runtimes/blob/4.2/spine-ts/spine-core/src/SkeletonJson.ts), [editor/runtime entitlement](https://en.esotericsoftware.com/spine-purchase).

## Выдача и воспроизведение

- Исходная анимация: `apps/web/src/witch-rig.js`.
- Runtime: `apps/web/src/rig-witch-player.js`; цель 30 FPS, четыре секунды, общий transport.
- Разделение Imagegen kit: `tools/extract_witch_parts.mjs SOURCE_PNG` после нормализации PNG encoding через FFmpeg.
- Экспорт: `node tools/export_witch_sequences.mjs OUTPUT_DIRECTORY`, с установленным `@napi-rs/canvas` либо доступным CODEX_PRIMARY_RUNTIME_NODE_MODULES.
- Пакет `HexHeat_Witch_30FPS_768x1024.zip`: 600 кадров, манифест, Spine-import candidate и README. 50,434,959 bytes /48.1MiB. Он сохранён отдельным артефактом; тяжёлые sequences не хранятся в Git и не загружаются в память игры.

## Ограничения первого rig

Нужно художественное ревью плеч, локтей, пересечения кистей с костюмом и вторичного движения ткани. Юбка/ноги пока один region, нет независимых шагов, facial animation, meshes, weights или IK. Выражение лица одно. Это верхняя часть танца/ритуальное покачивание, а не locomotion animation. 30 FPS улучшает дискретность, но само по себе не заменяет работу аниматора.

Проверены 120 различных математических samples, совпадающие seams, foot anchor и ссылки/timeline closure в Spine-кандидате. Human animation review, физические FPS/AV измерения и реальная проверка в Spine Editor остаются открытыми.
