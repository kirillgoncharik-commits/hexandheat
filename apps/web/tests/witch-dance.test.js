import test from "node:test";
import assert from "node:assert/strict";

import { WitchDanceController, WITCH_IDLE_ANCHOR_MS, WITCH_LOOP_MS } from "../src/witch-dance.js";

function fakeScheduler() {
  let now = 0;
  let id = 0;
  const timers = new Map();
  return {
    schedule(fn, ms) {
      const nextId = ++id;
      timers.set(nextId, { due: now + ms, fn });
      return nextId;
    },
    cancel(timerId) { timers.delete(timerId); },
    advance(ms) {
      const end = now + ms;
      while (true) {
        let earliest = null;
        for (const [timerId, timer] of timers) {
          if (timer.due <= end && (!earliest || timer.due < earliest[1].due)) {
            earliest = [timerId, timer];
          }
        }
        if (!earliest) break;
        now = earliest[1].due;
        timers.delete(earliest[0]);
        earliest[1].fn();
      }
      now = end;
    },
    get now() { return now; },
    get pending() { return timers.size; }
  };
}

function harness() {
  const clock = fakeScheduler();
  const clips = [];
  const accents = [];
  const controller = new WitchDanceController({
    schedule: clock.schedule,
    cancel: clock.cancel,
    onLoop: (clip) => clips.push({ at: clock.now, ...clip }),
    onAccent: (cue) => accents.push(cue)
  });
  controller.start();
  return { clock, clips, accents, controller };
}

const bet = Object.freeze({ betMicro: 1_000_000 });

test("all reactions wait for the complete 4000ms cycle before changing state", () => {
  const { controller, clock, clips, accents } = harness();
  controller.beginRound();
  controller.onEvent({ type: "win", amount: 2_000_000 }, bet);
  controller.onEvent({ type: "multiplier", increment: 2, to: 3 }, bet);
  controller.onEvent({ type: "cascade" }, bet);
  controller.onEvent({ type: "finalWin", amount: 8_000_000 }, bet);
  controller.endRound();

  assert.equal(controller.active, "IDLE");
  assert.equal(controller.pending, "MEDIUM_WIN");
  assert.equal(accents.length, 1);
  clock.advance(WITCH_IDLE_ANCHOR_MS - 1);
  assert.deepEqual(clips.map((clip) => clip.to), ["IDLE"]);
  clock.advance(1);
  assert.deepEqual(clips.map((clip) => clip.to), ["IDLE", "MEDIUM_WIN"]);
  clock.advance(WITCH_LOOP_MS.MEDIUM_WIN - 1);
  assert.equal(controller.active, "MEDIUM_WIN");
  clock.advance(1);
  assert.deepEqual(clips.map((clip) => clip.to), ["IDLE", "MEDIUM_WIN", "IDLE"]);
});

test("rapid win escalation selects the strongest next loop, without false BONUS", () => {
  const { controller, clock, clips, accents } = harness();
  controller.beginRound();
  controller.onEvent({ type: "win", amount: 2_000_000 }, bet);
  controller.onEvent({ type: "win", amount: 12_000_000 }, bet);
  controller.onEvent({ type: "win", amount: 5_000_000 }, bet);
  controller.onEvent({ type: "multiplier", increment: 5, to: 6 }, bet);
  controller.endRound();

  clock.advance(WITCH_IDLE_ANCHOR_MS);
  assert.deepEqual(clips.map((clip) => clip.to), ["IDLE", "BIG_WIN"]);
  assert.deepEqual(accents.map((cue) => cue.type), ["POTION"]);
  clock.advance(WITCH_LOOP_MS.BIG_WIN);
  assert.deepEqual(clips.map((clip) => clip.to), ["IDLE", "BIG_WIN", "IDLE"]);
});

test("long cascade chain keeps the active dance looping until round completion", () => {
  const { controller, clock, clips } = harness();
  controller.beginRound();
  controller.onEvent({ type: "win", amount: 6_000_000 }, bet);
  clock.advance(WITCH_IDLE_ANCHOR_MS);
  assert.equal(controller.active, "MEDIUM_WIN");

  controller.onEvent({ type: "cascade" }, bet);
  clock.advance(WITCH_LOOP_MS.MEDIUM_WIN * 2);
  assert.equal(controller.active, "MEDIUM_WIN");
  assert.equal(clips.length, 2); // Same clip loops without resetting its CSS animation.

  controller.endRound();
  clock.advance(WITCH_LOOP_MS.MEDIUM_WIN);
  assert.equal(controller.active, "IDLE");
});

test("BIG win waits for the current SMALL loop seam instead of interrupting it", () => {
  const { controller, clock, clips } = harness();
  controller.beginRound();
  controller.onEvent({ type: "win", amount: 1_000_000 }, bet);
  clock.advance(WITCH_IDLE_ANCHOR_MS);
  assert.equal(controller.active, "SMALL_WIN");
  controller.onEvent({ type: "win", amount: 12_000_000 }, bet);
  controller.endRound();
  clock.advance(WITCH_LOOP_MS.SMALL_WIN - 1);
  assert.equal(controller.active, "SMALL_WIN");
  clock.advance(1);
  assert.deepEqual(clips.map((clip) => clip.to), ["IDLE", "SMALL_WIN", "BIG_WIN"]);
  clock.advance(WITCH_LOOP_MS.BIG_WIN);
  assert.equal(controller.active, "IDLE");
});

test("BONUS is reserved for bonusStart; errors clear unplayed requests", () => {
  const { controller, clock, clips } = harness();
  controller.beginRound();
  controller.onEvent({ type: "bonusStart" }, bet);
  controller.endRound({ failed: true });
  clock.advance(WITCH_IDLE_ANCHOR_MS);
  assert.deepEqual(clips.map((clip) => clip.to), ["IDLE"]);

  controller.beginRound();
  controller.onEvent({ type: "bonusStart" }, bet);
  controller.endRound();
  clock.advance(WITCH_IDLE_ANCHOR_MS);
  assert.equal(controller.active, "BONUS");
  controller.destroy();
  assert.equal(clock.pending, 0);
  clock.advance(20000);
  assert.equal(controller.active, "BONUS");
});

test("fast/replay event bursts cannot alter frozen payouts or skip the chosen dance tier", () => {
  const { controller, clock, clips } = harness();
  const outcome = Object.freeze({ betMicro: 1_000_000, payoutMicro: 8_000_000 });
  controller.beginRound();
  for (const event of [
    { type: "boardReveal" },
    { type: "win", amount: 2_000_000 },
    { type: "multiplier", increment: 2, to: 3 },
    { type: "cascade" },
    { type: "win", amount: 6_000_000 },
    { type: "finalWin", amount: 8_000_000 }
  ]) {
    controller.onEvent(event, outcome);
  }
  controller.endRound();
  clock.advance(WITCH_LOOP_MS.IDLE);
  assert.deepEqual(clips.map((clip) => clip.to), ["IDLE", "MEDIUM_WIN"]);
  assert.equal(outcome.payoutMicro, 8_000_000);
});
