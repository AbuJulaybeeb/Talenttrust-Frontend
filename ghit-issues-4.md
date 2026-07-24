---
type: Feature
title: "Fix the unstyled ConfirmDialog cancel button and align its focus target with the documented contract"
labels: type:refactor, area:dialog, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Fix the unstyled ConfirmDialog cancel button and align its focus target with the documented contract

### Description
[`src/components/ConfirmDialog.tsx`](src/components/ConfirmDialog.tsx) renders the cancel button with an **empty `className`** (the attribute is present but blank on lines around the cancel `<button>`), so it has no padding, border, focus ring, or hover state and looks broken next to the styled confirm button. The component is the confirmation gate for the irreversible **Release Funds** and **Dispute** actions in [`ActionPanel`](src/components/ActionPanel.tsx), so a misrendered, low-affordance cancel control is a real usability and a11y problem. This issue gives the cancel button proper secondary-button styling and a visible focus ring consistent with the confirm button.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Give the cancel `<button>` a secondary style (border, padding, hover, and `focus-visible` ring) that mirrors the confirm button's focus treatment but reads as the non-destructive choice.
- Keep the existing `cancelBtnRef` focus-on-open behavior, Escape-to-cancel, and the focus trap intact; do not change the `ConfirmDialogProps` shape.
- Ensure the confirm button's `bg-primary-600`/`text-white` classes actually resolve to tokens defined in [`src/app/globals.css`](src/app/globals.css); if `primary-*` is undefined, switch to the project's real token set.
- Maintain `role="dialog"`, `aria-modal`, and `aria-labelledby` wiring.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b refactor/dialog-01-confirm-cancel-styling`
- Implement changes
  - **Write code in:** [`src/components/ConfirmDialog.tsx`](src/components/ConfirmDialog.tsx).
  - **Write comprehensive tests in:** create [`src/components/__tests__/ConfirmDialog.test.tsx`](src/components/__tests__/ConfirmDialog.test.tsx) — cancel button has a non-empty class, confirm/cancel callbacks fire, Escape cancels, focus opens on cancel.
  - **Add documentation:** add `docs/components/ConfirmDialog.md` describing the two button roles and focus order.
  - Add JSDoc clarifying the resolved token classes.
  - Validate a11y: visible focus ring on both buttons, axe clean.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: closed state renders nothing, backdrop click cancels, Tab wraps between the two buttons.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`fix(dialog): style the ConfirmDialog cancel button and align focus contract`

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
title: "Return focus to the triggering action button after the ActionPanel confirmation dialog closes"
labels: type:a11y, area:dialog, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Return focus to the triggering action button after the ActionPanel confirmation dialog closes

### Description
In [`src/components/ActionPanel.tsx`](src/components/ActionPanel.tsx) both the **Release Funds** and **Dispute** buttons assign to a single shared `triggerButtonRef` (each `ref={el => { triggerButtonRef.current = el; }}`), so the ref always points at whichever button rendered last — not the one the user actually clicked. The `ConfirmDialog` JSDoc states focus return is "handled by the caller", but `ActionPanel`'s `handleConfirm`/`handleCancel` never call `.focus()` at all. The result: after confirming or cancelling, keyboard and screen-reader users are dropped at the top of the document, violating WCAG 2.4.3 (Focus Order). This issue tracks the correct trigger and restores focus to it on close.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Track the specific element that opened the dialog (e.g. capture `event.currentTarget` in `handleOpenConfirm`, or use two distinct refs) instead of the shared overwriting ref.
- On both confirm and cancel, return focus to the originating button after the dialog unmounts; guard for the button being disabled post-action.
- Keep the wallet-gating, `disabledReasons`, and `isLoading` behavior unchanged.
- Do not alter the `ConfirmDialog` API.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b a11y/dialog-02-actionpanel-focus-return`
- Implement changes
  - **Write code in:** [`src/components/ActionPanel.tsx`](src/components/ActionPanel.tsx).
  - **Write comprehensive tests in:** [`src/components/__tests__/ActionPanel.test.tsx`](src/components/__tests__/ActionPanel.test.tsx) (extend) — open via Release returns focus to Release; open via Dispute returns focus to Dispute; cancel restores focus.
  - **Add documentation:** update [`docs/components/ActionPanel.md`](docs/components/ActionPanel.md) with the focus-return contract.
  - Add JSDoc to the trigger-tracking logic.
  - Validate a11y: focus restored to correct trigger on confirm and cancel.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: rapid open/close, both buttons present (Active), single button (Disputed), button disabled after action.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`fix(a11y): restore focus to the correct ActionPanel trigger after dialog close`

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
title: "Replace the Ethereum-style stub addresses in the Contracts create handler with Stellar G-addresses"
labels: type:refactor, area:contracts, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Replace the Ethereum-style stub addresses in the Contracts create handler with Stellar G-addresses

