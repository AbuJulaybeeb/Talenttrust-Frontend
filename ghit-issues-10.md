---
type: Feature
title: "Add a search and sort toolbar to the Contracts list"
labels: type:feature, area:contracts, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Make the Contracts list searchable and sortable

### Description
The Contracts list has no way to search by party/title or sort by value or date, which does not scale as contracts accumulate. This issue adds a client-side search-and-sort toolbar mirroring the Milestones list pattern.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add a toolbar with a text search (title/parties) and sort controls (value, created date).
- Filtering/sorting is client-side and accessible; empty results show guidance.
- Reuse the existing Contract shape; do not fork the data model.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/contracts-01-search-sort`
- Implement changes
  - **Write code in:** the Contracts list page/component.
  - **Write comprehensive tests in:** search narrows rows, sort reorders, empty state renders.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: no matches, single contract, tie-break on equal values.
- Include the full test output in the PR description.

### Example commit message
`feat(contracts): add search and sort toolbar`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Add load-more pagination to the Contracts list"
labels: type:feature, area:contracts, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Paginate the Contracts list

### Description
Rendering every contract at once is wasteful and slow as the list grows. This issue adds an incremental load-more (or paged) control that reveals contracts in batches.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Render an initial page and reveal more on demand with an accessible control.
- Reset to the first page when a search/filter changes.
- Keep it client-side over the existing data source.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/contracts-02-pagination`
- Implement changes
  - **Write code in:** the Contracts list component.
  - **Write comprehensive tests in:** initial page size, load-more reveals next batch, reset on filter change.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: fewer than one page, exact page boundary, load-more at end.
- Include the full test output in the PR description.

### Example commit message
`feat(contracts): add load-more pagination`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Add a copy contract link action with a toast on the contract detail page"
labels: type:feature, area:contracts, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Let users copy a shareable contract link

### Description
The contract detail page offers no quick way to share a link to it. This issue adds a copy-link action confirmed by a toast, with a non-secure-context fallback.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add an accessible copy-link control that copies the canonical contract URL.
- Use the Clipboard API with a documented textarea fallback; confirm via the existing toast system.
- Keyboard-operable with a clear accessible label.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/contracts-03-copy-link`
- Implement changes
  - **Write code in:** the contract detail page; reuse any clipboard helper.
  - **Write comprehensive tests in:** success path, clipboard-throws fallback, accessible name.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: clipboard unavailable, repeated clicks.
- Include the full test output in the PR description.

### Example commit message
`feat(contracts): add copy contract link action`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Announce contract status changes through an aria-live region"
labels: type:a11y, area:contracts, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Announce contract status transitions to assistive tech

### Description
When a contract's status changes in the UI, screen-reader users receive no announcement. This issue adds a polite live region that announces the new status.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add a polite aria-live region that announces the contract's new status label on change.
- Do not announce on initial mount; only on transitions.
- No change to the underlying status logic.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b a11y/contracts-01-status-live`
- Implement changes
  - **Write code in:** the contract detail/status component.
  - **Write comprehensive tests in:** announcement fires on change, not on mount.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: same-status re-render (no announce), rapid transitions.
- Include the full test output in the PR description.

### Example commit message
`a11y(contracts): announce status changes`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Add an overdue and due-soon status badge to milestone rows"
labels: type:feature, area:milestones, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Surface milestone urgency at a glance

### Description
Milestone rows do not visually flag overdue or imminently-due items. This issue adds an accessible badge derived from the existing due-date helpers.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Render an overdue or due-soon badge per milestone using the existing isDueSoon/parseLocalDate helpers.
- Convey urgency with text/aria, not colour alone (WCAG).
- Do not change the due-date calculation.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/milestones-01-due-badge`
- Implement changes
  - **Write code in:** the milestone row component.
  - **Write comprehensive tests in:** overdue, due-soon, and not-due render the correct badge/none.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: exactly today, boundary of the due-soon window, no due date.
- Include the full test output in the PR description.

### Example commit message
`feat(milestones): add overdue/due-soon badge`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Persist the milestones sort and filter selection across reloads"
labels: type:feature, area:milestones, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Remember milestone list preferences

### Description
The Milestones list resets its filter and sort on reload. This issue persists them to a safe storage wrapper and restores on mount.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Persist the active status filter and sort to a namespaced, SSR-guarded key; restore on mount.
- Fall back to defaults when the stored value is missing or invalid.
- Reuse the existing safe-storage wrapper if present.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/milestones-02-persist-prefs`
- Implement changes
  - **Write code in:** the Milestones list; use the safe storage wrapper.
  - **Write comprehensive tests in:** restore on mount, invalid value falls back, change persists.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: corrupt value, SSR no-op, unknown filter id.
- Include the full test output in the PR description.

### Example commit message
`feat(milestones): persist sort and filter selection`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Extract a shared EmptyState component for contracts, milestones, and reputation"
labels: type:refactor, area:ui, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Unify empty-state rendering

