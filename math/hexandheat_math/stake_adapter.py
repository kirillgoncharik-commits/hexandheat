"""Stake Engine publish/event adapter with an independent file verifier.

The local engine remains responsible for arithmetic.  This module only maps an
already verified outcome to the event vocabulary used by the pinned official
``apps/scatter`` sample and writes the RGS publish envelope.
"""

from __future__ import annotations

from dataclasses import dataclass
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
from typing import Any, Iterable, Optional

from .model import Outcome, OutcomeBook, canonical_json_bytes


class StakeFormatError(AssertionError):
    pass


def _require(condition: bool, message: str) -> None:
    if not condition:
        raise StakeFormatError(message)


def _position(value: int, rows: int = 5) -> dict[str, int]:
    return {"reel": value // rows, "row": value % rows}


def _board(value: Any) -> list[list[str]]:
    _require(isinstance(value, list) and len(value) == 6, "board must have six reels")
    _require(all(isinstance(reel, list) and len(reel) == 5 for reel in value), "board must be 6x5")
    return [list(reel) for reel in value]


def map_outcome_events(outcome: Outcome) -> list[dict[str, Any]]:
    """Map local facts to official scatter-style BookEvents.

    ``tumbleBoard.newSymbols`` contains the complete settled 6x5 board in this
    bounded adapter.  The frontend mapping owns that documented distinction;
    payout and multiplier values are copied, never recomputed there.
    """

    mapped: list[dict[str, Any]] = []
    running_win = 0
    last_removed: list[int] = []

    def emit(event_type: str, **payload: Any) -> None:
        mapped.append({"index": len(mapped), "type": event_type, **payload})

    for event in outcome.events:
        payload = event.payload
        if event.type == "boardReveal":
            emit(
                "reveal",
                board=_board(payload["board"]),
                paddingPositions=[],
                anticipation=[0] * 6,
                gameType="basegame",
            )
        elif event.type == "win":
            running_win += int(payload["amount"])
            last_removed = list(payload["removedPositions"])
            wins = []
            for group in payload["groups"]:
                positions = [_position(int(value)) for value in group["positions"]]
                wins.append(
                    {
                        "symbol": group["symbol"],
                        "win": int(group["baseAmount"]) * int(payload["multiplier"]),
                        "positions": positions,
                        "meta": {
                            "globalMult": int(payload["multiplier"]),
                            "clusterMult": 1,
                            "winWithoutMult": int(group["baseAmount"]),
                            "overlay": positions[0],
                        },
                    }
                )
            emit("winInfo", totalWin=int(payload["amount"]), wins=wins)
            emit("updateTumbleWin", amount=running_win)
        elif event.type == "multiplier":
            emit(
                "updateGlobalMult",
                globalMult=int(payload["to"]),
                previousGlobalMult=int(payload["from"]),
                increment=int(payload["increment"]),
                potionPositions=[_position(int(item["position"])) for item in payload["potions"]],
            )
        elif event.type == "cascade":
            emit(
                "tumbleBoard",
                explodingSymbols=[_position(value) for value in last_removed],
                newSymbols=_board(payload["board"]),
                cascade=int(payload["cascade"]),
            )
        elif event.type == "finalWin":
            amount = int(payload["amount"])
            emit("setTotalWin", amount=amount)
            emit("setWin", amount=amount, winLevel=_win_level(amount))
            emit("finalWin", amount=amount)
        else:
            raise StakeFormatError(f"unsupported local event: {event.type}")
    return mapped


def _win_level(amount: int) -> int:
    if amount >= 1_000:
        return 3
    if amount >= 400:
        return 2
    if amount > 0:
        return 1
    return 0


def to_stake_book(outcome: Outcome) -> dict[str, Any]:
    return {
        "id": outcome.outcome_id,
        "events": map_outcome_events(outcome),
        "payoutMultiplier": outcome.payout_multiplier,
    }


@dataclass(frozen=True)
class PublishEvidence:
    book_sha256: str
    lookup_sha256: str
    entries: int
    payout_sha256: str
    compressed_book_sha256: Optional[str] = None

    def to_dict(self) -> dict[str, Any]:
        result = {
            "bookSha256": self.book_sha256,
            "entries": self.entries,
            "lookupSha256": self.lookup_sha256,
            "payoutSha256": self.payout_sha256,
        }
        if self.compressed_book_sha256:
            result["compressedBookSha256"] = self.compressed_book_sha256
        return result


def _book_source(book: OutcomeBook) -> bytes:
    return b"".join(canonical_json_bytes(to_stake_book(entry.outcome)) + b"\n" for entry in book.entries)


def _lookup_source(book: OutcomeBook) -> bytes:
    rows = [f"{entry.outcome.outcome_id},{entry.weight},{entry.outcome.payout_multiplier}\n" for entry in book.entries]
    return "".join(rows).encode("utf-8")


def write_publish_files(book: OutcomeBook, destination: Path, *, compress: bool = True) -> PublishEvidence:
    destination.mkdir(parents=True, exist_ok=True)
    book_source = _book_source(book)
    lookup_source = _lookup_source(book)
    plain_book = destination / "books_base.jsonl"
    plain_book.write_bytes(book_source)
    (destination / "lookUpTable_base_0.csv").write_bytes(lookup_source)
    index = {
        "modes": [
            {
                "name": "base",
                "cost": 1.0,
                "events": "books_base.jsonl.zst",
                "weights": "lookUpTable_base_0.csv",
            }
        ]
    }
    (destination / "index.json").write_text(json.dumps(index, indent=2) + "\n", encoding="utf-8")

    if compress:
        zstd = shutil.which("zstd")
        if not zstd:
            raise RuntimeError("zstd CLI is required to regenerate the official compressed book")
        subprocess.run(
            [zstd, "-q", "-f", str(plain_book), "-o", str(destination / "books_base.jsonl.zst")],
            check=True,
        )

    evidence = verify_publish_sources(book_source, lookup_source)
    if compress:
        compressed_hash = hashlib.sha256((destination / "books_base.jsonl.zst").read_bytes()).hexdigest()
        evidence = PublishEvidence(
            book_sha256=evidence.book_sha256,
            lookup_sha256=evidence.lookup_sha256,
            entries=evidence.entries,
            payout_sha256=evidence.payout_sha256,
            compressed_book_sha256=compressed_hash,
        )
    (destination / "verification.json").write_text(
        json.dumps(evidence.to_dict(), indent=2) + "\n",
        encoding="utf-8",
    )
    return evidence


def verify_publish_sources(book_source: bytes, lookup_source: bytes) -> PublishEvidence:
    """Independently verify event order, payout equality and lookup integrity."""

    books = [json.loads(line) for line in book_source.splitlines() if line.strip()]
    rows = []
    for raw in lookup_source.decode("utf-8").splitlines():
        if not raw.strip():
            continue
        parts = raw.split(",")
        _require(len(parts) == 3, "lookup row must contain id, weight, payout")
        rows.append(tuple(int(value) for value in parts))

    _require(len(books) == len(rows) and books, "book/lookup entry count mismatch")
    payouts: list[int] = []
    for book, (lookup_id, weight, lookup_payout) in zip(books, rows):
        _require(set(book) == {"id", "events", "payoutMultiplier"}, "unexpected book envelope")
        _require(book["id"] == lookup_id, "book/lookup id mismatch")
        _require(weight > 0, "lookup weight must be positive")
        payout = book["payoutMultiplier"]
        _require(isinstance(payout, int) and payout >= 0, "payout must be uint64-compatible")
        _require(payout % 10 == 0, "payout must use the official 0.1x increment")
        _require(payout == lookup_payout, "book/lookup payout mismatch")
        events = book["events"]
        _require(isinstance(events, list) and events, "events are required")
        _require([event.get("index") for event in events] == list(range(len(events))), "event order mismatch")
        _require(events[0].get("type") == "reveal", "book must begin with reveal")
        _require(events[-1].get("type") == "finalWin", "book must end with finalWin")
        _require(events[-1].get("amount") == payout, "finalWin/payout mismatch")
        _board(events[0].get("board"))
        payouts.append(payout)

    payout_source = canonical_json_bytes(payouts)
    return PublishEvidence(
        book_sha256=hashlib.sha256(book_source).hexdigest(),
        lookup_sha256=hashlib.sha256(lookup_source).hexdigest(),
        entries=len(books),
        payout_sha256=hashlib.sha256(payout_source).hexdigest(),
    )


def classify_book(book: dict[str, Any]) -> set[str]:
    events = book["events"]
    event_types = [event["type"] for event in events]
    classes = {"loss" if book["payoutMultiplier"] == 0 else "win"}
    if event_types.count("winInfo") >= 2:
        classes.add("cascade")
    if "updateGlobalMult" in event_types:
        classes.add("multiplier")
    if event_types.count("winInfo") >= 5:
        classes.add("long-chain")
    if book["payoutMultiplier"] == 500_000:
        classes.add("max-win")
    return classes


def verify_required_cases(books: Iterable[dict[str, Any]]) -> None:
    covered: set[str] = set()
    for book in books:
        covered.update(classify_book(book))
    required = {"loss", "win", "cascade", "multiplier", "long-chain", "max-win"}
    _require(required <= covered, f"missing required cases: {sorted(required - covered)}")
