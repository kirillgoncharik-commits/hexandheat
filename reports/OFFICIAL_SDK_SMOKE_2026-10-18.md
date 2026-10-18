# Official SDK smoke evidence — 2026-10-18

## Pins tested

- `engineio/math-sdk`: `a6dccd86de740cc5d318079483cb6204cc5c19bc`
- `engineio/web-sdk`: `1843d60cedb94b390e641b563f32ad64353bec5e`
- Python: 3.12.14
- Node: 24.9.0
- Web SDK package manager: pnpm 10.5.0 through Corepack

## Math SDK

Focused official test:

```text
python -m pytest -q tests/win_calculations/test_scatterpay.py
3 passed in 0.37s
```

A clean, reduced `0_0_scatter` run (100 outcomes per mode, one worker,
compression on, optimizer/analysis off) generated books, lookup tables,
configuration and verification sidecars. The official format verifier accepted
the base book hash but then failed on the bonus mode with:

```text
AssertionError: Payout hash mismatch for bonus! Book payouts != LUT payouts.
```

This result repeated after moving the first output directory aside and running
from a clean library directory. The deliberately tiny unoptimized sample also
reported non-production RTP/volatility warnings, which are expected and are not
used as product evidence. The current official sample is therefore **partially
reproduced but not a clean end-to-end pass** at this SHA. Do not copy or suppress
the verifier failure; isolate it before adapting Hex & Heat into the SDK.

## Web SDK

The official `apps/scatter` production build completed successfully with the
repository's pinned pnpm 10.5.0:

```text
pnpm run build --filter=scatter
Tasks: 2 successful, 2 total
adapter-static: Wrote site to "build"
```

Observed non-fatal upstream warnings include absent public environment exports,
sample asset URLs that remain unresolved at build time and a minified client
chunk above 500 kB. These prevent treating the sample output as a ready product,
but they do not block use of its event and component architecture as a donor.

## Configuration mismatch

At the tested pins, Math SDK `games/0_0_scatter/game_config.py` declares RTP
`0.967`, while Web SDK `apps/scatter/src/game/config.ts` declares `0.97` at both
game and mode levels. Math/config generation must become authoritative; the
frontend must not keep a hand-maintained rounded duplicate.