### Description
The `handleCreateContract` stub in [`src/app/contracts/page.tsx`](src/app/contracts/page.tsx) builds a placeholder `Contract` whose parties use **Ethereum-style `0x...` addresses** (`0x0000...0001`, `0x0000...0002`). TalentTrust is a Stellar app — every other display path uses `G...` keys — so the stubbed data is inconsistent and will fail the `isValidStellarAddress` check added in [`src/lib/stellarAddress.ts`](src/lib/stellarAddress.ts). This issue corrects the stub to use plausible Stellar addresses and validates them through the existing helper.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Replace the `0x...` party addresses with plausible `G...` Stellar public keys and run them through `normalizeStellarAddress`/`isValidStellarAddress` from [`src/lib/stellarAddress.ts`](src/lib/stellarAddress.ts) before saving.
- Keep the additive `saveContract`/`listContracts` flow from [`src/lib/repository.ts`](src/lib/repository.ts) intact; only the address values and a validation guard change.
- Do not regress the `EmptyState` → list transition or the `Contract` typing imported from [`src/types/domain.ts`](src/types/domain.ts).
- Keep the handler a clearly-marked stub until a real form lands.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b refactor/contracts-03-stellar-stub-addresses`
- Implement changes
  - **Write code in:** [`src/app/contracts/page.tsx`](src/app/contracts/page.tsx).
  - **Write comprehensive tests in:** [`src/app/contracts/__tests__/page.test.tsx`](src/app/contracts/__tests__/page.test.tsx) (extend) — created contract persists, addresses pass `isValidStellarAddress`.
  - **Add documentation:** note the Stellar address convention in [`docs/persistence.md`](docs/persistence.md).
  - Add JSDoc to the stub clarifying the validation step.
  - Validate that saved party addresses are valid Stellar keys.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: empty store, repeated create, list re-render after save.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`refactor(contracts): use Stellar G-addresses in the contract create stub`

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
title: "Wire the Milestones page Add Milestone handler to the repository instead of console.log"
labels: type:feature, area:milestones, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Wire the Milestones page Add Milestone handler to the repository instead of console.log

### Description
[`src/app/milestones/page.tsx`](src/app/milestones/page.tsx) renders from a hard-coded `SAMPLE_MILESTONES` constant and its `handleAddMilestone` only calls `console.log('Add milestone')`, so nothing a user adds is ever stored or shown. Meanwhile [`src/lib/repository.ts`](src/lib/repository.ts) already exposes `listMilestones`/`saveMilestone`. This issue replaces the sample constant with repository-backed state and makes "Add Milestone" actually persist, mirroring how the Contracts page already uses the repository.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Initialise milestones from `listMilestones()` (falling back to seeded samples only when the store is empty), and have `handleAddMilestone` call `saveMilestone(...)` then re-read state so the list and filter update immediately.
- Keep the existing `MilestoneFilter` radiogroup and the empty/no-match `EmptyState` branches working against the live list.
- Reuse the `Milestone` type from [`src/types/domain.ts`](src/types/domain.ts); do not introduce a parallel shape.
- Guard for SSR via the repository's existing browser checks.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/milestones-04-persist-add-milestone`
- Implement changes
  - **Write code in:** [`src/app/milestones/page.tsx`](src/app/milestones/page.tsx).
  - **Write comprehensive tests in:** [`src/app/milestones/__tests__/page.test.tsx`](src/app/milestones/__tests__/page.test.tsx) (extend) — add persists, filter still works, empty store path.
  - **Add documentation:** update [`docs/persistence.md`](docs/persistence.md) with the milestones flow.
  - Add JSDoc to the add handler.
  - Validate a11y: filter and result announcements still fire after add.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: empty store, add then filter, add while a filter is active.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(milestones): persist added milestones through the repository`

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
title: "Add deleteContract and deleteMilestone operations to the localStorage repository"
labels: type:feature, area:persistence, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add deleteContract and deleteMilestone operations to the localStorage repository

### Description
[`src/lib/repository.ts`](src/lib/repository.ts) only supports append-style writes (`saveContract`/`saveMilestone`) and reads — there is no way to remove a record, so a user who creates a wrong contract or milestone is stuck with it forever. This issue adds delete (and a paired update) capability to the repository so the create flows on the Contracts and Milestones pages can become editable.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add `deleteMilestone(id)` keyed on the existing `Milestone.id`, and `deleteContract` keyed on a stable identifier (introduce/document one if `Contract` lacks an `id`).
- Keep all writes non-mutating, SSR-safe, and wrapped in the existing try/catch + console.warn fallback pattern; preserve the single `STORAGE_KEY` shape.
- Make deletes idempotent (deleting a missing id is a no-op, never a throw) and additive-safe (deleting a milestone must not touch contracts and vice versa).
- Do not change the signatures of the existing read/save functions.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/persistence-05-repository-delete`
- Implement changes
  - **Write code in:** [`src/lib/repository.ts`](src/lib/repository.ts).
  - **Write comprehensive tests in:** [`src/lib/__tests__/repository.test.ts`](src/lib/__tests__/repository.test.ts) (extend) — delete existing, delete missing id, delete preserves the other collection, SSR no-op.
  - **Add documentation:** update [`docs/persistence.md`](docs/persistence.md) with the delete API.
  - Add JSDoc to each new function.
  - Validate security: namespaced key untouched, no cross-collection corruption.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: empty store, corrupt JSON, delete all, delete one of many.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(persistence): add delete operations for contracts and milestones`

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
title: "Emit a storage event so open tabs stay in sync when the repository changes"
labels: type:enhancement, area:persistence, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Emit a storage event so open tabs stay in sync when the repository changes

### Description
[`src/lib/repository.ts`](src/lib/repository.ts) writes to a single `localStorage` key, but the Contracts and Milestones pages each hold their own React state seeded once from the repository. If a user has the app open in two tabs, creating a contract in one tab never updates the other, and `localStorage` writes from the same tab do not fire a `storage` event at all. This issue adds a tiny subscription mechanism so consumers can react to repository changes within and across tabs.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add a `subscribe(listener)` (returning an unsubscribe) to the repository that fires after each successful write, and also bridge the native cross-tab `storage` event for the `STORAGE_KEY`.
- Keep all functions SSR-safe and the existing read/save/delete signatures unchanged; the subscription must be a no-op on the server.
- Provide a small `useRepositoryData` example or hook usage so the Contracts/Milestones pages can opt in without prop drilling.
- Ensure listeners are cleaned up to avoid leaks.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/persistence-06-storage-sync`
- Implement changes
  - **Write code in:** [`src/lib/repository.ts`](src/lib/repository.ts) (and optionally a small hook in `src/lib`).
  - **Write comprehensive tests in:** [`src/lib/__tests__/repository.test.ts`](src/lib/__tests__/repository.test.ts) (extend) — listener fires on save/delete, unsubscribe stops it, SSR no-op, cross-tab storage event handled.
  - **Add documentation:** update [`docs/persistence.md`](docs/persistence.md) with the subscription contract.
  - Add JSDoc to `subscribe` and the hook.
  - Validate no listener leaks on repeated subscribe/unsubscribe.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: multiple listeners, unsubscribe mid-flight, SSR, malformed event payload.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(persistence): add repository change subscription with cross-tab sync`

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
title: "Validate persisted repository records against a typed schema before returning them"
labels: type:security, area:persistence, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Validate persisted repository records against a typed schema before returning them

### Description
`readStore()` in [`src/lib/repository.ts`](src/lib/repository.ts) only checks that `contracts`/`milestones` are arrays — it does **not** validate the shape of each element. A tampered or version-skewed `talenttrust_app_data` value can therefore feed arbitrary objects straight into [`ContractSummary`](src/components/ContractSummary.tsx) and [`MilestonesList`](src/components/MilestonesList.tsx), where missing `payout`/`status`/`address` fields cause runtime errors or render attacker-controlled strings. This issue adds per-record validation so only well-formed entries survive a read.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add pure guards (e.g. `isMilestone`, `isContract`) that check required fields and that `status` is one of the allowed `StatusType` values, and filter out any element that fails — never throw.
- Reject prototype-polluting keys and coerce nothing silently; drop bad records and `console.warn` once, mirroring the existing fallback style.
- Keep the public API and the `STORAGE_KEY` unchanged; validation lives behind `readStore`.
- Treat amounts as finite non-negative numbers.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b security/persistence-07-validate-records`
- Implement changes
  - **Write code in:** [`src/lib/repository.ts`](src/lib/repository.ts) (extract guards if helpful).
  - **Write comprehensive tests in:** [`src/lib/__tests__/repository.test.ts`](src/lib/__tests__/repository.test.ts) (extend) — invalid status dropped, missing fields dropped, `__proto__` payload, mixed valid/invalid array.
  - **Add documentation:** add a "Data validation" note to [`docs/persistence.md`](docs/persistence.md).
  - Add JSDoc to each guard.
  - Validate security: no prototype pollution, no malformed record reaches the UI.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: empty arrays, all invalid, partial valid, non-object elements.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(persistence): validate persisted records before returning from the repository`

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
title: "Render the Contracts list with ContractSummary cards instead of the placeholder list items"
labels: type:enhancement, area:contracts, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Render the Contracts list with ContractSummary cards instead of the placeholder list items

### Description
The populated branch of [`src/app/contracts/page.tsx`](src/app/contracts/page.tsx) is explicitly marked `// TODO: Replace with a proper ContractSummary list component` and renders each contract as a bare `<li>` with only name and status. The rich [`ContractSummary`](src/components/ContractSummary.tsx) component (value, parties, milestone count, status badge) already exists and is used on the detail page. This issue replaces the placeholder list with a proper card layout linking through to each contract.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Render each persisted `Contract` as a compact card (reuse `ContractSummary` or extract a `ContractCard` from it) showing value via `formatAmount`, status via `StatusBadge`, and milestone count, wrapped in a `next/link` to `/contracts/[id]`.
- Keep the `EmptyState` branch and the create flow; do not regress the repository-backed state.
- Maintain a responsive grid that does not overflow at 320px width and keeps headings in order.
- Reuse the `Contract` type from [`src/types/domain.ts`](src/types/domain.ts).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/contracts-08-summary-card-list`
- Implement changes
  - **Write code in:** [`src/app/contracts/page.tsx`](src/app/contracts/page.tsx) and optionally create `src/components/contracts/ContractCard.tsx`.
  - **Write comprehensive tests in:** [`src/app/contracts/__tests__/page.test.tsx`](src/app/contracts/__tests__/page.test.tsx) (extend) — cards render, links present, empty state preserved.
  - **Add documentation:** add `docs/components/ContractCard.md` or update [`docs/components/ContractSummary.md`](docs/components/ContractSummary.md).
  - Add JSDoc to the card component.
  - Validate a11y: each card is a labelled, keyboard-reachable link.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: zero contracts, one contract, many contracts, long names.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(contracts): render contract list as ContractSummary cards with links`

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
title: "Flag overdue milestones by comparing dueDate against the current date in MilestonesList"
labels: type:feature, area:milestones, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Flag overdue milestones by comparing dueDate against the current date in MilestonesList

### Description
[`src/components/MilestonesList.tsx`](src/components/MilestonesList.tsx) shows each milestone's `dueDate` as plain text ("Due 2026-06-01") with no indication of whether a `Pending` milestone is already past due. For a payments product, an overdue, unpaid milestone is exactly what a user needs to spot at a glance. This issue adds a non-color-only "Overdue" indicator for past-due, not-yet-paid milestones.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add a pure helper (e.g. `src/lib/milestoneStatus.ts`) that, given a `Milestone` and a reference date, returns whether it is overdue (a past `dueDate` while status is `Pending`/`Disputed`, never for `Paid`/`Completed`).
- Render an accessible "Overdue" marker (icon + text, not color alone) next to the due date, consistent with the `StatusBadge` non-color-only pattern.
- Keep the reference date injectable for deterministic tests; default to `new Date()`.
- Do not mutate the incoming milestones array; preserve the existing total count and scroll container.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/milestones-09-overdue-indicator`
- Implement changes
  - **Write code in:** [`src/components/MilestonesList.tsx`](src/components/MilestonesList.tsx) and create [`src/lib/milestoneStatus.ts`](src/lib/milestoneStatus.ts).
  - **Write comprehensive tests in:** create [`src/lib/__tests__/milestoneStatus.test.ts`](src/lib/__tests__/milestoneStatus.test.ts) and extend [`src/components/__tests__/MilestonesList.test.tsx`](src/components/__tests__/MilestonesList.test.tsx).
  - **Add documentation:** add a note to `docs/components` describing the overdue rule.
  - Add JSDoc to the helper.
  - Validate a11y: overdue conveyed by text + icon, axe clean.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: missing dueDate, future date, exactly today, Paid milestone never overdue.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(milestones): flag overdue pending milestones with an accessible marker`

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
title: "Add a localized, accessible date formatter for milestone due dates"
labels: type:feature, area:utils, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add a localized, accessible date formatter for milestone due dates

