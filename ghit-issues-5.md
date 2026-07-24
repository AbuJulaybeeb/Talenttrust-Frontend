---
type: Feature
title: "Wire ContractProgress into the contract detail page so escrow metrics render from real milestones"
labels: type:feature, area:contract-detail, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Wire ContractProgress into the contract detail page so escrow metrics render from real milestones

### Description
The `ContractProgress` component in [`src/components/ContractProgress.tsx`](src/components/ContractProgress.tsx) derives `completedCount`, `paidAmount`, and `outstandingAmount` from a `Milestone[]` and renders an accessible `role="progressbar"` panel, but nothing on the contract detail route at [`src/app/contracts/[id]/page.tsx`](src/app/contracts/[id]/page.tsx) actually mounts it. As a result the page shows no escrow progress at all. This issue wires `ContractProgress` into the detail page, fed by the milestones that belong to the resolved contract.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Resolve the contract via the existing id-validation path and load its milestones (from the repository in [`src/lib/repository.ts`](src/lib/repository.ts) or the page's current data source).
- Render `<ContractProgress milestones={...} />` alongside the existing `ContractSummary`/`ActionPanel` layout, handling the empty-milestones case gracefully.
- Keep the currency consistent with the contract by passing milestones whose `currency` matches; do not hardcode USD in the page.
- Preserve loading and error states already present on the detail page.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/contract-detail-progress-wiring`
- Implement changes
  - **Write code in:** [`src/app/contracts/[id]/page.tsx`](src/app/contracts/[id]/page.tsx), reusing [`src/components/ContractProgress.tsx`](src/components/ContractProgress.tsx).
  - **Write comprehensive tests in:** [`src/app/contracts/[id]/__tests__/page.test.tsx`](src/app/contracts/[id]/__tests__/page.test.tsx) — assert the progress bar renders, percentage matches the milestone mix, and the empty state is handled.
  - **Add documentation:** note the detail-page composition in the README or component docs.
  - Add JSDoc to any new helper that maps a contract to its milestones.
  - Validate a11y: the `role="progressbar"` values and screen-reader text remain correct after wiring.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: zero milestones, all paid, none paid, and mixed currencies.

### Example commit message
`feat: render ContractProgress on the contract detail page from real milestones`

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
title: "Replace the mocked Ethereum wallet address in WalletContext with a Stellar G-address"
labels: type:refactor, area:wallet, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Replace the mocked Ethereum wallet address in WalletContext with a Stellar G-address

### Description
`connect()` in [`src/contexts/WalletContext.tsx`](src/contexts/WalletContext.tsx) sets a mocked Ethereum-style address `'0x71C7656EC7ab88b098defB751B7401B5f6d8976F'`. TalentTrust is a Stellar escrow protocol, so the mocked identity should be a valid Stellar public key (G-address) that passes `isValidStellarAddress` in [`src/lib/stellarAddress.ts`](src/lib/stellarAddress.ts). This keeps the mocked dev experience consistent with the real chain and unblocks downstream address validation/formatting.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Swap the mocked address for a syntactically valid 56-character `G...` base32 key that passes `isValidStellarAddress`.
- Keep the mocked connect delay and error-handling flow intact.
- Do not introduce the Stellar SDK in this issue; only the literal value and any constant change.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b refactor/wallet-stellar-mock-address`
- Implement changes
  - **Write code in:** [`src/contexts/WalletContext.tsx`](src/contexts/WalletContext.tsx), validated against [`src/lib/stellarAddress.ts`](src/lib/stellarAddress.ts).
  - **Write comprehensive tests in:** [`src/contexts/__tests__/WalletContext.test.tsx`](src/contexts/__tests__/WalletContext.test.tsx) — assert the connected address is a valid Stellar key.
  - **Add documentation:** update the WalletContext docs to reflect the Stellar mock.
  - Add JSDoc noting the value is a mock pending real Freighter integration.
  - Validate security: confirm no real secret/seed is ever embedded.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: connect sets a valid G-address, disconnect clears it.

### Example commit message
`refactor: use a valid Stellar G-address for the mocked wallet connection`

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
title: "Persist the connected wallet address across reloads via safeStorage"
labels: type:feature, area:wallet, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Persist the connected wallet address across reloads via safeStorage

### Description
`WalletProvider` in [`src/contexts/WalletContext.tsx`](src/contexts/WalletContext.tsx) keeps the connected `address` in React state only, so a page refresh drops the connection and forces users to reconnect. This issue persists the connected address through the existing `safeStorage` wrapper in [`src/lib/safeStorage.ts`](src/lib/safeStorage.ts) and rehydrates it on mount, while keeping the idle-disconnect logic and SSR safety intact.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- On `connect`, write the address to storage; on `disconnect` (including idle timeout), remove it.
- Rehydrate on mount only on the client, guarded by `typeof window` checks, with no hydration mismatch.
- Reuse `getItem`/`setItem` from [`src/lib/safeStorage.ts`](src/lib/safeStorage.ts); never touch `localStorage` directly.
- Respect the existing idle-disconnect timer so a stale persisted session still expires.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/wallet-persist-address`
- Implement changes
  - **Write code in:** [`src/contexts/WalletContext.tsx`](src/contexts/WalletContext.tsx), using [`src/lib/safeStorage.ts`](src/lib/safeStorage.ts).
  - **Write comprehensive tests in:** [`src/contexts/__tests__/WalletContext.test.tsx`](src/contexts/__tests__/WalletContext.test.tsx) — assert rehydration, clearing on disconnect, and SSR-safety.
  - **Add documentation:** update the WalletContext docs with the persistence contract.
  - Add JSDoc on the storage key and rehydration effect.
  - Validate security: only a public address is stored, never secrets.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: rehydrate on mount, clear on disconnect, storage-error fallback.

### Example commit message
`feat: persist and rehydrate the connected wallet address via safeStorage`

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
title: "Surface WalletContext connection errors as an accessible toast and inline alert"
labels: type:enhancement, area:wallet, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Surface WalletContext connection errors as an accessible toast and inline alert

### Description
When `connect()` in [`src/contexts/WalletContext.tsx`](src/contexts/WalletContext.tsx) fails it sets `error` to `'Failed to connect wallet'`, but the only consumer that reads this state is limited and nothing announces the failure through the toast system. This issue surfaces connection failures via `showError` from the toast provider in [`src/components/toast/toast-provider.tsx`](src/components/toast/toast-provider.tsx) so screen-reader users hear an assertive announcement, while keeping the existing inline `error` state for the button.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- On a failed connect, call `showError` with a clear title/description in addition to setting `error`.
- Avoid duplicate announcements when the same failure is also rendered inline.
- Keep `isConnecting` and the success path unchanged.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/wallet-connect-error-toast`
- Implement changes
  - **Write code in:** [`src/contexts/WalletContext.tsx`](src/contexts/WalletContext.tsx), using [`src/components/toast/toast-provider.tsx`](src/components/toast/toast-provider.tsx).
  - **Write comprehensive tests in:** [`src/contexts/__tests__/WalletContext.test.tsx`](src/contexts/__tests__/WalletContext.test.tsx) — assert an error toast fires on failure and not on success.
  - **Add documentation:** update the WalletContext docs to describe error reporting behavior.
  - Add JSDoc on the error path.
  - Validate a11y: error toasts use `role="alert"` via the provider.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: connect failure fires a toast, success fires none, error state still set.

### Example commit message
`feat: announce wallet connection failures via an accessible error toast`

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
title: "Add an updateContract operation to the repository for status and milestone-count changes"
labels: type:feature, area:repository, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add an updateContract operation to the repository for status and milestone-count changes

### Description
The persistence layer in [`src/lib/repository.ts`](src/lib/repository.ts) only exposes `listContracts` and an additive `saveContract`. There is no way to mutate an existing record, so status transitions (Pending → Active → Completed/Disputed) and `milestoneCount` updates cannot be persisted. This issue adds an `updateContract` operation that locates a contract and replaces it in place, preserving the module's pure, synchronous, SSR-safe design.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add `updateContract(matcher, patch)` (or an id-keyed variant) that reads, replaces the matching contract, and writes back; if no match, no-op with a console warning.
- Keep all reads guarded by `isBrowser()` and wrapped in try/catch as the rest of the module is.
- Do not mutate caller-provided objects; return new arrays/objects.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/repository-update-contract`
- Implement changes
  - **Write code in:** [`src/lib/repository.ts`](src/lib/repository.ts).
  - **Write comprehensive tests in:** [`src/lib/__tests__/repository.test.ts`](src/lib/__tests__/repository.test.ts) — assert in-place update, no-op on miss, SSR safety, and immutability.
  - **Add documentation:** extend the repository JSDoc and any data-model doc.
  - Add JSDoc with a usage example matching the existing style.
  - Validate security: malformed stored data still falls back to empty state.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: update existing, update missing, corrupt store, SSR.

### Example commit message
`feat: add updateContract to the localStorage repository`

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
title: "Add an updateMilestone operation so milestone status transitions persist"
labels: type:feature, area:repository, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add an updateMilestone operation so milestone status transitions persist

### Description
[`src/lib/repository.ts`](src/lib/repository.ts) can append milestones via `saveMilestone` but cannot change one. Marking a milestone Completed, Paid, or Disputed therefore cannot be persisted. This issue adds `updateMilestone(id, patch)` that locates a milestone by `id` and replaces it, keeping the module pure, synchronous, and SSR-safe.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add `updateMilestone(id, patch)` that reads, replaces the matching milestone, and writes back; no-op + warning when `id` is absent.
- Preserve `isBrowser()` guards and try/catch resilience used throughout the module.
- Never mutate inputs; emit new arrays/objects.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/repository-update-milestone`
- Implement changes
  - **Write code in:** [`src/lib/repository.ts`](src/lib/repository.ts).
  - **Write comprehensive tests in:** [`src/lib/__tests__/repository.test.ts`](src/lib/__tests__/repository.test.ts) — assert update-by-id, no-op on miss, immutability, SSR safety.
  - **Add documentation:** extend the repository JSDoc and data-model doc.
  - Add JSDoc with an example.
  - Validate security: corrupt JSON falls back to empty state.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: update existing id, missing id, corrupt store, SSR.

### Example commit message
`feat: add updateMilestone to the localStorage repository`

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
title: "Wire the contract detail ActionPanel callbacks to repository status updates"
labels: type:feature, area:contract-detail, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Wire the contract detail ActionPanel callbacks to repository status updates

### Description
`ActionPanel` in [`src/components/ActionPanel.tsx`](src/components/ActionPanel.tsx) exposes `onReleaseFunds`, `onDispute`, and `onSubmitMilestone`, but on the detail page at [`src/app/contracts/[id]/page.tsx`](src/app/contracts/[id]/page.tsx) these are not yet persisted. This issue wires the confirmed actions to repository updates so a release transitions the contract toward Completed and a dispute moves it to Disputed, with toast feedback. Depends conceptually on the repository update operations.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- On confirmed Release/Dispute, persist the new status via the repository and reflect it in page state.
- Use the toast provider for success/error feedback; keep ConfirmDialog as the gate for destructive actions.
- Preserve the wallet-connected gating already enforced by `ActionPanel`.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/contract-detail-action-persistence`
- Implement changes
  - **Write code in:** [`src/app/contracts/[id]/page.tsx`](src/app/contracts/[id]/page.tsx), using [`src/lib/repository.ts`](src/lib/repository.ts) and [`src/components/ActionPanel.tsx`](src/components/ActionPanel.tsx).
  - **Write comprehensive tests in:** [`src/app/contracts/[id]/__tests__/page.test.tsx`](src/app/contracts/[id]/__tests__/page.test.tsx) — assert status persists and UI reflects it.
  - **Add documentation:** document the action → persistence flow.
  - Add JSDoc on the new handlers.
  - Validate a11y: focus return and confirmation flow remain intact.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: release path, dispute path, disconnected wallet, persistence failure.

### Example commit message
`feat: persist contract status changes from the detail ActionPanel`

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
title: "Render Milestones page from the repository instead of the hardcoded SAMPLE_MILESTONES array"
labels: type:feature, area:milestones, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Render Milestones page from the repository instead of the hardcoded SAMPLE_MILESTONES array

### Description
The Milestones page at [`src/app/milestones/page.tsx`](src/app/milestones/page.tsx) renders a static `SAMPLE_MILESTONES` constant and ignores persisted data. This issue sources the list from `listMilestones()` in [`src/lib/repository.ts`](src/lib/repository.ts), falling back to the sample data only when storage is empty, so newly added milestones actually appear.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Initialize state from `listMilestones()`; keep the existing `MilestoneFilter` and empty-state behavior.
- Preserve the `useMemo` filtering and result-count wiring.
- Avoid hydration mismatches by reading storage on the client.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/milestones-page-repository`
- Implement changes
  - **Write code in:** [`src/app/milestones/page.tsx`](src/app/milestones/page.tsx), using [`src/lib/repository.ts`](src/lib/repository.ts).
  - **Write comprehensive tests in:** [`src/app/milestones/__tests__/page.test.tsx`](src/app/milestones/__tests__/page.test.tsx) — assert persisted milestones render and filter correctly.
  - **Add documentation:** note the data source change.
  - Add JSDoc on the loader.
  - Validate a11y: filter radiogroup and live result count still announce.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: persisted data renders, empty falls back, filter changes update count.

### Example commit message
`feat: render Milestones page from the persisted repository`

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
title: "Add an empty-parties guard and party-count display to ContractSummary"
labels: type:enhancement, area:contract-summary, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add an empty-parties guard and party-count display to ContractSummary

### Description
`ContractSummary` in [`src/components/ContractSummary.tsx`](src/components/ContractSummary.tsx) maps `parties` directly and uses `party.label` as the React `key`. When `parties` is empty the Parties section renders a bare label with no content, and duplicate labels would collide as keys. This issue adds a friendly empty-parties message, a count summary, and a stable composite key.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Render a clear "No parties listed" message when `parties.length === 0`.
- Show a small "N parties" count near the section header with correct singular/plural.
- Use a key that combines label and address to avoid collisions on duplicate labels.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/contract-summary-parties-guard`
- Implement changes
  - **Write code in:** [`src/components/ContractSummary.tsx`](src/components/ContractSummary.tsx).
  - **Write comprehensive tests in:** [`src/components/__tests__/ContractSummary.test.tsx`](src/components/__tests__/ContractSummary.test.tsx) — assert empty message, count, and duplicate-label rendering.
  - **Add documentation:** note the parties rendering contract.
  - Add JSDoc on the parties section.
  - Validate a11y: count is exposed to assistive tech.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: zero, one, many, and duplicate-label parties.

### Example commit message
`feat: guard empty parties and show a party count in ContractSummary`

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
title: "Make the formatAmount currency fallback resilient to invalid ISO currency codes"
labels: type:enhancement, area:preferences, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Make the formatAmount currency fallback resilient to invalid ISO currency codes

### Description
`formatAmount` in [`src/lib/preferences.tsx`](src/lib/preferences.tsx) passes the caller-provided `currency` straight into `Intl.NumberFormat` with `style: 'currency'`. A non-ISO or free-text currency string (which the domain currently allows) throws a `RangeError`, crashing whatever renders the amount. This issue wraps the formatting in a guard that falls back to a safe default and never throws.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Detect invalid currency codes and fall back to `USD` (or a configurable default) without throwing.
- Apply the guard to all three branches (`usd`, `ngn`, `compact`) and to the no-provider fallback `formatAmount`.
- Preserve current valid-code behavior and compact-notation output.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/preferences-currency-fallback`
- Implement changes
  - **Write code in:** [`src/lib/preferences.tsx`](src/lib/preferences.tsx).
  - **Write comprehensive tests in:** [`src/lib/__tests__/preferences.test.tsx`](src/lib/__tests__/preferences.test.tsx) — assert invalid codes don't throw and fall back cleanly.
  - **Add documentation:** document the fallback in the preferences docs.
  - Add JSDoc on the guard helper.
  - Validate security: no untrusted input reaches `Intl` unguarded.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: valid code, invalid code, empty string, compact + invalid.

### Example commit message
`feat: guard formatAmount against invalid currency codes`

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
title: "Add a contract-creation form to replace the stub handler on the Contracts page"
labels: type:feature, area:contracts, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add a contract-creation form to replace the stub handler on the Contracts page

### Description
`handleCreateContract` in [`src/app/contracts/page.tsx`](src/app/contracts/page.tsx) writes a `Contract ${Date.now()}` stub with placeholder addresses and a zero total value — a clear TODO. This issue replaces the stub with an accessible creation form (name, parties, total value, currency) that validates input and calls `saveContract`, reusing `FormField` and `ErrorSummary` for accessible errors.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Collect contract name, at least two parties with Stellar addresses, total value, and currency.
- Validate party addresses with `isValidStellarAddress` from [`src/lib/stellarAddress.ts`](src/lib/stellarAddress.ts) and surface errors via `ErrorSummary`.
- Persist via `saveContract` and refresh the list; keep the existing EmptyState entry point.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/contracts-create-form`
- Implement changes
  - **Write code in:** [`src/app/contracts/page.tsx`](src/app/contracts/page.tsx), reusing [`src/components/FormField.tsx`](src/components/FormField.tsx), [`src/components/ErrorSummary.tsx`](src/components/ErrorSummary.tsx), and [`src/lib/repository.ts`](src/lib/repository.ts).
  - **Write comprehensive tests in:** [`src/app/contracts/__tests__/page.test.tsx`](src/app/contracts/__tests__/page.test.tsx) — assert validation, persistence, and list refresh.
  - **Add documentation:** document the creation flow.
  - Add JSDoc on the submit handler.
  - Validate a11y: errors are focusable and announced.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: valid submit, invalid address, missing fields, list refresh.

### Example commit message
`feat: add an accessible contract-creation form to the Contracts page`

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
title: "Render the Contracts list with ContractSummary cards instead of the placeholder list"
labels: type:feature, area:contracts, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Render the Contracts list with ContractSummary cards instead of the placeholder list

### Description
The Contracts page at [`src/app/contracts/page.tsx`](src/app/contracts/page.tsx) renders a bare `<ul>` with name/status text and an explicit "TODO: Replace with a proper ContractSummary list component" comment. This issue renders each persisted contract using the richer `ContractSummary` component in [`src/components/ContractSummary.tsx`](src/components/ContractSummary.tsx) so values, parties, and status badges appear consistently.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Map each `Contract` to `<ContractSummary />`, passing through name, parties, total value, currency, status, createdAt, and milestoneCount.
- Keep the EmptyState path for zero contracts.
- Use a stable composite key per contract.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/contracts-summary-cards`
- Implement changes
  - **Write code in:** [`src/app/contracts/page.tsx`](src/app/contracts/page.tsx), reusing [`src/components/ContractSummary.tsx`](src/components/ContractSummary.tsx).
  - **Write comprehensive tests in:** [`src/app/contracts/__tests__/page.test.tsx`](src/app/contracts/__tests__/page.test.tsx) — assert cards render with formatted value and status.
  - **Add documentation:** note the list composition.
  - Add JSDoc on the mapping.
  - Validate a11y: each card keeps its labelled section semantics.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: empty, single, multiple contracts.

### Example commit message
`feat: render Contracts list using ContractSummary cards`

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
title: "Configure the idle auto-disconnect timeout from user preferences"
labels: type:feature, area:wallet, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Configure the idle auto-disconnect timeout from user preferences

### Description
`WalletProvider` in [`src/contexts/WalletContext.tsx`](src/contexts/WalletContext.tsx) accepts an `idleTimeout` prop but it defaults to `0` (disabled) and is not surfaced anywhere a user can control. This issue adds an idle-timeout preference to the preferences store in [`src/lib/preferences.tsx`](src/lib/preferences.tsx) and feeds it into `WalletProvider`, so security-conscious users can opt into automatic disconnect.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add an `idleDisconnectMs` (or similar) preference with a sensible default and validated bounds.
- Wire it into `WalletProvider`'s `idleTimeout`; preserve the existing reset-timer and cleanup logic.
- Persist via the existing `safeStorage`-backed preferences flow.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/wallet-idle-timeout-preference`
- Implement changes
  - **Write code in:** [`src/lib/preferences.tsx`](src/lib/preferences.tsx) and the provider mount that wires [`src/contexts/WalletContext.tsx`](src/contexts/WalletContext.tsx).
  - **Write comprehensive tests in:** [`src/lib/__tests__/preferences.test.tsx`](src/lib/__tests__/preferences.test.tsx) and [`src/contexts/__tests__/WalletContext.test.tsx`](src/contexts/__tests__/WalletContext.test.tsx) — assert the timeout flows through.
  - **Add documentation:** document the new preference.
  - Add JSDoc on the preference.
  - Validate security: timeout actually disconnects when set.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: disabled default, enabled timeout, preference persistence.

### Example commit message
`feat: drive wallet idle auto-disconnect from a user preference`

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
title: "Cap the number of simultaneously visible toasts to prevent viewport overflow"
labels: type:enhancement, area:toast, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Cap the number of simultaneously visible toasts to prevent viewport overflow

### Description
`ToastProvider` in [`src/components/toast/toast-provider.tsx`](src/components/toast/toast-provider.tsx) appends every toast to a growing array with no upper bound. A burst of wallet/payout events can stack toasts past the bottom of the viewport, burying the dismiss buttons. This issue introduces a configurable maximum visible count that evicts the oldest toast (and clears its timer) when the cap is exceeded.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add a `maxVisible` cap (default e.g. 4); when exceeded, drop the oldest toast and clear its timer via the existing timer-cleanup path.
- Keep the live-region announcer behavior so the newest toast is still announced.
- Do not break pause-on-hover/focus timer semantics.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/toast-max-visible-cap`
- Implement changes
  - **Write code in:** [`src/components/toast/toast-provider.tsx`](src/components/toast/toast-provider.tsx).
  - **Write comprehensive tests in:** [`src/components/toast/toast-provider.test.tsx`](src/components/toast/toast-provider.test.tsx) — assert eviction order and timer cleanup.
  - **Add documentation:** document the cap in the toast docs.
  - Add JSDoc on the cap constant.
  - Validate a11y: announcer still fires for the newest toast.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: under cap, exactly at cap, over cap eviction, timer cleanup.

### Example commit message
`feat: cap simultaneously visible toasts and evict the oldest`

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
title: "Add a tightened Stellar checksum validation behind isValidStellarAddress"
labels: type:enhancement, area:validation, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add a tightened Stellar checksum validation behind isValidStellarAddress

### Description
`isValidStellarAddress` in [`src/lib/stellarAddress.ts`](src/lib/stellarAddress.ts) only checks length, prefix, and the base32 alphabet — its own doc comment notes this is "intentionally conservative" and accepts many strings that aren't real keys. This issue adds StrKey-style base32 + CRC16 checksum validation so addresses are verified for integrity, while keeping the cheap structural check as a fast pre-filter.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Decode the base32 payload and verify the trailing CRC16-XModem checksum for `G...` public keys.
- Keep the existing fast structural check as a guard before the heavier decode.
- Do not pull in the full Stellar SDK; a small self-contained decoder/checksum is sufficient.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/stellar-checksum-validation`
- Implement changes
  - **Write code in:** [`src/lib/stellarAddress.ts`](src/lib/stellarAddress.ts).
  - **Write comprehensive tests in:** [`src/lib/__tests__/stellarAddress.test.ts`](src/lib/__tests__/stellarAddress.test.ts) — assert valid keys pass and checksum-corrupted keys fail.
  - **Add documentation:** update the module doc comment.
  - Add JSDoc on the checksum helper.
  - Validate security: reject malformed/short/over-length inputs without throwing.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: valid key, bad checksum, wrong prefix, non-base32 chars.

### Example commit message
`feat: add StrKey checksum validation to isValidStellarAddress`

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
title: "Fix the ActionPanel trigger ref so focus returns to the correct button after confirmation"
labels: type:refactor, area:action-panel, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Fix the ActionPanel trigger ref so focus returns to the correct button after confirmation

### Description
In [`src/components/ActionPanel.tsx`](src/components/ActionPanel.tsx) both the Release Funds and Dispute buttons assign to a single shared `triggerButtonRef`, so whichever button rendered last wins. When a dialog closes, focus cannot reliably return to the button the user actually pressed. This issue tracks the triggering element correctly (separate refs or a captured-element ref set at open time) so focus restoration is accurate.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Capture the actual triggering button when `handleOpenConfirm` runs and restore focus to it on close.
- Avoid the single-shared-ref overwrite; use distinct refs or `event.currentTarget` capture.
- Keep the ConfirmDialog open/close contract unchanged.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b refactor/action-panel-focus-restore`
- Implement changes
  - **Write code in:** [`src/components/ActionPanel.tsx`](src/components/ActionPanel.tsx).
  - **Write comprehensive tests in:** [`src/components/__tests__/ActionPanel.test.tsx`](src/components/__tests__/ActionPanel.test.tsx) — assert focus returns to Release vs Dispute correctly.
  - **Add documentation:** note the focus-restore behavior.
  - Add JSDoc on the trigger capture.
  - Validate a11y: focus lands on the originating control after cancel/confirm.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: open from Release, open from Dispute, cancel, confirm.

### Example commit message
`fix: restore focus to the correct ActionPanel button after the dialog closes`

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
title: "Add a Submit Milestone confirmation and toast feedback in ActionPanel"
labels: type:enhancement, area:action-panel, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add a Submit Milestone confirmation and toast feedback in ActionPanel

### Description
In [`src/components/ActionPanel.tsx`](src/components/ActionPanel.tsx) the Release Funds and Dispute actions are gated by a ConfirmDialog, but Submit Milestone calls `onSubmitMilestone` immediately with no confirmation and no feedback. Submitting a milestone is a meaningful escrow action and deserves the same treatment. This issue routes Submit Milestone through a confirmation step and emits a success toast.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add a `'submit'` branch to the existing confirm-action state and dialog copy.
- Emit a success toast after confirmation using the toast provider.
- Keep the wallet-connected gating and disabled-reason wiring intact.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/action-panel-submit-confirm`
- Implement changes
  - **Write code in:** [`src/components/ActionPanel.tsx`](src/components/ActionPanel.tsx), using [`src/components/toast/toast-provider.tsx`](src/components/toast/toast-provider.tsx).
  - **Write comprehensive tests in:** [`src/components/__tests__/ActionPanel.test.tsx`](src/components/__tests__/ActionPanel.test.tsx) — assert the confirm step and toast fire.
  - **Add documentation:** update the destructive/confirmable-action docs.
  - Add JSDoc on the submit branch.
  - Validate a11y: dialog focus trap and labels match the other actions.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: confirm submit, cancel submit, disconnected wallet.

### Example commit message
`feat: confirm Submit Milestone and announce success in ActionPanel`

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
title: "Add empty and pending-aggregate handling to ContractProgress for zero-milestone contracts"
labels: type:enhancement, area:contract-progress, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add empty and pending-aggregate handling to ContractProgress for zero-milestone contracts

### Description
`ContractProgress` in [`src/components/ContractProgress.tsx`](src/components/ContractProgress.tsx) renders a "0 / 0" completion ratio and an empty progress bar when `milestones` is empty, which reads as a broken state rather than "no milestones yet". This issue adds a dedicated empty presentation and clarifies the progressbar's accessible label for the zero case.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- When `totalCount === 0`, show an explicit "No milestones yet" message instead of a 0% bar.
- Ensure the `aria-label`/screen-reader text reflects the empty state meaningfully.
- Preserve all non-empty calculations and formatting.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/contract-progress-empty-state`
- Implement changes
  - **Write code in:** [`src/components/ContractProgress.tsx`](src/components/ContractProgress.tsx).
  - **Write comprehensive tests in:** [`src/components/__tests__/ContractProgress.test.tsx`](src/components/__tests__/ContractProgress.test.tsx) — assert the empty branch and aria text.
  - **Add documentation:** note the empty-state behavior in the JSDoc.
  - Add JSDoc on the empty branch.
  - Validate a11y: progressbar values stay valid or are omitted when empty.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: zero milestones, all paid, mixed.

### Example commit message
`feat: present a clear empty state in ContractProgress`

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
title: "Route errorReporter through a structured logger with severity levels"
labels: type:enhancement, area:observability, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Route errorReporter through a structured logger with severity levels

### Description
The error reporter in [`src/lib/errorReporter.ts`](src/lib/errorReporter.ts) only supports a single `reportError(error, context)` shape that logs to `console.error` in non-production. There is no way to distinguish warnings from errors or attach structured metadata, which limits how a real reporter (e.g. Sentry) can be plugged in. This issue extends the reporter contract with a severity level and optional metadata while preserving the existing default behavior.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add an optional `level` ('warn' | 'error') and `meta` record to the reporter signature without breaking existing callers.
- Keep the default reporter's no-op-in-production / console-in-dev semantics.
- Keep `setErrorReporter(null)` resetting to default.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/error-reporter-severity`
- Implement changes
  - **Write code in:** [`src/lib/errorReporter.ts`](src/lib/errorReporter.ts).
  - **Write comprehensive tests in:** [`src/lib/__tests__/errorReporter.test.ts`](src/lib/__tests__/errorReporter.test.ts) — assert level/meta pass-through and backward compatibility.
  - **Add documentation:** update the reporter docs.
  - Add JSDoc on the extended signature.
  - Validate security: meta is not logged in production by default.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: warn level, error level, missing level, custom reporter throw.

### Example commit message
`feat: add severity levels and metadata to the error reporter`

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
title: "Route repository read/write warnings through the central error reporter"
labels: type:refactor, area:repository, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Route repository read/write warnings through the central error reporter

### Description
[`src/lib/repository.ts`](src/lib/repository.ts) logs storage failures with raw `console.warn` calls in `readStore` and `writeStore`, bypassing the central error reporter in [`src/lib/errorReporter.ts`](src/lib/errorReporter.ts). This makes repository failures invisible to any injected reporter. This issue replaces those direct console calls with `reportError`, keeping the same fallback-to-empty behavior.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Replace `console.warn` in `readStore`/`writeStore` with `reportError(err, '[repository] ...')`.
- Preserve the SSR guards and empty-state fallbacks exactly.
- Do not introduce a hard dependency cycle between modules.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b refactor/repository-use-error-reporter`
- Implement changes
  - **Write code in:** [`src/lib/repository.ts`](src/lib/repository.ts), using [`src/lib/errorReporter.ts`](src/lib/errorReporter.ts).
  - **Write comprehensive tests in:** [`src/lib/__tests__/repository.test.ts`](src/lib/__tests__/repository.test.ts) — assert the reporter is invoked on read/write failures.
  - **Add documentation:** note the reporting behavior.
  - Add JSDoc on the failure paths.
  - Validate security: no sensitive data is logged in production.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: read failure, write failure, normal path.

### Example commit message
`refactor: report repository storage failures via the central reporter`

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
title: "Replace the preferences parse console.error with the central error reporter"
labels: type:refactor, area:preferences, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Replace the preferences parse console.error with the central error reporter

### Description
`PreferencesProvider` in [`src/lib/preferences.tsx`](src/lib/preferences.tsx) catches a JSON parse failure during hydration and logs it via `console.error('Failed to parse preferences', e)`, bypassing the central error reporter in [`src/lib/errorReporter.ts`](src/lib/errorReporter.ts). This issue routes that failure through `reportError` so it is observable through any injected reporter while still falling back to defaults.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Replace the `console.error` in the hydration `catch` with `reportError`.
- Keep the fallback to `DEFAULT_PREFERENCES` and the `isHydrated` flag behavior intact.
- Do not change the persistence write path.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b refactor/preferences-use-error-reporter`
- Implement changes
  - **Write code in:** [`src/lib/preferences.tsx`](src/lib/preferences.tsx), using [`src/lib/errorReporter.ts`](src/lib/errorReporter.ts).
  - **Write comprehensive tests in:** [`src/lib/__tests__/preferences.test.tsx`](src/lib/__tests__/preferences.test.tsx) — assert the reporter fires on malformed stored JSON.
  - **Add documentation:** note the reporting behavior.
  - Add JSDoc on the catch.
  - Validate security: malformed input still yields safe defaults.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: valid stored prefs, malformed JSON, empty storage.

### Example commit message
`refactor: report preferences parse failures via the central reporter`

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
title: "Add a maximum length and trim guard to the home login email and password fields"
labels: type:security, area:auth, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add a maximum length and trim guard to the home login email and password fields

### Description
The login form in [`src/app/page.tsx`](src/app/page.tsx) feeds raw `email`/`password` values straight into `validateLogin` from [`src/lib/validateLogin.ts`](src/lib/validateLogin.ts) with no length ceiling or trimming, so pathologically long pasted input can reach validation and rendering unbounded. This issue adds sane `maxLength` attributes, trims surrounding whitespace before validation, and rejects over-length input with an accessible error.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add `maxLength` to both inputs and enforce the same ceiling in `validateLogin`.
- Trim whitespace on the email before validating; surface over-length errors via `ErrorSummary`.
- Keep the existing success-toast and `FormField` accessibility behavior.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b security/login-input-length-guard`
- Implement changes
  - **Write code in:** [`src/app/page.tsx`](src/app/page.tsx) and [`src/lib/validateLogin.ts`](src/lib/validateLogin.ts).
  - **Write comprehensive tests in:** [`src/lib/validateLogin.test.ts`](src/lib/validateLogin.test.ts) and [`src/app/page.test.tsx`](src/app/page.test.tsx) — assert length and trim handling.
  - **Add documentation:** note the input constraints.
  - Add JSDoc on the new validation rules.
  - Validate security: over-length input is rejected before further processing.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: valid input, over-length, whitespace-padded, empty.

### Example commit message
`feat: enforce length and trim guards on the login form inputs`

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
title: "Add a Subresource Integrity and referrer-policy hardening pass to next.config.js headers"
labels: type:security, area:headers, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add a Subresource Integrity and referrer-policy hardening pass to next.config.js headers

### Description
The security headers configured in [`next.config.js`](next.config.js) set a CSP and common headers, but referrer and cross-origin isolation headers can be tightened further to reduce leakage and cross-origin attack surface. This issue adds/normalizes `Referrer-Policy`, `Cross-Origin-Opener-Policy`, and `Cross-Origin-Resource-Policy` and documents the rationale, without breaking the existing app.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add `Referrer-Policy: strict-origin-when-cross-origin`, `Cross-Origin-Opener-Policy: same-origin`, and a suitable `Cross-Origin-Resource-Policy`.
- Verify the values do not conflict with the existing CSP and asset loading.
- Keep existing headers and the CSP test in [`src/app/__tests__/csp.test.ts`](src/app/__tests__/csp.test.ts) passing.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b security/headers-referrer-coop-corp`
- Implement changes
  - **Write code in:** [`next.config.js`](next.config.js).
  - **Write comprehensive tests in:** [`src/app/__tests__/csp.test.ts`](src/app/__tests__/csp.test.ts) (or a sibling headers test) — assert each header is present and correct.
  - **Add documentation:** document the headers and their rationale.
  - Add JSDoc/comments on each header entry.
  - Validate security: no regression in the existing CSP.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: each new header value asserted.

### Example commit message
`feat: harden referrer and cross-origin headers in next.config.js`

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
title: "Sanitize copied party addresses against control characters before clipboard write"
labels: type:security, area:contract-summary, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Sanitize copied party addresses against control characters before clipboard write

### Description
`handleCopy` in [`src/components/ContractSummary.tsx`](src/components/ContractSummary.tsx) writes the raw `party.address` to the clipboard. Because contract data can originate from untrusted persisted input, an address containing hidden control or bidi characters could be silently copied and pasted elsewhere. This issue normalizes the address (strip control/bidi chars, optional Stellar-shape check) before writing.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Strip control and bidirectional override characters before `clipboard.writeText`.
- Optionally validate via `normalizeStellarAddress` from [`src/lib/stellarAddress.ts`](src/lib/stellarAddress.ts) and warn on clearly malformed values.
- Keep the existing success/error toast and "copy not supported" guard.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b security/contract-summary-copy-sanitize`
- Implement changes
  - **Write code in:** [`src/components/ContractSummary.tsx`](src/components/ContractSummary.tsx), optionally using [`src/lib/stellarAddress.ts`](src/lib/stellarAddress.ts).
  - **Write comprehensive tests in:** [`src/components/__tests__/ContractSummary.test.tsx`](src/components/__tests__/ContractSummary.test.tsx) — assert control chars are stripped before write.
  - **Add documentation:** note the sanitization.
  - Add JSDoc on the sanitizer.
  - Validate security: no hidden characters reach the clipboard.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: clean address, control-char address, unsupported clipboard.

### Example commit message
`feat: sanitize party addresses before clipboard copy in ContractSummary`

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
title: "Add tests for ContractProgress completion math and progressbar ARIA values"
labels: type:test, area:contract-progress, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add tests for ContractProgress completion math and progressbar ARIA values

### Description
`ContractProgress` in [`src/components/ContractProgress.tsx`](src/components/ContractProgress.tsx) derives counts, paid/outstanding totals, and a `progressbar` with `aria-valuenow`. Its test file [`src/components/__tests__/ContractProgress.test.tsx`](src/components/__tests__/ContractProgress.test.tsx) should comprehensively pin this behavior. This issue adds focused tests covering the completion percentage, paid-vs-outstanding split, and ARIA values across edge cases.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Assert `completedCount`/`totalCount`, `paidAmount`, `outstandingAmount`, and the rounded percentage.
- Assert `role="progressbar"` with correct `aria-valuenow`/`min`/`max` and the screen-reader label.
- Cover all-paid, none-paid, and mixed scenarios.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/contract-progress-coverage`
- Implement changes
  - **Write code in:** no production change expected; test-only.
  - **Write comprehensive tests in:** [`src/components/__tests__/ContractProgress.test.tsx`](src/components/__tests__/ContractProgress.test.tsx).
  - **Add documentation:** note the covered behaviors in the test header.
  - Add JSDoc-style comments describing each scenario.
  - Validate a11y: assert progressbar semantics with the accessible name.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: all paid, none paid, mixed, rounding boundaries.

### Example commit message
`test: cover ContractProgress math and progressbar ARIA`

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
title: "Add tests for the formatAmount NGN and compact-notation branches in preferences"
labels: type:test, area:preferences, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add tests for the formatAmount NGN and compact-notation branches in preferences

### Description
`formatAmount` in [`src/lib/preferences.tsx`](src/lib/preferences.tsx) has three formatting branches (`usd`, `ngn`, `compact`) plus a provider-less fallback. The NGN locale override and compact-notation paths are easy to regress. This issue adds targeted tests in [`src/lib/__tests__/preferences.test.tsx`](src/lib/__tests__/preferences.test.tsx) that pin the NGN currency/locale forcing and compact output.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Assert NGN forces `NGN` currency and `en-NG` locale regardless of caller currency.
- Assert compact notation produces compact strings and respects the caller currency.
- Assert the provider-less `usePreferences` fallback still formats correctly.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/preferences-format-branches`
- Implement changes
  - **Write code in:** no production change expected; test-only.
  - **Write comprehensive tests in:** [`src/lib/__tests__/preferences.test.tsx`](src/lib/__tests__/preferences.test.tsx).
  - **Add documentation:** describe the covered branches in the test header.
  - Add JSDoc-style comments per scenario.
  - Validate a11y: n/a; pure formatting logic.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: usd, ngn override, compact, fallback.

### Example commit message
`test: cover NGN and compact branches of formatAmount`

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
title: "Add tests for the WalletContext idle auto-disconnect timer and activity reset"
labels: type:test, area:wallet, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add tests for the WalletContext idle auto-disconnect timer and activity reset

### Description
`WalletProvider` in [`src/contexts/WalletContext.tsx`](src/contexts/WalletContext.tsx) has non-trivial idle-timeout logic: it adds activity listeners, resets a timer on interaction, disconnects after `idleTimeout`, and shows a "Session expired" toast. This timer behavior is easy to break. This issue adds fake-timer tests in [`src/contexts/__tests__/WalletContext.test.tsx`](src/contexts/__tests__/WalletContext.test.tsx) covering expiry, reset-on-activity, and cleanup.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Use Jest fake timers to advance to expiry and assert disconnect + toast.
- Assert that simulated activity resets the timer and prevents disconnect.
- Assert listeners/timers are cleaned up on unmount and when `idleTimeout` is 0.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/wallet-idle-timer`
- Implement changes
  - **Write code in:** no production change expected; test-only.
  - **Write comprehensive tests in:** [`src/contexts/__tests__/WalletContext.test.tsx`](src/contexts/__tests__/WalletContext.test.tsx).
  - **Add documentation:** describe the timer scenarios in the test header.
  - Add JSDoc-style comments per scenario.
  - Validate a11y: assert the session-expired toast announcement.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: expiry, reset on activity, disabled timeout, cleanup.

### Example commit message
`test: cover WalletContext idle disconnect timer behavior`

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
title: "Add tests for the toast timer pause-count semantics under overlapping hover and focus"
labels: type:test, area:toast, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add tests for the toast timer pause-count semantics under overlapping hover and focus

### Description
The toast provider in [`src/components/toast/toast-provider.tsx`](src/components/toast/toast-provider.tsx) uses a `pauseCount` so overlapping hover and focus keep a toast paused until both end, and recovers `remainingMs` from `expiresAt`. This nested state is subtle. This issue adds fake-timer tests in [`src/components/toast/toast-provider.test.tsx`](src/components/toast/toast-provider.test.tsx) that pin the pause/resume counting and remaining-time recovery.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Assert hover+focus increments pauseCount and a single end does not resume.
- Assert remaining time is preserved across pause and used on resume.
- Assert dismissal clears the timer state.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/toast-pause-count`
- Implement changes
  - **Write code in:** no production change expected; test-only.
  - **Write comprehensive tests in:** [`src/components/toast/toast-provider.test.tsx`](src/components/toast/toast-provider.test.tsx).
  - **Add documentation:** describe pause/resume scenarios in the test header.
  - Add JSDoc-style comments per scenario.
  - Validate a11y: assert role/status announcements are unaffected.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: hover only, focus only, both, single end, dismissal.

### Example commit message
`test: cover toast pause-count and remaining-time recovery`

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
title: "Add tests for the Contracts page create-and-list state refresh"
labels: type:test, area:contracts, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add tests for the Contracts page create-and-list state refresh

### Description
The Contracts page at [`src/app/contracts/page.tsx`](src/app/contracts/page.tsx) initializes from `listContracts()`, renders an EmptyState when empty, and re-reads storage after `saveContract`. The test file [`src/app/contracts/__tests__/page.test.tsx`](src/app/contracts/__tests__/page.test.tsx) should pin the empty → create → list transition. This issue adds tests covering the EmptyState path, the create action, and the subsequent list rendering.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Assert EmptyState renders with the create action when storage is empty.
- Assert clicking create persists and re-renders the list with the new contract.
- Mock or seed the repository to control initial state deterministically.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/contracts-page-refresh`
- Implement changes
  - **Write code in:** no production change expected; test-only.
  - **Write comprehensive tests in:** [`src/app/contracts/__tests__/page.test.tsx`](src/app/contracts/__tests__/page.test.tsx).
  - **Add documentation:** describe the covered flow.
  - Add JSDoc-style comments per scenario.
  - Validate a11y: assert EmptyState action is reachable.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: empty render, create, list refresh.

### Example commit message
`test: cover Contracts page create-and-list refresh`

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
title: "Add tests for the Milestones page status filtering and empty-filter results"
labels: type:test, area:milestones, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add tests for the Milestones page status filtering and empty-filter results

### Description
The Milestones page at [`src/app/milestones/page.tsx`](src/app/milestones/page.tsx) filters milestones by status via `useMemo`, passes a `resultCount` to `MilestoneFilter`, and shows a no-match EmptyState when a filter yields nothing. The test file [`src/app/milestones/__tests__/page.test.tsx`](src/app/milestones/__tests__/page.test.tsx) should pin this. This issue adds tests for each status filter, the result count, and the no-match empty state.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Assert switching filters narrows the rendered list and updates `resultCount`.
- Assert a filter with no matches renders the no-match EmptyState with the filter name.
- Assert the "All" filter shows every milestone.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/milestones-page-filter`
- Implement changes
  - **Write code in:** no production change expected; test-only.
  - **Write comprehensive tests in:** [`src/app/milestones/__tests__/page.test.tsx`](src/app/milestones/__tests__/page.test.tsx).
  - **Add documentation:** describe the covered filters.
  - Add JSDoc-style comments per scenario.
  - Validate a11y: assert the live result-count announcement.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: All, each status, no-match.

### Example commit message
`test: cover Milestones page filtering and empty results`

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
title: "Add tests for the home page submit success toast and validation error paths"
labels: type:test, area:home, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add tests for the home page submit success toast and validation error paths

### Description
The home page in [`src/app/page.tsx`](src/app/page.tsx) runs `validateLogin`, renders an `ErrorSummary` of field errors, and fires a success toast only when there are no errors. The existing [`src/app/page.test.tsx`](src/app/page.test.tsx) should pin the success-vs-error branching and the per-field error wiring. This issue adds tests for the success toast on valid submit and the error summary on invalid submit.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Assert valid credentials produce a success toast and no errors.
- Assert invalid input renders the corresponding field errors in `ErrorSummary`.
- Assert `getError` maps `fieldId` to the right message on each field.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/home-submit-paths`
- Implement changes
  - **Write code in:** no production change expected; test-only.
  - **Write comprehensive tests in:** [`src/app/page.test.tsx`](src/app/page.test.tsx).
  - **Add documentation:** describe the covered branches.
  - Add JSDoc-style comments per scenario.
  - Validate a11y: assert errors are announced and focusable via ErrorSummary.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: valid submit, missing email, missing password, both missing.

### Example commit message
`test: cover home page submit success and error paths`

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
title: "Add tests for the contractResolver lookup and not-found resolution"
labels: type:test, area:contract-resolver, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add tests for the contractResolver lookup and not-found resolution

### Description
The helper in [`src/lib/contractResolver.ts`](src/lib/contractResolver.ts) maps a route id to a contract record and has no dedicated test file. This issue adds a `src/lib/__tests__/contractResolver.test.ts` covering successful resolution, the not-found case, and any normalization the resolver performs, so the contract detail route stays reliable.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Assert a known id resolves to the expected contract.
- Assert an unknown id resolves to the not-found result (null/undefined per the implementation).
- Assert any id normalization/trimming behaves as documented.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/contract-resolver-coverage`
- Implement changes
  - **Write code in:** no production change expected; test-only.
  - **Write comprehensive tests in:** `src/lib/__tests__/contractResolver.test.ts`, exercising [`src/lib/contractResolver.ts`](src/lib/contractResolver.ts).
  - **Add documentation:** describe the covered cases.
  - Add JSDoc-style comments per scenario.
  - Validate security: malformed ids do not throw.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: found, not found, normalized id.

### Example commit message
`test: cover contractResolver lookup and not-found paths`

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
title: "Add an accessible numeric out-of-N reputation score meter to ReputationProfile"
labels: type:a11y, area:reputation, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add an accessible numeric out-of-N reputation score meter to ReputationProfile

### Description
`ReputationProfile` in [`src/components/ReputationProfile.tsx`](src/components/ReputationProfile.tsx) renders the score as plain text with a hardcoded "out of 5" screen-reader suffix, with no semantic meter conveying min/max/current value. This issue adds a `role="meter"` (or `progressbar`) wrapper with `aria-valuenow/min/max` so assistive tech understands the score as a measured value, while keeping the existing visual text.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Wrap the score in a `role="meter"` with `aria-valuenow`, `aria-valuemin=0`, and `aria-valuemax` derived from the configured scale (not hardcoded 5 inline).
- Keep the "No reputation yet" branch when `score` is absent.
- Preserve the existing labelled text and privacy copy.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b a11y/reputation-score-meter`
- Implement changes
  - **Write code in:** [`src/components/ReputationProfile.tsx`](src/components/ReputationProfile.tsx).
  - **Write comprehensive tests in:** [`src/components/ReputationProfile.test.tsx`](src/components/ReputationProfile.test.tsx) — assert meter role and aria values.
  - **Add documentation:** note the meter semantics.
  - Add JSDoc on the score region.
  - Validate a11y: run jest-axe and assert the meter has an accessible name.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: score present, score null, score at min/max.

### Example commit message
`feat: expose the reputation score as an accessible meter`

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
title: "Make the reputation history a semantic ordered list with a date <time> element"
labels: type:a11y, area:reputation, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Make the reputation history a semantic ordered list with a date <time> element

### Description
The reputation history in [`src/components/ReputationProfile.tsx`](src/components/ReputationProfile.tsx) renders events in an unordered `<ul>` with the date as plain text. Reputation history is inherently chronological, and machine-readable dates improve assistive tech and SEO. This issue switches to an ordered list and wraps each `event.date` in a `<time dateTime=...>` element.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Use `<ol>` for the chronological history and keep stable keys.
- Wrap each date in `<time dateTime=...>` with a parseable ISO value where available.
- Preserve the empty-history and "Private by default" presentation.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b a11y/reputation-history-semantics`
- Implement changes
  - **Write code in:** [`src/components/ReputationProfile.tsx`](src/components/ReputationProfile.tsx).
  - **Write comprehensive tests in:** [`src/components/ReputationProfile.test.tsx`](src/components/ReputationProfile.test.tsx) — assert ordered list and `<time>` element.
  - **Add documentation:** note the semantic change.
  - Add JSDoc on the history section.
  - Validate a11y: run jest-axe with no new violations.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: with history, empty history, missing/invalid date.

### Example commit message
`feat: render reputation history as an ordered list with time elements`

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
title: "Announce the copied-address confirmation in ContractSummary to screen readers"
labels: type:a11y, area:contract-summary, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Announce the copied-address confirmation in ContractSummary to screen readers

### Description
In [`src/components/ContractSummary.tsx`](src/components/ContractSummary.tsx) a successful copy swaps the button icon to a checkmark for 2 seconds, but the only screen-reader feedback is the generic success toast. The per-button copied state itself is purely visual. This issue adds an `aria-live` confirmation (or dynamic `aria-label`) so AT users perceive the per-party copied state directly on the control.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Reflect the `copiedAddress` state in the button's accessible name (e.g. "Copied" vs "Copy {label} address") or a polite live region.
- Keep the 2-second revert and the existing toast feedback.
- Do not regress the unsupported-clipboard error path.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b a11y/contract-summary-copy-announce`
- Implement changes
  - **Write code in:** [`src/components/ContractSummary.tsx`](src/components/ContractSummary.tsx).
  - **Write comprehensive tests in:** [`src/components/__tests__/ContractSummary.test.tsx`](src/components/__tests__/ContractSummary.test.tsx) — assert the accessible name changes on copy.
  - **Add documentation:** note the copied-state a11y.
  - Add JSDoc on the copy handler.
  - Validate a11y: run jest-axe and assert the live update.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: copy success, revert after timeout, unsupported clipboard.

### Example commit message
`feat: announce per-party copied state in ContractSummary`

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
title: "Give the MilestonesList scroll region a labelled heading association and item count"
labels: type:a11y, area:milestones, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Give the MilestonesList scroll region a labelled heading association and item count

### Description
`MilestonesList` in [`src/components/MilestonesList.tsx`](src/components/MilestonesList.tsx) renders a focusable scroll `region` labelled only by the static `aria-label="Milestones list"`, disconnected from the visible "Milestones" heading and the "N total" count. This issue associates the region with the heading via `aria-labelledby` and exposes the live item count so AT users understand the region's contents.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Replace the static `aria-label` with `aria-labelledby` pointing at the existing `milestones-title` heading (plus a count where helpful).
- Keep the SSR/JSDOM-safe `tabIndex` behavior already documented in the component.
- Preserve the focus-ring styles and overflow behavior.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b a11y/milestones-region-labelling`
- Implement changes
  - **Write code in:** [`src/components/MilestonesList.tsx`](src/components/MilestonesList.tsx).
  - **Write comprehensive tests in:** [`src/components/__tests__/MilestonesList.test.tsx`](src/components/__tests__/MilestonesList.test.tsx) — assert the region's accessible name comes from the heading.
  - **Add documentation:** note the labelling rationale.
  - Add JSDoc on the region.
  - Validate a11y: run jest-axe with no new violations.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: populated list, empty list, single item.

### Example commit message
`feat: label the MilestonesList scroll region via its heading`

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
title: "Document the repository persistence API and update operations in a data-model guide"
labels: type:docs, area:repository, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Document the repository persistence API and update operations in a data-model guide

### Description
The persistence layer in [`src/lib/repository.ts`](src/lib/repository.ts) is the single source of truth for contracts and milestones, with a `STORAGE_KEY`, SSR guards, and resilience semantics — but there is no top-level guide describing the storage shape, the `AppData` schema, and the read/write/update contract for contributors. This issue adds a `docs/data-model.md` documenting the model and how pages consume it.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Document `STORAGE_KEY`, the `AppData` shape, SSR safety, and the empty-state fallback behavior.
- Describe the public API (list/save and any update operations) with examples.
- Cross-link the Contracts and Milestones pages that consume the repository.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b docs/repository-data-model`
- Implement changes
  - **Write code in:** documentation only; reference [`src/lib/repository.ts`](src/lib/repository.ts) and [`src/types/domain.ts`](src/types/domain.ts).
  - **Write comprehensive tests in:** n/a (docs); ensure examples compile conceptually.
  - **Add documentation:** create `docs/data-model.md` and link it from the README.
  - Add JSDoc cross-references where helpful.
  - Validate security: document that only non-sensitive data is persisted.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: n/a; verify the build and links resolve.

### Example commit message
`docs: add a data-model guide for the persistence repository`

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
title: "Document the preferences provider, theme application, and formatAmount behavior"
labels: type:docs, area:preferences, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Document the preferences provider, theme application, and formatAmount behavior

### Description
`PreferencesProvider` in [`src/lib/preferences.tsx`](src/lib/preferences.tsx) owns theme application (including `system` media-query handling), persistence via `safeStorage`, and the `formatAmount` currency logic — but contributors have no single doc explaining these behaviors and defaults. This issue documents the preferences model, the hydration flow, and the formatting branches.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Document `UserPreferences`, defaults, the `STORAGE_KEY`, and the hydration/persist effects.
- Explain theme application for `light`/`dark`/`system` including the media-query listener.
- Document `formatAmount` branches (`usd`/`ngn`/`compact`) and the provider-less fallback.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b docs/preferences-provider`
- Implement changes
  - **Write code in:** documentation only; reference [`src/lib/preferences.tsx`](src/lib/preferences.tsx) and [`src/lib/safeStorage.ts`](src/lib/safeStorage.ts).
  - **Write comprehensive tests in:** n/a (docs).
  - **Add documentation:** add `docs/preferences.md` and link it from the README.
  - Add JSDoc cross-references where helpful.
  - Validate a11y: document theme/contrast implications.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: n/a; verify build and links.

### Example commit message
`docs: document the preferences provider and formatAmount behavior`

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
title: "Document the Stellar address utilities and their validation guarantees"
labels: type:docs, area:validation, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Document the Stellar address utilities and their validation guarantees

### Description
The address helpers in [`src/lib/stellarAddress.ts`](src/lib/stellarAddress.ts) (`isValidStellarAddress`, `normalizeStellarAddress`) underpin form validation and copy flows, but their guarantees and intentional limitations (structural-only, no checksum) are only captured in a terse module comment. This issue adds a focused doc so contributors know exactly what "valid" means today and where to plug in stronger validation later.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Document the acceptance rule (length 56, `G` prefix, base32 alphabet) and that it is structural-only.
- Document `normalizeStellarAddress` (trim + uppercase) and the null/undefined handling.
- Note where stronger checksum validation would be added.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b docs/stellar-address-utils`
- Implement changes
  - **Write code in:** JSDoc within [`src/lib/stellarAddress.ts`](src/lib/stellarAddress.ts) plus a short doc.
  - **Write comprehensive tests in:** n/a (docs); ensure [`src/lib/__tests__/stellarAddress.test.ts`](src/lib/__tests__/stellarAddress.test.ts) still passes.
  - **Add documentation:** add `docs/stellar-address.md` and link it from the README.
  - Add JSDoc on both exports.
  - Validate security: document that this is not a full StrKey check.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: n/a; verify build and links.

### Example commit message
`docs: document the Stellar address validation utilities`

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
title: "Extract the milestone-derived escrow math into a reusable useContractProgress hook"
labels: type:refactor, area:contract-progress, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Extract the milestone-derived escrow math into a reusable useContractProgress hook

### Description
The `calculateProgress` function is defined inline in [`src/components/ContractProgress.tsx`](src/components/ContractProgress.tsx) and tightly coupled to that component, so the same paid/outstanding/completion math cannot be reused by the contract detail header or a contracts-list summary. This issue extracts the calculation into a pure `useContractProgress` (or plain function) module that the component consumes, enabling reuse and isolated testing.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Extract the math into `src/hooks/useContractProgress.ts` (or `src/lib/contractProgress.ts`) as a pure function plus optional hook wrapper.
- Keep `ContractProgress` rendering identical by consuming the extracted module.
- Preserve the "Completed or Paid counts as completed" definition and empty-array guards.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b refactor/extract-contract-progress-math`
- Implement changes
  - **Write code in:** new `src/hooks/useContractProgress.ts` (or `src/lib/contractProgress.ts`) and [`src/components/ContractProgress.tsx`](src/components/ContractProgress.tsx).
  - **Write comprehensive tests in:** a new `__tests__` file plus [`src/components/__tests__/ContractProgress.test.tsx`](src/components/__tests__/ContractProgress.test.tsx) — assert parity.
  - **Add documentation:** document the extracted API.
  - Add JSDoc on the pure function.
  - Validate a11y: component output and progressbar unchanged.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover: empty, all paid, none paid, mixed.

### Example commit message
`refactor: extract escrow progress math into a reusable module`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
