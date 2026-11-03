import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ReviewRgs} from '../src/review-rgs.js';
import {SYMBOL_REGISTRY} from '../src/symbol-registry.js';
import {mapStakeRoundToOutcome} from '../src/stake-events.js';
import {playOutcome,validateOutcome,formatMoney} from '../src/domain.js';
import {planColumn} from '../src/board-player.js';
import {SceneTransport} from '../src/scene-transport.js';
import {CueDirector} from '../src/cue-director.js';
import {ScenePresentation} from '../src/scene-presentation.js';
import {WitchDanceController} from '../src/witch-dance.js';
const catalog=JSON.parse(readFileSync(new URL('../assets/m05/fixtures.json',import.meta.url)));
const rgs=new ReviewRgs({catalog});
const flush=async()=>{for(let n=0;n<12;n++)await Promise.resolve();};

test('M05 F01–F12: original math IDs, every group, exact payout and authoritative removals survive the complete mapping',async()=>{
  assert.equal(Object.keys(SYMBOL_REGISTRY).length,12);assert.equal(new Set(Object.values(SYMBOL_REGISTRY).filter(s=>s.paytableKey).map(s=>s.asset)).size,9);
  for(const c of catalog.cases){
    const o=rgs.outcome(c.id,c.betMicro);let i=0;
    for(const e of c.expected.events){
      const mapped=o.events[i++];assert.equal(mapped.type,e.type);
      if(e.board)assert.deepEqual(mapped.board,e.board);
      if(e.type==='win'){assert.deepEqual(mapped.positions,e.positions);assert.deepEqual(mapped.removedPositions,e.removedPositions);assert.equal(mapped.multiplier,e.multiplier);assert.deepEqual(mapped.groups.map(g=>g.symbol),e.groups.map(g=>g.symbol));assert.equal(mapped.amount,e.amount*c.betMicro/100);assert.equal(mapped.groups.reduce((s,g)=>s+g.amount,0),mapped.amount);}
      if(e.type==='multiplier')assert.deepEqual(mapped.potions,e.potions);
    }
    const snapshots=[];for(const speed of ['normal','fast'])snapshots.push(await playOutcome(o,{speed,delay:async()=>{}}));assert.deepEqual(...snapshots);
    assert.equal(snapshots[0].winMicro,c.expected.payoutUnits*c.betMicro/100);
  }
});

test('F05, F08, F09, F11 and F12 retain their boundary meanings',async()=>{
  const o=id=>rgs.outcome(id,catalog.cases.find(c=>c.id===id).betMicro);
  assert.equal(o('F05').payoutMicro,0);assert.ok(!o('F08').events.some(e=>e.type==='multiplier'));
  const last=o('F09');assert.equal(last.payoutMicro,200000);assert.equal(last.events.find(e=>e.type==='win').multiplier,1);assert.equal(last.events.at(-1).finalMultiplier,3);
  const cap=o('F11'),capped=cap.events.find(e=>e.capped&&e.type==='win');assert.ok(capped.computedAmount>capped.amount);assert.equal(cap.payoutMicro,5000000000);
  assert.equal(formatMoney(o('F12').payoutMicro,'USD','en-US'),'$0.002');assert.equal(formatMoney(1000,'USD','en-US'),'$0.001');assert.equal(formatMoney(1,'USD','en-US'),'$0.000001');assert.match(formatMoney(123456789012345,'USD','en-US'),/123,456,789\.012345/);
  assert.equal(formatMoney(Number.MAX_SAFE_INTEGER,'USD','en-US'),'$9,007,199,254.740991');assert.equal(formatMoney(-1,'USD','en-US'),'-$0.000001');
});

test('F13 rejects unknown IDs/events, row aliasing, indices, groups, Potion reuse and payout mutation',()=>{
  const base=catalog.cases.find(c=>c.id==='F06');
  const mutations=[b=>b.events[0].board[0][0]='UNKNOWN',b=>b.events[1].type='mystery',b=>b.events[1].wins[0].positions[0]={reel:0,row:5},b=>b.events[1].wins[0].positions[0]={reel:-1,row:5},b=>b.events[1].index=100,b=>b.events.find(e=>e.type==='updateGlobalMult').increment++,b=>b.events.find(e=>e.type==='tumbleBoard').explodingSymbols.pop(),b=>b.events[1].wins=[],b=>b.events.at(-1).amount++];
  for(const mutate of mutations){const b=structuredClone(base.book);mutate(b);assert.throws(()=>mapStakeRoundToOutcome({roundID:'bad',state:b.events,payoutMultiplierUnits:b.payoutMultiplier},{betMicro:base.betMicro}));}
  const o=structuredClone(rgs.outcome('F06',1000000));o.events.find(e=>e.type==='multiplier').potions[0].position=0;assert.throws(()=>validateOutcome(o),/Potion/);
});

test('Potion removal uses authoritative union; survivors never keep the activated bottle',()=>{
  const o=rgs.outcome('F06',1000000);let board=o.events[0].board,removed=[];
  for(const e of o.events){if(e.type==='win')removed=e.removedPositions;if(e.type==='cascade'){for(let col=0;col<6;col++){const plan=planColumn(board[col],e.board[col],removed.filter(p=>Math.floor(p/5)===col).map(p=>p%5));assert.equal(plan.compatible,true);for(const cell of plan.cells)if(cell.from!==null)assert.ok(!removed.includes(col*5+cell.from));}board=e.board;}}
});

