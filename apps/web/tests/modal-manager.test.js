import test from 'node:test';
import assert from 'node:assert/strict';
import { SceneTransport } from '../src/scene-transport.js';
import { ModalManager } from '../src/modal-manager.js';

const flush = async () => { for (let i = 0; i < 6; i++) await Promise.resolve(); };
function harness() {
  let now = 0; const changes = []; const trigger = { isConnected: true, focused: 0, focus() { this.focused++; } };
  const transport = new SceneTransport({ now: () => now, requestFrame: () => 1, cancelFrame: () => {} });
  const manager = new ModalManager(transport, { onChange: value => changes.push(value) });
  const dialog = () => ({ open: false, style: { setProperty() {} }, focused: 0, closes: 0,
    showModal() { this.open = true; }, close() { this.open = false; this.closes++; }, querySelector() { return { focus: () => this.focused++ }; } });
  return { manager, changes, trigger, dialog, to(ms) { now = ms; transport.tick(now); } };
}

test('close during opening followed by a new open cannot let stale callbacks steal focus', async () => {
  const h = harness(); const a = h.dialog(); const b = h.dialog();
  const opening = h.manager.open(a, h.trigger); h.to(100);
  const closing = h.manager.close(a); h.to(150);
  const replacement = h.manager.open(b, h.trigger); h.to(400);
  await Promise.all([opening, closing, replacement]);
  assert.equal(a.open, false); assert.equal(b.open, true); assert.equal(h.manager.active, b);
  assert.equal(h.manager.state, 'OPEN'); assert.equal(a.focused, 0); assert.equal(b.focused, 1); assert.equal(h.trigger.focused, 0);
  const close = h.manager.close(b); h.to(600); await close;
  assert.equal(h.manager.state, 'CLOSED'); assert.equal(h.trigger.focused, 1); assert.equal(h.changes.at(-1), false);
});

test('repeated opens are idempotent, reduced motion completes without changing focus ownership', async () => {
  const h = harness(); const a = h.dialog(); h.manager.reducedMotion = () => true;
  await h.manager.open(a, h.trigger); await h.manager.open(a, h.trigger); await flush();
  assert.equal(h.changes.length, 1); assert.equal(h.manager.state, 'OPEN');
  await h.manager.close(); assert.equal(h.trigger.focused, 1);
});
