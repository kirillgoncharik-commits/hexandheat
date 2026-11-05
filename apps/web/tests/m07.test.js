import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ReviewRgs} from '../src/review-rgs.js';
import {ReviewSequence,reviewOrder} from '../src/review-sequence.js';
import {playOutcome,deriveWitchState} from '../src/domain.js';
import {SceneTransport} from '../src/scene-transport.js';
import {ScenePresentation} from '../src/scene-presentation.js';
import {CueDirector} from '../src/cue-director.js';
const catalog=JSON.parse(readFileSync(new URL('../assets/m07/fixtures.json',import.meta.url)));
const matrix=JSON.parse(readFileSync(new URL('../assets/m07/symbol-matrix.json',import.meta.url)));
const flush=async()=>{for(let i=0;i<15;i++)await Promise.resolve();};
test('M07: all 207 independently produced books map and replay with exact groups, terminal boards and Potion semantics',async()=>{
 const rgs=new ReviewRgs({catalog:{cases:[...catalog.cases,...matrix.cases]}});
 for(const c of rgs.catalog.cases){const o=rgs.outcome(c.id,c.betMicro);const s=await playOutcome(o,{delay:async()=>{}});assert.equal(s.winMicro,c.expected.payoutUnits*c.betMicro/100,c.id);assert.equal(s.multiplier,c.expected.events.at(-1).finalMultiplier);assert.deepEqual(s.board,c.expected.events.filter(e=>e.board).at(-1).board);for(const e of o.events.filter(e=>e.type==='win'))assert.equal(e.groups.reduce((n,g)=>n+g.amount,0),e.amount);}
 assert.equal(matrix.cases.filter(c=>c.id.startsWith('T-')).length,45);assert.equal(matrix.cases.filter(c=>c.id.startsWith('Q-')).length,135);
});
test('M07: golden round and ordinary tier boundaries are genuine pinned outcomes',()=>{
 const rgs=new ReviewRgs({catalog});const golden=rgs.outcome('B05',1000000);assert.deepEqual(golden.events.filter(e=>e.type==='win').map(e=>[e.groups.length,e.amount,e.multiplier]),[[2,700000,1],[1,1200000,2]]);
 for(const [id,tier] of [['B17','SMALL_WIN'],['B17-4','MEDIUM_WIN'],['B17-4A','MEDIUM_WIN'],['B17-10B','MEDIUM_WIN'],['B17-10','BIG_WIN'],['B17-10A','BIG_WIN']]){const o=rgs.outcome(id,1000000);assert.equal(deriveWitchState(o.events.at(-1),o),tier,id);}
 assert.equal(rgs.outcome('B20',10000).payoutMicro,13000);
});
test('M07: seeded manual playlist survives URL cursor and cannot change a replay or debit twice',async()=>{
 const a=new ReviewSequence(catalog.playlist,{seed:'run-42'}),b=new ReviewSequence(catalog.playlist,{seed:'run-42'});assert.deepEqual(a.ids,b.ids);assert.notDeepEqual(a.ids,reviewOrder(catalog.playlist,'another'));a.advance();a.advance();assert.equal(new ReviewSequence(catalog.playlist,{seed:'run-42',cursor:2}).next,a.next);
 const rgs=new ReviewRgs({catalog,fixture:'B05'});const o=await rgs.play({betMicro:1000000});await assert.rejects(rgs.play({betMicro:1000000}),/pending/);rgs.fixture=a.next;assert.equal((await rgs.getReplay(o.id)).fixtureId,'B05');await rgs.settle(o.id);const balance=rgs.balanceMicro;await rgs.getReplay(o.id);assert.equal(rgs.balanceMicro,balance);assert.equal(rgs.metrics.playCalls,1);await assert.rejects(rgs.settle(o.id),/pending/);
});
test('M07: all 27 scenarios × Normal/Fast/Reduced/Replay complete shared-clock presentation without fallback',async()=>{
 const rgs=new ReviewRgs({catalog});
 for(const c of catalog.cases)for(const mode of ['normal','fast','reduced','replay']){
  let wall=0,boardState;const transport=new SceneTransport({now:()=>wall,requestFrame:()=>1,cancelFrame:()=>{}}),director=new CueDirector(transport),plaque={style:{}};
  const board={render:s=>boardState=s,reveal:async(s,t,signal)=>{await transport.wait(t.reveal,{signal});boardState=s;},cascade:async(a,s,t,signal)=>{await transport.wait(t.remove+t.fall+5*t.stagger,{signal});boardState=s;}};
  const elements={win:{},multiplier:{closest:()=>plaque},debugMultiplier:{},witchStage:{style:{setProperty(){}}}};
  const p=new ScenePresentation({transport,director,board,witch:{beginRound(){},onEvent(){}},music:{setState(){},playOneShot(){}},elements});p.setReducedMotion(mode==='reduced');p.begin();
  const o=rgs.outcome(c.id,c.betMicro);let done=false,error,final;const task=playOutcome(o,{delay:async()=>{},onEvent:(e,s)=>p.event(e,s,o,mode==='fast'?'fast':'normal')}).then(s=>{done=true;final=s;},e=>{done=true;error=e;});
  for(let n=0;n<2000&&!done;n++){await flush();wall+=50;transport.tick(wall);}await task;if(error)throw error;assert.equal(final.winMicro,o.payoutMicro,c.id);assert.deepEqual(boardState.board,final.board);assert.ok(!director.trace.some(e=>e.type==='cue.fallback'),c.id+' '+mode);p.destroy();assert.equal(transport.listeners.size,0);
 }
});
