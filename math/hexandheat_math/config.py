"""Immutable candidate inputs for the functional-prototype math.

All payout values use ``PAYOUT_UNITS_PER_BET = 100``: 100 units equals 1x the
stake.  The values and symbol weights below are exploration inputs only.  They
have not been optimized or independently approved and do not claim any RTP.
"""

from __future__ import annotations

from dataclasses import dataclass
import hashlib
import json


@dataclass(frozen=True)
class SymbolWeight:
    symbol: str
    weight: int


@dataclass(frozen=True)
class PayAward:
    symbol: str
    threshold: int
    amount: int


@dataclass(frozen=True)
class MathConfig:
    """Fully immutable round rules and candidate economics."""

    label: str
    columns: int
    rows: int
    payout_units_per_bet: int
    max_win: int
    max_cascades: int
    symbol_weights: tuple[SymbolWeight, ...]
    paytable: tuple[PayAward, ...]
    potion_increments: tuple[tuple[str, int], ...]
    mode: str = "base"

    def __post_init__(self) -> None:
        if self.columns != 6 or self.rows != 5:
            raise ValueError("the prototype contract requires a 6x5 board")
        if self.payout_units_per_bet <= 0 or self.max_win <= 0:
            raise ValueError("payout units and max win must be positive")
        if self.max_cascades <= 0:
            raise ValueError("max_cascades must be positive")

        symbols = [entry.symbol for entry in self.symbol_weights]
        if len(symbols) != len(set(symbols)) or not symbols:
            raise ValueError("symbol weights must have unique, non-empty symbols")
        if any(entry.weight <= 0 for entry in self.symbol_weights):
            raise ValueError("symbol weights must be positive integers")

        potion_names = [name for name, _ in self.potion_increments]
        if len(potion_names) != len(set(potion_names)):
            raise ValueError("potion symbols must be unique")
        if any(name not in symbols or increment <= 0 for name, increment in self.potion_increments):
            raise ValueError("potions must be weighted symbols with positive increments")

        seen_awards: set[tuple[str, int]] = set()
        last_threshold: dict[str, int] = {}
        for award in self.paytable:
            key = (award.symbol, award.threshold)
            if key in seen_awards:
                raise ValueError(f"duplicate paytable entry: {key}")
            seen_awards.add(key)
            if award.symbol not in symbols or award.symbol in potion_names:
                raise ValueError("paytable symbols must be weighted regular symbols")
            if award.threshold < 8 or award.amount < 0:
                raise ValueError("thresholds start at 8 and awards cannot be negative")
            if award.threshold <= last_threshold.get(award.symbol, 0):
                raise ValueError("thresholds must be strictly increasing per symbol")
            last_threshold[award.symbol] = award.threshold

    @property
    def regular_symbols(self) -> tuple[str, ...]:
        potions = {name for name, _ in self.potion_increments}
        return tuple(entry.symbol for entry in self.symbol_weights if entry.symbol not in potions)

    @property
    def allowed_symbols(self) -> frozenset[str]:
        return frozenset(entry.symbol for entry in self.symbol_weights)

    @property
    def config_id(self) -> str:
        return hashlib.sha256(self.canonical_bytes()).hexdigest()

    def potion_increment(self, symbol: str) -> int:
        for name, increment in self.potion_increments:
            if name == symbol:
                return increment
        return 0

    def award_for(self, symbol: str, count: int) -> PayAward | None:
        selected: PayAward | None = None
        for award in self.paytable:
            if award.symbol == symbol and award.threshold <= count:
                selected = award
        return selected

    def to_dict(self) -> dict[str, object]:
        return {
            "columns": self.columns,
            "label": self.label,
            "maxCascades": self.max_cascades,
            "maxWin": self.max_win,
            "mode": self.mode,
            "paytable": [
                {"amount": p.amount, "symbol": p.symbol, "threshold": p.threshold}
                for p in self.paytable
            ],
            "payoutUnitsPerBet": self.payout_units_per_bet,
            "potionIncrements": [
                {"increment": increment, "symbol": symbol}
                for symbol, increment in self.potion_increments
            ],
            "rows": self.rows,
            "symbolWeights": [
                {"symbol": entry.symbol, "weight": entry.weight}
                for entry in self.symbol_weights
            ],
        }

    def canonical_bytes(self) -> bytes:
        return json.dumps(
            self.to_dict(), sort_keys=True, separators=(",", ":"), ensure_ascii=False
        ).encode("utf-8")


def _awards(symbol: str, amounts: tuple[int, int, int, int, int]) -> tuple[PayAward, ...]:
    return tuple(
        PayAward(symbol=symbol, threshold=threshold, amount=amount)
        for threshold, amount in zip((8, 10, 12, 15, 20), amounts)
    )


# CANDIDATE / UNBALANCED / NOT PRODUCTION. No RTP is asserted for this table.
CANDIDATE_CONFIG = MathConfig(
    label="CANDIDATE_UNBALANCED_V0",
    columns=6,
    rows=5,
    payout_units_per_bet=100,
    max_win=500_000,  # exploratory 5,000x cap
    max_cascades=64,
    symbol_weights=(
        SymbolWeight("L1", 140),
        SymbolWeight("L2", 140),
        SymbolWeight("L3", 140),
        SymbolWeight("L4", 140),
        SymbolWeight("L5", 140),
        SymbolWeight("H1", 80),
        SymbolWeight("H2", 70),
        SymbolWeight("H3", 60),
        SymbolWeight("H4", 50),
        SymbolWeight("P1", 28),
        SymbolWeight("P2", 10),
        SymbolWeight("P3", 2),
    ),
    paytable=(
        *_awards("L1", (15, 25, 50, 100, 250)),
        *_awards("L2", (18, 30, 60, 120, 300)),
        *_awards("L3", (20, 35, 70, 140, 350)),
        *_awards("L4", (22, 40, 80, 160, 400)),
        *_awards("L5", (25, 45, 90, 180, 450)),
        *_awards("H1", (50, 100, 200, 500, 1_500)),
        *_awards("H2", (60, 120, 250, 650, 2_000)),
        *_awards("H3", (75, 150, 325, 850, 2_750)),
        *_awards("H4", (100, 200, 450, 1_200, 4_000)),
    ),
    potion_increments=(("P1", 1), ("P2", 2), ("P3", 3)),
)
