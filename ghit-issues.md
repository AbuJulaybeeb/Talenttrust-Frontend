---
type: Feature
title: "Integrate Freighter/Stellar wallet connection in WalletContext to replace the mocked address"
labels: type:feature, area:wallet, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Implement Freighter/Stellar wallet connection in WalletContext to replace the mocked address

### Description
Today [`src/contexts/WalletContext.tsx`](src/contexts/WalletContext.tsx) fakes a connection: `connect()` waits 1000ms and hard-codes an Ethereum-style address (`0x71C7656EC7...`), which is wrong for a Stellar app and never touches a real wallet. The [`WalletConnectButton`](src/components/WalletConnectButton.tsx) and gated actions in [`ActionPanel`](src/components/ActionPanel.tsx) therefore exercise nothing real. This issue wires the context to a Stellar wallet (Freighter via `@stellar/freighter-api`) so a genuine `G...` public key is surfaced and persisted.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Replace the `setTimeout` mock in `connect()` with a real Freighter flow: detect availability, request access, and read the public key; map "wallet not installed" and "user rejected" to distinct `error` strings.
- Persist the connected address in `localStorage` and rehydrate on mount so a refresh keeps the session, mirroring the hydration pattern already used in [`src/lib/preferences.tsx`](src/lib/preferences.tsx).
- Keep the existing `WalletContextType` shape (`address`, `isConnecting`, `error`, `connect`, `disconnect`) so `WalletConnectButton` and `ActionPanel` need no signature changes.
- Guard all `window`/wallet access for SSR safety (this is a Next.js App Router client context).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/wallet-01-freighter-integration`
- Implement changes
  - **Write code in:** [`src/contexts/WalletContext.tsx`](src/contexts/WalletContext.tsx) — real connect/disconnect, error mapping, localStorage rehydration.
  - **Write comprehensive tests in:** [`src/contexts/__tests__/WalletContext.test.tsx`](src/contexts/__tests__/WalletContext.test.tsx) — mock the Freighter API, asserting success, rejection, not-installed, and rehydration paths.
  - **Add documentation:** add a "Wallet" section to [`README.md`](README.md) describing setup and the supported wallet.
  - Add JSDoc to the exported `useWallet` hook and provider.
  - Validate security: never log the key, no PII in storage beyond the public address.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: wallet extension absent, user rejects, repeated connect, disconnect clears storage, SSR (no `window`).
- Include the full `npm test` output and short notes on the wallet integration in the PR description.

### Example commit message
`feat(wallet): integrate Freighter Stellar wallet connection with persistence and tests`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Build a Create Contract form with accessible validation on the Contracts page"
labels: type:feature, area:contracts, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Implement a Create Contract form with accessible validation on the Contracts page

### Description
The "Create Contract" button in [`src/app/contracts/page.tsx`](src/app/contracts/page.tsx) only does `console.log('Create contract')`, and the page hard-codes `const contracts: any[] = []` so nothing is ever created or rendered. This issue adds a real create-contract form built from the existing accessible primitives [`FormField`](src/components/FormField.tsx) and [`ErrorSummary`](src/components/ErrorSummary.tsx), feeding into local state that the empty/list view reacts to.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Create `src/components/contracts/CreateContractForm.tsx` with fields for contract name, freelancer address, total value, and currency; reuse `FormField` for labels/errors and `ErrorSummary` for the focusable error digest.
- Validate required fields, a positive numeric total value, and a plausible Stellar `G...` address; surface success through `useToast()` ([`src/components/toast/toast-provider.tsx`](src/components/toast/toast-provider.tsx)).
- Replace the `any[]` placeholder in [`src/app/contracts/page.tsx`](src/app/contracts/page.tsx) with a typed `Contract[]` state so creating a contract toggles the page from `EmptyState` to a rendered list.
- Keep the page a client component and avoid `alert()`.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/contracts-02-create-contract-form`
- Implement changes
  - **Write code in:** create [`src/components/contracts/CreateContractForm.tsx`](src/components/contracts/CreateContractForm.tsx) and update [`src/app/contracts/page.tsx`](src/app/contracts/page.tsx).
  - **Write comprehensive tests in:** [`src/components/contracts/__tests__/CreateContractForm.test.tsx`](src/components/contracts/__tests__/CreateContractForm.test.tsx) — valid submit, each validation failure, and `ErrorSummary` focus.
  - **Add documentation:** add `docs/components/CreateContractForm.md` following the style of the existing files in [`docs/components`](docs/components).
  - Add JSDoc to the form's props and validation helper.
  - Validate a11y: labels, `aria-invalid`, and error association via `FormField`.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: empty fields, non-numeric value, malformed address, and successful creation rendering the list.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(contracts): add accessible create-contract form with validation and tests`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Replace the alert()-based home login form with a real auth form using FormField and ErrorSummary"
labels: type:feature, area:auth, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Implement a real auth form on the home page using FormField and ErrorSummary

### Description
The home page [`src/app/page.tsx`](src/app/page.tsx) keeps email/password state and runs ad-hoc validation, but on success it just calls `alert('Form submitted successfully!')` and renders no actual inputs — the validated `errors` array is computed and never displayed. This issue turns it into a real, accessible sign-in form that reuses [`FormField`](src/components/FormField.tsx) and [`ErrorSummary`](src/components/ErrorSummary.tsx), and reports success/failure through the toast system instead of `alert()`.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Render email and password inputs wrapped in `FormField`, and render the existing `errors` state through `ErrorSummary` (whose anchors already match the `fieldId` values used in `page.tsx`).
- Remove `alert(...)`; on valid submit, call `useToast().showSuccess(...)`; keep the current validation rules (required, `@`, min length 8).
- Preserve the existing hero copy and layout container; do not regress styling.
- Extract the validation into a small pure helper (e.g. `src/lib/validateLogin.ts`) so it is unit-testable in isolation.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/auth-03-home-login-form`
- Implement changes
  - **Write code in:** [`src/app/page.tsx`](src/app/page.tsx) and create [`src/lib/validateLogin.ts`](src/lib/validateLogin.ts).
  - **Write comprehensive tests in:** [`src/app/page.test.tsx`](src/app/page.test.tsx) (extend) and [`src/lib/__tests__/validateLogin.test.ts`](src/lib/__tests__/validateLogin.test.ts).
  - **Add documentation:** note the auth form behavior in [`README.md`](README.md).
  - Add JSDoc to the validation helper.
  - Validate a11y: error summary receives focus, inputs are labelled and described.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: empty email, invalid email, short password, and a fully valid submission.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(auth): replace alert-based login with accessible FormField/ErrorSummary form`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Wire the Reputation page to render ReputationProfile instead of a bare EmptyState"
labels: type:feature, area:reputation, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Implement ReputationProfile rendering on the Reputation page

### Description
The fully-built [`ReputationProfile`](src/components/ReputationProfile.tsx) component — with score, level, privacy notes, and history — is never used by [`src/app/reputation/page.tsx`](src/app/reputation/page.tsx), which only shows an `EmptyState`. This issue connects the page to the component so that when reputation data exists it renders the rich profile, and otherwise falls back to the empty state, exercising the component's `showPartial` and history branches.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Replace the `any[]` placeholder in [`src/app/reputation/page.tsx`](src/app/reputation/page.tsx) with a typed reputation model and render `ReputationProfile` when a score is present.
- Cover all three states: no reputation (`EmptyState`), score-but-no-history (partial banner), and score-with-history.
- Reuse the existing `ReputationEvent`/`ReputationProfileProps` types exported from the component; do not duplicate them.
- Keep the page rendering accessibly with the existing heading structure.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/reputation-04-render-profile`
- Implement changes
  - **Write code in:** [`src/app/reputation/page.tsx`](src/app/reputation/page.tsx).
  - **Write comprehensive tests in:** [`src/app/reputation/__tests__/page.test.tsx`](src/app/reputation/__tests__/page.test.tsx) (extend) covering all three states.
  - **Add documentation:** update [`docs/components`](docs/components) with the page wiring if a relevant doc exists.
  - Add JSDoc to any new data-shaping helper.
  - Validate a11y against [`ReputationProfile`](src/components/ReputationProfile.tsx) headings.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: empty data, partial data, full history.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(reputation): render ReputationProfile on the reputation page with tests`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Render a real milestones list with status filters on the Milestones page"
labels: type:feature, area:milestones, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Implement a milestones list with status filtering on the Milestones page

### Description
[`src/app/milestones/page.tsx`](src/app/milestones/page.tsx) hard-codes `const milestones: any[] = []` and `handleAddMilestone` only logs to the console, so the existing [`MilestonesList`](src/components/MilestonesList.tsx) component (with its `Pending`/`Completed`/`Paid`/`Disputed` statuses and currency formatting) is never shown on this route. This issue renders real milestones and adds an accessible status filter.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Replace the `any[]` placeholder with a typed `Milestone[]` (reuse the `Milestone` type exported by [`MilestonesList`](src/components/MilestonesList.tsx)) and render the list when non-empty.
- Add a filter control (e.g. an accessible `radiogroup` or `select`) for the four statuses; "All" must be the default and the filter must announce results to assistive tech.
- Keep `EmptyState` for the no-results case and reuse `formatAmount` from [`src/lib/preferences.tsx`](src/lib/preferences.tsx) via `MilestonesList`.
- Do not break the existing snapshot/test conventions in the route's tests.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/milestones-05-list-and-filter`
- Implement changes
  - **Write code in:** [`src/app/milestones/page.tsx`](src/app/milestones/page.tsx) and, if extracted, `src/components/milestones/MilestoneFilter.tsx`.
  - **Write comprehensive tests in:** [`src/app/milestones/__tests__/page.test.tsx`](src/app/milestones/__tests__/page.test.tsx) (extend) covering filtering and empty results.
  - **Add documentation:** add a short note to [`README.md`](README.md) under features.
  - Add JSDoc to any new filter component.
  - Validate a11y: filter group labelling and result announcement.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: empty set, single status, filter returning zero items.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(milestones): render milestones list with accessible status filter and tests`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Add a confirmation dialog for the destructive Dispute and Release Funds actions"
labels: type:feature, area:contracts, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Implement a confirmation dialog for the Dispute and Release Funds actions

### Description
In [`src/components/ActionPanel.tsx`](src/components/ActionPanel.tsx) the "Release Funds" and "Dispute" buttons fire their handlers immediately, and the wired-up handlers in [`src/app/contracts/[id]/page.tsx`](src/app/contracts/%5Bid%5D/page.tsx) are empty stubs. Both are irreversible, money-moving actions and should require explicit confirmation. This issue adds an accessible modal confirmation step before either handler runs.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Create `src/components/ConfirmDialog.tsx` modeled on the focus-trap and Escape handling already implemented in [`SettingsPanel`](src/components/settings/SettingsPanel.tsx) (`role="dialog"`, `aria-modal`, focus return).
- Gate "Release Funds" and "Dispute" in `ActionPanel` behind the dialog; only call `onReleaseFunds`/`onDispute` after confirmation.
- Return focus to the triggering button on cancel/confirm, matching the `SettingsTrigger` focus-return pattern.
- Keep wallet-gating and `disabledReasons` behavior intact.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/contracts-06-confirm-dialog`
- Implement changes
  - **Write code in:** create [`src/components/ConfirmDialog.tsx`](src/components/ConfirmDialog.tsx) and update [`src/components/ActionPanel.tsx`](src/components/ActionPanel.tsx).
  - **Write comprehensive tests in:** [`src/components/__tests__/ConfirmDialog.test.tsx`](src/components/__tests__/ConfirmDialog.test.tsx) — focus trap, Escape, confirm, cancel.
  - **Add documentation:** add `docs/components/ConfirmDialog.md`.
  - Add JSDoc to the dialog props.
  - Validate a11y: focus management and `aria-modal` semantics.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: cancel does not call handler, confirm calls once, Escape closes, focus returns.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(contracts): add accessible confirmation dialog for release/dispute actions`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Add loading and error states to the contract detail page wired to ActionPanel"
labels: type:enhancement, area:contracts, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Implement loading and error states on the contract detail page

### Description
[`src/app/contracts/[id]/page.tsx`](src/app/contracts/%5Bid%5D/page.tsx) renders only static sample data and a fixed `status = 'Active'`, with no loading skeleton or error path — yet [`ActionPanel`](src/components/ActionPanel.tsx) already accepts `isLoading` and `errorMessage` props that are never passed. This issue adds simulated async fetching with proper loading and error UI that drives those existing props.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Introduce a loading state (skeleton/placeholder for `ContractSummary` and `MilestonesList`) while contract data resolves, and an error state that wraps content in [`SafeBoundary`](src/components/SafeBoundary.tsx) or renders an inline alert.
- Pass `isLoading` and `errorMessage` to `ActionPanel` so its disabled/`role="alert"` behavior is exercised by the page.
- Keep the existing two-column responsive grid and headings.
- Avoid introducing a real network dependency; use a typed local async resolver so tests stay deterministic.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/contracts-07-loading-error-states`
- Implement changes
  - **Write code in:** [`src/app/contracts/[id]/page.tsx`](src/app/contracts/%5Bid%5D/page.tsx).
  - **Write comprehensive tests in:** [`src/app/contracts/[id]/__tests__/page.test.tsx`](src/app/contracts/%5Bid%5D/__tests__/page.test.tsx) (extend) for loading, success, and error.
  - **Add documentation:** update [`docs/components/ContractDetail.md`](docs/components/ContractDetail.md).
  - Add JSDoc to the data resolver.
  - Validate a11y: loading is announced, error uses `role="alert"`.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: slow load, resolve error, and successful render.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(contracts): add loading and error states to contract detail page with tests`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Add a global navigation bar linking Contracts, Milestones, and Reputation in the root layout"
labels: type:feature, area:navigation, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Implement a global navigation bar in the root layout

### Description
The header in [`src/app/layout.tsx`](src/app/layout.tsx) shows only the brand and [`WalletConnectButton`](src/components/WalletConnectButton.tsx); there are no links to the `/contracts`, `/milestones`, or `/reputation` routes, so users can only reach them by editing the URL (the [`not-found`](src/app/not-found.tsx) page is currently the only place those links exist). This issue adds an accessible primary navigation with active-route highlighting.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Create `src/components/Navbar.tsx` (client component) using `next/link` and `usePathname` to mark the current route with `aria-current="page"`.
- Mount it in the header in [`src/app/layout.tsx`](src/app/layout.tsx) alongside the existing brand and wallet button without breaking the sticky/backdrop styling.
- Ensure keyboard reachability and visible focus rings consistent with existing components.
- Provide a mobile-friendly layout (no horizontal overflow on small screens).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/navigation-08-global-navbar`
- Implement changes
  - **Write code in:** create [`src/components/Navbar.tsx`](src/components/Navbar.tsx) and update [`src/app/layout.tsx`](src/app/layout.tsx).
  - **Write comprehensive tests in:** [`src/components/__tests__/Navbar.test.tsx`](src/components/__tests__/Navbar.test.tsx) — active route, links present, a11y.
  - **Add documentation:** add `docs/components/Navbar.md`.
  - Add JSDoc to the component.
  - Validate a11y: `aria-current`, focus order, and `jest-axe` clean.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: active highlighting per route, mobile layout, keyboard navigation.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(navigation): add accessible global navbar with active-route highlighting`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Persist and report SafeBoundary errors via a pluggable error reporter"
labels: type:enhancement, area:error-handling, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Implement a pluggable error reporter for SafeBoundary and the route error boundary

### Description
[`src/components/SafeBoundary.tsx`](src/components/SafeBoundary.tsx) and [`src/app/error.tsx`](src/app/error.tsx) only `console.error` in non-production and otherwise swallow errors, so there is no path to capture failures in production. This issue introduces a small, swappable error-reporter abstraction both boundaries call, defaulting to a no-op in production and console in development.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Create `src/lib/errorReporter.ts` exporting a `reportError(error, context)` function with a default dev/console + prod/no-op behavior and a setter to inject a custom reporter.
- Call `reportError` from `componentDidCatch` in [`SafeBoundary`](src/components/SafeBoundary.tsx) and from the `useEffect` in [`src/app/error.tsx`](src/app/error.tsx) (and [`src/app/global-error.tsx`](src/app/global-error.tsx) if applicable).
- Never include PII; pass only the error and a string component/route context.
- Keep existing fallback UIs and the `reset()` behavior unchanged.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/error-handling-09-error-reporter`
- Implement changes
  - **Write code in:** create [`src/lib/errorReporter.ts`](src/lib/errorReporter.ts); update [`src/components/SafeBoundary.tsx`](src/components/SafeBoundary.tsx) and [`src/app/error.tsx`](src/app/error.tsx).
  - **Write comprehensive tests in:** [`src/lib/__tests__/errorReporter.test.ts`](src/lib/__tests__/errorReporter.test.ts) and extend [`src/components/SafeBoundary.test.tsx`](src/components/SafeBoundary.test.tsx).
  - **Add documentation:** document the reporter contract in [`docs/components/Accessibility.md`](docs/components/Accessibility.md) or a new `docs/error-handling.md`.
  - Add JSDoc to `reportError` and the setter.
  - Validate security: no PII, safe in SSR.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: dev vs prod, custom reporter injected, reporter throwing.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(error-handling): add pluggable error reporter for SafeBoundary and route errors`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Add a copy-to-clipboard control and toast feedback to ContractSummary party addresses"
labels: type:enhancement, area:contracts, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Implement copy-to-clipboard for ContractSummary party addresses

### Description
[`src/components/ContractSummary.tsx`](src/components/ContractSummary.tsx) renders each party's address through `truncateAddress`, but the truncated value cannot be copied — users have no way to grab the full address. The [`WalletConnectButton`](src/components/WalletConnectButton.tsx) already implements a copy interaction with a 2-second confirmation; this issue brings the same affordance to each party row with toast feedback.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add an accessible "Copy address" button per party in `ContractSummary`, copying the full (non-truncated) address via `navigator.clipboard`.
- Confirm with `useToast().showSuccess(...)` and an `aria-label`/`title`, reusing the icon-swap pattern from `WalletConnectButton`.
- Handle clipboard failure gracefully with `showError(...)`; guard for environments without `navigator.clipboard`.
- Keep `truncateAddress` for display only.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/contracts-10-copy-party-address`
- Implement changes
  - **Write code in:** [`src/components/ContractSummary.tsx`](src/components/ContractSummary.tsx).
  - **Write comprehensive tests in:** [`src/components/__tests__/ContractSummary.test.tsx`](src/components/__tests__/ContractSummary.test.tsx) (extend) — mock clipboard, success and failure.
  - **Add documentation:** add `docs/components/ContractSummary.md`.
  - Add JSDoc to the copy handler.
  - Validate a11y: button labelling and focus.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: clipboard unavailable, copy rejected, multiple parties.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(contracts): add copy-to-clipboard for ContractSummary addresses with toasts`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Add pause-on-hover and manual-dismiss-on-focus to the toast auto-dismiss timer"
labels: type:enhancement, area:toast, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Improve the toast system with pause-on-hover and focus handling

### Description
In [`src/components/toast/toast-provider.tsx`](src/components/toast/toast-provider.tsx) every toast is auto-dismissed after `DEFAULT_DURATION` (5s) with no way to pause, which fails WCAG 2.2.1 (Timing Adjustable) for users who need longer to read critical wallet/payout messages. This issue adds pause-on-hover and pause-on-focus so the timer halts while the user is interacting and resumes afterward.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Pause the auto-dismiss `setTimeout` while a toast is hovered or focused, and resume (restart or remaining time) on mouse leave/blur.
- Preserve existing behavior: `quietMode` suppression of success toasts, the `aria-live` polite/assertive announcers, and per-toast timer cleanup.
- Keep `showSuccess`/`showError`/`dismissToast` signatures unchanged.
- Respect `prefers-reduced-motion` if any transition is added.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/toast-11-pause-on-hover`
- Implement changes
  - **Write code in:** [`src/components/toast/toast-provider.tsx`](src/components/toast/toast-provider.tsx).
  - **Write comprehensive tests in:** [`src/components/toast/toast-provider.test.tsx`](src/components/toast/toast-provider.test.tsx) (extend) using fake timers — hover pauses, leave resumes, focus pauses.
  - **Add documentation:** update the toast section of [`README.md`](README.md).
  - Add JSDoc to the timer logic.
  - Validate a11y: WCAG 2.2.1 timing adjustable.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: hover during countdown, rapid hover/leave, multiple stacked toasts.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(toast): pause auto-dismiss on hover and focus for accessibility`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Add unit tests for the FormField accessibility prop injection"
labels: type:test, area:forms, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Test the FormField accessibility prop injection

### Description
[`src/components/FormField.tsx`](src/components/FormField.tsx) clones its child to inject `id`, `aria-describedby`, `aria-invalid`, and an error border class, and conditionally renders helper text and a `role="alert"` error — but there is no dedicated test file for it. This issue adds focused tests proving the cloning and ARIA wiring behave correctly.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Assert that the child receives the correct `id`, that `aria-describedby` lists both helper and error IDs when present, and `aria-invalid` flips with `error`.
- Verify the required marker (`*`) is `aria-hidden`, the helper `<p>` has the helper id, and the error `<p>` uses `role="alert"`.
- Confirm existing child `className` is preserved and the error border class is appended only on error.
- Include a `jest-axe` assertion using the helpers in [`src/test-utils/a11y.tsx`](src/test-utils/a11y.tsx).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/forms-12-formfield-tests`
- Implement changes
  - **Write code in:** no source changes expected; if a real bug is found, fix it in [`src/components/FormField.tsx`](src/components/FormField.tsx) and note it.
  - **Write comprehensive tests in:** create [`src/components/__tests__/FormField.test.tsx`](src/components/__tests__/FormField.test.tsx).
  - **Add documentation:** update [`docs/components/Accessibility.md`](docs/components/Accessibility.md) with the tested guarantees.
  - Add JSDoc where behavior is clarified.
  - Validate a11y: axe clean for labelled and errored states.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: no error, error only, helper only, both, and required marker.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`test(forms): add coverage for FormField aria injection and error states`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Add tests for the ErrorSummary focus management and anchor links"
