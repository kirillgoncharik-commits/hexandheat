"""Independent outcome verifier.

This module intentionally recomputes symbol counts, threshold selection, awards,
multiplier changes, gravity, and totals without importing private engine helpers.
It reads only the exported outcome/event contract and immutable configuration.
"""

from __future__ import annotations

from collections import Counter
from typing import Any

from .config import MathConfig
from .model import Outcome


class VerificationError(AssertionError):
    pass


def _require(condition: bool, message: str) -> None:
    if not condition:
        raise VerificationError(message)


def _read_board(value: Any, config: MathConfig) -> tuple[tuple[str, ...], ...]:
    _require(isinstance(value, list), "board must be an array")
    board = tuple(tuple(column) for column in value)
    _require(len(board) == config.columns, "board column count mismatch")
    _require(all(len(column) == config.rows for column in board), "board row count mismatch")
    _require(
        all(symbol in config.allowed_symbols for column in board for symbol in column),
        "board contains an unknown symbol",
    )
    return board


def _expected_groups(board: tuple[tuple[str, ...], ...], config: MathConfig) -> list[dict[str, Any]]:
    counts = Counter(cell for column in board for cell in column)
    groups: list[dict[str, Any]] = []
    for symbol in config.regular_symbols:
        eligible = [
            award
            for award in config.paytable
            if award.symbol == symbol and award.threshold <= counts[symbol]
        ]
        if not eligible:
            continue
        award = max(eligible, key=lambda item: item.threshold)
        positions = [
            column * config.rows + row
            for column, cells in enumerate(board)
            for row, cell in enumerate(cells)
            if cell == symbol
        ]
        groups.append(
            {
                "baseAmount": award.amount,
                "count": len(positions),
                "positions": positions,
                "symbol": symbol,
                "threshold": award.threshold,
            }
        )
    return groups


def _expected_potions(board: tuple[tuple[str, ...], ...], config: MathConfig) -> list[dict[str, Any]]:
    potion_values = dict(config.potion_increments)
    return [
        {
            "increment": potion_values[cell],
            "position": column * config.rows + row,
            "symbol": cell,
        }
        for column, cells in enumerate(board)
        for row, cell in enumerate(cells)
        if cell in potion_values
    ]


def _verify_gravity(
    old: tuple[tuple[str, ...], ...],
    new: tuple[tuple[str, ...], ...],
    removed: set[int],
    config: MathConfig,
) -> None:
    for column_index in range(config.columns):
        survivors = tuple(
            cell
            for row, cell in enumerate(old[column_index])
            if column_index * config.rows + row not in removed
        )
        if survivors:
            _require(
                new[column_index][-len(survivors) :] == survivors,
                f"cascade gravity mismatch in column {column_index}",
            )


def verify_outcome(outcome: Outcome, config: MathConfig) -> None:
    """Raise ``VerificationError`` unless all exported math invariants hold."""

    _require(outcome.config_id == config.config_id, "config hash mismatch")
    _require(outcome.events[0].type == "boardReveal", "missing initial board")
    _require(outcome.events[-1].type == "finalWin", "missing final win")
    _require(
        [event.index for event in outcome.events] == list(range(len(outcome.events))),
        "event indices are not contiguous",
    )

    board = _read_board(outcome.events[0].payload.get("board"), config)
    event_cursor = 1
    cascade_index = 0
    multiplier = 1
    total_win = 0

    while True:
        groups = _expected_groups(board, config)
        if not groups:
            break

        _require(event_cursor < len(outcome.events), "missing win event")
        win = outcome.events[event_cursor]
        event_cursor += 1
        _require(win.type == "win", "paying board must be followed by win")
        payload = win.payload
        base_amount = sum(group["baseAmount"] for group in groups)
        uncapped = base_amount * multiplier
        expected_amount = min(uncapped, config.max_win - total_win)
        potion_events = _expected_potions(board, config)
        paid_positions = {
            position for group in groups for position in group["positions"]
        }
        removed = paid_positions | {item["position"] for item in potion_events}

        _require(payload.get("cascade") == cascade_index, "win cascade index mismatch")
        _require(payload.get("groups") == groups, "win groups do not recompute")
        _require(payload.get("baseAmount") == base_amount, "base amount mismatch")
        _require(payload.get("multiplier") == multiplier, "applied multiplier mismatch")
        _require(payload.get("amount") == expected_amount, "paid amount mismatch")
        _require(payload.get("capped") == (expected_amount < uncapped), "cap flag mismatch")
        _require(payload.get("positions") == sorted(paid_positions), "paid positions mismatch")
        _require(payload.get("removedPositions") == sorted(removed), "removal union mismatch")
        total_win += expected_amount

        if potion_events:
            _require(event_cursor < len(outcome.events), "missing multiplier event")
            modifier = outcome.events[event_cursor]
            event_cursor += 1
            _require(modifier.type == "multiplier", "potions must precede a multiplier event")
            change = sum(item["increment"] for item in potion_events)
            expected_modifier = {
                "cascade": cascade_index,
                "from": multiplier,
                "increment": change,
                "potions": potion_events,
                "to": multiplier + change,
            }
            _require(modifier.payload == expected_modifier, "multiplier event mismatch")
            multiplier += change

        if total_win >= config.max_win:
            break
        _require(event_cursor < len(outcome.events), "missing cascade event")
        cascade = outcome.events[event_cursor]
        event_cursor += 1
        _require(cascade.type == "cascade", "paying board must cascade")
        _require(cascade.payload.get("cascade") == cascade_index + 1, "cascade index mismatch")
        next_board = _read_board(cascade.payload.get("board"), config)
        _verify_gravity(board, next_board, removed, config)
        board = next_board
        cascade_index += 1
        _require(cascade_index < config.max_cascades, "cascade limit reached")

    _require(event_cursor == len(outcome.events) - 1, "unexpected event before finalWin")
    final = outcome.events[event_cursor]
    _require(final.type == "finalWin", "outcome must end with finalWin")
    _require(final.payload.get("amount") == total_win, "final win total mismatch")
    _require(final.payload.get("finalMultiplier") == multiplier, "final multiplier mismatch")
    _require(
        final.payload.get("payoutUnitsPerBet") == config.payout_units_per_bet,
        "payout unit mismatch",
    )
    _require(outcome.payout_multiplier == total_win, "book payout does not equal recomputation")
    _require(total_win <= config.max_win, "max win exceeded")
