# M04 registered character source layers

Date: 2026-11-02. Parent: Issue #20. Status: art/source candidate for one reference cycle; no final art acceptance or native Spine validation.

## Tool and references

The three master paintings were made with the built-in OpenAI Imagegen tool. Model version, account plan, seed and entitlement were not returned; they are not invented here. Terms URL for subsequent human review: https://openai.com/policies/terms-of-use/ . This record does not assert commercial rights or platform acceptance.

The complete setup painting references the project's original `apps/web/assets/witch/frame-10.png` for body/costume and `apps/web/assets/witch/rig/head.png` for the mature face, burgundy hair and hat. The subsequent garment and legs edits reference only that complete setup painting. This is a new high-resolution reconstruction of the project character, not a pixel-identical enlargement of M03 or an approved final model sheet.

Ignored master paths:

- `../hexheat-reference-cycle-media/masters/canonical-setup.png`
- `../hexheat-reference-cycle-media/masters/garment-overlap.png`
- `../hexheat-reference-cycle-media/masters/legs-overlap.png`

Their exact file sizes and SHA-256 are recorded under `sources` in `apps/web/assets/witch/reference-cycle/layers.json`. Each final PNG also has a hash and byte size there. The masters are local source material and must be preserved in the approved media store before discarding this checkout.

## Prompt 1 — coherent setup painting

Use case: identity-preserve. Asset: a single coherent full-body neutral setup painting for a 2D game character rig, Hex & Heat. Image 1 is the canonical character/costume reference; image 2 is a supporting close-up for exact mature face, burgundy curls and hat. Reconstruct ONE whole anatomically coherent adult witch, apparent age 35, head to toe, on genuine transparent background, high-resolution portrait 1024x1536 or taller supported. Preserve the first image's elegant hourglass body, copper-embroidered plum corset, voluminous continuous long plum skirt with golden embroidery and modest front slit, opaque underlayer/stockings and heeled boots; keep image2's exact face/hat. Do not redesign costume into a short skirt or separate floating side panels. Neutral front-three-quarter camera, body facing almost front, weight balanced with both feet visible and separated naturally, shoulders relaxed, arms slightly extended diagonally DOWN and OUT (30 degrees from body), forearms and hands separated from skirt silhouette; wrists relaxed, fingers together in elegant natural hands. Balanced setup pose, no dance or magic effects, no props. The skirt must be ONE continuous garment with believable central folds, not two detached curtains; natural matching scale of arms, hands, torso and legs. Full figure has generous transparent margin. Soft consistent warm key and cool rim, painterly premium game art matching reference; no new background, cast floor shadow, text, labels, grids, sprite atlas or duplicated body parts. Goal is one coherent approved model sheet pose from which layers will be prepared.

The word “approved” in the generation instruction describes the intended production goal; it is not evidence of approval.

## Prompt 2 — hidden garment overlap

Use case: precise-object-edit / rig layer preparation. Edit target is the provided SINGLE coherent witch setup painting. Produce ONLY the continuous CLOTHED BODY AND DRESS layer in its EXACT ORIGINAL position, scale, silhouette, camera and 1024x1536 canvas. Preserve every visible plum/gold corset and skirt pixel design, including full continuous hem and covered central slit. Remove the entire head, hat, ALL hair, both arms and hands, and both boots/feet, replacing those removed areas with completely transparent alpha. Keep and neatly complete the clothed torso neck/collar area, shoulders and underarm overlap hidden by the hair/arms; complete the upper corset surface behind the removed curls. No naked breasts, no new body exposed: costume stays fully opaque and the slit has its dark stocking/underskirt surface. Neck ends neatly at the original chin height. Keep the continuous voluminous dress as ONE garment, no separated panels and no floating ornaments. This is a registered source layer to go behind the original head/arms/boots, not a new outfit or centered product composition: do not shift or rescale the dress. Remove ALL background, glow, haze, vignette, cast shadows and colored aura outside the garment. Outside the garment and short neck/shoulder overlap is true ZERO alpha, no gray/checkerboard pixels baked in. No text, labels or additional objects.

Observed limitation: the generator retained sleeve fabric. The mechanical source mask excludes those sleeves; canonical arms supply the visible sleeves. A polygonal slit is transparent in the extracted garment so that the reconstructed stocking leg is visible instead of the generator's filled slit.

## Prompt 3 — hidden legs and boots

Use case: precise-object-edit. Rig SOURCE LAYER edit of provided witch. Keep exact same 1024x1536 canvas registration, camera and character proportions. Isolate ONLY the TWO fully clothed LEGS AND BOOTS, in their original positions in the lower half of the canvas. Remove the head, torso, arms, hair and all skirt fabric to true transparent alpha. Reconstruct hidden portions of her two stocking-clad legs from upper thighs to knees, and retain identical gold-embroidered plum knee-high heeled boots and feet exactly as the reference. Upper legs must be fully covered in opaque dark plum stockings; no pelvis, underwear, nude body or exposed upper edge. Legs are about shoulder-width separated, natural straight relaxed neutral pose, toes slightly outward with both soles at original y1510. Keep left boot near x390 and right boot near x610; source top starts around y760. Full limb overlaps up to upper-thigh height should be included for later skirt occlusion. Do not center, rescale, change boots or add floor shadow. The entire empty upper half and space outside legs/boots must be zero alpha, with no background, aura, glow, text or labels. Exactly two stocking-clad legs/boots as source layer, no loose parts.

## Mechanical layer preparation

Run `node tools/prepare_reference_art.mjs` with `@napi-rs/canvas` available through `CODEX_PRIMARY_RUNTIME_NODE_MODULES` or the bundled runtime. The tool only clips existing source pixels into six registered layers; it does not draw new costume/body pixels, resize layers, recolor them, or stretch their aspect ratios. Small disconnected dust islands in the arm masks are removed. Layer PNGs retain transparent margins inside their source bounds and the setup is reconstructed by placing each crop at its `sourceBounds` origin.

Layer order: `leg-left`, `leg-right`, `garment`, `arm-left`, `arm-right`, `head-hair`. Names use viewer sides. One connected garment replaces independently stretched skirt panels. Each complete sleeve stays in one texture across the elbow. The head/hair layer contains a canonical neck/collar overlap down to y375; its lower vertices need chest/shoulder weighting, not a single rigid head transform. Hair strands crossing shoulders remain a known separation/weighting concern under large motions.

The source descriptor contains the original 1024×1536 registration, crop bounds, clipping polygons, hole polygons, optional overlap polygons, hashes and manually selected anatomical landmarks. Those landmarks are rigging guides rather than automated anatomical certification.

## Visual verification and remaining work

The regenerated static assembly was inspected on dark, off-white and gray backgrounds in `../hexheat-reference-cycle-media/renders/assembled-backgrounds.png`; layer layout is in `layers-contact.png`. These QA files are ignored renders. The neck overlap was widened after the first assembly exposed small crescents between hair and collar. No artistic paint was added in code to hide them.

This verifies a coherent static source assembly only. Moving pose/weight review, severe shoulder occlusions, hem/sole contact, facial and finger animation, all loop transitions, native Spine import and real-device performance remain open. There is no `.spine` source or editor-validated runtime export in this asset task.
