/** Registered, weighted source-art preview. This is not a Spine Runtime. */
export const CAMERA = Object.freeze({width:1408,height:1792,padX:192,padY:128});
const rad = x=>x*Math.PI/180, clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const mix=(a,b,t)=>a+(b-a)*t;
const angle=(a,b)=>Math.atan2(b[1]-a[1],b[0]-a[0]);
const distance=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
function rotate(p,a){return [p[0]*Math.cos(a)-p[1]*Math.sin(a),p[0]*Math.sin(a)+p[1]*Math.cos(a)];}
export function makeSkeleton(landmarks){
 const l=landmarks, at=(k,f)=>l[k]??f;
 const definitions=[
  ['root',null,[512,1516]],['hips','root',at('hips',[512,710])],
  ['waist','hips',at('waist',[518,583])],['chest','waist',at('chest',[520,421])],
  ['head','chest',at('neck',[516,316])],
  ...['left','right'].flatMap(s=>[
   ['upper-'+s,'chest',at('shoulder-'+s,s==='left'?[394,380]:[634,380])],
   ['fore-'+s,'upper-'+s,at('elbow-'+s,s==='left'?[304,568]:[729,568])],
   ['hand-'+s,'fore-'+s,at('wrist-'+s,s==='left'?[202,704]:[808,704])],
   ['thigh-'+s,'hips',at('hip-'+s,s==='left'?[464,785]:[564,785])],
   ['shin-'+s,'thigh-'+s,at('knee-'+s,s==='left'?[424,1140]:[589,1140])],
   ['foot-'+s,'shin-'+s,at('ankle-'+s,s==='left'?[389,1460]:[623,1460])]
  ]),
  ['skirt-left','hips',[245,1250]],['skirt-mid','hips',[512,1250]],['skirt-right','hips',[780,1250]],
  ['hair-left','head',[352,430]],['hair-right','head',[664,430]]
 ];
 const result=definitions.map(([name,parent,position],index)=>({name,parent,position,index,axis:0}));
 for(const side of ['left','right'])for(const [a,b]of [['upper-','fore-'],['fore-','hand-']]){const bone=result.find(v=>v.name===a+side),end=result.find(v=>v.name===b+side);bone.axis=angle(bone.position,end.position);}
 return result;
}
export function restTransforms(bones){return Object.fromEntries(bones.map(b=>[b.name,{position:[...b.position],rotation:0,scaleX:1}]));}
function skinOffset(vector,pose,bone){const p=rotate(vector,-bone.axis);p[0]*=pose.scaleX??1;return rotate(p,pose.rotation+bone.axis);}
function project(p,yaw){const r=rad(yaw);return [p[0]*Math.cos(r)-p[2]*Math.sin(r),-p[1]];}
export function sourceFrame(clip,seconds,clean=true){
 const frames=clean?clip.loopFrames:clip.frames, roots=clean?clip.loopRootTrack:clip.rootTrack;
 const f=clamp(seconds,0,4)*30, i=Math.min(119,Math.floor(f)), t=f-i;
 return {points:frames[i].map((p,j)=>p.map((v,k)=>mix(v,frames[i+1][j][k],t))),root:roots[i].map((v,k)=>mix(v,roots[i+1][k],t))};
}
export function retargetPose(clip,seconds,bones,{clean=true,strength=1,contact=true}={}){
 const rest=restTransforms(bones), result=restTransforms(bones), map=Object.fromEntries(clip.joints.map((j,i)=>[j.name,i]));
 const yaw=clip.cameraRecommendation.yawDegrees, f=sourceFrame(clip,seconds,clean), first=sourceFrame(clip,0,clean);
 const p=n=>project(f.points[map[n]],yaw), p0=n=>project(first.points[map[n]],yaw), rr=project(f.root,yaw);
 const hipPosition=[rest.hips.position[0]+clamp(rr[0]*1080,-85,85),rest.hips.position[1]+clamp(rr[1]*1080,-35,35)];
 const body=clamp(wrap(angle(p('Hips'),p('Neck1'))+Math.PI/2),-.24,.24)*strength;
 let shoulderAngle=angle(p('RightArm'),p('LeftArm'));if(Math.cos(shoulderAngle)<0)shoulderAngle=wrap(shoulderAngle+Math.PI);
 const shoulder=clamp(shoulderAngle,-.25,.25)*.45;
 result.hips={position:hipPosition,rotation:body*.25};
 function under(name,parent,rotation){const delta=rest[name].position.map((v,k)=>v-rest[parent].position[k]),q=skinOffset(delta,result[parent],bones.find(b=>b.name===parent));result[name]={position:q.map((v,k)=>v+result[parent].position[k]),rotation,scaleX:1};}
 under('waist','hips',body*.52);under('chest','waist',body+shoulder*.25);
 under('head','chest',clamp(wrap(angle(p('Neck1'),p('Head'))+Math.PI/2),-.24,.24)*.5+body*.55);
 const mapping=p0('LeftArm')[0]<p0('RightArm')[0]?{left:'Left',right:'Right'}:{left:'Right',right:'Left'};
 for(const side of ['left','right']){
  const s=mapping[side], upper='upper-'+side,fore='fore-'+side,hand='hand-'+side;
  const a=angle(p(s+'Arm'),p(s+'ForeArm')),b=angle(p(s+'ForeArm'),p(s+'Hand'));
  const restA=angle(rest[upper].position,rest[fore].position),restB=angle(rest[fore].position,rest[hand].position);
  const da=wrap(a-restA)*strength, db=wrap(b-restB)*strength;
  const ratio=(a,b)=>{const aa=f.points[map[a]],bb=f.points[map[b]],v=aa.map((x,k)=>bb[k]-x);return clamp(distance(p(a),p(b))/Math.hypot(...v),.58,1);};
  under(upper,'chest',da);result[upper].scaleX=ratio(s+'Arm',s+'ForeArm');under(fore,upper,db);result[fore].scaleX=ratio(s+'ForeArm',s+'Hand');under(hand,fore,db);
  const thigh='thigh-'+side,shin='shin-'+side,foot='foot-'+side;
  under(thigh,'hips',0);
  const base=rest[foot].position,src=p(s+'Foot'),start=p0(s+'Foot');
  const target=[base[0]+clamp((src[0]-start[0]+rr[0])*700,-70,70),base[1]+clamp((src[1]-start[1]+rr[1])*700,-65,25)];
  if(contact){target[1]=Math.min(base[1],target[1]);}
  // Two-segment IK retains the artwork's segment lengths. Contacts need artist/device review.
  const origin=result[thigh].position,l1=distance(rest[thigh].position,rest[shin].position),l2=distance(rest[shin].position,rest[foot].position);
  const dx=target[0]-origin[0],dy=target[1]-origin[1],d=clamp(Math.hypot(dx,dy),Math.abs(l1-l2)+.01,l1+l2-.01);
  const bend=side==='left'?1:-1,alpha=Math.acos(clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1));
  const upperAngle=Math.atan2(dy,dx)+bend*alpha;
  result[thigh].rotation=wrap(upperAngle-angle(rest[thigh].position,rest[shin].position));
  under(shin,thigh,0);result[shin].rotation=wrap(angle(result[shin].position,target)-angle(rest[shin].position,rest[foot].position));
  under(foot,shin,0);
 }
 const delayed=sourceFrame(clip,((seconds-.13)%4+4)%4,clean),dr=project(delayed.root,yaw);
 const follow=clamp((dr[0]-rr[0])*400,-12,12);
 for(const side of ['left','right']){
  const skirt='skirt-'+side;under(skirt,'hips',body*.12);result[skirt].position[0]+=follow*(side==='left'?1:.8);
  const hair='hair-'+side;under(hair,'head',result.head.rotation*.72);result[hair].position[0]+=follow*.3;
 }
 under('skirt-mid','hips',body*.12);
 return result;
}
function segmentPoint(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=clamp(((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy),0,1);return {t,d:distance(p,[a[0]+t*dx,a[1]+t*dy])};}
export function vertexWeights(layer,p,bones){
 const rest=Object.fromEntries(bones.map(b=>[b.name,b.position])), blend=(a,b,t)=>t<=0?[[a,1]]:t>=1?[[b,1]]:[[a,1-t],[b,t]];
 if(layer.startsWith('arm-')){
  const side=layer.slice(4),a='upper-'+side,b='fore-'+side,c='hand-'+side;
  const first=segmentPoint(p,rest[a],rest[b]),last=segmentPoint(p,rest[b],rest[c]);
  if(first.d<last.d)return blend(a,b,clamp((first.t-.72)/.55,0,1));
  if(last.t<.23)return blend(a,b,.5+last.t/.46);
  return blend(b,c,clamp((last.t-.8)/.25,0,1));
 }
 if(layer.startsWith('leg-')){
  const side=layer.slice(4),a='thigh-'+side,b='shin-'+side,c='foot-'+side;
  if(p[1]<rest[b][1]+60)return blend(a,b,clamp((p[1]-rest[b][1]+70)/140,0,1));
  return blend(b,c,clamp((p[1]-rest[c][1]+60)/110,0,1));
 }
 if(layer==='head-hair'){
  const inHair=p[1]>325&&(p[0]<430||p[0]>610);
  if(p[0]>=395&&p[0]<=644&&p[1]>290)return blend('head','chest',clamp((p[1]-290)/85,0,1));
  return inHair?blend('head',p[0]<512?'hair-left':'hair-right',clamp((p[1]-325)/180,0,.7)):[['head',1]];
 }
 if(p[1]<rest.waist[1])return blend('chest','waist',clamp((p[1]-440)/140,0,1));
 if(p[1]<800)return blend('waist','hips',clamp((p[1]-rest.waist[1])/130,0,1));
 const skirt=p[0]<400?'skirt-left':p[0]>620?'skirt-right':'skirt-mid';
 return blend('hips',skirt,clamp((p[1]-800)/500,0,1));
}
export function buildMeshes(art,bones){
 const order=['leg-left','leg-right','garment','head-hair','arm-left','arm-right'];
 return [...art.layers].sort((a,b)=>order.indexOf(a.name)-order.indexOf(b.name)).map(layer=>{
  const [x,y,w,h]=layer.sourceBounds,nx=layer.name==='garment'?14:6,ny=layer.name==='garment'?22:14;
  const vertices=[],uvs=[],weights=[],indices=[];
  for(let row=0;row<=ny;row++)for(let col=0;col<=nx;col++){
   const p=[x+w*col/nx,y+h*row/ny];vertices.push(p);uvs.push([col/nx,row/ny]);weights.push(vertexWeights(layer.name,p,bones));
  }
  for(let row=0;row<ny;row++)for(let col=0;col<nx;col++){const a=row*(nx+1)+col,b=a+1,c=a+nx+1,d=c+1;indices.push(a,c,b,b,c,d);}
  return {...layer,vertices,uvs,weights,indices};
 });
}
export function deformVertices(mesh,pose,bones){
 const rest=Object.fromEntries(bones.map(b=>[b.name,b.position])),byName=Object.fromEntries(bones.map(b=>[b.name,b]));
 return mesh.vertices.map((p,i)=>{
  const point=[0,0];for(const [name,weight]of mesh.weights[i]){const v=skinOffset(p.map((x,k)=>x-rest[name][k]),pose[name],byName[name]);point[0]+=(v[0]+pose[name].position[0])*weight;point[1]+=(v[1]+pose[name].position[1])*weight;}return point;
 });
}
export function drawMeshCanvas(ctx,meshes,images,pose,bones,{wire=false}={}){
 for(const mesh of meshes){
  const points=deformVertices(mesh,pose,bones),image=images[mesh.name];
  for(let i=0;i<mesh.indices.length;i+=3){
   const ids=mesh.indices.slice(i,i+3),s=ids.map(id=>[mesh.uvs[id][0]*image.width,mesh.uvs[id][1]*image.height]),d=ids.map(id=>points[id]);
   const denom=s[0][0]*(s[1][1]-s[2][1])+s[1][0]*(s[2][1]-s[0][1])+s[2][0]*(s[0][1]-s[1][1]);if(Math.abs(denom)<1e-8)continue;
   const coeff=k=>[(d[0][k]*(s[1][1]-s[2][1])+d[1][k]*(s[2][1]-s[0][1])+d[2][k]*(s[0][1]-s[1][1]))/denom,(d[0][k]*(s[2][0]-s[1][0])+d[1][k]*(s[0][0]-s[2][0])+d[2][k]*(s[1][0]-s[0][0]))/denom,(d[0][k]*(s[1][0]*s[2][1]-s[2][0]*s[1][1])+d[1][k]*(s[2][0]*s[0][1]-s[0][0]*s[2][1])+d[2][k]*(s[0][0]*s[1][1]-s[1][0]*s[0][1]))/denom];
   const xx=coeff(0),yy=coeff(1);ctx.save();ctx.beginPath();d.forEach((p,j)=>j?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.clip();ctx.transform(xx[0],yy[0],xx[1],yy[1],xx[2],yy[2]);ctx.drawImage(image,0,0);ctx.restore();
   if(wire){ctx.beginPath();d.forEach((p,j)=>j?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.strokeStyle='#72e7c660';ctx.lineWidth=.8;ctx.stroke();}
  }
 }
}
export class MeshStage{
 constructor(canvas,meshes,images,bones){
  this.canvas=canvas;this.meshes=meshes;this.bones=bones;this.images=images;this.gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:true});
  if(!this.gl){this.ctx=canvas.getContext('2d');return;}
  const gl=this.gl,shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
  const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec2 p;attribute vec2 uv;varying vec2 v;uniform vec2 size;void main(){v=uv;gl_Position=vec4(p.x/size.x*2.0-1.0,1.0-p.y/size.y*2.0,0,1);}'));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision mediump float;varying vec2 v;uniform sampler2D tex;void main(){gl_FragColor=texture2D(tex,v);}'));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
  this.program=program;this.position=gl.getAttribLocation(program,'p');this.uv=gl.getAttribLocation(program,'uv');gl.uniform2f(gl.getUniformLocation(program,'size'),canvas.width,canvas.height);gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);
  this.resources=meshes.map(m=>{const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,images[m.name]);const buffer=gl.createBuffer();return {texture,buffer};});
 }
 draw(pose){
  if(!this.gl){this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);this.ctx.save();this.ctx.translate(CAMERA.padX,CAMERA.padY);drawMeshCanvas(this.ctx,this.meshes,this.images,pose,this.bones);this.ctx.restore();return;}
  const gl=this.gl;gl.viewport(0,0,this.canvas.width,this.canvas.height);gl.clear(gl.COLOR_BUFFER_BIT);
  this.meshes.forEach((m,i)=>{const d=deformVertices(m,pose,this.bones),data=new Float32Array(m.indices.flatMap(id=>[d[id][0]+CAMERA.padX,d[id][1]+CAMERA.padY,...m.uvs[id]])),r=this.resources[i];gl.bindTexture(gl.TEXTURE_2D,r.texture);gl.bindBuffer(gl.ARRAY_BUFFER,r.buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(this.position);gl.vertexAttribPointer(this.position,2,gl.FLOAT,false,16,0);gl.enableVertexAttribArray(this.uv);gl.vertexAttribPointer(this.uv,2,gl.FLOAT,false,16,8);gl.drawArrays(gl.TRIANGLES,0,m.indices.length);});
 }
 destroy(){if(this.gl){for(const r of this.resources){this.gl.deleteTexture(r.texture);this.gl.deleteBuffer(r.buffer);}this.gl.deleteProgram(this.program);}}
}
export function makeSpineImport(art,bones,meshes,poses){
 const index=Object.fromEntries(bones.map((b,i)=>[b.name,i]));
 const converted=bones.map(b=>{const parent=bones.find(p=>p.name===b.parent),p=parent?.position??[512,1516],v=rotate(b.position.map((x,k)=>x-p[k]),-(parent?.axis??0));return {name:b.name,...(b.parent?{parent:b.parent,transform:'noScale'}:{}),x:v[0],y:-v[1],rotation:-(b.axis-(parent?.axis??0))*180/Math.PI};});
 const attachments=Object.fromEntries(meshes.map(m=>[m.name,{[m.name]:{type:'mesh',path:m.name,uvs:m.uvs.flat(),triangles:m.indices,vertices:m.vertices.flatMap((p,i)=>[m.weights[i].length,...m.weights[i].flatMap(([name,w])=>{const b=bones[index[name]],v=rotate(p.map((x,k)=>x-b.position[k]),-b.axis);return [index[name],v[0],-v[1],w];})]),width:m.sourceBounds[2],height:m.sourceBounds[3]}}]));
 const timeline={};for(const b of bones){const parent=bones.find(p=>p.name===b.parent);const translate=[],rotateKeys=[],scale=[];poses.forEach((pose,i)=>{const local=parent?rotateLocal(pose[b.name].position,pose[parent.name],parent.axis):[pose[b.name].position[0]-512,pose[b.name].position[1]-1516];const setup=converted[index[b.name]];translate.push({time:i/30,x:local[0]-setup.x,y:-local[1]-setup.y});rotateKeys.push({time:i/30,value:-(pose[b.name].rotation-(parent?pose[parent.name].rotation:0))*180/Math.PI});scale.push({time:i/30,x:pose[b.name].scaleX??1,y:1});});timeline[b.name]={translate,rotate:rotateKeys,scale};}
 return {skeleton:{spine:'4.2.0',width:1024,height:1536,fps:30,images:'./'},bones:converted,slots:meshes.map(m=>({name:m.name,bone:'root',attachment:m.name})),skins:[{name:'default',attachments}],animations:{REFERENCE_DANCE:{bones:timeline}}};
}
function rotateLocal(position,parent,axis){const v=rotate(position.map((x,k)=>x-parent.position[k]),-parent.rotation-axis);v[0]/=parent.scaleX??1;return v;}
