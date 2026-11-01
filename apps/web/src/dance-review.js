import { SceneTransport } from './scene-transport.js';
import { RigWitchPlayer } from './rig-witch-player.js';
import { RigWitchPlayer as PreviousPlayer } from './rig-witch-player-v2.js';
const $=id=>document.getElementById(id),transport=new SceneTransport();
let offset=0;
// Scrubbing is confined to this art-only view; the game transport is not seekable.
const clock={get now(){return transport.now+offset;},subscribe(fn,p){return transport.subscribe(s=>fn({...s,now:s.now+offset}),p);}};
const before=new PreviousPlayer($('before'),{transport:clock,reviewPadding:true}),after=new RigWitchPlayer($('after'),{transport:clock});
const notes={
 IDLE:['Ожидание','Спокойный перенос веса с бедра на бедро. Плечи мягко отвечают в противоположную сторону; голова слегка склоняется к игроку. Одна рука поднимается к волосам, кисть довершает жест. Волосы и юбка догоняют корпус.'],
 SMALL_WIN:['Малый выигрыш','Короткое отведение корпуса назад как подготовка, затем кокетливый акцент бедром. Одна рука рисует полукруг и приглашает жестом кисти; вторая поддерживает линию талии. Мягкий обратный перенос веса завершает фразу.'],
 MEDIUM_WIN:['Средний выигрыш','Волна идёт от таза через грудную клетку к плечам. Руки раскрываются по очереди и создают разные диагонали, кисти отстают и догоняют. Смена опорной ноги сопровождается лёгким подъёмом свободной стопы; ткань продолжает движение после акцента.'],
 BIG_WIN:['Большой выигрыш','Выразительная подготовка вниз и в сторону, затем широкий подъём одной руки над головой. Другая рука раскрывает встречную диагональ. На втором акценте стороны меняются; бёдра, плечи и голова создают S-линию. Упругий подъём свободной стопы и широкий шлейф поддерживают праздник.'],
 BONUS:['Ритуал бонуса','Руки собирают пространство перед корпусом, расходятся к плечам и поднимаются в высокую арку. Кисти закручивают жест, словно собирая заклинание. Корпус делает медленную волну; в конце руки опускаются через грудную линию, а волосы и подол ещё следуют за движением.']
};
function state(){const id=$('state').value;before.switchTo(id);after.switchTo(id);before.blend=null;after.blend=null;before.tick();after.tick();$('direction-title').textContent=notes[id][0];$('direction-copy').textContent=notes[id][1];
 const index=['IDLE','SMALL_WIN','MEDIUM_WIN','BIG_WIN','BONUS'].indexOf(id);$('references').replaceChildren(...Array.from({length:4},(_,i)=>{const image=new Image();image.src=`./assets/witch/frame-${String(index*4+i).padStart(2,'0')}.png`;image.alt=`Сохранённая поза ${i+1}`;return image;}));}
$('state').addEventListener('change',state);$('pause').addEventListener('click',()=>transport.pause('review'));$('resume').addEventListener('click',()=>transport.resume('review'));
$('phase').addEventListener('input',()=>{transport.pause('review');offset=Number($('phase').value)/30*1000-transport.now;before.blend=null;after.blend=null;before.lastFrame=-1;after.lastFrame=-1;before.tick();after.tick();readout();});
$('reduced').addEventListener('change',()=>{before.setReducedMotion($('reduced').checked);after.setReducedMotion($('reduced').checked);before.tick();after.tick();});
function readout(){const phase=((clock.now%4000)+4000)%4000;$('phase').value=String(Math.floor(phase/1000*30));$('readout').textContent=`${transport.paused?'ПАУЗА':'ЦИКЛ'} · ${(phase/1000).toFixed(2)} / 4.00 с`;}
transport.subscribe(readout,30);document.addEventListener('visibilitychange',()=>document.hidden?transport.pause('hidden'):transport.resume('hidden'));
window.addEventListener('pagehide',e=>{transport.pause('pagehide');if(!e.persisted){before.destroy();after.destroy();transport.destroy();}});window.addEventListener('pageshow',e=>{if(e.persisted)transport.resume('pagehide');});
state();transport.start();if(document.hidden)transport.pause('hidden');
