import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleRig,rigWorld,makeSpineData,RIG_STATES,RIG_FPS,RIG_SECONDS,BONES,ATTACHMENTS} from '../src/witch-rig.js';

test('30 FPS produces 120 actual skeletal samples per four-second clip, with five distinct choreographies',()=>{
  assert.equal(RIG_FPS*RIG_SECONDS,120);
  const midpoints=RIG_STATES.map(state=>JSON.stringify(sampleRig(state,2)));
  assert.equal(new Set(midpoints).size,5);
  for(const state of RIG_STATES) {
    const poses=Array.from({length:120},(_,i)=>JSON.stringify(sampleRig(state,i/30)));
    assert.ok(new Set(poses).size>=118,state);
  }
});

test('all state seams are identical and the foot anchor stays fixed throughout every animation',()=>{
  const seam=sampleRig('IDLE',0);
  for(const state of RIG_STATES) {
    assert.deepEqual(sampleRig(state,0),seam);assert.deepEqual(sampleRig(state,4),seam);
    for(let frame=0;frame<120;frame++) {
      const world=rigWorld(sampleRig(state,frame/30)).skirt;
      assert.ok(Math.abs(world[2]*410+world[4]-384)<1e-8);
      assert.ok(Math.abs(world[3]*410+world[5]-974)<1e-8);
    }
  }
});

test('Spine import candidate has valid bone/slot references, 121 closed keys and a four-second endpoint',()=>{
  const data=makeSpineData(),names=new Set();
  for(const bone of data.bones) {if(bone.parent)assert.ok(names.has(bone.parent));names.add(bone.name);}
  assert.equal(names.size,BONES.length);assert.equal(data.slots.length,ATTACHMENTS.length);
  for(const slot of data.slots) {assert.ok(names.has(slot.bone));assert.ok(data.skins[0].attachments[slot.name][slot.attachment]);}
  for(const state of RIG_STATES)for(const timelines of Object.values(data.animations[state].bones))for(const keys of Object.values(timelines)) {
    assert.equal(keys.length,121);assert.equal(keys[0].time,0);assert.equal(keys.at(-1).time,4);
    keys.forEach((key,i)=>{if(i)assert.ok(key.time>keys[i-1].time);});
    const {time:a,...first}=keys[0],{time:b,...last}=keys.at(-1);assert.deepEqual(first,last);
  }
});
