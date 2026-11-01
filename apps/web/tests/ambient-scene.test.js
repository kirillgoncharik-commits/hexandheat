import test from 'node:test';
import assert from 'node:assert/strict';
import { platePlacement, sampleAmbient, WORLD_LOOP_MS } from '../src/ambient-scene.js';
import { SceneTransport } from '../src/scene-transport.js';

test('ambient loop closes without a brightness or position jump', () => {
  const start = sampleAmbient(0), end = sampleAmbient(WORLD_LOOP_MS);
  assert.deepEqual(start,end);
  const before = sampleAmbient(WORLD_LOOP_MS - 1);
  assert.ok(Math.abs(before.cloudX - start.cloudX) < .02);
  for (let ms=0; ms<WORLD_LOOP_MS; ms+=100) for (const flame of sampleAmbient(ms).candles) {
    assert.ok(flame.light >= .395 && flame.light <= .605);
    assert.ok(Number.isFinite(flame.height));
  }
});

test('scenery uses paused scene time and resumes without accumulating wall time', () => {
  let wall=0; const t = new SceneTransport({now:()=>wall,requestFrame:()=>1,cancelFrame:()=>{}});
  wall=1500; t.tick(); const before=sampleAmbient(t.now);
  t.pause('hidden'); wall=61500; t.tick(); assert.deepEqual(sampleAmbient(t.now),before);
  t.resume('hidden'); wall=61600; t.tick(); assert.equal(t.now,1600);
  assert.notDeepEqual(sampleAmbient(t.now),before); t.destroy();
});

test('plate cover geometry stays aligned on desktop and mobile', () => {
  for (const [w,h] of [[1440,810],[1365,940],[390,844],[360,640],[480,320]]) {
    const p=platePlacement(w,h);
    assert.ok(1440*p.scale >= w && 810*p.scale >= h);
    assert.equal(p.x,(w-1440*p.scale)*(w<=580?.7:.5));
    assert.ok(p.x<=0 && p.y<=0);
  }
});
