/** Registered source-layer extraction. No creative painting or anisotropic scaling. */
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);
const {createCanvas,loadImage}=require(resolve(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES??'node_modules','@napi-rs/canvas'));
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const source=resolve(process.argv[2]??resolve(root,'../hexheat-reference-cycle-media/masters')),out=resolve(root,'apps/web/assets/witch/reference-cycle'),qa=resolve(process.argv[3]??resolve(root,'../hexheat-reference-cycle-media/renders'));
await mkdir(out,{recursive:true});await mkdir(qa,{recursive:true});
const sourceWidth=1024,sourceHeight=1536;
const landmarks={
 hips:[516,710],waist:[518,578],chest:[519,424],neck:[516,316],head:[515,235],
 'shoulder-left':[397,382],'elbow-left':[307,571],'wrist-left':[202,705],'hand-left':[160,782],
 'shoulder-right':[632,382],'elbow-right':[724,571],'wrist-right':[811,705],'hand-right':[859,782],
 'hip-left':[453,783],'knee-left':[414,1137],'ankle-left':[389,1460],'foot-left':[380,1500],
 'hip-right':[568,783],'knee-right':[593,1137],'ankle-right':[622,1460],'foot-right':[637,1500]
};
const definitions=[
 {name:'leg-left',source:'legs-overlap.png',polygon:[[382,796],[502,796],[498,892],[484,1005],[461,1120],[451,1191],[446,1320],[428,1469],[430,1501],[404,1525],[344,1525],[338,1495],[349,1447],[356,1399],[351,1310],[352,1190],[370,1105],[380,1010],[381,905]]},
 {name:'leg-right',source:'legs-overlap.png',polygon:[[520,796],[639,796],[641,908],[647,1002],[641,1108],[643,1215],[654,1343],[667,1448],[678,1499],[668,1525],[610,1525],[585,1502],[584,1460],[574,1350],[561,1233],[546,1138],[537,1038],[527,929]]},
 {name:'garment',source:'garment-overlap.png',polygon:[[464,284],[543,284],[554,328],[594,348],[621,363],[637,411],[638,469],[617,526],[610,567],[634,616],[673,670],[715,807],[784,983],[854,1136],[931,1267],[1004,1346],[1000,1405],[950,1459],[840,1480],[665,1485],[512,1471],[350,1485],[171,1480],[55,1448],[20,1389],[24,1300],[90,1218],[168,1102],[239,948],[300,797],[345,675],[393,617],[427,567],[429,522],[408,467],[394,417],[399,373],[427,345],[460,328]],holes:[[[603,818],[626,900],[639,1010],[647,1135],[654,1273],[666,1434],[584,1461],[559,1424],[541,1312],[529,1193],[530,1091],[549,995],[575,909]]]},
 {name:'arm-left',source:'canonical-setup.png',polygon:[[385,336],[433,347],[440,385],[423,431],[411,473],[408,525],[380,575],[340,620],[286,671],[231,706],[218,749],[191,791],[175,822],[147,849],[122,831],[119,792],[136,751],[167,716],[184,687],[184,648],[194,608],[224,571],[264,531],[295,479],[326,431],[343,381],[362,348]]},
 {name:'arm-right',source:'canonical-setup.png',polygon:[[598,341],[636,336],[658,350],[679,385],[692,431],[718,470],[751,518],[791,563],[822,602],[834,642],[829,679],[841,713],[867,749],[883,792],[885,829],[866,850],[842,824],[824,790],[805,748],[791,708],[743,680],[699,645],[666,610],[640,570],[626,525],[620,472],[604,425],[591,383]]},
 {name:'head-hair',source:'canonical-setup.png',polygon:[[340,0],[703,0],[739,109],[727,219],[712,268],[733,320],[751,386],[740,459],[717,510],[677,551],[671,508],[662,457],[648,407],[627,358],[592,346],[574,319],[567,294],[566,329],[543,356],[482,356],[474,329],[475,295],[461,323],[436,344],[401,349],[377,359],[368,403],[359,445],[371,492],[373,548],[321,539],[278,504],[249,451],[238,384],[250,308],[270,242],[309,188],[310,130]],extras:[[[410,270],[630,270],[644,375],[395,375]]]}
];
const imageCache={};
for(const filename of new Set(definitions.map(d=>d.source))){const bytes=await readFile(resolve(source,filename));const image=await loadImage(resolve(source,filename));if(image.width!==sourceWidth||image.height!==sourceHeight)throw Error('Source dimensions changed: '+filename);imageCache[filename]={image,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length};}
function path(ctx,points){ctx.moveTo(...points[0]);for(const point of points.slice(1))ctx.lineTo(...point);ctx.closePath();}
function removeDisconnectedDust(ctx,w,h){
 const pixels=ctx.getImageData(0,0,w,h),labels=new Int32Array(w*h),queue=new Int32Array(w*h);let id=0,best=0,bestCount=0;
 for(let p=0;p<w*h;p++){if(labels[p]||pixels.data[p*4+3]<1)continue;id++;let head=0,tail=1;queue[0]=p;labels[p]=id;while(head<tail){const q=queue[head++],x=q%w,y=Math.floor(q/w);for(const n of [x?q-1:-1,x<w-1?q+1:-1,y?q-w:-1,y<h-1?q+w:-1])if(n>=0&&!labels[n]&&pixels.data[n*4+3]>=1){labels[n]=id;queue[tail++]=n;}}if(tail>bestCount){bestCount=tail;best=id;}}
 for(let p=0;p<w*h;p++)if(labels[p]!==best)pixels.data[p*4+3]=0;ctx.putImageData(pixels,0,0);
}
const layers=[];
for(const d of definitions){
 const xs=d.polygon.map(p=>p[0]),ys=d.polygon.map(p=>p[1]);
 const x=Math.max(0,Math.floor(Math.min(...xs))),y=Math.max(0,Math.floor(Math.min(...ys))),w=Math.min(sourceWidth,Math.ceil(Math.max(...xs)))-x,h=Math.min(sourceHeight,Math.ceil(Math.max(...ys)))-y;
 const canvas=createCanvas(w,h),ctx=canvas.getContext('2d');ctx.save();ctx.translate(-x,-y);ctx.beginPath();path(ctx,d.polygon);for(const hole of d.holes??[])path(ctx,hole);ctx.clip('evenodd');ctx.drawImage(imageCache[d.source].image,0,0);
 if(d.extras){ctx.restore();const extra=canvas.getContext('2d');extra.resetTransform();for(const points of d.extras){extra.save();extra.translate(-x,-y);extra.beginPath();path(extra,points);extra.clip();extra.globalCompositeOperation='copy';extra.drawImage(imageCache[d.source].image,0,0);extra.restore();}}
 if(d.name.startsWith('arm-'))removeDisconnectedDust(ctx,w,h);
 const bytes=canvas.encodeSync('png');const png=d.name+'.png';await writeFile(resolve(out,png),bytes);
 layers.push({name:d.name,png,source:d.source,sourceBounds:[x,y,w,h],polygon:d.polygon,...(d.holes?{holes:d.holes}:{}),...(d.extras?{extras:d.extras}:{}),bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
}
const metadata={schemaVersion:1,sourceWidth,sourceHeight,coordinateSystem:'canonical pixels; viewer left/right; all layers share one setup registration',landmarks,layers,sources:Object.fromEntries(Object.entries(imageCache).map(([name,d])=>[name,{sha256:d.sha256,bytes:d.bytes}])),processing:'Polygon clipping of source pixels; disconnected arm-mask dust removed. No creative painting, recolor, per-layer scaling or resampling in this extraction step. Hidden garment/leg reconstruction was generated separately.',status:'Source-layer candidate. Pose/mesh/native-editor and human art review remain open.'};
await writeFile(resolve(out,'layers.json'),JSON.stringify(metadata,null,2)+'\n');
const assembled=createCanvas(sourceWidth,sourceHeight),ctx=assembled.getContext('2d');for(const layer of layers){ctx.drawImage(await loadImage(resolve(out,layer.png)),layer.sourceBounds[0],layer.sourceBounds[1]);}await writeFile(resolve(qa,'assembled.png'),assembled.encodeSync('png'));
const panel=createCanvas(1536,1152),p=panel.getContext('2d');p.fillStyle='#ece8df';p.fillRect(0,0,panel.width,panel.height);
for(let i=0;i<layers.length;i++){const layer=layers[i],x=(i%3)*512,y=Math.floor(i/3)*576;p.save();p.translate(x,y);p.fillStyle=i%2?'#302839':'#382c39';p.fillRect(8,8,496,560);p.fillStyle='#eee2ca';p.font='18px sans-serif';p.fillText(layer.name,24,34);p.translate(32,60);p.scale(.29,.29);p.drawImage(await loadImage(resolve(out,layer.png)),layer.sourceBounds[0],layer.sourceBounds[1]);p.restore();}
await writeFile(resolve(qa,'layers-contact.png'),panel.encodeSync('png'));
const compare=createCanvas(1536,1152),c=compare.getContext('2d');for(let i=0;i<3;i++){c.fillStyle=['#1c1324','#efede8','#766e7c'][i];c.fillRect(i*512,0,512,1152);c.save();c.translate(i*512,0);c.scale(.5,.5);c.drawImage(assembled,0,0);c.restore();}await writeFile(resolve(qa,'assembled-backgrounds.png'),compare.encodeSync('png'));
console.log(JSON.stringify({out,qa,layers:layers.map(l=>({name:l.name,bounds:l.sourceBounds,bytes:l.bytes}))}));
