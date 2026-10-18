/** Two-layer native-video loop player with preload, crossfade and CSS fallback. */
export class NativeVideoLoopController {
  constructor({
    layers,
    sources,
    crossfadeMs = 180,
    timeoutMs = 3000,
    schedule = (callback, ms) => setTimeout(callback, ms),
    cancel = (id) => clearTimeout(id),
    onError = () => {}
  }) {
    if (!Array.isArray(layers) || layers.length !== 2) throw new Error("Two video layers are required");
    this.layers = layers;
    this.sources = sources;
    this.crossfadeMs = crossfadeMs;
    this.timeoutMs = timeoutMs;
    this.schedule = schedule;
    this.cancel = cancel;
    this.onError = onError;
    this.activeIndex = 0;
    this.currentState = null;
    this.prepared = new Map();
    this.timers = new Set();
    this.destroyed = false;
    for (const layer of layers) {
      layer.muted = true;
      layer.loop = true;
      layer.playsInline = true;
      layer.preload = "auto";
    }
  }

  sourceFor(state) {
    const source = this.sources[state] ?? this.sources.REACTION;
    if (!source) throw new Error(`No video POC source for ${state}`);
    return source;
  }

  async prepare(index, state) {
    const key = `${index}:${state}`;
    if (this.prepared.get(key)) return true;
    const layer = this.layers[index];
    const source = this.sourceFor(state);
    if (layer.src !== source) {
      layer.src = source;
      layer.load();
    }
    if (layer.readyState < 2) {
      await new Promise((resolve, reject) => {
        const cleanup = () => {
          layer.removeEventListener("canplay", ready);
          layer.removeEventListener("error", failed);
          this.cancel(timer);
          this.timers.delete(timer);
        };
        const ready = () => { cleanup(); resolve(); };
        const failed = () => { cleanup(); reject(new Error(`Video decode failed for ${state}`)); };
        const timer = this.schedule(() => {
          this.timers.delete(timer);
          layer.removeEventListener("canplay", ready);
          layer.removeEventListener("error", failed);
          reject(new Error(`Video preload timed out for ${state}`));
        }, this.timeoutMs);
        this.timers.add(timer);
        layer.addEventListener("canplay", ready, { once: true });
        layer.addEventListener("error", failed, { once: true });
      });
    }
    this.prepared.set(key, true);
    return true;
  }

  async start(state) {
    try {
      await this.prepare(this.activeIndex, state);
      const layer = this.layers[this.activeIndex];
      layer.currentTime = 0;
      await layer.play();
      layer.classList.add("is-active");
      this.currentState = state;
      return true;
    } catch (error) {
      this.onError(error);
      return false;
    }
  }

  async preload(state) {
    try {
      await this.prepare(1 - this.activeIndex, state);
      return true;
    } catch (error) {
      this.onError(error);
      return false;
    }
  }

  async switchTo(state) {
    if (this.destroyed || state === this.currentState) return !this.destroyed;
    const incomingIndex = 1 - this.activeIndex;
    if (!(await this.preload(state))) return false;
    const incoming = this.layers[incomingIndex];
    const outgoing = this.layers[this.activeIndex];
    try {
      incoming.currentTime = 0;
      await incoming.play();
      incoming.classList.add("is-active");
      outgoing.classList.remove("is-active");
      const timer = this.schedule(() => {
        this.timers.delete(timer);
        if (!outgoing.classList.contains("is-active")) outgoing.pause();
      }, this.crossfadeMs);
      this.timers.add(timer);
      this.activeIndex = incomingIndex;
      this.currentState = state;
      return true;
    } catch (error) {
      incoming.classList.remove("is-active");
      this.onError(error);
      return false;
    }
  }

  destroy() {
    this.destroyed = true;
    for (const timer of this.timers) this.cancel(timer);
    this.timers.clear();
    for (const layer of this.layers) {
      layer.pause();
      layer.removeAttribute("src");
      layer.load();
    }
    this.prepared.clear();
  }
}
