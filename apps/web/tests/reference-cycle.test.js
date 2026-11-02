import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeSkeleton,restTransforms,buildMeshes,deformVertices,retargetPose,makeSpineImport} from '../src/reference-mesh.js';
const read=name=>JSON.parse(readFileSync(new URL('../assets/witch/reference-cycle/'+name,import.meta.url)));
const art=read('layers.json'),bones=makeSkeleton(art.landmarks),meshes=buildMeshes(art,bones),clip=read('49_12-manikin.json');
test('bind skin reconstructs registered source pixels without per-layer aspect scaling',()=>{
 for(const mesh of meshes){const p=deformVertices(mesh,restTransforms(bones),bones);p.forEach((v,i)=>assert.ok(Math.hypot(v[0]-mesh.vertices[i][0],v[1]-mesh.vertices[i][1])<1e-9));
  mesh.weights.forEach(weights=>{assert.ok(weights.every(([name,w])=>bones.some(b=>b.name===name)&&w>=0));assert.ok(Math.abs(weights.reduce((s,[,w])=>s+w,0)-1)<1e-12);});
 }
});
test('real source crops retain raw seams and preserve prepared loop endpoints separately',()=>{
 for(const id of ['49_12','05_12','05_02']){const c=read(id+'-manikin.json');assert.equal(c.sampling.frameCount,121);assert.equal(c.frames.length,121);assert.notDeepEqual(c.frames[0],c.frames[120]);assert.deepEqual(c.loopFrames[0],c.loopFrames[120]);assert.deepEqual(c.loopRootTrack[0],c.loopRootTrack[120]);assert.equal(c.source.sourceCommit,'09a07f54f3bbb58797325f009282d0b2048a2871');}
});
test('all retargeted poses are finite, close the seam and encode source forearm foreshortening',()=>{
 const first=retargetPose(clip,0,bones),last=retargetPose(clip,4,bones);assert.deepEqual(first,last);
 let shortened=false;for(let frame=0;frame<=120;frame++){const pose=retargetPose(clip,frame/30,bones);for(const b of bones){assert.ok([...pose[b.name].position,pose[b.name].rotation,pose[b.name].scaleX??1].every(Number.isFinite));}shortened ||= pose['fore-left'].scaleX<.8;}
 assert.ok(shortened);
});
test('weighted Spine data reproduces preview positions with noScale bone inheritance',()=>{
 const poses=Array.from({length:121},(_,i)=>retargetPose(clip,i/30,bones)),data=makeSpineImport(art,bones,meshes,poses),anim=data.animations.REFERENCE_DANCE.bones;
 for(const frame of [0,24,48,72,96,120]){
  const world=[];for(const b of data.bones){const parent=world[data.bones.findIndex(x=>x.name===b.parent)],t=anim[b.name],tx=b.x+t.translate[frame].x,ty=b.y+t.translate[frame].y,r=(b.rotation+t.rotate[frame].value)*Math.PI/180,localScale=t.scale[frame].x;
   const x=parent?parent.x+parent.a*tx+parent.c*ty:tx,y=parent?parent.y+parent.b*tx+parent.d*ty:ty,rotation=(parent?.rotation??0)+r;
   world.push({x,y,rotation,a:Math.cos(rotation)*localScale,b:Math.sin(rotation)*localScale,c:-Math.sin(rotation),d:Math.cos(rotation)});
  }
  for(const m of meshes){const attachment=data.skins[0].attachments[m.name][m.name],v=attachment.vertices,actual=[];let i=0;while(i<v.length){const count=v[i++];let x=0,y=0;for(let n=0;n<count;n++){const bone=world[v[i++]],xx=v[i++],yy=v[i++],weight=v[i++];x+=(bone.x+bone.a*xx+bone.c*yy)*weight;y+=(bone.y+bone.b*xx+bone.d*yy)*weight;}actual.push([x+512,1516-y]);}
   const expected=deformVertices(m,poses[frame],bones);assert.equal(actual.length,expected.length);actual.forEach((p,j)=>assert.ok(Math.hypot(p[0]-expected[j][0],p[1]-expected[j][1])<1e-7,m.name+'/'+frame+'/'+j));
  }
 }
});
