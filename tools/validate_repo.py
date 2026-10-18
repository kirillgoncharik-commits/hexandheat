#!/usr/bin/env python3
"""Dependency-free repository and documentation policy checks."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MAX_DEFAULT = 1 * 1024 * 1024
MAX_FIXTURE = 5 * 1024 * 1024
REQUIRED_DIRS = ("docs", "src", "math", "assets", "tests", "tools", "agents")
REQUIRED_ROOT = ("README.md", "AGENTS.md", "CONTRIBUTING.md", ".gitignore")
DOC_KEYS = ("id", "version", "date", "status", "dependencies", "related", "confidence")


def parse_frontmatter(path: Path) -> dict[str, str]:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n") or "\n---\n" not in text[4:]:
        raise ValueError("missing YAML front matter")
    block = text[4:].split("\n---\n", 1)[0]
    result: dict[str, str] = {}
    for line in block.splitlines():
        if ":" in line:
            key, value = line.split(":", 1)
            result[key.strip()] = value.strip()
    return result


def main() -> int:
    errors: list[str] = []
    for name in REQUIRED_DIRS:
        if not (ROOT / name).is_dir():
            errors.append(f"missing directory: {name}")
    for name in REQUIRED_ROOT:
        if not (ROOT / name).is_file():
            errors.append(f"missing root file: {name}")

    docs = sorted((ROOT / "docs").glob("DOC-*.md"))
    expected = {f"DOC-{i:02d}" for i in range(15)}
    found: set[str] = set()
    for path in docs:
        try:
            meta = parse_frontmatter(path)
        except ValueError as exc:
            errors.append(f"{path.relative_to(ROOT)}: {exc}")
            continue
        missing = [key for key in DOC_KEYS if key not in meta]
        if missing:
            errors.append(f"{path.relative_to(ROOT)}: missing metadata {missing}")
        if "id" in meta:
            found.add(meta["id"])
        if meta.get("date") != "2026-10-18":
            errors.append(f"{path.relative_to(ROOT)}: unexpected review date")
    if found != expected:
        errors.append(f"document IDs mismatch: missing={sorted(expected-found)} extra={sorted(found-expected)}")

    for path in ROOT.rglob("*"):
        if not path.is_file() or ".git" in path.parts:
            continue
        limit = MAX_FIXTURE if "fixtures" in path.parts else MAX_DEFAULT
        if path.stat().st_size > limit:
            errors.append(f"oversized file: {path.relative_to(ROOT)} ({path.stat().st_size} bytes)")

    try:
        manifest = json.loads((ROOT / "assets/ASSET_MANIFEST.json").read_text(encoding="utf-8"))
        if not isinstance(manifest.get("assets"), list):
            errors.append("asset manifest: assets must be an array")
        for asset in manifest.get("assets", []):
            if not re.fullmatch(r"[a-f0-9]{64}", asset.get("sha256", "")):
                errors.append(f"asset manifest: invalid sha256 for {asset.get('id')}")
    except (OSError, json.JSONDecodeError) as exc:
        errors.append(f"asset manifest invalid: {exc}")

    if errors:
        print("Repository validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1
    print(f"Repository validation passed: {len(docs)} controlled documents")
    return 0


if __name__ == "__main__":
    sys.exit(main())
