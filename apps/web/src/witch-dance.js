import { deriveWitchState, WITCH_STATES } from "./domain.js";

/** Each character performance is a full, independently looping dance clip. */
export const WITCH_LOOP_MS = Object.freeze({
  [WITCH_STATES.IDLE]: 4200,
  [WITCH_STATES.SMALL_WIN]: 3600,
  [WITCH_STATES.MEDIUM_WIN]: 4200,
  [WITCH_STATES.BIG_WIN]: 4800,
  [WITCH_STATES.BONUS]: 4800
});

const PRIORITY = Object.freeze({
  [WITCH_STATES.IDLE]: 0,
  [WITCH_STATES.SMALL_WIN]: 1,
  [WITCH_STATES.MEDIUM_WIN]: 2,
  [WITCH_STATES.BIG_WIN]: 3,
  [WITCH_STATES.BONUS]: 4
});

/**
 * A presentation-only loop sequencer. Domain events queue the strongest cue;
 * the displayed clip changes ONLY at a shared neutral-pose seam.
 * Loop timing is independent of round settlement and payout calculation.
 * The scheduler can later be replaced by decoded video seam markers.
 */
export class WitchDanceController {
  constructor({
    loopMs = WITCH_LOOP_MS,
    schedule = (callback, ms) => setTimeout(callback, ms),
    cancel = (id) => clearTimeout(id),
    onLoop = () => {},
    onAccent = () => {}
  } = {}) {
    for (const state of Object.values(WITCH_STATES)) {
      if (!Number.isFinite(loopMs[state]) || loopMs[state] <= 0) {
        throw new Error("Invalid dance loop length for " + state);
      }
    }
    this.loopMs = loopMs;
    this.schedule = schedule;
    this.cancel = cancel;
    this.onLoop = onLoop;
    this.onAccent = onAccent;
    this.active = WITCH_STATES.IDLE;
    this.pending = null;
    this.roundOpen = false;
    this.started = false;
    this.timer = null;
  }

  start() {
    if (this.started) return;
    this.started = true;
    this.onLoop({ from: null, to: this.active, durationMs: this.loopMs[this.active] });
    this.#scheduleSeam();
  }

  beginRound() {
    this.roundOpen = true;
    // Do not interrupt the currently playing loop when a new bet starts.
  }

  onEvent(event, outcome) {
    if (event?.type === "multiplier") {
      this.onAccent({ type: "POTION", increment: event.increment, multiplier: event.to });
    }
    const target = deriveWitchState(event, outcome);
    if (target && target !== WITCH_STATES.IDLE) this.request(target);
  }

  request(target) {
    if (!(target in PRIORITY)) throw new Error("Unknown witch dance state: " + target);
    // Multiple rapid wins in the same spin are collapsed to the strongest
    // requested performance. Never downgrade during an active win sequence.
    if (PRIORITY[target] > PRIORITY[this.active] &&
        (!this.pending || PRIORITY[target] > PRIORITY[this.pending])) {
      this.pending = target;
    }
  }

  endRound({ failed = false } = {}) {
    this.roundOpen = false;
    if (failed) this.pending = null;
    // A queued winning loop is still allowed one FULL cycle after settlement.
    // Settling a bet does not wait for character media to finish.
  }

  destroy() {
    if (this.timer !== null) this.cancel(this.timer);
    this.timer = null;
    this.started = false;
    this.pending = null;
  }

  #scheduleSeam() {
    const durationMs = this.loopMs[this.active];
    this.timer = this.schedule(() => {
      this.timer = null;
      if (!this.started) return;
      const previous = this.active;
      const next = this.pending ?? (this.roundOpen ? previous : WITCH_STATES.IDLE);
      this.pending = null;
      if (next !== previous) {
        this.active = next;
        this.onLoop({ from: previous, to: next, durationMs: this.loopMs[next] });
      }
      this.#scheduleSeam();
    }, durationMs);
  }
}
