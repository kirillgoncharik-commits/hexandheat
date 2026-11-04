#!/usr/bin/env python3
"""Package the saved M06 GitHub source into the selected existing Site checkout."""
import json
import subprocess
import sys
from pathlib import Path
import build_m05_review

ROOT=Path(__file__).resolve().parents[1]
def main():
    build_m05_review.main()
    destination=Path(sys.argv[1]).resolve()
    path=destination/'review-manifest.json'
    manifest=json.loads(path.read_text())
    media=json.loads((ROOT/'apps/web/assets/m06/manifest.json').read_text())
    manifest.update(version='m06-review-1',baseCommit='586d2f399c8d31968955e3d412300dc964c04fa6',previousSiteSourceCommit='84d64e9debb8ecdaa3fde5e8550d99482010c5ac',layout='M06 full-width portrait hero',candidate='M06 PNG IDLE/SMALL_WIN opt-in; neutral other states; art acceptance pending',mediaManifestSha256=build_m05_review.digest(ROOT/'apps/web/assets/m06/manifest.json'),mediaVersion=media['version'],mediaSelection=media['selected'],artAcceptance='PENDING',physicalDevices='UNAVAILABLE')
    path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:manifest[k]for k in ['sourceCommit','version','mediaVersion','mediaManifestSha256']}))
if __name__=='__main__':main()