labels: type:test, area:forms, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Test the ErrorSummary focus management and anchor links

### Description
[`src/components/ErrorSummary.tsx`](src/components/ErrorSummary.tsx) focuses itself when errors appear and renders anchor links to each invalid field's `fieldId`, but it has no test coverage. Because it is the accessibility backbone for the home form in [`src/app/page.tsx`](src/app/page.tsx), this behavior must be locked down.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Assert it renders nothing when `errors` is empty, and a `role="alert"` region with `tabIndex={-1}` when errors exist.
- Verify the container receives focus on the transition from zero to non-zero errors (use a wrapper that updates `errors`).
- Verify each list item links to `#<fieldId>` with the error message text.
- Add a `jest-axe` check via [`src/test-utils/a11y.tsx`](src/test-utils/a11y.tsx).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/forms-13-errorsummary-tests`
- Implement changes
  - **Write code in:** no source change expected unless a bug is found in [`src/components/ErrorSummary.tsx`](src/components/ErrorSummary.tsx).
  - **Write comprehensive tests in:** create [`src/components/__tests__/ErrorSummary.test.tsx`](src/components/__tests__/ErrorSummary.test.tsx).
  - **Add documentation:** note the behavior in [`docs/components/Accessibility.md`](docs/components/Accessibility.md).
  - Add JSDoc clarifications if needed.
  - Validate a11y: axe clean and focus moves to the summary.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: empty errors, single error, duplicate `fieldId`s (keyed correctly), re-focus on error change.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`test(forms): cover ErrorSummary focus handling and anchor links`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Add tests for the preferences formatAmount currency and compact-notation logic"
labels: type:test, area:preferences, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Test the preferences formatAmount currency and compact-notation logic

### Description
[`src/lib/preferences.tsx`](src/lib/preferences.tsx) exposes `formatAmount`, which branches on `amountFormat` (`usd`, `ngn`, `compact`) to pick locale and `Intl.NumberFormat` options, plus a fallback path when used outside a provider. The existing [`preferences.test.tsx`](src/lib/__tests__/preferences.test.tsx) should be extended to fully cover this money-formatting logic that drives [`MilestonesList`](src/components/MilestonesList.tsx) and [`ContractSummary`](src/components/ContractSummary.tsx).

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Cover all three `amountFormat` branches: USD passthrough, NGN override (currency + `en-NG`), and compact notation.
- Verify the out-of-provider fallback returns a USD-formatted string and a no-op `updatePreference`.
- Verify a custom `currency` arg is respected for non-NGN formats.
- Keep assertions locale-robust (compare formatted output, not raw locale internals where brittle).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/preferences-14-formatamount-tests`
- Implement changes
  - **Write code in:** no source change expected unless a bug is found in [`src/lib/preferences.tsx`](src/lib/preferences.tsx).
  - **Write comprehensive tests in:** [`src/lib/__tests__/preferences.test.tsx`](src/lib/__tests__/preferences.test.tsx) (extend).
  - **Add documentation:** update [`docs/components/Preferences.md`](docs/components/Preferences.md).
  - Add JSDoc to `formatAmount` clarifying branches.
  - Validate behavior across the three formats.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: zero amount, large amount (compact), NGN override, explicit currency arg.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`test(preferences): cover formatAmount currency, compact, and fallback branches`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Add tests for WalletContext connect, disconnect, and error states"
