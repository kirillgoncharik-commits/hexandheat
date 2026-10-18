#!/usr/bin/env python3
"""Run every dependency-free milestone check with one command."""

from __future__ import annotations

from pathlib import Path
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[1]


def run(label: str, command: list[str], cwd: Path = ROOT) -> None:
    print(f"\n== {label} ==", flush=True)
    result = subprocess.run(command, cwd=cwd, check=False)
    if result.returncode:
        raise SystemExit(result.returncode)


def main() -> None:
    run("repository policy", [sys.executable, "tools/validate_repo.py"])
    run(
        "controlled-document tests",
        [sys.executable, "-m", "unittest", "discover", "-s", "tests", "-p", "test_blueprint.py", "-v"],
    )
    run(
        "math and replay tests",
        [sys.executable, "-m", "unittest", "discover", "-s", "tests/math", "-p", "test_*.py", "-v"],
    )
    run("browser-domain tests", ["npm", "test"], ROOT / "apps/web")
    print("\nMilestone verification passed.")


if __name__ == "__main__":
    main()
