import {CAMERA,MeshStage,retargetPose} from './reference-mesh.js';
const concat=parts=>{const out=new Uint8Array(parts.reduce((s,p)=>s+p.length,0));let i=0;for(const p of parts){out.set(p,i);i+=p.length;}return out;};
const uint=value=>{const bytes=[];do{bytes.unshift(value%256);value=Math.floor(value/256);}while(value);return new Uint8Array(bytes);};
const size=value=>{for(let n=1;n<=8;n++)if(value<2**(7*n)-1){const out=new Uint8Array(n);let v=value;for(let i=n-1;i>=0;i--){out[i]=v%256;v=Math.floor(v/256);}out[0]|=1<<(8-n);return out;}throw Error('EBML size exceeds range');};
const el=(id,payload)=>concat([uint(id),size(payload.length),payload]);
const u=(id,value)=>el(id,uint(value)),s=(id,text)=>el(id,new TextEncoder().encode(text));
export function muxCandidateWebm(chunks,width,height,durationMs=4000) {
 const f=new Uint8Array(8);new DataView(f.buffer).setFloat64(0,durationMs,false);
 const header=el(0x1a45dfa3,concat([u(0x4286,1),u(0x42f7,1),u(0x42f2,4),u(0x42f3,8),s(0x4282,'webm'),u(0x4287,2),u(0x4285,2)]));
 const info=el(0x1549a966,concat([u(0x2ad7b1,1000000),el(0x4489,f),s(0x4d80,'HexHeat M05'),s(0x5741,'HexHeat M05')]));
 const tracks=el(0x1654ae6b,el(0xae,concat([u(0xd7,1),u(0x73c5,1),u(0x83,1),s(0x86,'V_VP8'),u(0x23e383,33333333),el(0xe0,concat([u(0xb0,width),u(0xba,height)]))])));
 const blocks=chunks.sort((a,b)=>a.timestamp-b.timestamp).map(c=>{const time=Math.round(c.timestamp/1000),b=new Uint8Array(4);b[0]=0x81;new DataView(b.buffer).setInt16(1,time,false);b[3]=c.key?0x80:0;return el(0xa3,concat([b,c.data]));});
 return concat([header,el(0x18538067,concat([info,tracks,el(0x1f43b675,concat([u(0xe7,0),...blocks]))]))]);
}
/** Explicit 120 timestamped samples, independent of captureStream throttling. */
export async function exportCandidate(player) {
 if(!globalThis.VideoEncoder||!globalThis.VideoFrame)throw Error('Deterministic video export unavailable in this browser');
 const canvas=document.createElement('canvas');canvas.width=CAMERA.width;canvas.height=CAMERA.height;
 const stage=new MeshStage(canvas,player.stage.meshes,player.stage.images,player.bones),chunks=[];let failure;
 const encoder=new VideoEncoder({output:chunk=>{const data=new Uint8Array(chunk.byteLength);chunk.copyTo(data);chunks.push({data,timestamp:chunk.timestamp,key:chunk.type==='key'});},error:e=>failure=e});
 try {
  encoder.configure({codec:'vp8',width:CAMERA.width,height:CAMERA.height,bitrate:2500000,framerate:30,latencyMode:'quality'});
  for(let i=0;i<120;i++){
   stage.draw(retargetPose(player.clip,i/30,player.bones));const frame=new VideoFrame(canvas,{timestamp:Math.round(i*1000000/30),duration:Math.round(1000000/30)});encoder.encode(frame,{keyFrame:i===0});frame.close();
   if(encoder.encodeQueueSize>3)await encoder.flush();if(failure)throw failure;
   if(i%4===0)await new Promise(resolve=>setTimeout(resolve,0));
  }
  await encoder.flush();if(failure)throw failure;if(chunks.length!==120)throw Error('Incomplete candidate export');
  return new Blob([muxCandidateWebm(chunks,CAMERA.width,CAMERA.height)],{type:'video/webm'});
 }finally{if(encoder.state!=='closed')encoder.close();stage.destroy();}
}
