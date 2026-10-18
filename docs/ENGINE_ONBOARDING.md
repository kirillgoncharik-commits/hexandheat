# Engine Studio onboarding

Status: `AWAITING USER`
Checked: 2026-10-18
Project: *Hex & Heat: Witch's Wild Mixer*
Scope: developer/provider account only; no Stake player account

> This is an engineering and commercial due-diligence record, not legal or tax advice. Registration, contract acceptance, KYC, wallet setup, commercial selection, upload and submission all remain gated by the Product Owner.

## Executive status

| Item | Status | Evidence / next gate |
|---|---|---|
| Official entry point | VERIFIED | `https://engine.io/` links to `https://studio.engine.io/` for creators. |
| Studio sign-in | VERIFIED | `https://studio.engine.io/signin`; Google, GitHub and Discord OAuth are offered. |
| Existing account | UNKNOWN | No active Studio session was present in the browser. OAuth is required to determine whether the GitHub identity already maps to an account. Do not create a duplicate. |
| Contract accepted | NO | Both Privacy Policy and Game Licence checkboxes remain unchecked. |
| Developer account | NOT CONFIRMED | Registration has not been completed in the interface. |
| Team/provider | NOT CREATED | No name, slug, logo, entity or payment model has been committed. |
| Dashboard access | NOT CONFIRMED | Public Studio and sign-in are accessible; authenticated dashboard has not been reached. |
| Developer environment | PUBLIC DOCS VERIFIED | Local SDK/RGS/replay requirements are documented below. Account-only upload and preview UI remains to be inspected after login. |
| Wallet | NOT CONFIGURED | No wallet was created, entered or transmitted. |
| Game project/upload/submission | NOT CREATED / NOT UPLOADED | The phase gate and the work task prohibit prototype upload and commercial submission. |

Official Studio base URL: `https://studio.engine.io/`
Official sign-in URL: `https://studio.engine.io/signin`

The legacy `https://stake-engine.com/` documentation host is still serving current documentation pages, but `engine.io` and `studio.engine.io` are the current public entry points. Do not enter credentials on lookalike domains.

## Registration eligibility

### What Engine publicly confirms

- The contracting developer may be an **individual or an incorporated entity** that completes Engine's online registration and identity-verification process.
- Engine's Privacy Policy says registration data includes name, email, GitHub repository link, intended use, confirmation of age 18+, and confirmation that the applicant is either an individual developer or an authorised company representative.
- The person accepting the agreement warrants that they are the sole owner of the developer team/entity or are authorised to bind it and grant the required rights.
- Engine may request identity documents, company/authority evidence and information verifying the location of the nominated cryptocurrency wallet. Failure or an adverse legal/reputational assessment can cause immediate termination.
- No public platform-wide nationality/residency exclusion list was found in the registration terms reviewed on 2026-10-18. A separate 2026 giveaway has excluded territories, but its eligibility rules must **not** be treated as the developer-platform policy.

### Individual registration

Public materials allow it, subject to age, identity verification, applicable law, tax treatment and wallet verification. Before accepting as an individual resident in Serbia, obtain Serbian advice on:

1. the classification of licence-fee/royalty income from a foreign payer;
2. self-assessment, social contributions, VAT/place-of-supply and foreign-exchange reporting;
3. receipt, custody and conversion of USDT/USDC;
4. whether the activity requires entrepreneur registration or another business form; and
5. whether gambling-software licensing creates any additional local permission or reporting duty.

The Serbian Tax Administration's freelancer guidance confirms that foreign-payer income can remain reportable even when received outside a Serbian bank account, but that guidance does not settle whether these Engine licence fees are correctly treated as freelance income.

### Registration through a Serbian company

Public materials also allow an incorporated entity, but the existence of a registered company is not enough on its own. Before using it, verify:

1. exact legal name, registration number, registered activity, beneficial owner and authorised representative;
2. authority to grant the broad IP licence and accept English-law jurisdiction;
3. whether producing and licensing casino-game software is permitted under the company's objects and Serbian gambling law;
4. corporate income tax, VAT/place-of-supply, withholding, invoicing and accounting treatment;
5. digital-asset accounting and the Serbian National Bank reporting rule described below;
6. whether the company's insurance satisfies clause 17.16; and
7. whether the company can lawfully receive and hold an ERC-20 stablecoin at the nominated wallet.

