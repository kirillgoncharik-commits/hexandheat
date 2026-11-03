import {CAMERA,makeSkeleton,buildMeshes,MeshStage,retargetPose} from './reference-mesh.js';
/** Opt-in SMALL_WIN only. Existing five-state rig is always retained. */
export class CandidateWitchPlayer {
  constructor(container,{transport,reducedMotion=false,fallback}) {
    Object.assign(this,{container,transport,reducedMotion,fallback});this.state='IDLE';this.enabled=false;this.ready=false;this.destroyed=false;this.last=-1;
    this.canvas=document.createElement('canvas');this.canvas.width=CAMERA.width;this.canvas.height=CAMERA.height;this.canvas.className='candidate-witch';this.canvas.hidden=true;container.append(this.canvas);
    const base='./assets/witch/reference-cycle/';
    const json=async name=>{const r=await fetch(base+name);if(!r.ok)throw Error('Candidate source unavailable');return r.json();};
    const load=async()=>{
      const [art,clip]=await Promise.all([json('layers-v7.json'),json('49_12-manikin.json')]);const images={};
      await Promise.all(art.layers.map(async l=>{const img=new Image();img.src=base+l.png;await img.decode();images[l.name]=img;}));
      if(this.destroyed)return;this.bones=makeSkeleton(art.landmarks);this.clip=clip;this.stage=new MeshStage(this.canvas,buildMeshes(art,this.bones),images,this.bones);this.ready=true;this.tick();
    };
    this.preload=Promise.race([load(),new Promise((_,reject)=>{this.timer=setTimeout(()=>reject(Error('Candidate decode deadline')),5000);})]).catch(()=>{this.failed=true;}).finally(()=>clearTimeout(this.timer));
    this.unsubscribe=transport.subscribe(()=>this.tick(),3);
  }
  setEnabled(value){this.enabled=Boolean(value);this.last=-1;this.tick();}
  switchTo(state){this.state=state;this.fallback.switchTo(state);this.last=-1;this.tick();}
  tick(){
    const active=this.enabled&&this.ready&&!this.failed&&this.state==='SMALL_WIN';this.canvas.hidden=!active;
    for(const node of this.container.children)if(node!==this.canvas)node.style.visibility=active?'hidden':'';
    this.container.dataset.candidate=active?'v7-small-win':this.failed?'unavailable':'fallback';if(!active)return;
    const frame=this.reducedMotion?0:Math.floor((this.transport.now%4000)/1000*30);if(frame===this.last)return;
    try{this.stage.draw(retargetPose(this.clip,frame/30,this.bones));this.last=frame;}catch{this.failed=true;this.canvas.hidden=true;for(const n of this.container.children)if(n!==this.canvas)n.style.visibility='';}
  }
  setReducedMotion(value){this.reducedMotion=value;this.fallback.setReducedMotion(value);this.last=-1;this.tick();}
  destroy(){this.destroyed=true;clearTimeout(this.timer);this.unsubscribe();this.stage?.destroy();this.fallback.destroy();this.canvas.remove();}
}
