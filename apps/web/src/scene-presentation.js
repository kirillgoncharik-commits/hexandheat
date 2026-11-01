import { createInitialState, deriveWitchState, formatMoney } from './domain.js';
import { MOTION, moodForTier, easeOut, TIER_PRIORITY } from './motion-tokens.js';

export class ScenePresentation {
  constructor({ transport, director, board, witch, music, elements, currency = () => 'USD', locale = 'en-US' }) {
    Object.assign(this, { transport, director, board, witch, music, elements, currency, locale });
    this.state = createInitialState(); this.reducedMotion = false;
    this.unsubscribe = transport.subscribe(({ phaseMs }) => {
      elements.witchStage.style.setProperty('--scene-breath', String(0.5 + Math.sin(phaseMs / 4000 * Math.PI * 2) * 0.2));
    }, 20);
  }
  begin() {
    this.director.beginRound(); this.state = createInitialState(); this.moodTier = 'IDLE';
    this.witch.beginRound(); this.music.setState('BASE'); this.music.beginRound?.(); this.clearAccent();
  }
  clearAccent() {
    const plaque = this.elements.multiplier.closest('.cauldron-plaque');
    plaque.style.filter = ''; plaque.style.transform = ''; this.elements.witchStage.style.setProperty('--potion-impact', '0');
  }
  setReducedMotion(value) { this.reducedMotion = Boolean(value); this.board.reducedMotion = this.reducedMotion; }
  renderNumbers(state) {
    this.elements.win.textContent = formatMoney(state.winMicro, this.currency(), this.locale);
    this.elements.multiplier.textContent = `×${state.multiplier}`;
    this.elements.debugMultiplier.textContent = `×${state.multiplier}`;
  }
  commit(state) { this.board.render(state); this.renderNumbers(state); this.state = state; }
  async event(event, state, outcome, speed) {
    const previous = this.state; const tokens = MOTION[speed] ?? MOTION.normal; const generation = this.director.generation;
    const id = `round-${this.director.generation}/event-${event.index}/${event.type}`;
    const duration = event.type === 'cascade' ? tokens.remove + tokens.fall + 5 * tokens.stagger : tokens[event.type === 'boardReveal' ? 'reveal' : event.type] ?? 450;
    try { await this.director.run({ id, duration, fallback: () => this.commit(state), required: [async signal => {
      this.director.record('marker', { id, marker: event.type === 'multiplier' ? 'potion.impact' : event.type + '.start' });
      this.witch.onEvent(event, outcome);
      const tier = deriveWitchState(event, outcome);
      if (tier && TIER_PRIORITY[tier] > TIER_PRIORITY[this.moodTier]) { this.moodTier = tier; this.music.setState(moodForTier(tier)); }
      if (event.type === 'finalWin' && !event.amount) this.music.setState('BASE');
      if (event.type === 'win' || event.type === 'multiplier') this.music.playOneShot(event.type === 'win' ? 'WIN' : 'POTION', { key: id, sceneAt: this.transport.now });
      if (event.type === 'boardReveal') {
        this.renderNumbers(state); await this.board.reveal(state, tokens, signal);
      } else if (event.type === 'cascade') {
        await this.board.cascade(previous, state, tokens, signal, (type, data) => this.director.record(type, { id, ...data }));
      } else {
        this.board.render(state);
        const from = previous.winMicro; const plaque = this.elements.multiplier.closest('.cauldron-plaque');
        const countMs = Math.max(0, Math.min(tokens.count, duration - tokens.read));
        await this.transport.tween(event.type === 'win' ? countMs : duration, p => {
          const shown = event.type === 'win' ? Math.round(from + (state.winMicro - from) * easeOut(p)) : state.winMicro;
          this.renderNumbers({ ...state, winMicro: shown });
          if (event.type === 'multiplier') {
            const strength = Math.sin(p * Math.PI);
            plaque.style.filter = `drop-shadow(0 0 ${strength * 22}px #78e4ba)`;
            plaque.style.transform = this.reducedMotion ? '' : `scale(${1 + strength * 0.035})`;
            this.elements.witchStage.style.setProperty('--potion-impact', String(strength));
          }
        }, { signal });
        // Readability begins when the final number was actually committed,
        // even if a slow renderer skipped the intended count-up frames.
        if (event.type === 'win') await this.transport.wait(duration - countMs, { signal });
        if (event.type === 'multiplier') { plaque.style.filter = ''; plaque.style.transform = ''; this.elements.witchStage.style.setProperty('--potion-impact', '0'); }
      }
      if (signal.aborted) throw new DOMException('Cue aborted', 'AbortError');
      this.renderNumbers(state); this.state = state;
    }] }); } finally { if (generation === this.director.generation) this.clearAccent(); }
  }
  destroy() { this.director.cancel(); this.unsubscribe(); }
}
