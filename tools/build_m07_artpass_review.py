#!/usr/bin/env python3
"""Package the committed v11 art-review response into the same Site."""
import json,sys
from pathlib import Path
import build_m07_review
from build_m05_review import ROOT,digest

def main():
 build_m07_review.main();destination=Path(sys.argv[1]).resolve();path=destination/'review-manifest.json';m=json.loads(path.read_text());study=ROOT/'apps/web/assets/m07-study/manifest.json'
 m.update(version='m07-artpass-1',baseCommit='2315fe93743d025e19f10767a3f7dcbce7d878a0',previousSiteSourceCommit='0a61f7bda018708e75769a6dee831ed0c2c90ec4',layout='M06 hero / same42px portrait payout band; new final-paid hierarchy',candidate='four corrected keys /4000ms stepped study opt-in; no smooth in-betweens',keyPosesSha256=digest(ROOT/'apps/web/assets/m07-study/canonical.webp'),keyPosesManifestSha256=digest(study),studyVersion=json.loads(study.read_text())['version'],artAcceptance='OPEN — v11 review reworked; M07 study/field need human acceptance',visualBetaAcceptance='OPEN',productionReady=False)
 path.write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n');print(json.dumps({k:m[k]for k in ['sourceCommit','version','studyVersion','keyPosesManifestSha256']}))
if __name__=='__main__':main()
