---
type: Feature
title: "Add a milestone deadline reminder banner that surfaces due-soon milestones on the Milestones page"
labels: type:feature, area:milestones, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add a milestone deadline reminder banner that surfaces due-soon milestones on the Milestones page

### Description
[`MilestonesList`](src/components/MilestonesList.tsx) renders each milestone's `dueDate` as a plain `Due {dueDate ?? 'TBD'}` line, but nothing draws attention to milestones whose deadlines are imminent. Freelancers and clients have no at-a-glance signal that a payout is approaching its due date, so soon-to-lapse work is easy to miss.

Add a dismissible "due soon" reminder banner above the list that counts and links to milestones with a `dueDate` falling within a configurable window (default 7 days) and that are not already in a terminal status.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Derive the due-soon set from the `Milestone[]` already passed to [`MilestonesList`](src/components/MilestonesList.tsx); compare parsed `dueDate` against the current date and exclude `Paid`/`Completed` statuses (`StatusType` from [`StatusBadge`](src/components/StatusBadge.tsx)).
- Render the banner with `role="status"` and a clear, pluralized message ("2 milestones due within 7 days"); make it dismissible without losing keyboard focus.
- Reuse the existing date parsing approach rather than introducing a new date library; guard against unparseable `dueDate` strings so they are simply skipped.
- Keep the window value a named constant so it can be tuned without touching JSX.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/milestones-due-soon-reminder-banner`
- Implement changes
  - **Write code in:** [`src/components/MilestonesList.tsx`](src/components/MilestonesList.tsx) and, if extracted, a small `src/lib/dueSoon.ts` helper.
  - **Write comprehensive tests in:** [`src/components/__tests__/MilestonesList.test.tsx`](src/components/__tests__/MilestonesList.test.tsx) — cover the window boundary, terminal-status exclusion, unparseable dates, and the dismiss interaction.
  - **Add documentation:** note the reminder window and exclusion rules in `docs/` next to the milestones notes.
  - Validate accessibility: `role="status"`, focus retention on dismiss, and a no-axe-violation render via `src/test-utils/a11y.tsx`.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: empty list, all milestones terminal, exactly-at-boundary due dates, and invalid date strings.

### Example commit message
`feat(milestones): add due-soon reminder banner with tests and docs`

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
title: "Add a reputation level legend that maps score ranges to named levels on ReputationProfile"
labels: type:enhancement, area:reputation, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add a reputation level legend that maps score ranges to named levels on ReputationProfile

### Description
[`ReputationProfile`](src/components/ReputationProfile.tsx) shows a numeric `score` meter and a free-text `level` prop side by side, but never explains how a score maps to a level. A viewer sees "4 out of 5" and "Trusted Partner" with no indication of the thresholds between levels, so the level feels arbitrary.

Add an accessible legend that lists the score ranges and their corresponding level names, and derive the displayed level from the score using that same mapping when no explicit `level` is provided.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Define an ordered, typed list of `{ min, max, label }` bands scaled to `maxScore` (which already defaults to 5) so the legend stays correct if the scale changes.
- When `level` is not passed, resolve it from the band that contains `score`; when it is passed, keep honoring the explicit value.
- Render the legend as a semantic list associated with the score meter via `aria-describedby`, keeping the existing `role="meter"` semantics intact.
- Preserve existing "No reputation yet" / partial-data behavior — the legend should not appear when there is no score.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/reputation-level-legend`
- Implement changes
  - **Write code in:** [`src/components/ReputationProfile.tsx`](src/components/ReputationProfile.tsx) plus a small band-mapping helper in the same module.
  - **Write comprehensive tests in:** [`src/components/ReputationProfile.test.tsx`](src/components/ReputationProfile.test.tsx) — cover band boundaries, derived vs explicit level, and the no-score case.
  - **Add documentation:** describe the band thresholds in `docs/` alongside the reputation notes.
  - Validate accessibility: meter description wiring and a jest-axe pass.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: score at a band boundary, score of 0, score equal to `maxScore`, and a custom `maxScore`.

