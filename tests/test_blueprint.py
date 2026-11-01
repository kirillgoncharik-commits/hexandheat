import hashlib
import json
import subprocess
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class BlueprintTests(unittest.TestCase):
    def test_validator_passes(self):
        result = subprocess.run(
            [sys.executable, str(ROOT / "tools/validate_repo.py")],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_asset_manifest_matches_registered_raster_outputs(self):
        data = json.loads((ROOT / "assets/ASSET_MANIFEST.json").read_text())
        self.assertEqual(data["version"], 4)
        self.assertEqual(len(data["assets"]), 42)
        atlas = next(a for a in data["assets"] if a["id"] == "M04-WITCH-ATLAS-V2")
        self.assertEqual(atlas["grid"]["cycle_ms"], 4000)
        self.assertEqual(atlas["grid"]["columns"] * atlas["grid"]["rows"], 20)
        ids = set()
        for asset in data["assets"]:
            self.assertNotIn(asset["id"], ids)
            ids.add(asset["id"])
            path = ROOT / asset["uri"]
            self.assertTrue(path.is_file(), asset["uri"])
            content = path.read_bytes()
            self.assertEqual(asset["bytes"], len(content))
            self.assertEqual(asset["sha256"], hashlib.sha256(content).hexdigest())
            self.assertTrue(asset["provenance"]["rights_review"])

    def test_functional_prototype_is_primitive(self):
        web_files = [p for p in (ROOT / "apps/web").rglob("*") if p.is_file()]
        self.assertTrue(web_files)
        forbidden = {".mp4", ".webm", ".mov", ".wav", ".flac", ".psd", ".blend"}
        self.assertFalse([p for p in ROOT.rglob("*") if p.is_file() and p.suffix.lower() in forbidden])


if __name__ == "__main__":
    unittest.main()
