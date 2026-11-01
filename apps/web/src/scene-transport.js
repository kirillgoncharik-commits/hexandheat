/** One monotonic active-time source for every visual participant. No wallet logic. */
export class SceneTransport {
  constructor({ now = () => performance.now(), requestFrame = cb => requestAnimationFrame(cb), cancelFrame = id => cancelAnimationFrame(id) } = {}) {
    this.wallNow = now; this.requestFrame = requestFrame; this.cancelFrame = cancelFrame;
    this.origin = now(); this.time = 0; this.pausedWall = 0; this.pauseStarted = null;
    this.reasons = new Set(); this.listeners = new Set(); this.frame = null; this.destroyed = false;
    this.frameInterval = 1000 / 60; this.lastTick = null;
  }
  get now() { return this.time; }
  get paused() { return this.reasons.size > 0; }
  subscribe(fn, priority = 0) {
    const entry = { fn, priority }; this.listeners.add(entry);
    return () => this.listeners.delete(entry);
  }
  sample(wall = this.wallNow()) {
    if (!this.paused) this.time = Math.max(this.time, wall - this.origin - this.pausedWall);
    return this.time;
  }
  tick(wall = this.wallNow()) {
    this.sample(wall);
    if (this.paused || this.destroyed) return;
    if (this.lastTick !== null) this.frameInterval = Math.max(1000 / 120, Math.min(1000, this.time - this.lastTick));
    this.lastTick = this.time;
    const snapshot = Object.freeze({ now: this.time, phaseMs: this.time % 4000, cycle: Math.floor(this.time / 4000) });
    for (const entry of [...this.listeners].sort((a, b) => a.priority - b.priority)) {
      if (this.listeners.has(entry)) entry.fn(snapshot);
    }
  }
  start() {
    if (this.frame !== null || this.destroyed || this.paused) return;
    this.frame = this.requestFrame(wall => { this.frame = null; this.tick(wall); this.start(); });
  }
  pause(reason = 'manual') {
    if (!this.paused) { this.sample(); this.pauseStarted = this.wallNow(); }
    this.reasons.add(reason);
    if (this.frame !== null) this.cancelFrame(this.frame);
    this.frame = null;
  }
  resume(reason = 'manual') {
    this.reasons.delete(reason);
    if (!this.paused && this.pauseStarted !== null) {
      this.pausedWall += this.wallNow() - this.pauseStarted; this.pauseStarted = null; this.start();
    }
  }
  /** Completion is confirmed after update(1), not a guessed setTimeout. */
  tween(duration, update, { signal, startAt = this.now } = {}) {
    return new Promise((resolve, reject) => {
      if (this.destroyed || signal?.aborted) { reject(new DOMException('Animation aborted', 'AbortError')); return; }
      const began = startAt; let unsubscribe = () => {}; let done = false;
      const finish = error => {
        if (done) return; done = true; unsubscribe(); signal?.removeEventListener('abort', abort);
        error ? reject(error) : resolve();
      };
      const abort = () => finish(new DOMException('Animation aborted', 'AbortError'));
      const render = ({ now }) => {
        try { const p = duration <= 0 ? 1 : Math.max(0, Math.min(1, (now - began) / duration)); update(p); if (p >= 1) finish(); }
        catch (error) { finish(error); }
      };
      signal?.addEventListener('abort', abort, { once: true });
      unsubscribe = this.subscribe(render, 10); render({ now: this.now });
    });
  }
  wait(ms, options) { return this.tween(ms, () => {}, options); }
  destroy() {
    // Owners must abort outstanding cues before destroying their transport.
    this.destroyed = true; if (this.frame !== null) this.cancelFrame(this.frame);
    this.frame = null; this.listeners.clear();
  }
}