labels: type:test, area:wallet, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Test the WalletContext connect, disconnect, and error states

### Description
[`src/contexts/WalletContext.tsx`](src/contexts/WalletContext.tsx) drives wallet gating across [`WalletConnectButton`](src/components/WalletConnectButton.tsx) and [`ActionPanel`](src/components/ActionPanel.tsx), yet it has no dedicated test file. This issue adds tests for the provider state machine — connecting, connected, disconnect, and the `useWallet` outside-provider guard.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Test that `connect()` sets `isConnecting` true then resolves to an `address`, using fake timers for the simulated delay.
- Test that `disconnect()` clears the address and that `error` is reset on a new `connect()`.
- Test that calling `useWallet()` outside `WalletProvider` throws the documented error.
- Use a small test consumer component and `@testing-library/react`.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/wallet-15-walletcontext-tests`
- Implement changes
  - **Write code in:** no source change expected unless a real bug is found in [`src/contexts/WalletContext.tsx`](src/contexts/WalletContext.tsx).
  - **Write comprehensive tests in:** create [`src/contexts/__tests__/WalletContext.test.tsx`](src/contexts/__tests__/WalletContext.test.tsx).
  - **Add documentation:** add a "Wallet context" note to [`README.md`](README.md).
  - Add JSDoc to the exported hook if missing.
  - Validate the throw-outside-provider contract.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: double connect, disconnect before connect, error-then-retry.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`test(wallet): cover WalletContext connect/disconnect/error and provider guard`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Add edge-case tests for truncateAddress prefix and suffix boundaries"
labels: type:test, area:utils, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Test truncateAddress prefix and suffix boundary behavior

### Description
[`src/lib/truncateAddress.ts`](src/lib/truncateAddress.ts) shortens addresses for [`ContractSummary`](src/components/ContractSummary.tsx) and [`WalletConnectButton`](src/components/WalletConnectButton.tsx), with a short-circuit when the value is at or below `prefixLength + suffixLength + 3`. The existing [`truncateAddress.test.ts`](src/lib/__tests__/truncateAddress.test.ts) should be extended to nail down the boundary and custom-length cases.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Cover: empty string returns empty, a string shorter than the threshold returns unchanged, and a long string returns `prefix...suffix`.
- Test the exact boundary length (`prefixLength + suffixLength + 3`) on both sides.
- Test custom `prefixLength`/`suffixLength` arguments.
- Keep assertions deterministic and independent of any specific address format.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/utils-16-truncateaddress-edges`
- Implement changes
  - **Write code in:** no source change expected unless a real bug is found in [`src/lib/truncateAddress.ts`](src/lib/truncateAddress.ts).
  - **Write comprehensive tests in:** [`src/lib/__tests__/truncateAddress.test.ts`](src/lib/__tests__/truncateAddress.test.ts) (extend).
  - **Add documentation:** add a brief usage note in [`README.md`](README.md) if helpful.
  - Add JSDoc to the function describing the threshold.
  - Validate determinism across inputs.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: empty, exactly-at-threshold, one over, custom lengths.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`test(utils): add boundary and custom-length tests for truncateAddress`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Add tests for the SettingsPanel focus trap and Escape-to-close behavior"
