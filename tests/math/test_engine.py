from __future__ import annotations

from dataclasses import FrozenInstanceError, replace
import hashlib
import json
from pathlib import Path
import sys
import unittest


ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "math"))

from hexandheat_math import (  # noqa: E402
    CANDIDATE_CONFIG,
    BookEvent,
    Outcome,
    VerificationError,
    board_from_flat,
    deserialize_outcome,
    exact_replay,
    generate_outcome,
    precompute_book,
    resolve_round,
    verify_outcome,
)
from hexandheat_math.simulate import generate_report  # noqa: E402


REGULAR = CANDIDATE_CONFIG.regular_symbols


def safe_refills():
    while True:
        yield from REGULAR


def one_win_board():
    cells = ["L1"] * 8 + ["P2"]
    cells += ["L2", "L3", "L4", "L5", "H1", "H2", "H3", "H4"] * 2
    cells += ["L2", "L3", "L4", "L5", "H1"]
    return board_from_flat(cells, CANDIDATE_CONFIG)


class FunctionalMathTests(unittest.TestCase):
    def test_candidate_inputs_are_explicitly_unbalanced(self):
        self.assertIn("CANDIDATE_UNBALANCED", CANDIDATE_CONFIG.label)
        self.assertEqual(CANDIDATE_CONFIG.columns, 6)
        self.assertEqual(CANDIDATE_CONFIG.rows, 5)
        self.assertEqual(CANDIDATE_CONFIG.payout_units_per_bet, 100)

    def test_highest_threshold_only_and_simultaneous_groups(self):
        cells = ["L1"] * 10 + ["H4"] * 8
        cells += ["L2", "L3", "L4", "L5", "H1", "H2"] * 2
        outcome = resolve_round(
            CANDIDATE_CONFIG,
            board_from_flat(cells, CANDIDATE_CONFIG),
            safe_refills(),
        )
        win = next(event for event in outcome.events if event.type == "win").payload
        self.assertEqual([group["symbol"] for group in win["groups"]], ["L1", "H4"])
        self.assertEqual([group["threshold"] for group in win["groups"]], [10, 8])
        self.assertEqual(win["baseAmount"], 25 + 100)
        self.assertEqual(len(win["positions"]), 18)
        self.assertEqual(len(win["removedPositions"]), 18)
        verify_outcome(outcome, CANDIDATE_CONFIG)

    def test_potion_applies_to_next_cascade_then_round_resets(self):
        cells = ["L1"] * 8 + ["L2"] * 7 + ["P2"]
        cells += ["L3", "L4", "L5", "H1", "H2", "H3", "H4"] * 2
        refills = iter(
            ["L2", "L3", "L4", "L5", "H1", "H2", "H3", "H4", "L3"]
            + ["L3", "L4", "L5", "H1", "H2", "H3", "H4", "L3"]
            + list(REGULAR) * 20
        )
        outcome = resolve_round(
            CANDIDATE_CONFIG,
            board_from_flat(cells, CANDIDATE_CONFIG),
            refills,
        )
        wins = [event.payload for event in outcome.events if event.type == "win"]
        self.assertEqual(len(wins), 2)
        self.assertEqual((wins[0]["baseAmount"], wins[0]["multiplier"], wins[0]["amount"]), (15, 1, 15))
        self.assertEqual((wins[1]["baseAmount"], wins[1]["multiplier"], wins[1]["amount"]), (18, 3, 54))
        modifier = next(event.payload for event in outcome.events if event.type == "multiplier")
        self.assertEqual((modifier["from"], modifier["increment"], modifier["to"]), (1, 2, 3))
        self.assertEqual(outcome.payout_multiplier, 69)
        verify_outcome(outcome, CANDIDATE_CONFIG)

        next_round = resolve_round(
            CANDIDATE_CONFIG,
            one_win_board(),
            safe_refills(),
            outcome_id=1,
        )
        next_win = next(event.payload for event in next_round.events if event.type == "win")
        self.assertEqual(next_win["multiplier"], 1)

    def test_non_paying_board_does_not_activate_potion(self):
        cells = list(REGULAR) * 3 + list(REGULAR[:3])
        cells[-1] = "P3"
        outcome = resolve_round(
            CANDIDATE_CONFIG,
            board_from_flat(cells, CANDIDATE_CONFIG),
            (),
        )
        self.assertEqual([event.type for event in outcome.events], ["boardReveal", "finalWin"])
        self.assertEqual(outcome.events[-1].payload["finalMultiplier"], 1)
        verify_outcome(outcome, CANDIDATE_CONFIG)

    def test_max_win_caps_immediately_but_records_potion_state(self):
        capped_config = replace(CANDIDATE_CONFIG, max_win=10)
        outcome = resolve_round(
            capped_config,
            one_win_board(),
            (),
        )
        self.assertEqual(
            [event.type for event in outcome.events],
            ["boardReveal", "win", "multiplier", "finalWin"],
        )
        win = outcome.events[1].payload
        self.assertEqual((win["amount"], win["capped"]), (10, True))
        self.assertEqual(outcome.payout_multiplier, 10)
        self.assertEqual(outcome.events[-1].payload["finalMultiplier"], 3)
        verify_outcome(outcome, capped_config)

    def test_seed_is_deterministic_and_distinct(self):
        first = generate_outcome(CANDIDATE_CONFIG, 123456, 7)
        second = generate_outcome(CANDIDATE_CONFIG, 123456, 7)
        third = generate_outcome(CANDIDATE_CONFIG, 123457, 7)
        self.assertEqual(first.canonical_bytes(), second.canonical_bytes())
        self.assertEqual(first.sha256, second.sha256)
        self.assertNotEqual(first.events[0].payload["board"], third.events[0].payload["board"])
        verify_outcome(first, CANDIDATE_CONFIG)
        verify_outcome(third, CANDIDATE_CONFIG)

    def test_outcome_is_deeply_immutable_and_replay_is_exact(self):
        outcome = resolve_round(
            CANDIDATE_CONFIG,
            one_win_board(),
            safe_refills(),
            outcome_id=11,
            source_seed=22,
        )
        with self.assertRaises(FrozenInstanceError):
            outcome.payout_multiplier = 0  # type: ignore[misc]
        payload_copy = outcome.events[0].payload
        payload_copy["board"][0][0] = "H4"
        self.assertEqual(outcome.events[0].payload["board"][0][0], "L1")

        serialized = outcome.canonical_bytes()
        restored = deserialize_outcome(serialized)
        replay = exact_replay(serialized, expected_sha256=outcome.sha256)
        self.assertEqual(restored, outcome)
        self.assertEqual(replay.outcome.canonical_bytes(), serialized)
        self.assertEqual(replay.final_win, outcome.payout_multiplier)
        self.assertEqual(replay.final_multiplier, 3)
        with self.assertRaisesRegex(ValueError, "hash mismatch"):
            exact_replay(serialized, expected_sha256="0" * 64)

    def test_independent_verifier_rejects_tampered_payout(self):
        outcome = generate_outcome(CANDIDATE_CONFIG, 222, 3)
        events = list(outcome.events)
        final_payload = events[-1].payload
        final_payload["amount"] += 1
        events[-1] = BookEvent.create(events[-1].index, "finalWin", **final_payload)
        tampered = Outcome(
            outcome_id=outcome.outcome_id,
            payout_multiplier=outcome.payout_multiplier + 1,
            events=tuple(events),
            config_id=outcome.config_id,
            source_seed=outcome.source_seed,
        )
        with self.assertRaisesRegex(VerificationError, "final win total mismatch"):
            verify_outcome(tampered, CANDIDATE_CONFIG)

    def test_weighted_book_is_immutable_canonical_and_ticket_selected(self):
        book = precompute_book(CANDIDATE_CONFIG, [10, 20, 30], weights=[2, 3, 1])
        self.assertEqual(book.total_weight, 6)
        self.assertEqual([book.select(ticket).outcome_id for ticket in range(6)], [0, 0, 1, 1, 1, 2])
        self.assertEqual(book.sha256, hashlib.sha256(book.canonical_bytes()).hexdigest())
        lines = tuple(book.json_lines())
        self.assertEqual(len(lines), 3)
        self.assertEqual(
            set(json.loads(lines[0])),
            {"events", "id", "payoutMultiplier"},
        )
        with self.assertRaises(FrozenInstanceError):
            book.version = "changed"  # type: ignore[misc]

    def test_seeded_report_is_reproducible_and_disclaimed(self):
        first = generate_report(rounds=250, root_seed=20261018)
        second = generate_report(rounds=250, root_seed=20261018)
        self.assertEqual(first, second)
        self.assertIn("not a production RTP", first.disclaimer)
        self.assertEqual(first.rounds, 250)
        self.assertAlmostEqual(first.hit_rate + first.zero_win_rate, 1.0)
        body = first.to_dict(include_hash=False)
        expected = hashlib.sha256(
            json.dumps(body, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()
        ).hexdigest()
        self.assertEqual(first.report_sha256, expected)


if __name__ == "__main__":
    unittest.main()