The current Serbian Law on Games of Chance (Official Gazette 18/2020 and 94/2024) principally licenses **organisers** of games of chance. The reviewed text does not create a clearly named, general registration class for an independent foreign-facing game developer. That is not a safe basis for declaring the activity unlicensed: the law also prohibits enabling electronic gambling for an entity lacking the required Serbian approval, and the Engine agreement makes the developer warrant that it has every licence, consent and permit it needs. A Serbian gaming lawyer should confirm whether a developer that builds in Serbia but licenses to Engine/MRNV abroad is outside organiser/supplier licensing, especially if Serbian players, local hosting or local promotion may be involved.

The National Bank of Serbia states that Serbian legal entities and entrepreneurs that acquire virtual currency without using an NBS-licensed virtual-currency service provider must report to the Records of Virtual Currency Holders. Because Engine pays USDT or USDC, this must be checked before a company wallet is configured.

### Registration decision

No account type can yet be approved from the evidence available. Recommended sequence:

1. obtain written Engine answers to the questions below;
2. obtain a short Serbian gaming/tax/accounting opinion for both individual and company routes;
3. compare liability, tax, crypto-accounting and authority-to-license consequences;
4. choose and record the contracting party; then
5. accept the agreement and complete OAuth/KYC with that party consistently.

Do not register as an individual merely to gain access and later assume the contract can be moved to a company. Public documentation does not confirm that a team or agreement can be transferred between contracting parties.

## Contract summary and material risks

Current public Game Licence Terms: published 2026-07-30 at `https://studio.engine.io/docs/terms`.

### Parties and governing law

- Licensor/operator-side party: **Medium Rare N.V.**, Curaçao company number 145353 (`MRNV`).
- Developer: the verified individual or incorporated entity completing registration.
- Privacy controller: **Carrot Gaming Pty Ltd** in Australia; this is a different entity from the licence counterparty.
- Governing law: English law; exclusive courts of England and Wales after a short escalation process.

### Term and renewal

- Initial term: 36 months from checkbox acceptance.
- Automatic 36-month renewals.
- Non-renewal notice: at least three months before the term ends.
- MRNV may terminate for convenience on 30 days' notice and has broad immediate termination rights.

### IP and exclusivity

- The developer appears to retain title to its pre-existing Game Rights, but the commercial licence is exceptionally broad: exclusive, worldwide, irrevocable and described as perpetual, subject to termination provisions.
- MRNV/Nominee may host, market, sublicense, modify, maintain and exploit the game and its source/object code as needed.
- Object code is due within three days after acceptance; source code is due within three days of a written request.
- MRNV owns IP in modifications, updates or alterations it creates.
- MRNV receives an exclusive, irrevocable, perpetual right to the game name and may rename the game; use of the same/confusing name by the developer is restricted.
- The developer retains reusable generic tools/technology only to the limited extent stated in clause 4.10.
- The developer must not license, distribute, exploit or create derivative works of the game for third parties.
- New games are subject to a 30-day right of first refusal before disclosure to others, unless a conflicting third-party arrangement already prohibits it.
- A proposed sale of Game Rights triggers a right-of-first-offer process and may restrict third-party negotiations for 30 days, then potentially another 60 days.

### Termination and continued use

- For specified exclusivity/IP-sale breaches, MRNV may keep the licence and game running perpetually while the developer's payment entitlement ends.
- For other termination paths, MRNV may keep the game active while continuing the licence fee.
- Payment may be suspended for breach while the game remains active; GGR generated during suspension is excluded from the developer's fee.
- MRNV has step-in rights and may recover/set off its costs.

### Liability and operational obligations

- The developer gives broad IP, legal-compliance, security and performance warranties and broad indemnities, including legal fees.
- No symmetric aggregate liability cap for the developer was found in the reviewed clauses.
- MRNV excludes consequential and lost-profit liability to the maximum lawful extent.
- The developer must maintain prudent-business insurance during the agreement and for one year after it ends, and produce evidence on demand.
- MRNV may require continuous, real-time access to the development environment and may request source code. Clarify whether a private GitHub repository must be connected and what access scope is expected.
- MRNV may charge an RGS service fee notified later; no public amount was found.
- MRNV may amend the agreement unilaterally by written notice, effective on receipt.
- The developer has no contractual audit right over the GGR data/calculation; MRNV/Stake data is described as conclusive and final.