### Example commit message
`feat(reputation): add score-to-level legend with derived levels, tests and docs`

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
title: "Add a clearByPrefix maintenance helper to the repository for resetting persisted app data"
labels: type:feature, area:repository, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add a clearByPrefix maintenance helper to the repository for resetting persisted app data

### Description
The [`repository`](src/lib/repository.ts) module persists all contracts and milestones under the single `STORAGE_KEY` (`talenttrust_app_data`), but offers no way to reset that data. During testing, demos, and user-initiated "start over" flows there is no supported path to clear persisted state other than calling raw `localStorage.removeItem` and bypassing the module's SSR guards and error reporting.

Add a `clearAppData()` (and an optional `clearByPrefix(prefix)` for related TalentTrust keys) operation that routes through the same `isBrowser()` guard and `reportError` plumbing as the rest of the module.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add `clearAppData(): boolean` that removes `STORAGE_KEY` safely, returning `false` in SSR and on failure, reporting via [`errorReporter`](src/lib/errorReporter.ts).
- Add `clearByPrefix(prefix: string): number` that removes every `localStorage` key starting with the given prefix and returns the count removed; iterate a snapshot of keys to avoid index-shift bugs while deleting.
- Keep the module pure and non-throwing; never touch keys outside the supplied prefix.
- Document the operations in the existing repository JSDoc and the data-model guide reference already cited in the file header.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/repository-clear-app-data`
- Implement changes
  - **Write code in:** [`src/lib/repository.ts`](src/lib/repository.ts).
  - **Write comprehensive tests in:** [`src/lib/__tests__/repository.test.ts`](src/lib/__tests__/repository.test.ts) — cover clear success, SSR no-op, prefix scoping, and reporter invocation on failure.
  - **Add documentation:** extend `docs/data-model.md` with the clear operations.
  - Validate security: confirm prefix scoping never deletes unrelated keys.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: no matching keys, mixed matching/non-matching keys, and a throwing `localStorage`.

### Example commit message
`feat(repository): add clearAppData and clearByPrefix with tests and docs`

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
title: "Expose the toast auto-dismiss duration as a user preference with a no-auto-dismiss option"
labels: type:enhancement, area:toast, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Expose the toast auto-dismiss duration as a user preference with a no-auto-dismiss option

### Description
The [`toast-provider`](src/components/toast/toast-provider.tsx) hard-codes `DEFAULT_DURATION = 5000` and only allows per-call overrides via `toast.duration`. Users who rely on screen readers or simply read slowly cannot make toasts persist longer, and there is no way to opt out of auto-dismiss entirely. The provider already reads `quietMode` and `toastDensity` from [`preferences`](src/lib/preferences.tsx), so the plumbing for a third toast preference exists.

Add a `toastDuration` user preference (e.g. `'short' | 'normal' | 'long' | 'persistent'`) that the provider uses as the default when a toast does not specify its own duration.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Extend `UserPreferences` in [`preferences`](src/lib/preferences.tsx) with a validated `toastDuration` field, including it in `KNOWN_KEYS`, the allowed-values set, and `sanitizePreferences`.
- Map the preference to milliseconds in [`toast-provider`](src/components/toast/toast-provider.tsx); `'persistent'` should skip `scheduleToastDismiss` so the toast stays until manually dismissed, while still honoring an explicit per-call `duration`.
- Preserve the existing pause/resume timer semantics and the `MAX_VISIBLE_TOASTS` eviction path.
- Default to the current 5000ms behavior so existing snapshots and tests stay green.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/toast-duration-preference`
- Implement changes
  - **Write code in:** [`src/lib/preferences.tsx`](src/lib/preferences.tsx) and [`src/components/toast/toast-provider.tsx`](src/components/toast/toast-provider.tsx).
  - **Write comprehensive tests in:** [`src/components/toast/toast-provider.test.tsx`](src/components/toast/toast-provider.test.tsx) and [`src/lib/__tests__/preferences.test.tsx`](src/lib/__tests__/preferences.test.tsx) — cover each duration mapping, the persistent (no-timer) path, and per-call override precedence.
  - **Add documentation:** update the toast/preferences docs in `docs/`.
  - Validate accessibility: persistent toasts must remain dismissible by keyboard.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: invalid stored value falling back to default, persistent + quiet mode interaction, and per-call duration overriding the preference.

