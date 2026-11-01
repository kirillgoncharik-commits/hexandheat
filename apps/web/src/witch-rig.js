/** Original authored cabaret choreography. No Spine runtime code. */
export const RIG_WIDTH=896, RIG_HEIGHT=1152, RIG_FPS=30, RIG_SECONDS=4;
export const RIG_STATES=Object.freeze(['IDLE','SMALL_WIN','MEDIUM_WIN','BIG_WIN','BONUS']);
export const RIG_ASSET_PATH='./assets/witch/rig-expressive/';
export const BONES=Object.freeze([
 {name:'root',x:448,y:1104},
 {name:'hips',parent:'root',x:0,y:-390},
 {name:'thigh-left',parent:'hips',x:-35,y:20},
 {name:'boot-left',parent:'thigh-left',x:0,y:180},
 {name:'thigh-right',parent:'hips',x:35,y:20},
 {name:'boot-right',parent:'thigh-right',x:0,y:180},
 {name:'skirt-left',parent:'hips',x:-28,y:0},
 {name:'skirt-right',parent:'hips',x:28,y:0},
 {name:'torso',parent:'hips',x:0,y:-10},
 {name:'hair',parent:'torso',x:0,y:-278},
 {name:'head',parent:'torso',x:0,y:-278},
 {name:'upper-left',parent:'torso',x:-77,y:-243},
 {name:'fore-left',parent:'upper-left',x:-85,y:123},
 {name:'hand-left',parent:'fore-left',x:-75,y:136},
 {name:'upper-right',parent:'torso',x:77,y:-243},
 {name:'fore-right',parent:'upper-right',x:81,y:126},
 {name:'hand-right',parent:'fore-right',x:77,y:136}
]);
export const ATTACHMENTS=Object.freeze([
 {name:'hair',bone:'hair',x:-126,y:-94,width:252,height:287},
 {name:'thigh-left',bone:'thigh-left',x:-45,y:-16,width:82,height:203},
 {name:'boot-left',bone:'boot-left',x:-54,y:-17,width:96,height:226},
 {name:'thigh-right',bone:'thigh-right',x:-37,y:-16,width:82,height:207},
 {name:'boot-right',bone:'boot-right',x:-42,y:-17,width:96,height:226},
 {name:'skirt-left',bone:'skirt-left',x:-225,y:-8,width:240,height:390},
 {name:'skirt-right',bone:'skirt-right',x:15,y:-8,width:240,height:390},
 {name:'hips',bone:'hips',x:-108,y:-38,width:216,height:147},
 {name:'upper-left',bone:'upper-left',x:-107,y:-27,width:137,height:163},
 {name:'upper-right',bone:'upper-right',x:-24,y:-24,width:127,height:160},
 {name:'torso',bone:'torso',x:-108,y:-285,width:216,height:290},
 {name:'fore-left',bone:'fore-left',x:-87,y:-12,width:110,height:157},
 {name:'fore-right',bone:'fore-right',x:-24,y:-13,width:114,height:158},
 {name:'hand-left',bone:'hand-left',x:-60,y:-3,width:89,height:99},
 {name:'hand-right',bone:'hand-right',x:-23,y:-3,width:89,height:97},
 {name:'head',bone:'head',x:-133,y:-198,width:266,height:271}
]);
const TAU=Math.PI*2, rad=x=>x*Math.PI/180, deg=x=>x*180/Math.PI;
const TIMES=[0,.14,.34,.56,.78,1];
/** Timed gestures, not one energy scalar. Every channel returns to its shared seam. */
export const CHOREOGRAPHY=Object.freeze({
 IDLE:{hipX:[0,8,-10,12,-7,0],hipY:[0,1,3,0,2,0],hipR:[0,2,-3,3,-2,0],torsoR:[0,-2,3,-3,2,0],headR:[0,-3,5,-4,3,0],armL:[0,5,12,6,-3,0],armR:[0,-12,-28,-14,3,0],foreL:[0,12,25,12,-5,0],foreR:[0,-35,-88,-40,-8,0],wristL:[0,-8,10,-6,5,0],wristR:[0,8,24,-16,5,0],stepL:[0,0,0,0,0,0],stepR:[0,0,0,0,0,0]},
 SMALL_WIN:{hipX:[0,-10,25,-20,14,0],hipY:[0,5,-2,5,1,0],hipR:[0,-3,7,-6,4,0],torsoR:[0,4,-9,7,-4,0],headR:[0,5,-8,5,-3,0],armL:[0,-6,-12,-4,3,0],armR:[0,6,-42,-30,-12,0],foreL:[0,8,18,21,8,0],foreR:[0,-18,-110,-72,-25,0],wristL:[0,10,-17,12,-8,0],wristR:[0,18,-28,30,-12,0],stepL:[0,0,0,12,0,0],stepR:[0,0,8,0,0,0]},
 MEDIUM_WIN:{hipX:[0,-18,30,-30,20,0],hipY:[0,6,-4,7,1,0],hipR:[0,-6,10,-10,6,0],torsoR:[0,7,-13,12,-7,0],headR:[0,7,-11,9,-5,0],armL:[0,-12,55,78,26,0],armR:[0,14,-78,-48,-20,0],foreL:[0,24,90,52,64,0],foreR:[0,-28,-54,-102,-32,0],wristL:[0,-16,32,-26,20,0],wristR:[0,18,-27,31,-20,0],stepL:[0,0,0,22,0,0],stepR:[0,0,18,0,0,0]},
 BIG_WIN:{hipX:[0,-28,48,-48,32,0],hipY:[0,10,-3,9,2,0],hipR:[0,-8,13,-12,8,0],torsoR:[0,10,-17,15,-9,0],headR:[0,9,-13,11,-7,0],armL:[0,-18,103,58,86,0],armR:[0,18,-58,-103,-64,0],foreL:[0,35,58,102,62,0],foreR:[0,-35,-102,-58,-90,0],wristL:[0,-22,38,-32,25,0],wristR:[0,22,-32,38,-25,0],stepL:[0,0,0,30,0,0],stepR:[0,0,26,0,0,0]},
 BONUS:{hipX:[0,-14,23,-23,15,0],hipY:[0,6,0,8,2,0],hipR:[0,-5,8,-8,5,0],torsoR:[0,6,-10,10,-6,0],headR:[0,-7,10,-9,5,0],armL:[0,-10,65,100,30,0],armR:[0,10,-65,-100,-30,0],foreL:[0,65,106,55,118,0],foreR:[0,-65,-106,-55,-118,0],wristL:[0,-26,42,-30,34,0],wristR:[0,26,-42,30,-34,0],stepL:[0,0,0,14,0,0],stepR:[0,0,14,0,0,0]}
});

