import { RasterWitchPlayer, RASTER_STATES, rasterSource } from './raster-witch.js';
const data=await (await fetch('./screen-map.json')).json();
const list=document.querySelector('#screen-list'),preview=document.querySelector('#screen-preview');
const img=(src,cls='')=>{const e=document.createElement('img');e.src=src;e.alt='';e.className=cls;return e};
const text=(tag,value,parent,cls='')=>{const e=document.createElement(tag);e.textContent=value;e.className=cls;parent.append(e);return e};
function show(s){
 document.querySelectorAll('#screen-list button').forEach(b=>b.classList.toggle('active',b.dataset.id===s.id));
 document.querySelector('#screen-title').textContent=`${s.id} / ${s.name} · ${s.runtime.toUpperCase()}`;
 preview.replaceChildren();text('h3','HEX & HEAT',preview);
 const stage=document.createElement('div');stage.className='preview-stage';preview.append(stage);
 const board=document.createElement('div');board.className='preview-board';stage.append(board);
 for(let i=0;i<30;i++) board.append(img(`./assets/symbols/item-${String([0,1,2,3,6,9][(i*7+Math.floor(i/6))%6]).padStart(2,'0')}.png`));
 stage.append(img('./assets/witch/frame-00.png','preview-witch'));
 const footer=document.createElement('div');footer.className='preview-footer';preview.append(footer);
 text('span',s.id>='S26'&&s.id<='S29'?'REPLAY · No session':'BALANCE 100.00 · BET 1.00',footer);text('b','WIN 0.00 · CAULDRON ×1',footer);text('span',s.id>='S26'&&s.id<='S29'?'PLAY / AGAIN':'SPIN',footer);
 if(!['S03','S06','S07','S08','S09','S10','S14','S18','S27'].includes(s.id)){
  const overlay=document.createElement('div');overlay.className='preview-overlay';preview.append(overlay);text('h4',s.name,overlay);text('p',s.content,overlay);text('span',s.action,overlay,'preview-cta');text('small','DESIGN STATE · MATH VALUES TBD',overlay);
 }
 const spec=document.querySelector('#screen-spec');spec.replaceChildren();
 for(const [label,val] of [['Вход',s.trigger],['Контент',s.content],['Действия',s.action],['Переходы',s.next.join(' → ')],['Ошибки',s.errors.join(', ')||'—'],['Реализация',s.runtime]]){text('h3',label,spec);text('p',val,spec)}
}
for(const s of data.screens){const b=document.createElement('button');b.textContent=`${s.id} ${s.name}`;b.dataset.id=s.id;b.addEventListener('click',()=>show(s));list.append(b)}
document.querySelector('#viewport').addEventListener('change',e=>preview.className='screen-preview '+e.target.value);
show(data.screens[2]);
const player=new RasterWitchPlayer(document.querySelector('#art-player'));
function contact(state){const c=document.querySelector('#contact');c.replaceChildren(...[0,1,2,3].map(f=>img(rasterSource(state,f))))}
contact('IDLE');document.querySelector('#art-state').addEventListener('change',e=>{player.switchTo(e.target.value);contact(e.target.value)});
for(let i=0;i<12;i++)document.querySelector('#symbols').append(img(`./assets/symbols/item-${String(i).padStart(2,'0')}.png`));
window.addEventListener('pagehide',()=>player.destroy(),{once:true});
