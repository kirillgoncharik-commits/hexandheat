/** Decorative atelier layer. Scene time only; no outcomes, timers or barriers. */
export const PLATE = Object.freeze({ width: 1440, height: 810 });
export const WORLD_LOOP_MS = 32000;
// Bounds follow the painted window apertures, excluding stone and mullions.
export const WINDOWS = [
  [[51,135],[62,107],[79,91],[100,96],[124,115],[150,153],[150,391],[48,391]],
  [[1089,152],[1101,112],[1121,82],[1134,91],[1153,112],[1182,157],[1182,433],[1089,433]],
  [[1205,117],[1217,78],[1240,41],[1253,35],[1281,57],[1311,92],[1331,144],[1331,434],[1205,434]]
];
export const CANDLES = [
  [17,153,1.3],[141,505,.8],[149,497,.9],
  [994,232,.8],[1000,216,.9],[1009,240,.8],[1023,225,1],[1034,246,.75],[1050,245,.95],
  [942,526,.6],[951,518,.7],[966,528,.7],
  [1390,270,.7],[1410,248,.75],[1432,255,.7],
  [1339,406,.8],[1357,389,.8],[1380,364,.8]
];
const TAU = Math.PI * 2;

export function platePlacement(width, height) {
  const scale = Math.max(width / PLATE.width, height / PLATE.height);
  return { scale, x: (width - PLATE.width * scale) * (width <= 580 ? .7 : .5), y: (height - PLATE.height * scale) * .5 };
}

export function sampleAmbient(ms) {
  const phase = ((ms % WORLD_LOOP_MS) + WORLD_LOOP_MS) % WORLD_LOOP_MS / WORLD_LOOP_MS * TAU;
  return {
    cloudX: Math.sin(phase) * 42,
    cloudY: Math.cos(phase) * 7,
    mistX: Math.sin(phase * 2 + .8) * 27,
    moon: .08 + .025 * Math.sin(phase * 4),
    candles: CANDLES.map((_, i) => {
      const offset = i * 1.71;
      const flicker = Math.sin(phase * 20 + offset) * .07 + Math.sin(phase * 44 + offset * 2) * .035;
      return { light: .5 + flicker, lean: Math.sin(phase * 12 + offset) * 1.2, height: 7 + Math.sin(phase * 28 + offset) * .9 };
    })
  };
}

function glow(ctx, x, y, radius, color, alpha, stretch = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(stretch, 1);
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
  gradient.addColorStop(0, `rgba(${color},${alpha})`); gradient.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = gradient; ctx.fillRect(-radius, -radius, radius * 2, radius * 2); ctx.restore();
}

export function drawAmbient(ctx, sample) {
  // Slow haze exists only outside; architecture and the castle stay still.
  ctx.save(); ctx.beginPath();
  for (const polygon of WINDOWS) { ctx.moveTo(...polygon[0]); for (const point of polygon.slice(1)) ctx.lineTo(...point); ctx.closePath(); }
  ctx.clip();
  for (const x of [85,1133,1250]) {
    glow(ctx, x + sample.cloudX, 167 + sample.cloudY, 43, '131,164,206', .12, 2.1);
    glow(ctx, x - 25 - sample.cloudX * .65, 209 - sample.cloudY, 28, '35,42,73', .25, 2.7);
    glow(ctx, x + sample.mistX, 390, 24, '151,180,197', .13, 2.8);
  }
  glow(ctx, 1219, 101, 57, '178,204,239', sample.moon);
  glow(ctx, 105, 139, 46, '178,204,239', sample.moon * .8);
  ctx.restore();

  for (let i = 0; i < CANDLES.length; i++) {
    const [x,y,size] = CANDLES[i], flame = sample.candles[i];
    glow(ctx, x,y,20 * size,'255,154,64',flame.light * .18,1.25);
    ctx.save(); ctx.translate(x,y); ctx.scale(size,size);
    ctx.fillStyle = `rgba(255,183,92,${flame.light * .7})`; ctx.beginPath();
    ctx.moveTo(-1.7,2); ctx.quadraticCurveTo(-3,-1,flame.lean,-flame.height);
    ctx.quadraticCurveTo(3,0,1.7,2); ctx.closePath(); ctx.fill();
    glow(ctx,0,0,3,'255,232,179',flame.light * .65); ctx.restore();
  }
  // Local reflected warmth: no full-screen flashes or decorative win signals.
  glow(ctx,969,598,28,'238,137,62',sample.candles[10].light * .045,.4);
  glow(ctx,146,666,42,'238,137,62',sample.candles[1].light * .025,.5);
}

export class AmbientScene {
  constructor(canvas, transport, { reducedMotion = false } = {}) {
    this.canvas = canvas; this.transport = transport; this.reducedMotion = reducedMotion;
    this.enabled = true; this.lastFrame = -1; this.destroyed = false;
    this.context = canvas?.getContext('2d', { alpha: true });
    if (!this.context) return; // The painted plate is always a complete fallback.
    this.resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      this.width = width; this.height = height;
      const ratio = Math.min(globalThis.devicePixelRatio || 1, 1.25, Math.sqrt(1600000 / Math.max(1,width * height)));
      canvas.width = Math.max(1,Math.round(width * ratio)); canvas.height = Math.max(1,Math.round(height * ratio));
      this.ratio = ratio; this.lastFrame = -1; this.render();
    };
    this.unsubscribe = transport.subscribe(() => this.render(), 25);
    this.observer = new ResizeObserver(this.resize); this.observer.observe(canvas); this.resize();
  }
  render() {
    if (!this.context || this.destroyed) return;
    const staticMode = this.reducedMotion || !this.enabled;
    this.canvas.hidden = staticMode;
    if (staticMode || this.transport.paused) return;
    const frame = Math.floor(this.transport.now / (1000 / 30));
    if (frame === this.lastFrame) return;
    this.lastFrame = frame;
    const ctx = this.context, p = platePlacement(this.width, this.height);
    ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    ctx.setTransform(this.ratio*p.scale,0,0,this.ratio*p.scale,this.ratio*p.x,this.ratio*p.y);
    drawAmbient(ctx, sampleAmbient(this.transport.now));
    this.canvas.dataset.frame = String(frame); this.canvas.dataset.sceneMs = this.transport.now.toFixed(1);
  }
  setReducedMotion(value) { this.reducedMotion = Boolean(value); this.lastFrame = -1; this.render(); }
  setEnabled(value) { this.enabled = Boolean(value); this.lastFrame = -1; this.render(); }
  destroy() { this.destroyed = true; this.unsubscribe?.(); this.observer?.disconnect(); this.canvas?.remove(); }
}
