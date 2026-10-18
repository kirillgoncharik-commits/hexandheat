---
id: DOC-07
version: 0.9.0
date: 2026-10-18
status: PROPOSED_CONTENT_REVIEW_REQUIRED
dependencies: [DOC-01, DOC-06]
related: [DOC-08, ASSET_REGISTER]
confidence: MEDIUM
---

# Art Direction & Asset Production

## Visual thesis

Premium Dark Fantasy × Magical Cabaret × Alchemy: black plum, oxidized copper, ember orange and toxic jade against a low-detail workshop. Lighting hierarchy: warm cauldron underlight, cool moon rim, readable neutral board. Avoid generic neon gradients, emoji-like symbols and mismatched AI texture density.

Palette: `#120D18` void, `#2A1833` plum, `#B66A3C` copper, `#FF9A3C` ember, `#70E0A2` potion, `#E7D8C4` parchment. Final contrast is measured in UI context.

## Character bible

The witch is unmistakably adult (target apparent age 28–35), confident, theatrical and athletic. Consistency locks: face reference sheet, hair silhouette, hornless hat shape, asymmetrical copper corset, jade gem, glove length, body proportions, camera 3/4, lens/framing, key/fill/rim ratios. Sensual costume is non-transparent; breasts/genitals/buttocks remain covered; no school/uniform, petite-child coding or youthful props. Human content review approves key art before motion generation.

## Environment and symbols

Workshop architecture remains stable behind fixed character plate. Cauldron is a gameplay instrument with large multiplier window, not clutter. High symbols are ornate recognizable props; low vials use distinct silhouette plus glyph. FX colors map consistently: jade=modifier, ember=win heat, violet=magic/transition.

## Inventory and specs

| Group | Items | Master → runtime |
|---|---|---|
| Character | key art, turn/face/costume sheets, 5 state clips, transition/fallback frames | lossless masters → VP9 WebM + H.264 MP4 + atlas |
| Board | 9 regular symbols, potion, scatter deferred, frames/masks | layered source → WebP/AVIF/PNG as tested |
| Environment | desktop/portrait/popout plates, cauldron states | layered source → responsive raster variants |
| UI | buttons, panels, icons, paytable, localization-safe labels | SVG where original/vector; raster when textured |
| FX | sparks, smoke, liquid, win tiers | Pixi particles/textures; baked only when necessary |
| Marketing | icon, thumbnail, key art, promo crops | separate export specs at submission |

Exact dimensions are derived from tested layouts; do not upscale arbitrary generations into masters.

## AI image pipeline

1. Rights-safe brief and negative constraints; no living-artist/style imitation or protected character references.
2. Generate exploration only after provider terms and budget approval.
3. Human selects one identity; create canonical face/costume/lighting sheets.
4. Controlled variants use the canonical reference and locked prompt/config.
5. Manual paintover fixes anatomy, hands, fabric, symbol legibility and duplicates.
6. Color-managed export, background separation, artifact scan and small-size readability test.
7. Register prompt hash, model/version, account plan, terms URL/date, input rights, editor, output checksum and review status.

Primary exploration recommendation: Adobe Firefly where commercially safe provenance is valuable; reserve: approved image model with documented commercial rights and reference control. No tool is approved merely by this document; current terms are checked at G2.

## Consistency QA

Side-by-side contact sheet at native and 25% scale; face embedding is only a triage metric, never acceptance; costume checklist; silhouette comparison; palette delta; hand/anatomy review; alpha fringe test; mobile contrast; adult-content checklist; provenance completeness. Reject an asset rather than patching identity drift across multiple states.
