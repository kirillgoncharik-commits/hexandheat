import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {validateClip} from '../src/png-sequence-player.js';
import {makeSkeleton} from '../src/reference-mesh.js';
import {sampleMotion} from '../src/m06-motion-source.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url)),hash=data=>createHash('sha256').update(data).digest('hex');
test('M06 full PNG sets retain actual unique poses, timestamps, alpha, source integrity and face landmarks',()=>{
 const manifest=JSON.parse(read('assets/m06/manifest.json'));
 assert.equal(hash(read(manifest.poster.replace('./',''))),manifest.posterSha256);
 for(const state of ['IDLE','SMALL_WIN'])for(const fps of [6,8,12]){
  const clip=validateClip(manifest.clips[state][fps]);assert.equal(clip.faceLandmarks.length,4*fps);const hashes=new Set();
  for(const [i,f]of clip.frames.entries()){
   const data=read(f.path.replace('./',''));assert.equal(hash(data),f.sha256);assert.equal(data.length,f.bytes);assert.equal(data.toString('ascii',1,4),'PNG');hashes.add(f.sha256);
   const face=clip.faceLandmarks[i];assert.ok(face.chin[1]>face.forehead[1]);for(const point of [face.chin,face.forehead])assert.ok(point[0]>0&&point[0]<manifest.width&&point[1]>0&&point[1]<manifest.height);
  }
  assert.equal(hashes.size,4*fps,'No copies masquerading as source poses');
 }
 assert.equal(hash(read('src/m06-motion-source.js')),manifest.source.motionSha256);
 assert.ok(manifest.budgets.selectedDownloadBytes<=4*1024*1024,'two-clip payload target');
 assert.ok(manifest.budgets.cpuPlusGpuEstimateMiB<128);
});
test('New authored IDLE and SMALL_WIN share pose and C1 velocity at the four-second seam',()=>{
 const art=JSON.parse(read('assets/witch/reference-cycle/layers-v7.json')),bones=makeSkeleton(art.landmarks),epsilon=.00001;
 const flatten=s=>Object.values(s.pose).flatMap(p=>[...p.position,p.rotation]);let neutral;
 for(const state of ['IDLE','SMALL_WIN']){
  const start=flatten(sampleMotion(state,0,bones)),end=flatten(sampleMotion(state,4,bones));
  if(neutral)start.forEach((v,i)=>assert.ok(Math.abs(v-neutral[i])<1e-7));neutral=start;
  start.forEach((v,i)=>assert.ok(Math.abs(v-end[i])<1e-7));
  const first=flatten(sampleMotion(state,epsilon,bones)),last=flatten(sampleMotion(state,4-epsilon,bones));
  start.forEach((v,i)=>assert.ok(Math.abs((first[i]-v)/epsilon-(end[i]-last[i])/epsilon)<.05,'seam velocity'));
 }
 const still=sampleMotion('IDLE',1.95,bones),win=sampleMotion('SMALL_WIN',1.95,bones);assert.ok(Math.abs(still.pose['fore-right'].rotation-win.pose['fore-right'].rotation)>.5);
});