### Description
Empty states are re-implemented per list, causing inconsistent copy and markup. This issue extracts one accessible EmptyState primitive used across the app.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Create a reusable EmptyState (icon/title/description/optional action) and adopt it in the contracts, milestones, and reputation empty states.
- Keep the rendered guidance equivalent; structure/reuse only.
- Accessible: heading semantics and focusable action when present.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b refactor/ui-01-empty-state`
- Implement changes
  - **Write code in:** create the EmptyState component; adopt at the three sites.
  - **Write comprehensive tests in:** renders title/description, optional action fires, accessible name.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: with and without an action, long text wrapping.
- Include the full test output in the PR description.

### Example commit message
`refactor(ui): extract shared EmptyState component`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Extract currency and date formatting into a shared tested module"
labels: type:refactor, area:format, stack:typescript, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Centralize formatting helpers

### Description
Currency and date formatting is duplicated across components. This issue centralizes it into a single tested module the components consume.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Create a `lib/format` module exposing currency and date formatters used by the contract/milestone views.
- Output must be unchanged for existing inputs; verified by tests.
- No new dependencies.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b refactor/format-01-shared-module`
- Implement changes
  - **Write code in:** create `lib/format`; update call sites.
  - **Write comprehensive tests in:** a table of inputs asserting unchanged output for currency and dates.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: zero, negatives, locale boundaries, invalid date.
- Include the full test output in the PR description.

### Example commit message
`refactor(format): centralize currency and date helpers`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Show an up or down reputation trend indicator on ReputationProfile"
labels: type:feature, area:reputation, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Indicate whether reputation is rising or falling

### Description
ReputationProfile shows a score and history but no trend direction. This issue derives a trend from the recent history and renders an accessible indicator.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Compute a simple trend (up/down/flat) from the most recent history entries and render an accessible indicator (text + aria, not colour alone).
- Do not change the score or history data.
- Handle short histories gracefully (flat when insufficient data).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/reputation-01-trend`
- Implement changes
  - **Write code in:** the ReputationProfile component.
  - **Write comprehensive tests in:** rising, falling, flat, and insufficient-history cases.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: single history point, equal consecutive scores.
- Include the full test output in the PR description.

### Example commit message
`feat(reputation): add trend indicator`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Give the reputation history list an accessible name and list semantics"
labels: type:a11y, area:reputation, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Make the reputation history screen-reader friendly

### Description
The reputation history renders without list semantics or an accessible name, so its structure is opaque to assistive tech. This issue adds proper semantics.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Render the history as a semantic list with an accessible name describing it.
- Ensure each entry's key data is programmatically associated.
- No change to the data.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b a11y/reputation-01-history-semantics`
- Implement changes
  - **Write code in:** the ReputationProfile history section.
  - **Write comprehensive tests in:** list role/name present, entries enumerated.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: empty history, single entry.
- Include the full test output in the PR description.

### Example commit message
`a11y(reputation): add history list semantics`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Add tests for WalletContext connect, disconnect, and idle transitions"
labels: type:test, area:wallet, stack:typescript, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Cover the wallet state machine

### Description
WalletContext drives connect/disconnect and an idle safeguard, but its state transitions are under-tested. This issue adds focused tests.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add tests for: connect moves to connected, disconnect returns to disconnected, and the idle safeguard disconnects after inactivity.
- Use fake timers for the idle path; assert exact transitions.
- Do not change context behaviour unless a test uncovers a real defect (note it).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/wallet-01-transitions`
- Implement changes
  - **Write comprehensive tests in:** the WalletContext test file.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: connect while connecting, idle timer reset on activity, disconnect when already disconnected.
- Include the full test output in the PR description.

### Example commit message
`test(wallet): cover connect/disconnect/idle transitions`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Document the localStorage repository schema and versioning"
labels: type:docs, area:data, stack:nextjs, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Document how app data is persisted

### Description
The localStorage repository stores contracts and milestones, but its keys, shapes, and upgrade strategy are undocumented. This issue documents them.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add `docs/persistence.md` documenting the storage keys, the stored shapes, and a versioning/migration approach for shape changes.
- Cross-reference the repository module and the safe-storage wrapper.
- Keep it accurate to the current code — read the modules first.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b docs/data-01-repository-schema`
- Implement changes
  - **Add documentation:** create or extend `docs/persistence.md`.
- Test and commit

### Test and commit
- Run `npm run build`.
- Cover edge cases: n/a — verify each documented key/shape against source.
- Include the full test output in the PR description.

### Example commit message
`docs(data): document repository schema and versioning`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Add a global toast for uncaught form submission errors"
labels: type:feature, area:forms, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Surface unexpected form errors to users

### Description
When a form submit throws unexpectedly, users get no feedback. This issue routes uncaught submission errors to a global error toast.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Catch unexpected errors in the contract/milestone submit handlers and show a global error toast (distinct from field validation).
- Do not swallow validation errors; only unexpected throws.
- Log via the existing logging seam if present.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/forms-01-error-toast`
- Implement changes
  - **Write code in:** the shared form submit path/hook.
  - **Write comprehensive tests in:** thrown submit shows the toast, validation errors do not.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: network-style throw, synchronous throw, success (no toast).
- Include the full test output in the PR description.

### Example commit message
`feat(forms): toast uncaught submission errors`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
++++++
---
type: Feature
title: "Add a props reference for the shared UI primitives"
labels: type:docs, area:ui, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Catalog the shared UI components

### Description
Contributors lack a reference for the shared primitives (buttons, dialog, form field, empty state), leading to inconsistent usage. This issue adds a concise props reference.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add `docs/ui-primitives.md` listing each shared primitive, its props, and a minimal usage example.
- Keep it accurate to the current component APIs — read each component first.
- Link from the docs index if one exists.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b docs/ui-01-primitives-reference`
- Implement changes
  - **Add documentation:** create `docs/ui-primitives.md`.
- Test and commit

### Test and commit
- Run `npm run build`.
- Cover edge cases: n/a — verify each prop against the component source.
- Include the full test output in the PR description.

### Example commit message
`docs(ui): add shared primitives props reference`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