### Example commit message
`feat(toast): add configurable auto-dismiss duration preference with tests and docs`

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
title: "Make the dispute reason max-length a shared constant and surface it in the character counter copy"
labels: type:refactor, area:action-panel, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Make the dispute reason max-length a shared constant and surface it in the character counter copy

### Description
[`ActionPanel`](src/components/ActionPanel.tsx) defines `DISPUTE_REASON_MAX_LENGTH = 500` privately and enforces it in three places (the change handler truncation, the submit validation, and the `remainingChars` counter). Any consumer that wants to validate a dispute reason before it reaches the panel must re-derive the same magic number, and the counter never tells the user the actual limit until they exceed it.

Extract the limit into a shared module and use it both in the panel and in any reason-validation utility, while making the counter copy state the limit explicitly.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Move `DISPUTE_REASON_MAX_LENGTH` to a shared location (e.g. `src/lib/disputeReason.ts`) and import it into [`ActionPanel`](src/components/ActionPanel.tsx); export a small `validateDisputeReason(value): { valid: boolean; error?: string }` used by the panel's submit handler.
- Update the counter to read "X of 500 characters" so the cap is communicated before the user hits it, keeping `aria` wiring intact.
- Do not change the existing truncation, focus-return, or `onDispute` trimmed-value behavior.
- Keep the change non-breaking for the `ActionPanelProps` public API.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b refactor/dispute-reason-shared-limit`
- Implement changes
  - **Write code in:** [`src/components/ActionPanel.tsx`](src/components/ActionPanel.tsx) and a new `src/lib/disputeReason.ts`.
  - **Write comprehensive tests in:** [`src/components/__tests__/ActionPanel.test.tsx`](src/components/__tests__/ActionPanel.test.tsx) plus a `src/lib/__tests__/disputeReason.test.ts` — cover empty, whitespace-only, at-limit, and over-limit reasons.
  - **Add documentation:** note the shared validator in the ActionPanel docs.
  - Validate accessibility: the counter and error remain associated with the textarea.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: exactly-500-character reason, leading/trailing whitespace, and counter copy at zero remaining.

### Example commit message
`refactor(action-panel): extract shared dispute-reason limit and validator with tests`

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
title: "Add a reusable useMediaQuery hook and consolidate prefers-color-scheme listening in PreferencesProvider"
labels: type:refactor, area:hooks, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add a reusable useMediaQuery hook and consolidate prefers-color-scheme listening in PreferencesProvider

### Description
[`PreferencesProvider`](src/lib/preferences.tsx) inlines `window.matchMedia('(prefers-color-scheme: dark)')` setup, listener registration, and teardown directly inside a `useEffect`. This pattern is also useful for prefers-reduced-motion and responsive breakpoints elsewhere in the app, but there is no shared, SSR-safe primitive for subscribing to a media query, so each consumer re-implements the addEventListener/removeEventListener dance.

Add a small `useMediaQuery` hook and refactor the theme effect to consume it without changing behavior.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Implement `useMediaQuery(query: string): boolean` in `src/hooks/useMediaQuery.ts`, guarded for SSR (return a stable default when `window`/`matchMedia` is unavailable) and cleaning up its listener on unmount.
- Refactor the `theme === 'system'` branch in [`preferences`](src/lib/preferences.tsx) to derive the effective theme from the hook while preserving `data-theme` and class application on `documentElement`.
- Keep the existing default-preferences fallback in `usePreferences` untouched.
- Ensure no hydration mismatch: the first client render must match the server assumption.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b refactor/use-media-query-hook`
- Implement changes
  - **Write code in:** new `src/hooks/useMediaQuery.ts` and [`src/lib/preferences.tsx`](src/lib/preferences.tsx).
  - **Write comprehensive tests in:** new `src/hooks/__tests__/useMediaQuery.test.ts` and [`src/lib/__tests__/preferences.test.tsx`](src/lib/__tests__/preferences.test.tsx) — cover match changes, SSR default, and listener cleanup.
  - **Add documentation:** document the hook in `docs/`.
  - Validate: no console hydration warnings under React StrictMode in tests.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: missing `matchMedia`, query change events, and rapid mount/unmount.

