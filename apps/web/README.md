# Primitive browser prototype

This is a dependency-free local presentation prototype for Hex & Heat. It uses colored squares only: there is no production witch art, audio, Stake SDK, authenticated session, or external service.

The mock RGS returns an immutable, precomputed event stream. The browser validates and presents that stream; it does not calculate the payout. Normal play, fast play, and replay consume the same ordered events and converge on the same final state.

## Launch

Requires Node.js 20 or newer. No package installation is needed.

```bash
cd apps/web
npm start
```

Open <http://127.0.0.1:4173>. To choose another port:

```bash
HEX_HEAT_PORT=8080 npm start
```

Controls:

- **Spin** or **Space** requests the next deterministic fixture from the local mock RGS.
- **Fast play** shortens presentation delays but does not skip or reorder domain events.
- **Replay last** replays the exact frozen outcome without a new play request or wallet mutation.
- **Bet amount** exercises the mock RGS bet-level contract; returned event amounts are already resolved integer micro-units (`1,000,000 = 1.00`).

The mock cycles through `potion-chain`, `quiet-loss`, and `double-potion`, then repeats.

## Test

```bash
cd apps/web
npm test
```

The tests cover 6×5 validation, malformed outcomes, multiplier continuity, fixture determinism, amount scaling, outcome immutability, wallet settlement, replay isolation, and final-state convergence across normal/fast/replay playback.

## Module map

- `src/fixtures.js` — deterministic reference outcome templates.
- `src/mock-rgs.js` — local play, settlement, balance, bet-level, and replay boundary.
- `src/domain.js` — validation, immutable reducer, money formatting, and timeline playback.
- `src/app.js` — DOM renderer and controls.
- `src/styles.css` — responsive desktop, portrait, small-screen, safe-area, and reduced-motion presentation.

This is a functional prototype, not a submission build. Replacing `MockRgs` with the reviewed Stake client should preserve the validated outcome contract and keep presentation code payout-blind.
