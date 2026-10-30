import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { rasterFrameAt, rasterSource, RASTER_STATES, RASTER_CYCLE_MS } from '../src/raster-witch.js';
import { WITCH_LOOP_MS, WITCH_IDLE_ANCHOR_MS } from '../src/witch-dance.js';

test('four raster frames cover exactly one 4000ms cycle for every state',()=>{
 assert.equal(RASTER_CYCLE_MS,4000);
 assert.deepEqual([0,999,1000,1999,2000,2999,3000,3999,4000,4999].map(rasterFrameAt),[0,0,1,1,2,2,3,3,0,0]);
 assert.ok(Object.values(WITCH_LOOP_MS).every(v=>v===4000));
 assert.equal(WITCH_IDLE_ANCHOR_MS,4000);
});
test('each state has four existing distinct raster source files',()=>{
 const paths=RASTER_STATES.flatMap(s=>[0,1,2,3].map(f=>rasterSource(s,f)));
 assert.equal(new Set(paths).size,20);
 paths.forEach(path=>assert.ok(existsSync(new URL('../'+path,import.meta.url))));
 assert.throws(()=>rasterSource('UNKNOWN',0));
 assert.throws(()=>rasterSource('IDLE',4));
});
test('all 30 screen records have valid outgoing routes and content contracts',()=>{
 const data=JSON.parse(readFileSync(new URL('../screen-map.json',import.meta.url)));
 const ids=new Set(data.screens.map(s=>s.id));
 assert.equal(ids.size,30);
 for(const s of data.screens){
   for(const field of ['content','trigger','action','runtime'])assert.ok(s[field].length>0);
   [...s.next,...s.errors].forEach(id=>assert.ok(ids.has(id),`${s.id} refers to missing ${id}`));
 }
 const replay=data.screens.filter(s=>s.id>='S26'&&s.id<='S29');
 assert.ok(replay.every(s=>s.next.every(id=>id>='S26'&&id<='S29')));
});
