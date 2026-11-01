---
id: DOC-10
version: 1.1.0-rc1
date: 2026-10-18
status: OFFICIAL_EVENT_MAPPING_IN_USE
dependencies: [DOC-02, DOC-05, DOC-08, DOC-09]
related: [DOC-12]
confidence: MEDIUM_HIGH
---

# Visual FX & Event Synchronization

## M04.1 implementation update — 2026-11-01

The [M04 synchronization contract](m04/SYNCHRONIZATION_DESIGN_RU.md) and [implementation report](../reports/MILESTONE-04-REPORT.md) supersede the historical video, variable-duration and independent-timer proposals below for the current raster scene. `SceneTransport`, `CueDirector`, `BoardPlayer`, `ScenePresentation` and `ModalManager` are implemented on the M03 stack for review. Body and raster phase share the same transport, all body states use full 4000ms cycles, and previous-round pending reactions are discarded. Domain playback now awaits actual presentation completion. Legacy timer/video modules remain only for historical isolated POCs and compatibility tests; they are not the main scene runtime. Device timing and human seam/UX acceptance remain pending.

## Milestone 02 mapping

The pinned official scatter vocabulary is translated once at the RGS boundary: `reveal → boardReveal`, `winInfo → win`, `updateGlobalMult → multiplier`, `tumbleBoard → cascade`, and `finalWin → finalWin`; bookkeeping events are consumed without payout arithmetic. The mapper regenerates contiguous presentation indices and rejects unknown symbols, malformed boards, multiplier discontinuity and any RGS/book final-payout disagreement.

The same immutable stream drives normal, Fast Play and Replay. Witch requests and music states observe events after domain reduction. Their promises are not part of the settlement barrier; failed video/audio leaves the board and wallet path intact. Replay calls only the official replay endpoint and repeats the same event stream with no new wager.

## One timeline model

```text
RGS Book → validate → DomainEvent[n] → map to CuePlan → run required cues
                                            ↘ run/cancel decorative cues
                       barrier resolves → DomainEvent[n+1] → ... → final state
```

The timeline clock owns presentation order. Board, witch, FX and audio do not call each other directly; they consume cues and return completion/cancellation. All domain events remain available for debug/replay, but production logs never expose sensitive session data.

## Event-to-cue table

| Event | Required | Decorative | Barrier |
|---|---|---|---|
| `boardReveal` | symbols visible | mist/idle | board |
| `win` | positions + exact amount | sparks, witch tier, sting | highlight/counter |
| `multiplier` | cauldron from→to | liquid burst, audio layer | number readable |
| `cascade` | remove/fall/refill | trails/shake | stable next board |
| `bonusStart` | mode/cost/counter | BONUS clip/music | intro deadline |
| `finalWin` | exact final amount | tier celebration | final counter |

## Current functional placeholder — stitched loops

The prototype now uses a presentation-only `WitchDanceController` in `apps/web/src/witch-dance.js`. All states are **multi-second continuous dance loops** (IDLE 4.2s / SMALL_WIN 3.6s / MEDIUM_WIN 4.2s / BIG_WIN 4.8s / BONUS 4.8s, provisional).

- `win` and positive `finalWin` events request an intensity tier using prototype thresholds <4× / 4–<10× / ≥10× bet.
- Requests during a single round are coalesced to the strongest pending tier; no intermediate frame flips.
- `boardReveal` and `cascade` do not change character state.
- A `multiplier` event triggers a transient potion aura, **not BONUS**. A real `bonusStart` event is reserved for BONUS and is not present in the pilot RGS schema.
- The current loop may exit **only at the neutral anchor seam**, where two CSS figure layers overlap with a 180ms opacity crossfade. Every non-idle loop plays through at least once, even when the bet has already settled.
- The video implementation will honor the same state contract using media-confirmed seams and predecoded clips; the CSS version is only a prototype of the controller and transition composition.
- Playback continues independently after the RGS round settles. Spin, Fast Play and Replay use the same authoritative outcome events and never change payout or balance from character callbacks.
- `endRound({failed:true})` clears unplayed celebrations but does not cut an active loop mid-cycle.

The adjacent Game Events panel remains development-only: `data-debug-mode="false"` hides it and expands Witch Stage. Mobile keeps the game board, Witch Stage and controls in separate flow regions.

## Scheduling and interruption

Priorities: correctness UI > board transition > multiplier > character > particles > ambience. `required` cues have bounded deadlines and fallback end states. `decorative` cues can be cancelled on fast mode, visibility loss, memory pressure or a higher-priority state. A cancellation restores a known baseline (opacity, scale, gain), never leaves half-applied state.

Normal duration tokens: reveal 500 ms, win-read 700 ms, collapse/refill 450 ms, multiplier 500 ms; fast tokens are approximately 35–50% but must pass legibility tests. These are proposals, not math timing.

## Determinism

Presentation randomness uses `hash(bookId,eventIndex,assetVersion)` as a seed. Same mode and assets select the same SFX variant/particle arrangement; reduced-motion/fast policies may omit cues while preserving event order and final state. Replay does not need frame-identical output across hardware, but state and selected deterministic variants must match.

## Recovery

On tab hide, pause decorative clocks and remember current domain boundary. On resume, either continue within a safe cue or snap to that event’s final presentation state. On media failure, record asset ID/error, show fallback, resolve barrier. On unknown event/schema failure, stop before settlement UI, show recoverable error and preserve book for diagnosis.

## Acceptance

Fixture tests assert cue ordering and final snapshots for loss, multi-win, potion, long cascade, max win and replay. Chaos tests inject slow/failed video, audio suspension and visibility changes. No test may reach a different payout/multiplier/board under normal, fast, mute or reduced-motion policy.