labels: type:test, area:settings, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Test the SettingsPanel focus trap and Escape-to-close behavior

### Description
[`src/components/settings/SettingsPanel.tsx`](src/components/settings/SettingsPanel.tsx) implements a modal drawer with a manual focus trap (Tab/Shift+Tab wrap), initial focus on the close button, and Escape-to-close. The existing [`SettingsPanel.test.tsx`](src/components/settings/__tests__/SettingsPanel.test.tsx) should be extended to fully cover this keyboard interaction, which is the project's reference dialog pattern.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Test that opening focuses the close button, that Escape calls `onClose`, and that Tab from the last focusable wraps to the first (and Shift+Tab from first wraps to last).
- Test that toggling theme/currency/density/quiet-mode calls `updatePreference` with the expected key/value.
- Wrap renders in `PreferencesProvider` from [`src/lib/preferences.tsx`](src/lib/preferences.tsx).
- Add a `jest-axe` assertion for the open dialog.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/settings-17-settingspanel-focus-trap`
- Implement changes
  - **Write code in:** no source change expected unless a real bug is found in [`src/components/settings/SettingsPanel.tsx`](src/components/settings/SettingsPanel.tsx).
  - **Write comprehensive tests in:** [`src/components/settings/__tests__/SettingsPanel.test.tsx`](src/components/settings/__tests__/SettingsPanel.test.tsx) (extend).
  - **Add documentation:** update [`docs/components/SettingsPanel.md`](docs/components/SettingsPanel.md).
  - Add JSDoc to the focus-trap effect.
  - Validate a11y: `role="dialog"`, `aria-modal`, axe clean.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: Tab wrap both directions, Escape, closed state renders nothing.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`test(settings): cover SettingsPanel focus trap, Escape, and preference toggles`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Harden preferences localStorage parsing against malformed and prototype-polluting input"
labels: type:security, area:preferences, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Harden preferences localStorage parsing against malformed input

### Description
[`src/lib/preferences.tsx`](src/lib/preferences.tsx) reads `localStorage` and does `setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(saved) })`, trusting whatever is stored under `talenttrust-user-preferences`. A tampered or corrupted value can inject unknown keys (and an `__proto__` payload via the spread) or invalid enum values that then drive theme/currency rendering. This issue validates and sanitizes the parsed object before it is applied.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Whitelist only known keys (`theme`, `amountFormat`, `toastDensity`, `quietMode`) and validate each value against its allowed set before merging.
- Drop unknown keys and reject `__proto__`/`constructor` keys to avoid prototype pollution from the spread merge.
- Keep the existing try/catch and fall back to `DEFAULT_PREFERENCES` on any failure; preserve the hydration flag behavior.
- Add a pure `sanitizePreferences(raw): UserPreferences` helper for testability.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b security/preferences-18-sanitize-storage`
- Implement changes
  - **Write code in:** [`src/lib/preferences.tsx`](src/lib/preferences.tsx) (and optionally extract `sanitizePreferences`).
  - **Write comprehensive tests in:** [`src/lib/__tests__/preferences.test.tsx`](src/lib/__tests__/preferences.test.tsx) (extend) — malformed JSON, unknown keys, invalid enums, `__proto__` payload.
  - **Add documentation:** add a "Security" note to [`docs/components/Preferences.md`](docs/components/Preferences.md).
  - Add JSDoc to the sanitizer.
  - Validate security: no prototype pollution, no invalid enum reaches state.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: empty string, non-JSON, array payload, malicious keys, partial valid object.
