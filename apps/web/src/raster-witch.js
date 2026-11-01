export const RASTER_STATES = Object.freeze(["IDLE", "SMALL_WIN", "MEDIUM_WIN", "BIG_WIN", "BONUS"]);
export const RASTER_CYCLE_MS = 4000;
export const RASTER_FRAME_MS = 1000;

export function rasterFrameAt(elapsedMs) {
  return Math.floor(Math.max(0, elapsedMs) % RASTER_CYCLE_MS / RASTER_FRAME_MS);
}

export function rasterSource(state, frame) {
  const row = RASTER_STATES.indexOf(state);
  if (row < 0 || !Number.isInteger(frame) || frame < 0 || frame > 3) throw new Error("Invalid raster frame");
  return `./assets/witch/frame-${String(row * 4 + frame).padStart(2, "0")}.png`;
}

/** Four real raster frames per state. Decorative playback never settles money. */
export class RasterWitchPlayer {
  constructor(container, { reducedMotion = false, transport = null, atlasUrl = null } = {}) {
    this.container = container;
    this.reducedMotion = reducedMotion;
    this.state = "IDLE";
    this.transport = transport;
    this.atlasUrl = atlasUrl;
    this.atlasReady = false;
    this.startedAt = performance.now();
    this.lastFrame = -1;
    this.front = 0;
    this.layers = [0, 1].map(() => {
      const img = document.createElement("img");
      img.className = "witch-raster";
      img.alt = "";
      img.setAttribute("aria-hidden", "true");
      img.addEventListener("error", () => {
        if (!img.src.endsWith("frame-00.png")) img.src = rasterSource("IDLE", 0);
        container.dataset.degraded = "true";
      });
      container.append(img);
      return img;
    });
    // Predecode all small frames; subsequent changes do not wait on a request.
    this.preload = Promise.all(RASTER_STATES.flatMap(s => [0, 1, 2, 3].map(f => {
      const img = new Image(); img.src = rasterSource(s, f);
      return img.decode().catch(() => null);
    })));
    if (atlasUrl) {
      const atlas = new Image(); atlas.src = atlasUrl;
      this.atlasPreload = atlas.decode().then(() => {
        if (this.destroyed) return;
        this.atlasReady = true;
        this.sprite = document.createElement('div'); this.sprite.className = 'witch-atlas';
        this.sprite.style.backgroundImage = `url("${atlasUrl}")`; container.append(this.sprite);
        this.layers.forEach(img => img.hidden = true); this.lastFrame = -1;
      }).catch(() => { container.dataset.degraded = 'true'; });
    }
    this.tick = () => {
      const frame = this.reducedMotion ? 0 : rasterFrameAt(this.transport ? this.transport.now : performance.now() - this.startedAt);
      if (frame !== this.lastFrame) {
        if (this.atlasReady) {
          this.sprite.style.backgroundPosition = `${frame * 100 / 3}% ${RASTER_STATES.indexOf(this.state) * 25}%`;
        } else {
        this.front = 1 - this.front;
        this.layers[this.front].src = rasterSource(this.state, frame);
        this.layers[this.front].classList.add("visible");
        this.layers[1 - this.front].classList.remove("visible");
        }
        this.lastFrame = frame;
        this.container.dataset.frame = String(frame);
      }
      if (!this.transport) this.raf = requestAnimationFrame(this.tick);
    };
    if (transport) this.unsubscribe = transport.subscribe(this.tick, 2);
    this.tick();
  }
  switchTo(state) {
    if (!RASTER_STATES.includes(state)) return;
    this.state = state;
    if (!this.transport) this.startedAt = performance.now();
    this.lastFrame = -1;
    this.container.dataset.state = state;
  }
  setReducedMotion(value) { this.reducedMotion = value; this.lastFrame = -1; }
  destroy() { this.destroyed = true; this.unsubscribe?.(); if (this.raf) cancelAnimationFrame(this.raf); this.layers.forEach(img => img.remove()); this.sprite?.remove(); }
}
