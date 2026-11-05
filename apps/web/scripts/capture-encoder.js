import {muxCandidateWebm} from '../src/candidate-recording.js';
const $=id=>document.getElementById(id),name=new URL(location.href).searchParams.get('mode')==='fast'?'fast':'normal';
$('encode').onclick=async()=>{
 $('encode').disabled=true;
 try{
  if(!globalThis.VideoEncoder||!globalThis.VideoFrame)throw Error('Native VideoEncoder unavailable');
  const base=`../.cache/m07-captures/${name}/`,meta=await fetch(base+'frames.json').then(r=>r.json()),canvas=document.createElement('canvas'),chunks=[];canvas.width=meta.width;canvas.height=meta.height;const ctx=canvas.getContext('2d');let failure;
  const encoder=new VideoEncoder({output:c=>{const data=new Uint8Array(c.byteLength);c.copyTo(data);chunks.push({data,timestamp:c.timestamp,key:c.type==='key'});},error:e=>failure=e});
  try{
   encoder.configure({codec:'vp8',width:meta.width,height:meta.height,bitrate:3500000,framerate:30,latencyMode:'quality'});
   for(let n=0;n<meta.frames.length;n++){
    const f=meta.frames[n],image=new Image();image.src=base+f.file;await image.decode();ctx.drawImage(image,0,0);const duration=Math.max(1,(meta.frames[n+1]?.at??meta.durationMs)-f.at),frame=new VideoFrame(canvas,{timestamp:Math.round(f.at*1000),duration:Math.round(duration*1000)});encoder.encode(frame,{keyFrame:n===0});frame.close();image.src='';if(encoder.encodeQueueSize>3)await encoder.flush();if(failure)throw failure;$('status').textContent=`${n+1}/${meta.frames.length}`;
   }
   await encoder.flush();if(failure)throw failure;
  }finally{if(encoder.state!=='closed')encoder.close();}
  const blob=new Blob([muxCandidateWebm(chunks,meta.width,meta.height,meta.durationMs)],{type:'video/webm'}),url=URL.createObjectURL(blob);$('download').href=url;$('download').download=`m07-gameplay-${name}.webm`;$('download').hidden=false;$('preview').src=url;$('preview').hidden=false;$('status').textContent=JSON.stringify({status:'PASS',frames:chunks.length,durationMs:meta.durationMs,width:meta.width,height:meta.height,capture:'native browser screenshots, original timestamps, silent;0.8s final hold',averageCaptureFps:meta.averageCaptureFps});document.body.dataset.captureStatus='PASS';
 }catch(e){$('status').textContent=e.stack??e.message;document.body.dataset.captureStatus='FAIL';}finally{$('encode').disabled=false;}
};
