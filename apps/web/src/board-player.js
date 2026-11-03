import { easeOut } from './motion-tokens.js';
import {SYMBOL_REGISTRY, LEGACY_SYMBOLS, symbolInfo} from './symbol-registry.js';

/** Preserve only server-compatible survivors. Never infer a different target board. */
export function planColumn(before, after, removedRows = []) {
  const survivors = before.map((symbol, row) => ({ symbol, row })).filter(v => !removedRows.includes(v.row));
  const offset = after.length - survivors.length;
  const compatible = offset >= 0 && survivors.every((v, i) => v.symbol === after[offset + i]);
  return { compatible, cells: after.map((symbol, row) => ({ symbol, row, from: compatible && row >= offset ? survivors[row - offset].row : null })) };
}

/** Persistent DOM symbols; one transport drives transforms and commits. */
export class BoardPlayer {
  constructor(element, transport) { this.element = element; this.transport = transport; this.cells = []; this.serial = 0; this.reducedMotion = false; }
  async prepare() {
    this.failedArt = new Set();
    await Promise.all(Object.entries({...SYMBOL_REGISTRY,...Object.fromEntries(Object.entries(LEGACY_SYMBOLS).map(([a,b])=>[a,SYMBOL_REGISTRY[b]]))}).map(async ([symbol, info]) => {
      const image = new Image(); image.src = info.asset;
      let timer;
      try { await Promise.race([image.decode(), new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Asset deadline')), 1500); })]); }
      catch { this.failedArt.add(symbol); }
      finally { clearTimeout(timer); }
    }));
  }
  make(symbol, position) {
    const node = document.createElement('div'); node.className = `symbol symbol-${symbol}`;
    const info = symbolInfo(symbol); if (!info) throw Error('Unknown visual symbol '+symbol);
    node.dataset.shape = info.shape;
    node.dataset.instance = `symbol-${++this.serial}`; node.dataset.symbol = symbol; node.setAttribute('role', 'gridcell');
    const art = document.createElement('img'); art.src = info.asset; art.alt = ''; node.append(art);
    const fallback=document.createElement('span');fallback.className='symbol-fallback';fallback.textContent=info.fallback;fallback.hidden=true;node.append(fallback);
    const badge=document.createElement('b');badge.className='symbol-badge';badge.textContent=info.increment?`+${info.increment}`:symbol;node.append(badge);
    const degrade=()=>{art.hidden=true;fallback.hidden=false;node.dataset.degraded='true';};
    art.addEventListener('error', degrade, {once:true});if(this.failedArt?.has(symbol))degrade();
    this.place(node, position); return node;
  }
  place(node, position) {
    node.dataset.position = String(position); node.style.gridColumn = String(Math.floor(position / 5) + 1); node.style.gridRow = String(position % 5 + 1);
    node.setAttribute('aria-label', `${node.dataset.symbol} ${symbolInfo(node.dataset.symbol)?.name}, column ${Math.floor(position / 5) + 1}, row ${position % 5 + 1}`);
  }
  render(state) {
    if (!state.board) return;
    for (let col = 0; col < 6; col++) for (let row = 0; row < 5; row++) {
      const p = col * 5 + row; const symbol = state.board[col][row]; let cell = this.cells[p];
      if (!cell || cell.dataset.symbol !== symbol) {
        const next = this.make(symbol, p); cell?.remove(); this.element.append(next); this.cells[p] = cell = next;
      }
      cell.classList.toggle('is-winning', state.highlightedPositions.includes(p));
      cell.classList.toggle('is-potion-active', state.activatedPotions?.some(v=>v.position===p)??false);
      cell.style.opacity = ''; cell.style.transform = '';
    }
  }
  async reveal(state, tokens, signal) {
    this.render(state);
    await this.transport.tween(tokens.reveal, p => {
      this.cells.forEach((cell, i) => {
        const q = easeOut(Math.max(0, Math.min(1, (p - Math.floor(i / 5) * 0.035) / 0.825)));
        cell.style.opacity = String(this.reducedMotion ? 1 : q);
        cell.style.transform = this.reducedMotion ? '' : `translateY(${(1 - q) * -32}px)`;
      });
    }, { signal });
    this.render(state);
  }
  async cascade(previous, next, tokens, signal, record = () => {}) {
    const startAt = this.transport.now;
    const removed = new Set(previous.removedPositions ?? previous.highlightedPositions); const oldCells = [...this.cells];
    await this.transport.tween(tokens.remove, p => {
      for (const position of removed) {
        const cell = oldCells[position];
        if (cell) { cell.style.opacity = String(1 - p); cell.style.transform = this.reducedMotion ? '' : `scale(${1 - p * 0.15})`; }
      }
    }, { signal, startAt });
    if (signal?.aborted) throw new DOMException('Cascade aborted', 'AbortError');
    const moves = []; const retained = new Set();
    const rowHeight = this.element.clientHeight / 5;
    for (let col = 0; col < 6; col++) {
      const plan = planColumn(previous.board[col], next.board[col], [...removed].filter(p => Math.floor(p / 5) === col).map(p => p % 5));
      if (!plan.compatible) record('board.reconcile', { column: col, reason: 'legacy showcase target has no compatible survivor suffix' });
      for (const cellPlan of plan.cells) {
        const position = col * 5 + cellPlan.row;
        const node = cellPlan.from === null ? this.make(cellPlan.symbol, position) : oldCells[col * 5 + cellPlan.from];
        retained.add(node); this.place(node, position); node.classList.remove('is-winning');
        this.cells[position] = node; this.element.append(node);
        const offset = cellPlan.from === null ? -(cellPlan.row + 1) * rowHeight : (cellPlan.from - cellPlan.row) * rowHeight;
        moves.push({ node, offset, col });
      }
    }
    oldCells.filter(node => !retained.has(node)).forEach(node => node.remove());
    const duration = tokens.fall + 5 * tokens.stagger;
    await this.transport.tween(duration, p => {
      for (const move of moves) {
        const local = Math.max(0, Math.min(1, (p * duration - move.col * tokens.stagger) / tokens.fall));
        move.node.style.transform = this.reducedMotion ? '' : `translateY(${move.offset * (1 - easeOut(local))}px)`;
        move.node.style.opacity = String(this.reducedMotion ? 1 : Math.min(1, local * 4));
      }
    }, { signal, startAt: startAt + tokens.remove });
    this.render(next); record('board.settled');
  }
}
