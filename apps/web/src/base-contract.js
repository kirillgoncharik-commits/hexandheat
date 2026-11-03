import {SYMBOL_REGISTRY} from './symbol-registry.js';
import {BASE_RULES as R} from './m05-rules.js';
const need=(ok,text)=>{if(!ok)throw Error('Invalid base contract: '+text);};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const positions=p=>Array.isArray(p)&&p.every(v=>Number.isInteger(v)&&v>=0&&v<30)&&new Set(p).size===p.length;
export function validateBaseOutcome(outcome) {
  need(outcome.configHash===R.configHash,'config hash');
  let board,win=null,multiplier=1,total=0,expected='boardReveal',cascade=0,potionSeen=false;
  for(const e of outcome.events) {
    if(e.type==='boardReveal'||e.type==='cascade') {
      need(e.type===expected,'board event order');
      if(e.type==='cascade') {
        need(e.cascade===++cascade,'cascade continuity');need(same(e.removedPositions,win.removedPositions),'removal set mismatch');
        for(let col=0;col<6;col++) {const survivors=board[col].filter((_,row)=>!e.removedPositions.includes(col*5+row));need(!survivors.length||same(e.board[col].slice(-survivors.length),survivors),'authoritative gravity');}
      }
      need(e.board.flat().every(id=>SYMBOL_REGISTRY[id]),'unknown symbol');board=e.board;expected='evaluation';win=null;
    } else if(e.type==='win') {
      need(expected==='evaluation','win order');need(e.cascade===cascade,'win cascade');need(e.multiplier===multiplier,'applied multiplier');need(positions(e.positions)&&positions(e.removedPositions),'invalid positions');need(Array.isArray(e.groups)&&e.groups.length,'missing groups');
      const all=[];let paid=0,computed=0;
      const expectedIds=R.symbolWeights.map(s=>s.symbol).filter(s=>SYMBOL_REGISTRY[s].paytableKey&&board.flat().filter(v=>v===s).length>=8);
      need(same(e.groups.map(g=>g.symbol),expectedIds),'all simultaneous groups required');
      for(const g of e.groups) {
        need(SYMBOL_REGISTRY[g.symbol]?.paytableKey,'unknown group symbol');need(positions(g.positions),'group position');
        const exact=board.flat().flatMap((s,i)=>s===g.symbol?[i]:[]);need(same(exact,g.positions)&&g.count===exact.length&&exact.length>=8,'group identity/count');
        const award=R.paytable.filter(a=>a.symbol===g.symbol&&a.threshold<=g.count).at(-1);need(award&&g.baseUnits===award.amount&&g.threshold===award.threshold,'paytable metadata');need(g.computedUnits===g.baseUnits*multiplier,'computed group');
        need(g.computedAmount*100===g.computedUnits*outcome.betMicro&&g.amount*100===g.paidUnits*outcome.betMicro,'group unit conversion');need(Number.isSafeInteger(g.amount)&&g.amount>=0&&g.amount<=g.computedAmount,'paid group');all.push(...g.positions);paid+=g.amount;computed+=g.computedAmount;
      }
      need(same([...all].sort((a,b)=>a-b),e.positions),'paid positions');
      need(e.baseAmount===e.groups.reduce((s,g)=>s+g.baseAmount,0),'base group sum');
      const potions=board.flat().flatMap((s,i)=>SYMBOL_REGISTRY[s].increment?[i]:[]);need(same([...e.positions,...potions].sort((a,b)=>a-b),e.removedPositions),'removed Potion union');need(paid===e.amount&&computed===e.computedAmount,'cascade group sum');
      const cap=outcome.betMicro*R.maxWin/100;need(e.amount===Math.min(computed,cap-total)&&e.capped===(e.amount<computed),'paid cap');total+=e.amount;win=e;potionSeen=false;expected=potions.length?'multiplier':total===cap?'finalWin':'cascade';
    } else if(e.type==='multiplier') {
      need(expected==='multiplier'&&!potionSeen,'Potion order');const exact=board.flat().flatMap((symbol,position)=>SYMBOL_REGISTRY[symbol].increment?[{symbol,position,increment:SYMBOL_REGISTRY[symbol].increment}]:[]);
      need(same(e.potions.map(p=>[p.symbol,p.position,p.increment]),exact.map(p=>[p.symbol,p.position,p.increment])),'Potion IDs/values/positions');need(e.increment===exact.reduce((s,p)=>s+p.increment,0)&&e.from===multiplier,'Potion continuity');multiplier=e.to;potionSeen=true;expected=total===outcome.betMicro*R.maxWin/100?'finalWin':'cascade';
    } else if(e.type==='finalWin') {
      need(expected==='finalWin'||expected==='evaluation','premature final');if(expected==='evaluation')need(!R.symbolWeights.filter(s=>SYMBOL_REGISTRY[s.symbol].paytableKey).some(s=>board.flat().filter(v=>v===s.symbol).length>=8),'unpaid terminal group');
      need(e.amount===total&&e.amount===outcome.payoutMicro,'terminal sum');need(e.finalMultiplier===multiplier,'final multiplier');need(e.capped===(total===e.capMicro)&&e.capMicro===outcome.betMicro*R.maxWin/100,'final cap');expected='done';
    }
  }
  need(expected==='done','incomplete outcome');return outcome;
}