### Example commit message
`refactor(hooks): add SSR-safe useMediaQuery and reuse it in PreferencesProvider`

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
title: "Add tests for the toast MAX_VISIBLE_TOASTS eviction and evicted-timer cleanup"
labels: type:test, area:toast, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add tests for the toast MAX_VISIBLE_TOASTS eviction and evicted-timer cleanup

### Description
[`toast-provider`](src/components/toast/toast-provider.tsx) caps visible toasts at `MAX_VISIBLE_TOASTS = 4` and, when a fifth arrives, evicts the oldest toast and calls `clearToastTimer(evicted.id)` so its pending auto-dismiss timeout cannot fire against an already-removed toast. This eviction-plus-cleanup path is load-bearing for avoiding stray timers and viewport overflow, but it is not directly exercised by the existing tests.

Add focused tests that drive the provider past the cap and assert both the visible-set trimming and the timer cleanup.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Render `ToastProvider` (inside a `PreferencesProvider`) and fire five or more `showSuccess`/`showError` calls; assert exactly `MAX_VISIBLE_TOASTS` remain and that the oldest is dropped.
- Use fake timers to assert the evicted toast's timeout never dismisses a surviving toast and never throws.
- Cover the interaction between eviction and the pause-on-hover counter so an evicted, paused toast leaves no dangling timer state.
- Do not modify production code unless a genuine bug is uncovered; if so, document it in the PR.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/toast-eviction-and-timer-cleanup`
- Implement changes
  - **Write comprehensive tests in:** [`src/components/toast/toast-provider.test.tsx`](src/components/toast/toast-provider.test.tsx).
  - **Add documentation:** if behavior is clarified, note it in the toast docs.
  - Validate: tests use `jest.useFakeTimers()` and clean up timers between cases.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: exactly four toasts (no eviction), five toasts (one eviction), and an evicted toast that was hovered when evicted.

### Example commit message
`test(toast): cover MAX_VISIBLE_TOASTS eviction and evicted-timer cleanup`

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
title: "Add tests for the upsertContract replace-by-name path and insert fallback in the repository"
labels: type:test, area:repository, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add tests for the upsertContract replace-by-name path and insert fallback in the repository

### Description
[`repository.upsertContract`](src/lib/repository.ts) replaces an existing contract that shares the same `contractName` and otherwise appends, returning a boolean success flag so callers can surface persistence failures. This matching-then-replace-or-append branch and its failure-flag contract are the backbone of contract editing, but the existing repository tests focus on `listContracts`/`saveContract` rather than the upsert decision logic.

Add tests that exercise both branches and the write-failure return path.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Cover: inserting a brand-new contract (append), replacing a same-name contract in place (preserving array order and not duplicating), and returning `false` when the underlying write fails.
- Verify upsert never disturbs persisted `milestones` and preserves other contracts unchanged.
- Use the module's real `STORAGE_KEY` and a controllable `localStorage` so the success flag is asserted against actual storage outcomes.
- Do not modify production code unless a genuine bug is found; document any fix in the PR.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/upsert-contract-branches`
- Implement changes
  - **Write comprehensive tests in:** [`src/lib/__tests__/repository.test.ts`](src/lib/__tests__/repository.test.ts).
  - **Add documentation:** clarify upsert semantics in `docs/data-model.md` if gaps surface.
  - Validate: assert the `false` path triggers a `reportError` call via the central reporter.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: empty store, multiple same-name candidates, and a throwing `setItem`.

