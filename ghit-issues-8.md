---
type: Feature
title: "Add an Edit Milestone flow that persists changes through updateMilestone"
labels: type:feature, area:milestones, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Add an Edit Milestone flow that persists changes through updateMilestone

### Description
`src/lib/repository.ts` already exports `updateMilestone(id, patch)`, but no UI calls it — `src/app/milestones/page.tsx` can only create milestones via `MilestoneCreationForm`. Users cannot correct a typo in a title, payout, or due date after saving.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add an Edit action per row in `src/components/MilestonesList.tsx` that opens the creation form pre-filled in edit mode.
- Reuse `src/components/milestones/MilestoneCreationForm.tsx` with an optional `initialValues` prop rather than duplicating the form.
- Route the save through `updateMilestone` and refresh the page list from `listMilestones()`.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/milestones-edit-flow`
- **Write code in:** `src/components/milestones/MilestoneCreationForm.tsx`
- **Write comprehensive tests in:** `src/components/__tests__/MilestoneEditFlow.test.tsx`
- **Add documentation:** `docs/components/MilestoneCreationForm.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`feat(milestones): add edit milestone flow backed by updateMilestone`

### Guidelines
- Minimum 95 percent test coverage for impacted modules
- Clear documentation
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Associate milestones with a parent contract via a contractId field"
labels: type:feature, area:contract-detail, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Associate milestones with a parent contract via a contractId field

### Description
`src/types/domain.ts` models `Contract` and `Milestone` independently, so `src/app/contracts/[id]/page.tsx` cannot show which milestones belong to the contract being viewed. Every milestone currently lives in one flat global list in `src/lib/repository.ts`.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add an optional `contractId` to `Milestone` and a `listMilestonesByContract(contractId)` selector in the repository.
- Set `contractId` when a milestone is created from a contract context in `src/components/milestones/MilestoneCreationForm.tsx`.
- Render the filtered milestones on the contract detail page and feed them into `useContractProgress`.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/contract-detail-milestone-link`
- **Write code in:** `src/lib/repository.ts`
- **Write comprehensive tests in:** `src/lib/__tests__/listMilestonesByContract.test.ts`
- **Add documentation:** `docs/data-model.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`feat(data-model): link milestones to contracts via contractId`

### Guidelines
- Minimum 95 percent test coverage for impacted modules
- Clear documentation
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Reflect the selected milestone status filter in the URL query string"
labels: type:feature, area:milestones-filter, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Reflect the selected milestone status filter in the URL query string

### Description
The filter state in `src/app/milestones/page.tsx` lives only in React state, so a filtered view cannot be shared, bookmarked, or restored after a reload. `src/components/milestones/MilestoneFilter.tsx` already emits a typed `MilestoneStatusFilter` that maps cleanly to a query param.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Read the initial filter from `?status=` using App Router `useSearchParams`, falling back to `All` for unknown values.
- Push filter changes with `router.replace` so the browser history is not polluted.
- Keep the existing `aria-live` result-count announcement intact.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/milestones-filter-url-state`
- **Write code in:** `src/app/milestones/page.tsx`
- **Write comprehensive tests in:** `src/app/__tests__/milestones-filter-url.test.tsx`
- **Add documentation:** `docs/components/MilestonesList.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`feat(milestones): sync status filter with the URL query string`

### Guidelines
- Minimum 95 percent test coverage for impacted modules
- Clear documentation
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Add a CSV export action for the milestones list"
labels: type:enhancement, area:export, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Add a CSV export action for the milestones list

### Description
Freelancers reconciling payouts have no way to get milestone data out of the app. `src/app/milestones/page.tsx` holds the full typed `Milestone[]` in memory, so a client-side CSV export is a small, self-contained addition.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add a `src/lib/exportCsv.ts` helper that serialises records with proper quoting and escaping of commas, quotes, and newlines.
- Export only the currently filtered rows and name the file with an ISO date.
- Guard the Blob/`URL.createObjectURL` usage so the module stays SSR-safe.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/export-milestones-csv`
- **Write code in:** `src/lib/exportCsv.ts`
- **Write comprehensive tests in:** `src/lib/exportCsv.test.ts`
- **Add documentation:** `docs/lib/exportCsv.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`feat(export): add CSV export for the milestones list`

### Guidelines
- Minimum 95 percent test coverage for impacted modules
- Clear documentation
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Label the SAMPLE_MILESTONES demo data with a dismissible sample-data banner"
labels: type:enhancement, area:onboarding, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Label the SAMPLE_MILESTONES demo data with a dismissible sample-data banner

