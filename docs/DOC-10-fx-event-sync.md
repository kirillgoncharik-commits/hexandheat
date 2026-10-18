---
id: DOC-10
version: 0.9.0
date: 2026-10-18
status: PROPOSED
dependencies: [DOC-02, DOC-05, DOC-08, DOC-09]
related: [DOC-12]
confidence: MEDIUM_HIGH
---

# Visual FX & Event Synchronization

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

## Scheduling and interruption

Priorities: correctness UI > board transition > multiplier > character > particles > ambience. `required` cues have bounded deadlines and fallback end states. `decorative` cues can be cancelled on fast mode, visibility loss, memory pressure or a higher-priority state. A cancellation restores a known baseline (opacity, scale, gain), never leaves half-applied state.

Normal duration tokens: reveal 500 ms, win-read 700 ms, collapse/refill 450 ms, multiplier 500 ms; fast tokens are approximately 35–50% but must pass legibility tests. These are proposals, not math timing.

## Determinism

Presentation randomness uses `hash(bookId,eventIndex,assetVersion)` as a seed. Same mode and assets select the same SFX variant/particle arrangement; reduced-motion/fast policies may omit cues while preserving event order and final state. Replay does not need frame-identical output across hardware, but state and selected deterministic variants must match.

## Recovery

On tab hide, pause decorative clocks and remember current domain boundary. On resume, either continue within a safe cue or snap to that event’s final presentation state. On media failure, record asset ID/error, show fallback, resolve barrier. On unknown event/schema failure, stop before settlement UI, show recoverable error and preserve book for diagnosis.

## Acceptance

Fixture tests assert cue ordering and final snapshots for loss, multi-win, potion, long cascade, max win and replay. Chaos tests inject slow/failed video, audio suspension and visibility changes. No test may reach a different payout/multiplier/board under normal, fast, mute or reduced-motion policy.