- Include the full `npm test` output and a short **security notes** section in the PR description.

### Example commit message
`fix(security): sanitize preferences from localStorage to prevent pollution`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Add a Content Security Policy and security headers via next.config.js"
labels: type:security, area:headers, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Harden the app with a Content Security Policy and security headers

### Description
[`next.config.js`](next.config.js) ships with no `headers()` configuration, so the deployed app sends none of the standard browser-hardening headers. For a freelance payments app handling wallet addresses, missing CSP, `X-Frame-Options`, and HSTS are real risks (clickjacking, mixed content, injection). This issue adds a security-headers policy through Next.js config.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add an async `headers()` in [`next.config.js`](next.config.js) setting at least: `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and `Strict-Transport-Security`.
- Scope the CSP to what the app actually loads (self, inline styles required by Next, the wallet origin if applicable); avoid breaking the dev server.
- Document any unavoidable `unsafe-inline` and a path to tighten it later.
- Verify the headers locally with `npm run build` + `npm start` and a curl/devtools check.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b security/headers-19-csp-headers`
- Implement changes
  - **Write code in:** [`next.config.js`](next.config.js).
  - **Write comprehensive tests in:** create [`src/__tests__/securityHeaders.test.ts`](src/__tests__/securityHeaders.test.ts) asserting the headers array shape from the exported config (or a small extracted helper).
  - **Add documentation:** add a "Security headers" section to [`README.md`](README.md).
  - Add comments documenting each directive.
  - Validate security: no broken assets, CSP report-only path described.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`; then `npm start` and confirm headers.
- Cover edge cases: dev vs prod, static assets still load, frame embedding blocked.
- Include the full `npm test` output and a short **security notes** section in the PR description.

### Example commit message
`feat(security): add CSP and hardening headers via next.config headers()`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Validate and sanitize the contract id route param before rendering it"
labels: type:security, area:contracts, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Harden the contract detail route against unvalidated id params

### Description
[`src/app/contracts/[id]/page.tsx`](src/app/contracts/%5Bid%5D/page.tsx) renders `params.id` directly into the heading (`Contract #{params.id}`) and would forward it to any future lookup without validation. An arbitrary, oversized, or malformed id should be rejected with a not-found path rather than reflected. This issue adds id validation and a safe fallback.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add a pure `isValidContractId(id): boolean` (e.g. allowed charset and a max length) in `src/lib/validateContractId.ts`.
- In the page, reject invalid ids by calling `notFound()` from `next/navigation` so the existing [`not-found`](src/app/not-found.tsx) UI is shown.
- Ensure the displayed id is the validated value; never render raw untrusted input beyond what validation permits.
- Keep the existing layout and "Back to contracts" link intact for valid ids.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b security/contracts-20-validate-id-param`
- Implement changes
  - **Write code in:** create [`src/lib/validateContractId.ts`](src/lib/validateContractId.ts); update [`src/app/contracts/[id]/page.tsx`](src/app/contracts/%5Bid%5D/page.tsx).
  - **Write comprehensive tests in:** [`src/lib/__tests__/validateContractId.test.ts`](src/lib/__tests__/validateContractId.test.ts) and extend [`src/app/contracts/[id]/__tests__/page.test.tsx`](src/app/contracts/%5Bid%5D/__tests__/page.test.tsx).
  - **Add documentation:** note the validation rule in [`docs/components/ContractDetail.md`](docs/components/ContractDetail.md).
  - Add JSDoc to the validator.
  - Validate security: no reflected injection, bounded length.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: valid id, empty, oversized, special characters, path-like input.
- Include the full `npm test` output and a short **security notes** section in the PR description.

### Example commit message
`fix(security): validate contract id route param and fall back to notFound`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Add a dependency and lint audit step to the CI workflow"
labels: type:security, area:ci, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Harden CI with a dependency and lint audit step

### Description
The CI workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs install, lint, build, and test, but never audits dependencies for known vulnerabilities. For an app that handles payments and wallet data, a supply-chain check belongs in the pipeline. This issue adds an `npm audit` gate and pins the audit threshold.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add an `npm audit --audit-level=high` (or `--production` scoped) step to [`.github/workflows/ci.yml`](.github/workflows/ci.yml) that fails the build on high/critical advisories.
- Keep the existing lint/build/test steps and the Node 20 + npm cache setup unchanged.
- Document how to triage and waive an unavoidable advisory.
- Ensure the step does not flake on transient registry errors (allow a retry or clear failure message).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b security/ci-21-dependency-audit`
- Implement changes
  - **Write code in:** [`.github/workflows/ci.yml`](.github/workflows/ci.yml).
  - **Write comprehensive tests in:** validate locally by running `npm audit --audit-level=high`; capture output in the PR (workflow steps are not unit-testable here).
  - **Add documentation:** add a "Security audits" subsection to the CI part of [`README.md`](README.md).
  - Add inline comments in the workflow.
  - Validate security: high/critical advisories block merges.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`, and `npm audit --audit-level=high` locally.
- Cover edge cases: clean tree passes, simulated high advisory fails, transient error messaging.
- Include the audit output and a short **security notes** section in the PR description.

### Example commit message
`ci(security): add npm audit gate for high and critical advisories`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Document the project architecture, routes, and state providers in the README"
labels: type:docs, area:docs, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Document the project architecture, routes, and state providers

### Description
[`README.md`](README.md) covers setup, scripts, and the toast system, but does not explain the route map (`/`, `/contracts`, `/contracts/[id]`, `/milestones`, `/reputation`) or the provider stack (`PreferencesProvider` → `ToastProvider` → `WalletProvider`) wired in [`src/app/layout.tsx`](src/app/layout.tsx). This issue adds an architecture section so contributors can orient quickly.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add an "Architecture" section to [`README.md`](README.md): the App Router route table, the provider nesting order and why it matters, and where shared components live.
- Reference the real provider files [`src/lib/preferences.tsx`](src/lib/preferences.tsx), [`src/components/toast/toast-provider.tsx`](src/components/toast/toast-provider.tsx), and [`src/contexts/WalletContext.tsx`](src/contexts/WalletContext.tsx).
- Keep it accurate to current code (note which pages are placeholders).
- Do not introduce broken relative links.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b docs/docs-22-architecture-readme`
- Implement changes
  - **Write code in:** documentation only — [`README.md`](README.md).
  - **Write comprehensive tests in:** not applicable; instead verify all referenced paths exist.
  - **Add documentation:** the README architecture section is the deliverable.
  - Add a route table and provider diagram (text/ascii acceptable).
  - Validate that links resolve and descriptions match the code.
