# Issue #20 - living atelier

Baseline: 332ad036c032c82bc33b3eeb7b84ed589e131de8, PR #24. Branch agent/presentation/20-ambient-scene.

Input: PO requested animated candles and landscape. Original atelier plate and SceneTransport reused. No new generated art, external libraries or paid tools. Copyright/provenance of the existing plate remains in asset manifest; procedural overlay is original source.

Files: ambient-scene.js, app/index/visual.css integration, Motion Lab controls, ambient tests and docs/m04/AMBIENT_SCENE_RU.md. Canvas has a fixed pixel budget, masked outdoor haze and local candlelight, static fallback, Reduced Motion, lifecycle cleanup. No wallet/math/schema changes.

Validation: python3 tools/verify_milestone.py; tests cover world seam/bounds, scene pause/resume and plate alignment. Browser smoke and screenshot to be recorded in reports/M04_AMBIENT_REVIEW.md before publication.

Open: human light/mask/art review, real mobile performance, original audio, native Figma motion page and full M04.2. Next: review current scene and approve the math proposal separately from production lock/submission.