### Description
`src/app/milestones/page.tsx` silently falls back to the hardcoded `SAMPLE_MILESTONES` array when the repository is empty, so first-time users cannot tell demo rows from their own data. There is no way to clear the samples or start from a clean slate.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Render a dismissible banner above `MilestonesList` whenever the sample fallback is active.
- Offer a "Start from scratch" action that hides samples and persists the choice via `src/lib/safeStorage.ts`.
- Keep the banner out of the DOM once real milestones exist.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/onboarding-sample-data-banner`
- **Write code in:** `src/app/milestones/page.tsx`
- **Write comprehensive tests in:** `src/app/__tests__/milestones-sample-banner.test.tsx`
- **Add documentation:** `docs/walkthrough.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`feat(onboarding): flag sample milestones with a dismissible banner`

### Guidelines
- Minimum 95 percent test coverage for impacted modules
- Clear documentation
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Merge the duplicate ContractCreationForm and CreateContractForm implementations"
labels: type:refactor, area:contract-forms, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Merge the duplicate ContractCreationForm and CreateContractForm implementations

### Description
The repo ships two overlapping contract forms: `src/components/ContractCreationForm.tsx` (parties array, inline validation) and `src/components/contracts/CreateContractForm.tsx` (single freelancer address, `validateContract`). They diverge in validation rules and accessibility wiring, so bug fixes have to be applied twice.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Keep one component, delegating all validation to `src/lib/validateContract.ts`.
- Preserve the strongest behaviour from each: multi-party support plus Stellar address validation.
- Update all import sites and delete the retired file and its stale docs entry.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b refactor/contract-forms-consolidation`
- **Write code in:** `src/components/ContractCreationForm.tsx`
- **Write comprehensive tests in:** `src/components/__tests__/ContractCreationForm.test.tsx`
- **Add documentation:** `docs/components/ContractCreationForm.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`refactor(contracts): consolidate duplicate contract creation forms`

### Guidelines
- Minimum 95 percent test coverage for impacted modules
- Clear documentation
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Extract a useFormValidation hook shared by the contract and milestone forms"
labels: type:refactor, area:forms, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Extract a useFormValidation hook shared by the contract and milestone forms

### Description
`src/components/ContractCreationForm.tsx`, `src/components/contracts/CreateContractForm.tsx`, and `src/components/milestones/MilestoneCreationForm.tsx` each re-implement the same `errors` state, submit-time validation, and `ErrorSummary` focus handoff. The duplication makes accessibility regressions easy to introduce in one form only.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add `src/hooks/useFormValidation.ts` returning `{ errors, validateAndSubmit, clearFieldError }` typed against `ValidationError` from `src/lib/validateLogin.ts`.
- Migrate all three forms plus the login form in `src/app/page.tsx` to the hook.
- Keep the existing `ErrorSummary` focus-on-submit behaviour byte-for-byte identical.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b refactor/forms-use-form-validation-hook`
- **Write code in:** `src/hooks/useFormValidation.ts`
- **Write comprehensive tests in:** `src/hooks/__tests__/useFormValidation.test.tsx`
- **Add documentation:** `docs/hooks/useFormValidation.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`refactor(forms): extract shared useFormValidation hook`

### Guidelines
- Minimum 95 percent test coverage for impacted modules
- Clear documentation
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Centralize the milestone status and currency option lists in a constants module"
labels: type:refactor, area:domain-constants, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Centralize the milestone status and currency option lists in a constants module

### Description
`STATUS_OPTIONS` and `CURRENCY_OPTIONS` are declared inside `src/components/milestones/MilestoneCreationForm.tsx`, while `FILTER_OPTIONS` in `src/components/milestones/MilestoneFilter.tsx` lists a different status set (no `Active`). Filtering therefore cannot reach every status a milestone can actually hold.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Create `src/lib/constants.ts` exporting the canonical status and currency lists derived from `src/types/domain.ts`.
- Consume the constants in the creation form, the filter, and `src/components/StatusBadge.tsx`.
- Fix the missing `Active` status in the filter as part of the migration.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b refactor/domain-constants-module`
- **Write code in:** `src/lib/constants.ts`
- **Write comprehensive tests in:** `src/lib/constants.test.ts`
- **Add documentation:** `docs/data-model.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`refactor(domain): centralize status and currency option constants`

