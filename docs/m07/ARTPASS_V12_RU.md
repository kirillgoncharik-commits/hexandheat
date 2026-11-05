# M07 — доработка после художественного разбора v11

Продолжение Issue #33 / draft PR #34 по поручению «продолжаем работу». Входной reviewer-разбор сохранён в V11_ART_REVIEW_RU.txt. Это рекомендации, а не PO ACCEPTED. До правок сверены GitHub HEAD2315fe9, runtime c324728, Site v11 source0a61f7bda018708e75769a6dee831ed0c2c90ec4. Изменения продолжают ту же ветку, прежние PR не сливаются.

## Поле

| Замечание | Что сделано |
|---|---|
| F01 итог / последний каскад | На final payout band показывает только paid всего раунда; последняя каскадная сумма и подсказка Potion очищены. Дублирующий meter в controls скрыт без изменения геометрии. История/точные значения сохранены. |
| F02/F03 рамки и цвет | Убраны двойные прямоугольные контуры. Ordinary groups используют единый тёплый золотой halo вокруг предмета; активная группа ярче, остальные приглушены. Teal остаётся Potion/котлу. |
| F04 плотная арифметика | Основной ряд — count, icon, +paid;14–16px mobile. Второй11px ряд — multiplier / номер группы; формула только при multiplier>1. Normal group hold680ms после окончательной суммы. Portrait band остаётся42px: клетки и hero не уменьшаются. |
| F05 Potion | Из реальных позиций в точку x50%/y36% изображения котла, на чашу, а не центр plaque. Короткий trail, splash, смена multiplier и звук на одном impact marker. Старый paid не меняется. |
| F06 dissolve | Короткое свечение, направленная маска растворения, максимум12 искр на весь removed set. Удаление, cancel, replay и destroy очищают эффекты до нового board. |
| F07 landing | Разгон/торможение, затем rigid recoil до2.5% cell height. Масштаб предмета не деформируется. Старые DOM instances survivors сохраняются. |
| F08 tiers | Zero/sub-bet/equal спокойные; SMALL локальный акцент; MEDIUM компактная золотая наградная плашка/эмблема и энергия котла; BIG отдельная композиция с большим amount. Новая body-family остаётся OPEN. |
| F09 BIG copy | Сумма, понятный заголовок, ratio, Close/Continue и sample/no funds. Убраны обещание текущего танца и технический review-текст из наградного слоя. |

Математика, вес исходов, rules, thresholds4×/10×, cap, authoritative events и кошелёк не меняются. Все FX используют active SceneTransport, round ownership и существующие fallback/deadline guards. Mute/Fast/Reduced/replay сохраняют исход.

## Исправленный motion study

Четыре новых самостоятельных изображения: canonical, weight, accent, release. Ведущая ладонь слева на экране, взгляд открыт и направлен влево-вниз; обе кисти выше, в области корпуса. Reference — оригинальный проектный neutral; внешнее видео не использовалось. Материалы не зеркалились. Точные prompts/provenance находятся в assets/prompts/m07-artpass; PNG masters вне Git в hexheat-m07-artpass-media. Preview624² — одинаковые32px transparent padding и resize/WebP без ретуши поз.

Ступенчатый4s аниматик:0 canonical;550 weight;1350 accent;2150 release;3150 weight;3650 canonical;4000 тот же canonical. Первый/последний ключ используют один файл, не crossfade. Это совпадение C0 и удержание на концах; плавная C1-анимация не произведена. Четыре рисунка не выдаются за6–12FPS body loop.

`/m07-art.html`: pause/scrub, silhouette, одинаковая фаза desktop/360/390 crop, индивидуальные keys и экспорт4s аниматика по доступности MediaRecorder. `/?fixture=B05&witch=study` — opt-in study в настоящей сцене и на общих часах, SMALL_WIN меняется только на полном4000ms seam. Другие body states используют canonical, явно не новую готовую family. Основная field review остаётся со спокойным прежним портретом.

Coarse face/hand rectangles измерены визуально с погрешностью15–25px, служат crop-гайдами, не приёмкой анатомии. У новых рисунков остаются небольшие различия лица, локонов, орнамента; верх шляпы касается source edge. Padding не восстанавливает недорисованную область. Полная регистрация, anatomy/identity, сила body wave и художественное решение OPEN.

## Проверки и открытые пункты

Фактические результаты сохраняются в reports/m07-artpass; старые viewport-картинки из ранних v10/v11 receipts не считаются свежим просмотром текущего renderer. Проверяются B05/B06/B09/B11/B14/B15/B16/B18, сложные группы Fast/Reduced, zero/sub-bet/equal, cap/F14, replay без debit, исходы и terminal30 cells. Отдельно новый body study/crop/seam и цельные browser gameplay captures Normal/Fast.

Силуэты/крупные кисти доступны для PO. Визуальные прямоугольники или PASS не доказывают, что все пальцы художественно приняты. Полная visual beta, production in-betweens/family и physical iOS/Android/thermal/input/30min soak не объявляются закрытыми. Детальная перерисовка low-symbol орнамента/тонкой синей колбы и окончательная световая интеграция окружения остаются следующим art polish, а не автоматически выполненными G/H.

## Публикация

На прежнем публичном review Site опубликована версия12: runtime15af8654a1ed06a46c4f071c6f85bf0742da6ac4, Site source a74403a21e9f1cadb12ce6405ac19f23258c9366. CI PASS; свежий Spin B05 на опубликованном390×844 study завершился paid1.90,×2,balance100.90,30 cells, видимым персонажем и доступным Spin без прокрутки. Точные native receipts и screenshot — reports/m07-artpass/deployment.json, published-smoke.json, published-study-390.jpg. Следующий commit содержит только отчёт публикации; runtime тот же. Статус: IMPLEMENTED / VERIFIED FOR REVIEW, human art/device acceptance OPEN, productionReady=false.
