#!/usr/bin/env python3
"""Build an existing-Site static review from a saved GitHub source state."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys

ROOT=Path(__file__).resolve().parents[1]
def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def main():
    destination=Path(sys.argv[1]).resolve()
    if destination==ROOT or ROOT in destination.parents:raise SystemExit('Build outside source checkout')
    identity=destination.parent/'.openai/hosting.json'
    if destination.name!='dist' or not identity.is_file() or json.loads(identity.read_text()).get('project_id')!='appgprj_6ae43bec02248191866ae51ec7721ec1':
        raise SystemExit('Expected dist under the confirmed existing Site checkout')
    status=subprocess.check_output(['git','status','--porcelain'],cwd=ROOT,text=True)
    if status.strip():raise SystemExit('Save/commit the source before packaging')
    source=ROOT/'apps/web'
    # Replace only the known dist subtree inside the selected Site checkout.
    if destination.exists():shutil.rmtree(destination)
    destination.mkdir(parents=True,exist_ok=True)
    for path in source.rglob('*'):
        if not path.is_file() or any(p in {'tests','scripts','.cache'} for p in path.relative_to(source).parts) or path.name in {'README.md','package.json'}:continue
        target=destination/path.relative_to(source);target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(path,target)
    rules=json.loads((source/'assets/m05/rules.json').read_text());fixtures=json.loads((source/'assets/m05/fixtures.json').read_text());assets=json.loads((ROOT/'assets/ASSET_MANIFEST.json').read_text())
    files={str(p.relative_to(destination)):digest(p) for p in sorted(destination.rglob('*')) if p.is_file() and p.name!='review-manifest.json'}
    manifest={'version':'m05-review-1','productionReady':False,'sampleOutcomes':True,'realFunds':False,
        'repository':'https://github.com/kirillgoncharik-commits/hexandheat',
        'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),
        'sourceBranch':subprocess.check_output(['git','branch','--show-current'],cwd=ROOT,text=True).strip(),
        'baseCommit':'53b9a11aff738193c999a850ac3ed6d81c80488e','v7PreservationCommit':'4614a31',
        'previousSiteSourceCommit':'52c45bcb8ca241bbaef412e74193399a4522ee85',
        'projectId':'appgprj_6ae43bec02248191866ae51ec7721ec1','audience':'public (preserved)',
        'rulesVersion':rules['version'],'configLabel':rules['label'],'configHash':rules['configHash'],
        'assetVersion':assets['version'],'symbolRegistryVersion':'m05-symbols-1','fixtureVersion':fixtures['version'],
        'fixturePackSha256':digest(source/'assets/m05/fixtures.json'),'rulesSha256':digest(source/'assets/m05/rules.json'),
        'layout':'A','candidate':'v7 CMU 49_12 SMALL_WIN opt-in; human art acceptance pending',
        'files':files}
    (destination/'review-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({key:manifest[key] for key in ['sourceCommit','configHash','fixturePackSha256','productionReady']}))
if __name__=='__main__':main()