### Example commit message
`test(repository): cover upsertContract replace, append, and failure paths`

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
title: "Add tests for normalizeStellarAddress trimming, casing, and non-string handling"
labels: type:test, area:stellar, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add tests for normalizeStellarAddress trimming, casing, and non-string handling

### Description
[`normalizeStellarAddress`](src/lib/stellarAddress.ts) trims whitespace and upper-cases its input and returns an empty string for non-string values, and `isValidStellarAddress` relies on it before running the structural and CRC16 checksum checks. The existing Stellar tests concentrate on full address validity, leaving the normalization helper — the front door for every validation call — without dedicated coverage.

Add tests that pin down normalization behavior independently of the checksum path.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Cover: surrounding whitespace trimming, lowercase-to-uppercase conversion, and `null`/`undefined`/non-string inputs returning `''`.
- Add an integration assertion that a lowercase, whitespace-padded but otherwise valid G-address passes `isValidStellarAddress` because of normalization.
- Keep assertions decoupled from the checksum internals so the tests stay stable if the CRC table is refactored.
- Do not modify production code unless a genuine bug is found.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/normalize-stellar-address`
- Implement changes
  - **Write comprehensive tests in:** [`src/lib/__tests__/stellarAddress.test.ts`](src/lib/__tests__/stellarAddress.test.ts).
  - **Add documentation:** note normalization guarantees in the Stellar utilities docs if gaps surface.
  - Validate: tests assert both the normalizer and its effect on `isValidStellarAddress`.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: empty string, whitespace-only, numeric input, and already-normalized input.

### Example commit message
`test(stellar): cover normalizeStellarAddress trimming, casing, and non-string inputs`

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
title: "Enforce a wallet-gated guard on the ActionPanel dispute submit to block disputes without a connected address"
labels: type:security, area:action-panel, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Enforce a wallet-gated guard on the ActionPanel dispute submit to block disputes without a connected address

### Description
In [`ActionPanel`](src/components/ActionPanel.tsx) the action buttons are disabled while `!isWalletConnected`, but `handleDisputeSubmit` (the inline dispute form's submit handler) only validates the reason string and then calls `onDispute(trimmed)`. If the dispute form is opened and the wallet disconnects (for example via the idle auto-disconnect in [`WalletContext`](src/contexts/WalletContext.tsx)) before submit, the handler can still fire `onDispute` for an unauthenticated user, raising a dispute with no connected address.

Add a defensive wallet-connection check inside the submit handler so disputes cannot be submitted without an active address.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- In `handleDisputeSubmit`, re-check `isWalletConnected` (from `useWallet`) before invoking `onDispute`; when disconnected, abort and set an accessible error rather than calling back.
- Surface the blocked state through the existing `errorMessage` / `role="alert"` region or the dispute-reason error so assistive tech is informed; keep focus on the form.
- Do not relax the existing button-disabled gating; this is defense-in-depth for the mid-flow disconnect race.
- Preserve the trimmed-reason and focus-return behavior on the valid, connected path.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b security/action-panel-dispute-wallet-guard`
- Implement changes
  - **Write code in:** [`src/components/ActionPanel.tsx`](src/components/ActionPanel.tsx).
  - **Write comprehensive tests in:** [`src/components/__tests__/ActionPanel.test.tsx`](src/components/__tests__/ActionPanel.test.tsx) — simulate disconnect after opening the form and assert `onDispute` is not called and an error is announced.
  - **Add documentation:** note the guard in the ActionPanel docs.
  - Validate security: confirm no callback path reaches `onDispute` while `address` is null.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: connected submit (allowed), disconnect-then-submit (blocked), and reconnect-then-submit (allowed).