- Test and commit

### Test and commit
- Run `npm run lint` and `npm run build` to confirm nothing else broke.
- Cover edge cases: links resolve, provider order matches `layout.tsx`, placeholder pages flagged.
- Include a rendered preview note in the PR description.

### Example commit message
`docs: add architecture, route map, and provider overview to README`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules (documentation accuracy verified instead where no code changes).
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Write a contributor and testing guide covering Jest, jest-axe, and the a11y test utils"
labels: type:docs, area:docs, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Document the testing workflow and accessibility test utilities

### Description
The repo has rich test infrastructure — [`jest.config.js`](jest.config.js), [`jest.setup.js`](jest.setup.js), and the `jest-axe` helpers in [`src/test-utils/a11y.tsx`](src/test-utils/a11y.tsx) — but no guide explaining how to write tests or use `testA11y`/`assertNoA11yViolations`. This issue adds a CONTRIBUTING/testing guide so new contributors follow the established patterns.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Create `CONTRIBUTING.md` (or a `docs/testing.md`) covering: running tests, the `@/` module alias from [`jest.config.js`](jest.config.js), and how to assert accessibility with [`src/test-utils/a11y.tsx`](src/test-utils/a11y.tsx).
- Reference an existing example test such as [`src/components/__tests__/a11y.test.tsx`](src/components/__tests__/a11y.test.tsx).
- Document the 95% coverage expectation and the fork → branch → PR flow already implied by [`README.md`](README.md) and CI.
- Keep links accurate and avoid duplicating the README verbatim.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b docs/docs-23-testing-guide`
- Implement changes
  - **Write code in:** documentation only — create [`CONTRIBUTING.md`](CONTRIBUTING.md).
  - **Write comprehensive tests in:** not applicable; verify all example snippets compile against current utils.
  - **Add documentation:** the contributing/testing guide is the deliverable.
  - Add a sample a11y test snippet using `testA11y`.
  - Validate that referenced files and helpers exist.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build` to confirm examples are valid.
