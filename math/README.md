# Functional-prototype math

`hexandheat_math` is a dependency-free, deterministic proof of the Hex & Heat
round contract. It implements a 6×5 pay-anywhere board, simultaneous wins from
eight matching symbols, cascades, potion-driven round multipliers, immutable
precomputed books, canonical hashes, replay and an independently implemented
verifier.

The bundled `CANDIDATE_UNBALANCED_V0` inputs are deliberately not production
math and do not claim a target RTP. Their purpose is to prove mechanics and
interfaces before the official Math SDK game package is adapted and balanced.

Run from the repository root:

```bash
python3 -m unittest discover -s tests/math -p 'test_*.py' -v
PYTHONPATH=math python3 -m hexandheat_math.simulate --rounds 10000 --seed 20261018
```

Milestone 02 adds `STAKE_FORMAT_CANDIDATE_UNBALANCED_V0`, a mechanically
0.1x-aligned candidate required by the official verifier, plus an adapter to the
pinned `apps/scatter` BookEvents. Regenerate the six-case integration package:

```bash
python3 tools/generate_stake_sample.py
```

The small files under `math/publish_files/` are committed review evidence, not
production books. Production-scale books remain outside Git and still require
balancing, independent sign-off and approved storage.
