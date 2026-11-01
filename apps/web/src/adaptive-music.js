export const MUSIC_STATES = Object.freeze({ BASE: "BASE", ENERGY: "ENERGY", HOT: "HOT", BONUS: "BONUS" });

const TARGETS = Object.freeze({
  BASE: Object.freeze([0.07, 0, 0]),
  ENERGY: Object.freeze([0.07, 0.045, 0]),
  HOT: Object.freeze([0.07, 0.055, 0.035]),
  BONUS: Object.freeze([0.06, 0.055, 0.045])
});

/** Temporary oscillator stems proving beat-aligned Web Audio control. */
export class AdaptiveMusicController {
  constructor({
    contextFactory = () => new (globalThis.AudioContext ?? globalThis.webkitAudioContext)(),
    bpm = 120,
    onError = () => {},
    transport = null
  } = {}) {
    this.contextFactory = contextFactory;
    this.bpm = bpm;
    this.onError = onError;
    this.transport = transport;
    this.ducked = false;
    this.hidden = false;
    this.oneShots = new Set();
    this.played = new Set();
    this.context = null;
    this.master = null;
    this.stems = [];
    this.state = MUSIC_STATES.BASE;
    this.muted = false;
    this.started = false;
    this.failed = false;
  }

  nextBeat() {
    if (this.transport) {
      const beatMs = 60000 / this.bpm;
      let sceneAt = (Math.floor(this.transport.now / beatMs) + 1) * beatMs;
      let at = this.sceneTimeToAudio(sceneAt);
      while (at < this.context.currentTime + 0.01) { sceneAt += beatMs; at = this.sceneTimeToAudio(sceneAt); }
      return at;
    }
    const beat = 60 / this.bpm;
    return Math.ceil((this.context.currentTime + 0.01) / beat) * beat;
  }

  sceneTimeToAudio(sceneAt) {
    if (!this.transport) return this.context.currentTime;
    const ts = this.context.getOutputTimestamp?.();
    if (ts?.performanceTime > 0) {
      const performanceAt = this.transport.wallNow() + sceneAt - this.transport.now;
      return ts.contextTime + (performanceAt - ts.performanceTime) / 1000;
    }
    return this.context.currentTime + (sceneAt - this.transport.now) / 1000;
  }

  beginRound() { this.played.clear(); this.stopOneShots(); }
  stopOneShots() { for (const node of this.oneShots) { try { node.stop(); } catch {} } this.oneShots.clear(); }

  async unlock() {
    if (this.failed) return false;
    try {
      if (!this.context) {
        this.context = this.contextFactory();
        this.master = this.context.createGain();
        this.master.gain.value = this.muted ? 0 : 1;
        this.master.connect(this.context.destination);
        const startAt = this.nextBeat();
        this.stems = [110, 165, 220].map((frequency, index) => {
          const oscillator = this.context.createOscillator();
          const gain = this.context.createGain();
          oscillator.type = index === 2 ? "triangle" : "sine";
          oscillator.frequency.value = frequency;
          gain.gain.value = TARGETS.BASE[index];
          oscillator.connect(gain);
          gain.connect(this.master);
          oscillator.start(startAt);
          return { oscillator, gain };
        });
        this.started = true;
      }
      if (this.context.state === "suspended") await this.context.resume();
      return true;
    } catch (error) {
      this.failed = true;
      this.onError(error);
      return false;
    }
  }

  setState(state) {
    if (!(state in TARGETS)) throw new Error(`Unknown music state: ${state}`);
    this.state = state;
    if (!this.started || this.failed) return;
    const changeAt = this.nextBeat();
    TARGETS[state].forEach((target, index) => {
      const parameter = this.stems[index].gain.gain;
      if (parameter.cancelAndHoldAtTime) parameter.cancelAndHoldAtTime(this.context.currentTime);
      else { parameter.cancelScheduledValues(changeAt); parameter.setValueAtTime(parameter.value, changeAt); }
      parameter.linearRampToValueAtTime(target, changeAt + 0.12);
    });
  }

  playOneShot(kind, { key = null, sceneAt = this.transport?.now } = {}) {
    if (key && this.played.has(key)) return;
    if (key) this.played.add(key);
    if (!this.started || this.failed || this.muted || this.hidden || this.context.state === 'suspended') return;
    if (this.transport && sceneAt < this.transport.now - 80) return;
    try {
      const now = Math.max(this.context.currentTime + 0.008, sceneAt === undefined ? this.context.currentTime : this.sceneTimeToAudio(sceneAt));
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.frequency.value = kind === "POTION" ? 660 : 440;
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      oscillator.connect(gain);
      gain.connect(this.master);
      oscillator.start(now);
      oscillator.stop(now + 0.15);
      this.oneShots.add(oscillator); oscillator.onended = () => { this.oneShots.delete(oscillator); oscillator.disconnect?.(); gain.disconnect?.(); };
    } catch (error) {
      this.onError(error);
    }
  }

  onEvent(event, outcome) {
    if (event?.type === "bonusStart") this.setState(MUSIC_STATES.BONUS);
    if (event?.type === "multiplier") {
      this.playOneShot("POTION");
      this.setState(event.to >= 4 ? MUSIC_STATES.HOT : MUSIC_STATES.ENERGY);
    }
    if (event?.type === "win") {
      this.playOneShot("WIN");
      const ratio = outcome?.betMicro > 0 ? event.amount / outcome.betMicro : 0;
      if (ratio >= 10) this.setState(MUSIC_STATES.HOT);
      else if (ratio >= 2 && this.state === MUSIC_STATES.BASE) this.setState(MUSIC_STATES.ENERGY);
    }
    if (event?.type === "finalWin" && event.amount === 0) this.setState(MUSIC_STATES.BASE);
  }

  mute(value) {
    this.muted = Boolean(value);
    if (!this.master || !this.context) return;
    const now = this.context.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.linearRampToValueAtTime(this.muted || this.hidden ? 0 : this.ducked ? 0.45 : 1, now + 0.05);
  }

  duck(value) { this.ducked = Boolean(value); this.mute(this.muted); }
  suspend() { this.hidden = true; this.stopOneShots(); this.mute(this.muted); this.context?.suspend?.().catch(this.onError); }

  async restore() {
    this.hidden = false;
    if (!this.context || this.failed) return false;
    try {
      if (this.context.state === "suspended") await this.context.resume();
      this.setState(this.state);
      this.mute(this.muted);
      return true;
    } catch (error) {
      this.onError(error);
      return false;
    }
  }

  destroy() {
    this.stopOneShots();
    for (const stem of this.stems) {
      try { stem.oscillator.stop(); } catch { /* already stopped */ }
    }
    this.stems = [];
    this.started = false;
    this.context?.close?.();
  }
}