- Cover edge cases: alias usage correct, axe helper imported correctly, links resolve.
- Include a short summary in the PR description.

### Example commit message
`docs: add contributing and testing guide covering jest-axe a11y utils`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules (example snippets verified where no code changes).
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Add JSDoc and a component doc for the ActionPanel disabledReasons and loading API"
labels: type:docs, area:contracts, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Document the ActionPanel disabledReasons and loading/error API

### Description
[`src/components/ActionPanel.tsx`](src/components/ActionPanel.tsx) has a nuanced API — `isLoading`, `errorMessage`, and per-action `disabledReasons` that drive `aria-describedby` and screen-reader-only reasons — but no doc explains it, and the existing [`docs/components/ActionPanel.md`](docs/components/ActionPanel.md) may not reflect these props. This issue documents the full prop contract and accessibility behavior.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Update [`docs/components/ActionPanel.md`](docs/components/ActionPanel.md) to describe every prop, the status → button mapping in `getActionButtons`, and how `disabledReasons`/`isLoading` map to `aria-describedby` ids.
- Add JSDoc comments to the `ActionPanelProps` and `ActionPanelDisabledReasons` types in the source.
- Include a usage example mirroring [`src/app/contracts/[id]/page.tsx`](src/app/contracts/%5Bid%5D/page.tsx).
- Keep documentation in sync with the current wallet-gating behavior.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b docs/contracts-24-actionpanel-jsdoc`
- Implement changes
  - **Write code in:** add JSDoc in [`src/components/ActionPanel.tsx`](src/components/ActionPanel.tsx).
  - **Write comprehensive tests in:** not applicable beyond existing [`src/components/__tests__/ActionPanel.test.tsx`](src/components/__tests__/ActionPanel.test.tsx); ensure it still passes.
  - **Add documentation:** update [`docs/components/ActionPanel.md`](docs/components/ActionPanel.md).
  - Add a copy-pasteable usage example.
  - Validate that documented a11y ids match the source.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: documented ids exist, example compiles, status mapping accurate.
- Include a short summary in the PR description.

### Example commit message
`docs(contracts): document ActionPanel props, disabledReasons, and a11y wiring`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Document the EmptyState variants and usage across the placeholder pages"
labels: type:docs, area:components, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Document the EmptyState component variants and usage

### Description
[`src/components/EmptyState.tsx`](src/components/EmptyState.tsx) supports three illustration variants (`contracts`, `milestones`, `reputation`), primary/secondary actions, and a custom icon, and is used on all three placeholder pages. The existing [`docs/components/EmptyState.md`](docs/components/EmptyState.md) should be expanded to fully document the API and the accessible region/heading pattern.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Update [`docs/components/EmptyState.md`](docs/components/EmptyState.md) to cover every prop, the variant → styling map, and the `role="region"` + `useId` heading association.
- Reference real usages: [`contracts/page.tsx`](src/app/contracts/page.tsx), [`milestones/page.tsx`](src/app/milestones/page.tsx), [`reputation/page.tsx`](src/app/reputation/page.tsx).
- Add JSDoc to `EmptyStateProps` in the source.
- Include a usage example for each variant.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b docs/components-25-emptystate-docs`
- Implement changes
  - **Write code in:** add JSDoc in [`src/components/EmptyState.tsx`](src/components/EmptyState.tsx).
  - **Write comprehensive tests in:** ensure [`src/components/__tests__/EmptyState.test.tsx`](src/components/__tests__/EmptyState.test.tsx) still passes; add a case if a prop is undocumented/untested.
  - **Add documentation:** update [`docs/components/EmptyState.md`](docs/components/EmptyState.md).
  - Add per-variant examples.
  - Validate that documented props match the source.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: no actions, primary only, both actions, custom icon vs illustration.
- Include a short summary in the PR description.

### Example commit message
`docs(components): document EmptyState variants, actions, and a11y region`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Add a skip-to-content link in the root layout for keyboard users"
labels: type:a11y, area:navigation, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add a skip-to-content link in the root layout

### Description
[`src/app/layout.tsx`](src/app/layout.tsx) renders a sticky header with the brand and wallet button before the `<main>`, but there is no skip link, so keyboard and screen-reader users must tab through the header on every page (WCAG 2.4.1 Bypass Blocks). This issue adds a visually-hidden skip link that becomes visible on focus and jumps to the main content.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add a skip link as the first focusable element in `<body>` that targets the main region (give `<main>` an `id` and `tabIndex={-1}` as needed).
- The link must be visually hidden until focused, then visible with a clear focus style consistent with existing focus rings.
- Do not disturb the sticky header layout or the `SettingsTrigger` floating button.
- Verify it works on every route (it lives in the shared layout).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b a11y/navigation-26-skip-to-content`
- Implement changes
  - **Write code in:** [`src/app/layout.tsx`](src/app/layout.tsx) (and `globals.css` if a utility class is needed).
  - **Write comprehensive tests in:** create [`src/app/__tests__/layout.test.tsx`](src/app/__tests__/layout.test.tsx) asserting the skip link exists, targets main, and is first in tab order.
  - **Add documentation:** note the skip link in [`docs/components/Accessibility.md`](docs/components/Accessibility.md).
  - Add a comment explaining the visually-hidden-on-blur pattern.
  - Validate a11y: WCAG 2.4.1 and `jest-axe` clean.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: focus reveals link, activation moves focus to main, hidden when blurred.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(a11y): add skip-to-content link in root layout for keyboard users`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Audit and fix dark-theme color contrast across themed components"
labels: type:a11y, area:theming, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Improve dark-theme color contrast across themed components

