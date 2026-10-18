import test from "node:test";
import assert from "node:assert/strict";

import { applyEvent, createInitialState, deriveWitchState, formatMoney, playOutcome, validateOutcome } from "../src/domain.js";
import { MockRgs } from "../src/mock-rgs.js";

test("mock RGS returns a frozen precomputed outcome with a valid 6x5 board", async () => {
  const rgs = new MockRgs();
  const outcome = await rgs.play({ betMicro: 1_000_000 });

  assert.equal(validateOutcome(outcome), outcome);
  assert.equal(outcome.events[0].board.length, 6);
  assert.ok(outcome.events[0].board.every((column) => column.length === 5));
  assert.equal(Object.isFrozen(outcome), true);
  assert.equal(Object.isFrozen(outcome.events), true);
  assert.equal(Object.isFrozen(outcome.events[0].board[0]), true);
  assert.throws(() => outcome.events.push({}), TypeError);
});

test("normal, fast, and replay playback converge on the same domain snapshot", async () => {
  const rgs = new MockRgs();
  const outcome = await rgs.play({ betMicro: 2_000_000 });
  const immediate = () => Promise.resolve();
  const normalEvents = [];
  const fastEvents = [];
  const replayEvents = [];

  const normal = await playOutcome(outcome, {
    speed: "normal",
    delay: immediate,
    onEvent: (event) => normalEvents.push(event.type)
  });
  const fast = await playOutcome(outcome, {
    speed: "fast",
    delay: immediate,
    onEvent: (event) => fastEvents.push(event.type)
  });
  const replay = await playOutcome(await rgs.getReplay(outcome.id), {
    speed: "normal",
    delay: immediate,
    onEvent: (event) => replayEvents.push(event.type)
  });

  assert.deepEqual(fast, normal);
  assert.deepEqual(replay, normal);
  assert.deepEqual(fastEvents, normalEvents);
  assert.deepEqual(replayEvents, normalEvents);
  assert.equal(normal.winMicro, 16_000_000);
  assert.equal(normal.multiplier, 3);
  assert.equal(normal.settled, true);
});

test("witch cues are presentation-only and deterministic for spin, fast play, and replay", async () => {
  const rgs = new MockRgs();
  const outcome = await rgs.play({ betMicro: 1_000_000 });
  const collect = async (candidate, speed) => {
    const cues = [];
    await playOutcome(candidate, {
      speed,
      delay: () => Promise.resolve(),
      onEvent: (event) => cues.push(deriveWitchState(event, candidate))
    });
    return cues;
  };

  const normal = await collect(outcome, "normal");
  const fast = await collect(outcome, "fast");
  const replay = await collect(await rgs.getReplay(outcome.id), "normal");

  assert.deepEqual(normal, [null, "SMALL_WIN", null, null, "MEDIUM_WIN", null, "MEDIUM_WIN"]);
  assert.equal(deriveWitchState({ type: "multiplier", from: 1, to: 3 }, outcome), null);
  assert.equal(deriveWitchState({ type: "cascade" }, outcome), null);
  assert.deepEqual(fast, normal);
  assert.deepEqual(replay, normal);
  assert.equal(outcome.payoutMicro, 8_000_000);
  assert.equal(deriveWitchState({ type: "win", amount: 10_000_000 }, outcome), "BIG_WIN");
  assert.equal(deriveWitchState({ type: "bonusStart" }, outcome), "BONUS");
});

test("replay performs no new play or settlement and cannot change the wallet", async () => {
  const rgs = new MockRgs();
  const outcome = await rgs.play({ betMicro: 1_000_000 });
  await rgs.settle(outcome.id);
  const beforeReplay = rgs.getSession().balanceMicro;
  const replay = await rgs.getReplay(outcome.id);

  await playOutcome(replay, { delay: () => Promise.resolve() });

  assert.equal(rgs.getSession().balanceMicro, beforeReplay);
  assert.deepEqual(rgs.metrics, { playCalls: 1, replayCalls: 1, settleCalls: 1 });
  assert.equal(replay, outcome);
});

test("mock RGS cycles fixtures deterministically and scales authoritative amounts", async () => {
  const rgs = new MockRgs({ balanceMicro: 200_000_000 });
  const fixtureIds = [];
  const payouts = [];

  for (let index = 0; index < 4; index += 1) {
    const outcome = await rgs.play({ betMicro: 500_000 });
    fixtureIds.push(outcome.fixtureId);
    payouts.push(outcome.payoutMicro);
    await rgs.settle(outcome.id);
  }

  assert.deepEqual(fixtureIds, ["potion-chain", "quiet-loss", "double-potion", "potion-chain"]);
  assert.deepEqual(payouts, [4_000_000, 0, 10_000_000, 4_000_000]);
});

test("outcome validation fails closed on malformed board and multiplier continuity", () => {
  const base = {
    id: "bad",
    fixtureId: "bad",
    betMicro: 1_000_000,
    payoutMicro: 0,
    events: [
      { index: 0, type: "boardReveal", board: [["a"]] },
      { index: 1, type: "finalWin", amount: 0 }
    ]
  };
  assert.throws(() => validateOutcome(base), /board must have 6 columns/);

  const board = Array.from({ length: 6 }, () => Array(5).fill("a"));
  const brokenMultiplier = {
    ...base,
    events: [
      { index: 0, type: "boardReveal", board },
      { index: 1, type: "multiplier", from: 2, increment: 1, to: 3 },
      { index: 2, type: "finalWin", amount: 0 }
    ]
  };
  assert.throws(() => validateOutcome(brokenMultiplier), /does not continue from 1/);
});

test("mock RGS validates a fixture before mutating wallet or sequence state", async () => {
  const malformedTemplate = {
    fixtureId: "malformed",
    label: "Malformed",
    unitBetMicro: 1_000_000,
    events: [
      { index: 0, type: "boardReveal", board: [["a"]] },
      { index: 1, type: "finalWin", amount: 0 }
    ]
  };
  const rgs = new MockRgs({ templates: [malformedTemplate] });
  const before = rgs.getSession().balanceMicro;

  await assert.rejects(rgs.play({ betMicro: 1_000_000 }), /board must have 6 columns/);
  assert.equal(rgs.getSession().balanceMicro, before);
  assert.equal(rgs.pending, null);
  assert.deepEqual(rgs.metrics, { playCalls: 0, replayCalls: 0, settleCalls: 0 });
});

test("domain reducer keeps event input immutable and formats six-decimal API units", () => {
  const original = createInitialState();
  const next = applyEvent(original, {
    index: 0,
    type: "boardReveal",
    board: Array.from({ length: 6 }, () => Array(5).fill("a"))
  });

  assert.equal(original.board, null);
  assert.equal(next.board.length, 6);
  assert.equal(formatMoney(1_500_000, "USD", "en-US"), "$1.50");
});
