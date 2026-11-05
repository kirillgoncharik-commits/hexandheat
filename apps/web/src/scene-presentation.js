import { createInitialState, deriveWitchState, formatMoney } from './domain.js';
import {symbolInfo} from './symbol-registry.js';
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
    this.clearField();
    this.director.beginRound(); this.state = createInitialState(); this.moodTier = 'IDLE';
    if(globalThis.document?.body)delete document.body.dataset.finalTier;
    this.elements.multiplier.textContent='×1';
    this.witch.beginRound(); this.music.setState('BASE'); this.music.beginRound?.(); this.clearAccent();
    if(this.elements.cascadeWin)this.elements.cascadeWin.textContent=formatMoney(0,this.currency(),this.locale);
    if(this.elements.cascadeLabel)this.elements.cascadeLabel.textContent='Current cascade · ×1';
    if(this.elements.potionNote)this.elements.potionNote.textContent='Potion increases only the following cascades.';
    if(this.elements.winLabel)this.elements.winLabel.textContent='Round total';
  }
  clearField() {
    this.flights?.forEach(n=>n.remove());this.flights=[];
    this.board.clearFocus?.();
    if(this.elements.groupExplanation){this.elements.groupExplanation.hidden=true;this.elements.groupExplanation.replaceChildren();}
  }
  groupLine(group,event,index) {
    const host=this.elements.groupExplanation;if(!host)return;
    const info=symbolInfo(group.symbol),image=document.createElement('img');image.src=info.asset;image.alt=info.name;
    const label=document.createElement('span');label.textContent=`${group.count} ×`;
    const formula=document.createElement('strong'),money=v=>formatMoney(v,this.currency(),this.locale);
    formula.textContent=event.capped?`${money(group.amount)} paid · CAP`:`${money(group.baseAmount)} × ${event.multiplier} = ${money(group.amount)}`;
    const order=document.createElement('small');order.textContent=`${index+1}/${event.groups.length}`;
    host.replaceChildren(label,image,formula,order);host.hidden=false;
  }
  potionFlights(event) {
    const plaque=this.elements.multiplier.closest('.cauldron-plaque');
    if(this.reducedMotion||!plaque.getBoundingClientRect||!this.board.cells)return [];
    const target=plaque.getBoundingClientRect();
    return (event.potions??[]).map(p=>{
      const cell=this.board.cells[p.position];if(!cell)return null;
      const from=cell.getBoundingClientRect(),node=document.createElement('i');node.className='potion-flight';node.dataset.position=p.position;node.setAttribute('aria-hidden','true');document.body.append(node);this.flights.push(node);
      return {node,x:from.x+from.width/2,y:from.y+from.height/2,tx:target.x+target.width/2,ty:target.y+target.height/2};
    }).filter(Boolean);
  }
  clearAccent() {
    const plaque = this.elements.multiplier.closest('.cauldron-plaque');
    plaque.style.setProperty?.('--impact','0');
    plaque.style.filter = ''; plaque.style.transform = ''; this.elements.witchStage.style.setProperty('--potion-impact', '0');
  }
  setReducedMotion(value) { this.reducedMotion = Boolean(value); this.board.reducedMotion = this.reducedMotion; }
  renderNumbers(state) {
    this.elements.win.textContent = formatMoney(state.winMicro, this.currency(), this.locale);
    this.elements.multiplier.textContent = `×${state.multiplier}`;
    this.elements.debugMultiplier.textContent = `×${state.multiplier}`;
  }
  commit(state) { this.clearField();this.board.render(state); this.renderNumbers(state); this.state = state; }
  async event(event, state, outcome, speed) {
    const previous = this.state; const tokens = MOTION[speed] ?? MOTION.normal; const generation = this.director.generation;
    const id = `round-${this.director.generation}/event-${event.index}/${event.type}`;
    const groupDuration=event.groups?.length?tokens.count+tokens.focus+tokens.groupRead*event.groups.length:null;
    const duration = event.type === 'cascade' ? tokens.remove + tokens.fall + 5 * tokens.stagger+tokens.settle : event.type==='win'&&groupDuration?groupDuration:tokens[event.type === 'boardReveal' ? 'reveal' : event.type] ?? 450;
    try { await this.director.run({ id, duration, fallback: () => this.commit(state), required: [async signal => {
      this.director.record('marker', { id, marker: event.type === 'multiplier' ? 'potion.impact' : event.type + '.start' });
      this.explain(event,state);
      this.witch.onEvent(event, outcome);
      const tier = deriveWitchState(event, outcome);
      if (tier && TIER_PRIORITY[tier] > TIER_PRIORITY[this.moodTier]) { this.moodTier = tier; this.music.setState(moodForTier(tier)); }
      if (event.type === 'finalWin' && !event.amount) this.music.setState('BASE');
      if (event.type === 'win' || event.type === 'multiplier') this.music.playOneShot(event.type === 'win' ? 'WIN' : 'POTION', { key: id, sceneAt: this.transport.now });
      if(event.type!=='win'&&event.type!=='multiplier')this.clearField();
      if (event.type === 'boardReveal') {
        this.music.playOneShot('REVEAL',{key:id,sceneAt:this.transport.now});
        this.renderNumbers(state); await this.board.reveal(state, tokens, signal);
      } else if (event.type === 'cascade') {
        this.music.playOneShot('DISSOLVE',{key:id+'/remove',sceneAt:this.transport.now});
        await this.board.cascade(previous, state, tokens, signal, (type, data) => this.director.record(type, { id, ...data }));
        this.music.playOneShot('LAND',{key:id+'/land',sceneAt:this.transport.now});
        await this.transport.wait(tokens.settle,{signal});
      } else {
        this.board.render(state);
        if(event.type==='win'&&event.groups?.length)this.board.focusGroups?.(event.groups);
        const flights=event.type==='multiplier'?this.potionFlights(event):[];
        const from = previous.winMicro; const plaque = this.elements.multiplier.closest('.cauldron-plaque');
        const countMs = Math.max(0, Math.min(tokens.count, duration - tokens.read));
        await this.transport.tween(event.type === 'win' ? countMs : duration, p => {
          const shown = event.type === 'win' ? Math.round(from + (state.winMicro - from) * easeOut(p)) : state.winMicro;
          this.renderNumbers({ ...state, winMicro: shown, multiplier:event.type==='multiplier'&&p<.8?event.from:state.multiplier });
          if (event.type === 'multiplier') {
            for(const f of flights){const q=Math.min(1,p/.8);const x=f.x+(f.tx-f.x)*q,y=f.y+(f.ty-f.y)*q-Math.sin(q*Math.PI)*35;f.node.style.transform=`translate(${x-5}px,${y-5}px) scale(${1-q*.4})`;f.node.style.opacity=String(p>.85?0:1);}
            const strength = p<.7?0:Math.sin((p-.7)/.3*Math.PI);
            plaque.style.setProperty?.('--impact',String(strength));
            plaque.style.filter = `drop-shadow(0 0 ${strength * 22}px #78e4ba)`;
            plaque.style.transform = this.reducedMotion ? '' : `scale(${1 + strength * 0.035})`;
            this.elements.witchStage.style.setProperty('--potion-impact', String(strength));
          }
        }, { signal });
        // Readability begins when the final number was actually committed,
        // even if a slow renderer skipped the intended count-up frames.
        if (event.type === 'win'&&event.groups?.length) {
          this.director.record('field.paid',{id,paid:event.amount,total:state.winMicro});
          await this.transport.tween(tokens.focus,p=>this.board.pulse?.(Math.sin(p*Math.PI)),{signal});
          for(let i=0;i<event.groups.length;i++){
            this.board.focusGroups?.(event.groups,i);this.groupLine(event.groups[i],event,i);
            this.director.record('field.group',{id,group:i,symbol:event.groups[i].symbol,positions:event.groups[i].positions,paid:event.groups[i].amount});
            await this.transport.wait(tokens.groupRead,{signal});
          }
          this.board.focusGroups?.(event.groups);
        } else if (event.type === 'win') await this.transport.wait(duration - countMs, { signal });
        if(event.type==='multiplier'){this.flights.forEach(n=>n.remove());this.flights=[];this.director.record('field.potionImpact',{id,from:event.from,to:event.to,positions:event.potions?.map(p=>p.position)});}
        if(event.type==='finalWin'){
          this.director.record('field.final',{id,paid:event.amount});
          const ratio=event.amount/outcome.betMicro,tier=event.capped?'cap':!event.amount?'loss':ratio<1?'return':ratio<4?'small':ratio<10?'medium':'big';
          if(globalThis.document?.body)document.body.dataset.finalTier=tier;
          if(event.amount)this.music.playOneShot(tier==='big'||tier==='cap'?'BIG':tier==='medium'?'MEDIUM':'SOFT',{key:id+'/final',sceneAt:this.transport.now});
        }
        if (event.type === 'multiplier') { plaque.style.filter = ''; plaque.style.transform = ''; this.elements.witchStage.style.setProperty('--potion-impact', '0'); }
      }
      if (signal.aborted) throw new DOMException('Cue aborted', 'AbortError');
      if(event.type==='finalWin')for(const cell of this.board.cells??[])cell.classList.remove('is-potion-active');
      this.renderNumbers(state); this.state = state;
    }] }); } finally { if (generation === this.director.generation) {this.clearAccent();this.flights?.forEach(n=>n.remove());this.flights=[];} }
  }
  explain(event,state) {
    const money=value=>formatMoney(value,this.currency(),this.locale),e=this.elements;
    if(event.type==='win'&&e.cascadeWin) {
      e.cascadeWin.textContent=money(event.amount);e.cascadeLabel.textContent=`Cascade ${event.cascade+1} · ×${event.multiplier??state.multiplier}`;
      if(event.capped)e.potionNote.textContent='Cap reached · paid amount limited to 5000× for the whole round.';
      const details=document.querySelector('#round-details');
      if(details&&event.groups){const p=document.createElement('p');p.textContent=`Cascade ${event.cascade+1}: `+event.groups.map(g=>`${g.symbol} × ${g.count}: ${money(g.baseAmount)} × ${event.multiplier} = ${money(g.computedAmount)} computed; ${money(g.amount)} paid`).join('; ')+`. Paid ${money(event.amount)}; round total ${money(state.winMicro)}${event.capped?' · CAP':''}`;details.append(p);}
    }
    if(event.type==='multiplier'&&e.groupExplanation)e.groupExplanation.hidden=true;
    if(event.type==='multiplier'&&e.potionNote)e.potionNote.textContent=`×${event.from} → ×${event.to} · +${event.increment} for following cascades. Previous award stays the same.`;
    if(event.type==='finalWin'&&e.winLabel){e.winLabel.textContent=event.capped?'Final · CAP 5000×':!event.amount?'Round complete':'Final paid';if(!event.amount){e.potionNote.textContent='No win · any Potion stays inactive.';if(e.cascadeLabel)e.cascadeLabel.textContent='No cascade win';}}
  }
  destroy() { this.director.cancel();this.clearField(); this.unsubscribe(); }
}
