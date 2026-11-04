/** M06: decoded transparent PNGs, driven exclusively by scene active time. */
export function validateClip(clip) {
  if (![6, 8, 12].includes(clip?.fps) || clip.durationMs !== 4000 || clip.frameCount !== clip.fps * 4 || clip.frames?.length !== clip.frameCount) throw Error('Invalid 4-second PNG clip');
  const interval = 1000 / clip.fps;
  if (!Number.isFinite(clip.fadeMs) || clip.fadeMs < 0 || clip.fadeMs > Math.min(40, interval / 4) + 1e-6) throw Error('Fade exceeds pose interval budget');
  clip.frames.forEach((frame, i) => {
    if (!frame.path || Math.abs(frame.timestampMs - i * interval) > .01) throw Error('Nonuniform or missing PNG timestamp');
  });
  return clip;
}

export function sampleSequence(clip, now, { reducedMotion = false, fadeMs = clip.fadeMs } = {}) {
  if (reducedMotion) return { index: 0, next: 0, mix: 0 };
  const phase = ((now % 4000) + 4000) % 4000, interval = 1000 / clip.fps;
  const index = Math.min(clip.frameCount - 1, Math.floor(phase / interval));
  const within = phase - clip.frames[index].timestampMs;
  // Fade into the NEXT pose at the end of the interval; never extend a cycle.
  return { index, next: (index + 1) % clip.frameCount, mix: fadeMs > 0 ? Math.max(0, Math.min(1, (within - interval + fadeMs) / fadeMs)) : 0 };
}

export function decodeImage(path, signal) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const abort = () => { image.src = ''; reject(new DOMException('PNG preload aborted', 'AbortError')); };
    if (signal.aborted) return abort();
    signal.addEventListener('abort', abort, { once: true });
    image.src = path;
    image.decode().then(() => { signal.removeEventListener('abort', abort); resolve(image); }, error => { signal.removeEventListener('abort', abort); reject(error); });
  });
}

/** Bounded loading; the entire set is ready before it can own a body cycle. */
export async function decodeClip(clip, load, signal) {
  validateClip(clip);
  const frames = new Array(clip.frameCount); let cursor = 0;
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (cursor < frames.length) {
      if (signal.aborted) throw new DOMException('PNG preload aborted', 'AbortError');
      const i = cursor++;
      frames[i] = await load(clip.frames[i].path, signal);
    }
  }));
  return frames;
}

