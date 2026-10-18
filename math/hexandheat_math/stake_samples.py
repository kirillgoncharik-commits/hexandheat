"""Curated deterministic outcomes used only for Stake-format integration QA."""

from __future__ import annotations

from .config import STAKE_CANDIDATE_CONFIG
from .engine import board_from_flat, generate_outcome, resolve_round
from .model import OutcomeBook, WeightedOutcome
from .verify import verify_outcome


SAMPLE_LABELS = (
    "loss",
    "normal-win",
    "cascade",
    "multiplier",
    "long-chain",
    "max-win",
)


def _max_win_outcome(outcome_id: int):
    # Eight H4 symbols pay, while 22 P3 potions raise the next-cascade
    # multiplier. Two all-H4 refills then reach the configured cap naturally.
    initial = board_from_flat(
        ["H4"] * 8 + ["P3"] * 22,
        STAKE_CANDIDATE_CONFIG,
    )
    return resolve_round(
        STAKE_CANDIDATE_CONFIG,
        initial,
        ["H4"] * 60,
        outcome_id=outcome_id,
        source_seed=999_999,
    )


def build_stake_sample_book() -> OutcomeBook:
    """Return six immutable cases covering the Milestone 02 math matrix."""

    seeds = (0, 3, 125, 7, 159)
    outcomes = [
        generate_outcome(STAKE_CANDIDATE_CONFIG, seed, outcome_id)
        for outcome_id, seed in enumerate(seeds)
    ]
    outcomes.append(_max_win_outcome(len(outcomes)))
    for outcome in outcomes:
        verify_outcome(outcome, STAKE_CANDIDATE_CONFIG)

    return OutcomeBook(
        version="stake-integration-v0",
        mode="base",
        config_id=STAKE_CANDIDATE_CONFIG.config_id,
        entries=tuple(WeightedOutcome(outcome, 1) for outcome in outcomes),
    )
