# Integrated browser technical prototype

This dependency-free shell now consumes official Stake scatter-style BookEvents through a local RGS implementing the official request lifecycle. It still uses colored squares and contains no production witch art, video or music.

The default local RGS selects the committed Math SDK-format book, returns immutable precomputed events, and settles through `end-round`. The browser validates and maps those events; it does not calculate payout. Mock RGS is available only through `?rgs=mock` for fallback tests.

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

- **Spin** or **Space** requests the next deterministic official-format book from the local RGS.
- **Fast play** shortens presentation delays but does not skip or reorder domain events.
- **Replay last** replays the exact frozen outcome without a new play request or wallet mutation.
- **Mute** controls temporary synchronized oscillator stems; audio failure never blocks settlement.
- **Bet amount** exercises six-decimal API money (`1,000,000 = 1.00`).

The Witch Stage consumes the same authoritative stream. Win amounts queue `SMALL_WIN`/`MEDIUM_WIN`/`BIG_WIN`; potion multipliers trigger only an independent FX accent; `BONUS` is reserved for a real bonus-start event. IDLE can hand off at four anchor-A points per loop, while a win loop completes fully. Add `?media=video` to record two abstract local clips at runtime and exercise native-video preload/crossfade/failure fallback. Reduced Motion keeps the CSS fallback.

The official-format sample cycles through loss, normal win, cascade, multiplier, long-chain and max-win cases.

## Test

```bash
cd apps/web
npm test
```

The tests cover official event mapping/RGS calls, 6×5 validation, payout disagreement, settlement/replay isolation, witch latency and priority, video lifecycle/failure, audio transitions/mute/resume and normal/fast/replay convergence.

## Module map

- `src/fixtures.js` — deterministic reference outcome templates.
- `src/mock-rgs.js` — local play, settlement, balance, bet-level, and replay boundary.
- `src/stake-rgs.js` / `src/stake-events.js` — official request and BookEvent adaptation.
- `src/video-loop.js` / `src/synthetic-video.js` — bounded native-video POC and generator.
- `src/adaptive-music.js` — temporary beat-aligned Web Audio stems.
- `src/domain.js` — validation, immutable reducer, money formatting, and timeline playback.
- `src/app.js` — DOM renderer and controls.
- `src/styles.css` — responsive desktop, portrait, small-screen, safe-area, and reduced-motion presentation.

This is an integrated technical prototype, not a submission build or full copy of the official Svelte/Pixi shell. The pinned official request/event vocabulary is adapted at the boundary so the working UX remains payout-blind.
