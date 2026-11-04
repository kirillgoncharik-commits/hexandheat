/** Deterministic PNG render from editable original-art motion curves. No video/mocap input. */
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {makeSkeleton,buildMeshes,deformVertices,vertexWeights} from '../apps/web/src/reference-mesh.js';
import {M06_CAMERA,STORYBOARD,sampleMotion,motionLandmarks} from '../apps/web/src/m06-motion-source.js';
const require=createRequire(import.meta.url),{createCanvas,loadImage,ImageData}=require(resolve(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES??'node_modules','@napi-rs/canvas'));
const sharp=require(resolve(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES??'node_modules','sharp'));
const compact=buffer=>sharp(buffer).png({palette:true,colours:256,dither:.2,effort:10,compressionLevel:9}).toBuffer();
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),asset=resolve(root,'apps/web/assets/witch/reference-cycle'),out=resolve((process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null)??resolve(root,'apps/web/assets/m06'));
const hash=x=>createHash('sha256').update(x).digest('hex');
await mkdir(out,{recursive:true});
const artBuffer=await readFile(resolve(asset,'layers-v7.json')),art=JSON.parse(artBuffer),bones=makeSkeleton(art.landmarks),meshes=buildMeshes(art,bones);
const imageData={},imageHashes={};
for(const layer of art.layers){const data=await readFile(resolve(asset,layer.png));imageHashes[layer.png]=hash(data);const im=await loadImage(data),canvas=createCanvas(im.width,im.height),ctx=canvas.getContext('2d');ctx.drawImage(im,0,0);imageData[layer.name]={width:im.width,height:im.height,pixels:ctx.getImageData(0,0,im.width,im.height).data};}
// Subdivide the existing head registration locally for eyelids and mouth corners.
const head=meshes.find(m=>m.name==='head-hair'),xs=[238,280,320,360,400,430,455,475,485,495,505,515,525,535,545,555,565,575,590,610,650,700,751],ys=[0,70,120,145,160,175,185,195,202,209,216,223,230,240,250,260,275,285,294,316,360,430,551];
head.vertices=[];head.uvs=[];head.weights=[];head.indices=[];
for(const y of ys)for(const x of xs){head.vertices.push([x,y]);head.uvs.push([(x-238)/513,y/551]);head.weights.push(vertexWeights('head-hair',[x,y],bones));}
for(let r=0;r<ys.length-1;r++)for(let c=0;c<xs.length-1;c++){const a=r*xs.length+c,b=a+1,d=a+xs.length,e=d+1;head.indices.push(a,d,b,b,d,e);}
const baseHead=head.vertices.map(v=>[...v]);
const {width:W,height:H,canonicalCrop:crop,scale}=M06_CAMERA;
const canvas=createCanvas(W,H),ctx=canvas.getContext('2d');
/** Barycentric CPU rasterizer: no antialiased per-triangle cracks, premultiplied bilinear alpha. */
function render(sample){
 const pixels=new Float32Array(W*H*4);
 head.vertices=baseHead.map(([x,y])=>{
  let dy=0;for(const [ex,ey] of [[503,203],[556,210]]){const g=Math.exp(-(((x-ex)/22)**4+((y-ey)/14)**4));dy-=(y-ey)*.91*sample.blink*g;}
  for(const [mx,my]of [[501,255],[541,258]])dy-=2.4*sample.smile*Math.exp(-(((x-mx)/14)**2+((y-my)/13)**2));
  return [x,y+dy];
 });
 for(const mesh of meshes){
  const points=deformVertices(mesh,sample.pose,bones).map(p=>[(p[0]-crop[0])*scale,(p[1]-crop[1])*scale]),im=imageData[mesh.texture??mesh.name],source=im.pixels;
  for(let i=0;i<mesh.indices.length;i+=3){
   const ids=mesh.indices.slice(i,i+3),[a,b,c]=ids.map(id=>points[id]),den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(den)<1e-7)continue;
   const minX=Math.max(0,Math.ceil(Math.min(a[0],b[0],c[0])-.5)),maxX=Math.min(W-1,Math.floor(Math.max(a[0],b[0],c[0])-.5)),minY=Math.max(0,Math.ceil(Math.min(a[1],b[1],c[1])-.5)),maxY=Math.min(H-1,Math.floor(Math.max(a[1],b[1],c[1])-.5));
   const [ua,ub,uc]=ids.map(id=>mesh.uvs[id]);
   for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
    const px=x+.5,py=y+.5,u=((b[1]-c[1])*(px-c[0])+(c[0]-b[0])*(py-c[1]))/den,v=((c[1]-a[1])*(px-c[0])+(a[0]-c[0])*(py-c[1]))/den,w=1-u-v;if(u<0||v<0||w<0)continue;
    const sx=(ua[0]*u+ub[0]*v+uc[0]*w)*im.width-.5,sy=(ua[1]*u+ub[1]*v+uc[1]*w)*im.height-.5,ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy;
    let alpha=0,red=0,green=0,blue=0;
    for(let oy=0;oy<2;oy++)for(let ox=0;ox<2;ox++){const xx=ix+ox,yy=iy+oy;if(xx<0||xx>=im.width||yy<0||yy>=im.height)continue;const weight=(ox?fx:1-fx)*(oy?fy:1-fy),si=(yy*im.width+xx)*4,sa=source[si+3]/255*weight;alpha+=sa;red+=source[si]*sa;green+=source[si+1]*sa;blue+=source[si+2]*sa;}
    if(alpha<=0)continue;const di=(y*W+x)*4,left=1-alpha;pixels[di]=red+pixels[di]*left;pixels[di+1]=green+pixels[di+1]*left;pixels[di+2]=blue+pixels[di+2]*left;pixels[di+3]=alpha+pixels[di+3]*left;
   }
  }
 }
 const rgba=new Uint8ClampedArray(W*H*4);for(let i=0;i<rgba.length;i+=4){const a=pixels[i+3];if(a>0){rgba[i]=pixels[i]/a;rgba[i+1]=pixels[i+1]/a;rgba[i+2]=pixels[i+2]/a;rgba[i+3]=a*255;}}
 ctx.putImageData(new ImageData(rgba,W,H),0,0);return canvas.encodeSync('png');
}
const renderCache=new Map();
async function rendered(state,t){const key=state+':'+t.toFixed(8);if(!renderCache.has(key))renderCache.set(key,compact(render(sampleMotion(state,t,bones))));return renderCache.get(key);}
const codeBuffer=await readFile(resolve(root,'apps/web/src/m06-motion-source.js')),exportBuffer=await readFile(fileURLToPath(import.meta.url));
const sourceHash=hash(Buffer.concat([artBuffer,codeBuffer,exportBuffer,Buffer.from(JSON.stringify(imageHashes))]));
const manifest={version:'m06-png-1',width:W,height:H,durationMs:4000,poster:'./assets/m06/neutral.png',family:'v7-original-adult-red-haired-witch',artStatus:'EDITED — ART REVIEW REQUIRED',sourceHash,
 selected:{IDLE:{fps:6,fadeMs:40},SMALL_WIN:{fps:12,fadeMs:20}},clips:{IDLE:{},SMALL_WIN:{}},
 crop:{canonical:crop,scale,desktop:{mode:'same upper-body camera; full-body old renderer preserved'},mobile:{mode:'full-width close crop; preserve face and gesture'}},pivot:M06_CAMERA.pivot,
 source:{tool:'Node.js / @napi-rs/canvas; deterministic barycentric mesh renderer',date:'2026-11-04',method:'New authored staging curves, original v7 textures, local eyelid/mouth mesh deformation; no CMU motion input, no video generation, no independently generated frames',art:'apps/web/assets/witch/reference-cycle/layers-v7.json',artSha256:hash(artBuffer),imageHashes,motionSource:'apps/web/src/m06-motion-source.js',motionSha256:hash(codeBuffer),exporterSha256:hash(exportBuffer)},
 alpha:'256-entry indexed PNG with alpha, premultiplied bilinear source sampling; no chroma key',encoding:{palette:true,colours:256,dither:.2,effort:10,compressionLevel:9,source:'Reproducible full RGBA renderer before palette compression'},timebase:'exact t=i/fps; endpoint at4s is control-only',video:'NOT PRODUCED / UNAVAILABLE: no quality video-motion master',storyboard:STORYBOARD};
