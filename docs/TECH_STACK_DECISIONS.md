# Technology Stack Decisions

Version 0.9.0 · 2026-10-18 · Status: proposed · Depends on DOC-04/05 · Volatile versions, prices and licenses must be rechecked at use.

## Selection matrix

| Block | Primary (observed baseline) | Reserve | Compatibility / AI use | Cost & license | Decision |
|---|---|---|---|---|---|
| Game frontend | Official [Web SDK](https://github.com/engineio/web-sdk), pin SHA; repo documents Node 22.16, pnpm 10.5, Svelte 5, PixiJS 8, Vite/Turborepo | PixiJS 8 + TS/Vite | Native Stake samples/events; agents can scaffold/test | MIT shown in repo; hosting per Engine | Primary; lowest integration risk |
| Math | Official [Math SDK](https://github.com/engineio/math-sdk), Python ≥3.12, pin SHA | compatible custom Python generator | Produces books/weights/config; agent-friendly tests | MIT repo; compute cost only | Primary; independent verifier mandatory |
| AI coding | Codex/ChatGPT Work + GitHub Issues/PR/Actions | another repo-aware coding agent | strong structured handoff/review | account terms; no assumed unit price | use provider-neutral agent contracts |
| Art | Adobe Firefly current approved model | rights-cleared reference-capable image model | reference sheets + human paintover | subscription/credits; commercial claims require terms evidence | rights-safety first, quality POC |
| AI video | Runway API current suitable image-to-video model | Luma Dream Machine API; Firefly video | API automation, reference motion; consistency unproven | Runway public API credits; provider commercial terms saved | POC only, stop-loss |
| Video edit | FFmpeg/ffprobe pinned container | professional NLE for manual cleanup | deterministic transcode/probe; scriptable | open source; verify codec build licenses | Primary |
| Video runtime | Native video, VP9 WebM + H.264 MP4, opaque plate | WebP/AVIF atlas | static HTML5/mobile; agent-measurable | browser-native | alpha video rejected as baseline |
| Audio generation | Eleven Music paid plan if current rights + stem export pass | human composer | advertised stems; agent can inspect samples | paid; free output may lack commercial license | POC, terms snapshot required |
| Audio runtime | Web Audio + official SDK sound utilities | Howler.js adapter | precise scheduling/mobile unlock | browser-native / Howler MIT | Primary; test Safari interruptions |
| UI/UX | code-first Storybook + responsive prototypes | Figma only if presentation-native collaboration is needed | lives with source and tests | open-source tooling; Figma optional | GitHub-first |
| FX | PixiJS particles/shaders | baked media | shares renderer/timeline | included in frontend | Primary |
| Testing | pytest, Storybook, Vitest, Playwright, real devices | device cloud | fully automatable except perception | OSS + optional device fee | Primary |
| Automation | GitHub Actions + pinned actions, Python validation | local runner | PR policy/evidence | GitHub plan limits apply | Primary |
| Heavy assets | versioned S3-compatible object storage + SHA manifest | another approved object store | CI fetch by immutable digest | provider-dependent | choose at G2; no Git LFS default |

## Why not Phaser

Phaser is capable, but the official Web SDK already supplies Pixi/Svelte components, RGS helpers, event flow, Storybook and examples. Adding Phaser creates a second scene/input/lifecycle abstraction without a proven requirement. Reconsider only if POC shows the SDK renderer blocks core video composition.

## Why not Howler as primary

Howler simplifies playback but adaptive sample-aligned stems need direct AudioContext scheduling and gain automation. Use official utilities/direct Web Audio, with Howler only as a compatibility wrapper if the POC proves value.

## Version policy

“Latest” is forbidden in reproducible builds. Pilot records upstream repository SHA, lockfile and container digest. Dependency updates arrive in their own PR with build, replay and media regression evidence. Official SDK pin is reviewed monthly during active development and frozen for submission candidate.

## Procurement checklist

Before a paid generation: exact model/version, price unit, plan, commercial output rights, input rights, training/data retention, prohibited content, attribution, termination effect and indemnity are recorded in the asset entry. Marketing copy is not a legal conclusion; ambiguous terms go to human review.
