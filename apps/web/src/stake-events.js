import { deepFreeze } from './fixtures.js';
import { validateOutcome } from './domain.js';
import { SYMBOL_REGISTRY } from './symbol-registry.js';
import { BASE_RULES } from './m05-rules.js';
const SYMBOL_MAP = Object.freeze(Object.fromEntries(Object.keys(SYMBOL_REGISTRY).map(id=>[id,id])));
function assert(ok,message) { if(!ok)throw Error('Invalid Stake round: '+message); }
export function positionIndex(p) {
  assert(p&&Number.isInteger(p.reel)&&p.reel>=0&&p.reel<6&&Number.isInteger(p.row)&&p.row>=0&&p.row<5,'invalid symbol position');return p.reel*5+p.row;
}
function mapBoard(board) {
  assert(Array.isArray(board)&&board.length===6,'board must have six reels');
  return board.map(reel=>{assert(Array.isArray(reel)&&reel.length===5,'board reels must have five rows');return reel.map(id=>{assert(SYMBOL_REGISTRY[id],`unknown math symbol ${id}`);return id;});});
}
export function unitsToMicro(amount,betMicro) {
  assert(Number.isSafeInteger(amount)&&amount>=0,'amount must be integer units');const value=BigInt(amount)*BigInt(betMicro);
  assert(value%100n===0n,'payout cannot be represented in six-decimal currency units');const result=Number(value/100n);assert(Number.isSafeInteger(result),'payout exceeds exact currency range');return result;
}
export function mapStakeRoundToOutcome(round,options) {
  const {betMicro,currency='USD'}=options;
  assert(Number.isSafeInteger(betMicro)&&betMicro>0,'positive bet amount required');assert(round&&Array.isArray(round.state)&&round.state.length,'round.state required');
  const events=[];let cascade=0,multiplier=1,finalUnits=null,total=0,win=null;
  const emit=(type,payload={})=>events.push({index:events.length,type,...payload});
  round.state.forEach((e,index)=>{
    assert(e.index===index,'book event index mismatch');
    switch(e.type) {
      case 'reveal':emit('boardReveal',{board:mapBoard(e.board)});break;
      case 'winInfo': {
        assert(Array.isArray(e.wins)&&e.wins.length,'win groups required');
        const groups=e.wins.map(g=>({symbol:g.symbol,positions:g.positions.map(positionIndex),count:g.count??g.positions.length,threshold:g.threshold,
          baseUnits:g.meta.winWithoutMult,computedUnits:g.computedWin??g.win,paidUnits:g.win,
          baseAmount:unitsToMicro(g.meta.winWithoutMult,betMicro),computedAmount:unitsToMicro(g.computedWin??g.win,betMicro),amount:unitsToMicro(g.win,betMicro)}));
        win={cascade,amount:unitsToMicro(e.totalWin,betMicro),amountUnits:e.totalWin,baseAmount:groups.reduce((s,g)=>s+g.baseAmount,0),
          computedAmount:groups.reduce((s,g)=>s+g.computedAmount,0),multiplier:e.multiplier??multiplier,groups,
          positions:groups.flatMap(g=>g.positions).sort((a,b)=>a-b),removedPositions:(e.removedPositions??e.wins.flatMap(g=>g.positions)).map(positionIndex).sort((a,b)=>a-b),capped:e.capped??false};
        emit('win',win);total+=e.totalWin;break;
      }
      case 'updateGlobalMult':assert(win,'Potion without win');emit('multiplier',{from:e.previousGlobalMult,increment:e.increment,to:e.globalMult,potions:(e.potions??[]).map(p=>({...p,position:positionIndex(p.position)}))});multiplier=e.globalMult;break;
      case 'tumbleBoard':assert(win,'cascade without win');cascade++;assert(e.cascade===cascade,'cascade index mismatch');emit('cascade',{cascade,board:mapBoard(e.newSymbols),removedPositions:e.explodingSymbols.map(positionIndex).sort((a,b)=>a-b)});break;
      case 'updateTumbleWin':assert(e.amount===total,'running award mismatch');break;
      case 'setTotalWin':case 'setWin':assert(e.amount===total,'total award mismatch');break;
      case 'finalWin':finalUnits=e.amount;emit('finalWin',{amount:unitsToMicro(e.amount,betMicro),finalMultiplier:e.finalMultiplier??multiplier,capped:total===BASE_RULES.maxWin,capMicro:unitsToMicro(BASE_RULES.maxWin,betMicro)});break;
      default:throw Error(`Unsupported Stake BookEvent: ${e.type}`);
    }
  });
  const payout=Number.isSafeInteger(round.payoutMultiplierUnits)?round.payoutMultiplierUnits:Math.round(Number(round.payoutMultiplier)*100);
  assert(finalUnits===payout,'book finalWin must match RGS payoutMultiplier');
  return validateOutcome(deepFreeze({id:String(round.roundID),fixtureId:options.fixtureId??`stake-book-${round.bookID??round.roundID}`,contractVersion:'m05-base-1',configHash:BASE_RULES.configHash,label:options.label??'Verified base sample',currency,betMicro,payoutMicro:unitsToMicro(finalUnits,betMicro),events}));
}
export {SYMBOL_MAP};
