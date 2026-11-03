import {SceneTransport} from './scene-transport.js';
import {CueDirector} from './cue-director.js';
import {BoardPlayer} from './board-player.js';
import {ScenePresentation} from './scene-presentation.js';
import {WitchDanceController} from './witch-dance.js';
import {AdaptiveMusicController} from './adaptive-music.js';
import {RigWitchPlayer} from './rig-witch-player.js';
import {CandidateWitchPlayer} from './candidate-witch-player.js';
import {ReviewRgs} from './review-rgs.js';
import {playOutcome} from './domain.js';
const $=id=>document.getElementById(id),equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b),need=(ok,msg)=>{if(!ok)throw Error(msg);};
const flush=async()=>{for(let n=0;n<12;n++)await Promise.resolve();};
let evidence;
$('run').onclick=async()=>{
 $('run').disabled=true;const began=performance.now();evidence={version:'m05-browser-qa-1',cases:[],faults:{},candidate:{},soak:{},errors:[]};
 try {
  const client=new ReviewRgs();await client.initialize();
  for(const c of client.catalog.cases)for(const mode of ['normal','fast','reduced','replay']) {
   $('qa-status').textContent=`${c.id} · ${mode}`;let wall=0;
   const transport=new SceneTransport({now:()=>wall,requestFrame:()=>1,cancelFrame:()=>{}}),director=new CueDirector(transport),board=new BoardPlayer($('board'),transport);
   await board.prepare();board.reducedMotion=mode==='reduced';
   const music=new AdaptiveMusicController({transport,contextFactory:()=>{throw Error('Injected unavailable AudioContext');}});await music.unlock();music.mute(mode==='reduced');
   const witch=new WitchDanceController({transport});witch.start();const elements={win:$('win-value'),multiplier:$('multiplier-value'),debugMultiplier:$('debug-multiplier'),witchStage:document.querySelector('.witch-stage'),cascadeWin:$('cascade-value'),cascadeLabel:$('cascade-label'),winLabel:$('win-label'),potionNote:$('potion-note')};
   const presentation=new ScenePresentation({transport,director,board,witch,music,elements});presentation.setReducedMotion(mode==='reduced');presentation.begin();$('round-details').replaceChildren();
   const o=client.outcome(c.id,c.betMicro);let done=false,error,final;
   const task=playOutcome(o,{delay:async()=>{},onEvent:(e,s)=>presentation.event(e,s,o,mode==='fast'?'fast':'normal')}).then(s=>{done=true;final=s;},e=>{done=true;error=e;});
   for(let n=0;n<4000&&!done;n++){await flush();wall+=n===4?200:50;if(n===3){transport.pause('visibility');wall+=1000;transport.tick(wall);transport.resume('visibility');}transport.tick(wall);}
   await task;if(error)throw error;need(done,'playback stalled');need(final.winMicro===o.payoutMicro,'payout');need(final.multiplier===o.events.at(-1).finalMultiplier,'multiplier');
   const cells=[...$('board').children];need(cells.length===30,'persistent board node count');need(equal(cells.sort((a,b)=>+a.dataset.position-+b.dataset.position).map(n=>n.dataset.symbol),final.board.flat()),'terminal DOM board');need(!director.trace.some(t=>t.type==='cue.fallback'||t.type==='board.reconcile'),'unexpected reconciliation');
   evidence.cases.push({id:c.id,mode,status:'PASS',winMicro:final.winMicro,multiplier:final.multiplier,board:final.board,presentationComplete:true,activeMs:transport.now});
   presentation.destroy();witch.destroy();music.destroy();need(transport.listeners.size===0,'leaked listener');$('board').replaceChildren();
   await new Promise(resolve=>setTimeout(resolve,0));
  }
  // Actual renderer fallback and candidate selection, all five states retained.
  let wall=0;const t=new SceneTransport({now:()=>wall,requestFrame:()=>1,cancelFrame:()=>{}}),container=document.querySelector('.raster-container');
  const fallback=new RigWitchPlayer(container,{transport:t});const candidate=new CandidateWitchPlayer(container,{transport:t,fallback});await candidate.preload;await fallback.preload;candidate.setEnabled(true);need(candidate.ready&&!candidate.failed,'candidate source not ready');
  const states=['IDLE','SMALL_WIN','MEDIUM_WIN','BIG_WIN','BONUS'];let pairs=0;
  for(const from of states)for(const to of states){candidate.switchTo(from);wall+=4000;t.tick(wall);candidate.switchTo(to);candidate.tick();need(candidate.canvas.hidden===(to!=='SMALL_WIN'),'candidate state isolation');pairs++;}
  evidence.candidate={status:'PASS',renderer: candidate.stage.gl?'WebGL':'Canvas',pairs,artAcceptance:'PENDING'};
  candidate.failed=true;candidate.switchTo('SMALL_WIN');need(candidate.canvas.hidden,'decode fallback');need([...container.children].filter(n=>n!==candidate.canvas).every(n=>n.style.visibility!=='hidden'),'fallback visibility');evidence.faults.characterDecode='PASS';candidate.destroy();
  const board=new BoardPlayer($('board'),t);board.failedArt=new Set(['L1']);const o=client.outcome('F02',1000000);board.render({board:o.events[0].board,highlightedPositions:[]});need($('board').querySelector('[data-symbol="L1"]').dataset.degraded==='true','symbol fallback');evidence.faults.optionalSymbolAsset='PASS';evidence.faults.AudioContext='PASS';evidence.faults.pauseAnd200msJank='PASS';
  // Thirty minutes of active scene time with real DOM reconciliation per round.
  let rounds=0;const soakStart=t.now;while(t.now-soakStart<1800000){const c=client.catalog.cases[rounds%12],o=client.outcome(c.id,c.betMicro);await playOutcome(o,{delay:async()=>{},onEvent:(e,s)=>board.render(s)});wall+=2500;t.tick(wall);need($('board').children.length===30,'soak DOM growth');rounds++;if(rounds%60===0)await new Promise(resolve=>setTimeout(resolve,0));}
  evidence.soak={status:'PASS',activeMs:t.now-soakStart,rounds,terminalCells:$('board').children.length,listeners:t.listeners.size,clock:'accelerated; not a 30-minute wall-clock device run'};need(t.listeners.size===0,'soak listener growth');t.destroy();evidence.status='PASS';
 }catch(error){evidence.status='FAIL';evidence.errors.push(error.stack??error.message);}
 evidence.wallDurationMs=Math.round(performance.now()-began);evidence.unavailable=['Physical iPhone/Android/Safari','Physical AV/input p95 measurements','Human art/UX acceptance'];$('results').textContent=JSON.stringify(evidence,null,2);$('qa-status').textContent=`${evidence.status} · ${evidence.cases.length}/48 presentation cases`;document.body.dataset.qaStatus=evidence.status;$('save').disabled=false;$('run').disabled=false;
};
$('save').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(evidence,null,2)],{type:'application/json'}));a.download='m05-browser-qa.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
