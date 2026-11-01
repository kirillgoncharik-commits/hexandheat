import { drawRig, sampleRig, mixPose, RIG_WIDTH, RIG_HEIGHT, RIG_STATES, RIG_FPS } from './witch-rig-v2.js';
import { RasterWitchPlayer } from './raster-witch.js';

/** 30 genuinely sampled poses/second; a small original cutout renderer, not Spine Runtime. */
export class RigWitchPlayer {
  constructor(container,{transport,reducedMotion=false,reviewPadding=false}={}) {
    this.container=container;this.transport=transport;this.reducedMotion=reducedMotion;
    this.state='IDLE';this.lastFrame=-1;this.images={};this.ready=false;this.destroyed=false;
    this.fallback=new RasterWitchPlayer(container,{transport,reducedMotion,atlasUrl:'./assets/witch/witch-atlas-m04.webp'});
    this.reviewPadding=reviewPadding;
    this.canvas=document.createElement('canvas');this.canvas.width=RIG_WIDTH+(reviewPadding?128:0);this.canvas.height=RIG_HEIGHT+(reviewPadding?128:0);
    this.canvas.className='witch-rig';this.canvas.setAttribute('aria-hidden','true');this.canvas.hidden=true;
    this.context=this.canvas.getContext('2d');container.append(this.canvas);
    this.preload=Promise.all(['head','torso','skirt','hair','upper-left','fore-left','upper-right','fore-right'].map(async name=> {
      const image=new Image();image.src=`./assets/witch/rig/${name}.png`;await image.decode();this.images[name]=image;
    })).then(()=> {
      if(this.destroyed)return;
      this.ready=true;this.fallback.destroy();this.fallback=null;this.canvas.hidden=false;container.dataset.renderer='cutout-rig-30fps';this.tick();
    }).catch(()=>{container.dataset.degraded='true';container.dataset.renderer='four-pose-fallback';});
    this.unsubscribe=transport.subscribe(()=>this.tick(),2);
  }
  tick() {
    if(!this.ready||this.destroyed)return;
    const now=this.transport.now;
    const frame=this.reducedMotion?0:Math.floor((now%4000)/1000*RIG_FPS);
    if(frame===this.lastFrame)return;
    let pose=sampleRig(this.state,frame/RIG_FPS);
    if(this.blend&&!this.reducedMotion) {
      const weight=Math.min(1,(now-this.blend.at)/180);
      pose=mixPose(sampleRig(this.blend.from,frame/RIG_FPS),pose,weight);
      if(weight===1)this.blend=null;
    }
    this.context.clearRect(0,0,this.canvas.width,this.canvas.height);this.context.save();if(this.reviewPadding)this.context.translate(64,130);drawRig(this.context,this.images,pose);this.context.restore();
    this.lastFrame=frame;this.container.dataset.frame=String(frame);this.container.dataset.fps=String(RIG_FPS);
  }
  switchTo(state) {
    if(!RIG_STATES.includes(state))return;
    if(state!==this.state)this.blend={from:this.state,at:this.transport.now};
    this.state=state;this.lastFrame=-1;this.fallback?.switchTo(state);this.container.dataset.state=state;
  }
  setReducedMotion(value) { this.reducedMotion=Boolean(value);this.lastFrame=-1;this.fallback?.setReducedMotion(value); }
  destroy() {this.destroyed=true;this.unsubscribe?.();this.fallback?.destroy();this.canvas.remove();}
}
