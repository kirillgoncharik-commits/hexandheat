import test from 'node:test';
import assert from 'node:assert/strict';
import { SceneTransport } from '../src/scene-transport.js';
import { CueDirector } from '../src/cue-director.js';
import { WitchDanceController } from '../src/witch-dance.js';
import { planColumn } from '../src/board-player.js';
import { ScenePresentation } from '../src/scene-presentation.js';
import { playOutcome } from '../src/domain.js';
import { MockRgs } from '../src/mock-rgs.js';

const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
function clock() {
  let wall = 0;
  const transport = new SceneTransport({ now: () => wall, requestFrame: () => 1, cancelFrame: () => {} });
  return { transport, to(ms) { wall = ms; transport.tick(ms); }, get wall() { return wall; } };
}

test('all subscribers share one timestamp in deterministic priority order; 30-minute phase has no drift', () => {
  const c = clock(); const samples = [];
  c.transport.subscribe(s => samples.push(['raster', s.now, s.phaseMs]), 2);
  c.transport.subscribe(s => samples.push(['controller', s.now, s.phaseMs]), 0);
  for (let ms = 0; ms <= 1800000; ms += 17) c.to(ms);
  c.to(1800000);
  assert.deepEqual(samples.slice(-2), [['controller', 1800000, 0], ['raster', 1800000, 0]]);
});

test('visibility pauses active-time tween, including overlapping pause reasons', async () => {
  const c = clock(); let progress = 0;
  const done = c.transport.tween(1000, p => progress = p);
  c.to(400); c.transport.pause('visibility'); c.to(10400);
  c.transport.pause('pagehide'); c.transport.resume('visibility'); c.to(60400);
  assert.equal(progress, 0.4);
  c.transport.resume('pagehide'); c.to(61000); await done;
  assert.equal(progress, 1); assert.equal(c.transport.now, 1000); assert.equal(c.transport.listeners.size, 0);
});

test('aborted renderer tween releases listeners without committing a late end state', async () => {
  const c = clock(); const controller = new AbortController(); let progress;
  const result = c.transport.tween(1000, p => progress = p, { signal: controller.signal });
  c.to(200); controller.abort(); await assert.rejects(result, { name: 'AbortError' });
  c.to(3000); assert.equal(progress, 0.2); assert.equal(c.transport.listeners.size, 0);
});

test('barrier waits for every required participant, times out in active time and rejects missing participants', async () => {
  const c = clock(); const director = new CueDirector(c.transport); director.beginRound(); let completed = false;
  const task = director.run({ id: 'both', duration: 200, required: [s => c.transport.wait(100, { signal: s }), s => c.transport.wait(200, { signal: s })] }).then(() => completed = true);
  await flush(); c.to(100); await flush(); assert.equal(completed, false);
  c.to(200); await task; assert.equal(completed, true); assert.equal(c.transport.listeners.size, 0);
  await assert.rejects(director.run({ id: 'empty', required: [] }), /no participants/);
  let fallback = 0;
  const stalled = director.run({ id: 'stalled', duration: 100, required: [() => new Promise(() => {})], fallback: () => fallback++ });
  c.to(1300); assert.equal(await stalled, 'fallback'); assert.equal(fallback, 1);
  assert.equal(director.trace.filter(t => t.id === 'stalled' && t.type === 'cue.fallback').length, 1);
});

test('replacing a round cancels pending barriers without stale fallback or listeners', async () => {
  const c = clock(); const director = new CueDirector(c.transport); let fallback = 0;
  const task = director.run({ id: 'old', required: [s => c.transport.wait(1000, { signal: s })], fallback: () => fallback++ });
  await flush(); director.beginRound(); await assert.rejects(task, { name: 'AbortError' });
  c.to(5000); assert.equal(fallback, 0); assert.equal(c.transport.listeners.size, 0);
});

test('all 25 ordered body transitions respect a full 4000ms seam, including lower tiers in a new round', () => {
  const states = ['IDLE', 'SMALL_WIN', 'MEDIUM_WIN', 'BIG_WIN', 'BONUS'];
  for (const from of states) for (const to of states) {
    const c = clock(); const witch = new WitchDanceController({ transport: c.transport }); witch.start();
    witch.beginRound(); if (from !== 'IDLE') witch.request(from); c.to(4000);
    assert.equal(witch.active, from);
    witch.beginRound(); if (to !== 'IDLE') witch.request(to); witch.endRound();
    c.to(7999); assert.equal(witch.active, from, `${from} -> ${to} was early`);
    c.to(8000); assert.equal(witch.active, to, `${from} -> ${to} missed seam`);
    c.to(11999); assert.equal(witch.active, to);
    c.to(12000); assert.equal(witch.active, 'IDLE'); witch.destroy();
  }
});

test('new loss removes an unstarted old BIG and lets an already started BIG finish exactly once', () => {
  const c = clock(); const witch = new WitchDanceController({ transport: c.transport }); witch.start();
  witch.beginRound(); witch.request('BIG_WIN'); witch.endRound(); witch.beginRound(); c.to(4000);
  assert.equal(witch.active, 'IDLE');
  witch.request('BIG_WIN'); c.to(8000); assert.equal(witch.active, 'BIG_WIN');
  witch.beginRound(); c.to(11999); assert.equal(witch.active, 'BIG_WIN');
  c.to(12000); assert.equal(witch.active, 'IDLE'); witch.destroy();
});