### Description
[`src/app/globals.css`](src/app/globals.css) defines a `[data-theme='dark']` palette applied by [`src/lib/preferences.tsx`](src/lib/preferences.tsx), but several components — notably the toast panels in [`toast-provider.tsx`](src/components/toast/toast-provider.tsx) which mix CSS-variable surfaces with hard-coded `text-slate-600` descriptions — were styled for light mode. This issue audits text/background contrast in dark mode against WCAG AA and fixes the failures.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Identify dark-mode contrast failures (AA: 4.5:1 body, 3:1 large text) in toast panels, badges, and any component using fixed `slate`/`gray` colors over themed surfaces.
- Replace hard-coded colors with the existing CSS variables in [`globals.css`](src/app/globals.css) or adjust the dark palette where needed.
- Do not regress the light theme; verify both `data-theme` values.
- Document the contrast ratios you fixed.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b a11y/theming-27-dark-contrast`
- Implement changes
  - **Write code in:** [`src/app/globals.css`](src/app/globals.css), [`src/components/toast/toast-provider.tsx`](src/components/toast/toast-provider.tsx), and any other offending component.
  - **Write comprehensive tests in:** extend the relevant component tests and/or [`src/components/__tests__/a11y.test.tsx`](src/components/__tests__/a11y.test.tsx) to render in dark mode and run `jest-axe`.
  - **Add documentation:** record the audit in [`docs/components/Accessibility.md`](docs/components/Accessibility.md).
  - Add comments where a variable replaced a fixed color.
  - Validate a11y: AA contrast in both themes.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: light theme unchanged, dark theme passes, success and error toasts.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`fix(a11y): meet WCAG AA contrast in dark theme for toasts and themed components`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Manage route-change focus so screen readers announce page navigation"
labels: type:a11y, area:navigation, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Improve route-change focus management for screen readers

### Description
The App Router pages link between `/`, `/contracts`, `/contracts/[id]`, `/milestones`, and `/reputation` via `next/link` (see [`not-found.tsx`](src/app/not-found.tsx) and [`contracts/[id]/page.tsx`](src/app/contracts/%5Bid%5D/page.tsx)), but client-side navigation does not move focus or announce the new page, so screen-reader users get no feedback (WCAG 2.4.3). This issue adds a focus/announcement mechanism on route change in the shared layout.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Create a small client component (e.g. `src/components/RouteAnnouncer.tsx`) that, on `usePathname` change, moves focus to the main heading/region and announces the route via an `aria-live` region.
- Mount it in [`src/app/layout.tsx`](src/app/layout.tsx) inside the providers.
- Ensure focus lands predictably (main region with `tabIndex={-1}`) and does not fight the skip link if present.
- Keep it SSR-safe and side-effect-free on the server.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b a11y/navigation-28-route-announcer`
- Implement changes
  - **Write code in:** create [`src/components/RouteAnnouncer.tsx`](src/components/RouteAnnouncer.tsx); update [`src/app/layout.tsx`](src/app/layout.tsx).
  - **Write comprehensive tests in:** [`src/components/__tests__/RouteAnnouncer.test.tsx`](src/components/__tests__/RouteAnnouncer.test.tsx) — pathname change moves focus and updates the live region.
  - **Add documentation:** note the behavior in [`docs/components/Accessibility.md`](docs/components/Accessibility.md).
  - Add JSDoc to the component.
  - Validate a11y: WCAG 2.4.3, no double-announcement.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: initial mount (no spurious announce), repeated navigations, same-path re-render.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(a11y): announce and focus main on route change for screen readers`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Extract shared status-badge styling used across MilestonesList and ContractSummary"
labels: type:refactor, area:components, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Refactor the duplicated status-badge styling into a shared StatusBadge

### Description
Both [`src/components/MilestonesList.tsx`](src/components/MilestonesList.tsx) and [`src/components/ContractSummary.tsx`](src/components/ContractSummary.tsx) define near-identical `statusColors`/`statusStyles` maps and render the same pill markup for `Pending`/`Completed`/`Disputed` (plus `Paid`/`Active`). This duplication drifts easily. This issue extracts a single typed `StatusBadge` component and shared status-color map.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Create `src/components/StatusBadge.tsx` with a union of all statuses used by both components and a single color map; render the rounded pill markup once.
- Replace the inline maps and spans in [`MilestonesList`](src/components/MilestonesList.tsx) and [`ContractSummary`](src/components/ContractSummary.tsx) with `StatusBadge`.
- Preserve the exact visual output (same Tailwind classes per status) to avoid snapshot churn beyond intended changes.
- Keep all existing prop types and exports stable.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b refactor/components-29-status-badge`
- Implement changes
  - **Write code in:** create [`src/components/StatusBadge.tsx`](src/components/StatusBadge.tsx); update [`src/components/MilestonesList.tsx`](src/components/MilestonesList.tsx) and [`src/components/ContractSummary.tsx`](src/components/ContractSummary.tsx).
  - **Write comprehensive tests in:** create [`src/components/__tests__/StatusBadge.test.tsx`](src/components/__tests__/StatusBadge.test.tsx); keep [`MilestonesList.test.tsx`](src/components/__tests__/MilestonesList.test.tsx) and [`ContractSummary.test.tsx`](src/components/__tests__/ContractSummary.test.tsx) green.
  - **Add documentation:** add `docs/components/StatusBadge.md`.
  - Add JSDoc to the component props.
  - Validate that rendered classes are unchanged per status.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: every status value, unknown status guarded by the type, snapshot parity.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`refactor(components): extract shared StatusBadge and status-color map`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Fix the toast id counter mutation during render in toast-provider"
labels: type:refactor, area:toast, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Refactor toast id generation to avoid mutating a ref during render

### Description
In [`src/components/toast/toast-provider.tsx`](src/components/toast/toast-provider.tsx), `createToast` generates ids with `nextIdRef.current += 1` inside the `setToasts` updater path, mutating a ref as a side effect of the create flow. This is fragile under React's concurrent/StrictMode double-invocation and can produce duplicate or skipped ids. This issue makes id generation deterministic and side-effect-safe.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Replace the in-place ref increment with a collision-free id strategy (e.g. derive from a functional-update counter, or `crypto.randomUUID()` with a fallback) so ids are unique even under double invocation.
- Preserve the public API (`showSuccess`/`showError` returning an id, `dismissToast`) and the existing timer/cleanup logic.
- Keep `quietMode` returning the sentinel `'suppressed'` value behavior intact.
- Ensure StrictMode does not create duplicate toasts.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b refactor/toast-30-id-generation`
- Implement changes
  - **Write code in:** [`src/components/toast/toast-provider.tsx`](src/components/toast/toast-provider.tsx).
  - **Write comprehensive tests in:** [`src/components/toast/toast-provider.test.tsx`](src/components/toast/toast-provider.test.tsx) (extend) — unique ids across rapid creates, StrictMode double render, dismissal by returned id.
  - **Add documentation:** update the toast section of [`README.md`](README.md) if the id contract is described.
  - Add JSDoc to the id helper.
  - Validate that no duplicate ids occur under StrictMode.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: many rapid toasts, StrictMode, dismiss-by-id, quietMode suppression.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`refactor(toast): generate unique toast ids without mutating a ref in render`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.