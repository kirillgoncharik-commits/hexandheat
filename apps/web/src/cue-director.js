/** Bounded, round-owned completion barriers on active scene time. */
export class CueDirector {
  constructor(transport, { limit = 1500 } = {}) {
    this.transport = transport; this.limit = limit; this.trace = []; this.generation = 0; this.controllers = new Set();
  }
  record(type, data = {}) {
    this.trace.push({ at: Math.round(this.transport.now * 100) / 100, type, generation: this.generation, ...data });
    if (this.trace.length > this.limit) this.trace.splice(0, this.trace.length - this.limit);
  }
  beginRound() { this.cancel(); this.generation++; this.record('round.begin'); return this.generation; }
  cancel() { for (const controller of this.controllers) controller.abort(); this.controllers.clear(); }
  async run({ id, duration = 0, required, fallback = () => {} }) {
    if (!Array.isArray(required) || !required.length) throw new Error('Required cue has no participants');
    const controller = new AbortController(); const deadline = new AbortController();
    const generation = this.generation; const budget = Math.max(1000, Math.min(3000, this.transport.frameInterval * 3));
    this.controllers.add(controller); this.record('cue.start', { id, duration, deadlineMs: duration + budget });
    let status = 'complete';
    try {
      const work = Promise.all(required.map(fn => Promise.resolve().then(() => fn(controller.signal))));
      const timeout = this.transport.wait(duration + budget, { signal: deadline.signal }).then(() => { throw new Error('Cue deadline exceeded'); });
      const cancellation = new Promise((_, reject) => controller.signal.addEventListener('abort', () => reject(new DOMException('Cue aborted', 'AbortError')), { once: true }));
      await Promise.race([work, timeout, cancellation]);
    } catch (error) {
      status = error.name === 'AbortError' ? 'cancelled' : 'fallback';
      controller.abort();
      // Never let old callbacks overwrite a replacement round.
      if (status === 'fallback' && generation === this.generation) { await fallback(); this.record('cue.error', { id, error: String(error.message).slice(0, 120) }); }
      if (status === 'cancelled') throw error;
    } finally {
      deadline.abort(); this.controllers.delete(controller); this.record('cue.' + status, { id });
    }
    return status;
  }
}
