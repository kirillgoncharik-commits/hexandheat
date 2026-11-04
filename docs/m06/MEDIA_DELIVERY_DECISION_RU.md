# M06 — PNG delivery и границы сравнения

Основной review-кандидат — PNG с alpha. IDLE: 6 исходных поз/с, 24 PNG, fade40ms. SMALL_WIN: 12 поз/с, 48 PNG, fade20ms. Варианты 6/8/12 для обоих состояний подготовлены напрямую на точных `i/fps` timestamps общей новой постановки. Не выполняется неравномерное прореживание 12→8. Каждый набор — полный 4000ms, без добавления fade к длительности. Конечный контрольный кадр хранится отдельно; он не входит в runtime список.

Точные bytes, source/export SHA, crop/pivot/landmarks и бюджет находятся в `apps/web/assets/m06/manifest.json`. Download — сумма размеров PNG; decoded estimate — `width×height×4×residentFrames`. GPU copy может удвоить image pool; реальные driver/cache overhead и память устройства не измерены. Выбор 6 FPS для спокойного IDLE снижает ресурс без заявления, что opacity interpolation добавляет уникальные рисунки. Перед художественным решением сравнить 0/короткий fade и все три частоты на `/media.html`.

| Вариант | Исходные позы | Fade | Фактический статус |
|---|---:|---:|---|
| IDLE PNG6 | 24 | 40ms | Экспортирован; основной кандидат |
| IDLE PNG8 | 32 | 30ms | Экспортирован; сравнение |
| IDLE PNG12 | 48 | 20ms | Экспортирован; сравнение |
| SMALL_WIN PNG6 | 24 | 40ms | Экспортирован; сравнение |
| SMALL_WIN PNG8 | 32 | 30ms | Экспортирован; сравнение |
| SMALL_WIN PNG12 | 48 | 20ms | Экспортирован; основной кандидат |
| Video motion master | — | — | NOT PRODUCED; video generation отсутствует |
| WebM preview export | 12 PNG/с, 30 samples/с | внутри 4s | Запись PNG-постановки; не самостоятельный video master/codec benchmark |

В runtime один canvas, два последовательных drawImage в blend-фазе, без DOM по кадру. Премультиплицированная сумма через `lighter` сохраняет alpha при одинаковых соседних позах: не последовательное затухание прозрачности двух DOM-слоёв. Большую часть интервала видна одна чёткая поза. Это ограничивает, но не доказывает отсутствие двойного лица при любой разнице соседних рисунков: просмотр остаётся обязательным.

Часы — SceneTransport; кадр и opacity вычисляются из modulo4000, без цепочек setTimeout. Native video на RAF не перематывается. Загрузка: neutral poster + весь IDLE, затем весь SMALL_WIN, максимум четыре параллельных decode. Набор, завершивший decode в середине цикла, ждёт следующего seam. До готовности используется корректный renderer/poster; UI не ожидает media. При Reduced Motion оба image pool отменяются/очищаются и остаётся один neutral PNG. При disable очистка на разрешённом seam; destroy отменяет preload, снимает listener и освобождает ссылки. Timeout8s даёт neutral-error и диагностическую причину. Missing MEDIUM/BIG/BONUS — neutral той же семьи, без ложного SMALL_WIN.

Переключение логического состояния выполняет существующий WitchDanceController; в игре окно seam сужено до50ms, пропущенный seam логируется и откладывается. Финансовый settlement/следующий Spin от body не зависят. ModalManager после входа ставит scene clock на паузу; перед выходом возобновляет для анимации закрытия. Visibility и overlapping pause reasons сохраняются.

Browser cadence: `/media.html` → состояние → «Начать120 секунд»; журнал записывает source cadence, missed poses, p95 lateness и оценку decoded memory. Снимок JSON хранится в reports/m06. Если p95 превышает один display frame, это фиксируется как результат среды, а не скрывается. Simulated10Mbps/100ms cold/warm не реализован доступным browser-control интерфейсом: UNAVAILABLE. Реальные thermal/memory/FPS на мобильных — UNAVAILABLE.

Проверены официальные источники04.11.2026: [image.decode](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode), [canvas compositing](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation), [video codecs](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Video_codecs), [video frame callbacks](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback). PNG decode завершается до использования набора; frame callbacks нужны для будущего native-video benchmark. Проверка расширения файла не заменяет устройства/кодек. Alpha WebM/HEVC не объявляются универсально поддержанными.
