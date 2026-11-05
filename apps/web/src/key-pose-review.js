import {SceneTransport} from './scene-transport.js';
import {sampleStudy} from './key-pose-study.js';
const $=id=>document.getElementById(id),transport=new SceneTransport(),images=new Map();let playing=true,last=null,exporting=false;
const manifest=await fetch('./assets/m07-study/manifest.json').then(r=>r.json());
await Promise.all(manifest.poses.map(async p=>{const im=new Image();im.src=p.path;await im.decode();images.set(p.id,im);}));
for(const p of manifest.poses){
 const card=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption'),link=document.createElement('a');img.src=p.path;img.alt=p.id+' — full key pose';link.href=p.detailPath;link.append(img);caption.textContent=p.id+(p.id==='canonical'?' · 0 / 4000 ms':'');card.append(link,caption);
 for(const hand of ['leftHand','rightHand']){const r=manifest.sourceLandmarks[p.id][hand],x=Math.max(0,r[0]-25),y=Math.max(0,r[1]-25),detail=document.createElement('div'),label=document.createElement('small');detail.className='study-hand';detail.style.width=(r[2]-x+25)+'px';detail.style.height=(r[3]-y+25)+'px';detail.style.backgroundImage=`url(${p.detailPath})`;detail.style.backgroundSize='1254px 1254px';detail.style.backgroundPosition=`${-x}px ${-y}px`;label.textContent=hand==='leftHand'?'Кисть слева · 1:1':'Кисть справа · 1:1';card.append(label,detail);}
 $('study-keys').append(card);
}
function draw(){const pose=sampleStudy(transport.now);$('study-phase').value=String(transport.now%4000);$('study-status').textContent=`${Math.round(transport.now%4000)} ms · ${pose} · stepped study`;if(last===pose)return;last=pose;for(const im of document.querySelectorAll('.study-hero img'))im.src=images.get(pose).src;}
transport.subscribe(draw,5);transport.start();draw();
$('study-play').onclick=()=>{playing=!playing;playing?transport.resume('study'):transport.pause('study');$('study-play').textContent=playing?'Пауза':'Играть';};
$('study-phase').oninput=()=>{playing=false;transport.pause('study');transport.time=Number($('study-phase').value);transport.origin=transport.wallNow()-transport.time;transport.pausedWall=0;transport.pauseStarted=transport.wallNow();last=null;draw();$('study-play').textContent='Играть';};
$('study-silhouette').onchange=()=>document.body.classList.toggle('study-silhouette',$('study-silhouette').checked);
document.addEventListener('visibilitychange',()=>document.hidden?transport.pause('visibility'):transport.resume('visibility'));
$('study-export').onclick=async()=>{
 if(exporting)return;exporting=true;$('study-export').disabled=true;
 try{
  if(!globalThis.MediaRecorder)throw Error('Native video recording unavailable; use key images.');
  const canvas=document.createElement('canvas');canvas.width=624;canvas.height=624;const ctx=canvas.getContext('2d'),stream=canvas.captureStream(30),chunks=[];
  const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/mp4'].find(m=>MediaRecorder.isTypeSupported(m));if(!mime)throw Error('No supported recording format');
  const recorder=new MediaRecorder(stream,{mimeType:mime}),blob=new Promise(resolve=>{recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.onstop=()=>resolve(new Blob(chunks,{type:mime}));});recorder.start();
  const began=performance.now();await new Promise(resolve=>{function frame(now){const phase=Math.min(4000,now-began);ctx.fillStyle='#21192b';ctx.fillRect(0,0,624,624);ctx.drawImage(images.get(sampleStudy(phase)),0,0);if(phase<4000)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});recorder.stop();const url=URL.createObjectURL(await blob),video=$('study-recording');video.src=url;video.hidden=false;const a=document.createElement('a');a.href=url;a.download='m07-stepped-study.'+(mime.startsWith('video/mp4')?'mp4':'webm');a.click();stream.getTracks().forEach(t=>t.stop());$('study-export-status').textContent='4s stepped concept export · four drawings, no smooth in-betweens.';
 }catch(error){$('study-export-status').textContent=error.message;}finally{exporting=false;$('study-export').disabled=false;}
};
window.addEventListener('pagehide',()=>transport.destroy(),{once:true});
