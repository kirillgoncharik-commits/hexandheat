# Asset Register

Version 0.9.0 · 2026-10-18 · Status: planned · Depends on DOC-07/08/09.

Machine-readable runtime records live in `assets/ASSET_MANIFEST.json`. This register defines planned families and acceptance owners.

| ID family | Asset | Count | Owner | Runtime | Gate |
|---|---|---:|---|---|---|
| CHR-KEY | face/costume/pose/lighting sheets | 4–8 | Art | review-only proxy | adult/content/identity |
| CHR-VID | idle/small/medium/big/bonus clips | 5 + encodes | Animation | WebM + MP4 | POC-B/device |
| CHR-FB | posters/atlases | ≥5 | Animation | WebP/AVIF/PNG | fallback test |
| SYM-H/L | high/low symbols | 9 | Art | responsive raster | 25% legibility |
| SYM-MOD | potion/cauldron/scatter | 2–3 | Art/Design | raster + FX masks | rules match |
| ENV | desktop/portrait/popout plates | 3–6 | Art/UI | responsive raster | layout/contrast |
| UI | controls/panels/icons/paytable | set | UI | SVG/raster | accessibility |
| FX | particles/smoke/liquid/trails | set | FX | texture/config | performance |
| MUS | BASE/ENERGY/HOT/BONUS stems | 3–4 | Audio | alternate web encodes | rights/phase/loop |
| SFX | UI/board/win/potion/cauldron/error | 20–40 | Audio | compressed web audio | mix/variants |
| MKT | icon/thumbnail/key art | set | Art | submission exports | platform spec |

## Required metadata

ID, semantic role, source/master URI, runtime URI, SHA-256, bytes, MIME/codec/dimensions/duration, creator/tool/model/version, prompt/config hash, input sources/rights, account plan, terms URL/date, commercial-use review, human edits/reviewer, status, replacement link and retention class.

## Lifecycle

`exploration → selected → edited → rights-reviewed → technically-validated → approved → published → superseded`. Runtime manifests reference only `approved`. Deleting an external master requires retention approval; superseded assets remain addressable for replaying released versions.

## Git limits

No raw generations or masters. CI blocks files >1 MiB unless allow-listed test fixture ≤5 MiB. Store small review proxies only when their rights permit repository access. Every external asset URI must be immutable or paired with a digest.
