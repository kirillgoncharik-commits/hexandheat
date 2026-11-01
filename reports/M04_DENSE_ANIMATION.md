# M04 dense raster / cutout rig

2026-11-01. Issue #20. Base: M04.1 `ba7d1e6370c0b7c331e6f55869d353c4c3953799`. PO clarified the requested rate is 25–30 **FPS**, not 25–30 frames per clip. Selected 30 FPS, retaining 4000ms cycles.

Delivered: five original choreography curves, eight separate RGBA textures, shared 30-FPS character player, 600 exported transparent WebP frames at 768×1024, sequence manifest, Spine 4.2 JSON/atlas/PNG import candidate and documentation. The character uses hierarchical limb transforms, not whole-image sliding or duplicated four-frame holds. All five states share the same neutral pose; the foot anchor is invariant.

`python3 tools/verify_milestone.py`: **61 tests pass** (3 repository/asset, 14 math/replay, 44 JavaScript). New tests cover 120 mathematical samples per state, five different mid-cycle poses, all shared seams, fixed foot anchor and Spine bone/slot references plus monotonic 121-key closed timelines.

Browser smoke confirms `renderer=cutout-rig-30fps`, canvas backing 768×1024 and frame index within 0–119. Target FPS is exposed separately from measured hardware performance. The managed iframe is throttled; it is not a 30-FPS device certification. The tile image bounds were tightened after iframe smoke exposed intrinsic-image overflow at smaller heights.

Original parts were generated with the built-in image tool from the existing original witch reference. The irregular kit layout was split by connected-component extraction after PNG encoding normalization. Prompt and tool limitations are in assets/prompts/M04_RIG_PROMPT.md. Generated textures are registered with hashes in manifest v4 (42 total assets); heavier frame sequences are kept outside Git.

Archive: `HexHeat_Witch_30FPS_768x1024.zip`, 50,434,959 bytes /48.1MiB, saved as a persistent artifact. It includes all 600 frames and the Spine candidate. Runtime loads eight textures instead of the whole archive. No official Spine Runtime or paid dependency was integrated.

Limits: first cutout animation pass; joint/garment overlap and secondary motion need art review. Skirt and legs are one region, facial expression is static, no meshes/IK/weighted deformation. The JSON is not an editor-generated .spine project and has not been imported into a licensed editor. Native editor/runtime compatibility, real-device FPS/AV and all visual transition acceptance remain open.

The main scene's shared transport, full-cycle state protection, reduced-motion policy and financial boundaries remain in use. No math, payout, session, wallet or Stake release behavior changed. This is a reviewable animation improvement inside M04, not closure of the milestone.
