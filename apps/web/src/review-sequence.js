/** Curated manual review; this order makes no probability/RTP claim. */
export function reviewOrder(ids, seed='m07') {
  let n=2166136261;for(const c of String(seed))n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;
  const result=[...ids];for(let i=result.length-1;i>0;i--){n=(Math.imul(n,1664525)+1013904223)>>>0;const j=n%(i+1);[result[i],result[j]]=[result[j],result[i]];}return result;
}
export class ReviewSequence {
  constructor(ids,{seed='m07',cursor=0}={}){this.seed=String(seed).slice(0,64);this.ids=reviewOrder(ids,this.seed);this.cursor=Number.isSafeInteger(cursor)&&cursor>=0?cursor:0;}
  get next(){return this.ids[this.cursor%this.ids.length];}
  advance(){this.cursor++;return this.next;}
}
export function mountScenarioReview({rgs,query,elements,renderPreview,updateWallet}) {
  const selector=document.querySelector('#fixture-select'),next=document.querySelector('#scenario-next'),link=document.querySelector('#scenario-link');
  const sequence=new ReviewSequence(rgs.visualCatalog.playlist,{seed:query.get('seed')??'m07',cursor:Number(query.get('cursor')??0)});
  let varied=query.get('mode')==='varied';
  const playlist=document.createElement('option');playlist.value='playlist';selector.append(playlist);
  for(const [title,cases] of [['M07 · постановочные раунды',rgs.visualCatalog.cases],['M05 · регрессии',rgs.catalog.cases.filter(c=>c.id.startsWith('F'))]]) {
    const group=document.createElement('optgroup');group.label=title;
    for(const c of cases){const option=document.createElement('option');option.value=c.id;option.textContent=`${c.id} · ${c.purpose}`;group.append(option);}selector.append(group);
  }
  function sync({preview=false}={}) {
    if(varied)rgs.fixture=sequence.next;
    const c=rgs.catalog.cases.find(c=>c.id===rgs.fixture);
    selector.value=varied?'playlist':rgs.fixture;playlist.textContent=`Разные раунды · далее ${sequence.next}`;
    const url=new URL(location.href);url.searchParams.set('fixture',rgs.fixture);url.searchParams.set('seed',sequence.seed);url.searchParams.set('cursor',sequence.cursor);url.searchParams.set('mode',varied?'varied':'single');history.replaceState(null,'',url);
    link.href=url.href;link.textContent=`${varied?'Разные раунды':'Один сценарий'} · ${rgs.fixture} · run ${sequence.seed}/${sequence.cursor}`;
    if(preview){elements.betSelect.value=String(c.betMicro);updateWallet();renderPreview(c);}
  }
  selector.addEventListener('change',()=>{varied=selector.value==='playlist';if(!varied)rgs.fixture=selector.value;sync({preview:true});});
  next.addEventListener('click',()=>{if(varied)sequence.advance();else {const all=rgs.catalog.cases;const i=all.findIndex(c=>c.id===rgs.fixture);rgs.fixture=all[(i+1)%all.length].id;}sync({preview:true});});
  sync({preview:true});
  return {sequence,get varied(){return varied;},accepted(){if(varied)sequence.advance();sync();},ready(){if(varied)sync({preview:true});},setBusy(value){selector.disabled=value;next.disabled=value;}};
}
