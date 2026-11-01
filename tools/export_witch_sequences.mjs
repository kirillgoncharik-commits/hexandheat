import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {drawRig,sampleRig,makeSpineData,RIG_STATES,RIG_WIDTH,RIG_HEIGHT,RIG_FPS,RIG_SECONDS,ATTACHMENTS} from '../apps/web/src/witch-rig.js';
const require=createRequire(import.meta.url);
const {createCanvas,loadImage}=require(resolve(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES??'node_modules','@napi-rs/canvas'));
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const images={};for(const name of ATTACHMENTS.map(p=>p.name))images[name]=await loadImage(resolve(root,'apps/web/assets/witch/rig-expressive',name+'.png'));
const out=resolve(process.argv[2]??resolve(root,'../witch-30fps-exports'));await mkdir(out,{recursive:true});
const canvas=createCanvas(RIG_WIDTH,RIG_HEIGHT),ctx=canvas.getContext('2d');
const preview=process.argv.includes('--preview');
if(preview) {
  for(const state of RIG_STATES) { ctx.clearRect(0,0,RIG_WIDTH,RIG_HEIGHT);drawRig(ctx,images,sampleRig(state,state==='IDLE'?0:2));await writeFile(resolve(out,state+'.png'),canvas.encodeSync('png')); }
} else {
  const catalog={fps:30,frameCount:120,cycleMs:4000,width:RIG_WIDTH,height:RIG_HEIGHT,states:{}};
  for(const state of RIG_STATES) {
    const dir=resolve(out,state);await mkdir(dir,{recursive:true});let bytes=0;
    for(let frame=0;frame<RIG_FPS*RIG_SECONDS;frame++) {
      ctx.clearRect(0,0,RIG_WIDTH,RIG_HEIGHT);drawRig(ctx,images,sampleRig(state,frame/RIG_FPS));
      const data=canvas.encodeSync('webp',82);bytes+=data.length;
      await writeFile(resolve(dir,String(frame).padStart(3,'0')+'.webp'),data);
    }
    catalog.states[state]={frames:120,bytes};console.log(state,120,bytes);
  }
  await writeFile(resolve(out,'sequence-manifest.json'),JSON.stringify(catalog,null,2)+'\n');
}
const data=makeSpineData();await writeFile(resolve(root,'apps/web/assets/witch/rig-expressive/witch.spine.json'),JSON.stringify(data)+'\n');
await writeFile(resolve(out,'witch.spine.json'),JSON.stringify(data,null,2)+'\n');
let atlas='';
const spineOut=resolve(out,'spine-import');await mkdir(spineOut,{recursive:true});
for(const [name,image] of Object.entries(images)) {
  atlas+=`${name}.png\nsize: ${image.width},${image.height}\nformat: RGBA8888\nfilter: Linear,Linear\nrepeat: none\n${name}\n  rotate: false\n  xy: 0,0\n  size: ${image.width},${image.height}\n  orig: ${image.width},${image.height}\n  offset: 0,0\n  index: -1\n\n`;
  await copyFile(resolve(root,'apps/web/assets/witch/rig-expressive',name+'.png'),resolve(spineOut,name+'.png'));
}
await writeFile(resolve(root,'apps/web/assets/witch/rig-expressive/witch.atlas'),atlas.trimEnd()+'\n');
await writeFile(resolve(spineOut,'witch.atlas'),atlas.trimEnd()+'\n');
await writeFile(resolve(spineOut,'witch.spine.json'),JSON.stringify(data)+'\n');
console.log('Exported to',out);
