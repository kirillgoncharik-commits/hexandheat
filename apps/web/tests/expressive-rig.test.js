import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleRig,rigWorld,footTargets,makeSpineData,RIG_STATES,ATTACHMENTS} from '../src/witch-rig.js';
import {sampleRig as oldPose} from '../src/witch-rig-v2.js';

test('expressive rig retains five closed cycles and continuous shared seam velocity',()=>{
 const seam=sampleRig('IDLE',0),epsilon=.00001;
 for(const state of RIG_STATES){assert.deepEqual(sampleRig(state,0),seam);assert.deepEqual(sampleRig(state,4),seam);
  const samples=Array.from({length:120},(_,i)=>JSON.stringify(sampleRig(state,i/30)));assert.equal(new Set(samples).size,120);
  const before=sampleRig(state,4-epsilon),after=sampleRig(state,epsilon);
  for(const bone of ['hips','torso','head','hand-left','hand-right'])for(const key of ['x','y','rotation']){
   const mid=seam[bone]?.[key]??0,va=((after[bone]?.[key]??0)-mid)/epsilon,vb=(mid-(before[bone]?.[key]??0))/epsilon;
   assert.ok(Math.abs(va-vb)<.03,`${state}/${bone}/${key}`);
  }
 }
});

test('all 600 poses preserve intended foot contact while authored steps actually lift the free foot',()=>{
 let largestLift=0;
 for(const state of RIG_STATES)for(let frame=0;frame<120;frame++){
  const t=frame/30,world=rigWorld(sampleRig(state,t)),target=footTargets(state,t);
  for(const side of ['left','right']){const m=world['boot-'+side];assert.ok(Math.hypot(m[2]*210+m[4]-target[side].x,m[3]*210+m[5]-target[side].y)<1e-7);largestLift=Math.max(largestLift,1104-target[side].y);}
 }
 assert.ok(largestLift>=29);assert.equal(footTargets('IDLE',1.5).left.y,1104);
});

test('choreography adds asymmetric wrists, larger hip travel and independent skirt parts',()=>{
 const sample=fn=>Array.from({length:120},(_,i)=>fn('BIG_WIN',i/30));
 const v3=sample(sampleRig),v2=sample(oldPose),span=p=>Math.max(...p.map(p=>p.hips.x))-Math.min(...p.map(p=>p.hips.x));
 assert.ok(span(v3)>span(v2)*5);
 assert.ok(v3.some(p=>Math.abs(p['upper-left'].rotation+p['upper-right'].rotation)>25));
 assert.ok(v3.some(p=>Math.abs(p['hand-left'].rotation)>30));
 assert.ok(v3.some(p=>Math.abs(p['skirt-left'].rotation-p['skirt-right'].rotation)>5));
 assert.equal(ATTACHMENTS.length,16);
 const data=makeSpineData();for(const state of RIG_STATES){assert.equal(data.animations[state].bones['hand-left'].rotate.length,121);assert.equal(data.animations[state].bones['thigh-left'].rotate.at(-1).time,4);}
});
