/** Four redrawn keys with honest stepped holds, not a finished animation. */
export const STUDY_TIMELINE=Object.freeze([[0,'canonical'],[550,'weight'],[1350,'accent'],[2150,'release'],[3150,'weight'],[3650,'canonical'],[4000,'canonical']]);
export function sampleStudy(ms){const phase=((ms%4000)+4000)%4000;return STUDY_TIMELINE.filter(([at])=>at<=phase).at(-1)[1];}
export class KeyPoseStudy {
 constructor(container,{transport,reducedMotion=false}={}){
  Object.assign(this,{container,transport,reducedMotion});this.state='IDLE';this.images=new Map();this.last=null;this.destroyed=false;this.image=document.createElement('img');this.image.className='m07-study';this.image.alt='M07 stepped key-pose study — four drawings, art review open';this.image.hidden=true;container.append(this.image);
  this.preload=fetch('./assets/m07-study/manifest.json').then(r=>{if(!r.ok)throw Error('Study manifest unavailable');return r.json();}).then(async m=>{this.manifest=m;await Promise.all(m.poses.map(async p=>{const i=new Image();i.src=p.path;await i.decode();this.images.set(p.id,i);}));if(this.destroyed)return;container.dataset.study='true';this.image.hidden=false;this.tick();}).catch(()=>{container.dataset.studyError='true';});
  this.unsubscribe=transport.subscribe(()=>this.tick(),5);
 }
 tick(){if(this.destroyed||this.images.size!==4)return;const pose=this.reducedMotion||this.state!=='SMALL_WIN'?'canonical':sampleStudy(this.transport.now);if(pose===this.last)return;this.last=pose;this.image.src=this.images.get(pose).src;this.container.dataset.studyPose=pose;}
 switchTo(state){this.state=state;this.last=null;this.tick();}
 setReducedMotion(v){this.reducedMotion=Boolean(v);this.tick();}
 destroy(){this.destroyed=true;this.unsubscribe();this.images.clear();delete this.container.dataset.study;this.image.remove();}
}
