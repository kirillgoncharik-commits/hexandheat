#!/usr/bin/env python3
"""Deterministic preview encoding of registered image_gen concept masters."""
from pathlib import Path
import hashlib,json,sys
from PIL import Image,ImageOps
ROOT=Path(__file__).resolve().parents[1]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 source=Path(sys.argv[1]).resolve();target=ROOT/'apps/web/assets/m07-study';target.mkdir(parents=True,exist_ok=True)
 poses=[]
 for name in ['canonical','weight','accent','release']:
  original=source/(name+'.png');detail=target/(name+'-detail.webp');Image.open(original).convert('RGBA').save(detail,quality=93,method=6);im=Image.open(original).convert('RGBA');im=ImageOps.expand(im,border=32,fill=(0,0,0,0)).resize((624,624),Image.Resampling.LANCZOS);path=target/(name+'.webp');im.save(path,quality=91,method=6)
  poses.append({'id':name,'path':'./assets/m07-study/'+path.name,'sha256':sha(path),'bytes':path.stat().st_size,'master':'hexheat-m07-artpass-media/'+original.name,'masterSha256':sha(original),'width':624,'height':624,'detailPath':'./assets/m07-study/'+detail.name,'detailSha256':sha(detail),'detailBytes':detail.stat().st_size,'detailWidth':1254})
 assert (source/'seam.png').read_bytes()==(source/'canonical.png').read_bytes()
 manifest={'version':'m07-study-2','status':'STEPPED CONCEPT — ART REVIEW OPEN','durationMs':4000,'productionAnimation':False,'artAccepted':False,'sourceFps':'4 distinct key drawings, timed holds; no in-betweens','encoding':'uniform32px transparent padding,624x624 WebP quality91/method6; no pose retouching','poses':poses,'timeline':[{'at':0,'pose':'canonical'},{'at':550,'pose':'weight'},{'at':1350,'pose':'accent'},{'at':2150,'pose':'release'},{'at':3150,'pose':'weight'},{'at':3650,'pose':'canonical'},{'at':4000,'pose':'canonical'}],'seam':{'first':'canonical','last':'canonical','sameBytes':True,'velocity':'step holds at ends, not a smooth C1 animation'},'notes':['Screen-left/down gesture; raised hands','Eyes open in selected poses','Minor face/curl/ornament drift remains','Hat tip meets source edge; padded preview does not reconstruct missing art','Full hand anatomy and artistic camera registration remain human-review tasks']}
 manifest.update(json.loads((ROOT/'assets/prompts/m07-artpass/crop-guides.json').read_text()))
 (target/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({'poses':len(poses),'bytes':sum(p['bytes']for p in poses),'seam':'identical canonical'},ensure_ascii=False))
if __name__=='__main__':main()
