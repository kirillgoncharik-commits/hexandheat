---
id: DOC-15
version: 1.0.0-rc1
date: 2026-10-18
status: AUDITED_FOR_GATE_REVIEW
dependencies: [DOC-03, DOC-04, DOC-05]
related: [DONOR_REPOSITORIES, TECH_STACK_DECISIONS, DEPENDENCY_MAP, RISK_REGISTER]
confidence: HIGH_FOR_OBSERVED_SOURCE_MEDIUM_FOR_INTEGRATION
---

# Donor Repository Audit

## Executive result

The official Math SDK remains the authoritative outcome generator and the official Web SDK remains the shortest frontend path, but the two audited scatter samples are **not mutually consistent at their current HEADs**. Directly running them as a matched pair is rejected until the following blocking defects are closed:

- Math config RTP is `0.967` (96.7%); Web config shows `0.97` (97.0%), a visible difference of **0.3 percentage points**.
- Web free-spin reel data differs from Math `FR0.csv` at 12 cells: row indices 83 and 177 on every reel are ordinary symbols in Web but `S` in Math.
- Math can emit `freeSpinRetrigger` and `wincap`; Web `typesBookEvent.ts` and `bookEventHandlerMap.ts` contain neither. The shared dispatcher only logs a missing handler and continues.
- Web `BookEventBoardMultiplierInfo.winInfo` incorrectly uses numeric literal types `400`, `5`, and `2000` even though Math emits dynamic integer values.
- The Web config has no `WCAP` padding reel. Math `WCAP.csv` differs from `FR0.csv` in 34 cells, so forced max-win books require a dedicated rendering test.

These are donor defects/drift, not product decisions. Neither 96.7%, 97.0% nor the product brief’s 96.0% hypothesis is approved Hex & Heat RTP.

## Scope and method

On 2026-10-18 the audit used `git ls-remote` and GitHub/raw/npm primary sources. Each repository was read at the exact SHA listed below; no donor source or dependency was copied into the project repository. Separate clean-room smoke checks cloned and executed the two official SDK samples under a temporary directory; their commands and results are recorded in `reports/OFFICIAL_SDK_SMOKE_2026-10-18.md`. Release recency is evidence of activity, not proof of security or fitness.

Security work here is a static integration review, not a penetration test or complete dependency audit. Prices and hosted-service terms were not purchased or authenticated; those facts are marked **UNVERIFIED**. License absence is reported as observed evidence, not legal advice.

## Pin and maintenance ledger

