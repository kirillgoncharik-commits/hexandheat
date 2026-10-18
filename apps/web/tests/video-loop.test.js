import assert from "node:assert/strict";
import test from "node:test";

import { NativeVideoLoopController } from "../src/video-loop.js";

class Classes {
  constructor() { this.values = new Set(); }
  add(value) { this.values.add(value); }
  remove(value) { this.values.delete(value); }
  contains(value) { return this.values.has(value); }
}

class FakeVideo extends EventTarget {
  constructor({ fail = false } = {}) {
    super();
    this.classList = new Classes();
    this.readyState = fail ? 0 : 2;
    this.fail = fail;
    this.src = "";
    this.currentTime = 8;
    this.pauseCalls = 0;
    this.playCalls = 0;
  }
  load() {
    if (this.fail) queueMicrotask(() => this.dispatchEvent(new Event("error")));
  }
  async play() { this.playCalls += 1; }
  pause() { this.pauseCalls += 1; }
  removeAttribute(name) { if (name === "src") this.src = ""; }
}

function scheduler() {
  let id = 0;
  const timers = new Map();
  return {
    schedule(callback) { const next = ++id; timers.set(next, callback); return next; },
    cancel(timer) { timers.delete(timer); },
    flush() { for (const [timer, callback] of [...timers]) { timers.delete(timer); callback(); } },
    get size() { return timers.size; }
  };
}

test("native video controller preloads and crossfades without a black-frame stop", async () => {
  const clock = scheduler();
  const layers = [new FakeVideo(), new FakeVideo()];
  const controller = new NativeVideoLoopController({
    layers,
    sources: { IDLE: "idle.webm", REACTION: "reaction.webm" },
    schedule: clock.schedule,
    cancel: clock.cancel
  });
  assert.equal(await controller.start("IDLE"), true);
  assert.equal(layers[0].classList.contains("is-active"), true);
  assert.equal(await controller.preload("SMALL_WIN"), true);
  assert.equal(await controller.switchTo("SMALL_WIN"), true);
  assert.equal(layers[1].classList.contains("is-active"), true);
  assert.equal(layers[0].classList.contains("is-active"), false);
  assert.equal(layers[0].pauseCalls, 0);
  clock.flush();
  assert.equal(layers[0].pauseCalls, 1);
  assert.equal(layers[1].currentTime, 0);
  controller.destroy();
  assert.equal(clock.size, 0);
});

test("decode failure keeps the existing layer active and reports a fallback", async () => {
  const errors = [];
  const layers = [new FakeVideo(), new FakeVideo({ fail: true })];
  const controller = new NativeVideoLoopController({
    layers,
    sources: { IDLE: "idle.webm", REACTION: "broken.webm" },
    onError: (error) => errors.push(error.message)
  });
  await controller.start("IDLE");
  assert.equal(await controller.switchTo("BIG_WIN"), false);
  assert.equal(layers[0].classList.contains("is-active"), true);
  assert.match(errors[0], /decode failed/);
  controller.destroy();
});