### Example commit message
`fix(security): block ActionPanel dispute submit when wallet is disconnected, with tests`

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
title: "Bound persisted localStorage payload size in safeStorage to prevent unbounded storage growth"
labels: type:security, area:storage, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Bound persisted localStorage payload size in safeStorage to prevent unbounded storage growth

### Description
The `safeStorage` wrapper (`src/lib/safeStorage.ts`) is the single guarded entry point for `localStorage` used by the repository, preferences, and wallet rehydration. It catches quota and privacy-mode errors, but it does not pre-check the size of a value before writing. A maliciously large or accidentally runaway payload (for example a corrupted preferences blob or an oversized contract list) can be persisted right up to the browser's quota, degrading the app and crowding out other keys before any quota error is thrown.

Add a configurable maximum byte-size guard to the write path that rejects oversized values up front and reports them.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- In `setItem`, measure the serialized value length (UTF-16/byte estimate) and refuse writes above a named `MAX_VALUE_BYTES` constant, returning the wrapper's existing failure signal and reporting via [`errorReporter`](src/lib/errorReporter.ts).
- Keep the existing quota/privacy-mode try/catch and SSR guards intact; the size check runs before the write attempt.
- Choose a conservative default cap and document how to override it; do not break current valid payloads (contracts, milestones, preferences).
- Ensure `getItem`/`removeItem` are unaffected.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b security/safestorage-payload-size-cap`
- Implement changes
  - **Write code in:** `src/lib/safeStorage.ts`.
  - **Write comprehensive tests in:** [`src/lib/__tests__/safeStorage.test.ts`](src/lib/__tests__/safeStorage.test.ts) — cover under-cap writes, at-cap boundary, over-cap rejection, and reporter invocation.
  - **Add documentation:** note the cap and override in `docs/`.
  - Validate security: confirm oversized writes never reach `localStorage.setItem`.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: empty string, exactly-at-cap value, multibyte characters near the boundary, and SSR no-op.

### Example commit message
`feat(security): cap persisted value size in safeStorage with tests and docs`

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
title: "Document the toast duration, density, quiet-mode, and action-button contract in a toast usage guide"
labels: type:docs, area:toast, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Document the toast duration, density, quiet-mode, and action-button contract in a toast usage guide

### Description
The [`toast-provider`](src/components/toast/toast-provider.tsx) has nuanced behavior — `quietMode` makes `showSuccess` return the literal `'suppressed'`, density adjusts the stacking gap, `MAX_VISIBLE_TOASTS` evicts the oldest toast, and the optional `action` button fires then dismisses — but these contracts live only as inline comments. New contributors must read the provider source to learn how `useToast` behaves, which slows adoption and invites misuse.

Write a dedicated docs page that captures the public surface and behavioral guarantees of the toast system.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Document `showSuccess`/`showError`/`dismissToast` signatures, the `'suppressed'` return under quiet mode, the success-vs-error `role="status"`/`role="alert"` semantics, and the polite/assertive live-region announcer.
- Explain density gaps, the visible-toast cap and eviction order, and the `action: { label, onClick }` plain-text-only contract.
- Include a copy-pasteable example mounting `PreferencesProvider` then `ToastProvider`, and a short table of return values.
- Cross-link the toast docs from any existing component documentation index in `docs/`.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b docs/toast-usage-guide`
- Implement changes
  - **Write code in:** documentation only — `docs/components/toast.md` (no behavioral source changes).
  - **Write comprehensive tests in:** not applicable; instead verify every documented snippet compiles by mirroring it against [`toast-provider.test.tsx`](src/components/toast/toast-provider.test.tsx) patterns.
  - **Add documentation:** the new `docs/components/toast.md` and an index cross-link.
  - Validate: confirm documented behavior matches the provider (no drift).
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases in prose: quiet mode, eviction, and action-button dismissal.

