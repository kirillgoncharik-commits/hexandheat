import test from 'node:test';
import assert from 'node:assert/strict';
import {rewardTier,cauldronMouth,landingOffset,potionSample} from '../src/field-art.js';
import {sampleStudy,STUDY_TIMELINE} from '../src/key-pose-study.js';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
test('art pass keeps payout tiers at real 1/4/10× boundaries and distinguishes sub-bet/equal without a false BIG',()=>{
 for(const [paid,tier] of [[0,'loss'],[20,'return'],[100,'equal'],[390,'small'],[400,'medium'],[990,'medium'],[1000,'big']])assert.equal(rewardTier(paid,100),tier);
 assert.equal(rewardTier(500000,100,true),'cap');
});
test('Potion route begins at actual cell and lands on the vessel mouth, not the plaque center',()=>{
 const target=cauldronMouth({x:100,y:200,width:80,height:100});assert.deepEqual(target,{x:140,y:236});
 const f={x:20,y:400,tx:target.x,ty:target.y};assert.deepEqual({...potionSample(f,.12),angle:0},{x:20,y:400,angle:0,q:0});
 const end=potionSample(f,.72);assert.ok(Math.abs(end.x-target.x)<1e-9&&Math.abs(end.y-target.y)<1e-9);assert.equal(end.q,1);
});
test('landing follows a downward path with <=2.5% rigid offset recoil and settles exactly',()=>{
 assert.equal(landingOffset(-200,0,50),-200);assert.equal(landingOffset(-200,1,50),0);assert.equal(landingOffset(0,.9,50),0);
 let previous=-Infinity;for(let i=0;i<=84;i++){const y=landingOffset(-200,i/100,50);assert.ok(y>=previous-1e-8);previous=y;}
 for(let i=84;i<=100;i++)assert.ok(landingOffset(-200,i/100,50)<=1.25+1e-9);
});
test('four registered study drawings use an exact canonical seam and the same 4000ms stepped timeline',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../assets/m07-study/manifest.json',import.meta.url)));assert.equal(manifest.poses.length,4);assert.equal(manifest.productionAnimation,false);assert.equal(manifest.durationMs,4000);assert.deepEqual(manifest.timeline.map(p=>[p.at,p.pose]),STUDY_TIMELINE.map(p=>[...p]));
 assert.equal(STUDY_TIMELINE[0][1],STUDY_TIMELINE.at(-1)[1]);for(const p of manifest.poses){const bytes=readFileSync(new URL('../'+p.path.replace('./',''),import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),p.sha256);}
 for(let cycle=0;cycle<10;cycle++){assert.equal(sampleStudy(cycle*4000),'canonical');assert.equal(sampleStudy(cycle*4000+1700),'accent');assert.equal(sampleStudy(cycle*4000+3999),'canonical');}
});
