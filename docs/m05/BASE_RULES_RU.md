# M05-01 — snapshot фактических base-правил

Версия `m05-rules-1`. Единственный источник чисел — STAKE_CANDIDATE_CONFIG из math/hexandheat_math/config.py. Label `STAKE_FORMAT_CANDIDATE_UNBALANCED_V0`; config hash `ef29d030a553ca6a24678bdbb1123f29d932f6ba1256f11b4389847c7644b6d3`. Полный экспорт: apps/web/assets/m05/rules.json; JS модуль и BASE_PAYTABLE_RU.md генерируются той же командой, что fixtures. UI paytable читает именно этот snapshot.

Поле 6 колонок × 5 строк; position = column × 5 + row. Pay-anywhere считает одинаковый ordinary ID: L1–L5 и H1–H4 различны. Выплачивается наибольший достигнутый порог 8/10/12/15/20. Несколько групп оплачиваются одновременно. Полная таблица: [BASE_PAYTABLE_RU.md](BASE_PAYTABLE_RU.md).

Новая ставка начинает котёл с ×1. Текущий каскад платит с прежним множителем. Затем все видимые P1/P2/P3 прибавляют +1/+2/+3, удаляются вместе с paid ordinary positions и больше не активируются. Следующее поле/падение authoritative. На неплатящем поле Potion не активируются. Последняя Potion может повысить число котла без какой-либо последующей выплаты: это F09.

Cap 500000 payout units = 5000× применяется к полному раунду. Engine на достижении cap завершает цепочку без следующего collapse: terminal board остаётся последним authoritative полем, без выдуманного refill. UI выделяет CAP и не показывает computed award как paid. Технический предел 64 платящих каскада; код поднимает CascadeLimitExceeded, если цикл исчерпан без cap/нормального выхода. Ошибка не превращается в новый исход.

100 payout units = 1× ставки. Currency — integer micro units: 1000000 = 1 credit. Перевод amountUnits × betMicro / 100 должен быть точным целым; непредставимое значение отклоняется. Adapter использует BigInt при промежуточном умножении. Formatter разделяет BigInt whole/remainder без деления валюты через floating point и сохраняет до 6 дробных знаков, минимум 2; проверена точность до Number.MAX_SAFE_INTEGER micro. Например 1000 micro = 0.001. В выбранной конфигурации минимальная обычная выплата 0.2×, поэтому F12 на ставке 0.01 даёт 0.002; требуемый пример 0.1× × 0.01 = 0.001 проверен отдельным formatter test, без изменения paytable.

Integration вариант механически округляет awards оригинального CANDIDATE_CONFIG до 0.1×. Его label/hash не смешиваются с оригиналом. Выборочный возврат исходного генератора 13.42733% и integration 14.65420% в прежних 100k выборках — исторический аудит, не RTP published продукта. 96.5%, бонусный carry/retrigger, FS rules, вероятность max win и художественные win tiers не утверждаются этим snapshot.

Примеры и объяснение в units:

| Case | Причина | Каскады / котёл | Итог units |
|---|---|---|---|
| F01 | Нет группы | ×1 | 0 |
| F02 | 8 L1 | 20 ×1 | 20 |
| F03 | 8 H1 | 50 ×1 | 50 |
| F04 | 8 L1 + 8 H1 | 20 + 50, обе ×1 | 70 |
| F05 | 4 L1 + 4 H1 | ни одного count ≥8 | 0 |
| F06 seed 28 | Win, P1, следующий win | 20 ×1; +1 → ×2; 20 ×2 | 60 |
| F07 seed 7 | Несколько Potion | 30 ×1; +2 → ×3; 30 ×3; +4 → ×7; новых win нет | 120 |
| F08 | P3 на неплатящем поле | inactive, ×1 | 0 |
| F09 | Win и последняя P2 | 20 ×1; +2 → ×3; новых win нет | 20 |
| F10 seed 159 | 5 каскадов | 20 + 20 + 30 + 40 + 40, ×1 | 150 |
| F11 | forced cap | 100; +66 → ×67; 268000; computed 268000, paid 231900 | 500000 |
| F12 | та же группа F02, ставка 10000 micro | 20 units → 2000 micro | 20 |
| F13 | неизвестный ID/event/позиция | controlled rejection | не принимается |

Все входы, expected groups/positions/removals/multipliers, integer awards, hashes, пути воспроизведения и независимый PASS находятся в apps/web/assets/m05/fixtures.json. Ручные суммы не вписывались в fixture JSON: resolve_round → verify_outcome → adapter. Проверка F13 существует и в независимом Python verifier, и в strict JS mutation suite.