### Example commit message
`docs(toast): add usage guide covering duration, density, quiet mode, and actions`

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
title: "Document the idle auto-disconnect lifecycle and activity events in a WalletContext session guide"
labels: type:docs, area:wallet, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Document the idle auto-disconnect lifecycle and activity events in a WalletContext session guide

### Description
[`WalletContext`](src/contexts/WalletContext.tsx) supports an `idleTimeout` prop that auto-disconnects the wallet after inactivity, rehydrates the address from `safeStorage` on mount, and resets its timer on a specific set of activity events (`pointermove`, `keydown`, `visibilitychange`, `mousedown`, `touchstart`). It also emits a "Session expired" toast on timeout. None of this lifecycle is documented, so integrators do not know which events keep a session alive or how to configure the timeout.

Write a session-management guide for the wallet provider.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Document the `idleTimeout` prop (0/undefined disables it), the rehydration-on-mount behavior via the `wallet_connected_address` key, and the exact activity-event list that resets the timer.
- Explain the "Session expired" toast and the safe-toast fallback when no `ToastProvider` is mounted.
- Note that the connected address is currently a mocked Stellar G-address pending Freighter integration, and document `connect`/`disconnect` and the `error` field.
- Include a configuration example wiring `WalletProvider idleTimeout={...}` in the app tree.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b docs/wallet-session-guide`
- Implement changes
  - **Write code in:** documentation only — `docs/contexts/wallet-session.md`.
  - **Write comprehensive tests in:** not applicable; cross-check claims against [`WalletContext.test.tsx`](src/contexts/__tests__/WalletContext.test.tsx) so the guide stays accurate.
  - **Add documentation:** the new guide plus a cross-link from the docs index.
  - Validate: documented event list and timeout semantics match the provider source.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases in prose: timeout disabled, no ToastProvider mounted, and rehydration on reload.

### Example commit message
`docs(wallet): add idle auto-disconnect and session lifecycle guide`

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
title: "Give the dispute reason textarea a remaining-character live region for screen reader users"
labels: type:a11y, area:action-panel, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Give the dispute reason textarea a remaining-character live region for screen reader users

### Description
The inline dispute form in [`ActionPanel`](src/components/ActionPanel.tsx) computes `remainingChars` and `isOverLimit` and renders a character counter, but the counter is presented as static text. As a screen reader user types toward the 500-character cap, the remaining count is never announced, so they receive no feedback that they are approaching or have hit the limit until validation fails on submit.

Wrap the counter in a polite live region (with assertive escalation near the limit) so the remaining count is announced as the user types.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Render the remaining-characters text inside an `aria-live="polite"` region associated with the textarea via `aria-describedby`, escalating to `aria-live="assertive"` when within a small threshold of, or over, the limit.
- Throttle/debounce announcements so every keystroke does not spam the live region; announce on meaningful boundaries.
- Keep the existing hard-cap truncation, error messaging, and focus behavior unchanged.
- Ensure the live region is empty/quiet when the form is closed.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b a11y/dispute-reason-char-count-live-region`
- Implement changes
  - **Write code in:** [`src/components/ActionPanel.tsx`](src/components/ActionPanel.tsx).
  - **Write comprehensive tests in:** [`src/components/__tests__/ActionPanel.test.tsx`](src/components/__tests__/ActionPanel.test.tsx) — assert the live region wiring, the assertive escalation near the cap, and a jest-axe pass.
  - **Add documentation:** note the announcement behavior in the ActionPanel docs.
  - Validate accessibility via `src/test-utils/a11y.tsx`.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: well under the limit, near the threshold, exactly at the limit, and form closed.

### Example commit message
`feat(a11y): announce remaining dispute-reason characters via a live region`

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
title: "Add a payout currency mismatch warning when milestone currencies diverge from the contract currency"
labels: type:feature, area:contracts, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add a payout currency mismatch warning when milestone currencies diverge from the contract currency