### Guidelines
- Minimum 95 percent test coverage for impacted modules
- Clear documentation
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Add tests for MilestoneCreationForm validation, id generation, and cancel"
labels: type:test, area:milestone-form, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Add tests for MilestoneCreationForm validation, id generation, and cancel

### Description
`src/components/milestones/MilestoneCreationForm.tsx` is 240 lines of validation, slug-plus-timestamp id generation, and dialog wiring with no dedicated test file under `src/components/__tests__/`. Regressions in payout parsing or the `onCancel` path would ship unnoticed.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Cover required-title, non-numeric payout, zero/negative payout, and missing currency errors.
- Assert the generated milestone `id` slugs the title and stays unique across two submissions with the same title.
- Assert `onCancel` fires without invoking `onSubmit` and that `ErrorSummary` receives focus on invalid submit.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/milestone-form-coverage`
- **Write code in:** `src/components/milestones/MilestoneCreationForm.tsx`
- **Write comprehensive tests in:** `src/components/__tests__/MilestoneCreationForm.test.tsx`
- **Add documentation:** `docs/components/MilestoneCreationForm.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`test(milestones): cover MilestoneCreationForm validation and cancel paths`

### Guidelines
- Minimum 95 percent test coverage for impacted modules
- Clear documentation
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Add timezone boundary tests for parseLocalDate and isDueSoon"
labels: type:test, area:date-utils, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Add timezone boundary tests for parseLocalDate and isDueSoon

### Description
`src/lib/dueSoon.ts` exists specifically to defeat the UTC-to-local shift that makes `YYYY-MM-DD` dates land on the wrong day, but it has no test file. The `Math.round` on the day delta and the local-midnight normalisation are both easy to break silently.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Test `parseLocalDate` with valid ISO dates, invalid calendar dates such as `2026-02-30`, empty strings, and non-string input.
- Test `isDueSoon` at exactly 0 days, exactly `windowDays`, one day past the window, and for already-overdue dates.
- Pin `TZ` in the test file or use fixed `Date` fixtures so results are deterministic across machines.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/due-soon-timezone-coverage`
- **Write code in:** `src/lib/dueSoon.ts`
- **Write comprehensive tests in:** `src/lib/dueSoon.test.ts`
- **Add documentation:** `docs/lib/dueSoon.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`test(date-utils): add timezone boundary coverage for dueSoon helpers`

### Guidelines
- Minimum 95 percent test coverage for impacted modules
- Clear documentation
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Add tests for validateContract field rules and Stellar address rejection"
labels: type:test, area:contract-validation, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Add tests for validateContract field rules and Stellar address rejection

### Description
`src/lib/validateContract.ts` gates every contract creation, yet only `src/lib/validateLogin.test.ts` has coverage in that directory. The interaction between the empty-address branch and the `isValidStellarAddress` branch is untested.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Assert exactly one address error is returned for an empty address and a different one for a malformed `G...` key.
- Cover `totalValue` cases: empty, `abc`, `0`, `-5`, `Infinity`, and a valid decimal.
- Assert a fully valid payload returns an empty array and that `fieldId` values match the form input ids.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/validate-contract-coverage`
- **Write code in:** `src/lib/validateContract.ts`
- **Write comprehensive tests in:** `src/lib/validateContract.test.ts`
- **Add documentation:** `docs/components/ContractCreationForm.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`test(validation): cover validateContract rules and address rejection`

### Guidelines
- Minimum 95 percent test coverage for impacted modules
- Clear documentation
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Add tests for the useCopyToClipboard reset timer and failure path"
labels: type:test, area:hooks, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Add tests for the useCopyToClipboard reset timer and failure path

### Description
`src/hooks/useCopyToClipboard.ts` owns a copied-state flag and a reset timeout consumed by `WalletConnectButton` and `ContractSummary`, but has no test of its own. Unmounting while the reset timer is pending is a classic React state-update-after-unmount leak.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Use fake timers to assert the copied flag flips back after the configured timeout.
- Assert the error branch when `navigator.clipboard` is missing or `writeText` rejects.
- Assert the pending timer is cleared on unmount with no act warnings.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/use-copy-to-clipboard-coverage`
- **Write code in:** `src/hooks/useCopyToClipboard.ts`
- **Write comprehensive tests in:** `src/hooks/__tests__/useCopyToClipboard.test.tsx`
- **Add documentation:** `docs/hooks/useCopyToClipboard.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`test(hooks): cover useCopyToClipboard reset timer and failure path`

