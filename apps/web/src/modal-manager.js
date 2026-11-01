import { easeOut } from './motion-tokens.js';

/** One owner, one focus return and one transition generation. */
export class ModalManager {
  constructor(transport, { reducedMotion = () => false, onChange = () => {} } = {}) {
    this.transport = transport; this.reducedMotion = reducedMotion; this.onChange = onChange;
    this.active = null; this.controller = null; this.generation = 0; this.state = 'CLOSED'; this.returnFocus = null;
  }
  async open(dialog, trigger = document.activeElement) {
    if (!dialog || (this.active === dialog && this.state !== 'CLOSING')) return;
    const generation = ++this.generation; this.controller?.abort();
    if (this.active && this.active !== dialog) this.active.close();
    if (!this.active) this.returnFocus = trigger;
    this.active = dialog; this.controller = new AbortController(); this.state = 'OPENING';
    if (!dialog.open) dialog.showModal(); this.onChange(true);
    try {
      await this.transport.tween(this.reducedMotion() ? 0 : 220, p => this.paint(dialog, easeOut(p)), { signal: this.controller.signal });
      if (generation === this.generation) { this.state = 'OPEN'; dialog.querySelector('[data-close],button,input')?.focus(); }
    } catch (error) { if (error.name !== 'AbortError') throw error; }
  }
  paint(dialog, progress) {
    dialog.style.opacity = String(progress); dialog.style.transform = this.reducedMotion() ? '' : `translateY(${(1 - progress) * 14}px)`;
    dialog.style.setProperty('--modal-alpha', String(progress));
  }
  async close(dialog = this.active) {
    if (!dialog || dialog !== this.active || this.state === 'CLOSING') return;
    const generation = ++this.generation; this.controller?.abort(); this.controller = new AbortController(); this.state = 'CLOSING';
    const initial = Number(dialog.style.opacity || 1);
    try {
      await this.transport.tween(this.reducedMotion() ? 0 : 160, p => this.paint(dialog, initial * (1 - p)), { signal: this.controller.signal });
      if (generation !== this.generation) return;
      dialog.close(); this.active = null; this.state = 'CLOSED'; this.onChange(false);
      if (this.returnFocus?.isConnected) this.returnFocus.focus(); this.returnFocus = null;
    } catch (error) { if (error.name !== 'AbortError') throw error; }
  }
  destroy() { this.controller?.abort(); this.active?.close(); this.active = null; this.state = 'CLOSED'; this.onChange(false); }
}