export class PngSequencePlayer {
  constructor(container, { transport, fallback, reducedMotion = false, manifestUrl = './assets/m06/manifest.json', load = decodeImage, fetchManifest = async (url,signal) => { const r = await fetch(url,{signal}); if (!r.ok) throw Error('PNG manifest unavailable'); return r.json(); }, timeoutMs = 8000 } = {}) {
    Object.assign(this, { container, transport, fallback, reducedMotion, load, fetchManifest, manifestUrl, timeoutMs });
    this.state = 'IDLE'; this.enabled = false; this.wanted = false; this.destroyed = false;
    this.resources = new Map(); this.pending = new Map(); this.controllers = new Set(); this.failures = new Map();
    this.readyCycles = new Map();
    this.lastCycle = Math.floor(transport.now / 4000); this.generation = 0; this.lastDraw = '';
    this.stats = { changes: 0, missedPoses: 0, lateMs: [], drawnFrames: 0 };
    this.canvas = document.createElement('canvas'); this.canvas.className = 'm06-character'; this.canvas.hidden = true;
    this.canvas.setAttribute('aria-label', 'M06 witch · two animation candidates'); container.append(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.unsubscribe = transport.subscribe(() => this.tick(), 4);
  }
  async prepare() {
    if (this.manifest) return this.manifest;
    if (this.manifestPromise) return this.manifestPromise;
    const controller=new AbortController();this.controllers.add(controller);
    const timeout=setTimeout(()=>controller.abort(),this.timeoutMs);
    this.manifestPromise = this.fetchManifest(this.manifestUrl,controller.signal).then(manifest => {
      if (this.destroyed) return;
      if (!manifest.width || !manifest.height || !manifest.selected || !manifest.clips) throw Error('Invalid PNG manifest');
      this.manifest = manifest; this.canvas.width = manifest.width; this.canvas.height = manifest.height;
      return manifest;
    }).catch(error => { if(!this.destroyed)this.failures.set('manifest', error.message); this.manifestPromise = null; }).finally(()=>{clearTimeout(timeout);this.controllers.delete(controller);});
    return this.manifestPromise;
  }
  clipFor(state) {
    const selection = this.manifest?.selected[state];
    if (!selection) return null;
    const clip = this.manifest.clips[state]?.[String(this.fpsOverride ?? selection.fps)];
    return clip ? { ...clip, fadeMs: this.fadeOverride ?? selection.fadeMs ?? clip.fadeMs } : null;
  }
  async preload(state) {
    const manifest = await this.prepare(); if (!manifest || this.destroyed || !this.wanted || this.reducedMotion) return;
    const clip = this.clipFor(state); if (!clip) return;
    const key = `${state}/${clip.fps}`;
    if (this.resources.has(key)) return this.resources.get(key);
    if (this.pending.has(key)) return this.pending.get(key);
    const controller = new AbortController(); this.controllers.add(controller);
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    const generation = this.generation;
    const promise = decodeClip(clip, this.load, controller.signal).then(images => {
      if (this.destroyed || generation !== this.generation || controller.signal.aborted) return;
      this.resources.set(key, images); this.readyCycles.set(key,Math.ceil(this.transport.now/4000)); return images;
    }).catch(error => {
      controller.abort();
      if (!this.destroyed && generation === this.generation) this.failures.set(key, error.message);
    }).finally(() => { clearTimeout(timeout); this.controllers.delete(controller); if (this.pending.get(key) === promise) this.pending.delete(key); });
    this.pending.set(key, promise); return promise;
  }
  setEnabled(value, { immediate = false } = {}) {
    if(this.destroyed)return;
    this.wanted = Boolean(value);
    if (immediate) this.enabled = this.wanted;
    if (this.wanted) this.prepare().then(() => { this.tick(); if (!this.reducedMotion) this.preload('IDLE').then(() => this.preload('SMALL_WIN')); });
    this.tick();
  }
  setVariant(fps, fadeMs) {
    this.release(); this.fpsOverride = fps; this.fadeOverride = fadeMs;
    this.setEnabled(this.wanted); this.lastDraw = '';
  }
  switchTo(state) { this.state = state; this.fallback.switchTo(state); this.lastDraw = ''; if (!this.reducedMotion) this.preload(state); this.tick(); }
  release() {
    this.generation++; for (const c of this.controllers) c.abort();
    this.controllers.clear(); this.resources.clear(); this.pending.clear(); this.failures.clear(); this.readyCycles.clear();
  }
  setReducedMotion(value) {
    if(this.reducedMotion===Boolean(value)){this.fallback.setReducedMotion(value);return;}
    this.reducedMotion = Boolean(value); this.fallback.setReducedMotion(value); this.release(); this.lastDraw = '';
    // A single neutral image replaces BOTH decoded sets in this mode.
    this.tick(); if (!this.reducedMotion && this.wanted) this.preload('IDLE').then(() => this.preload('SMALL_WIN'));
  }
  tick() {
    if (this.destroyed) return;
    const now = this.transport.now, cycle = Math.floor(now / 4000);
    if (cycle !== this.lastCycle) { this.lastCycle = cycle; if(now%4000<50)this.enabled = this.wanted; }
    const active = this.enabled && this.manifest && this.ctx && !this.failures.has('canvas');
    this.canvas.hidden = !active;
    for (const node of this.container.children) if (node !== this.canvas) node.style.visibility = active ? 'hidden' : '';
    this.fallback.setSuspended?.(Boolean(active));
    if (!active) { if(!this.wanted&&this.resources.size)this.release(); this.container.dataset.media = this.wanted ? !this.ctx||this.failures.has('canvas')?'legacy-canvas-error':this.failures.has('manifest')?'legacy-manifest-error':'loading-manifest' : 'legacy'; return; }
    const clip = this.clipFor(this.state), images = clip && this.resources.get(`${this.state}/${clip.fps}`);
    const poster = this.resources.get('poster');
    if (!poster && !this.pending.has('poster') && !this.failures.has('poster')) {
      const c = new AbortController(), generation = this.generation; this.controllers.add(c);
      const timeout = setTimeout(() => c.abort(), this.timeoutMs);
      const p = this.load(this.manifest.poster, c.signal).then(img => { if (!this.destroyed && generation === this.generation) this.resources.set('poster', img); }).catch(error => { if (!this.destroyed) this.failures.set('poster', error.message); }).finally(() => { clearTimeout(timeout); this.controllers.delete(c); if (this.pending.get('poster') === p) this.pending.delete('poster'); });
      this.pending.set('poster', p);
    }
    const moving = !this.reducedMotion && images && cycle >= this.readyCycles.get(`${this.state}/${clip.fps}`) && !this.failures.has(`${this.state}/${clip?.fps}`);
    const sample = moving ? sampleSequence(clip, now) : { index: 0, next: 0, mix: 0 };
    const current = moving ? images[sample.index] : poster;
    this.container.dataset.media = this.reducedMotion ? 'neutral-reduced' : moving ? `${this.state}/${clip.fps}fps` : !clip ? `neutral-missing-${this.state}` : this.failures.size ? 'neutral-error' : 'neutral-loading';
    if (!current) {
      // Never cover the working renderer with an empty canvas while poster loads.
      this.canvas.hidden = true; for (const n of this.container.children) if (n !== this.canvas) n.style.visibility = '';
      this.fallback.setSuspended?.(false); return;
    }
    const key = `${this.container.dataset.media}/${sample.index}/${sample.mix}`;
    if (key === this.lastDraw) return;
    try {
      const ctx = this.ctx, w = this.canvas.width, h = this.canvas.height;
      ctx.clearRect(0, 0, w, h); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1 - sample.mix; ctx.drawImage(current, 0, 0, w, h);
      if (sample.mix > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = sample.mix; ctx.drawImage(images[sample.next], 0, 0, w, h); }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      if (moving && this.lastIndex !== sample.index) {
        const elapsed = ((now % 4000) + 4000) % 4000 - clip.frames[sample.index].timestampMs;
        this.stats.lateMs.push(elapsed); if (this.stats.lateMs.length > 8192) this.stats.lateMs.shift();
        if (this.lastIndex != null && this.lastMovingKey === `${this.state}/${clip.fps}`) this.stats.missedPoses += Math.max(0, (sample.index - this.lastIndex + clip.frameCount) % clip.frameCount - 1);
        this.stats.changes++; this.lastIndex = sample.index; this.lastMovingKey = `${this.state}/${clip.fps}`;
      }
      this.stats.drawnFrames++; this.lastDraw = key;
      this.container.dataset.mediaFrame = String(sample.index); this.container.dataset.mediaMix = sample.mix.toFixed(3);
    } catch (error) { this.failures.set('canvas', error.message); this.canvas.hidden=true; for(const n of this.container.children)if(n!==this.canvas)n.style.visibility='';this.fallback.setSuspended?.(false);this.lastDraw = ''; }
  }
  diagnostics() { return { state: this.state, enabled: this.enabled, wanted: this.wanted, mode: this.container.dataset.media, failures: Object.fromEntries(this.failures), residentSets: [...this.resources.keys()], estimatedDecodedBytes: [...this.resources.values()].reduce((n, value) => n + (Array.isArray(value) ? value.length : 1) * (this.manifest?.width ?? 0) * (this.manifest?.height ?? 0) * 4, 0), stats: this.stats }; }
  destroy() { if (this.destroyed) return; this.destroyed = true; this.release(); this.unsubscribe(); this.canvas.remove(); this.fallback.destroy(); }
}
