"""Exact, RNG-free consumption of immutable outcome events."""

from __future__ import annotations

from dataclasses import dataclass
import hashlib
from typing import Any

from .model import Outcome, deserialize_outcome


@dataclass(frozen=True)
class ReplayResult:
    outcome: Outcome
    final_board: tuple[tuple[str, ...], ...]
    final_multiplier: int
    final_win: int
    consumed_event_types: tuple[str, ...]


def exact_replay(
    serialized_outcome: bytes | str,
    *,
    expected_sha256: str | None = None,
) -> ReplayResult:
    """Replay serialized BookEvents exactly, with no payout recalculation or RNG.

    Semantic math validation lives in ``verify_outcome``. This function models a
    presentation consumer: it accepts immutable authoritative events and derives
    only display state.
    """

    outcome = deserialize_outcome(serialized_outcome)
    if expected_sha256 is not None:
        actual = hashlib.sha256(outcome.canonical_bytes()).hexdigest()
        if actual != expected_sha256:
            raise ValueError(f"outcome hash mismatch: expected {expected_sha256}, got {actual}")

    board: tuple[tuple[str, ...], ...] | None = None
    multiplier = 1
    final_win: int | None = None
    event_types: list[str] = []

    for event in outcome.events:
        payload: dict[str, Any] = event.payload
        event_types.append(event.type)
        if event.type in {"boardReveal", "cascade"}:
            raw_board = payload.get("board")
            if not isinstance(raw_board, list):
                raise ValueError(f"{event.type} requires a board")
            board = tuple(tuple(column) for column in raw_board)
        elif event.type == "multiplier":
            if payload.get("from") != multiplier:
                raise ValueError("non-contiguous multiplier event")
            multiplier = int(payload["to"])
        elif event.type == "finalWin":
            final_win = int(payload["amount"])

    if board is None or final_win is None:
        raise ValueError("replay did not reach a board and final win")
    return ReplayResult(
        outcome=outcome,
        final_board=board,
        final_multiplier=multiplier,
        final_win=final_win,
        consumed_event_types=tuple(event_types),
    )
