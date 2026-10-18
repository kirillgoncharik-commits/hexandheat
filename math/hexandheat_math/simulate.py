"""Seeded candidate simulation report generator (standard library only)."""

from __future__ import annotations

import argparse
from collections import Counter
from dataclasses import asdict, dataclass
import json
import math
import random
import statistics

from .config import CANDIDATE_CONFIG, MathConfig
from .engine import generate_outcome
from .model import canonical_json_bytes
from .verify import verify_outcome


@dataclass(frozen=True)
class SimulationReport:
    disclaimer: str
    config_label: str
    config_sha256: str
    root_seed: int
    rounds: int
    payout_units_per_bet: int
    sample_return: float
    standard_error: float
    approximate_95_percent_interval: tuple[float, float]
    hit_rate: float
    zero_win_rate: float
    conditional_average_win: float
    standard_deviation: float
    percentiles: dict[str, int]
    max_observed_win: int
    max_observed_multiplier: int
    cascade_depth_distribution: dict[str, int]
    report_sha256: str = ""

    def to_dict(self, *, include_hash: bool = True) -> dict[str, object]:
        value = asdict(self)
        if not include_hash:
            value.pop("report_sha256")
        return value


def _percentile(sorted_values: list[int], quantile: float) -> int:
    if not sorted_values:
        return 0
    index = math.ceil(quantile * len(sorted_values)) - 1
    return sorted_values[max(0, min(index, len(sorted_values) - 1))]


def generate_report(
    *, rounds: int,
    root_seed: int,
    config: MathConfig = CANDIDATE_CONFIG,
    verify_each: bool = True,
) -> SimulationReport:
    if rounds <= 0 or root_seed < 0:
        raise ValueError("rounds must be positive and root_seed non-negative")
    seed_rng = random.Random(root_seed)
    payouts: list[int] = []
    cascade_depths: Counter[int] = Counter()
    max_multiplier = 1
    for outcome_id in range(rounds):
        round_seed = seed_rng.getrandbits(64)
        outcome = generate_outcome(config, round_seed, outcome_id)
        if verify_each:
            verify_outcome(outcome, config)
        payouts.append(outcome.payout_multiplier)
        cascade_depths[sum(event.type == "win" for event in outcome.events)] += 1
        max_multiplier = max(
            max_multiplier,
            int(outcome.events[-1].payload["finalMultiplier"]),
        )

    sorted_payouts = sorted(payouts)
    paid = [payout for payout in payouts if payout > 0]
    mean_units = statistics.fmean(payouts)
    stdev_units = statistics.pstdev(payouts)
    sample_return = mean_units / config.payout_units_per_bet
    standard_error = stdev_units / config.payout_units_per_bet / math.sqrt(rounds)
    base = SimulationReport(
        disclaimer=(
            "CANDIDATE UNBALANCED SAMPLE ONLY. This is not a production RTP, "
            "certification, approval, or promise of player return."
        ),
        config_label=config.label,
        config_sha256=config.config_id,
        root_seed=root_seed,
        rounds=rounds,
        payout_units_per_bet=config.payout_units_per_bet,
        sample_return=sample_return,
        standard_error=standard_error,
        approximate_95_percent_interval=(
            sample_return - 1.96 * standard_error,
            sample_return + 1.96 * standard_error,
        ),
        hit_rate=len(paid) / rounds,
        zero_win_rate=1.0 - len(paid) / rounds,
        conditional_average_win=(statistics.fmean(paid) if paid else 0.0),
        standard_deviation=stdev_units,
        percentiles={
            "p50": _percentile(sorted_payouts, 0.50),
            "p90": _percentile(sorted_payouts, 0.90),
            "p95": _percentile(sorted_payouts, 0.95),
            "p99": _percentile(sorted_payouts, 0.99),
        },
        max_observed_win=max(payouts),
        max_observed_multiplier=max_multiplier,
        cascade_depth_distribution={str(k): v for k, v in sorted(cascade_depths.items())},
    )
    digest = __import__("hashlib").sha256(
        canonical_json_bytes(base.to_dict(include_hash=False))
    ).hexdigest()
    return SimulationReport(**{**base.to_dict(include_hash=False), "report_sha256": digest})


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--rounds", type=int, default=10_000)
    parser.add_argument("--seed", type=int, default=20_261_018)
    parser.add_argument(
        "--skip-independent-verification",
        action="store_true",
        help="faster smoke run only; do not use as acceptance evidence",
    )
    args = parser.parse_args()
    report = generate_report(
        rounds=args.rounds,
        root_seed=args.seed,
        verify_each=not args.skip_independent_verification,
    )
    print(json.dumps(report.to_dict(), indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