### Taxes, withholding and certification

- Licence fees are stated to include VAT, sales taxes, duties, fees, tariffs and withholding taxes where applicable; those amounts are the developer's responsibility.
- The developer warrants that it has all licences, consents and permits needed to perform.
- MRNV may seek game certification/regulatory approval, with developer cooperation and potentially developer cost where requirements arise from the game's design or obligations.

### AI-generated content and originality

- Public approval guidance does not impose a blanket ban on AI-assisted assets.
- It does say over-reliance on generic AI-generated assets is a common reason for a low quality rating.
- Games and assets must be original, lawful and non-infringing. Sample SDK visuals/audio, pre-purchased games already on third-party sites, Stake branding, explicit/offensive content and child-like characters are prohibited.
- The contract places infringement risk and defence costs on the developer. Every generated asset therefore needs model/tool, plan, terms URL/date, prompt, source references, human edits and checksum in the asset register.
- Separate giveaway rules mention unauthorised AI generation or plagiarism, but those competition-specific rules are not a substitute for a platform-wide answer. Ask Engine to confirm acceptable AI provenance and disclosure for ordinary submissions.

### Critical commercial inconsistencies to resolve in writing

The public Payments page and the public Game Licence Terms are not fully aligned:

1. The licence terms define the fee as 10% of actual GGR, while the Payments page also offers Guaranteed based on expected GGR.
2. The licence terms state a $1,000 accumulated payout threshold; the Payments page says every amount above $0.00 is paid.
3. The terms permit an RGS service fee notified later; the public Payments page does not state a fee.
4. The terms impose broad exclusivity, while the Distribution page now offers an Engine operator network. Clarify how network distribution, sublicensing and exclusivity interact.

Do not accept the agreement or select a payment model until Engine confirms which text controls and whether selecting Guaranteed creates an amendment or separate payment schedule.

## Commercial model

### Team-wide setting

The payment model is set per team and applies to all games:

| Model | Only on Stake | Engine network | Basis |
|---|---:|---:|---|
| Profit Share | 10% | 5% per operator | Actual GGR = bets − player wins |
| Guaranteed | 7.5% | 3.75% per operator | Expected GGR = bets × (1 − mode RTP) |

- If no model is selected, public documentation says the team defaults to Profit Share.
- Before the first game is live, a change applies immediately.
- After the first game is live, a change applies from the start of the following month.
- Profit Share negative balances carry forward indefinitely but are not paid out of pocket.
- Switching from Profit Share to Guaranteed stops new debt but existing negative balance must still be earned off.

### Per-game setting

Distribution is selected separately for each game at first submission:

- **Only on Stake:** higher rate, full Stake promotion eligibility, and Stake-streamer promotion.
- **Stake + Engine network:** lower rate on Stake and each accepting operator, lower Stake placement/promotion, and no guaranteed launch on operators other than Stake.
- Distribution is fixed at launch. Engine review can change it before approval; the developer cannot change it after launch.
- A reskin/copy of an Only on Stake title cannot be used for a network release.

Current working hypothesis for *Hex & Heat* is **Only on Stake + Guaranteed (7.5% expected GGR)**. This is modelling only, not authorisation to select or activate it.

## Wallet and payout procedure

Public Payments documentation says:

1. Add one active wallet on the team's Wallet page only after the contracting party and compliance treatment are approved.
2. Payout currency can be USDT (default) or USDC.
3. The wallet must be an ERC-20 address. The exact chain/network name, supported custodians and smart-contract-wallet policy are not stated clearly enough for an irreversible transfer; confirm them with support.
4. Engine also requests a home or work address.
5. The first wallet activates immediately. A replacement wallet has a three-day security delay; the existing wallet remains active until the replacement activates. Team owners receive an email when a wallet is added.
6. Payouts run on the first day of each month for the previous UTC calendar month and are sent within 12 hours after appearing on the Payments page.
7. If there is no active wallet, earnings remain on the team balance.
8. Public Payments documentation says any positive amount is paid, but the licence agreement says amounts below USD 1,000 roll over. Obtain written clarification.
9. No public minimum network fee or deduction schedule was found. Obtain written confirmation of gas fees, service fees and withholding.
10. For a Serbian company, verify wallet ownership/custody, NBS Records of Virtual Currency Holders reporting, AML records, invoicing and stablecoin accounting before entry.