### Guidelines
- Minimum 95 percent test coverage for impacted modules
- Clear documentation
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Add tests for the milestoneStatusTally and currencyMismatch helpers"
labels: type:test, area:milestone-utils, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Add tests for the milestoneStatusTally and currencyMismatch helpers

### Description
`src/lib/milestoneStatusTally.ts` and `src/lib/currencyMismatch.ts` feed the status chip row and the payout-currency warning respectively, and neither has a test file. Both are pure functions, so full branch coverage is cheap.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Cover the tally for an empty array, a single status, all statuses present, and unknown status values.
- Cover currency mismatch for matching currencies, one divergent milestone, and case differences such as `usd` versus `USD`.
- Assert the helpers never mutate the input array.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/milestone-utils-coverage`
- **Write code in:** `src/lib/milestoneStatusTally.ts`
- **Write comprehensive tests in:** `src/lib/milestoneStatusTally.test.ts`
- **Add documentation:** `docs/lib/milestoneStatusTally.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`test(milestones): cover status tally and currency mismatch helpers`

### Guidelines
- Minimum 95 percent test coverage for impacted modules
- Clear documentation
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Bound and sanitize user-supplied titles and party labels before persisting"
labels: type:security, area:input-hardening, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Bound and sanitize user-supplied titles and party labels before persisting

### Description
`src/components/milestones/MilestoneCreationForm.tsx` and `src/components/ContractCreationForm.tsx` only check that titles and labels are non-empty before handing them to `saveMilestone`/`saveContract` in `src/lib/repository.ts`. Unbounded strings and control characters flow straight into localStorage and back into the DOM.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add a `sanitizeUserText(value, maxLength)` helper that trims, strips control characters, collapses whitespace, and enforces a length cap.
- Apply it at the validation boundary so persisted records are already clean.
- Surface a clear over-length validation error rather than silently truncating.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b security/input-hardening-user-text`
- **Write code in:** `src/lib/sanitizeUserText.ts`
- **Write comprehensive tests in:** `src/lib/sanitizeUserText.test.ts`
- **Add documentation:** `docs/security-headers.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`fix(security): sanitize and bound user-supplied titles before persistence`

### Guidelines
- Minimum 95 percent test coverage for impacted modules
- Clear documentation
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Throttle repeated login submissions on the home page form"
labels: type:security, area:auth, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Throttle repeated login submissions on the home page form

### Description
The login form in `src/app/page.tsx` validates through `src/lib/validateLogin.ts` and submits with no attempt limiting, so a script can hammer the handler as fast as the event loop allows. Client-side throttling is a cheap first line of defence ahead of the real auth backend.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add an attempt counter with exponential backoff that disables the submit button and shows the remaining cooldown.
- Persist the counter through `src/lib/safeStorage.ts` so a reload does not reset it, and reset it on success.
- Announce the cooldown through an `aria-live` region so it is not a purely visual lockout.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b security/auth-login-throttle`
- **Write code in:** `src/app/page.tsx`
- **Write comprehensive tests in:** `src/app/__tests__/login-throttle.test.tsx`
- **Add documentation:** `docs/security-headers.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`feat(security): throttle repeated login submissions with backoff`

### Guidelines
- Minimum 95 percent test coverage for impacted modules
- Clear documentation
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Document the milestone creation form and status filter in docs/components"
labels: type:docs, area:milestones-docs, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Document the milestone creation form and status filter in docs/components

### Description
`docs/components/` covers ContractSummary, ActionPanel, Toast, and others, but has no page for `src/components/milestones/MilestoneCreationForm.tsx` or `src/components/milestones/MilestoneFilter.tsx`. Contributors have to read the source to learn the prop contracts and the radiogroup accessibility model.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Document props, validation rules, the slug-plus-timestamp id scheme, and the `onCancel` contract.
- Document the `radiogroup` semantics, the `aria-live` result count, and how `resultCount` must be supplied.
- Link both pages from `docs/walkthrough.md`.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b docs/milestones-components`
- **Write code in:** `src/components/milestones/MilestoneFilter.tsx`
- **Write comprehensive tests in:** `src/components/__tests__/MilestoneFilter.test.tsx`
- **Add documentation:** `docs/components/MilestoneFilter.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`docs(milestones): document creation form and status filter components`

### Guidelines
- Minimum 95 percent test coverage for impacted modules
- Clear documentation
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Prune root-level build logs and fold one-off implementation notes into docs/"
labels: type:docs, area:repo-hygiene, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Prune root-level build logs and fold one-off implementation notes into docs/

