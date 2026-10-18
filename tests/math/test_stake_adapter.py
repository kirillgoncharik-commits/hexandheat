from __future__ import annotations

import json
from pathlib import Path
import sys
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "math"))

from hexandheat_math import STAKE_CANDIDATE_CONFIG, verify_outcome  # noqa: E402
from hexandheat_math.stake_adapter import (  # noqa: E402
    StakeFormatError,
    map_outcome_events,
    to_stake_book,
    verify_publish_sources,
    verify_required_cases,
    write_publish_files,
)
from hexandheat_math.stake_samples import SAMPLE_LABELS, build_stake_sample_book  # noqa: E402


class StakeAdapterTests(unittest.TestCase):
    def test_sdk_pins_and_compatibility_patch_are_explicit(self):
        lock = json.loads((ROOT / "sdk-lock.json").read_text(encoding="utf-8"))
        self.assertEqual(lock["mathSdk"]["commit"], "a6dccd86de740cc5d318079483cb6204cc5c19bc")
        self.assertEqual(lock["webSdk"]["commit"], "1843d60cedb94b390e641b563f32ad64353bec5e")
        patch = (ROOT / lock["mathSdk"]["compatibilityPatch"]).read_text(encoding="utf-8")
        self.assertIn("self._payout_ints = []", patch)

    def test_six_required_outcomes_are_math_verified_and_stake_compatible(self):
        book = build_stake_sample_book()
        self.assertEqual(len(book.entries), len(SAMPLE_LABELS))
        mapped = []
        for entry in book.entries:
            verify_outcome(entry.outcome, STAKE_CANDIDATE_CONFIG)
            self.assertEqual(entry.outcome.payout_multiplier % 10, 0)
            stake_book = to_stake_book(entry.outcome)
            self.assertEqual(stake_book["events"][0]["type"], "reveal")
            self.assertEqual(stake_book["events"][-1]["amount"], stake_book["payoutMultiplier"])
            mapped.append(stake_book)
        verify_required_cases(mapped)
        self.assertEqual(mapped[-1]["payoutMultiplier"], STAKE_CANDIDATE_CONFIG.max_win)

    def test_event_mapping_is_deterministic_and_contiguous(self):
        outcome = build_stake_sample_book().entries[3].outcome
        first = map_outcome_events(outcome)
        second = map_outcome_events(outcome)
        self.assertEqual(first, second)
        self.assertEqual([event["index"] for event in first], list(range(len(first))))
        self.assertIn("updateGlobalMult", [event["type"] for event in first])

    def test_publish_sources_match_lookup_and_reject_tampering(self):
        book = build_stake_sample_book()
        with tempfile.TemporaryDirectory() as raw:
            destination = Path(raw)
            evidence = write_publish_files(book, destination, compress=False)
            book_source = (destination / "books_base.jsonl").read_bytes()
            lookup_source = (destination / "lookUpTable_base_0.csv").read_bytes()
            independently_verified = verify_publish_sources(book_source, lookup_source)
            self.assertEqual(evidence, independently_verified)
            self.assertEqual(evidence.entries, 6)

            rows = lookup_source.decode("utf-8").splitlines()
            fields = rows[1].split(",")
            fields[-1] = str(int(fields[-1]) + 10)
            rows[1] = ",".join(fields)
            with self.assertRaisesRegex(StakeFormatError, "payout mismatch"):
                verify_publish_sources(book_source, ("\n".join(rows) + "\n").encode("utf-8"))


if __name__ == "__main__":
    unittest.main()
