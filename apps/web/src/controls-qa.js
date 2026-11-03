import {formatMoney} from './domain.js';
const $=id=>document.getElementById(id),pause=ms=>new Promise(r=>setTimeout(r,ms));
const need=(ok,msg)=>{if(!ok)throw Error(msg);};
async function until(fn){const start=performance.now();while(!fn()){if(performance.now()-start>45000)throw Error('Game UI timed out');await pause(30);}}
$('run').onclick=async()=>{
 $('run').disabled=true;const began=performance.now(),report={version:'m05-actual-controls-1',cases:[],errors:[]};
 try {
  const catalog=await fetch('./assets/m05/fixtures.json').then(r=>r.json());
  for(const c of catalog.cases)for(const mode of ['normal','fast','reduced','replay']) {
   $('progress').textContent=`${c.id} · ${mode} · ${report.cases.length}/48`;const frame=$('game');
   frame.src=`./?fixture=${c.id}&speed=${mode==='fast'?'fast':'normal'}&motion=${mode==='reduced'?'reduced':'full'}&witch=candidate`;
   await new Promise(resolve=>frame.onload=resolve);const d=frame.contentDocument;
   await until(()=>d.body.dataset.gameState==='ready'&&d.querySelectorAll('#bet-select option').length>0);
   const spin=d.querySelector('#spin-button');spin.click();spin.click(); // repeated input must not double-charge
   await until(()=>d.body.dataset.gameState==='ready');
   if(d.querySelector('#result-dialog').open){d.querySelector('#result-dialog [data-close]').click();await until(()=>!d.querySelector('#result-dialog').open);}
   need(!spin.disabled&&!d.querySelector('#bet-select').disabled&&!d.querySelector('#replay-button').disabled,'stale control lock');
   const expected=formatMoney(c.expected.payoutUnits*c.betMicro/100,'USD',navigator.language||'en-US');need(d.querySelector('#win-value').textContent===expected,'actual final amount');
   const balance=d.querySelector('#balance-value').textContent,expectedBalance=formatMoney(100000000-c.betMicro+c.expected.payoutUnits*c.betMicro/100,'USD',navigator.language||'en-US');need(balance===expectedBalance,'repeated click debit');
   if(mode==='replay'){d.querySelector('#replay-button').click();await until(()=>d.body.dataset.gameState==='ready');if(d.querySelector('#result-dialog').open){d.querySelector('#result-dialog [data-close]').click();await until(()=>!d.querySelector('#result-dialog').open);}need(d.querySelector('#balance-value').textContent===balance,'replay wallet mutation');need(!spin.disabled,'replay control lock');}
   need(d.querySelector('#win-value').textContent===expected,'final amount after replay');
   const terminal=c.expected.events.filter(e=>e.board).at(-1).board,actual=[...d.querySelectorAll('#board .symbol')].sort((a,b)=>+a.dataset.position-+b.dataset.position).map(n=>n.dataset.symbol);need(JSON.stringify(terminal.flat())===JSON.stringify(actual),'actual terminal board');
   const final=c.expected.events.at(-1);need(d.querySelector('#multiplier-value').textContent===`×${final.finalMultiplier}`,'actual terminal multiplier');
   // Modal is the focus owner. Space on Close must not fall through to Spin.
   d.querySelector('[data-open="settings-dialog"]').click();await until(()=>d.querySelector('#settings-dialog').open);const close=d.querySelector('#settings-dialog [data-close]');close.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',key:' ',bubbles:true}));need(d.body.dataset.gameState==='ready','Space leaked through modal');close.click();await until(()=>!d.querySelector('#settings-dialog').open);need(!spin.disabled,'modal left input locked');
   report.cases.push({id:c.id,mode,status:'PASS',win:expected,multiplier:final.finalMultiplier,controlsReady:true,repeatedClickOneDebit:true,modalSpace:'PASS',replayWalletUnchanged:mode==='replay'?true:null});
  }
  report.status='PASS';
 }catch(error){report.status='FAIL';report.errors.push(error.stack??error.message);}
 report.wallDurationMs=Math.round(performance.now()-began);$('results').textContent=JSON.stringify(report,null,2);$('progress').textContent=`${report.status} · ${report.cases.length}/48`;$('run').disabled=false;
};