### Description
The repository root holds committed build and test logs (`build-out.txt`, `jest-full-output.txt`, `lint-out.txt`, `next-build.txt` and friends) alongside a dozen one-off notes such as `IMPLEMENTATION_COMPLETE_383.md`, `REPUTATION_PAGE_PR.md`, and `SECURITY_FIX_PR.md`. New contributors cannot tell which documents are current.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Delete the generated `.txt` logs and add matching patterns to `.gitignore`.
- Move any still-useful content from the one-off markdown files into `docs/` and remove the rest.
- Update `README.md` with an index of the surviving documentation.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b docs/repo-hygiene-cleanup`
- **Write code in:** `.gitignore`
- **Write comprehensive tests in:** `src/app/__tests__/metadata.test.ts`
- **Add documentation:** `README.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`docs(repo): remove committed build logs and consolidate notes into docs/`

### Guidelines
- Minimum 95 percent test coverage for impacted modules
- Clear documentation
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Trap focus and close on Escape in the MilestoneCreationForm dialog"
labels: type:a11y, area:milestone-dialog, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Trap focus and close on Escape in the MilestoneCreationForm dialog

### Description
`src/components/milestones/MilestoneCreationForm.tsx` renders `role="dialog"` with `aria-modal`, but unlike `src/components/ConfirmDialog.tsx` it does not trap Tab focus, close on Escape, or return focus to the trigger. Keyboard users can tab into the page behind the modal.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Move initial focus to the first field on open and restore it to the invoking button on close.
- Cycle Tab and Shift+Tab within the dialog and wire Escape to `onCancel`.
- Reuse the focus-trap approach already proven in `ConfirmDialog` instead of writing a third variant.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b a11y/milestone-dialog-focus-trap`
- **Write code in:** `src/components/milestones/MilestoneCreationForm.tsx`
- **Write comprehensive tests in:** `src/components/__tests__/MilestoneDialogFocus.test.tsx`
- **Add documentation:** `docs/components/Accessibility.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`fix(a11y): trap focus and handle Escape in the milestone creation dialog`

### Guidelines
- Minimum 95 percent test coverage for impacted modules
- Clear documentation
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Expose required-field state through aria-required and a visible indicator in FormField"
labels: type:a11y, area:form-field, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Expose required-field state through aria-required and a visible indicator in FormField

### Description
`src/components/FormField.tsx` injects `aria-invalid` and `aria-describedby` but has no notion of a required field, so every consumer marks requirements only in prose or not at all. Screen reader users learn a field was mandatory only after a failed submit.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add a `required` prop that sets `aria-required` on the cloned input and renders a visible indicator in the label with a non-colour-only cue.
- Ensure the indicator is not announced as a stray asterisk character by assistive technology.
- Adopt the prop across the contract, milestone, and login forms.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b a11y/form-field-required-state`
- **Write code in:** `src/components/FormField.tsx`
- **Write comprehensive tests in:** `src/components/__tests__/FormFieldRequired.test.tsx`
- **Add documentation:** `docs/components/Accessibility.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`feat(a11y): add required-field semantics and indicator to FormField`

### Guidelines
- Minimum 95 percent test coverage for impacted modules
- Clear documentation
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Code-split the contract and milestone creation dialogs with next/dynamic"
labels: type:enhancement, area:performance, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Code-split the contract and milestone creation dialogs with next/dynamic

### Description
`src/app/contracts/page.tsx` and `src/app/milestones/page.tsx` statically import `ContractCreationForm` (339 lines) and `MilestoneCreationForm` (240 lines), so both ship in the initial route bundle even though the dialogs open only on demand. Neither is needed for first paint.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Load both forms with `next/dynamic` and `ssr: false`, using the existing skeletons as the loading fallback.
- Verify with `npm run build` that the route-level First Load JS drops and record the before/after numbers in the PR.
- Keep focus moving into the dialog once the chunk resolves so the a11y behaviour is unchanged.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/performance-dynamic-dialogs`
- **Write code in:** `src/app/milestones/page.tsx`
- **Write comprehensive tests in:** `src/app/__tests__/dynamic-dialogs.test.tsx`
- **Add documentation:** `docs/walkthrough.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`perf(bundles): code-split contract and milestone creation dialogs`

### Guidelines
- Minimum 95 percent test coverage for impacted modules
- Clear documentation
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
