# M04 raster iteration — 2026-11-01

Built-in OpenAI image generation, edit mode; no CLI/API-key workflow. Model version, account plan and seed were not returned. References are original M03 `frame-00.png` and `frame-08.png`; no new third-party imagery. Rights/content review remains pending. Terms reference: https://openai.com/policies/terms-of-use/ . User authorized code, art and documentation for M04 on 2026-11-01.

## Pass 1 — exact prompt

Use case: identity-preserve. Asset type: ONE production-organized raster sprite atlas for Hex & Heat, a dark fantasy alchemy game. Input 1 and 2 are references for the SAME unmistakably adult witch (age about 35), burgundy wavy hair, dark plum dress and hat, copper/gold trim and jade accents. Preserve her recognizable face, palette and costume. Create exactly a REGULAR GRID 4 COLUMNS by 5 ROWS, no gaps or borders, 20 equal cells, transparent background, no text, no labels, no scenery. Each cell contains exactly one full-body view including entire hat and boots with comfortable 10 percent transparent margin. All 20 witch figures have IDENTICAL scale, root pivot, foot baseline, camera and clean polished painterly rendering. Avoid extreme limb motion or perspective. Four cells per row are chronological key poses for a subtle 4-second loop: neutral seam at time0, slight left sway time1, centered lift time2, slight right sway returning to seam time3. Row 1 IDLE: relaxed hands at waist, gentle sway. Row 2 SMALL_WIN: restrained smile, subtle one-hand flourish. Row 3 MEDIUM_WIN: warm confident smile, both hands slightly open at waist. Row 4 BIG_WIN: confident joyful pose, hands open slightly higher but staying within silhouette. Row 5 BONUS: ritual composure, hands symmetrically near chest, jade hand glow small and restrained. The FIRST CELL of EVERY row MUST be the same neutral anchor pose to make cross-row transitions possible; only face and subtle light may change. Loop seam last->first remains close, no sudden big movement. Stable eyes, fingers, neckline and hair silhouette across every frame. Opaque tasteful costume, no nudity, no explicit content, no childlike traits. Render atlas portrait 4:5 aspect, every cell square, e.g. 1024 by1280 total. Technical priorities: regular evenly spaced grid, all body parts safely inside cells, true alpha, strong identity consistency, clean silhouette at small game sizes. No baked checkerboard, no logo, no watermark.

Observation: selected for another pass because of insufficient frame-edge padding. Not shipped.

## Pass 2 — exact correction prompt

Edit target: the attached Hex & Heat witch sprite atlas. Make ONE technical correction only: keep exactly the same 4 columns x5 rows regular grid, same 20 poses, same mature adult character face and costume, same transparent background and identical overall 4:5 aspect ratio. Within EVERY square cell, reduce the full witch figure to 78% of its previous size and position it consistently centered horizontally with boots baseline at 90% of each cell height. Entire hat including tip and boots must now have generous transparent margin, approximately10% allaround. Absolutely no figure may touch or cross its cell boundary. Keep equal cell dimensions and no gutters between cells. The first character of every row stays the same shared neutral anchor pose. Preserve expressions, copper/plum/jade palette, materials and clean alpha. No text, no extra objects, no checkerboard, no watermark. This correction is about consistent cell-safe padding and common root pivot, do not redesign character.

Observation: delivered 1122×1402 RGBA atlas. Padding and identity are improved, but shared neutral pose is approximate and silhouette/hand/hem differences remain. Four poses per state are still a coarse animatic; no smooth-motion or human approval claim. The first image in each row is close to the common neutral anchor. The four-frame loop and cross-tier seams still require visual approval. No real Spine rig is created.

## Runtime export

Selected image is stored in the originating built-in image result; source SHA256 is recorded in ASSET_MANIFEST. Runtime: `apps/web/assets/witch/witch-atlas-m04.webp`, 367012 bytes, 1122×1402, alpha retained. FFmpeg WebP encoding only, no retouch, crop or resizing:

```bash
ffmpeg -i SOURCE_PNG -c:v libwebp -quality 88 apps/web/assets/witch/witch-atlas-m04.webp
```

The runtime samples four columns/five rows using CSS background position. Fractional cell dimensions are intentional at this source size; safe transparent margins reduce edge bleed. If the atlas fails decode, the original 20 M03 PNGs remain the fallback. All original M03 registered asset hashes remain unchanged. Heavy source masters are not added to Git.
