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

    def test_asset_manifest_starts_empty(self):
        data = json.loads((ROOT / "assets/ASSET_MANIFEST.json").read_text())
        self.assertEqual(data["version"], 1)
        self.assertEqual(data["assets"], [])

    def test_no_gameplay_source_in_docs_phase(self):
        files = [p for p in (ROOT / "src").rglob("*") if p.is_file()]
        self.assertEqual(files, [ROOT / "src/README.md"])


if __name__ == "__main__":
    unittest.main()
