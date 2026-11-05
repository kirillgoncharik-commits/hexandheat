/** Explicit review-only marker stop; no outcome or wallet modification. */
export function mountFieldInspector(transport,director){
 const host=document.createElement('aside');host.className='field-inspector';host.setAttribute('aria-label','Field inspection controls');
 const label=document.createElement('label');label.textContent='Остановиться на: ';
 const select=document.createElement('select');select.setAttribute('aria-label','Этап поля');
 for(const [value,text] of [['field.group','Группа / paid'],['field.paid','Общий paid'],['field.potionImpact','Potion impact'],['field.remove','Удаление'],['field.fall','Падение'],['board.settled','Settled'],['field.final','Final']]){const o=document.createElement('option');o.value=value;o.textContent=text;select.append(o);}
 label.append(select);const resume=document.createElement('button');resume.textContent='Продолжить';const status=document.createElement('output');status.textContent='Review only · выберите этап и нажмите Spin';host.append(label,resume,status);document.body.append(host);
 let lastRecord=null,armed=true,generation=director.generation;
 const unsubscribe=transport.subscribe(()=>{
  if(generation!==director.generation){generation=director.generation;armed=true;}
  const lastIndex=director.trace.indexOf(lastRecord),fresh=director.trace.slice(lastIndex+1);lastRecord=director.trace.at(-1);
  const marker=armed&&fresh.find(e=>e.type===select.value);
  if(marker){armed=false;transport.pause('field-inspection');status.textContent=`${marker.type} · ${marker.at} ms · round ${generation}`;}
 },40);
 select.addEventListener('change',()=>{armed=true;transport.resume('field-inspection');});resume.addEventListener('click',()=>{armed=true;transport.resume('field-inspection');status.textContent='До следующего выбранного этапа';});
 return ()=>{unsubscribe();transport.resume('field-inspection');host.remove();};
}
