# M05-02 — символы и события

Registry: apps/web/src/symbol-registry.js. 12 устойчивых math IDs. Девять ordinary используют девять существующих разных растров (item-00…08): goblet, mask, rose, eye, amber/round moon/square jade/heart/star elixirs. Low имеет круглую рамку; high — двойную прямоугольную. Дополнительный ID вторичен, основной признак — существующий силуэт/рисунок. Potion использует bottle art, три разные формы рамки и крупные +1/+2/+3. При пропаже картинки остаются разные графические glyphs, форма и ID. В paytable те же asset/name/ID. Provenance — ASSET_MANIFEST.json и M03_PROMPTS.md; новых raster masters не создано.

Путь: неизменённый resolve_round → Python stake_adapter → official-style book → stake-events.js → strict m05-base-1 validator → reducer → persistent BoardPlayer → replay. SYMBOL_MAP теперь identity mapping, L1/H1 не объединяются. Legacy six visual IDs сохранены только для старых motion fixtures, не для основного ReviewRgs.

| Domain event | Сохранённый смысл |
|---|---|
| boardReveal | authoritative board с исходными math IDs |
| win | cascade; groups (ID, count, threshold, positions, base/computed/paid units и currency amounts); amount фактически оплаченный; applied multiplier; paid positions; removedPositions включая Potion; capped |
| multiplier | from/increment/to; potions c ID, position, increment |
| cascade | authoritative next board, cascade index, точный removed set из explodingSymbols |
| finalWin | точный payout, finalMultiplier, capMicro, capped |

Strict contract отклоняет неизвестный ID/event, gap indices, row 5/reel -1 (включая прежнее позиционное aliasing), неправильную группу/позицию, отсутствующую simultaneous group, mismatch paid sum, cap, multiplier и removal union; проверяет gravity. Нормализация не исправляет финальный payout и не генерирует случайный refill. На malformed sample ошибка возникает до wallet mutation.

Cap: раньше winInfo.wins[].win копировал computed base × m, totalWin уже содержал paid после cap. Теперь adapter сохраняет computedWin отдельно и распределяет paid детерминированно в исходном порядке groups/regular_symbols: min(computed, remaining paid). Сумма paid groups равна totalWin. Это metadata repair, не новая экономика. Независимый Python тест покрывает cap с двумя группами H1/H4: final paid 6700 + 218500 units, неизменённый whole-round total 500000. UI показывает computed и paid явно в подробностях, текущую выплаченную сумму — на главном экране.

BoardPlayer использует state.removedPositions, а не один highlightedPositions. Сохраняется идентичность только точных survivors. Активированная Potion подсвечивается, исчезает один раз, следующая board не угадывается. Cap termination сохраняет последнюю engine board согласно snapshot. Legacy showcase с несовместимыми полями может reconciliation с явным trace; valid M05 pack не имеет reconciliation/fallback.
