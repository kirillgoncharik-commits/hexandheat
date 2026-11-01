/** Original cutout rig data. Renderer-independent; no Spine runtime code. */
export const RIG_WIDTH = 768;
export const RIG_HEIGHT = 1024;
export const RIG_FPS = 30;
export const RIG_SECONDS = 4;
export const RIG_STATES = Object.freeze(['IDLE','SMALL_WIN','MEDIUM_WIN','BIG_WIN','BONUS']);
export const BONES = Object.freeze([
  { name:'root', x:384, y:974 },
  { name:'hips', parent:'root', x:0, y:-410 },
  { name:'skirt', parent:'hips', x:0, y:0 },
  { name:'torso', parent:'hips', x:0, y:-5 },
  { name:'hair', parent:'torso', x:0, y:-280 },
  { name:'head', parent:'torso', x:0, y:-280 },
  { name:'upper-left', parent:'torso', x:-88, y:-245, rotation:4 },
  { name:'fore-left', parent:'upper-left', x:0, y:150, rotation:-10 },
  { name:'upper-right', parent:'torso', x:88, y:-245, rotation:-4 },
  { name:'fore-right', parent:'upper-right', x:0, y:150, rotation:10 }
]);
export const ATTACHMENTS = Object.freeze([
  { name:'hair', bone:'hair', x:-110, y:-90, width:220, height:330 },
  { name:'skirt', bone:'skirt', x:-210, y:-55, width:420, height:465 },
  { name:'upper-left', bone:'upper-left', x:-48, y:-19, width:96, height:174 },
  { name:'upper-right', bone:'upper-right', x:-48, y:-19, width:96, height:174 },
  { name:'torso', bone:'torso', x:-110, y:-285, width:220, height:301 },
  { name:'fore-left', bone:'fore-left', x:-43, y:-20, width:86, height:165 },
  { name:'fore-right', bone:'fore-right', x:-41, y:-20, width:82, height:176 },
  { name:'head', bone:'head', x:-130, y:-206, width:260, height:292 }
]);
const radians = d => d*Math.PI/180;
const DEG = 180/Math.PI;

/** All clips share an identical C1 neutral seam; actual limbs move, not just a flat sprite. */
export function sampleRig(state, seconds) {
  if(!RIG_STATES.includes(state)) throw Error('Unknown rig state');
  const p=((seconds%4)+4)%4/4, a=p*Math.PI*2;
  const envelope=(1-Math.cos(a))/2, sway=Math.sin(a)*envelope;
  const energy={IDLE:0.35,SMALL_WIN:0.65,MEDIUM_WIN:1,BIG_WIN:1.35,BONUS:0.8}[state];
  const hipAngle=1.6*energy*sway, hipRad=radians(hipAngle);
  const raise={IDLE:2,SMALL_WIN:10,MEDIUM_WIN:23,BIG_WIN:38,BONUS:17}[state]*envelope;
  const bend=(state==='BONUS'?-127:state==='BIG_WIN'?32:state==='MEDIUM_WIN'?15:4)*envelope;
  return {
    hips:{ x:Math.sin(hipRad)*410, y:410*(1-Math.cos(hipRad)), rotation:hipAngle },
    torso:{ rotation:-hipAngle*0.5, y:-2.5*energy*envelope },
    head:{ rotation:1.4*energy*sway },
    hair:{ rotation:-2.4*energy*sway, x:1.5*energy*Math.sin(a*2)*envelope },
    'upper-left':{ rotation:raise+1.8*energy*sway },
    'upper-right':{ rotation:-raise+1.8*energy*sway },
    'fore-left':{ rotation:bend+1.1*energy*sway },
    'fore-right':{ rotation:-bend+1.1*energy*sway }
  };
}

export function mixPose(a,b,weight) {
  const result={};
  for(const bone of BONES) {
    result[bone.name]={};
    for(const key of ['x','y','rotation']) result[bone.name][key]=(a[bone.name]?.[key]??0)*(1-weight)+(b[bone.name]?.[key]??0)*weight;
  }
  return result;
}

export function rigWorld(pose) {
  const matrices={};
  for(const bone of BONES) {
    const delta=pose[bone.name]??{};const theta=radians((bone.rotation??0)+(delta.rotation??0));
    const c=Math.cos(theta),s=Math.sin(theta),x=bone.x+(delta.x??0),y=bone.y+(delta.y??0);
    const m=[c,s,-s,c,x,y],parent=matrices[bone.parent];
    matrices[bone.name]=parent ? [parent[0]*m[0]+parent[2]*m[1],parent[1]*m[0]+parent[3]*m[1],parent[0]*m[2]+parent[2]*m[3],parent[1]*m[2]+parent[3]*m[3],parent[0]*x+parent[2]*y+parent[4],parent[1]*x+parent[3]*y+parent[5]] : m;
  }
  return matrices;
}

export function drawRig(context, images, pose, { scale=1 }={}) {
  const world=rigWorld(pose);
  context.save(); context.scale(scale,scale);
  for(const part of ATTACHMENTS) {
    context.save();context.transform(...world[part.bone]);
    context.drawImage(images[part.name],part.x,part.y,part.width,part.height);context.restore();
  }
  context.restore();return world;
}

/** Portable region/bone animation data for Spine Import Data; editor validation still required. */
export function makeSpineData() {
  const bones=BONES.map(b=>({name:b.name,...(b.parent?{parent:b.parent}:{}),x:b.name==='root'?0:b.x,y:b.name==='root'?0:-b.y,rotation:-(b.rotation??0)}));
  const slots=ATTACHMENTS.map(p=>({name:p.name,bone:p.bone,attachment:p.name}));
  const attachments=Object.fromEntries(ATTACHMENTS.map(p=>[p.name,{[p.name]:{type:'region',path:p.name,x:p.x+p.width/2,y:-(p.y+p.height/2),width:p.width,height:p.height}}]));
  const animations={};
  for(const state of RIG_STATES) {
    const timelines={};
    for(const bone of BONES) {
      const rotate=[],translate=[];
      for(let frame=0;frame<=RIG_FPS*RIG_SECONDS;frame++) {
        const time=frame/RIG_FPS,delta=sampleRig(state,time)[bone.name]??{};
        rotate.push({time:+time.toFixed(6),value:-(delta.rotation??0)});
        translate.push({time:+time.toFixed(6),x:delta.x??0,y:-(delta.y??0)});
      }
      if(rotate.some(k=>k.value)) (timelines[bone.name]??={}).rotate=rotate;
      if(translate.some(k=>k.x||k.y)) (timelines[bone.name]??={}).translate=translate;
    }
    animations[state]={bones:timelines,events:[{time:0,name:'seam'},{time:4,name:'seam'}]};
  }
  return {skeleton:{spine:'4.2.0',x:-384,y:0,width:768,height:1024,images:'./',fps:30},bones,slots,skins:[{name:'default',attachments}],events:{seam:{}},animations};
}