No wallet address has been created, requested, entered or saved for this task.

## Provider preparation

No legal name, registration number or company data should be invented. These are preliminary public-brand options only; each needs slug availability and trademark review:

| Public provider name | Candidate slug |
|---|---|
| Ember Cauldron Games | `ember-cauldron-games` |
| Nightglass Studio | `nightglass-studio` |
| Wild Ember Works | `wild-ember-works` |

Provisional public description:

> Independent game studio creating original, technically rigorous HTML5 casino games with transparent math, deterministic replay, and polished dark-fantasy presentation.

Public landing materials say the provider uses a public name and slug and accepts a square-recommended PNG, JPG or GIF logo up to 10 MB. They do not publicly confirm whether name, slug, logo or contracting entity can later be changed. Treat all four as irreversible until support or the authenticated UI confirms otherwise. No logo was generated or uploaded.

## Developer environment and Hex & Heat handoff

### Local work that can continue now

- Continue the documentation phase and local frontend/math work under the existing repository gates.
- Use the official Math SDK and Web SDK only at reviewed, pinned commits.
- Use a local/mock RGS for deterministic integration tests until a Studio session URL is available.
- Keep frontend output static; no private runtime service or secrets may be required by the shipped game.
- Keep all production uploads disabled until G5 submission authorisation.

### Math publish package

Engine's current minimum upload for a one-mode game is:

1. `index.json` listing every mode, its name, cost multiplier, game-logic file and lookup-table file;
2. one lookup CSV per mode (or shared where valid), each row containing unsigned 64-bit simulation ID, weight and integer payout multiplier; and
3. one `.jsonl.zst` game-logic file per mode (or shared where valid), with one round per line containing `id`, `events` and integer `payoutMultiplier`.

Payout multipliers are integer hundredths of base bet (`100 = 1x`). The CSV payout sequence must exactly match the game-logic payouts. The Math SDK writes publishable files to `library/publish_files/`.

### Frontend/RGS contract

- Frontend is a static build uploaded as a version in Studio.
- Launch URL shape: `https://{team}.live.engine.io/{game}/v{version}/?...`.
- Read `sessionID`, `rgs_url`, `lang`, `currency`, `device`, `social` and `demo` from launch parameters; never hardcode the RGS host.
- Authenticate first, consume all bet levels/modes from the RGS response, represent money as six-decimal integers, and close winning rounds with `end-round` according to `round.active`/mode behaviour.
- Handle interrupted active rounds deterministically.

### Replay and preview

Replay is mandatory. In replay mode:

- no player session or authenticated wallet calls;
- fetch `GET https://{rgs_url}/bet/replay/{game}/{version}/{mode}/{event}`;
- show a Play gesture, complete animation, final cost/win and Play Again;
- disable betting and support currency/language/amount, social wording and small popout;
- retain event IDs for loss, normal win, big win, max win and bonus trigger per mode.

Engine's AI review page says an account-visible Studio session URL can be used for local automated review. Obtain that URL only after account creation; never commit it if it contains a live session identifier.

### Studio sequence after user handoff

1. Sign in with the existing GitHub identity and determine whether it already maps to an Engine account.
2. Complete email/2FA/KYC only with the user present.
3. Confirm the contracting party and create or select one team/provider.
4. Inspect team settings, member roles, rename/slug/entity controls and account-visible terms.
5. Leave Profit Share/Guaranteed unchanged until Product Owner approval.
6. Create a non-production game shell only after confirming that creation itself does not publish or submit it.
7. Record game ID, team slug, required media and account-visible checklist.
8. Publish a reviewed math version and static frontend version only after the relevant repository gate authorises upload.
9. Use Studio demo/test sessions for RGS, mobile/popout, social mode and replay testing.
10. Do not click Submit for Approval, select final distribution, publish commercially or configure a wallet without a separate decision.

### Current submission gates

Public Studio documentation currently requires before submission:

- a 3:4 game tile and a 16:9 cover image;
- a published frontend version and math version;
- all critical math tests passing and at least one compatible bet-level template;
- the disclaimer and social-mode confirmation;
- a distribution selection; and
- capacity within the team's open-review limit (one until the first game is live, five afterward).

