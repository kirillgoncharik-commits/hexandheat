# M05-05 — мобильная композиция

Рекомендация к приёмке: A. Во всех вариантах одинаковые F06, SMALL_WIN, phase 1.20s и v7 source. A показывает поясной crop и котёл рядом; B — менее крупный compact crop. Оба редактируются HTML/CSS, два комплекта арта не создавались. `/compare.html` содержит старую композицию, A, B и A с прежним циклом на одной фазе. Исходный реальный M04 screenshot сохранён отдельно before-360x640.jpg; он использует старые постановочные outcomes и не выдается за математический M05 baseline.

Main default — layout A. Candidate v7 включается Settings → Candidate либо `?witch=candidate`; fallback/default персонажа не заменён. На небольшом mobile ноги намеренно вне crop; foot-contact нельзя принять по этому виду. Руки не перекрывают board или суммы; crop широкого жеста и связь с котлом требуют human review. На desktop доступен полный рост.

| Viewport | Board CSS px | 6:5 | Controls ≥44px | Scroll основного пути |
|---|---|---|---|---|
| 360×640 | 272.40×227 | PASS | PASS | нет |
| 390×844 | 356×296.66 | PASS | PASS | нет |
| 480×320 | 151.20×126 | PASS | PASS | нет |
| 1366×768 | 501.24×417.70 | PASS | PASS | нет |
| 1440×900 | 659.64×549.70 | PASS | PASS | нет |

Machine evidence: reports/m05/viewports.json; одинаковые screenshots layout-before-* / layout-A-*. 480×320 — внутренний compact test, символы/текст здесь маленькие; не заявляется Stake Popout S certification. Safe-area padding и landscape сохранены; длинные суммы переносятся без удаления цифр. Help имеет внутреннюю прокрутку; paytable может прокручиваться горизонтально. Reduced Motion сохраняет функциональную сцену.

Выбор A сделан по присутствию лица/поясного жеста и неизменной доступности денег/controls, не по вымышленному голосованию. Сравнение B и реальных телефонов остаётся человеческой приёмкой. Native Figma не изменён: нет доступной native capability. Редактируемый эквивалент — compare.html, m05.css, visual.css и исходные ассеты. Реальные iOS/Android/Safari, динамические safe areas, physical AV/input/FPS — UNAVAILABLE, отдельная ручная матрица в USER_REVIEW_SCRIPT_RU.md.

Дополнительная матрица: financial-viewports.json и F09-win-potion-* / rules-* проверяют win, последний Potion, реальный 200ms main-thread jank и длинный баланс на всех пяти размерах. ownership.json и F14-* фиксируют новый loss при ещё активном SMALL_WIN, без блокировки Spin.
