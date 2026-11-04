import {layoutMetrics} from './m06-layout-metrics.js';
const $=id=>document.getElementById(id),pause=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn){const start=performance.now();while(!fn()){if(performance.now()-start>20000)throw Error('UI readiness deadline');await pause(30);}}
const need=(v,msg)=>{if(!v)throw Error(msg);};
$('browser-agent').textContent=navigator.userAgent;
$('run').onclick=async()=>{
 $('run').disabled=true;const report={version:'m06-layout-1',userAgent:navigator.userAgent,cases:[],errors:[]};
 try{const manifest=await fetch('./assets/m06/manifest.json').then(r=>r.json());
 for(const [width,height,faceMinimum]of [[360,640,32],[390,844,40],[430,932,44],[844,390,32],[480,320,28],[1366,768,28],[1440,900,28]]){
  $('progress').textContent=`${width}×${height}`;const frame=$('game');frame.style.width=width+'px';frame.style.height=height+'px';
  frame.src='./?fixture=F09&witch=m06&long=1&speed=fast';await new Promise(r=>frame.onload=r);const d=frame.contentDocument;
  await until(()=>d.body.dataset.gameState==='ready'&&d.querySelector('.raster-container').dataset.media?.startsWith('IDLE/'));
  const before=layoutMetrics(d,manifest);need(!before.scroll.x&&!before.scroll.y,'main path scroll');
  need(Math.abs(before.board.width/before.board.height-1.2)<.002,'board aspect');
  if(height>500&&width<581)need(before.cell.width>=42&&before.cell.height>=42,'cell below42');
  for(const state of ['IDLE','SMALL_WIN']){need(before.clips[state].minFacePx>=faceMinimum,'face minimum '+state);need(before.clips[state].allFacesInside,'face crop '+state);}
  need(before.targets.every(t=>t.width>=43.99&&t.height>=43.99),'touch targets');
  const spin=d.querySelector('#spin-button');spin.click();spin.click();await until(()=>d.body.dataset.gameState==='ready');
  const after=layoutMetrics(d,manifest);need(d.querySelector('#win-value').textContent.includes('0.20'),'F09 award');need(d.querySelector('#multiplier-value').textContent==='×3','F09 multiplier');need(Math.abs(after.spin.y-before.spin.y)<.1,'Spin moved');need(after.money.every(m=>!m.overflow),'long balance overflow');
  for(const name of ['settings','rules']){d.querySelector(`[data-open="${name}-dialog"]`).click();await until(()=>d.querySelector(`#${name}-dialog`).open);const dialog=d.querySelector(`#${name}-dialog`);await until(()=>frame.contentWindow.hexHeatReview.modal.state==='OPEN');const time=frame.contentWindow.hexHeatReview.transport.now;await pause(80);need(frame.contentWindow.hexHeatReview.transport.now===time,'modal did not pause scene');dialog.querySelector('[data-close]').click();await until(()=>!dialog.open);}
  report.cases.push({status:'PASS',...before,after:{win:d.querySelector('#win-value').textContent,multiplier:d.querySelector('#multiplier-value').textContent,spinUnmoved:true,longMoney:after.money},modals:'PASS'});
 }
 report.status='PASS';
 }catch(e){report.status='FAIL';report.errors.push(e.stack??e.message);}
 $('results').textContent=JSON.stringify(report,null,2);$('progress').textContent=`${report.status} · ${report.cases.length}/7`;document.body.dataset.qaStatus=report.status;$('run').disabled=false;
};
