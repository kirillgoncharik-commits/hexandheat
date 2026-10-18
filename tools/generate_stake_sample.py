#!/usr/bin/env python3
"""Regenerate the bounded Stake-format Hex & Heat integration book."""

from __future__ import annotations

import json
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "math"))

from hexandheat_math.stake_adapter import (  # noqa: E402
    to_stake_book,
    verify_required_cases,
    write_publish_files,
)
from hexandheat_math.stake_samples import build_stake_sample_book  # noqa: E402


def main() -> None:
    destination = ROOT / "math" / "publish_files"
    book = build_stake_sample_book()
    stake_books = [to_stake_book(entry.outcome) for entry in book.entries]
    verify_required_cases(stake_books)
    evidence = write_publish_files(book, destination, compress=True)
    print(json.dumps(evidence.to_dict(), indent=2))


if __name__ == "__main__":
    main()
