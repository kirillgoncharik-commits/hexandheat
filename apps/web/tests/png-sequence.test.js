import test from 'node:test';
import assert from 'node:assert/strict';
import { validateClip, sampleSequence, decodeClip, PngSequencePlayer } from '../src/png-sequence-player.js';
import { SceneTransport } from '../src/scene-transport.js';
import { WitchDanceController } from '../src/witch-dance.js';
const makeClip=fps=>({fps,durationMs:4000,frameCount:fps*4,fadeMs:20,frames:Array.from({length:fps*4},(_,i)=>({path:`${fps}/${i}.png`,timestampMs:i*1000/fps}))});
const flush=async()=>{for(let i=0;i<120;i++)await Promise.resolve();};
test('PNG timestamps, cadence, short fade, seam and 30 active minutes have no accumulated drift',()=>{
 for(const fps of [6,8,12]){
  const clip=validateClip(makeClip(fps)),interval=1000/fps;
  for(let i=0;i<clip.frameCount;i++){
   assert.equal(sampleSequence(clip,i*interval+.001).index,i);
   assert.ok(sampleSequence(clip,i*interval+interval-20).mix<1e-10);
   assert.ok(Math.abs(sampleSequence(clip,i*interval+interval-10).mix-.5)<1e-9);
  }
  assert.equal(sampleSequence(clip,3999).next,0);assert.equal(sampleSequence(clip,4000).index,0);
  for(let ms=0;ms<=1800000;ms+=17){const sample=sampleSequence(clip,ms);assert.equal(sample.index,Math.floor(ms%4000/interval));assert.ok(sample.mix>=0&&sample.mix<=1);}
  assert.deepEqual(sampleSequence(clip,2871,{reducedMotion:true}),{index:0,next:0,mix:0});
 }
 assert.throws(()=>validateClip({...makeClip(8),durationMs:4100}));
 assert.throws(()=>validateClip({...makeClip(8),fadeMs:60}));
 const invalid=makeClip(8);invalid.frames[4].timestampMs=501;assert.throws(()=>validateClip(invalid));
});
test('PNG decode is bounded, ordered and fails closed before a partial set can play',async()=>{
 let active=0,max=0;const c=new AbortController();
 const frames=await decodeClip(makeClip(12),async path=>{active++;max=Math.max(max,active);await Promise.resolve();active--;return path;},c.signal);
 assert.equal(max,4);assert.equal(frames.length,48);assert.equal(frames[47],'12/47.png');
 await assert.rejects(decodeClip(makeClip(6),async path=>{if(path==='6/5.png')throw Error('decode');return path;},c.signal),/decode/);
 c.abort();await assert.rejects(decodeClip(makeClip(6),async()=>{},c.signal),/aborted/);
});
function harness(){
 const ctx={clearRect(){},drawImage(){},globalAlpha:1,globalCompositeOperation:'source-over'};
 const container={children:[],dataset:{},append(n){this.children.push(n);}};
 const fallback={state:'IDLE',switchTo(s){this.state=s;},setReducedMotion(){},setSuspended(v){this.suspended=v;},destroy(){this.destroyed=true;}};
 const old=globalThis.document;globalThis.document={createElement:()=>({hidden:true,style:{},setAttribute(){},getContext:()=>ctx,remove(){container.children=[];}})};
 let wall=0;const t=new SceneTransport({now:()=>wall,requestFrame:()=>1,cancelFrame:()=>{}});
 const manifest={width:420,height:336,poster:'neutral.png',selected:{IDLE:{fps:8,fadeMs:20},SMALL_WIN:{fps:12,fadeMs:20}},clips:{IDLE:{8:makeClip(8)},SMALL_WIN:{12:makeClip(12)}}};
 return {container,t,manifest,fallback,step(ms){wall+=ms;t.tick(wall);},restore(){globalThis.document=old;}};
}
test('PNG lifecycle: seam enable, pause/resume, five-state neutral coverage, reduced resources, cleanup',async()=>{
 const h=harness();try{
  const p=new PngSequencePlayer(h.container,{transport:h.t,fallback:h.fallback,fetchManifest:async()=>h.manifest,load:async path=>({path})});
  p.setEnabled(true);await flush();assert.equal(p.enabled,false);
  h.step(4000);await flush();h.step(1);assert.equal(h.container.dataset.media,'IDLE/8fps');
  h.t.pause();const f=h.container.dataset.mediaFrame;h.step(5000);assert.equal(h.container.dataset.mediaFrame,f);h.t.resume();h.step(1);assert.equal(h.container.dataset.mediaFrame,f);
  for(const from of ['IDLE','SMALL_WIN','MEDIUM_WIN','BIG_WIN','BONUS'])for(const to of ['IDLE','SMALL_WIN','MEDIUM_WIN','BIG_WIN','BONUS']){p.switchTo(from);h.step(4000);p.switchTo(to);h.step(4000);assert.equal(p.state,to);if(!h.manifest.selected[to])assert.equal(h.container.dataset.media,`neutral-missing-${to}`);}
  p.setReducedMotion(true);await flush();h.step(1);assert.deepEqual([...p.resources.keys()],['poster']);assert.equal(h.container.dataset.media,'neutral-reduced');
  assert.equal(p.diagnostics().estimatedDecodedBytes,420*336*4);
  p.destroy();assert.equal(h.t.listeners.size,0);assert.equal(p.resources.size,0);assert.equal(p.controllers.size,0);assert.equal(h.fallback.destroyed,true);
 }finally{h.restore();}
});
test('destroy during PNG preload and decode error never activate stale resources or block the scheduler',async()=>{
 const h=harness();try{
  let resolve;const deferred=new Promise(r=>resolve=r);
  const p=new PngSequencePlayer(h.container,{transport:h.t,fallback:h.fallback,fetchManifest:async()=>h.manifest,load:async()=>deferred});p.setEnabled(true,{immediate:true});await flush();p.destroy();resolve({});await flush();assert.equal(p.resources.size,0);assert.equal(h.t.listeners.size,0);
  const broken=new PngSequencePlayer(h.container,{transport:h.t,fallback:h.fallback,fetchManifest:async()=>h.manifest,load:async path=>{if(path!=='neutral.png')throw Error('injected decode');return {};}});broken.setEnabled(true,{immediate:true});await flush();h.step(1);assert.equal(h.container.dataset.media,'neutral-error');
  const witch=new WitchDanceController({transport:h.t,onLoop:({to})=>broken.switchTo(to)});witch.start();witch.beginRound();witch.request('SMALL_WIN');witch.endRound();for(let i=0;i<200;i++){h.step(4000);witch.beginRound();witch.request(i%2?'BIG_WIN':'SMALL_WIN');witch.endRound();}assert.equal(h.t.listeners.size,2);witch.destroy();broken.destroy();assert.equal(h.t.listeners.size,0);
 }finally{h.restore();}
});

test('a late decoded set waits for a seam, and M06 rejects a 200ms late body transition',async()=>{
 const h=harness();try{
  let done;const gate=new Promise(r=>done=r);
  const p=new PngSequencePlayer(h.container,{transport:h.t,fallback:h.fallback,fetchManifest:async()=>h.manifest,load:async path=>{if(path!=='neutral.png')await gate;return {path};}});
  p.setEnabled(true,{immediate:true});await flush();h.step(1500);done();await flush();h.step(100);assert.equal(h.container.dataset.media,'neutral-loading');h.step(2400);assert.equal(h.container.dataset.media,'IDLE/8fps');p.destroy();
  let missed=0;const witch=new WitchDanceController({transport:h.t,seamWindowMs:50,onMissedSeam:()=>missed++});witch.start();witch.beginRound();witch.request('SMALL_WIN');witch.endRound();h.step(4200);assert.equal(witch.active,'IDLE');assert.equal(missed,1);h.step(3800);assert.equal(witch.active,'SMALL_WIN');witch.destroy();
 }finally{h.restore();}
});
