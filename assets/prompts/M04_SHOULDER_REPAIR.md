# M04 shoulder repair — connected source candidate v7

2026-11-02. Issue #20. The v6 source-layer assembly was rejected after review: isolated arm textures included corset/hair fragments, and the head/hair overlap carried shoulder/collar pixels. Changing only bone weights cannot remove those duplicated source pixels. All v6 assets remain preserved for comparison.

## New generated masters

The parent task generated two registered 1024×1536 images with the built-in OpenAI Imagegen tool:

- `../hexheat-reference-cycle-media/masters/body-continuous.png`: a single connected body, shoulders, both complete arms/hands, corset and continuous skirt, with no head/hair/boots. This replaces the separate garment and arm source textures for the new mesh.
- `../hexheat-reference-cycle-media/masters/head-clean.png`: only the mature face, hat, neck and hair; no arms, shoulder skin, sleeves or clothing. It derives from tool output `exec-17cbb7cb-9efc-43fc-bc9c-c534c23887ac.png`.

The tool model version, seed, account plan and entitlement were not returned. They are not invented here. Terms URL for human rights review: https://openai.com/policies/terms-of-use/ . This is a record of generation, not commercial rights sign-off.

The detailed generation intent supplied to this bounded asset-preparation task was to preserve the established canonical face, plum/gold costume, proportions and registration; remove duplicated costume/hair pixels at the shoulder boundaries; and supply one genuinely connected body source plus a clean head. The exact Imagegen prompts are recorded below.

## Mechanical source processing

`tools/prepare_continuous_art.mjs` creates `body-continuous.webp`, `head-clean.webp` and `layers-v7.json`. The old leg textures and landmarks are retained unchanged. New sources are cropped in their original registration, encoded uniformly at WebP quality 95 and never stretched, rescaled or painted in code.

The body crop is `[20,284,984,1201]`; it contains the shoulders, both arms and continuous garment in one texture. The existing garment slit is made transparent to reveal the stocking-clad leg layers. The clean head crop is `[238,0,513,551]`. Within the central neck region `[465,294,115,61]`, existing head pixels are removed only where the registered body master has alpha at least 250. This exposes the body collar while retaining head/hair pixels wherever the body is transparent; the first broad geometric trim was rejected because it exposed a rectangular gap beside the collar. There is no canonical body/collar overlap patch in the clean head source.

Each new asset's exact bytes, SHA-256, crop, slit hole, neck-alpha trim rule and encoding are recorded in `layers-v7.json`, together with the new master hashes. Masters live outside the repository in the local media folder and must be preserved in the approved media store before this workspace is discarded.

## Verification limits

Static assembly is rendered for inspection on dark, off-white and gray backgrounds in `../hexheat-reference-cycle-media/shoulder-repair/assembled-backgrounds.png`. A close shoulder view is in `shoulders-close.png`. These are source-registration checks only. The parent task is responsible for shared shoulder mesh topology, continuous weight fields, moving-pose review, native Spine import/export and final visual acceptance. No native editor or final animation approval is claimed here.

## Exact Imagegen prompts

Both edits used `transparent_background: true` and the registered canonical setup as reference. Body output: `exec-6d3b4e30-76f2-4206-842d-1b4ced8d120e.png`. Head output: `exec-17cbb7cb-9efc-43fc-bc9c-c534c23887ac.png`.

### Connected body

Use case: precise-object-edit. This is a REGISTERED SOURCE LAYER repair for a 2D animation rig, NOT a new character or a sprite atlas. Keep the supplied image's EXACT 1024x1536 canvas, exact neutral pose, exact whole-body scale and coordinates. Produce ONE connected body layer that includes BOTH complete natural bare shoulders, both upper arms, both long plum sleeves, wrists and hands, connected naturally to the corset torso and the ONE continuous long skirt. These parts must remain one coherent painting through the shoulder-to-chest/underarm junctions; do not split or rearrange anything. Keep plum velvet, gold/copper embroidery, body proportions, skin color, shoulder anatomy, bodice silhouette, collar, lighting and all visible clothing details precisely matching the original. Remove ONLY the entire head, hat, ALL red hair and both boots/feet. Replace removed pixels with genuine zero alpha. Neatly reconstruct the small shoulder/chest/corset areas previously obscured by hair, maintaining opaque clothing and continuous skin where anatomically appropriate. No red hair fragments anywhere on the neck, shoulders, upper arms or chest. No duplicate breast/corset fragments near shoulders; the corset is confined to the torso. Leave an opaque dark underskirt in the central skirt slit. Body collar top stays at original y294, shoulders near x397/632,y382, elbows near x307/724,y571, wrists near x202/811,y705, fingertips near y835. Hem retains original x40..985,y1450. Keep hands and sleeves exactly in their original downward/outward neutral pose. No aura, background, floor shadows, glow, labels, extra pieces or body parts. The empty head area and entire space outside this continuous clothed body and connected arms are transparent. Output a single unbroken body painting suitable for a shared weighted mesh across shoulders; no head and no boots.

### Clean head

Use case: background-extraction / registered rig-layer repair. Edit the supplied full witch setup image. Keep the EXACT 1024x1536 original canvas and head/hair position and scale. Retain ONLY the identical head, face, hat, ears/earrings, red curls and a very short natural neck down to the original collar line at y294. Keep all original curls including their lower tips at y550, head/hat original x~310..700,y~0..305. Remove the entire body, ALL shoulders and shoulder skin, ALL sleeves and arms and hands, gold sleeve bands, corset, collar/choker and dress and boots, making those areas ZERO alpha. No fragment of shoulder, skin below the neck, costume, gold collar or sleeves may remain attached to the hair, especially at the lower left/right hair tips. Complete small occluded hair curls naturally where needed. This is a CLEAN HEAD AND HAIR source layer, not a bust portrait: no shoulders, chest, clothes, garment, cloak or floating sleeves. Preserve the mature face identity, exact expression, hat shape and burgundy curl silhouette of the reference. Do not recenter, enlarge, crop or rescale the retained head/hair; keep the lower two-thirds of the canvas entirely transparent. No background, glow, haze, floor shadow, text, labels, extra objects or new accessories. True transparent alpha around every hair curl.

## Mesh repair

The source alpha is traced into adaptive clipped triangles with edge/interior sampling. A coarse rectangular grid alone was rejected: it bridged the narrow underarm gap and pulled waist pixels into the moving sleeve. The source gap now separates arm and torso geometry. The arm/torso weight separator follows that gap; regression probes keep the sleeve edge on arm controls and skirt edge on torso controls. Shoulder caps stay on the chest, blending distally into the arm. Two intermediate elbow controls support sleeve volume. These are geometry/weight operations, not raster painting.