### Description
Due dates are displayed inconsistently across the app — [`src/app/contracts/[id]/page.tsx`](src/app/contracts/%5Bid%5D/page.tsx) uses raw ISO strings like `2026-06-01`, while the contracts create stub in [`src/app/contracts/page.tsx`](src/app/contracts/page.tsx) uses `toLocaleDateString('en-US', ...)`. [`MilestonesList`](src/components/MilestonesList.tsx) just prints whatever string it receives. This issue adds one pure date formatter so dates render consistently and are wrapped in a machine-readable `<time>` element for assistive tech.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Create `src/lib/formatDate.ts` exporting `formatDate(value): string` that accepts ISO strings or `Date`, returns a stable human-readable form, and returns a safe fallback (e.g. "TBD") for empty/invalid input — never throwing.
- Render due dates through a `<time dateTime="<ISO>">` element in `MilestonesList` so screen readers and crawlers get the canonical value.
- Keep the function locale-robust and deterministic in tests (allow an injectable locale).
- Wire it into at least `MilestonesList` to prove integration.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/utils-10-format-date`
- Implement changes
  - **Write code in:** create [`src/lib/formatDate.ts`](src/lib/formatDate.ts); wire into [`src/components/MilestonesList.tsx`](src/components/MilestonesList.tsx).
  - **Write comprehensive tests in:** create [`src/lib/__tests__/formatDate.test.ts`](src/lib/__tests__/formatDate.test.ts).
  - **Add documentation:** add a utils note to [`README.md`](README.md).
  - Add JSDoc describing accepted inputs and the fallback.
  - Validate a11y: `<time dateTime>` carries the ISO value.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: empty string, invalid date, ISO string, Date instance.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(utils): add accessible date formatter for milestone due dates`

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
title: "Make the ReputationProfile score scale configurable instead of hard-coding out of 5"
labels: type:enhancement, area:reputation, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Make the ReputationProfile score scale configurable instead of hard-coding out of 5

### Description
[`src/components/ReputationProfile.tsx`](src/components/ReputationProfile.tsx) renders the score with a hard-coded screen-reader suffix `<span className="sr-only"> out of 5</span>`, but nothing constrains `score` to a 0–5 range — any number is accepted and displayed. A score of 87 would be announced as "87 out of 5", which is misleading for screen-reader users. This issue makes the scale explicit and consistent.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add an optional `maxScore` prop (default 5) and use it in both the visible value and the `sr-only` "out of N" announcement so the spoken and shown values agree.
- Optionally clamp/validate `score` against `[0, maxScore]` and document the behavior for out-of-range input.
- Reuse the exported `ReputationProfileProps` type; keep the existing `hasReputation`/`showPartial`/history branches and `aria-labelledby` wiring intact.
- Do not change the `Reputation`/`ReputationProfileProps` re-exports in [`src/types/domain.ts`](src/types/domain.ts) in a breaking way.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/reputation-11-configurable-score-scale`
- Implement changes
  - **Write code in:** [`src/components/ReputationProfile.tsx`](src/components/ReputationProfile.tsx).
  - **Write comprehensive tests in:** [`src/components/ReputationProfile.test.tsx`](src/components/ReputationProfile.test.tsx) (extend) — default scale, custom `maxScore`, out-of-range value, sr-only suffix matches.
  - **Add documentation:** update [`docs/components/ReputationPage.md`](docs/components/ReputationPage.md).
  - Add JSDoc to the new prop.
  - Validate a11y: spoken "out of N" matches the visible scale.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: score 0, score at max, score above max, undefined score.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(reputation): make the score scale configurable via maxScore`

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
title: "Guard the ReputationProfile avatar initial against empty names"
labels: type:enhancement, area:reputation, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Guard the ReputationProfile avatar initial against empty names

### Description
[`src/components/ReputationProfile.tsx`](src/components/ReputationProfile.tsx) builds the avatar tile from `name.slice(0, 1).toUpperCase()`. When `name` is an empty string the tile renders blank, and the heading "Reputation profile for " trails off with no name — an ugly edge that is easy to hit with placeholder data. This issue makes the avatar and heading robust to empty, whitespace, or emoji-leading names.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Derive the avatar initial from the first non-whitespace character, falling back to a neutral placeholder (e.g. "?") when `name` is empty/whitespace.
- Ensure the visually-hidden heading still reads sensibly when `name` is missing.
- Handle multi-byte/emoji first characters without producing a broken glyph.
- Keep the component's props and layout unchanged otherwise.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/reputation-12-avatar-initial-guard`
- Implement changes
  - **Write code in:** [`src/components/ReputationProfile.tsx`](src/components/ReputationProfile.tsx) (extract a small `getInitial` helper if useful).
  - **Write comprehensive tests in:** [`src/components/ReputationProfile.test.tsx`](src/components/ReputationProfile.test.tsx) (extend) — empty name, whitespace name, normal name, emoji-leading name.
  - **Add documentation:** note the behavior in [`docs/components/ReputationPage.md`](docs/components/ReputationPage.md).
  - Add JSDoc to the initial helper.
  - Validate a11y: heading remains meaningful with empty name.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: empty, whitespace-only, single char, emoji, leading space.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`fix(reputation): guard avatar initial and heading against empty names`

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
title: "Add a sortable, accessible total-payout footer to MilestonesList"
labels: type:feature, area:milestones, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add a sortable, accessible total-payout footer to MilestonesList

### Description
[`src/components/MilestonesList.tsx`](src/components/MilestonesList.tsx) shows each milestone's payout but never sums them, so a user cannot see the total contract value represented by the list or how much remains unpaid. This issue adds an accessible footer that totals payouts (and breaks them down by paid vs outstanding) using the existing `formatAmount`.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add a pure helper that, given `Milestone[]`, returns total, paid (status `Paid`/`Completed`), and outstanding sums; render them in an accessible footer beneath the list.
- Format every amount via `formatAmount` from [`src/lib/preferences.tsx`](src/lib/preferences.tsx); handle mixed currencies safely (group or label per currency rather than summing across currencies).
- Keep the component presentational and non-mutating; preserve the existing heading and total-count.
- Announce the totals in a way that is readable by assistive tech (proper labels, not a bare number).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/milestones-13-payout-totals-footer`
- Implement changes
  - **Write code in:** [`src/components/MilestonesList.tsx`](src/components/MilestonesList.tsx) (and a totals helper in `src/lib`).
  - **Write comprehensive tests in:** [`src/components/__tests__/MilestonesList.test.tsx`](src/components/__tests__/MilestonesList.test.tsx) (extend) — totals math, all-paid, none-paid, mixed currency.
  - **Add documentation:** add a note to `docs/components` describing the footer.
  - Add JSDoc to the totals helper.
  - Validate a11y: labelled totals, axe clean.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: empty list, single milestone, mixed currencies, zero payouts.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(milestones): add accessible payout totals footer to the list`

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
title: "Add tests for the Navbar active-route highlighting and aria-current wiring"
labels: type:test, area:navigation, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add tests for the Navbar active-route highlighting and aria-current wiring

### Description
[`src/components/Navbar.tsx`](src/components/Navbar.tsx) marks the current route with `aria-current="page"` based on `usePathname`, applies an active style, and lists `/contracts`, `/milestones`, `/reputation`. The test file [`src/components/__tests__/Navbar.test.tsx`](src/components/__tests__/Navbar.test.tsx) should fully lock down this behavior across routes, since the navbar is mounted in the root layout on every page.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Mock `usePathname` from `next/navigation` and assert that exactly the matching link carries `aria-current="page"` for each route, and none does on an unrelated path.
- Assert all three labelled links render with correct hrefs and that the active link gets the active class while others do not.
- Add a `jest-axe` assertion via [`src/test-utils/a11y.tsx`](src/test-utils/a11y.tsx).
- Cover the trailing-slash / unknown-path case (no active link).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/navigation-14-navbar-active-route`
- Implement changes
  - **Write code in:** no source change expected unless a real bug is found in [`src/components/Navbar.tsx`](src/components/Navbar.tsx).
  - **Write comprehensive tests in:** [`src/components/__tests__/Navbar.test.tsx`](src/components/__tests__/Navbar.test.tsx) (extend).
  - **Add documentation:** update [`docs/components/Navbar.md`](docs/components/Navbar.md) with tested guarantees.
  - Add JSDoc clarifications if behavior is ambiguous.
  - Validate a11y: `aria-current`, focus rings, axe clean.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: each active route, unknown path, nested path under a route.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`test(navigation): cover Navbar active route and aria-current wiring`

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
title: "Add tests for the ConfirmDialog focus trap, Escape, and backdrop-click behavior"
labels: type:test, area:dialog, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add tests for the ConfirmDialog focus trap, Escape, and backdrop-click behavior

### Description
[`src/components/ConfirmDialog.tsx`](src/components/ConfirmDialog.tsx) implements a modal with a focus trap, initial focus on cancel, Escape-to-cancel, and a backdrop click that cancels — but there is no test file for it, even though it gates the destructive Release/Dispute flows in [`ActionPanel`](src/components/ActionPanel.tsx). This issue adds focused coverage so the dialog's keyboard and pointer contract is guaranteed.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Assert closed state renders nothing, open state has `role="dialog"`, `aria-modal`, and `aria-labelledby`, and initial focus lands on the cancel button.
- Verify Escape and backdrop click both call `onCancel`, the confirm button calls `onConfirm`, and Tab/Shift+Tab wrap between the two buttons.
- Add a `jest-axe` assertion for the open state via [`src/test-utils/a11y.tsx`](src/test-utils/a11y.tsx).
- Keep the listener cleanup deterministic (no leaks across rerenders).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/dialog-15-confirmdialog`
- Implement changes
  - **Write code in:** no source change expected unless a real bug is found in [`src/components/ConfirmDialog.tsx`](src/components/ConfirmDialog.tsx).
  - **Write comprehensive tests in:** create [`src/components/__tests__/ConfirmDialog.test.tsx`](src/components/__tests__/ConfirmDialog.test.tsx).
  - **Add documentation:** add or update `docs/components/ConfirmDialog.md`.
  - Add JSDoc clarifications to the focus-trap effect if helpful.
  - Validate a11y: dialog semantics and axe clean.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: Tab wrap both directions, Escape, backdrop click, reopen.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`test(dialog): cover ConfirmDialog focus trap, Escape, and backdrop cancel`

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
title: "Add tests for the localStorage repository read, save, and SSR-safety paths"
labels: type:test, area:persistence, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add tests for the localStorage repository read, save, and SSR-safety paths

