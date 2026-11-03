/** Trace a texture's alpha into clipped triangles; pure geometry, no pixel edits. */
export function traceBodyGeometry(pixels,width,height,origin,{step=16,threshold=24}={}){
 const [ox,oy]=origin,alpha=p=>{const x=Math.max(0,Math.min(width-1,Math.round(p[0]))),y=Math.max(0,Math.min(height-1,Math.round(p[1])));return pixels[(y*width+x)*4+3];};
 const vertices=[],triangles=[],ids=new Map();
 const index=p=>{const q=[Math.round((p[0]+ox)*1000)/1000,Math.round((p[1]+oy)*1000)/1000],key=q.join(',');if(!ids.has(key)){ids.set(key,vertices.length);vertices.push(q);}return ids.get(key);};
 function boundary(a,b){let inside=alpha(a)>=threshold?a:b,outside=inside===a?b:a;for(let i=0;i<10;i++){const mid=[(inside[0]+outside[0])/2,(inside[1]+outside[1])/2];if(alpha(mid)>=threshold)inside=mid;else outside=mid;}return inside;}
 function clip(points){const output=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],aa=alpha(a)>=threshold,bb=alpha(b)>=threshold;if(aa)output.push(a);if(aa!==bb)output.push(boundary(a,b));}
  if(output.length<3)return;const first=index(output[0]);for(let i=1;i<output.length-1;i++){const a=index(output[i]),b=index(output[i+1]);if(first!==a&&a!==b&&first!==b)triangles.push(first,a,b);}
 }
 function trace(points,depth=0){
  const [a,b,c]=points,ab=[(a[0]+b[0])/2,(a[1]+b[1])/2],bc=[(b[0]+c[0])/2,(b[1]+c[1])/2],ca=[(c[0]+a[0])/2,(c[1]+a[1])/2];
  const samples=[...points,ab,bc,ca,[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3]].map(p=>alpha(p)>=threshold);
  if(samples.every(Boolean)){clip(points);return;}
  if(!samples.some(Boolean))return;
  // A thin transparent underarm gap can cross a triangle whose corners are
  // opaque. Subdivide its edge/midpoint samples before tracing the boundary.
  if(depth<3){for(const t of [[a,ab,ca],[ab,b,bc],[ca,bc,c],[ab,bc,ca]])trace(t,depth+1);}
  else clip(points);
 }
 for(let y=0;y<height-1;y+=step)for(let x=0;x<width-1;x+=step){const xx=Math.min(x+step,width-1),yy=Math.min(y+step,height-1),a=[x,y],b=[xx,y],c=[x,yy],d=[xx,yy];trace([a,c,b]);trace([b,c,d]);}
 return {vertices,triangles,method:'adaptive alpha-clipped triangles with edge and interior sampling',step,threshold,maxSubdivision:3,origin:[ox,oy]};
}
