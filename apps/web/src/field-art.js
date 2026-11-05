/** Presentation geometry only; authoritative books/payouts stay untouched. */
export function rewardTier(paid,bet,capped=false){return capped?'cap':paid<=0?'loss':paid<bet?'return':paid===bet?'equal':paid<bet*4?'small':paid<bet*10?'medium':'big';}
export function cauldronMouth(rect){return {x:(rect.x??rect.left)+rect.width*.5,y:(rect.y??rect.top)+rect.height*.36};}
export function landingOffset(offset,p,height){
 if(!offset||p>=1)return 0;if(p<=0)return offset;
 if(p<.84){const t=p/.84,q=t<.5?4*t*t*t:1-(-2*t+2)**3/2;return offset*(1-q);}
 return Math.sin((p-.84)/.16*Math.PI)*height*.025;
}
export function potionSample(f,p){
 const q=Math.max(0,Math.min(1,(p-.12)/.6)),cx=(f.x+f.tx)/2,cy=(f.y+f.ty)/2-18;
 return {x:(1-q)**2*f.x+2*(1-q)*q*cx+q*q*f.tx,y:(1-q)**2*f.y+2*(1-q)*q*cy+q*q*f.ty,angle:Math.atan2(2*(1-q)*(cy-f.y)+2*q*(f.ty-cy),2*(1-q)*(cx-f.x)+2*q*(f.tx-cx)),q};
}
