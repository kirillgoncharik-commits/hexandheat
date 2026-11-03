/** Mechanical registered crop for connected v7 shoulders; preserves v6 assets. */
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {traceBodyGeometry} from './trace_body_mesh.mjs';
const require=createRequire(import.meta.url);
const {createCanvas,loadImage}=require(resolve(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES??'node_modules','@napi-rs/canvas'));
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),media=resolve(root,'../hexheat-reference-cycle-media'),masters=resolve(media,'masters'),out=resolve(root,'apps/web/assets/witch/reference-cycle'),qa=resolve(media,'shoulder-repair');
await mkdir(masters,{recursive:true});await mkdir(qa,{recursive:true});
const headSource=resolve(masters,'head-clean.png');
await access(headSource);
const previous=JSON.parse(await readFile(resolve(out,'layers.json'),'utf8'));
const sourceWidth=1024,sourceHeight=1536,quality=95;
const definitions=[
 {name:'body-continuous',png:'body-continuous.webp',source:'body-continuous.png',sourceBounds:[20,284,984,1201],polygon:[[20,284],[1004,284],[1004,1485],[20,1485]],holes:previous.layers.find(l=>l.name==='garment').holes},
 {name:'head-hair',png:'head-clean.webp',source:'head-clean.png',sourceBounds:[238,0,513,551],polygon:[[238,0],[751,0],[751,551],[238,551]],neckTrim:{region:[465,294,115,61],bodyAlphaThreshold:250,reason:'Remove only central neck pixels covered by the opaque body collar; retain hair/neck wherever the body has transparent background to avoid a rectangular gap.'}}
];
function polygon(ctx,points){ctx.moveTo(...points[0]);for(const point of points.slice(1))ctx.lineTo(...point);ctx.closePath();}
const sources={};
const layers=previous.layers.filter(l=>l.name==='leg-left'||l.name==='leg-right').map(l=>({...l,retainedFrom:'layers.json / v6'}));
for(const d of definitions){
 const file=resolve(masters,d.source),bytes=await readFile(file),image=await loadImage(file);if(image.width!==sourceWidth||image.height!==sourceHeight)throw Error('Registered source dimensions differ: '+d.source);
 sources[d.source]={sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,path:'../hexheat-reference-cycle-media/masters/'+d.source};
 const [x,y,w,h]=d.sourceBounds,canvas=createCanvas(w,h),ctx=canvas.getContext('2d');ctx.save();ctx.translate(-x,-y);ctx.beginPath();polygon(ctx,d.polygon);for(const hole of d.holes??[])polygon(ctx,hole);ctx.clip('evenodd');ctx.drawImage(image,0,0);ctx.restore();
 if(d.neckTrim){const body=await loadImage(resolve(masters,'body-continuous.png')),bodyCanvas=createCanvas(sourceWidth,sourceHeight),bodyCtx=bodyCanvas.getContext('2d');bodyCtx.drawImage(body,0,0);const bodyPixels=bodyCtx.getImageData(0,0,sourceWidth,sourceHeight).data,pixels=ctx.getImageData(0,0,w,h),[rx,ry,rw,rh]=d.neckTrim.region;for(let sy=ry;sy<ry+rh;sy++)for(let sx=rx;sx<rx+rw;sx++)if(bodyPixels[(sy*sourceWidth+sx)*4+3]>=d.neckTrim.bodyAlphaThreshold)pixels.data[((sy-y)*w+sx-x)*4+3]=0;ctx.putImageData(pixels,0,0);}
 const encoded=canvas.encodeSync('webp',quality);if(encoded.length>1000000)throw Error('Runtime asset exceeds 1MB: '+d.png);await writeFile(resolve(out,d.png),encoded);
 const geometry=d.name==='body-continuous'?traceBodyGeometry(ctx.getImageData(0,0,w,h).data,w,h,[x,y]):undefined;
 layers.push({...d,...(geometry?{geometry}:{}),bytes:encoded.length,sha256:createHash('sha256').update(encoded).digest('hex'),encoding:{format:'webp',quality,scale:1}});
}
const data={schemaVersion:2,sourceWidth,sourceHeight,coordinateSystem:previous.coordinateSystem,landmarks:previous.landmarks,layers,sources,processing:'Connected shoulders/arms/corset/skirt share one source texture. Uniform WebP encoding only; no rescale, reassembly, shoulder patches or creative code painting. Central neck below y294 trimmed from clean head so no collar/clothing rides with hair.',status:'V7 source candidate; native Spine editor, motion and human art review remain open.'};
const descriptor=JSON.stringify(data)+'\n';if(Buffer.byteLength(descriptor)>1000000)throw Error('Mesh descriptor exceeds 1MB');
await writeFile(resolve(out,'layers-v7.json'),descriptor);
const assembled=createCanvas(sourceWidth,sourceHeight),a=assembled.getContext('2d');for(const layer of layers)a.drawImage(await loadImage(resolve(out,layer.png)),layer.sourceBounds[0],layer.sourceBounds[1]);await writeFile(resolve(qa,'assembled.png'),assembled.encodeSync('png'));
const panel=createCanvas(1536,920),p=panel.getContext('2d');for(let i=0;i<3;i++){p.fillStyle=['#1b1422','#f0eee8','#77707e'][i];p.fillRect(i*512,0,512,920);p.save();p.translate(i*512,0);p.scale(.5,.5);p.drawImage(assembled,0,0);p.restore();}await writeFile(resolve(qa,'assembled-backgrounds.png'),panel.encodeSync('png'));
const crop=createCanvas(1400,600),c=crop.getContext('2d');for(let i=0;i<2;i++){c.fillStyle=i?'#f0eee8':'#1b1422';c.fillRect(i*700,0,700,600);c.drawImage(assembled,280,255,470,450,i*700,0,700,600);}await writeFile(resolve(qa,'shoulders-close.png'),crop.encodeSync('png'));
console.log(JSON.stringify({descriptor:resolve(out,'layers-v7.json'),qa,layers:layers.map(l=>({name:l.name,png:l.png,bytes:l.bytes,sourceBounds:l.sourceBounds})),sources}));
