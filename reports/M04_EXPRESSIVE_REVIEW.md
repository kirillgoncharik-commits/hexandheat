# Expressive dance review

2026-11-01. PO requested stronger choreography. Figma returned403; reference analysis used saved M03 frames, not the inaccessible live prototype.

Implemented five distinct authored gesture phrases,17 bones/16 original parts, separate wrists and two skirt panels. Foot targets solve leg contact; free-foot lift is authored. Shared4s cycle/30FPS target retained. Original v2 preserved for A/B, with identical padded camera dimensions in the art review. New runtime has896×1152 backing and modest presentation scale; current body/cue ownership policy unchanged.

Validation: repository policy and67 tests pass (3 repository,14 math/replay,50 JS). New tests check600 distinct poses, shared seam/C1 velocity, all foot targets and actual lift, stronger hip travel/asymmetric wrists/skirt, and candidate Spine keys. Previous v2 tests still run. See M04_EXPRESSIVE_VERIFICATION.txt. An initial new amplitude check exposed insufficient hip travel; authored BIG hip movement was expanded, without lowering its test threshold.

Browser Chrome cloud: before/after both at frame41 /1.37s,896×1152 camera; pause/scrub stable, reduced motion yielded frame0. Full-page screenshot M04_EXPRESSIVE_AB.jpg records complete figures and saved reference poses. Main game decoded expressive-rig-30fps, completed a mock round from100 to107 with8.00 win and enabled next Spin. No real money/production claim. Real mobile/AV/input/FPS metrics, all25 transitions by eye and human art approval remain open.

Export:600 transparent WebP frames,120/state,4s at30FPS,896×1152. Updated archive HexHeat_Witch_Expressive_30FPS_896x1152.zip is66,166,324 bytes. Canonical archive was replaced preserving its Library identity; local metadata writeback succeeded. Export also contains original Spine4.2 Import Data candidate and16 textures/atlas. No native editor import or licensed Spine runtime integration performed.

Known limits:2D rigid regions; no3D turn, facial/eye/finger animation or full cloth mesh. Sleeve joints and fabric intersections need human motion/art review. The new costume uses separately painted hips and draped side panels; it is a new cutout rendition, not a pixel-identical paintover of M03. Mathematical contact targets do not by themselves prove anatomical quality or perfect sole contact in painted boots.

Next: PO compares all5 states at actual game size on /dance.html and /motion.html, then chooses targeted joint/cloth/face refinements. Do not equate test pass with final artistic acceptance or Stake readiness.