### Description
[`src/lib/repository.ts`](src/lib/repository.ts) is the durable store behind the Contracts and Milestones pages, with several branches: SSR no-op (`typeof window` guard), corrupt-JSON fallback, non-array shape coercion, and additive writes that preserve the other collection. The test file [`src/lib/__tests__/repository.test.ts`](src/lib/__tests__/repository.test.ts) should fully cover these so a regression cannot silently lose user data.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Cover: empty store returns `[]`, write-then-read round trip for both collections, `saveContract` preserves milestones (and vice versa), corrupt JSON falls back to empty with a warning, and a non-array `contracts`/`milestones` value coerces to `[]`.
- Simulate the SSR path (no `window`) and assert reads return empty and writes are no-ops without throwing.
- Assert the single `STORAGE_KEY` is used and not duplicated.
- Reset `localStorage` between tests for isolation.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/persistence-16-repository-coverage`
- Implement changes
  - **Write code in:** no source change expected unless a real bug is found in [`src/lib/repository.ts`](src/lib/repository.ts).
  - **Write comprehensive tests in:** [`src/lib/__tests__/repository.test.ts`](src/lib/__tests__/repository.test.ts) (extend).
  - **Add documentation:** update [`docs/persistence.md`](docs/persistence.md) with the tested guarantees.
  - Add JSDoc clarifications if behavior needs documenting.
  - Validate determinism across runs.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: empty, corrupt, non-array shape, SSR, round trip.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`test(persistence): cover repository read/save and SSR-safety branches`

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
title: "Add tests for the ThemeToggle cycle, ARIA state, and preferences wiring"
labels: type:test, area:theming, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add tests for the ThemeToggle cycle, ARIA state, and preferences wiring

### Description
[`src/components/ThemeToggle.tsx`](src/components/ThemeToggle.tsx) is mounted in the header in [`src/app/layout.tsx`](src/app/layout.tsx) and drives `updatePreference('theme', ...)` from [`src/lib/preferences.tsx`](src/lib/preferences.tsx). The test file [`src/components/__tests__/ThemeToggle.test.tsx`](src/components/__tests__/ThemeToggle.test.tsx) should comprehensively cover the toggle behavior, accessible labelling, and that it calls the preferences API with the expected value for each starting theme.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Wrap renders in `PreferencesProvider`; assert clicking toggles light↔dark and calls `updatePreference('theme', ...)` with the expected value, including the behavior when starting from "system".
- Assert the accessible label/`aria-pressed` (or equivalent) reflects the current state and updates after a click.
- Add a `jest-axe` assertion for both states.
- Keep tests deterministic regardless of any media-query mock.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/theming-17-themetoggle`
- Implement changes
  - **Write code in:** no source change expected unless a real bug is found in [`src/components/ThemeToggle.tsx`](src/components/ThemeToggle.tsx).
  - **Write comprehensive tests in:** [`src/components/__tests__/ThemeToggle.test.tsx`](src/components/__tests__/ThemeToggle.test.tsx) (extend).
  - **Add documentation:** update [`docs/components/Preferences.md`](docs/components/Preferences.md).
  - Add JSDoc clarifications if needed.
  - Validate a11y: labelled toggle, state announced, axe clean.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: light→dark, dark→light, starting from system, label reflects state.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`test(theming): cover ThemeToggle cycle, ARIA state, and preferences wiring`

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
title: "Add tests for the RouteAnnouncer main-focus and h1 announcement on navigation"
labels: type:test, area:a11y, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add tests for the RouteAnnouncer main-focus and h1 announcement on navigation

### Description
[`src/components/RouteAnnouncer.tsx`](src/components/RouteAnnouncer.tsx) focuses the `<main>` landmark and announces the new page's `<h1>` (or a pathname fallback) through a visually hidden `role="status"` region on each `pathname` change. The test file [`src/components/__tests__/RouteAnnouncer.test.tsx`](src/components/__tests__/RouteAnnouncer.test.tsx) should fully cover this, since it is the project's screen-reader navigation backbone mounted in the root layout.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Mock `usePathname` and assert: no announcement on initial mount (same path), an announcement built from the page `<h1>` on path change, and the `"Page: <pathname>"` fallback when no `<h1>` exists.
- Assert the `<main>` element receives focus on navigation (render a `<main tabIndex={-1}>` in the harness).
- Verify the live region is `role="status"`, `aria-atomic`, and `sr-only`.
- Add a `jest-axe` assertion.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/a11y-18-routeannouncer`
- Implement changes
  - **Write code in:** no source change expected unless a real bug is found in [`src/components/RouteAnnouncer.tsx`](src/components/RouteAnnouncer.tsx).
  - **Write comprehensive tests in:** [`src/components/__tests__/RouteAnnouncer.test.tsx`](src/components/__tests__/RouteAnnouncer.test.tsx) (extend).
  - **Add documentation:** note the tested guarantees in [`docs/components/Accessibility.md`](docs/components/Accessibility.md).
  - Add JSDoc clarifications if needed.
  - Validate a11y: focus moves to main, status announced.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: same-path rerender, missing h1, multiple consecutive navigations.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`test(a11y): cover RouteAnnouncer focus and h1 announcement`

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
title: "Add tests for the MilestoneFilter radiogroup selection and live result announcement"
labels: type:test, area:milestones, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add tests for the MilestoneFilter radiogroup selection and live result announcement

### Description
[`src/components/milestones/MilestoneFilter.tsx`](src/components/milestones/MilestoneFilter.tsx) renders an accessible `radiogroup` of status options with an `aria-live` count region, but it has no dedicated test file — it is only exercised indirectly through the milestones page. This issue adds focused coverage for the selection callback, the singular/plural count message, and the radiogroup semantics.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Assert all five options render, the `selected` option is checked, and choosing another calls `onChange` with the new value.
- Assert the `aria-live` message text for "All" vs a specific status, and singular vs plural (`resultCount` of 1 vs many vs 0).
- Verify the `fieldset`/`legend` and `role="radiogroup"` labelling.
- Add a `jest-axe` assertion via [`src/test-utils/a11y.tsx`](src/test-utils/a11y.tsx).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/milestones-19-milestonefilter`
- Implement changes
  - **Write code in:** no source change expected unless a real bug is found in [`src/components/milestones/MilestoneFilter.tsx`](src/components/milestones/MilestoneFilter.tsx).
  - **Write comprehensive tests in:** create [`src/components/milestones/__tests__/MilestoneFilter.test.tsx`](src/components/milestones/__tests__/MilestoneFilter.test.tsx).
  - **Add documentation:** add a note to `docs/components` describing the filter contract.
  - Add JSDoc clarifications if needed.
  - Validate a11y: radiogroup, live count, axe clean.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: count 0, count 1, count many, switching between options.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`test(milestones): cover MilestoneFilter selection and live count`

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
title: "Add tests for the contract detail page id validation and notFound redirect"
labels: type:test, area:contracts, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add tests for the contract detail page id validation and notFound redirect