test('F01–F12 real CueDirector agrees in Normal/Fast/Reduced/local replay with pause and 200ms jank',async()=>{
  for(const c of catalog.cases)for(const mode of ['normal','fast','reduced','replay']){
    let wall=0;const transport=new SceneTransport({now:()=>wall,requestFrame:()=>1,cancelFrame:()=>{}}),director=new CueDirector(transport);let boardState;
    const board={render:s=>boardState=s,reveal:async(s,t,signal)=>{await transport.wait(t.reveal,{signal});boardState=s;},cascade:async(a,s,t,signal)=>{await transport.wait(t.remove+t.fall,{signal});boardState=s;}};
    const style={setProperty(){}};const elements={win:{},multiplier:{closest:()=>({style:{}})},debugMultiplier:{},witchStage:{style}};
    const witch=new WitchDanceController({transport});witch.start();
    const p=new ScenePresentation({transport,director,board,witch,music:{setState(){},playOneShot(){},beginRound(){}},elements});p.setReducedMotion(mode==='reduced');p.begin();const o=rgs.outcome(c.id,c.betMicro);
    let done=false,error;const task=playOutcome(o,{delay:async()=>{},onEvent:(e,s)=>p.event(e,s,o,mode==='fast'?'fast':'normal')}).then(()=>done=true,e=>{done=true;error=e;});
    for(let n=0;n<2000&&!done;n++){await flush();wall+=n===4?200:50;if(n===3){transport.pause('visibility');wall+=1000;transport.tick(wall);transport.resume('visibility');}transport.tick(wall);}
    await task;if(error)throw error;assert.ok(done);assert.equal(boardState.winMicro,o.payoutMicro);assert.equal(boardState.multiplier,o.events.at(-1).finalMultiplier);assert.ok(!director.trace.some(t=>t.type==='cue.fallback'));p.destroy();witch.destroy();assert.equal(transport.listeners.size,0);
  }
});

test('F14 Normal/Fast: a new loss clears pending/one-shot ownership without cutting the active body',async()=>{
  for(const speed of ['normal','fast']){
    let wall=0;const t=new SceneTransport({now:()=>wall,requestFrame:()=>1,cancelFrame:()=>{}});const w=new WitchDanceController({transport:t});w.start();w.beginRound();w.request('SMALL_WIN');wall=4000;t.tick(wall);assert.equal(w.active,'SMALL_WIN');w.endRound();w.beginRound();
    await playOutcome(rgs.outcome('F01',1000000),{speed,delay:async()=>{},onEvent:e=>w.onEvent(e,{betMicro:1000000})});w.endRound();wall=7999;t.tick(wall);assert.equal(w.active,'SMALL_WIN');assert.equal(w.pending,null);wall=8000;t.tick(wall);assert.equal(w.active,'IDLE');w.destroy();
  }
});

test('deterministic 3600-round data soak has no payout drift, duplicate settlement or replay debit',async()=>{
  const client=new ReviewRgs({catalog,balanceMicro:100000000});let balance=client.balanceMicro;
  for(let n=0;n<3600;n++){const c=catalog.cases[n%12];client.fixture=c.id;const o=await client.play({betMicro:c.betMicro});balance+=o.payoutMicro-o.betMicro;await client.settle(o.id);if(n%12===0){const before=client.balanceMicro;await client.getReplay(o.id);assert.equal(client.balanceMicro,before);}assert.equal(client.balanceMicro,balance);}
  assert.equal(client.metrics.playCalls,3600);assert.equal(client.metrics.settleCalls,3600);assert.equal(client.pending,null);
});

test('cancelled M05 presentation releases its barrier and repeats the identical outcome',async()=>{
  let wall=0;const t=new SceneTransport({now:()=>wall,requestFrame:()=>1,cancelFrame:()=>{}}),director=new CueDirector(t);
  const style={setProperty(){}},elements={win:{},multiplier:{closest:()=>({style:{}})},debugMultiplier:{},witchStage:{style}};
  const board={render(){},reveal:async(s,tokens,signal)=>t.wait(tokens.reveal,{signal}),cascade:async(a,s,tokens,signal)=>t.wait(tokens.fall,{signal})};
  const p=new ScenePresentation({transport:t,director,board,witch:{beginRound(){},onEvent(){}},music:{setState(){},playOneShot(){}},elements});
  const o=rgs.outcome('F06',1000000);p.begin();const cancelled=playOutcome(o,{delay:async()=>{},onEvent:(e,s)=>p.event(e,s,o,'normal')});await flush();director.cancel();await assert.rejects(cancelled,{name:'AbortError'});
  p.begin();let done=false,error,final;const repeat=playOutcome(o,{delay:async()=>{},onEvent:(e,s)=>p.event(e,s,o,'normal')}).then(s=>{done=true;final=s;},e=>{done=true;error=e;});
  for(let n=0;n<1000&&!done;n++){await flush();wall+=50;t.tick(wall);}await repeat;if(error)throw error;assert.equal(final.winMicro,o.payoutMicro);p.destroy();assert.equal(t.listeners.size,0);
});