Three reviewers score the game. Current public guidance requires at least 6 of 9 points (a 2-star average) to proceed to final approval. Only 3-star games receive the principal New Releases/Slots/Burst placement. This is an approval risk, not merely a marketing detail.

## Questions for Engine support

Send these only after the Product Owner approves the message and provides the intended contracting party:

1. Can an individual resident in Serbia register, contract and receive payouts? Can a Serbian incorporated company do so? Are there nationality, residency, beneficial-owner or jurisdiction restrictions not published in the registration flow?
2. What exact KYC/KYB documents are required for each route, and must the OAuth identity, contract signatory and wallet owner be the same person/entity?
3. Can an existing individual team later be transferred to a company, or vice versa? Can provider name, public slug, logo and legal entity be changed after creation?
4. Does Engine require a Serbian developer/software-supplier licence, or only confirmation that the developer is not itself organising gambling in Serbia?
5. How does selecting Guaranteed become legally effective when the public Game Licence definition currently states 10% of actual GGR only?
6. Which payout threshold controls: the agreement's USD 1,000 rollover or the Payments page's “any amount above $0.00” statement?
7. Are any RGS service fees, gas fees, withholding or other deductions currently charged? Please provide the schedule.
8. Which ERC-20 network is supported for USDT/USDC? Are custodial/exchange wallets and smart-contract wallets permitted, and what proof of wallet control/location is required?
9. How do the agreement's exclusivity clauses interact with the Engine network and selected-operator distribution?
10. Does clause 3.6 require continuous access to a private source repository/development environment? If so, what permissions, retention and security controls apply?
11. What insurance is expected from an individual or a small Serbian company under clause 17.16?
12. Are AI-generated visual/audio assets accepted in ordinary submissions when the developer has commercial rights and full provenance? What disclosures or evidence are required?
13. Does Engine require game or supplier certification before launch in any target jurisdiction, and who bears each certification cost?
14. Please confirm the current legal entity issuing payments and the documentation needed for Serbian tax, invoicing and accounting records.

Support/legal contact shown in current public materials: `legal@engine.io`. Verify the address in the authenticated Studio before transmitting personal or company data.

## Required user actions

1. Review the Game Licence risk summary and decide whether legal review is required before checkbox acceptance (recommended: yes).
2. Choose the intended contracting route: individual or the exact existing Serbian company; do not provide company details until requested in a confirmed official flow.
3. Confirm that the intended signatory is 18+ and authorised to grant the required rights.
4. In the open official sign-in page, personally approve or decline the Privacy Policy and Game Licence checkboxes.
5. Complete GitHub OAuth, email/2FA and any KYC/KYB prompts personally.
6. Return control after the authenticated dashboard is visible. The next agent pass should first check for an existing team/account, then inspect account-only requirements without selecting payment/distribution or submitting anything.

## Official sources checked

- Engine entry point: `https://engine.io/`
- Engine Studio: `https://studio.engine.io/`
- Sign-in: `https://studio.engine.io/signin`
- Game Licence Terms: `https://studio.engine.io/docs/terms`
- Privacy Policy: `https://studio.engine.io/docs/privacy`
- Payments: `https://stake-engine.com/docs/payments`
- Distribution: `https://stake-engine.com/docs/distribution`
- RGS API: `https://stake-engine.com/docs/rgs`
- Math file format: `https://stake-engine.com/docs/math/math-file-format`
- Approval guidelines: `https://stake-engine.com/docs/approval-guidelines`
- Submission checklist: `https://stake-engine.com/docs/approval-guidelines/submission-checklist`
- Replay: `https://stake-engine.com/docs/approval-guidelines/game-replay-requirements`
- Quality rankings: `https://stake-engine.com/docs/approval-guidelines/game-quality-rankings`
- AI review: `https://stake-engine.com/docs/ai-review`
- Serbian Games of Chance Administration, current law index: `https://uis.gov.rs/en/zakoni`
- Serbian Law on Games of Chance 18/2020 and 94/2024 (English PDF): `https://uis.gov.rs/static/uploads/2753_Law_on_games_of_chance.pdf`
- National Bank of Serbia digital-assets guidance: `https://nbs.rs/en/ciljevi-i-funkcije/nadzor-nad-finansijskim-institucijama/digital-imo/`
- Serbian Tax Administration freelancer FAQ: `https://frilenseri.purs.gov.rs/en/faq.html`
