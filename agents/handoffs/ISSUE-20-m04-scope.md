# Issue #20 — M04 synchronization scope handoff

Date: 2026-11-01. Status: documentation prepared; implementation not started.

## Inputs and baseline

- User requested a researched next-milestone scope emphasizing synchronization of board animations, windows and witch dance.
- Static audit: M03 commit `b7b88761c64439b09c45d4bbbe9720543681f52f`, PR #21; still unmerged at preparation time.
- This documentation branch starts from main `252280b6d7897777d33aba1d8a3a255d84777fce` and does not silently import the runtime stack.
- Existing Issue #20 remains the parent release-candidate backlog; M04.1 is a new first acceptance gate, not a claim that the other packages are complete.

## Changed files and outputs

README links plus docs/m04/MILESTONE_SCOPE_RU.md, SYNCHRONIZATION_DESIGN_RU.md, RESEARCH_PRIMARY_SOURCES_RU.md and WORK_TASK_M04_1_RU.md. Research links official documentation and SDK source pinned to `1843d60cedb94b390e641b563f32ad64353bec5e`.

## Validation and evidence

Documentation-only verification: `git diff --check` and a local Markdown link/structure check across the added package. Runtime tests, device measurements, new Figma edits and animation assets are not part of this change and have not been claimed as completed. The bootstrap main does not contain the stack's runtime test harness.

## Assumptions, risks and licensing

- Full 4000ms body loops, including IDLE, retain M03 priority over old video/variable-duration proposals.
- Immediate whole-body reactions cannot be promised under that rule. Cross-round dance carryover is a UX risk with an explicit review gate.
- 120 BPM, timing tokens, latency/skew targets and effort estimates are proposals to validate during the first spike, not Stake requirements or observed performance.
- Native timeline adapter is the proposed minimal implementation; no new dependency or license is introduced here. Spine remains optional and separately constrained by runtime/editor compatibility and existing purchase gates.
- No generated media, math, payout, wallet implementation or licensing/commercial decision changed.

## Exact next action

Review scope and existing implementation stack; when the implementation baseline is accepted, start WORK_TASK_M04_1_RU.md / SYNC-01 on an issue-linked branch. First evidence must be the synchronized win/Potion/cascade scene with trace, pause/resume and completion/cancellation checks. Keep Issue #20 open until its remaining release packages are accepted.
