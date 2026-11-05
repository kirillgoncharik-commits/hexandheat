# M07 — новый motion reference и ключевые позы

Входной brief выбрал Rachel Brice / Serpentine, окно около10–16s: https://www.youtube.com/watch?v=QxObtSVnpnc&t=10s . В этой итерации ролик не скачивался, не использовался для генерации/retargeting и не проходил независимый покадровый анализ. От brief взяты только принципы собственного жеста: масса корпуса → плечо → локоть → запястье, асимметрия и спокойная уверенность. Лицо/костюм/кадры исполнительницы не копировались.

Сделан новый статический contact sheet восьми оригинальных поз, built-in image_gen. Identity reference — зарегистрированный взрослый персонаж `apps/web/assets/m06/neutral.png`; exact prompt `assets/prompts/M07_KEYPOSES.md`. PNG master сохранён вне Git в `hexheat-m07-media/small-win-keyposes-v1.png`, SHA в `apps/web/assets/m07/keyposes-manifest.json`; WebP preview зарегистрирован в ASSET_MANIFEST. Model version интерфейсом не раскрыт. Human retouch не выполнялся. Inherited rights review остаётся OPEN; ссылки на terms не являются лицензионным заключением.

Лист `/m07-art.html` представляет восемь redrawn проекций, а не деформированные старые mesh frames. Плечи/локти/кисти действительно меняют проекцию; результат остаётся кандидатом. На листе возможны различия лица, воротника, пропорций пальцев и длины предплечья. Их оценивает художественный reviewer. Направление ведущего жеста нужно адаптировать к реальному board/crop. Поза8 не совпадает с1, поэтому бесшовность не заявлена. Отдельный silhouette pass и phone-crop pose review ещё не выполнены.

Следующий конкретный шаг после разбора листа: выбрать/исправить6–8 поз, закрепить landmark constraints и общую seam-позу; затем произвести оригинальные промежуточные кадры SMALL_WIN/IDLE на4000ms, проверить10 self-loops без fade и переходы в основной сцене. Только после принятого эталона — MEDIUM/BIG/BONUS. Лист не нарезается на8 «готовых кадров» с ложным заявлением full loop.

Статус: PRODUCED contact sheet; animation TECHNICALLY VERIFIED отсутствует; READY FOR CONCEPT ART REVIEW; ACCEPTED/REWORK ставит PO. Старые M06 танцы остаются REWORK. Спокойный портрет позволяет продолжать поле независимо.
