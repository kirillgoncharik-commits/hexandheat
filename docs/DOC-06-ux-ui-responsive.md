---
id: DOC-06
version: 0.9.0
date: 2026-10-18
status: PROPOSED
dependencies: [DOC-01, DOC-02, DOC-04]
related: [DOC-07, DOC-08, DOC-12]
confidence: MEDIUM
---

# UX/UI & Responsive Design

## Layout strategy

Desktop ≥900 px: 58/42 split, board left and full-height witch/cauldron right; controls along bottom. Portrait <600 px: board top 62–68% of safe viewport, witch bust/cauldron as a side or lower overlay that never covers symbols or amounts. 600–899 px/tablet: adaptive split based on aspect ratio. Popout: board and essential controls only; witch becomes compact portrait/cauldron indicator.

```text
Desktop                           Portrait
┌──────────────┬──────────┐       ┌──────────────┐
│ title/status │ witch    │       │ title/status │
│  6×5 BOARD   │ +        │       │  6×5 BOARD   │
│ win overlay  │ cauldron │       │              │
├──────────────┴──────────┤       ├──────┬───────┤
│ bet  win  SPIN  sound   │       │witch │cauld. │
└─────────────────────────┘       ├──────┴───────┤
                                  │bet SPIN info │
                                  └──────────────┘
```

## Hierarchy and constraints

1. Exact win/bet/balance and active board.
2. Winning positions and cauldron multiplier.
3. Spin/input state and errors.
4. Witch performance and FX.

CSS safe-area insets are mandatory. Touch targets ≥44 CSS px; body copy ≥14 px, amounts use tabular numerals and sufficient contrast. Critical meaning is never color-only. Layout uses logical pixels and renderer resolution capped by memory policy.

## Controls

Spin/Space is disabled while a round is unresolved. Bet control exposes all RGS levels. Settings: master mute, music, SFX, reduced motion, fast play; autoplay only if retained after compliance review and requires explicit confirmation. Info contains rules, paytable, RTP, max win, mode cost, modifier values, disclaimer and UI guide.

## Feedback

Winning positions receive a 400–700 ms readable highlight in normal mode and a shorter but visible highlight in fast mode. Total win increments only to values backed by events. Multiplier change shows before the cascade award that uses it. Loss settles calmly without false anticipation. `prefers-reduced-motion` removes shake, parallax and large dance motion while preserving static state cues.

## Performance budgets (pilot targets, validate)

- Shell + first board critical transfer ≤2.5 MiB compressed; deferred media excluded.
- Initial idle character ≤3 MiB per selected codec; individual reaction clip ≤4 MiB; total simultaneously resident decoded frames limited by capability tier.
- 60 FPS target; p95 frame ≤33 ms floor on selected low-tier device.
- No continuous layout shift after board becomes interactive.
- First playable target ≤5 s on representative 4G; character/audio may enhance after gameplay shell.

These are internal starting budgets, not published Stake limits.

## Acceptance matrix

Test 360×640, 390×844, 768×1024, 1366×768, 1920×1080 and Stake small popout; portrait/landscape rotation; 200% browser zoom; long currency strings; missing media; replay controls; social wording; keyboard-only navigation; mute persisted; reduced motion; safe areas. At every size, all 30 symbols, current multiplier, bet and final win remain visible/obtainable without overlap.