/** Cubic Hermite: continuous velocity between beats, zero authored offset velocity at seams. */
export function gesture(values,p) {
 let i=0;while(i<TIMES.length-2&&p>TIMES[i+1])i++;
 const span=TIMES[i+1]-TIMES[i],t=(p-TIMES[i])/span;
 const tangent=k=>k===0||k===values.length-1?0:(values[k+1]-values[k-1])/(TIMES[k+1]-TIMES[k-1]);
 const a=values[i],b=values[i+1],ma=tangent(i)*span,mb=tangent(i+1)*span;
 return (2*t*t*t-3*t*t+1)*a+(t*t*t-2*t*t+t)*ma+(-2*t*t*t+3*t*t)*b+(t*t*t-t*t)*mb;
}
function legIK(hip,foot,side) {
 const angle=rad(hip.rotation??0),c=Math.cos(angle),s=Math.sin(angle),jointX=side==='left'?-35:35;
 // Convert planted world target into the rotating hips' local space.
 const worldHip={x:448+(hip.x??0)+c*jointX-s*20,y:714+(hip.y??0)+s*jointX+c*20};
 const dx=foot.x-worldHip.x,dy=foot.y-worldHip.y;
 const localX=c*dx+s*dy,localY=-s*dx+c*dy;
 const l1=180,l2=210,d2=localX*localX+localY*localY;
 const knee=Math.acos(Math.max(-1,Math.min(1,(d2-l1*l1-l2*l2)/(2*l1*l2))))*-1;
 const upper=Math.atan2(localY,localX)-Math.atan2(l2*Math.sin(knee),l1+l2*Math.cos(knee))-Math.PI/2;
 return {upper:deg(upper),lower:deg(knee)};
}
export function footTargets(state,seconds) {
 const p=((seconds%4)+4)%4/4,g=CHOREOGRAPHY[state];
 return {left:{x:401,y:1104-Math.max(0,gesture(g.stepL,p))},right:{x:495,y:1104-Math.max(0,gesture(g.stepR,p))}};
}
export function sampleRig(state,seconds) {
 if(!RIG_STATES.includes(state))throw Error('Unknown rig state');
 const p=((seconds%4)+4)%4/4,a=p*TAU,g=CHOREOGRAPHY[state],v=k=>gesture(g[k],p),env=Math.sin(Math.PI*p)**2;
 // A shared breathing/weight-shift velocity crosses the seam: no dead stop each four seconds.
 const hip={x:8*Math.sin(a)+v('hipX'),y:2*(1-Math.cos(a*2))+v('hipY'),rotation:1.3*Math.sin(a)+v('hipR')};
 const follow=Math.sin(a-.65)*env,skirtFlow=Math.sin(a*2-1.1)*env;
 const feet=footTargets(state,seconds),left=legIK(hip,feet.left,'left'),right=legIK(hip,feet.right,'right');
 return {
  hips:hip,torso:{rotation:-.7*Math.sin(a)+v('torsoR'),x:-v('hipX')*.15,y:-3*env},
  head:{rotation:v('headR')+.8*Math.sin(a),x:Math.sin(a+.4)*env*3},
  hair:{rotation:-v('torsoR')*.45-7*follow,x:-6*follow,y:2*skirtFlow},
  'upper-left':{rotation:v('armL')},'upper-right':{rotation:v('armR')},
  'fore-left':{rotation:v('foreL')},'fore-right':{rotation:v('foreR')},
  'hand-left':{rotation:v('wristL')},'hand-right':{rotation:v('wristR')},
  'skirt-left':{rotation:-v('hipR')*.48+5*skirtFlow,x:-3*follow},
  'skirt-right':{rotation:-v('hipR')*.48-5*skirtFlow,x:3*follow},
  'thigh-left':{rotation:left.upper},'boot-left':{rotation:left.lower},
  'thigh-right':{rotation:right.upper},'boot-right':{rotation:right.lower}
 };
}
export function mixPose(a,b,weight) {
 const result={};for(const bone of BONES){result[bone.name]={};for(const key of ['x','y','rotation'])result[bone.name][key]=(a[bone.name]?.[key]??0)*(1-weight)+(b[bone.name]?.[key]??0)*weight;}return result;
}
export function rigWorld(pose) {
 const matrices={};for(const bone of BONES){const d=pose[bone.name]??{},theta=rad((bone.rotation??0)+(d.rotation??0)),c=Math.cos(theta),s=Math.sin(theta),x=bone.x+(d.x??0),y=bone.y+(d.y??0),m=[c,s,-s,c,x,y],parent=matrices[bone.parent];
 matrices[bone.name]=parent?[parent[0]*m[0]+parent[2]*m[1],parent[1]*m[0]+parent[3]*m[1],parent[0]*m[2]+parent[2]*m[3],parent[1]*m[2]+parent[3]*m[3],parent[0]*x+parent[2]*y+parent[4],parent[1]*x+parent[3]*y+parent[5]]:m;}return matrices;
}
export function drawRig(ctx,images,pose,{scale=1}={}) {
 const world=rigWorld(pose);ctx.save();ctx.scale(scale,scale);for(const p of ATTACHMENTS){ctx.save();ctx.transform(...world[p.bone]);ctx.drawImage(images[p.name],p.x,p.y,p.width,p.height);ctx.restore();}ctx.restore();return world;
}
export function makeSpineData() {
 const bones=BONES.map(b=>({name:b.name,...(b.parent?{parent:b.parent}:{}),x:b.name==='root'?0:b.x,y:b.name==='root'?0:-b.y,rotation:-(b.rotation??0)}));
 const slots=ATTACHMENTS.map(p=>({name:p.name,bone:p.bone,attachment:p.name}));
 const attachments=Object.fromEntries(ATTACHMENTS.map(p=>[p.name,{[p.name]:{type:'region',path:p.name,x:p.x+p.width/2,y:-(p.y+p.height/2),width:p.width,height:p.height}}]));
 const animations={};for(const state of RIG_STATES){const timelines={};for(const bone of BONES){const rotate=[],translate=[];for(let frame=0;frame<=120;frame++){const time=frame/30,d=sampleRig(state,time)[bone.name]??{};rotate.push({time:+time.toFixed(6),value:-(d.rotation??0)});translate.push({time:+time.toFixed(6),x:d.x??0,y:-(d.y??0)});}if(rotate.some(k=>k.value))(timelines[bone.name]??={}).rotate=rotate;if(translate.some(k=>k.x||k.y))(timelines[bone.name]??={}).translate=translate;}animations[state]={bones:timelines,events:[{time:0,name:'seam'},{time:4,name:'seam'}]};}
 return {skeleton:{spine:'4.2.0',x:-448,y:0,width:896,height:1152,images:'./',fps:30},bones,slots,skins:[{name:'default',attachments}],events:{seam:{}},animations};
}