test('late foreground callbacks defer a body change to a future seam instead of entering mid-pose', () => {
  const c = clock(); const witch = new WitchDanceController({ transport: c.transport }); witch.start();
  witch.beginRound(); witch.request('SMALL_WIN'); c.to(5600); assert.equal(witch.active, 'IDLE');
  c.to(8000); assert.equal(witch.active, 'SMALL_WIN'); witch.destroy();
});

test('sparse frames can stitch at the shared neutral pose and jitter never shortens the protected full cycle', () => {
  const c = clock(); const witch = new WitchDanceController({ transport: c.transport }); witch.start();
  witch.beginRound(); witch.request('BIG_WIN'); witch.endRound();
  for (const ms of [990, 1990, 2990, 3990, 4990]) c.to(ms);
  assert.equal(witch.active, 'BIG_WIN');
  c.to(8010); assert.equal(witch.active, 'BIG_WIN');
  c.to(8989); assert.equal(witch.active, 'BIG_WIN');
  c.to(8990); assert.equal(witch.active, 'IDLE'); witch.destroy();
});

test('tumble retains valid survivor identities and flags noncanonical sample boards without inventing a target', () => {
  const canonical = planColumn(['a', 'b', 'c', 'd', 'e'], ['x', 'y', 'a', 'c', 'e'], [1, 3]);
  assert.equal(canonical.compatible, true); assert.deepEqual(canonical.cells.map(c => c.from), [null, null, 0, 2, 4]);
  const sample = planColumn(['a', 'b', 'c'], ['x', 'z', 'c'], [0]);
  assert.equal(sample.compatible, false); assert.deepEqual(sample.cells.map(c => c.symbol), ['x', 'z', 'c']);
});

test('anchored sub-timelines catch up in the same sparse frame without adding a new artificial delay', async () => {
  const c = clock(); let end = 0;
  const first = c.transport.tween(180, p => end = p);
  c.to(1016); await first; assert.equal(end, 1);
  await c.transport.tween(540, p => end = p, { startAt: 180 });
  assert.equal(end, 1); assert.equal(c.transport.listeners.size, 0);
});

test('a win read hold starts after the final value is actually visible in a sparse frame', async () => {
  const c = clock(); const director = new CueDirector(c.transport); const plaque = { style: {} };
  const elements = { win: {}, multiplier: { closest: () => plaque }, debugMultiplier: {}, witchStage: { style: { setProperty() {} } } };
  const presentation = new ScenePresentation({ transport: c.transport, director, board: { render() {} }, witch: { beginRound() {}, onEvent() {} }, music: { setState() {}, playOneShot() {} }, elements });
  presentation.begin(); let finished = false;
  const state = { winMicro: 2000000, multiplier: 1, highlightedPositions: [] };
  const task = presentation.event({ type: 'win', index: 0, amount: 2000000 }, state, { betMicro: 1000000 }, 'normal').then(() => finished = true);
  await flush(); c.to(1000); await flush(); assert.equal(finished, false); assert.match(elements.win.textContent, /2\.00/);
  c.to(1499); await flush(); assert.equal(finished, false); c.to(1500); await task;
  assert.equal(finished, true); presentation.destroy();
});

test('real CueDirector event playback preserves sample outcomes in Normal, Fast, Replay and Reduced Motion', async () => {
  const rgs = new MockRgs(); const outcome = await rgs.play({ betMicro: 1000000 }); const results = [];
  for (const mode of ['normal', 'fast', 'replay', 'reduced']) {
    const c = clock(); const director = new CueDirector(c.transport); let boardState;
    const board = { render: s => boardState = s, reveal: async (s, tokens, signal) => { await c.transport.wait(tokens.reveal, { signal }); boardState = s; }, cascade: async (old, s, tokens, signal) => { await c.transport.wait(tokens.fall, { signal }); boardState = s; } };
    const style = { setProperty() {} }; const plaque = { style: {} };
    const elements = { win: {}, multiplier: { closest: () => plaque }, debugMultiplier: {}, witchStage: { style } };
    const presentation = new ScenePresentation({ transport: c.transport, director, board, witch: { beginRound() {}, onEvent() {} }, music: { setState() {}, playOneShot() {} }, elements });
    presentation.setReducedMotion(mode === 'reduced'); presentation.begin();
    let done = false; let result; let error;
    const task = playOutcome(outcome, { delay: async () => {}, onEvent: (e, s) => presentation.event(e, s, outcome, mode === 'fast' ? 'fast' : 'normal') }).then(s => { done = true; result = s; }, e => { done = true; error = e; });
    for (let ms = 0; ms < 20000 && !done; ms += 50) { await flush(); c.to(ms); }
    await task; if (error) throw error;
    assert.equal(result.winMicro, outcome.payoutMicro); assert.deepEqual(boardState.board, outcome.events.at(-2).board);
    assert.ok(director.trace.every(t => t.type !== 'cue.fallback')); results.push(result); presentation.destroy();
    assert.equal(c.transport.listeners.size, 0);
  }
  results.forEach(result => assert.deepEqual(result, results[0]));
});
