# Handoff — Work Task 02: Engine Studio onboarding

Date: 2026-10-18  
Issue/branch/commit: not available; the supplied workspace is a non-Git project mirror  
Status: `AWAITING USER`

## Inputs

- Work Task 02 pasted by the Product Owner.
- Public Engine Studio, legal, payment, distribution, RGS, math, replay, approval and AI-review pages.
- Current Serbian Games of Chance Administration, National Bank and Tax Administration public guidance.
- Existing project documents, especially DOC-00, DOC-04, DOC-12, TECH_STACK_DECISIONS, RISK_REGISTER and OPEN_QUESTIONS.

## Files changed

- `docs/ENGINE_ONBOARDING.md` — due diligence, contract/commercial summary, eligibility uncertainties, wallet procedure, developer-environment handoff and exact user gates.
- `agents/handoffs/WORK-TASK-02-engine-onboarding.md` — this handoff record.

## Commands/tests

- Repository validation and unit tests should be run after this documentation addition.
- No SDK install, build, upload, account creation, OAuth, KYC, wallet action, payment-model selection or submission was performed.

## Acceptance evidence

- Official domain chain verified: `engine.io` → `studio.engine.io`.
- Studio sign-in visibly required unchecked Privacy and Game Licence acceptance before Google/GitHub/Discord OAuth.
- No active Studio session or authenticated dashboard was present.
- Current Game Licence (published 2026-07-30) and public Payments/Distribution pages were reviewed.
- Current math file format, mandatory replay flow and submission gates were verified.

## Assumptions

- The existing browser's GitHub identity is the preferred OAuth identity, but it was not authorised or transmitted.
- Serbia is relevant because the task specifically asks for an individual route and an existing Serbian-company route; no unverified personal/company details were used.
- The current product hypothesis remains Only on Stake + Guaranteed, but no commercial selection was made.

## Unresolved risks

- Contract acceptance requires a Product Owner/legal decision due to broad IP, exclusivity, source-code, termination, liability, insurance and unilateral-amendment terms.
- Individual versus Serbian-company eligibility and licensing/tax treatment remain legally unconfirmed.
- Public Payments documentation conflicts with the Game Licence on fee model and payout threshold.
- Exact KYC/KYB documents, wallet chain/custody rules, fees, provider rename controls and account-only upload UI remain unknown until support/authenticated access.
- The GitHub repository could not be updated: the local mirror has no `.git` metadata, the GitHub connector did not expose the repository, and the local GitHub CLI session is unauthenticated.

## Licences / provenance

- No assets, libraries or generated media were added.
- No personal data, credentials, tokens, wallet addresses or documents were recorded.

## Exact next action

The Product Owner should review `docs/ENGINE_ONBOARDING.md`, choose whether to obtain legal advice, then personally accept or decline the Engine policies and complete GitHub OAuth/KYC. Once the authenticated dashboard is visible, resume by checking for an existing account/team before creating anything.