### Description
Each `Milestone` carries its own `currency` (see [`MilestonesList`](src/components/MilestonesList.tsx)) and the parent `Contract` (aligned with `ContractSummaryProps` via [`domain`](src/types/domain.ts)) has a top-level `currency`. Nothing flags the case where a milestone's currency differs from its contract's — yet summing payouts across mixed currencies, or releasing funds against a mismatched denomination, is a real financial footgun that currently passes silently.

Add a detector and an accessible warning that surfaces when one or more milestones do not match the contract's currency.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add a pure `findCurrencyMismatches(contractCurrency, milestones)` helper returning the mismatched milestone ids; treat currency comparison case-insensitively and normalize via the existing currency conventions.
- Render an accessible `role="alert"`/inline warning near the milestones region listing how many milestones mismatch and which currencies are involved; do not block rendering.
- Reuse `formatAmount` from [`preferences`](src/lib/preferences.tsx) where amounts are shown so the warning respects the user's amount format.
- Keep the helper UI-free so it is unit-testable and reusable on the contract detail view.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/contracts-currency-mismatch-warning`
- Implement changes
  - **Write code in:** new `src/lib/currencyMismatch.ts` and the consuming view (e.g. [`MilestonesList`](src/components/MilestonesList.tsx) or the milestones page).
  - **Write comprehensive tests in:** a new `src/lib/__tests__/currencyMismatch.test.ts` and [`src/components/__tests__/MilestonesList.test.tsx`](src/components/__tests__/MilestonesList.test.tsx) — cover all-match, single-mismatch, multi-currency, and case-insensitive comparison.
  - **Add documentation:** note the mismatch rule in `docs/`.
  - Validate accessibility: the warning is announced and passes jest-axe.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: empty milestones, all matching, mixed casing (`usd` vs `USD`), and multiple distinct mismatched currencies.

### Example commit message
`feat(contracts): warn on milestone/contract currency mismatch with tests and docs`

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
title: "Add a milestone status summary chip row that tallies milestones by status above the list"
labels: type:feature, area:milestones, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add a milestone status summary chip row that tallies milestones by status above the list

### Description
[`MilestonesList`](src/components/MilestonesList.tsx) shows a single `{milestones.length} total` count, but gives no breakdown of how many milestones are in each `StatusType` (`Pending`, `Active`, `Completed`, `Paid`, etc. from [`StatusBadge`](src/components/StatusBadge.tsx)). Users have to scan every card to understand the shape of a contract's progress, which scales poorly for long lists.

Add a compact, accessible row of status-tally chips above the list summarizing counts per status.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Derive counts per `StatusType` from the `milestones` prop with a pure helper; render chips only for statuses that have at least one milestone, in a stable canonical order.
- Reuse the `StatusBadge` color/label conventions so the tally is visually consistent with the cards; give the row an accessible label (e.g. "Milestone status summary").
- Keep the existing total count and the scrollable region semantics unchanged; the chip row sits above them.
- Ensure zero-milestone lists render no chip row (or an explicit empty note) without layout shift.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/milestones-status-summary-chips`
- Implement changes
  - **Write code in:** [`src/components/MilestonesList.tsx`](src/components/MilestonesList.tsx) and a small tally helper (e.g. `src/lib/milestoneStatusTally.ts`).
  - **Write comprehensive tests in:** [`src/components/__tests__/MilestonesList.test.tsx`](src/components/__tests__/MilestonesList.test.tsx) and a helper test — cover counts per status, omission of zero-count statuses, and the empty list.
  - **Add documentation:** note the summary row in `docs/`.
  - Validate accessibility: the chip row is labelled and passes jest-axe.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: all one status, every status represented, and empty list.

### Example commit message
`feat(milestones): add per-status summary chip row above the list with tests and docs`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
