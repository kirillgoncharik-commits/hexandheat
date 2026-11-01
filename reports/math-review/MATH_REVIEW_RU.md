# Математика Hex & Heat: исходный аудит и модель v0.1

Дата 01.11.2026. Issue #20. Baseline: 332ad036c032c82bc33b3eeb7b84ed589e131de8; поверх scene PR #25. Изменений production math, wallet и RGS в этой задаче нет.

Рабочая [Google Sheets модель](https://docs.google.com/spreadsheets/d/1vfXK-bqOP2kcALhs8I6Q58AEyscYO_xW2ODM8UuQZ4U/edit): Обзор, Модель, Правила, Аудит V0, Референсы. Формулы и native chart сохранены. Google metadata подтверждает native spreadsheet и пять вкладок. Доступ только владельцу, sharing не расширялся.

## Что существует сейчас

Чистый генератор рассчитывает поле 6×5, 9 ordinary IDs, 3 Potion IDs, 5 payout thresholds (8/10/12/15/20), simultaneous pay-anywhere groups, каскады и cap 5000×. Potion добавляет +1/+2/+3 к m после выплаты текущего выигрышного каскада, влияя только на последующие каскады. На неплатящем поле она не активируется. m начинается с 1 на новой ставке. Free Spins отсутствуют.

Два воспроизводимых прогона по 100 000 раундов, seed20261101, каждый outcome прошёл существующий независимый verifier:

Отдельный release gap: stake-events.js сейчас сводит L1/H1 к amber, L2/H2 к violet и т.д. Девять различных math IDs видны как пять видов обычных символов. Это может создавать визуально одинаковые, но математически разные группы; до релиза нужны раздельные symbol/art IDs и точная связь с paytable. В этой задаче adapter не менялся.

| Метрика | Original V0 | Округлённая integration V0 |
|---|---:|---:|
| Выборочный возврат | 13.42733% | 14.65420% |
| Приблизительный 95% интервал | 13.1451–13.7096% | 14.3479–14.9605% |
| P(ненулевая выплата) | 24.264% | 24.264% |
| Средняя выплата при hit | 0.55338× | 0.60395× |
| Стандартное отклонение | 0.45538× | 0.49423× |
| Максимум в выборке | 20.63× | 21.20× |

Это оценки исходного генератора без LUT optimization, не RTP действующей published игры. Выборочный интервал не доказывает редкий хвост. Hosted review использует отдельные детерминированные mock outcomes. Шесть curated integration books с одинаковым весом намеренно включают max win и непригодны как реальное распределение.

Артефакты: simulation-original-100k.json, simulation-stake-100k.json, config-snapshot.json. Первую выборку воспроизвести через `PYTHONPATH=math python3 -m hexandheat_math.simulate --rounds 100000 --seed 20261101`. Для второй вызвать `generate_report` с `config=STAKE_CANDIDATE_CONFIG`; исходный генератор не изменён.

## Предлагаемая экономика

Цель 96.5%, полный paid book cap5000×, один режим с cost1. Условное распределение без бонуса содержит 12 выплат/весов; с бонусом -13. Оба являются концептуальными точечными распределениями, а не существующими event books. Все значения, включая редкие tail frequencies, пока HYPOTHESIS.

Средняя выплата без бонуса 0.6025×; с бонусом 48.2×. Последняя включает trigger/base wins и все Free Spins/retriggers этого оплаченного раунда, чтобы не считать выплату дважды. Вероятность бонуса решается из `p=(targetRTP×cost−Ebase)/(Ebonus−Ebase)`, а не объявляется результатом генерации Scatter.

| Метрика проекта | Результат |
|---|---:|
| P(бонус) | 0.7615946% |
| Средний интервал бонуса | 131.30345 ставки |
| Вклад безбонусных раундов в RTP | 59.79114 п.п. |
| Вклад раундов с бонусом в RTP | 36.70886 п.п. |
| P(ненулевая выплата) | 25.53312% |
| P(выплата больше цены ставки) | 9.10166% |
| Std dev полной выплаты | 13.89318× |
| P(выплата ≥100×) | 0.1524345% |
| P(cap) | 0.00000761595% |

Из совпадения 96.5% с целью нельзя заключать, что production RTP подтверждён: частота бонуса вычислена именно для этого совпадения. Таблица - редактируемое задание на желаемое распределение. Реализуемость payout/weights должна быть доказана полными валидными books. Изменение cap ограничивает выплаты через MIN и пересчитывает средние, частоту и хвост.

Предлагаемые правила бонуса: 10 FS, trigger4 Scatter, retrigger3 Scatter даёт +5 FS, m переносится внутри одного бонуса и сбрасывается перед следующей оплачиваемой ставкой. Эти значения не участвуют в вычислении внутреннего EV, пока нет bonus generator. Они не внедрены и не утверждены. Buy/ante/jackpot не добавлены.

## Сопоставление с референсами

Публичные данные проверены 01.11.2026. Это сопоставимые известные игры, не доказанный рейтинг лучших по доходу. По полю, pay-anywhere от8 и каскадам Hex & Heat соответствует семейству. По экономике текущая V0 не сопоставима с готовым продуктом: низкий средний hit, нет FS и оптимизированных весов. Один процент RTP или cap не доказывает сходство volatility/UX.

| Игра | Опубликованный RTP | Max win | Что сравниваем |
|---|---:|---:|---|
| [Deadspin Bonanza](https://stake.com/casino/games/paperclip-deadspin-bonanza) |96.02%|5000×|Близкая механика и бюджет хвоста |
| [Gates of Olympus](https://stake.com/casino/games/pragmatic-play-gates-of-olympus) |96.50%|5000×|Поле, множители, персонаж и каскады |
| [Sweet Bonanza 1000](https://stake.com/casino/games/pragmatic-play-sweet-bonanza-1000) |96.53%|25000×|Feature economy и более длинный хвост |

Точные hit rates, bonus frequency, RTP splits и дисперсии не опубликованы в просмотренных источниках. Маркетинговые high/medium не являются общей численной шкалой. Не восстанавливаем чужие weights по числу RTP и не копируем paytable. Native model содержит явные неизвестные значения.

Первичные источники архитектуры: [Math](https://stake-engine.com/docs/math), [optimization](https://stake-engine.com/docs/math/optimization-algorithm), [quick start](https://stake-engine.com/docs/math/quick-start). Официальный алгоритм работает с весами валидных outcomes и условиями по hit/RTP/average win; итоговый LUT позволяет точно вычислить RTP. Рекомендация документации о 100k+ разнообразных simulations per mode не заменяет проверку rare tails и концентрации веса. В этой работе SDK/Studio critical tests не запускались.

## Проверка таблицы и следующий этап

Artifact Tool recalculation, zero unexpected formula errors, независимый контроль моментов, sum-probability/bin checks, cap propagation и изменение одного веса с восстановлением прошли. В Google Sheets вес bonus20× временно180000→190000 изменил interval131.30345→130.53322;180000 восстановлен, KPI повторно прочитаны. Проверены native formulas/number formats, chart metadata, пять вкладок глазами. GOOGLE_SHEETS_REVIEW.jpg фиксирует обзор; workbook-verification.json - расчёты до импорта. Часовой пояс Europe/Podgorica.

Следующая работа: утвердить Potion timing и бонусный carry; согласовать terminal payout profile; добавить полный bonus generator и 1:1 symbol/art contract; генерировать разнообразные валидные books, включая принудительные редкие события; оптимизировать integer weights; считать точный RTP/hit/variance/tail, вес самого частого book и вероятность повторения; независимо пересчитать каждую выплату/bonus cap; экспортировать согласованные rules и пройти текущие Studio tests. Нужны math reviewer и PO sign-off до production lock. Этот отчёт их не подменяет.

Builder: tools/math-review/build-workbook.mjs. Запускать из writable OS tmp с symlink на CODEX_PRIMARY_RUNTIME_NODE_MODULES через CODEX_PRIMARY_RUNTIME_NODE, передав repo и outputDir. Native post-import correction фиксирует дату источников числовым serial и компактные heights; builder отражает те же изменения. Не импортировать повторно поверх созданной пользовательской таблицы без отдельного запроса.
