"""Pure round resolution plus deterministic seeded candidate generation."""

from __future__ import annotations

from collections import Counter
from collections.abc import Iterable, Iterator
import random

from .config import MathConfig
from .model import BookEvent, Outcome, OutcomeBook, WeightedOutcome


Board = tuple[tuple[str, ...], ...]  # six columns, each top-to-bottom


class InvalidBoard(ValueError):
    pass


class CascadeLimitExceeded(RuntimeError):
    pass


def board_from_flat(values: Iterable[str], config: MathConfig) -> Board:
    """Build a column-major board; position is ``column * rows + row``."""

    cells = tuple(values)
    expected = config.columns * config.rows
    if len(cells) != expected:
        raise InvalidBoard(f"expected {expected} cells, got {len(cells)}")
    board = tuple(
        tuple(cells[column * config.rows : (column + 1) * config.rows])
        for column in range(config.columns)
    )
    _validate_board(board, config)
    return board


def _validate_board(board: Board, config: MathConfig) -> None:
    if len(board) != config.columns or any(len(column) != config.rows for column in board):
        raise InvalidBoard("board must contain six columns of five rows")
    unknown = {symbol for column in board for symbol in column} - config.allowed_symbols
    if unknown:
        raise InvalidBoard(f"board contains unknown symbols: {sorted(unknown)}")


def _board_payload(board: Board) -> list[list[str]]:
    return [list(column) for column in board]