const storyboard=createCanvas(W*4,H*2+60),sc=storyboard.getContext('2d');sc.fillStyle='#18131f';sc.fillRect(0,0,storyboard.width,storyboard.height);
const onlyPreview=process.argv.includes('--preview');
for(const state of ['IDLE','SMALL_WIN']){
 for(const fps of (onlyPreview?[8]:[6,8,12])){
  const dir=resolve(out,state.toLowerCase()+'-'+fps);await mkdir(dir,{recursive:true});const frames=[],landmarks=[];
  for(let i=0;i<fps*4;i++){
   const timestampMs=i*1000/fps,sample=sampleMotion(state,i/fps,bones),png=await rendered(state,i/fps),name=state.toLowerCase()+'_'+String(i).padStart(3,'0')+'.png';
   await writeFile(resolve(dir,name),png);frames.push({path:'./assets/m06/'+state.toLowerCase()+'-'+fps+'/'+name,timestampMs,sha256:hash(png),bytes:png.length});landmarks.push(motionLandmarks(sample,bones));
   if(state==='IDLE'&&i===0&&fps===(onlyPreview?8:6))await writeFile(resolve(out,'neutral.png'),png);
  }
  const fadeMs=fps===6?40:fps===8?30:20;
  manifest.clips[state][fps]={fps,frameCount:fps*4,durationMs:4000,fadeMs,frames,faceLandmarks:landmarks,bytes:frames.reduce((n,f)=>n+f.bytes,0),sampling:'direct evaluation at i/fps, not decimation of 12fps',sourceHash};
  console.log(state,fps,'frames',frames.length,'bytes',manifest.clips[state][fps].bytes);
 }
 for(let i=0;i<8;i++){
  const item=STORYBOARD[state][i],png=await rendered(state,item.t);await writeFile(resolve(out,state.toLowerCase()+'-story-'+i+'.png'),png);
  if(state==='SMALL_WIN'){const im=await loadImage(png),x=(i%4)*W,y=Math.floor(i/4)*(H+30);sc.drawImage(im,x,y+25);sc.fillStyle='#e4d2ae';sc.font='15px sans-serif';sc.fillText(item.t.toFixed(2)+'s · '+item.action.slice(0,34),x+8,y+20);}
 }
 const control=await rendered(state,4);await writeFile(resolve(out,state.toLowerCase()+'-endpoint-control.png'),control);
 manifest.clips[state].endpointControl={path:'./assets/m06/'+state.toLowerCase()+'-endpoint-control.png',sha256:hash(control),timestampMs:4000,displayed:false};
}
await writeFile(resolve(out,'small-win-storyboard.png'),await sharp(storyboard.encodeSync('png')).resize(1260).png({palette:true,colours:256,dither:.2,effort:10,compressionLevel:9}).toBuffer());
const poster=await readFile(resolve(out,'neutral.png'));manifest.posterSha256=hash(poster);manifest.posterBytes=poster.length;
manifest.budgets={selectedDownloadBytes:manifest.posterBytes+(manifest.clips.IDLE['6']?.bytes??0)+(manifest.clips.SMALL_WIN['12']?.bytes??0),selectedDecodedMiB:W*H*4*(24+48)/1048576,cpuPlusGpuEstimateMiB:W*H*4*(24+48)*2/1048576,estimateOnly:true};
await writeFile(resolve(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({sourceHash,budgets:manifest.budgets,posterBytes:manifest.posterBytes,previewOnly:onlyPreview}));
