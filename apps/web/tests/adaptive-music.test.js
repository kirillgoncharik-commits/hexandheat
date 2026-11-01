import assert from "node:assert/strict";
import test from "node:test";

import { AdaptiveMusicController, MUSIC_STATES } from "../src/adaptive-music.js";
import { SceneTransport } from '../src/scene-transport.js';

class FakeParam {
  constructor() { this.value = 0; this.actions = []; }
  cancelScheduledValues(time) { this.actions.push(["cancel", time]); }
  setValueAtTime(value, time) { this.value = value; this.actions.push(["set", value, time]); }
  linearRampToValueAtTime(value, time) { this.value = value; this.actions.push(["linear", value, time]); }
  exponentialRampToValueAtTime(value, time) { this.value = value; this.actions.push(["exponential", value, time]); }
}

class FakeNode {
  constructor() { this.gain = new FakeParam(); this.frequency = { value: 0 }; this.starts = []; this.stops = []; }
  connect() { return this; }
  start(time) { this.starts.push(time); }
  stop(time) { this.stops.push(time); }
}

class FakeContext {
  constructor() { this.currentTime = 0.23; this.state = "suspended"; this.destination = {}; this.oscillators = []; this.gains = []; }
  createOscillator() { const node = new FakeNode(); this.oscillators.push(node); return node; }
  createGain() { const node = new FakeNode(); this.gains.push(node); return node; }
  async resume() { this.state = "running"; }
  async close() { this.state = "closed"; }
}

test("temporary stems start together and transition on beat-aligned gain ramps", async () => {
  const context = new FakeContext();
  const music = new AdaptiveMusicController({ contextFactory: () => context, bpm: 120 });
  assert.equal(await music.unlock(), true);
  assert.deepEqual(context.oscillators.slice(0, 3).map((node) => node.starts[0]), [0.5, 0.5, 0.5]);
  music.onEvent({ type: "multiplier", to: 4 }, { betMicro: 1_000_000 });
  assert.equal(music.state, MUSIC_STATES.HOT);
  assert.equal(context.gains[3].gain.actions.at(-1)[0], "linear");
  assert.equal(context.gains[3].gain.actions.at(-1)[2], 0.62);
  music.destroy();
});

test("mute and resume are presentation-only and survive suspended contexts", async () => {
  const context = new FakeContext();
  const music = new AdaptiveMusicController({ contextFactory: () => context });
  await music.unlock();
  music.mute(true);
  assert.equal(music.muted, true);
  assert.equal(music.master.gain.actions.at(-1)[1], 0);
  context.state = "suspended";
  assert.equal(await music.restore(), true);
  assert.equal(context.state, "running");
  music.mute(false);
  assert.equal(music.master.gain.actions.at(-1)[1], 1);
});

test("audio initialization failure degrades without throwing into game flow", async () => {
  const errors = [];
  const music = new AdaptiveMusicController({
    contextFactory: () => { throw new Error("blocked audio"); },
    onError: (error) => errors.push(error.message)
  });
  assert.equal(await music.unlock(), false);
  music.onEvent({ type: "win", amount: 10_000_000 }, { betMicro: 1_000_000 });
  assert.deepEqual(errors, ["blocked audio"]);
  assert.equal(music.failed, true);
});

test('scene-owned audio beats, deduplicated impacts and hidden/muted cues never replay a backlog', async () => {
  let wall = 0; const transport = new SceneTransport({ now: () => wall, requestFrame: () => 1, cancelFrame: () => {} });
  const context = new FakeContext(); const music = new AdaptiveMusicController({ contextFactory: () => context, transport });
  await music.unlock(); wall = 123; transport.tick(wall);
  assert.ok(Math.abs(music.nextBeat() - (context.currentTime + 0.377)) < 1e-8);
  const before = context.oscillators.length;
  music.playOneShot('WIN', { key: 'a', sceneAt: transport.now }); music.playOneShot('WIN', { key: 'a', sceneAt: transport.now });
  assert.equal(context.oscillators.length, before + 1);
  music.suspend(); music.playOneShot('POTION', { key: 'hidden' }); await music.restore(); music.playOneShot('POTION', { key: 'hidden' });
  assert.equal(context.oscillators.length, before + 1);
  music.mute(true); music.playOneShot('WIN', { key: 'muted' }); music.mute(false); music.playOneShot('WIN', { key: 'muted' });
  assert.equal(context.oscillators.length, before + 1);
  music.beginRound(); assert.equal(music.oneShots.size, 0); music.destroy();
});
