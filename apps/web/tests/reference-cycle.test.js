import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeSkeleton,restTransforms,buildMeshes,deformVertices,retargetPose,makeSpineImport,vertexWeights} from '../src/reference-mesh.js';
import {traceBodyGeometry} from '../../../tools/trace_body_mesh.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../assets/witch/reference-cycle/'+name,import.meta.url)));
const art=read('layers-v7.json'),bones=makeSkeleton(art.landmarks),meshes=buildMeshes(art,bones),clip=read('49_12-manikin.json');
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
 let shortened=false;for(const id of ['49_12','05_12','05_02'])for(const clean of [true,false])for(let frame=0;frame<=120;frame++){const pose=retargetPose(read(id+'-manikin.json'),frame/30,bones,{clean});for(const b of bones){assert.ok([...pose[b.name].position,pose[b.name].rotation,pose[b.name].scaleX??1].every(Number.isFinite));}shortened ||= pose['fore-left'].scaleX<.8;}
 assert.ok(shortened);
});
test('shoulder seam belongs to the chest and the shared body triangles never duplicate coverage',()=>{
 assert.ok(!art.layers.some(l=>l.name.startsWith('arm-')||l.name==='garment'));
 for(const point of [[433,347],[598,341],[397,382],[632,382]]){
  const weights=vertexWeights('body-continuous',point,bones);assert.deepEqual(weights,[['chest',1]]);
 }
 for(const point of [[385,655],[655,655],[376,670],[663,670],[350,750],[688,735]])assert.ok(vertexWeights('body-continuous',point,bones).every(([name])=>! /upper|fore|hand|joint/.test(name)),'skirt must not follow an arm');
 for(const point of [[350,655],[669,655],[329,685],[689,685]])assert.ok(vertexWeights('body-continuous',point,bones).every(([name])=>/upper|fore|hand|joint/.test(name)),'sleeve edge must not anchor to the waist');
 const body=meshes.find(m=>m.name==='body-continuous'),front=meshes.find(m=>m.name==='body-front');
 assert.equal(body.vertices,front.vertices);assert.equal(body.weights,front.weights);assert.equal(front.texture,'body-continuous');
 const keys=m=>Array.from({length:m.indices.length/3},(_,i)=>m.indices.slice(i*3,i*3+3).join(','));
 const all=[...keys(body),...keys(front)];assert.equal(new Set(all).size,all.length);assert.ok(front.indices.length>0);assert.ok(body.indices.length>front.indices.length);
 // The paired endpoints of every split triangle use the exact same source
 // vertices and weights, so changing draw order cannot open a skin seam.
 const pose=retargetPose(clip,2.4,bones),a=deformVertices(body,pose,bones),b=deformVertices(front,pose,bones);assert.deepEqual(a,b);
});
test('alpha mesh keeps a narrow transparent slit open even when coarse corners are opaque',()=>{
 const width=32,height=32,pixels=new Uint8ClampedArray(width*height*4);for(let y=0;y<height;y++)for(let x=0;x<width;x++)pixels[(y*width+x)*4+3]=(y>=8&&x>=14&&x<=17)?0:255;
 const mesh=traceBodyGeometry(pixels,width,height,[0,0]);let seenLeft=false,seenRight=false;
 for(let i=0;i<mesh.triangles.length;i+=3){const p=mesh.triangles.slice(i,i+3).map(id=>mesh.vertices[id]);const y=p.reduce((s,v)=>s+v[1]/3,0),x=p.reduce((s,v)=>s+v[0]/3,0);if(y>10){assert.ok(x<13.5||x>17.5);assert.ok(!(Math.min(...p.map(v=>v[0]))<14&&Math.max(...p.map(v=>v[0]))>17));seenLeft ||= x<14;seenRight ||= x>17;}}
 assert.ok(seenLeft&&seenRight);
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
