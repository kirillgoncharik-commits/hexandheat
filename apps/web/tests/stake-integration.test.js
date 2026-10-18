import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { playOutcome } from "../src/domain.js";
import { StakeRgs } from "../src/stake-rgs.js";
import { mapStakeRoundToOutcome } from "../src/stake-events.js";

const bookUrl = new URL("../../../math/publish_files/books_base.jsonl", import.meta.url);
const books = readFileSync(bookUrl, "utf8").trim().split("\n").map(JSON.parse);

function roundFromBook(book, overrides = {}) {
  return {
    roundID: overrides.roundID ?? book.id + 1,
    bookID: book.id,
    amount: overrides.amount ?? 1_000_000,
    payout: book.payoutMultiplier * 10_000,
    payoutMultiplier: book.payoutMultiplier / 100,
    payoutMultiplierUnits: book.payoutMultiplier,
    active: overrides.active ?? true,
    mode: "BASE",
    event: "0",
    state: book.events
  };
}

function jsonResponse(value, status = 200) {
  return Promise.resolve({ ok: status >= 200 && status < 300, status, json: async () => value });
}

test("all generated Stake books map to deterministic presentation outcomes", async () => {
  assert.equal(books.length, 6);
  for (const book of books) {
    const first = mapStakeRoundToOutcome(roundFromBook(book), { betMicro: 1_000_000, currency: "USD" });
    const second = mapStakeRoundToOutcome(roundFromBook(book), { betMicro: 1_000_000, currency: "USD" });
    assert.deepEqual(first, second);
    const finalState = await playOutcome(first, { delay: async () => {} });
    assert.equal(finalState.winMicro, book.payoutMultiplier * 10_000);
    assert.equal(finalState.settled, true);
  }
});

test("Stake RGS client uses authenticate/play/end-round/replay without replay wager", async () => {
  const book = books[3];
  const round = roundFromBook(book, { roundID: 77 });
  let balance = 100_000_000;
  const calls = [];
  const fakeFetch = async (url, options = {}) => {
    const path = new URL(url).pathname;
    const body = options.body ? JSON.parse(options.body) : null;
    calls.push({ path, method: options.method ?? "GET", body });
    if (path === "/wallet/authenticate") {
      return jsonResponse({
        status: { statusCode: "SUCCESS" },
        balance: { amount: balance, currency: "USD" },
        config: { betLevels: [0.5, 1, 2, 5] }
      });
    }
    if (path === "/wallet/play") {
      balance -= body.amount;
      return jsonResponse({ status: { statusCode: "SUCCESS" }, balance: { amount: balance, currency: "USD" }, round });
    }
    if (path === "/wallet/end-round") {
      balance += round.payout;
      return jsonResponse({ status: { statusCode: "SUCCESS" }, balance: { amount: balance, currency: "USD" } });
    }
    if (path.startsWith("/bet/replay/")) return jsonResponse({ round: { ...round, active: false } });
    return jsonResponse({ error: { message: "not found" } }, 404);
  };

  const client = new StakeRgs({
    fetch: fakeFetch,
    config: { rgsUrl: "https://rgs.invalid", sessionID: "test", language: "en", currency: "USD", game: "hexandheat", version: "0.2.0", mode: "BASE" }
  });
  await client.initialize();
  const outcome = await client.play({ betMicro: 1_000_000 });
  await client.settle(outcome.id);
  const beforeReplayBalance = client.getSession().balanceMicro;
  const replay = await client.getReplay(outcome.id);

  assert.deepEqual(replay.events, outcome.events);
  assert.equal(client.getSession().balanceMicro, beforeReplayBalance);
  assert.equal(client.metrics.playCalls, 1);
  assert.equal(client.metrics.replayCalls, 1);
  assert.deepEqual(calls.map((call) => call.path), [
    "/wallet/authenticate",
    "/wallet/play",
    "/wallet/end-round",
    "/bet/replay/hexandheat/0.2.0/BASE/77"
  ]);
  assert.equal(calls[1].body.amount, 1_000_000);
});

test("Stake event mapping rejects payout disagreement instead of correcting it", () => {
  const round = roundFromBook(books[1]);
  round.payoutMultiplierUnits += 10;
  assert.throws(
    () => mapStakeRoundToOutcome(round, { betMicro: 1_000_000, currency: "USD" }),
    /finalWin must match RGS payoutMultiplier/
  );
});
