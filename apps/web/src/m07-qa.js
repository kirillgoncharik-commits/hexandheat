import {formatMoney} from './domain.js';
const $=id=>document.getElementById(id),pause=ms=>new Promise(r=>setTimeout(r,ms)),need=(ok,msg)=>{if(!ok)throw Error(msg);};
async function until(fn){const start=performance.now();while(!fn()){if(performance.now()-start>45000)throw Error('Game UI timed out');await pause(15);}}
let report;
$('run').onclick=async()=>{
 $('run').disabled=true;const began=performance.now(),wall=new URL(location.href).searchParams.get('suite')==='wall';report={version:'m07-actual-controls-1',clock:wall?'real wall-clock':'fixed 50ms active steps; not performance measurement',cases:[],errors:[]};
 try{
  const packs=await Promise.all(['m07','m05'].map(v=>fetch(`./assets/${v}/fixtures.json`).then(r=>r.json())));
  const cases=wall?[...packs[0].cases,...packs[1].cases].filter(c=>['B05','B06','B09','B11','B15','B16','B20','F11'].includes(c.id)):packs[0].cases;
  const only=new URL(location.href).searchParams.get('only');if(only)cases.splice(0,cases.length,...cases.filter(c=>c.id===only));
  const modes=wall?['normal','fast']:['normal','fast','reduced','replay'];
  for(const c of cases)for(const mode of modes){
   $('progress').textContent=`${c.id} · ${mode} · ${report.cases.length}/${cases.length*modes.length}`;
   const frame=$('game');frame.src=`./?fixture=${c.id}&witch=still&speed=${mode==='fast'?'fast':'normal'}&motion=${mode==='reduced'?'reduced':'full'}`;
   await new Promise(r=>frame.onload=r);const w=frame.contentWindow,d=frame.contentDocument;
   await until(()=>d.body.dataset.gameState==='ready'&&w.hexHeatReview);
   const t=w.hexHeatReview.transport;
   if(!wall){t.pause('qa-driver');let virtualWall=t.now;t.wallNow=()=>virtualWall;t.origin=0;t.pausedWall=0;t.pauseStarted=virtualWall;t.requestFrame=cb=>w.setTimeout(()=>{virtualWall+=50;cb(virtualWall);},16);t.cancelFrame=id=>w.clearTimeout(id);t.resume('qa-driver');}
   const originalInitial=[...d.querySelectorAll('#board .symbol')].map(n=>({node:n,p:+n.dataset.position,s:n.dataset.symbol}));
   const spin=d.querySelector('#spin-button');spin.click();spin.click();
   // Capture real DOM group focus, Potion origin/impact, and persistent survivor instances.
   const seen={groups:[],potionOrigins:[],survivors:[],maxParticles:0};let lastKey='',reveal=true;
   const inspect=w.setInterval(()=>{
    seen.maxParticles=Math.max(seen.maxParticles,d.querySelectorAll('.dissolve-spark').length);
    const host=d.querySelector('#group-explanation');if(!host.hidden){const key=host.textContent;if(key!==lastKey){lastKey=key;seen.groups.push({label:key,positions:[...d.querySelectorAll('.is-group-focus')].map(n=>+n.dataset.position)});}}
    for(const node of d.querySelectorAll('.potion-flight'))if(!seen.potionOrigins.includes(+node.dataset.position))seen.potionOrigins.push(+node.dataset.position);
    if(reveal&&w.hexHeatReview.director.trace.some(e=>e.type==='board.settled')){reveal=false;for(const old of originalInitial)if(old.node.isConnected)seen.survivors.push({from:old.p,to:+old.node.dataset.position,symbol:old.s,winClass:old.node.classList.contains('is-winning'),potionClass:old.node.classList.contains('is-potion-active')});}
   },5);
   await until(()=>d.body.dataset.gameState==='ready');w.clearInterval(inspect);
   if(d.querySelector('#result-dialog').open){d.querySelector('#result-dialog [data-close]').click();await until(()=>!d.querySelector('#result-dialog').open);}
   need(!spin.disabled&&!d.querySelector('#scenario-next').disabled&&!d.querySelector('#bet-select').disabled,'stale input lock');
   const expected=formatMoney(c.expected.payoutUnits*c.betMicro/100,'USD',w.navigator.language||'en-US'),expectedBalance=formatMoney(100000000-c.betMicro+c.expected.payoutUnits*c.betMicro/100,'USD',w.navigator.language||'en-US');
   need(d.querySelector('#win-value').textContent===expected,'exact paid');need(d.querySelector('#balance-value').textContent===expectedBalance,'one debit');const balance=d.querySelector('#balance-value').textContent;
   if(mode==='replay'){d.querySelector('#replay-button').click();await until(()=>d.body.dataset.gameState==='ready');if(d.querySelector('#result-dialog').open){d.querySelector('#result-dialog [data-close]').click();await until(()=>!d.querySelector('#result-dialog').open);}need(d.querySelector('#balance-value').textContent===balance,'replay wallet');need(!spin.disabled,'replay spin lock');}
   const terminal=c.expected.events.filter(e=>e.board).at(-1).board.flat(),actual=[...d.querySelectorAll('#board .symbol')].sort((a,b)=>+a.dataset.position-+b.dataset.position).map(n=>n.dataset.symbol);need(JSON.stringify(actual)===JSON.stringify(terminal),'terminal board');need(d.querySelectorAll('#board .symbol').length===30,'30 cells');need(d.querySelector('#multiplier-value').textContent===`×${c.expected.events.at(-1).finalMultiplier}`,'terminal multiplier');
   need(!w.hexHeatReview.director.trace.some(e=>['cue.fallback','board.reconcile'].includes(e.type)),'unexpected fallback');
   const expectedGroups=c.expected.events.filter(e=>e.type==='win').flatMap(e=>e.groups.map(g=>g.positions));
   for(const group of seen.groups)need(expectedGroups.some(p=>JSON.stringify(p)===JSON.stringify(group.positions)),'incorrect group focus');need(d.querySelectorAll('.potion-flight,.dissolve-spark').length===0,'effect cleanup');need(seen.maxParticles<=12,'particle budget');need(d.querySelector('#cascade-value').textContent===expected,'final band is not round paid');need(d.querySelector('#potion-note').textContent==='','stale Potion hint');
   const bowl=d.querySelector('.cauldron-vessel img').getBoundingClientRect();for(const impact of w.hexHeatReview.director.trace.filter(e=>e.type==='field.potionImpact'&&e.target)){need(Math.abs(impact.target.x-(bowl.x+bowl.width*.5))<1&&Math.abs(impact.target.y-(bowl.y+bowl.height*.36))<1,'Potion missed bowl');}
   // Selection cannot replace settled outcome. Replay stays on the settled book.
   const picker=d.querySelector('#fixture-select');picker.value='B01';picker.dispatchEvent(new Event('change'));need(d.querySelector('#win-value').textContent===expected,'selection erased result');
   const trace=w.hexHeatReview.director.trace.filter(e=>e.type.startsWith('field.'));
   for(const g of trace.filter(e=>e.type==='field.group'))need(g.positions.every(p=>Number.isInteger(p)&&p>=0&&p<30),'group position');
   if(c.id==='B07'){need(seen.survivors.some(s=>s.from===0&&s.to===3),'survivor instance 0→3');need(seen.survivors.every(s=>!s.winClass&&!s.potionClass),'survivor stale highlight');}
   report.cases.push({id:c.id,mode,status:'PASS',paid:expected,terminalMultiplier:c.expected.events.at(-1).finalMultiplier,oneDebit:true,replayUnchanged:mode==='replay',terminalBoard:actual,selectionPreservesResult:true,observed:seen,fieldTrace:trace});
  }
  report.status='PASS';
 }catch(error){report.status='FAIL';report.errors.push(error.stack??error.message);report.failureTrace=$('game').contentWindow.hexHeatReview?.director.trace;}
 report.wallDurationMs=Math.round(performance.now()-began);$('results').textContent=JSON.stringify(report,null,2);$('progress').textContent=`${report.status} · ${report.cases.length}`;document.body.dataset.qaStatus=report.status;$('run').disabled=false;$('save').disabled=false;
};
$('save').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));a.download=report.clock.startsWith('real')?'m07-wall-controls.json':'m07-controls.json';a.click();};