### Description
[`src/app/contracts/[id]/page.tsx`](src/app/contracts/%5Bid%5D/page.tsx) awaits the route `params`, runs the id through `isValidContractId` from [`src/lib/validateContractId.ts`](src/lib/validateContractId.ts), and calls Next's `notFound()` for invalid ids before rendering `ContractSummary`/`MilestonesList`/`ActionPanel`. The test file [`src/app/contracts/[id]/__tests__/page.test.tsx`](src/app/contracts/%5Bid%5D/__tests__/page.test.tsx) should cover both the valid render and the `notFound` path for malicious ids.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Mock `next/navigation`'s `notFound` and assert it is called for invalid ids (empty, over-length, charset-violating) and not called for a valid id.
- For a valid id, assert the heading `Contract #{id}`, the summary, milestones list, and action panel all render.
- Render with the required providers (preferences/wallet) so child components mount.
- Keep the async-`params` await pattern handled correctly in the test.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/contracts-20-detail-id-validation`
- Implement changes
  - **Write code in:** no source change expected unless a real bug is found in [`src/app/contracts/[id]/page.tsx`](src/app/contracts/%5Bid%5D/page.tsx).
  - **Write comprehensive tests in:** [`src/app/contracts/[id]/__tests__/page.test.tsx`](src/app/contracts/%5Bid%5D/__tests__/page.test.tsx) (extend).
  - **Add documentation:** update [`docs/components/ContractDetail.md`](docs/components/ContractDetail.md).
  - Add JSDoc clarifications if needed.
  - Validate the security guard: invalid ids never render content.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: valid id, empty id, over-length id, id with `/` or `<script>`.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`test(contracts): cover detail-page id validation and notFound redirect`

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
title: "Add tests for the EmptyState illustration variants and primary/secondary actions"
labels: type:test, area:empty-state, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add tests for the EmptyState illustration variants and primary/secondary actions

### Description
[`src/components/EmptyState.tsx`](src/components/EmptyState.tsx) renders one of three illustration variants (`contracts`/`milestones`/`reputation`), an optional custom `icon`, and optional primary and secondary action buttons, wrapped in a labelled `role="region"`. The test file [`src/components/__tests__/EmptyState.test.tsx`](src/components/__tests__/EmptyState.test.tsx) should fully cover these branches since `EmptyState` appears on every content route.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Assert each `illustration` variant renders its SVG (decorative `aria-hidden`) and the matching ring/background class, and that a custom `icon` takes precedence.
- Assert the region is labelled by the title via `useId`, the primary action fires `onAction`, and the secondary action fires `onSecondaryAction` only when both label and handler are present.
- Assert no action container renders when neither action pair is provided.
- Add a `jest-axe` assertion via [`src/test-utils/a11y.tsx`](src/test-utils/a11y.tsx).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/empty-state-21-emptystate-variants`
- Implement changes
  - **Write code in:** no source change expected unless a real bug is found in [`src/components/EmptyState.tsx`](src/components/EmptyState.tsx).
  - **Write comprehensive tests in:** [`src/components/__tests__/EmptyState.test.tsx`](src/components/__tests__/EmptyState.test.tsx) (extend).
  - **Add documentation:** update [`docs/components/EmptyState.md`](docs/components/EmptyState.md) with tested guarantees.
  - Add JSDoc clarifications if needed.
  - Validate a11y: labelled region, decorative icon, axe clean.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: no actions, primary only, both actions, custom icon vs illustration.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`test(empty-state): cover EmptyState variants and action buttons`

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
title: "Add tests for the StatusBadge icon/label pairing and Paid status rendering"
labels: type:test, area:status, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add tests for the StatusBadge icon/label pairing and Paid status rendering

### Description
[`src/components/StatusBadge.tsx`](src/components/StatusBadge.tsx) maps each `StatusType` (`Active`/`Completed`/`Disputed`/`Pending`/`Paid`) to a CSS-variable color pair and a decorative icon, exposing `role="status"` with an `aria-label`, so meaning is never color-only (WCAG 1.4.1). The test file [`src/components/__tests__/StatusBadge.test.tsx`](src/components/__tests__/StatusBadge.test.tsx) should cover every status, the `aria-hidden` icon, and the `aria-label` text.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Assert each of the five statuses renders its visible label, its decorative `aria-hidden` icon, and an `aria-label` of `Status: <status>`.
- Assert the `role="status"` is present and that a passed `className` is appended without dropping the base classes.
- Confirm the non-color-only guarantee (label text present alongside the icon) for each status.
- Add a `jest-axe` assertion via [`src/test-utils/a11y.tsx`](src/test-utils/a11y.tsx).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/status-22-statusbadge`
- Implement changes
  - **Write code in:** no source change expected unless a real bug is found in [`src/components/StatusBadge.tsx`](src/components/StatusBadge.tsx).
  - **Write comprehensive tests in:** [`src/components/__tests__/StatusBadge.test.tsx`](src/components/__tests__/StatusBadge.test.tsx) (extend).
  - **Add documentation:** update [`docs/components/StatusBadge.md`](docs/components/StatusBadge.md) with the tested guarantees.
  - Add JSDoc clarifications if needed.
  - Validate a11y: non-color-only meaning, axe clean.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: all five statuses, with and without `className`.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`test(status): cover StatusBadge icon/label pairing for every status`

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
title: "Add a centralized currency catalog and validation to replace free-text currency strings"
labels: type:refactor, area:preferences, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add a centralized currency catalog and validation to replace free-text currency strings

### Description
`currency` is a free-form `string` throughout the app — on [`Milestone`](src/components/MilestonesList.tsx), [`ContractSummaryProps`](src/components/ContractSummary.tsx), and the stub data in [`src/app/contracts/page.tsx`](src/app/contracts/page.tsx) — and `formatAmount` in [`src/lib/preferences.tsx`](src/lib/preferences.tsx) passes it straight to `Intl.NumberFormat`, which throws on an invalid code. This issue introduces a small supported-currency catalog and a validated type so bad codes are caught before they reach `Intl`.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Create `src/lib/currency.ts` exporting a `SUPPORTED_CURRENCIES` list, an `isSupportedCurrency` guard, and a `safeCurrency(code)` that falls back to a documented default rather than throwing.
- Have `formatAmount` route its `currency` argument through `safeCurrency` so an unknown code degrades gracefully instead of throwing.
- Keep the public `formatAmount` signature unchanged; do not break the `amountFormat` (usd/ngn/compact) branches.
- Document the supported set and the fallback behavior.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b refactor/preferences-23-currency-catalog`
- Implement changes
  - **Write code in:** create [`src/lib/currency.ts`](src/lib/currency.ts); update [`src/lib/preferences.tsx`](src/lib/preferences.tsx).
  - **Write comprehensive tests in:** create [`src/lib/__tests__/currency.test.ts`](src/lib/__tests__/currency.test.ts) and extend [`src/lib/__tests__/preferences.test.tsx`](src/lib/__tests__/preferences.test.tsx).
  - **Add documentation:** update [`docs/components/Preferences.md`](docs/components/Preferences.md) with the catalog and fallback.
  - Add JSDoc to the guard and `safeCurrency`.
  - Validate that an unknown code never throws from `formatAmount`.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: known code, unknown code, lowercase code, empty string.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`refactor(preferences): add currency catalog and safe formatting fallback`

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
title: "Extract the ConfirmDialog focus-trap into a reusable useFocusTrap hook shared with SettingsPanel"
labels: type:refactor, area:a11y, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Extract the ConfirmDialog focus-trap into a reusable useFocusTrap hook shared with SettingsPanel

