import { SceneTransport } from './scene-transport.js';
import { PngSequencePlayer, sampleSequence } from './png-sequence-player.js';
import { muxCandidateWebm } from './candidate-recording.js';
const $=id=>document.getElementById(id), transport=new SceneTransport(),players=[];let exportUrl;
const noop={switchTo(){},setReducedMotion(){},destroy(){}};
for(const fps of [6,8,12]){
 const article=document.createElement('article');article.className='variant';
 const title=document.createElement('h2');title.textContent=`${fps} PNG / сек`;
 const container=document.createElement('div');container.className='preview';
 const info=document.createElement('p');article.append(title,container,info);$('variants').append(article);
 const player=new PngSequencePlayer(container,{transport,fallback:noop});player.fpsOverride=fps;player.fadeOverride=fps===6?40:fps===8?30:20;player.setEnabled(true,{immediate:true});players.push(player);
 transport.subscribe(()=>{info.textContent=`${player.container.dataset.media??'loading'} · кадр ${player.container.dataset.mediaFrame??'—'} · fade ${player.fadeOverride}ms`;},30);
}
transport.start();
const preload=async()=>{await Promise.all(players.map(async p=>{await p.prepare();await p.preload('IDLE');await p.preload('SMALL_WIN');}));};
await preload();
$('state').onchange=()=>{for(const p of players)p.switchTo($('state').value);};
$('pause').onclick=()=>{if(transport.reasons.has('manual')){transport.resume('manual');$('pause').textContent='Пауза';}else{transport.pause('manual');$('pause').textContent='Продолжить';}};
$('fade').onchange=()=>{for(const p of players){p.fadeOverride=$('fade').checked?(p.fpsOverride===6?40:p.fpsOverride===8?30:20):0;p.lastDraw='';p.tick();}};
$('reduced').onchange=()=>{for(const p of players)p.setReducedMotion($('reduced').checked);};
$('phase').oninput=()=>{transport.pause('manual');$('pause').textContent='Продолжить';const v=Number($('phase').value);transport.time=v;transport.origin=transport.wallNow()-v-transport.pausedWall;for(const p of players){p.lastDraw='';p.tick();}$('time').textContent=`${(v/1000).toFixed(2)} / 4.00 s`;};
transport.subscribe(({phaseMs})=>{$('phase').value=phaseMs;$('time').textContent=`${(phaseMs/1000).toFixed(2)} / 4.00 s`;},40);
document.addEventListener('visibilitychange',()=>document.hidden?transport.pause('visibility'):transport.resume('visibility'));
$('measure').onclick=async()=>{
 $('measure').disabled=true;for(const p of players){p.stats={changes:0,missedPoses:0,lateMs:[],drawnFrames:0};p.lastIndex=null;}
 const began=performance.now(),start=transport.now,state=$('state').value;let statusUnsubscribe=transport.subscribe(({now})=>{$('progress').textContent=`30 петель · ${Math.min(120,Math.floor((now-start)/1000))}/120 s`;},50);
 await transport.wait(120000);statusUnsubscribe();
 const cases=players.map(p=>{const d=p.diagnostics(),values=[...d.stats.lateMs].sort((a,b)=>a-b);return {fps:p.fpsOverride,state,mode:d.mode,changes:d.stats.changes,missedPoses:d.stats.missedPoses,p95LateMs:values[Math.floor(values.length*.95)]??null,maxLateMs:values.at(-1),estimatedDecodedBytes:d.estimatedDecodedBytes,failures:d.failures};});
 $('results').textContent=JSON.stringify({kind:'desktop-browser-wall-clock',activeMs:transport.now-start,wallMs:performance.now()-began,loops:30,cases,physicalDevices:'UNAVAILABLE',memoryMeasurement:'ESTIMATE ONLY'},null,2);$('progress').textContent='30 петель завершены';$('measure').disabled=false;
};
$('record').onclick=async()=>{
 $('record').disabled=true;
 try{
  if(!globalThis.VideoEncoder)throw Error('WebCodecs export unavailable');
  const p=players.find(v=>v.fpsOverride===v.manifest.selected[$('state').value]?.fps)??players[2],clip=p.clipFor($('state').value),images=clip&&p.resources.get(`${$('state').value}/${clip.fps}`);if(!images)throw Error('Choose a ready IDLE or SMALL_WIN clip');
  const canvas=document.createElement('canvas');canvas.width=p.manifest.width;canvas.height=p.manifest.height;const ctx=canvas.getContext('2d'),alpha=document.createElement('canvas');alpha.width=canvas.width;alpha.height=canvas.height;const ac=alpha.getContext('2d'),chunks=[];let failure;
  const encoder=new VideoEncoder({output:c=>{const data=new Uint8Array(c.byteLength);c.copyTo(data);chunks.push({data,timestamp:c.timestamp,key:c.type==='key'});},error:e=>failure=e});
  try{encoder.configure({codec:'vp8',width:canvas.width,height:canvas.height,bitrate:1400000,framerate:30});
   for(let i=0;i<120;i++){ctx.fillStyle='#1b1422';ctx.fillRect(0,0,canvas.width,canvas.height);const s=sampleSequence(clip,i*1000/30);ac.clearRect(0,0,alpha.width,alpha.height);ac.globalCompositeOperation='source-over';ac.globalAlpha=1-s.mix;ac.drawImage(images[s.index],0,0);if(s.mix){ac.globalCompositeOperation='lighter';ac.globalAlpha=s.mix;ac.drawImage(images[s.next],0,0);}ac.globalAlpha=1;ac.globalCompositeOperation='source-over';ctx.drawImage(alpha,0,0);const frame=new VideoFrame(canvas,{timestamp:Math.round(i*1e6/30),duration:Math.round(1e6/30)});encoder.encode(frame,{keyFrame:i===0});frame.close();if(encoder.encodeQueueSize>3)await encoder.flush();if(failure)throw failure;}
   await encoder.flush();if(failure)throw failure;
  }finally{encoder.close();}
  if(chunks.length!==120)throw Error('Incomplete preview export');if(exportUrl)URL.revokeObjectURL(exportUrl);const url=URL.createObjectURL(new Blob([muxCandidateWebm(chunks,canvas.width,canvas.height)],{type:'video/webm'})),a=document.createElement('a');a.href=url;a.download=`m06-${$('state').value}-png-preview.webm`;a.click();exportUrl=url;const video=$('export-preview');video.src=url;video.hidden=false;video.onloadedmetadata=()=>{$('export-metadata').textContent=JSON.stringify({state:$('state').value,duration:video.duration,width:video.videoWidth,height:video.videoHeight,sourcePngFps:clip.fps,samples:chunks.length,audio:false});};$('progress').textContent=`Preview экспортирован: ${clip.fps} исходных PNG/с, 30 отсчётов видео/с. Это запись PNG, не новый video master.`;
 }catch(e){$('progress').textContent=e.message;}finally{$('record').disabled=false;}
};
window.addEventListener('pagehide',()=>{if(exportUrl)URL.revokeObjectURL(exportUrl);for(const p of players)p.destroy();transport.destroy();});
