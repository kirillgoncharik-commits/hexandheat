# Reproduce the CMU reference motions

Run from the repository root with Python 3.9+; no third-party packages are needed.

```bash
python3 tools/motion/bvh_motion.py
python3 tools/motion/prepare_reference_motions.py --source-dir /path/to/pinned-bvh-files --check
```

The first command checks channel order, parent FK, End Sites, SLERP wrap and interleaved translations. The second regenerates every position/root-track sample in memory and compares exact bytes and SHA-256 with the three committed reference JSONs. It writes nothing.

The source directory must contain `05_02.bvh`, `05_12.bvh`, and `49_12.bvh`. Default: ignored `assets/raw/cmu-motion/`. The manifest pins the CMU/Bruce Hahn conversion source, commit, raw-byte hashes, chosen crops/cameras, metadata and output hashes.

To download the missing pinned source files explicitly and reproduce into a separate directory:

```bash
python3 tools/motion/prepare_reference_motions.py --fetch --out-dir tmp/motion-reproduced
```

`--fetch` is optional. It downloads only the three BVH data files from pinned HTTPS GitHub raw URLs, verifies their sizes and SHA-256, and never downloads or runs external code. Without the flag, missing/corrupted source files fail with a clear error. Existing corrupted source files are never silently replaced.

To regenerate the committed runtime reference JSONs, omit `--check` and `--out-dir`. All source/output hashes are validated before any output is written; byte-identical existing files are left untouched. Use `--out-dir` for experiments. Output metadata/selection-study metrics remain the explicit pinned templates; this command reproduces the selected series rather than rerunning the heuristic search or declaring a new artistic assessment.

See [the Russian source record](../../docs/m04/MOTION_SOURCES_RU.md) for terms, provenance and limitations. These data files are research inputs, not final character animation, native Spine certification, finger capture, or a sole-contact solution.
