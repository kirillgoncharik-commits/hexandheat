/** M06 authored upper-body performance. Original v7 art; no CMU samples. */
import {restTransforms} from './reference-mesh.js';
export const M06_CAMERA = Object.freeze({width:420,height:336,canonicalCrop:[90,105,900,720],scale:7/15,pivot:[197,287],face:{forehead:[518,168],chin:[519,286]}});
export const STORYBOARD = Object.freeze({
 IDLE:[
  {t:0,action:'shared neutral; breathing begins'},
  {t:.5,action:'weight settles; head leads attention'},
  {t:1,action:'small downwards head inclination toward board'},
  {t:1.6,action:'left wrist settles a restrained invitation'},
  {t:2.15,action:'single soft blink; relaxed mouth'},
  {t:2.7,action:'hair follows recovery'},
  {t:3.3,action:'attention returns without a win gesture'},
  {t:4,action:'shared neutral and matching tangent'}
 ],
 SMALL_WIN:[
  {t:0,action:'shared neutral'},
  {t:.42,action:'anticipation; slight lowering and counter-lean'},
  {t:.9,action:'torso turns; right shoulder starts first'},
  {t:1.45,action:'elbow opens; forearm follows'},
  {t:1.95,action:'wrist flourish and restrained smile accent'},
  {t:2.55,action:'gesture releases; cloth and hair continue'},
  {t:3.25,action:'arms return on unequal trajectories'},
  {t:4,action:'shared neutral and matching tangent'}
 ]
});
const TIMES=[0,.42,.9,1.45,1.95,2.55,3.25,4];
// Editable staging curves, in canonical pixels / radians. Endpoint tangents are zero.
const WIN={x:[0,-10,9,24,18,4,-8,0],y:[0,8,1,-5,-2,2,0,0],lean:[0,-.035,.045,.075,.055,-.005,-.025,0],head:[0,.025,-.03,-.065,-.1,-.045,.025,0],ur:[0,-.035,.13,.39,.48,.31,.08,0],fr:[0,.04,-.08,-.63,-1.05,-.72,-.16,0],hr:[0,.03,-.08,-.82,-1.42,-.8,-.08,0],ul:[0,.025,.02,-.19,-.30,-.17,-.02,0],fl:[0,-.02,.04,.18,.25,.18,.06,0],hl:[0,-.03,.08,.3,.4,.2,.04,0],smile:[0,0,.1,.5,1,.65,.1,0]};
const IDLE={x:[0,2,5,7,3,-2,-3,0],y:[0,0,-1,0,1,0,-1,0],lean:[0,.006,.012,.015,.006,-.008,-.006,0],head:[0,.008,.03,.055,.03,-.012,-.015,0],ur:[0,.004,-.006,-.016,-.009,.005,.008,0],fr:[0,-.004,-.018,-.025,-.005,.012,.008,0],hr:[0,-.006,-.025,-.04,-.008,.02,.01,0],ul:[0,-.006,-.012,-.014,-.008,.005,.004,0],fl:[0,.015,.045,.075,.05,.01,-.005,0],hl:[0,.025,.08,.13,.08,.005,-.01,0],smile:[0,0,0,.05,.08,.03,0,0]};
export const MOTION_CURVES=Object.freeze({IDLE,SMALL_WIN:WIN,times:TIMES});
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const rotate=(v,a)=>[v[0]*Math.cos(a)-v[1]*Math.sin(a),v[0]*Math.sin(a)+v[1]*Math.cos(a)];
function curve(values,t){
 let i=0;while(i<TIMES.length-2&&t>TIMES[i+1])i++;
 const h=TIMES[i+1]-TIMES[i],u=(t-TIMES[i])/h;
 const tangent=k=>k===0||k===TIMES.length-1?0:(values[k+1]-values[k-1])/(TIMES[k+1]-TIMES[k-1]);
 return (2*u**3-3*u*u+1)*values[i]+(u**3-2*u*u+u)*h*tangent(i)+(-2*u**3+3*u*u)*values[i+1]+(u**3-u*u)*h*tangent(i+1);
}
export function sampleMotion(state,seconds,bones){
 const t=clamp(seconds,0,4),curves=state==='SMALL_WIN'?WIN:IDLE;
 const q=Object.fromEntries(Object.entries(curves).map(([k,v])=>[k,curve(v,t)]));
 // A shared periodic breath has nonzero identical velocity across both clip seams.
 const phase=t/4*Math.PI*2,breath=Math.sin(phase),rise=(1-Math.cos(phase));
 const rest=restTransforms(bones),pose=restTransforms(bones);
 pose.hips.position=[rest.hips.position[0]+q.x,rest.hips.position[1]+q.y+breath*1.2];pose.hips.rotation=q.lean*.3;
 function under(name,parent,rotation){const delta=rest[name].position.map((v,k)=>v-rest[parent].position[k]),r=rotate(delta,pose[parent].rotation);pose[name]={position:r.map((v,k)=>v+pose[parent].position[k]),rotation,scaleX:1};}
 under('waist','hips',q.lean*.6);under('chest','waist',q.lean);pose.chest.position[1]-=rise*1.3;
 under('head','chest',q.head+q.lean*.35+breath*.004);
 for(const side of ['left','right']){
  const s=side==='left'?'l':'r';under('upper-'+side,'chest',q['u'+s]+q.lean*.5+(side==='left'?-.1:.1));
  under('fore-'+side,'upper-'+side,q['f'+s]+(side==='left'?.15:-.15));
  under('joint-'+side,'upper-'+side,(q['u'+s]+q['f'+s])*.5);
  under('hand-'+side,'fore-'+side,q['h'+s]+(side==='left'?.15:-.15));
  under('thigh-'+side,'hips',0);under('shin-'+side,'thigh-'+side,0);under('foot-'+side,'shin-'+side,0);
  const lag=(curve(curves.lean,Math.max(0,t-.13))-q.lean)*Math.sin(Math.PI*t/4)**2;
  under('skirt-'+side,'hips',q.lean*.15+lag*.4);pose['skirt-'+side].position[0]+=lag*70;
  under('hair-'+side,'head',pose.head.rotation*.8+lag*.22);pose['hair-'+side].position[0]+=lag*32;
 }
 under('skirt-mid','hips',q.lean*.12);
 const blink=state==='IDLE'?Math.exp(-(((t-2.14)/.085)**2)):Math.exp(-(((t-.34)/.075)**2))*.8;
 return {pose,blink,smile:q.smile};
}
export function transformSourcePoint(point,pose,bones,boneName='head'){
 const bone=bones.find(b=>b.name===boneName),p=pose[boneName],v=rotate(point.map((x,k)=>x-bone.position[k]),p.rotation);
 return v.map((x,k)=>(x+p.position[k]-M06_CAMERA.canonicalCrop[k])*M06_CAMERA.scale);
}
export function motionLandmarks(sample,bones){
 const {pose}=sample,face=M06_CAMERA.face;
 return {forehead:transformSourcePoint(face.forehead,pose,bones),chin:transformSourcePoint(face.chin,pose,bones),
  leftWrist:transformSourcePoint([202,705],pose,bones,'hand-left'),rightWrist:transformSourcePoint([811,705],pose,bones,'hand-right')};
}