def _evaluate_groups(board: Board, config: MathConfig) -> list[dict[str, object]]:
    counts = Counter(symbol for column in board for symbol in column)
    groups: list[dict[str, object]] = []
    for symbol in config.regular_symbols:
        award = config.award_for(symbol, counts[symbol])
        if award is None:
            continue
        positions = [
            column_index * config.rows + row_index
            for column_index, column in enumerate(board)
            for row_index, cell in enumerate(column)
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


def _potion_activations(board: Board, config: MathConfig) -> list[dict[str, int | str]]:
    activations: list[dict[str, int | str]] = []
    for column_index, column in enumerate(board):
        for row_index, symbol in enumerate(column):
            increment = config.potion_increment(symbol)
            if increment:
                activations.append(
                    {
                        "increment": increment,
                        "position": column_index * config.rows + row_index,
                        "symbol": symbol,
                    }
                )
    return activations


def _collapse(
    board: Board,
    removed_positions: set[int],
    refill: Iterator[str],
    config: MathConfig,
) -> Board:
    columns: list[tuple[str, ...]] = []
    for column_index, column in enumerate(board):
        survivors = [
            symbol
            for row_index, symbol in enumerate(column)
            if column_index * config.rows + row_index not in removed_positions
        ]
        missing = config.rows - len(survivors)
        new_symbols: list[str] = []
        for _ in range(missing):
            try:
                symbol = next(refill)
            except StopIteration as exc:
                raise ValueError("refill source ended before round settled") from exc
            if symbol not in config.allowed_symbols:
                raise ValueError(f"refill produced unknown symbol: {symbol}")
            new_symbols.append(symbol)
        columns.append(tuple(new_symbols + survivors))
    return tuple(columns)


def resolve_round(
    config: MathConfig,
    initial_board: Board,
    refill_symbols: Iterable[str],
    *,
    outcome_id: int = 0,
    source_seed: int = 0,
) -> Outcome:
    """Resolve a round from explicit inputs with no hidden state or RNG.

    Simultaneous regular-symbol wins are paid at the multiplier that existed at
    the start of the cascade. Visible potions then activate and are removed,
    increasing the multiplier for subsequent cascades. A non-paying board does
    not activate potions. The multiplier always starts at one in this function.
    """

    _validate_board(initial_board, config)
    if outcome_id < 0 or source_seed < 0:
        raise ValueError("outcome_id and source_seed cannot be negative")

    refill = iter(refill_symbols)
    events: list[BookEvent] = [
        BookEvent.create(0, "boardReveal", board=_board_payload(initial_board))
    ]
    board = initial_board
    multiplier = 1  # round-scoped: deliberately never accepted as input
    total_win = 0

    for cascade_index in range(config.max_cascades):
        groups = _evaluate_groups(board, config)
        if not groups:
            break

        base_amount = sum(int(group["baseAmount"]) for group in groups)
        uncapped_amount = base_amount * multiplier
        remaining = config.max_win - total_win
        paid_amount = min(uncapped_amount, remaining)
        total_win += paid_amount
        paid_positions = {
            int(position)
            for group in groups
            for position in group["positions"]  # type: ignore[union-attr]
        }
        potions = _potion_activations(board, config)
        removed_positions = paid_positions | {int(item["position"]) for item in potions}

        events.append(
            BookEvent.create(
                len(events),
                "win",
                amount=paid_amount,
                baseAmount=base_amount,
                capped=paid_amount < uncapped_amount,
                cascade=cascade_index,
                groups=groups,
                multiplier=multiplier,
                positions=sorted(paid_positions),
                removedPositions=sorted(removed_positions),
            )
        )

        if potions:
            increment = sum(int(item["increment"]) for item in potions)
            previous = multiplier
            multiplier += increment
            events.append(
                BookEvent.create(
                    len(events),
                    "multiplier",
                    cascade=cascade_index,
                    **{"from": previous},
                    increment=increment,
                    potions=potions,
                    to=multiplier,
                )
            )

        if total_win >= config.max_win:
            break

        board = _collapse(board, removed_positions, refill, config)
        events.append(
            BookEvent.create(
                len(events),
                "cascade",
                board=_board_payload(board),
                cascade=cascade_index + 1,
            )
        )
    else:
        raise CascadeLimitExceeded(
            f"round remained paying after {config.max_cascades} cascades"
        )

    events.append(
        BookEvent.create(
            len(events),
            "finalWin",
            amount=total_win,
            finalMultiplier=multiplier,
            payoutUnitsPerBet=config.payout_units_per_bet,
        )
    )
    return Outcome(
        outcome_id=outcome_id,
        payout_multiplier=total_win,
        events=tuple(events),
        config_id=config.config_id,
        source_seed=source_seed,
    )


class _WeightedSymbolStream:
    def __init__(self, config: MathConfig, seed: int):
        self._rng = random.Random(seed)
        self._symbols = tuple((entry.symbol, entry.weight) for entry in config.symbol_weights)
        self._total = sum(weight for _, weight in self._symbols)

    def __iter__(self) -> "_WeightedSymbolStream":
        return self

    def __next__(self) -> str:
        ticket = self._rng.randrange(self._total)
        cursor = 0
        for symbol, weight in self._symbols:
            cursor += weight
            if ticket < cursor:
                return symbol
        raise AssertionError("unreachable symbol selection state")


def generate_outcome(config: MathConfig, seed: int, outcome_id: int = 0) -> Outcome:
    """Generate one deterministic candidate outcome from a non-negative seed."""

    if seed < 0:
        raise ValueError("seed cannot be negative")
    stream = iter(_WeightedSymbolStream(config, seed))
    initial = board_from_flat(
        (next(stream) for _ in range(config.columns * config.rows)), config
    )
    return resolve_round(
        config,
        initial,
        stream,
        outcome_id=outcome_id,
        source_seed=seed,
    )


def precompute_book(
    config: MathConfig,
    seeds: Iterable[int],
    *,
    weights: Iterable[int] | None = None,
    version: str = "prototype-v0",
) -> OutcomeBook:
    """Materialize an immutable book; generation is never performed at replay."""

    seed_values = tuple(seeds)
    if not seed_values:
        raise ValueError("at least one seed is required")
    weight_values = tuple(weights) if weights is not None else (1,) * len(seed_values)
    if len(weight_values) != len(seed_values):
        raise ValueError("weights must have one entry per seed")
    entries = tuple(
        WeightedOutcome(generate_outcome(config, seed, outcome_id), weight)
        for outcome_id, (seed, weight) in enumerate(zip(seed_values, weight_values))
    )
    return OutcomeBook(
        version=version,
        mode=config.mode,
        config_id=config.config_id,
        entries=entries,
    )
