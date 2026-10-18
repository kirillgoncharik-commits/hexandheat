"""Dependency-light functional prototype for Hex & Heat outcome math.

The package intentionally contains a candidate, unbalanced configuration.  It is
not a production PAR sheet and makes no RTP claim.
"""

from .config import CANDIDATE_CONFIG, STAKE_CANDIDATE_CONFIG, MathConfig, PayAward, SymbolWeight
from .engine import (
    Board,
    CascadeLimitExceeded,
    InvalidBoard,
    board_from_flat,
    generate_outcome,
    precompute_book,
    resolve_round,
)
from .model import (
    BookEvent,
    Outcome,
    OutcomeBook,
    WeightedOutcome,
    canonical_json_bytes,
    deserialize_outcome,
)
from .replay import ReplayResult, exact_replay
from .verify import VerificationError, verify_outcome

__all__ = [
    "Board",
    "BookEvent",
    "CANDIDATE_CONFIG",
    "CascadeLimitExceeded",
    "InvalidBoard",
    "MathConfig",
    "Outcome",
    "OutcomeBook",
    "PayAward",
    "ReplayResult",
    "SymbolWeight",
    "STAKE_CANDIDATE_CONFIG",
    "VerificationError",
    "WeightedOutcome",
    "board_from_flat",
    "canonical_json_bytes",
    "deserialize_outcome",
    "exact_replay",
    "generate_outcome",
    "precompute_book",
    "resolve_round",
    "verify_outcome",
]