### Description
The Tab/Shift+Tab wrap logic, Escape handling, and focusable-element query are duplicated between [`src/components/ConfirmDialog.tsx`](src/components/ConfirmDialog.tsx) and [`src/components/settings/SettingsPanel.tsx`](src/components/settings/SettingsPanel.tsx) (each maintains its own `FOCUSABLE_SELECTORS` and keydown handler). Duplicated focus-trap code drifts and is hard to keep correct. This issue extracts a single `useFocusTrap` hook both dialogs consume.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Create `src/hooks/useFocusTrap.ts` encapsulating: focusable-element query, Tab/Shift+Tab wrap, optional Escape-to-close callback, and listener cleanup.
- Refactor `ConfirmDialog` and `SettingsPanel` to use the hook with **no behavior change** — same initial focus, same Escape semantics, same wrap order.
- Keep both components' public props unchanged; this is an internal refactor.
- Ensure SSR safety (no document access during render).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b refactor/a11y-24-use-focus-trap`
- Implement changes
  - **Write code in:** create [`src/hooks/useFocusTrap.ts`](src/hooks/useFocusTrap.ts); update [`src/components/ConfirmDialog.tsx`](src/components/ConfirmDialog.tsx) and [`src/components/settings/SettingsPanel.tsx`](src/components/settings/SettingsPanel.tsx).
  - **Write comprehensive tests in:** create [`src/hooks/__tests__/useFocusTrap.test.tsx`](src/hooks/__tests__/useFocusTrap.test.tsx) and re-run the existing dialog/panel tests.
  - **Add documentation:** add `docs/hooks/useFocusTrap.md`.
  - Add JSDoc to the hook.
  - Validate a11y: identical focus behavior in both consumers, axe clean.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: single focusable, many focusables, Escape, no focusables.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`refactor(a11y): extract shared useFocusTrap hook for dialogs`

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
title: "Lock the ConfirmDialog body scroll while the modal is open"
labels: type:a11y, area:dialog, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Lock the ConfirmDialog body scroll while the modal is open

### Description
[`src/components/ConfirmDialog.tsx`](src/components/ConfirmDialog.tsx) overlays a full-screen backdrop but does not prevent the page behind it from scrolling. On touch and trackpad devices the background content scrolls under the modal, and screen-reader users can tab/scroll into content that should be inert. This issue locks body scroll (and ideally marks background content inert) while the dialog is open, restoring it on close.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- While `isOpen`, prevent body scroll (e.g. set `overflow: hidden` on `document.body`) and restore the previous value on close/unmount — no layout shift jump on restore.
- Guard all `document` access for SSR and clean up reliably even if the component unmounts while open.
- Keep the existing focus trap, Escape, and backdrop-cancel behavior unchanged.
- Optionally apply `aria-hidden`/`inert` to the app root behind the dialog if feasible without breaking the portal-less structure.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b a11y/dialog-25-body-scroll-lock`
- Implement changes
  - **Write code in:** [`src/components/ConfirmDialog.tsx`](src/components/ConfirmDialog.tsx).
  - **Write comprehensive tests in:** [`src/components/__tests__/ConfirmDialog.test.tsx`](src/components/__tests__/ConfirmDialog.test.tsx) (extend, or create) — body overflow set while open and restored on close/unmount.
  - **Add documentation:** update `docs/components/ConfirmDialog.md`.
  - Add JSDoc to the scroll-lock effect.
  - Validate a11y: background not scrollable while open, restored after.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: open/close cycle, unmount while open, nested overflow restore.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(a11y): lock body scroll while ConfirmDialog is open`

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
title: "Add a coverage threshold gate to the Jest configuration"
labels: type:test, area:tooling, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add a coverage threshold gate to the Jest configuration

### Description
Every issue in this campaign asks contributors for "minimum 95 percent test coverage", but [`jest.config.js`](jest.config.js) defines no `coverageThreshold`, so coverage is never actually enforced and a regression in test depth passes CI silently. This issue wires a coverage gate so the project's stated bar is machine-checked.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add a `coverageThreshold` (global, and optionally tightened per critical path such as `src/lib/**`) to [`jest.config.js`](jest.config.js), and ensure `collectCoverageFrom` targets `src/**` while excluding type-only and test files.
- Add a `test:coverage` npm script in [`package.json`](package.json) that runs `jest --coverage`.
- Pick an enforceable starting threshold that the current suite already passes (document the number) and note how to raise it over time.
- Do not break the existing `test` script or jsdom setup in [`jest.setup.js`](jest.setup.js).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/tooling-26-coverage-threshold`
- Implement changes
  - **Write code in:** [`jest.config.js`](jest.config.js) and [`package.json`](package.json).
  - **Write comprehensive tests in:** no new unit tests required; verify by running `jest --coverage` and capturing the summary.
  - **Add documentation:** add a "Coverage" section to [`README.md`](README.md) explaining the gate and the `test:coverage` script.
  - Add comments in the config explaining the thresholds.
  - Validate that `npm run test:coverage` passes at the chosen threshold.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, `npm run test:coverage`, and `npm run build`.
- Cover edge cases: threshold met (passes), artificially lowered file (fails), excludes applied.
- Include the full coverage summary in the PR description.

### Example commit message
`test(tooling): enforce a Jest coverage threshold gate`

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
title: "Add a typecheck npm script and wire it into the lint/test workflow"
labels: type:enhancement, area:tooling, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add a typecheck npm script and wire it into the lint/test workflow

### Description
[`package.json`](package.json) exposes `dev`, `build`, `start`, `lint`, and `test`, but there is no standalone TypeScript type-check script. Type errors are only surfaced during `next build`, so contributors editing isolated modules (e.g. [`src/lib/repository.ts`](src/lib/repository.ts) or [`src/types/domain.ts`](src/types/domain.ts)) cannot quickly verify types without a full build. This issue adds a fast `typecheck` script.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add a `typecheck` script running `tsc --noEmit` (respecting the existing [`tsconfig.json`](tsconfig.json)) and a combined `verify`/`ci` script that chains `lint`, `typecheck`, and `test` if appropriate.
- Ensure `tsc --noEmit` passes cleanly on the current codebase; fix or document any surfaced issues without changing runtime behavior.
- Do not introduce new dependencies beyond the already-present `typescript`.
- Keep existing scripts working unchanged.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/tooling-27-typecheck-script`
- Implement changes
  - **Write code in:** [`package.json`](package.json) (and minimal fixes if `tsc` surfaces real errors).
  - **Write comprehensive tests in:** not applicable; verify by running the new script and capturing output.
  - **Add documentation:** add a "Type checking" note to [`README.md`](README.md).
  - Add comments in `package.json` scripts if a chain is added.
  - Validate that `npm run typecheck` exits zero.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.
- Cover edge cases: clean run passes, an introduced type error fails the script.
- Include the full script output in the PR description.

### Example commit message
`chore(tooling): add a typecheck script using tsc --noEmit`

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
title: "Add a CI workflow that runs lint, typecheck, test, and build on pull requests"
labels: type:enhancement, area:ci, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add a CI workflow that runs lint, typecheck, test, and build on pull requests

### Description
The repository scripts in [`package.json`](package.json) (`lint`, `test`, `build`) are run only manually; there is no GitHub Actions workflow that gates pull requests, so a PR can merge with failing lint, broken types, or red tests. This issue adds a CI workflow that runs the full check suite on every PR and push to the default branch.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add `.github/workflows/ci.yml` that checks out the code, sets up Node (matching the engines used by `next` ^16), installs with `npm ci`, and runs `lint`, the `typecheck` script (if present), `test`, and `build`.
- Cache npm dependencies for faster runs and trigger on `pull_request` and pushes to the default branch.
- Keep secrets out of the workflow; it must run with no external services.
- Fail the job if any step fails.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/ci-28-pull-request-workflow`
- Implement changes
  - **Write code in:** create [`.github/workflows/ci.yml`](.github/workflows/ci.yml).
  - **Write comprehensive tests in:** not applicable; validate by confirming the workflow runs green on the PR.
  - **Add documentation:** add a "Continuous integration" section to [`README.md`](README.md) with a status-badge placeholder.
  - Add comments in the workflow explaining each step.
  - Validate that all steps pass on a clean checkout.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build` locally to mirror CI.
- Cover edge cases: clean PR passes, a failing step fails the job, cache hit/miss.
- Include the workflow run link or log excerpt in the PR description.

### Example commit message
`ci: add pull-request workflow running lint, typecheck, test, and build`

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
title: "Add print styles so contract and milestone pages produce a clean printout"
labels: type:enhancement, area:styling, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add print styles so contract and milestone pages produce a clean printout

### Description
There are no print styles in [`src/app/globals.css`](src/app/globals.css), so printing or saving a contract detail page to PDF includes the sticky header, the floating settings trigger, the wallet button, and the action panel — none of which belong in a printed record. For a payments product, a clean printable contract is genuinely useful. This issue adds a `@media print` stylesheet.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add `@media print` rules in [`src/app/globals.css`](src/app/globals.css) that hide the header nav, `SettingsTrigger`, `WalletConnectButton`, and `ActionPanel`, and flatten card shadows/backgrounds for ink economy.
- Ensure [`ContractSummary`](src/components/ContractSummary.tsx) and [`MilestonesList`](src/components/MilestonesList.tsx) remain fully visible and legible (expand the milestones scroll container so nothing is clipped).
- Use a dedicated `print:hidden`-style utility class or targeted selectors; do not affect screen rendering.
- Keep colors print-safe (avoid relying on background colors that browsers drop by default).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/styling-29-print-styles`
- Implement changes
  - **Write code in:** [`src/app/globals.css`](src/app/globals.css) (and add a marker class to chrome elements in [`src/app/layout.tsx`](src/app/layout.tsx) if needed).
  - **Write comprehensive tests in:** add a snapshot or class-presence assertion in an existing layout test ([`src/app/__tests__/layout.test.tsx`](src/app/__tests__/layout.test.tsx)) verifying print-hidden markers exist.
  - **Add documentation:** add a "Printing" note to [`README.md`](README.md).
  - Add comments in the CSS explaining the print intent.
  - Validate the milestones container is not clipped in print.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: header/trigger hidden, summary visible, long milestone list not clipped.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(styling): add print styles for contract and milestone pages`

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
title: "Make the MilestonesList scroll container height responsive instead of viewport-locked"
labels: type:enhancement, area:milestones, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Make the MilestonesList scroll container height responsive instead of viewport-locked

### Description
[`src/components/MilestonesList.tsx`](src/components/MilestonesList.tsx) hard-codes its inner scroll area to `max-h-[calc(100vh-260px)]`. The `260px` magic offset assumes a specific header/footer height, so when the component is placed on the milestones page (no detail header) versus the contract detail page (large header) the scroll region is either too tall or clips content, and on short viewports the list becomes unusable. This issue makes the height adaptive and configurable.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Replace the magic `calc(100vh-260px)` with a responsive approach (e.g. a configurable `maxHeight` prop with a sensible default, or container-relative sizing) that works on both pages and on short viewports.
- Preserve the scroll behavior, the total-count header, and existing card rendering.
- Ensure the scroll container remains keyboard-reachable and does not introduce a fixed pixel assumption.
- Keep the `MilestonesListProps` backward compatible (new prop optional).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/milestones-30-responsive-scroll-height`
- Implement changes
  - **Write code in:** [`src/components/MilestonesList.tsx`](src/components/MilestonesList.tsx).
  - **Write comprehensive tests in:** [`src/components/__tests__/MilestonesList.test.tsx`](src/components/__tests__/MilestonesList.test.tsx) (extend) — default height applied, custom `maxHeight` honored, content not clipped at small sizes.
  - **Add documentation:** add a note to `docs/components` describing the height prop.
  - Add JSDoc to the new prop.
  - Validate a11y: scroll region reachable, no clipping.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: default, custom max height, many milestones, short viewport.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(milestones): make MilestonesList scroll height responsive`

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
title: "Add per-party copy-to-clipboard with a shared hook on ContractSummary"
labels: type:enhancement, area:contracts, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add per-party copy-to-clipboard with a shared hook on ContractSummary

### Description
[`src/components/ContractSummary.tsx`](src/components/ContractSummary.tsx) displays each party's address via `truncateAddress`, so the full `G...` key is never recoverable from the UI. A `useCopyToClipboard` hook already exists in the codebase (extracted for the wallet/address copy UIs). This issue wires a per-party copy button into `ContractSummary` using that shared hook, giving each party row a labelled, accessible copy affordance with confirmation feedback.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add an accessible "Copy address" button per party that copies the **full** (non-truncated) address via the shared `useCopyToClipboard` hook, with a short "Copied" confirmation and graceful failure handling.
- Keep `truncateAddress` for display only; copy must use the full address from the `ContractParty.address`.
- Reuse the existing hook rather than re-implementing clipboard logic; guard for environments without `navigator.clipboard`.
- Maintain the existing grid/party layout and labelling.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/contracts-31-party-copy-hook`
- Implement changes
  - **Write code in:** [`src/components/ContractSummary.tsx`](src/components/ContractSummary.tsx) (consume the shared `useCopyToClipboard` hook).
  - **Write comprehensive tests in:** [`src/components/__tests__/ContractSummary.test.tsx`](src/components/__tests__/ContractSummary.test.tsx) (extend) — copies full address, confirmation shown, failure handled, multiple parties.
  - **Add documentation:** update [`docs/components/ContractSummary.md`](docs/components/ContractSummary.md).
  - Add JSDoc to the copy handler.
  - Validate a11y: labelled button, confirmation announced, axe clean.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: clipboard unavailable, copy rejected, multiple parties, focus retained.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(contracts): add per-party copy-to-clipboard via shared hook`

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
title: "Add a contract status filter and search toolbar to the Contracts page"
labels: type:feature, area:contracts, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add a contract status filter and search toolbar to the Contracts page

### Description
[`src/app/contracts/page.tsx`](src/app/contracts/page.tsx) renders every persisted contract with no way to filter by status or search by name. As the repository-backed list grows, scanning it becomes painful — the milestones page already has a status filter, but contracts do not. This issue adds an accessible search + status filter toolbar to the contracts list, reusing the patterns established by [`MilestoneFilter`](src/components/milestones/MilestoneFilter.tsx).

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add a labelled name-search input (case-insensitive) and a status `radiogroup` ("All" + the `StatusType` values used by contracts), filtering the displayed list derived from repository state.
- Announce the filtered result count via an `aria-live` region and show a "no matches" `EmptyState` when the filter empties the list.
- Keep the create flow and the `EmptyState` (no contracts at all) branch intact; derive the displayed list without mutating stored data.
- Reuse the `Contract`/`StatusType` types from [`src/types/domain.ts`](src/types/domain.ts).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/contracts-32-filter-toolbar`
- Implement changes
  - **Write code in:** [`src/app/contracts/page.tsx`](src/app/contracts/page.tsx) and optionally `src/components/contracts/ContractFilter.tsx`.
  - **Write comprehensive tests in:** [`src/app/contracts/__tests__/page.test.tsx`](src/app/contracts/__tests__/page.test.tsx) (extend) — search filters, status filter, no-match state, count announcement.
  - **Add documentation:** add a note to `docs/components` describing the toolbar.
  - Add JSDoc to the filter helper/component.
  - Validate a11y: labelled controls, live count, axe clean.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: empty query, no matches, single status, many contracts.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(contracts): add accessible search and status filter toolbar`

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
title: "Add a stable id to the Contract type and dedupe saves in the repository"
labels: type:refactor, area:persistence, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add a stable id to the Contract type and dedupe saves in the repository

### Description
`Contract` (aliased to `ContractSummaryProps` in [`src/types/domain.ts`](src/types/domain.ts)) has **no id field**, so [`src/lib/repository.ts`](src/lib/repository.ts) can only key contracts by `contractName` (the `saveContract` JSDoc even warns that duplicate names create duplicates). This blocks linking to `/contracts/[id]`, deleting a specific contract, and deduplication. This issue introduces a stable contract id and uses it for dedupe.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add an `id: string` to the contract shape (extend `Contract` in [`src/types/domain.ts`](src/types/domain.ts) without breaking `ContractSummaryProps` consumers), generating ids in the create flow.
- Update `saveContract` to upsert by `id` (replace if the id exists, append otherwise) so re-saving the same contract no longer duplicates it.
- Keep the change backward compatible for already-stored records (tolerate missing ids on read, e.g. by assigning a derived id) and SSR-safe.
- Wire the new id into the contracts list `key` and any `/contracts/[id]` link.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b refactor/persistence-33-contract-id`
- Implement changes
  - **Write code in:** [`src/types/domain.ts`](src/types/domain.ts), [`src/lib/repository.ts`](src/lib/repository.ts), [`src/app/contracts/page.tsx`](src/app/contracts/page.tsx).
  - **Write comprehensive tests in:** [`src/lib/__tests__/repository.test.ts`](src/lib/__tests__/repository.test.ts) (extend) — upsert by id, append new, tolerate legacy id-less records.
  - **Add documentation:** update [`docs/persistence.md`](docs/persistence.md) with the id contract.
  - Add JSDoc to the updated `saveContract`.
  - Validate that re-saving the same id does not duplicate.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: new id, existing id, legacy record without id, empty store.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`refactor(persistence): add contract id and upsert-by-id in the repository`

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
title: "Document the localStorage repository and domain types in a data-model guide"
labels: type:docs, area:persistence, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Document the localStorage repository and domain types in a data-model guide

### Description
The app's data model is spread across [`src/types/domain.ts`](src/types/domain.ts) (re-exporting `Contract`, `Milestone`, `Reputation` from their component files) and [`src/lib/repository.ts`](src/lib/repository.ts) (the single `STORAGE_KEY` store). The existing [`docs/persistence.md`](docs/persistence.md) is thin and a new contributor cannot easily see how shapes, storage, and pages connect. This issue writes a clear data-model guide.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Document each domain type (`Contract`/`ContractSummaryProps`, `Milestone`, `Reputation`, `StatusType`) with field meanings and where each is consumed.
- Document the repository: the `STORAGE_KEY`, the `AppData` shape, SSR-safety, the corrupt-data fallback, and the read/save (and any delete) API.
- Include a small diagram or table mapping each route/page to the repository functions it calls.
- Keep it accurate to the current code; do not document not-yet-built features as if they exist.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b docs/persistence-34-data-model-guide`
- Implement changes
  - **Write code in:** no source change expected; documentation only.
  - **Write comprehensive tests in:** not applicable; if examples include code snippets, ensure they compile against current types.
  - **Add documentation:** expand [`docs/persistence.md`](docs/persistence.md) (and cross-link from [`README.md`](README.md)).
  - Add JSDoc cross-references where helpful in [`src/types/domain.ts`](src/types/domain.ts).
  - Validate that documented shapes match the exported types.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: documented field list matches the types, every page mapping is correct.
- Include a short summary of what was documented in the PR description.

### Example commit message
`docs(persistence): add a data-model guide for domain types and the repository`

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
title: "Document the ConfirmDialog and ActionPanel destructive-action flow"
labels: type:docs, area:dialog, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Document the ConfirmDialog and ActionPanel destructive-action flow

### Description
[`src/components/ConfirmDialog.tsx`](src/components/ConfirmDialog.tsx) gates the irreversible Release Funds and Dispute actions in [`src/components/ActionPanel.tsx`](src/components/ActionPanel.tsx), but there is no doc explaining the combined flow: open → confirm/cancel → handler → focus return. The existing [`docs/components/ActionPanel.md`](docs/components/ActionPanel.md) does not cover the dialog. This issue documents the destructive-action flow end to end.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Document the `ConfirmDialogProps` API (with the default labels), the focus-on-cancel-open behavior, Escape and backdrop cancel, and the focus-trap.
- Document how `ActionPanel` opens the dialog for `release`/`dispute`, where the wallet-gating and `disabledReasons` interact, and the focus-return responsibility.
- Include a small sequence diagram or numbered flow and a usage snippet.
- Keep it consistent with the actual prop names and behavior in the source.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b docs/dialog-35-destructive-action-flow`
- Implement changes
  - **Write code in:** no source change expected; documentation only.
  - **Write comprehensive tests in:** not applicable; ensure any snippet matches current props.
  - **Add documentation:** add `docs/components/ConfirmDialog.md` and expand [`docs/components/ActionPanel.md`](docs/components/ActionPanel.md).
  - Add JSDoc cross-links between the two components if helpful.
  - Validate that documented props match the source.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: documented defaults match, flow steps are accurate.
- Include a short summary in the PR description.

### Example commit message
`docs(dialog): document the ConfirmDialog and ActionPanel destructive flow`

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
title: "Add an accessible empty-history reputation example and a Reputation page docs walkthrough"
labels: type:docs, area:reputation, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add an accessible empty-history reputation example and a Reputation page docs walkthrough

### Description
[`src/components/ReputationProfile.tsx`](src/components/ReputationProfile.tsx) has three meaningful states (no score, score-without-history "partial", and score-with-history) and a privacy-by-default posture, but [`docs/components/ReputationPage.md`](docs/components/ReputationPage.md) does not walk a contributor through them or show the prop shapes. This issue documents the states, the privacy intent, and provides copy-paste examples for each.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Document the `ReputationProfileProps` shape and the exact conditions for `hasReputation` and `showPartial`, plus the "Private by default" / "Visible" badge logic.
- Provide three runnable example prop sets (no score, partial, full history) and explain the privacy-friendly defaults messaging.
- Note the accessible structure: `sr-only` profile heading, `aria-labelledby` on score/level, and the history list semantics.
- Keep examples aligned to the current types in [`src/types/domain.ts`](src/types/domain.ts).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b docs/reputation-36-states-walkthrough`
- Implement changes
  - **Write code in:** no source change expected; documentation only.
  - **Write comprehensive tests in:** not applicable; ensure example prop sets type-check.
  - **Add documentation:** expand [`docs/components/ReputationPage.md`](docs/components/ReputationPage.md).
  - Add JSDoc cross-references on the component if helpful.
  - Validate that documented states match the rendering logic.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: each documented state matches the component, examples compile.
- Include a short summary in the PR description.

### Example commit message
`docs(reputation): document ReputationProfile states and privacy defaults`

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
title: "Replace remaining console.log/console.warn calls with the central error reporter"
labels: type:refactor, area:observability, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Replace remaining console.log/console.warn calls with the central error reporter

### Description
A pluggable error reporter exists at [`src/lib/errorReporter.ts`](src/lib/errorReporter.ts), yet several modules still call `console` directly: [`src/lib/repository.ts`](src/lib/repository.ts) uses `console.warn` on read/write failures and [`src/app/milestones/page.tsx`](src/app/milestones/page.tsx) still has a `console.log('Add milestone')`. This is inconsistent observability — some failures route through the reporter and some do not. This issue routes non-trivial logging through the reporter.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Replace the repository's `console.warn` failure paths with `reportError(error, context)` from [`src/lib/errorReporter.ts`](src/lib/errorReporter.ts), keeping the safe-fallback behavior unchanged.
- Remove or replace stray `console.log` debug calls (e.g. the milestones add stub) with appropriate reporter usage or nothing.
- Never log PII; pass only the error and a short string context, matching the reporter's contract.
- Do not change the public APIs of the touched modules.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b refactor/observability-37-route-logging-through-reporter`
- Implement changes
  - **Write code in:** [`src/lib/repository.ts`](src/lib/repository.ts) and [`src/app/milestones/page.tsx`](src/app/milestones/page.tsx) (and any other stray `console` call found).
  - **Write comprehensive tests in:** [`src/lib/__tests__/repository.test.ts`](src/lib/__tests__/repository.test.ts) (extend) — reporter invoked on read/write failure; extend [`src/lib/__tests__/errorReporter.test.ts`](src/lib/__tests__/errorReporter.test.ts) if needed.
  - **Add documentation:** update [`docs/error-reporting.md`](docs/error-reporting.md) listing the call sites now routed through the reporter.
  - Add JSDoc where context strings are introduced.
  - Validate security: no PII passed to the reporter.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: read failure, write failure, custom reporter injected, reporter throwing.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`refactor(observability): route repository logging through the error reporter`

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
title: "Add an EmptyState call-to-action that routes users from Reputation to Contracts"
labels: type:enhancement, area:reputation, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add an EmptyState call-to-action that routes users from Reputation to Contracts

### Description
The reputation experience starts empty for new users, and [`src/components/EmptyState.tsx`](src/components/EmptyState.tsx) already supports primary and secondary action buttons — but the reputation entry point offers no next step, leaving users at a dead end with no guidance on how to *earn* reputation. This issue adds an actionable CTA that points users toward creating a contract (where reputation is built), wiring `EmptyState`'s action props to navigation.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- On the reputation empty path, render `EmptyState` with `illustration="reputation"`, a primary action "Create a contract" navigating to `/contracts`, and an optional secondary "Learn how reputation works" pointing to docs/help.
- Use `next/navigation`'s router (or a `next/link`-based action) for navigation; keep the component a client boundary as needed.
- Reuse the existing `EmptyState` props; do not fork the component.
- Keep copy consistent with [`docs/COPYWRITING_GUIDE.md`](docs/COPYWRITING_GUIDE.md).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/reputation-38-emptystate-cta`
- Implement changes
  - **Write code in:** [`src/app/reputation/page.tsx`](src/app/reputation/page.tsx).
  - **Write comprehensive tests in:** [`src/app/reputation/__tests__/page.test.tsx`](src/app/reputation/__tests__/page.test.tsx) (extend) — CTA renders, primary action navigates, secondary action present.
  - **Add documentation:** update [`docs/components/ReputationPage.md`](docs/components/ReputationPage.md).
  - Add JSDoc to any navigation handler.
  - Validate a11y: labelled actions, keyboard reachable.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: empty state CTA, primary navigation, secondary navigation, no double-fire.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(reputation): add EmptyState CTA routing to contracts`

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
title: "Add a not-found contract state for unknown ids that pass validation but have no data"
labels: type:enhancement, area:contracts, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add a not-found contract state for unknown ids that pass validation but have no data

### Description
[`src/app/contracts/[id]/page.tsx`](src/app/contracts/%5Bid%5D/page.tsx) only calls `notFound()` when the id **fails** `isValidContractId` — for any *syntactically valid* id it renders hard-coded sample data ("Stellar Escrow Implementation"), so `/contracts/anything-valid` always shows the same fake contract. Once contracts are persisted, a valid-but-nonexistent id should show a proper not-found state instead of fabricated data. This issue distinguishes "invalid id" from "no such contract".

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Look up the contract for the validated `id` (via the repository / a typed resolver) and call `notFound()` (or render an accessible inline "Contract not found" state) when no matching record exists, instead of always rendering sample data.
- Keep the existing id-validation `notFound()` for malformed ids; only add the missing-record path.
- When a record exists, render `ContractSummary`/`MilestonesList`/`ActionPanel` from that record rather than the hard-coded sample.
- Keep the page deterministic in tests (inject the resolver or seed the store).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/contracts-39-not-found-state`
- Implement changes
  - **Write code in:** [`src/app/contracts/[id]/page.tsx`](src/app/contracts/%5Bid%5D/page.tsx) (and a small resolver if needed).
  - **Write comprehensive tests in:** [`src/app/contracts/[id]/__tests__/page.test.tsx`](src/app/contracts/%5Bid%5D/__tests__/page.test.tsx) (extend) — valid id with data renders, valid id without data shows not-found, invalid id still notFound.
  - **Add documentation:** update [`docs/components/ContractDetail.md`](docs/components/ContractDetail.md).
  - Add JSDoc to the resolver.
  - Validate the missing-record path is accessible and announced.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: invalid id, valid id with record, valid id without record, empty store.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(contracts): show a not-found state for valid ids with no contract data`

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
title: "Add an aria-live total-count announcement to the Contracts page list"
labels: type:a11y, area:contracts, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add an aria-live total-count announcement to the Contracts page list

### Description
When a user creates a contract on [`src/app/contracts/page.tsx`](src/app/contracts/page.tsx), the list grows but nothing is announced to assistive technology — there is no `aria-live` region reporting the new total, unlike the milestones page which announces filter counts via [`MilestoneFilter`](src/components/milestones/MilestoneFilter.tsx). This issue adds a polite count announcement so screen-reader users get feedback after creating a contract.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add a visually hidden `aria-live="polite"` region that announces the current contract count (and updates when a contract is created), with correct singular/plural wording.
- Do not double-announce on initial mount; only announce on count change.
- Keep the `EmptyState` and list rendering unchanged otherwise.
- Ensure the region is `aria-atomic` so the full message is read.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b a11y/contracts-40-live-count-announcement`
- Implement changes
  - **Write code in:** [`src/app/contracts/page.tsx`](src/app/contracts/page.tsx).
  - **Write comprehensive tests in:** [`src/app/contracts/__tests__/page.test.tsx`](src/app/contracts/__tests__/page.test.tsx) (extend) — region present, announces updated count after create, no announce on initial mount, singular/plural.
  - **Add documentation:** note the behavior in [`docs/components/Accessibility.md`](docs/components/Accessibility.md).
  - Add JSDoc to the count logic if extracted.
  - Validate a11y: polite live region, axe clean.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: zero contracts, first create (1), subsequent creates (many), initial mount silent.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(a11y): announce contract list count changes via aria-live`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
