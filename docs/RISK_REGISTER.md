# Risk Register

Version 0.9.0 · 2026-10-18 · Owner: Product Owner / Technical Reviewer.

Scale: probability/impact L/M/H. Residual is reassessed after mitigation.

| ID | Risk | P/I | Prevention / trigger | Contingency | Owner |
|---|---|---|---|---|---|
| R01 | character identity/pose drift | H/H | canonical sheet, anchor pose, 2 iteration cap | spritesheet/human cleanup | Art/Animation |
| R02 | mobile video decode/memory | H/H | dual codec, low tier, real-device soak | atlas/static character | Frontend |
| R03 | visible clip transition seam | H/H | A-pose, markers, double buffer, blinded score | fewer longer loops/atlas | Animation |
| R04 | music layers not truly phase-aligned | M/H | sample inspection/null/15-min loop | human composer/conventional track | Audio |
| R05 | autoplay/audio suspension | H/M | gesture unlock, resume/mute tests | silent graceful play | Frontend |
| R06 | math/payout defect | M/H | exact integers, properties, independent verifier | block G3/rebuild books | Math Reviewer |
| R07 | frontend presentation diverges in fast/replay | M/H | shared event timeline + convergence tests | disable fast until fixed | Integration |
| R08 | sexualized content rejected | M/H | adult bible + human content gate | costume/pose redesign | PO/Art |
| R09 | AI output rights unclear | M/H | terms snapshot/provenance; no artist imitation | discard/commission human | PO/Legal |
| R10 | generic AI quality lowers ranking | H/H | paintover, cohesive bible, reject sample assets | reduce asset count, hire specialist | Art Director |
| R11 | bundle/load too large | H/H | budgets, tiered preload, asset CI | lower resolution/atlas/defer | Frontend |
| R12 | SDK/docs change | M/M | pinned SHA, official source review | controlled upgrade PR | Integration |
| R13 | heavy masters lost pre-storage | M/H | checksums, two encrypted local copies | approve storage early | PO |
| R14 | pilot exceeds cost/time | M/M | stop-loss and daily evidence | PIVOT/KILL | Producer |
| R15 | platform/account-only rule missed | M/H | ACP checklist/support before G5 | rescope before submission | Compliance |
| R16 | security via untrusted RGS/localization | L/H | schema, allowlist, CSP, no innerHTML | fail closed, patch before release | Security |
