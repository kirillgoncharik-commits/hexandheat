# Hex and Heat Требования Stake и доказательства

Проверка публичных первичных источников 30 октября 2026. Обозначения: REQUIRED - опубликованное требование; PRODUCT - решение игры; INTERNAL - собственный критерий качества; VERIFY - требуется Studio/человек. Наличие документа не означает, что код соответствует ему.

| ID | Тип | Требование и источник | Экран или модуль | Текущее состояние и следующий шаг |
|---|---|---|---|---|
| ST01 | REQUIRED | Независимые ставки, ограничения механик, оригинальные lawful assets [A] | math / content | Котёл scoped per round в прототипе; full bonus/math и права проверить |
| ST02 | REQUIRED | Final frontend/math versions до review; последующие изменения ограничены [A] | release manifest | Не готово к submission |
| ST03 | REQUIRED | Mobile и popout; уникальные visuals/audio; Engine CDN для images/fonts [B] | Все layouts/build | Растровая итерация и responsive shell; Studio/CDN/real devices не проверены |
| ST04 | REQUIRED | Rules, RTP, max win, payouts, special values и feature triggers [B] | S20 S21 | Структура есть; числа TBD, блокирует релиз |
| ST05 | REQUIRED | Balance, все bet levels, final win, incremental win, mute, Space [B] | S03–S10 S19 | Прототип частичный; cascade award display и low-denom precision завершить |
| ST06 | REQUIRED если feature присутствует | Autoplay confirmation; Fast читаемость [B] | S17 S18 | Autoplay только макет; убрать или реализовать полностью; Fast QA нужен |
| ST07 | REQUIRED | Публичный replay без player session, Play/Again, стоимость, no authenticated calls [C] | S26–S29 | Локальный Replay last не закрывает требование; M04 C |
| ST08 | REQUIRED | URL config, auth first, integer money, active round, RGS bet validation [D] | Session / Round coordinator | Local adapter есть; normalisation/resume/active/levels исправить в M04 B |
| ST09 | REQUIRED | Малые ставки и точный sub-cent win [D] | Amount formatter | 2 decimal formatter недостаточен; M04 E |
| ST10 | REQUIRED | index.json + lookup CSV + compressed book, согласованные payout values [E] | math pipeline | Sample package воспроизводим; production distribution не утверждён |
| ST11 | REQUIRED | General game disclaimer [F] | S20 | Семантика включена в ТЗ; финальный текст сверить перед релизом |
| ST12 | VERIFY | Jurisdiction/social restricted language | Content / S01–S30 | Public page не раскрыла таблицу; получить актуальную из Studio и проверить все строки |
| ST13 | VERIFY | Account-specific submission checklist [G] | release | Полный checklist за login; проверить в аккаунте перед submission |
| ST14 | PRODUCT | 6×5, cascades, Potion, round cauldron, один Free Spins | S03–S16 | Base есть; bonus отсутствует; требует math решения |
| ST15 | PRODUCT | 5 witch states × 4 raster frames × 4000ms | RasterWitchPlayer | Первая итерация; seam/identity требуют human art pass |
| ST16 | INTERNAL | 44px targets, 30 FPS floor, первые critical assets ≤2.5MiB | UI/performance | Не выдавать за норматив Stake; измерить на устройствах |
| ST17 | VERIFY | Game tile/cover/media dimensions, exact math critical thresholds, template fit, KYB/entity | Studio/PO/math | Не выводить из сторонних блогов; получить текущие официальные значения перед M04 lock |

## Референсы той же механики

| Игра | Что подтверждено источником | Что используем в Hex and Heat | Что не переносим |
|---|---|---|---|
| [Deadspin Bonanza](https://stake.com/casino/games/paperclip-deadspin-bonanza) | 6×5 scatter pays, от 8 matching symbols, cascades/free spins | Иерархия field → win chain → feature; близкий механический ориентир | Чужой арт, paytable, volatility switch, bonus-buy и числа выплат |
| [Gates of Olympus](https://stake.com/casino/games/pragmatic-play-gates-of-olympus) | 6×5, cascading, multiplier presentation | Читаемый focus board/character и порядок reveal/win/cascade | Zeus, фирменный дизайн, branded assets и точную математику |
| [Sweet Bonanza](https://stake.com/casino/games/pragmatic-play-sweet-bonanza) | Публичная карточка описывает tumble flow | Понятный основной цикл и краткое обучение | Candy look, детский tone, brand assets |

Ссылки проверены публичным поиском. В этой сессии не выполнялось реальное игровое тестирование этих сайтов и не снимались gameplay screens; точную разметку их окон не объявляем наблюдённой. Макеты Hex and Heat являются оригинальным UX решением. Перед final UX review QA должен пройти demo каждого референса и сравнить readable win, transitions, mobile, help/paytable и error paths без ставок на реальные деньги.

## Первичные источники

- A https://stake-engine.com/docs/approval-guidelines
- B https://stake-engine.com/docs/approval-guidelines/front-end-communication
- C https://stake-engine.com/docs/approval-guidelines/game-replay-requirements
- D https://stake-engine.com/docs/rgs и https://stake-engine.com/docs/rgs/wallet
- E https://stake-engine.com/docs/math/math-file-format
- F https://stake-engine.com/docs/approval-guidelines/general-disclaimer
- G https://stake-engine.com/docs/approval-guidelines/submission-checklist

Часть direct opens возвращала только оболочку страницы; требования выше проверялись по индексированному тексту официальных страниц. Account-specific нормы, точные media specs, полная social таблица и текущие numeric math critical tests не проверены; их нельзя закрыть предположением. Старое исследование Stake_Engine_market_research_RU.docx от 18 октября использовано как продуктовая история; актуальные нормы приоритетны. Нет гарантии approval или 3-star.
