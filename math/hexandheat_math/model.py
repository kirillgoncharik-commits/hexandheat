"""Immutable outcome and event-book types plus canonical serialization."""

from __future__ import annotations

from dataclasses import dataclass
import hashlib
import json
from typing import Any, Iterable, Mapping


def canonical_json_bytes(value: object) -> bytes:
    """Serialize JSON data with one byte representation for hashing and replay."""

    return json.dumps(
        value,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
        allow_nan=False,
    ).encode("utf-8")


def _payload_text(payload: Mapping[str, Any]) -> str:
    if "index" in payload or "type" in payload:
        raise ValueError("event payload cannot replace index or type")
    encoded = canonical_json_bytes(dict(payload))
    decoded = json.loads(encoded)
    if not isinstance(decoded, dict):  # defensive; Mapping should already ensure this
        raise ValueError("event payload must be an object")
    return encoded.decode("utf-8")


@dataclass(frozen=True)
class BookEvent:
    """Deeply immutable event.

    The payload is stored as canonical JSON text, so callers cannot mutate nested
    board/position data after an outcome is computed. ``to_dict`` returns a copy.
    """

    index: int
    type: str
    _payload: str

    def __post_init__(self) -> None:
        if self.index < 0 or not self.type:
            raise ValueError("events require a non-negative index and type")
        payload = json.loads(self._payload)
        if not isinstance(payload, dict):
            raise ValueError("event payload must be a JSON object")
        canonical = _payload_text(payload)
        if canonical != self._payload:
            raise ValueError("event payload must use canonical JSON")

    @classmethod
    def create(cls, index: int, event_type: str, **payload: Any) -> "BookEvent":
        return cls(index=index, type=event_type, _payload=_payload_text(payload))

    @property
    def payload(self) -> dict[str, Any]:
        return json.loads(self._payload)

    def to_dict(self) -> dict[str, Any]:
        return {"index": self.index, "type": self.type, **self.payload}


@dataclass(frozen=True)
class Outcome:
    """One precomputed round. The frontend may present but never alter it."""

    outcome_id: int
    payout_multiplier: int
    events: tuple[BookEvent, ...]
    config_id: str
    source_seed: int

    def __post_init__(self) -> None:
        if self.outcome_id < 0 or self.payout_multiplier < 0 or self.source_seed < 0:
            raise ValueError("outcome id, payout, and seed cannot be negative")
        if tuple(event.index for event in self.events) != tuple(range(len(self.events))):
            raise ValueError("event indices must be contiguous from zero")
        if not self.events or self.events[0].type != "boardReveal":
            raise ValueError("an outcome must start with boardReveal")
        if self.events[-1].type != "finalWin":
            raise ValueError("an outcome must end with finalWin")
        if self.events[-1].payload.get("amount") != self.payout_multiplier:
            raise ValueError("finalWin must equal payoutMultiplier")

    def to_dict(self) -> dict[str, Any]:
        # Stake-facing names are deliberately used at this boundary.
        return {
            "configId": self.config_id,
            "events": [event.to_dict() for event in self.events],
            "id": self.outcome_id,
            "payoutMultiplier": self.payout_multiplier,
            "sourceSeed": self.source_seed,
        }

    def to_stake_candidate_dict(self) -> dict[str, Any]:
        """Return the minimal outcome envelope for a future Stake SDK adapter.

        Event names and payloads remain this prototype's domain contract until
        they are mapped against a pinned SDK version; this method deliberately
        does not claim validated production-file conformance.
        """

        return {
            "events": [event.to_dict() for event in self.events],
            "id": self.outcome_id,
            "payoutMultiplier": self.payout_multiplier,
        }

    def canonical_bytes(self) -> bytes:
        return canonical_json_bytes(self.to_dict())

    @property
    def sha256(self) -> str:
        return hashlib.sha256(self.canonical_bytes()).hexdigest()


@dataclass(frozen=True)
class WeightedOutcome:
    outcome: Outcome
    weight: int = 1

    def __post_init__(self) -> None:
        if self.weight <= 0:
            raise ValueError("book weights must be positive integers")


@dataclass(frozen=True)
class OutcomeBook:
    """Immutable in-memory prototype of an RGS weighted outcome book."""

    version: str
    mode: str
    config_id: str
    entries: tuple[WeightedOutcome, ...]

    def __post_init__(self) -> None:
        if not self.version or not self.mode or not self.entries:
            raise ValueError("book requires version, mode, and at least one entry")
        ids = [entry.outcome.outcome_id for entry in self.entries]
        if len(ids) != len(set(ids)):
            raise ValueError("outcome ids must be unique within a book")
        if any(entry.outcome.config_id != self.config_id for entry in self.entries):
            raise ValueError("all outcomes must match the book config")

    @property
    def total_weight(self) -> int:
        return sum(entry.weight for entry in self.entries)

    def select(self, ticket: int) -> Outcome:
        """Select with an external integer ticket, avoiding hidden book RNG."""

        if not 0 <= ticket < self.total_weight:
            raise IndexError("ticket must be in [0, total_weight)")
        cursor = 0
        for entry in self.entries:
            cursor += entry.weight
            if ticket < cursor:
                return entry.outcome
        raise AssertionError("unreachable weighted selection state")

    def to_dict(self) -> dict[str, Any]:
        return {
            "configId": self.config_id,
            "entries": [
                {"outcome": entry.outcome.to_dict(), "weight": entry.weight}
                for entry in self.entries
            ],
            "mode": self.mode,
            "version": self.version,
        }

    def canonical_bytes(self) -> bytes:
        return canonical_json_bytes(self.to_dict())

    @property
    def sha256(self) -> str:
        return hashlib.sha256(self.canonical_bytes()).hexdigest()

    def json_lines(self) -> Iterable[bytes]:
        for entry in self.entries:
            yield canonical_json_bytes(entry.outcome.to_stake_candidate_dict()) + b"\n"


def deserialize_outcome(data: bytes | str) -> Outcome:
    """Load one canonical or ordinary JSON outcome into immutable types."""

    raw = json.loads(data)
    required = {"configId", "events", "id", "payoutMultiplier", "sourceSeed"}
    if not isinstance(raw, dict) or set(raw) != required:
        raise ValueError("outcome has unexpected or missing top-level fields")
    if not isinstance(raw["events"], list):
        raise ValueError("events must be a list")
    events: list[BookEvent] = []
    for item in raw["events"]:
        if not isinstance(item, dict) or "index" not in item or "type" not in item:
            raise ValueError("malformed event")
        payload = {key: value for key, value in item.items() if key not in {"index", "type"}}
        events.append(BookEvent.create(item["index"], item["type"], **payload))
    return Outcome(
        outcome_id=raw["id"],
        payout_multiplier=raw["payoutMultiplier"],
        events=tuple(events),
        config_id=raw["configId"],
        source_seed=raw["sourceSeed"],
    )
