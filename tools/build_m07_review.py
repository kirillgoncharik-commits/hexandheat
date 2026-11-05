#!/usr/bin/env python3
"""Build committed M07 runtime into the same confirmed existing Site."""
import json
import sys
from pathlib import Path
import build_m06_review
from build_m05_review import ROOT,digest

def main():
    build_m06_review.main()
    destination=Path(sys.argv[1]).resolve();path=destination/'review-manifest.json';manifest=json.loads(path.read_text());pack=ROOT/'apps/web/assets/m07/fixtures.json';data=json.loads(pack.read_text())
    manifest.update(version='m07-field-review-1',baseCommit='7392b93a22a1c17fcd749b618fc17f4f5764dbe7',previousSiteSourceCommit='3fceb33ab546a43fa87aade73b6fa7b97a7c08d8',fixtureVersion=data['version'],fixturePackSha256=digest(pack),scenarioCounts={'m07':len(data['cases']),'m05':12,'symbolTiers':45,'symbolBoundaries':135},curatedNotDistribution=True,defaultCharacter='neutral portrait for field review',keyPosesSha256=digest(ROOT/'apps/web/assets/m07/small-win-keyposes-v1.webp'),artAcceptance='OPEN — M06 motion REWORK; M07 concept poses PENDING',visualBetaAcceptance='OPEN',physicalDevices='UNAVAILABLE',productionReady=False)
    path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');print(json.dumps({k:manifest[k]for k in ['sourceCommit','version','fixtureVersion','fixturePackSha256']}))
if __name__=='__main__':main()
