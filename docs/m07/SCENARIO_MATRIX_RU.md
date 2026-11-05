# M07 — сценарная матрица

Generated from committed verified books. 100 payout units =1× bet. ProductionReady=false. F01–F12 books и F13/F14 diagnostics сохранены без изменения.

| ID | Смысл | Payout / bet | Bet |
|---|---|---|---|
| B01 | Семь одинаковых · без выплаты | 0× | 1 |
| B02 | Восемь по краям · соседство не требуется | 0.2× | 1 |
| B03 | Большая low-группа · 12 символов | 0.6× | 1 |
| B04 | High-группа · порог 20 | 27.5× | 1 |
| B05 | Golden · две группы → Potion → каскад | 1.9× | 1 |
| B06 | Три одновременно платящие группы | 1.3× | 1 |
| B07 | Survivors · падение на три ряда | 0.2× | 1 |
| B08 | Три выигрыша · разные символы | 1.3× | 1 |
| B09 | Пять каскадов · контролируемое нарастание | 1.1× | 1 |
| B10 | P1 · старый ×1 → новый ×2 | 1.2× | 1 |
| B11 | P2 + P3 · одна активация +5 | 3.2× | 1 |
| B12 | Последняя Potion · прошлый paid неизменен | 0.2× | 1 |
| B13 | Проигрыш · Potion неактивна | 0× | 1 |
| B14 | Меньше ставки · сдержанная выплата | 0.2× | 1 |
| B14-EQUAL | Возврат ровно ставки | 1× | 1 |
| B15 | MEDIUM · обычные 5× | 5× | 1 |
| B16 | BIG · обычные 12× | 12× | 1 |
| B17 | Граница реакции · 3.9× | 3.9× | 1 |
| B17-4 | Граница реакции · 4× | 4× | 1 |
| B17-4A | Граница реакции · 4.1× | 4.1× | 1 |
| B17-10B | Граница реакции · 9.9× | 9.9× | 1 |
| B17-10 | Граница реакции · 10× | 10× | 1 |
| B17-10A | Граница реакции · 10.1× | 10.1× | 1 |
| B18 | Все 30 high symbols · полный board | 40× | 1 |
| B19 | SMALL → LOSS · первый раунд последовательности | 1.2× | 1 |
| B20 | Три суммы · ставка 0.01 · точные sub-cent | 1.3× | 0.01 |
| B20-LARGE | Три суммы · максимальная sample-ставка | 1.9× | 5 |

45 ordinary×tier cases и135 boundary cases находятся в `assets/m07/symbol-matrix.json`; main не загружает эту QA-матрицу. Для t−1 при t>8 допускается выплата предыдущего tier. B02 — края/углы; B07 — survivors0→3,1→4,5→8,6→9. B06 действительно содержит три группы, а не презентационную инъекцию. B18 —30 H4, тихое terminal refill; F11 cap остаётся отдельным.

Границы4×:3.9/4/4.1;10×:9.9/10/10.1. Все значения достижимы. Awards кратны10 units, целый Potion multiplier сохраняет решётку;0.1× — ближайший возможный шаг total. Production distribution не меняется. B20 paid0.013 при bet0.01, включая group awards0.002/0.005/0.006; F12 даёт отдельный round total0.002. Для длинных сумм используется F11 на разрешённом max bet, без неподдерживаемого размера ставки.

B19 — самостоятельный playable первый book плюс ДВЕ ownership sequences: B19→B01 и B16→B01 до конца защищённого body loop. Прохождение одного book не доказывает sequences. Проверять в `?witch=m06`, не в спокойном режиме. F14 сохранён. BONUS showcase не считается base/FS book case.

Проверки: `python3 tools/generate_m07.py --check`; `python3 tools/verify_milestone.py`; `/m07-qa.html`108 actual-control runs с фиксированным шагом active clocks50ms; `/m07-qa.html?suite=wall`16 Normal/Fast real-tempo runs. Ускоренные clocks не являются frame-pacing/device evidence. Normal/Fast/Reduced/Replay сверяют exact terminal board30 cells, paid total, multiplier, один debit, controls и wallet-neutral replay. Отдельные ownership/failure/modal checks и viewport evidence перечисляются только по фактическим receipts в reports/m07.
