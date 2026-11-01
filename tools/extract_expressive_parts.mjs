import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { createCanvas, loadImage, ImageData } = require(resolve(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ?? 'node_modules', '@napi-rs/canvas'));
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const image = await loadImage(await readFile(process.argv[2]));
const { width:w, height:h } = image; const canvas = createCanvas(w,h); const ctx = canvas.getContext('2d'); ctx.drawImage(image,0,0);
const pixels = ctx.getImageData(0,0,w,h); const labels = new Int32Array(w*h); const queue = new Int32Array(w*h); const components = [];
// Sprite extraction only: preserve source RGBA, separating disconnected parts.
for(let p=0;p<w*h;p++) {
  if(labels[p] || pixels.data[p*4+3]<8) continue;
  const id=components.length+1; let head=0,tail=1; queue[0]=p; labels[p]=id;
  let minX=w,minY=h,maxX=0,maxY=0;
  while(head<tail) {
    const q=queue[head++], x=q%w,y=Math.floor(q/w); minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);
    for(const n of [x>0?q-1:-1,x<w-1?q+1:-1,y>0?q-w:-1,y<h-1?q+w:-1]) {
      if(n>=0 && !labels[n] && pixels.data[n*4+3]>=8) { labels[n]=id;queue[tail++]=n; }
    }
  }
  components.push({id,n:tail,minX,minY,maxX,maxY});
}
const main=components.filter(c=>c.n>5000).sort((a,b)=>b.n-a.n).slice(0,16);
console.log('Main source components:',main);
if(main.length!==16) throw Error('Expected sixteen separable rig parts');
const sorted=[...main].sort((a,b)=>(a.minY+a.maxY)-(b.minY+b.maxY));
const names=[];
for(let row=0;row<4;row++) names.push(...sorted.slice(row*4,row*4+4).sort((a,b)=>(a.minX+a.maxX)-(b.minX+b.maxX)));
const ids=['head','torso','hips','hair','upper-left','upper-right','fore-left','fore-right','hand-left','hand-right','skirt-left','skirt-right','thigh-left','thigh-right','boot-left','boot-right'];
const assignment=new Map();
for(const comp of components) {
  let best=main.find(v=>v.id===comp.id);
  if(!best) {
    const x=(comp.minX+comp.maxX)/2,y=(comp.minY+comp.maxY)/2;
    best=main.reduce((a,b)=> {
      const dist=v=>Math.max(v.minX-x,0,x-v.maxX)**2+Math.max(v.minY-y,0,y-v.maxY)**2;
      return dist(a)<dist(b)?a:b;
    });
  }
  assignment.set(comp.id,best.id);
}
const out=resolve(root,'apps/web/assets/witch/rig-expressive');await mkdir(out,{recursive:true});const manifest=[];
for(let index=0;index<names.length;index++) {
  const component=names[index],name=ids[index];
  const group=components.filter(c=>assignment.get(c.id)===component.id && c.n>=2);
  const x=Math.min(...group.map(c=>c.minX));
  let y=Math.min(...group.map(c=>c.minY));
  if(name.startsWith('hand-'))y+=58;
  const width=Math.max(...group.map(c=>c.maxX))-x+1,height=Math.max(...group.map(c=>c.maxY))-y+1;
  const rgba=new Uint8ClampedArray(width*height*4);
  for(let yy=0;yy<height;yy++)for(let xx=0;xx<width;xx++) {
    const src=(y+yy)*w+x+xx;if(assignment.get(labels[src])!==component.id)continue;
    rgba.set(pixels.data.subarray(src*4,src*4+4),(yy*width+xx)*4);
  }
  const part=createCanvas(width,height);part.getContext('2d').putImageData(new ImageData(rgba,width,height),0,0);
  await writeFile(resolve(out,name+'.png'),part.encodeSync('png'));
  manifest.push({name,width,height,sourceBounds:[x,y,width,height]});
}
await writeFile(resolve(out,'parts.json'),JSON.stringify({sourceWidth:w,sourceHeight:h,parts:manifest},null,2)+'\n');
console.log(manifest);