| Donor | Default branch / exact SHA | Release or manifest version | HEAD date | Maintenance assessment |
|---|---|---|---|---|
| engineio/math-sdk | `main` / [`a6dccd86de740cc5d318079483cb6204cc5c19bc`](https://github.com/engineio/math-sdk/commit/a6dccd86de740cc5d318079483cb6204cc5c19bc) | no tag observed; Python package says `0.0.0` | 2026-09-22 | Active official source; release discipline is SHA-based |
| engineio/web-sdk | `main` / [`1843d60cedb94b390e641b563f32ad64353bec5e`](https://github.com/engineio/web-sdk/commit/1843d60cedb94b390e641b563f32ad64353bec5e) | private monorepo/apps `0.0.0`; `pixi-svelte` 2.1.0 | 2025-11-27 | Official but stale relative to Math; high drift risk |
| engineio/ts-client | `main` / [`df9e126d79b3fe1ef353f4fac9c1699cd79a4d3e`](https://github.com/engineio/ts-client/commit/df9e126d79b3fe1ef353f4fac9c1699cd79a4d3e) | npm/package `stake-engine` 0.1.32, BETA | 2025-10-26 | Stale and small; no observed tests |
| schmooky/pixi-reels | `main` / [`011922dda0c51ece4fbb86668f7251934784f9ae`](https://github.com/schmooky/pixi-reels/commit/011922dda0c51ece4fbb86668f7251934784f9ae) | `pixi-reels@4.1.0` | 2026-10-05 | Active release cadence and CI documentation |
| Stake-Dev-Tool/stake-dev-tool | `main` / [`3d2338a76231e5c7406f27015ea67f6b59cb3aea`](https://github.com/Stake-Dev-Tool/stake-dev-tool/commit/3d2338a76231e5c7406f27015ea67f6b59cb3aea) | tag `sdt-v2.1.0`; latest packaged release `v2.0.0`; workspace 1.2.2; CLI 2.1.0 | 2026-09-15 | Active, but component/release version ambiguity must be recorded |
| ReSkin-Games/stake-engine-skills | `main` / [`b49e401905c99d19d6492e4d6b883a466abf494e`](https://github.com/ReSkin-Games/stake-engine-skills/commit/b49e401905c99d19d6492e4d6b883a466abf494e) | `v0.2.1` | 2026-06-11 | Snapshot project; official sources can move independently |
| pixijs/pixijs-skills | `main` / [`83760c6f53462ca9cecd68055041f5a8c94758ce`](https://github.com/pixijs/pixijs-skills/commit/83760c6f53462ca9cecd68055041f5a8c94758ce) | no tag observed; synced from PixiJS v8.22.0 | 2026-10-01 | Current and official |
| Tonejs/Tone.js | stable [`d2d52ffa8803b35debd9f19f2da08ad1c3540de0`](https://github.com/Tonejs/Tone.js/commit/d2d52ffa8803b35debd9f19f2da08ad1c3540de0); default `dev` [`de9df332ca7573b90a9aaca10c0729a3091dda0a`](https://github.com/Tonejs/Tone.js/commit/de9df332ca7573b90a9aaca10c0729a3091dda0a) | stable npm/release 15.1.22; dev commit labels 15.5.57 | 2026-07-12 stable / 2026-10-04 dev | Mature and active; pin stable, never `dev` |
| ClementRivaille/orchestre-js | `master` / [`e5f812fe4b0e0de4cd038714d5828b35bc8b3add`](https://github.com/ClementRivaille/orchestre-js/commit/e5f812fe4b0e0de4cd038714d5828b35bc8b3add) | npm/release 3.1.0 | 2026-02-07 | Maintained, small ecosystem |
| slot-engine/slot-engine | `main` / [`17ca128bcc7fa4375683476136c136c4c1094011`](https://github.com/slot-engine/slot-engine/commit/17ca128bcc7fa4375683476136c136c4c1094011) | core 0.3.2, panel 0.2.2, optimizer 0.1.0 | 2026-09-27 | Recent, non-official, early versions and unlicensed |

## Official SDK compatibility deep dive

### Math `games/0_0_scatter`

The [current game config](https://github.com/engineio/math-sdk/blob/a6dccd86de740cc5d318079483cb6204cc5c19bc/games/0_0_scatter/game_config.py) is a useful mechanical donor:

- 6 reels × 5 active rows, pay-anywhere from 8 matching symbols and tumbles;
- `W`, `S`, `M` special symbols, max win 5,000×, base cost 1 and bonus-buy cost 200;
- precomputed books, lookup tables, mode configuration and integer-cent book events;
- free-spin global multiplier events and an end-of-spin board multiplier.

It is not Hex & Heat logic. In the sample, the global multiplier is incremented on each free-spin tumble; `M` values are summed and multiply cumulative spin win after tumbles. The base game does not implement the proposed per-bet cauldron progression. The sample also has internal documentation drift: its README says two special symbols although config defines three, and says the global multiplier persists through the free game while `update_freespin()` sets it back to `1` for every free spin. A new game package must express the approved bet-scope rules explicitly and an independent verifier must recompute every payout.

Dependencies observed in [`requirements.txt`](https://github.com/engineio/math-sdk/blob/a6dccd86de740cc5d318079483cb6204cc5c19bc/requirements.txt): Python ≥3.12, NumPy, pytest, zstandard, XlsxWriter, matplotlib, boto3/botocore and an editable Git dependency pinned to an older `StakeEngine/math-sdk` SHA. Rust/Cargo is needed for the optional optimizer. Before adoption: remove/resolve the self-referential Git install ambiguity, create a hashed lock/constraints file, isolate S3 credentials and pin the Rust toolchain/container.

### RTP and client-config comparison

Compared sources: Math [`game_config.py`](https://github.com/engineio/math-sdk/blob/a6dccd86de740cc5d318079483cb6204cc5c19bc/games/0_0_scatter/game_config.py) plus `BR0.csv`/`FR0.csv`/`WCAP.csv`, and Web [`apps/scatter/src/game/config.ts`](https://github.com/engineio/web-sdk/blob/1843d60cedb94b390e641b563f32ad64353bec5e/apps/scatter/src/game/config.ts).

| Field | Math SDK `game_config.py` | Web SDK `config.ts` | Result |
|---|---:|---:|---|
| game ID/name | `0_0_scatter` / `sample_scatter` | same | Match |
| dimensions | 6 × `[5,5,5,5,5,5]` | same | Match |
| configured RTP | `0.967` | `0.97` | **Mismatch: +0.003 / +0.3 percentage points in Web** |
| base mode | cost 1, RTP 0.967, max 5,000 | cost 1, RTP 0.97, max 5,000 | RTP mismatch |
| bonus mode | cost 200, RTP 0.967, max 5,000 | cost 200, RTP 0.97, max 5,000 | RTP mismatch |
| paytable and special tags | source ranges converted by Math | expanded client values | Reviewed values match |
| base padding reels | Math `BR0.csv`, 6 × 251 | embedded, 6 × 251 | Symbol-for-symbol comparison: exact match |
| free padding reels | Math `FR0.csv`, 6 × 251 | embedded, 6 × 251 | **12 mismatches** |
| win-cap reel | Math `WCAP.csv`, 6 × 251 | no separate client strip | **Missing mode; 34 cells differ from FR0** |
| triggers/distributions | owned by Math config | absent | Correct boundary, but frontend must not infer them |

The 12 `FR0` differences are exact:

| Zero-based strip position | Web reels 0–5 | Math reels 0–5 |
|---:|---|---|
| 83 | `[H2, H4, L1, H2, L3, H2]` | `[S, S, S, S, S, S]` |
| 177 | `[H4, H2, L1, L2, L1, L2]` | `[S, S, S, S, S, S]` |

This aligns with the missing retrigger event contract and is evidence that the Web sample is older than the Math sample, not evidence that either reel set is approved.

Required fix: create a generated, versioned client manifest from the approved math package containing display RTP, modes, dimensions, max win, paytable and padding strips. CI fails if the Web constants differ from that manifest. The accepted math report, not a TypeScript literal, owns RTP.

### Book-event contract comparison

Sources: Math [standard events](https://github.com/engineio/math-sdk/blob/a6dccd86de740cc5d318079483cb6204cc5c19bc/src/events/events.py), [scatter custom event](https://github.com/engineio/math-sdk/blob/a6dccd86de740cc5d318079483cb6204cc5c19bc/games/0_0_scatter/game_events.py) and [scatter execution](https://github.com/engineio/math-sdk/blob/a6dccd86de740cc5d318079483cb6204cc5c19bc/games/0_0_scatter/game_executables.py); Web [typesBookEvent.ts](https://github.com/engineio/web-sdk/blob/1843d60cedb94b390e641b563f32ad64353bec5e/apps/scatter/src/game/typesBookEvent.ts), [bookEventHandlerMap.ts](https://github.com/engineio/web-sdk/blob/1843d60cedb94b390e641b563f32ad64353bec5e/apps/scatter/src/game/bookEventHandlerMap.ts) and [dispatcher](https://github.com/engineio/web-sdk/blob/1843d60cedb94b390e641b563f32ad64353bec5e/packages/utils-book/src/createPlayBookUtils.ts).

| Math scatter can emit | Web union | Web handler | Audit result |
|---|---|---|---|
| `reveal` | yes | yes | Compatible shape: board, padding positions, anticipation, game type |
| `winInfo` | yes | yes | Compatible with presentation assumptions; validate all `meta` fields at runtime |
| `updateTumbleWin` | yes | yes | Compatible |
| `tumbleBoard` | yes | yes | Compatible; row offset depends on Math `include_padding` |
| `setWin` | yes | yes | Compatible |
| `setTotalWin` | yes | yes | Compatible |
| `freeSpinTrigger` | yes | yes | Compatible |
| `freeSpinRetrigger` | **no** | **no** | **Blocking:** Math emits on retrigger; frontend logs and skips it |
| `updateFreeSpin` | yes | yes | Compatible |
| `updateGlobalMult` | yes | yes | Compatible but sample semantics must be replaced for Hex & Heat |
| `freeSpinEnd` | yes | yes | Compatible |
| `boardMultiplierInfo` | yes | yes | **Type defect:** Web declares `tumbleWin: 400`, `boardMult: 5`, `totalWin: 2000`; Math sends arbitrary integers |
| `wincap` | **no** | **no** | **Blocking:** base execution emits it when running bet win reaches cap |
| `finalWin` | yes | yes | Handler only hides presentation elements; final balance/payout still comes from RGS |
| `createBonusSnapshot` | Web-only custom event | yes | Resume helper; its union member is duplicated in `typesBookEvent.ts` |

The generic dispatcher types the map as `Record<string, ...>`, so TypeScript does not prove exhaustiveness. At runtime an unknown event is written to `console.error` and playback continues. For outcome-driven presentation this is unsafe: a new math event can be silently omitted from replay or state restoration while the round appears to finish.

Contract remediation before the frontend baseline is accepted:

1. Generate or hand-author one versioned discriminated event schema from audited math fixtures; validate every book at the RGS boundary.
2. Make the handler map exhaustive (`satisfies Record<BookEvent['type'], Handler>`) and make unknown events fail tests and development playback.
3. Add deterministic `freeSpinRetrigger` and `wincap` handlers; use numeric fields for multiplier event values; remove the duplicate union member.
4. Golden-test current base, bonus, retrigger, win-cap, resume, normal, fast and replay books. Assert final board, total win, multiplier, free-spin count and emitted cue order.
5. Pin the two SDK SHAs as a tested pair. Any upstream change runs config diff, schema diff and golden books before merge.

### Web SDK dependency and security gate

The Web app is a full monorepo, not a small package. Observed baseline: Node 22.16, pnpm 10.5, Svelte 5.20.5, SvelteKit 2.17.3, PixiJS 8.8.1, Spine 4.2.74, Vite 6.2.0, XState 5.19.2, Howler 2.2.4 and Lodash 4.17.16. Keep only packages reached by the scatter build; do not ship Storybook/test assets or the sample’s media.

Lodash 4.17.16 is currently within affected ranges for upstream-reviewed [prototype-pollution](https://github.com/lodash/lodash/security/advisories/GHSA-f23m-r3pf-42rh) and [code-injection](https://github.com/lodash/lodash/security/advisories/GHSA-r5fr-rjxr-66jc) advisories fixed in 4.18.0. This is a hard upgrade/SCA gate. Vite and SvelteKit have also published later advisories; lockfile SCA must determine exact affected paths after the required framework upgrade rather than assuming sample pins are safe.

The repository has no detected top-level license file. Although package manifests assert MIT and the README allows forks/selected parts, obtain explicit Stake/upstream confirmation for commercial code reuse and exclude all bundled art, fonts, audio and Spine data unless separate provenance is produced.

### `ts-client` boundary

The beta client provides authenticate/play/end-round/event calls and amount/currency helpers with no declared runtime dependencies. It should not coexist with Web SDK `rgs-requests`/XState because both track balance and active-round state.

If used in a future custom frontend, first add a strict allowlist for the `rgs_url` launch parameter, request timeouts/AbortController, response schemas, teardown for the minute balance timer, redacted diagnostics and retry/idempotency tests. The session ID comes from the launch URL and must never enter logs or analytics. License evidence is incomplete: `package.json` says ISC but the repository has no license text.

## Additional donor findings

### `pixi-reels` — REFERENCE

Useful modules: `ReelSetBuilder`, deterministic target landing, cascade/pin/spotlight primitives, speed profiles, skip/slam semantics, typed events, debug telemetry and the headless test harness. The architecture correctly leaves RNG, paytable math and audio to the consumer.

It is not drop-in compatible: release 4.1.0 peers on PixiJS `^8.18.1`, GSAP `^3.15.0`, optional Spine `~4.2.110` and optional `pixi-silk`; Web SDK pins PixiJS 8.8.1 and Spine 4.2.74. Adding it also creates a second reel/cascade lifecycle alongside official scatter components. Retain its MIT notice when deriving patterns; optional Spine requires its own paid editor license. Reconsider only if an official-board POC fails measurable skip, cascade or performance criteria.

### Stake Dev Tool — ADOPT development-only

Useful modules: Rust local gaming server consuming `index.json`/lookup/zstd books, forced outcomes, replay/bookmarks, multi-resolution sessions, immutable math revisions and CLI diffs. This materially improves deterministic QA without entering the shipped game.

Adopt only the MIT desktop/LGS/CLI surfaces from a checksum-pinned release in an isolated local profile. Do not assume the HEAD tag and downloadable release are identical: the audit observed `sdt-v2.1.0` at HEAD but GitHub’s latest packaged release was `v2.0.0`, while root/CLI manifests report different component versions. Record binary SHA-256 and component version in test evidence.

The server/web zones are AGPL-3.0-only. A modified hosted deployment must meet AGPL network-source obligations. Cloud hosting sends proprietary math/front bundles and uses account tokens; it is outside pilot authority. Self-hosting additionally requires Docker, Postgres, Caddy, object storage, TLS, backup and patch ownership. Review local-CA installation, token storage, bind address and static-file isolation before use.

### ReSkin Stake Engine skills — REFERENCE

Useful only as a navigation/checklist aid. The skills distill upstream SDK docs and include bootstrap scripts, but official repositories and approved project documents override them. `install.sh` replaces existing `~/.claude/skills` directories, and the optional MCP installer clones/pulls a floating docs branch, installs Node packages and registers a user-scope server. Do not execute either installer in project CI or an agent image; curate readable excerpts and pin every upstream separately.

### Official PixiJS skills — ADAPT documentation

The video-texture, asset-manifest, performance, cleanup, accessibility and mobile guidance is valuable for POC-B. The audited skill snapshot was synced from PixiJS 8.22.0, while Web SDK uses 8.8.1. Validate every suggested API against the pinned runtime; several garbage-collection/performance options are explicitly newer than 8.8.1. These skills add no runtime dependency and their MIT text can be retained with any adapted internal notes.

### Tone.js — ADAPT behind an audio adapter

Stable 15.1.22 supplies Transport scheduling, players, gain automation and a Web Audio compatibility layer, with runtime dependencies `standardized-audio-context` and `tslib`. It is MIT and actively maintained.

Use it only in POC-C behind `MusicClock`/`StemMixer`; pass or deliberately own a single AudioContext. The official Web SDK already uses Howler, so two independently created contexts can diverge on user-gesture unlock, suspend/resume, interruption, mute and teardown. Acceptance requires sample-aligned four-stem switching, iOS/Android background-resume tests, 15-minute stress playback, memory/bundle measurements and deterministic degradation to silence. Direct Web Audio remains the lower-dependency control.

### Orchestre-JS — REJECT production dependency

Version 3.1.0 is a concise zero-runtime-dependency reference for vertical layering, absolute/relative loops, beat listeners and fades, and it can accept a shared AudioContext. Its README also states that scheduled actions cannot be cancelled, which conflicts with replay abort, fast-play and hard interruption needs. No license file was found; only the npm/package ISC assertion exists. Tone/direct Web Audio has stronger evidence and avoids a third scheduler.

### Slot Engine — REFERENCE only

The non-official project offers TypeScript `core` simulation, optimizer and a React/Hono panel; the LGS is private/“soon”. It requires Node ≥23.8 and pnpm 11.22, diverging from the official frontend baseline, and core brings optimizer, esbuild, yargs, chalk and Socket.IO client at runtime. Most importantly, no repository license or npm `license` field was observed. Do not install, copy code or port algorithms. It may be used only to identify test/reporting ideas until an explicit license is published and Legal/Technical Review approve it.

## Integration sequence and cost

Estimates are engineering effort, not calendar commitments or vendor prices.

| Order | Work | Estimate | Exit evidence |
|---|---|---:|---|
| 1 | Pin Math SDK, resolve dependency install, generate untouched scatter outputs | 2–4 days | SHA/toolchain manifest, successful format checks, book checksums |
| 2 | Build independent book/event verifier and approved client manifest generator | 3–5 days | independent payout totals; RTP/config equality assertion |
| 3 | Trim/fork Web scatter; repair schema, handlers and vulnerable dependencies | 4–7 days | typecheck/build/SCA; all golden events handled exactly once |
| 4 | Local Stake Dev Tool smoke and replay matrix | 1–2 days | binary checksum, forced base/bonus/retrigger/wincap replays |
| 5 | Tone vs direct-Web-Audio POC-C | 2–4 days | device logs, timing/memory/bundle report and keep/remove decision |
| 6 | Optional official-board vs pixi-reels POC only if blocked | 3–6 days | measured reason to accept a second reel engine and renderer upgrade |

No reviewed repository demanded a source-license fee in the evidence inspected, but that is neither a grant of rights nor a zero-cost guarantee: unlicensed/unclear donors remain unusable, and labor, CI/compute, optional device/cloud service and any Spine Editor cost remain budget items. Hosted Stake Dev Tool pricing and commercial support are **UNVERIFIED** and require a fresh procurement snapshot.

## Approval gates

### Donor gate — pass only when

- exact SHAs/package integrities and notices are committed to the dependency manifest;
- Web SDK commercial reuse and sample-asset exclusion are confirmed in writing;
- no critical/high reachable advisory remains, and exceptions have Security Reviewer approval;
- generated client config equals the accepted math manifest, including RTP and reel hashes;
- every emitted event has a validated type and exhaustive deterministic handler;
- base, bonus, retrigger, forced win-cap, interrupted, resume, fast and replay fixtures converge;
- local QA tooling is absent from the production bundle and no proprietary book was uploaded externally.

### GO / PIVOT / KILL

- **GO:** Math/Web contract tests pass, license evidence is complete and the official scatter baseline meets mobile/replay requirements.
- **PIVOT:** keep Math SDK/RGS contract but replace official presentation components only if a measured POC demonstrates a blocker; pixi-reels may then be reconsidered on a separate renderer-upgrade issue.
- **KILL the donor path:** unresolved code/media rights, non-reproducible math, unhandled outcome events, or a dependency vulnerability that cannot be removed without breaking platform compliance.

## Residual uncertainty

- Web SDK and ts-client commercial licensing is not fully evidenced because no license text was observed; package metadata/README statements are not a substitute for human legal approval.
- No Stake Studio submission or current approval test was executed in this audit.
- Security findings are not a complete SBOM/SCA result; transitive reachability remains to be measured after lockfile resolution.
- Hosted-service prices, SLAs, data-processing terms and commercial-support terms were not verified.
- Donor branches can move after 2026-10-18; only the listed SHAs support this report.
