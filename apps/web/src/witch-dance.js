import { deriveWitchState, WITCH_STATES } from "./domain.js";

/** Each character performance is a full, independently looping dance clip. */
export const WITCH_LOOP_MS = Object.freeze({
  [WITCH_STATES.IDLE]: 4000,
  [WITCH_STATES.SMALL_WIN]: 4000,
  [WITCH_STATES.MEDIUM_WIN]: 4000,
  [WITCH_STATES.BIG_WIN]: 4000,
  [WITCH_STATES.BONUS]: 4000
});

// M03 PO decision: all states last exactly 4 s; switches only at cycle end.
export const WITCH_IDLE_ANCHOR_MS = WITCH_LOOP_MS[WITCH_STATES.IDLE];

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
    idleAnchorMs = WITCH_IDLE_ANCHOR_MS,
    schedule = (callback, ms) => setTimeout(callback, ms),
    cancel = (id) => clearTimeout(id),
    onLoop = () => {},
    onAccent = () => {},
    onRequest = () => {},
    onMissedSeam = () => {},
    transport = null
  } = {}) {
    for (const state of Object.values(WITCH_STATES)) {
      if (!Number.isFinite(loopMs[state]) || loopMs[state] <= 0) {
        throw new Error("Invalid dance loop length for " + state);
      }
    }
    this.loopMs = loopMs;
    if (!Number.isFinite(idleAnchorMs) || idleAnchorMs <= 0 || loopMs[WITCH_STATES.IDLE] % idleAnchorMs !== 0) {
      throw new Error("IDLE anchor interval must divide the IDLE loop");
    }
    this.idleAnchorMs = idleAnchorMs;
    this.schedule = schedule;
    this.cancel = cancel;
    this.onLoop = onLoop;
    this.onAccent = onAccent;
    this.onRequest = onRequest;
    this.onMissedSeam = onMissedSeam;
    this.transport = transport;
    this.roundGeneration = 0;
    this.activeOwner = 0;
    this.peak = 0;
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
    if (this.transport) {
      this.lastCycle = Math.floor(this.transport.now / 4000);
      this.enteredAt = this.transport.now;
      this.unsubscribe = this.transport.subscribe(({ now, cycle, phaseMs }) => {
        if (cycle <= this.lastCycle) return;
        // The first raster pose is the common neutral anchor for the full first
        // second. A late frame can still stitch there, never in a later pose.
        // Retrying within that window avoids a whole extra loop when frame
        // jitter crosses the previous entry's minimum 4000ms only slightly late.
        if (phaseMs >= 1000) {
          if (this.lastMissedCycle !== cycle) this.onMissedSeam({ cycle, lateMs: phaseMs });
          this.lastMissedCycle = cycle; return;
        }
        if (now - this.enteredAt < 4000) return;
        this.lastCycle = cycle;
        const previous = this.active;
        const hadPending = this.pending !== null;
        this.#seam();
        if (this.active !== previous || hadPending) this.enteredAt = now;
      }, 0);
    } else this.#scheduleSeam();
  }

  beginRound() {
    this.roundGeneration++;
    this.pending = null;
    this.peak = 0;
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
    if (PRIORITY[target] > this.peak) {
      this.peak = PRIORITY[target];
      this.pending = target;
      this.onRequest({ target });
    }
  }

  endRound({ failed = false } = {}) {
    this.roundOpen = false;
    if (failed) this.pending = null;
    // A queued winning loop is still allowed one FULL cycle after settlement.
    // Settling a bet does not wait for character media to finish.
  }

  destroy() {
    this.unsubscribe?.();
    if (this.timer !== null) this.cancel(this.timer);
    this.timer = null;
    this.started = false;
    this.pending = null;
  }

  #scheduleSeam() {
    const durationMs = this.active === WITCH_STATES.IDLE
      ? this.idleAnchorMs
      : this.loopMs[this.active];
    this.timer = this.schedule(() => {
      this.timer = null;
      if (!this.started) return;
      this.#seam();
      this.#scheduleSeam();
    }, durationMs);
  }

  #seam() {
    const previous = this.active;
    const next = this.pending ?? (this.roundOpen && this.activeOwner === this.roundGeneration ? previous : WITCH_STATES.IDLE);
    const hadPending = this.pending !== null;
    this.pending = null;
    if (hadPending) this.activeOwner = this.roundGeneration;
    if (next !== previous) {
      this.active = next;
      this.onLoop({ from: previous, to: next, durationMs: this.loopMs[next], at: this.transport?.now, owner: this.activeOwner });
    }
  }
}
