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

Production books, lookup tables and compressed outputs remain generated
artifacts. Store them outside Git and commit only the configuration, generator,
toolchain SHA, manifests and independent verification evidence.
