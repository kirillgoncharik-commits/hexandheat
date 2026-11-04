export function layoutMetrics(doc=document,manifest=null){
 const rect=s=>{const r=doc.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom};};
 const hero=rect('.side-column'),board=rect('#board'),cell=rect('#board .symbol'),canvas=rect('.m06-character');
 const clips={};
 if(manifest)for(const state of ['IDLE','SMALL_WIN']){
  const clip=manifest.clips[state][manifest.selected[state].fps],scale=canvas.width/manifest.width;
  const points=clip.faceLandmarks??[];
  const heights=points.map(p=>Math.abs(p.chin[1]-p.forehead[1])*scale);
  clips[state]={minFacePx:heights.length?Math.min(...heights):null,maxFacePx:heights.length?Math.max(...heights):null,allFacesInside:points.length>0&&points.every(p=>[p.forehead,p.chin].every(v=>canvas.y+v[1]*scale>=hero.y&&canvas.y+v[1]*scale<=hero.bottom))};
 }
 const targets=[...doc.querySelectorAll('.header-actions button,#spin-button,#bet-select,#replay-button,.toggle-control')].map(n=>{const r=n.getBoundingClientRect();return {id:n.id||n.getAttribute('aria-label')||n.textContent.trim(),width:r.width,height:r.height};});
 return {viewport:{width:doc.defaultView.innerWidth,height:doc.defaultView.innerHeight},hero,board,cell,clips,targets,scroll:{x:doc.documentElement.scrollWidth>doc.defaultView.innerWidth,y:doc.documentElement.scrollHeight>doc.defaultView.innerHeight},spin:rect('#spin-button'),money:[...doc.querySelectorAll('.control-meter strong')].map(n=>({text:n.textContent,overflow:n.scrollWidth>n.clientWidth}))};
}
