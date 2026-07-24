---
type: Feature
title: "Add a created-date sort option to the Contracts list"
labels: type:feature, area:contracts, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Sort contracts by creation date

### Description
The Contracts list cannot be ordered by creation date, making recent contracts hard to find. This issue adds a created-date sort.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add a created-date ascending/descending sort option to the Contracts list.
- Sort client-side; combine with any existing search/filter.
- Stable tie-break on id.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/contracts-07-created-sort`
- Implement changes
  - **Write code in:** the Contracts list toolbar.
  - **Write comprehensive tests in:** ascending/descending order, tie-break, combines with filter.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: equal timestamps, empty list.
- Include the full test output in the PR description.

### Example commit message
`feat(contracts): add created-date sort`

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
title: "Show relative creation time with an absolute tooltip on contract rows"
labels: type:feature, area:contracts, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Humanize contract creation times

### Description
Contract rows show raw timestamps. This issue renders a relative time (for example, 2 days ago) with the absolute time on hover/focus.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Render relative creation time using the existing time helpers; expose the absolute time via title.
- Update relative labels sensibly; do not add a heavy dependency.
- Keep it accessible.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/contracts-08-relative-time`
- Implement changes
  - **Write code in:** the contract row component.
  - **Write comprehensive tests in:** relative label for known deltas, absolute in title.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: just now, far past, invalid date.
- Include the full test output in the PR description.

### Example commit message
`feat(contracts): show relative creation time`

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
title: "Add a due-date column to the Milestones list"
labels: type:feature, area:milestones, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Surface milestone due dates in the list

### Description
The Milestones list does not show due dates as a column, forcing users into each milestone. This issue adds a due-date column.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add a due-date column formatted via the existing date helpers; keep the table accessible.
- Handle milestones without a due date gracefully.
- No change to the milestone data.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/milestones-04-due-column`
- Implement changes
  - **Write code in:** the Milestones list.
  - **Write comprehensive tests in:** due date rendered, no-due-date placeholder.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: missing due date, invalid date.
- Include the full test output in the PR description.

### Example commit message
`feat(milestones): add due-date column`

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
title: "Add an overdue-count badge to the Milestones navigation item"
labels: type:feature, area:milestones, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Highlight overdue milestones in the nav

### Description
Users have no at-a-glance signal of overdue milestones. This issue adds a count badge on the Milestones nav item.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Compute the overdue count from existing due-date helpers and render an accessible badge on the nav item (text, not colour alone).
- Hide the badge when the count is zero.
- Do not refetch; derive from loaded data.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/milestones-05-overdue-badge`
- Implement changes
  - **Write code in:** the nav + a small overdue selector.
  - **Write comprehensive tests in:** badge shows the count, hidden at zero.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: zero overdue, many overdue.
- Include the full test output in the PR description.

### Example commit message
`feat(milestones): add overdue-count nav badge`

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
title: "Add a shareable reputation summary card with a copy-link action"
labels: type:feature, area:reputation, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Let users share a reputation summary

### Description
There is no compact, shareable view of a participant's reputation. This issue adds a summary card with a copy-link action.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Render a compact reputation summary (score, level, recent trend) with an accessible copy-link control.
- Use the Clipboard API with a documented fallback; confirm via a toast.
- Reuse existing reputation data.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/reputation-02-summary-card`
- Implement changes
  - **Write code in:** the ReputationProfile area.
  - **Write comprehensive tests in:** card renders key fields, copy-link success and fallback.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: no history, clipboard unavailable.
- Include the full test output in the PR description.

### Example commit message
`feat(reputation): add shareable summary card`

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
title: "Give the reputation score meter an accessible name and valuetext"
labels: type:a11y, area:reputation, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Make the reputation meter screen-reader friendly

### Description
The reputation score meter lacks an accessible name and value text, so assistive tech cannot convey it. This issue adds them.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add role/aria-valuenow/aria-valuetext and an accessible name to the score meter.
- No visual change.
- Verify with an automated a11y assertion if available.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b a11y/reputation-02-meter`
- Implement changes
  - **Write code in:** the reputation score meter component.
  - **Write comprehensive tests in:** meter exposes name and value text.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: zero score, max score.
- Include the full test output in the PR description.

### Example commit message
`a11y(reputation): name the score meter`

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
title: "Add an at-a-glance summary of active contracts and upcoming milestones"
labels: type:feature, area:dashboard, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Give users a quick status overview

### Description
Users must visit multiple pages to gauge their current workload. This issue adds a concise summary of active contracts and upcoming milestones.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Render counts of active contracts and milestones due soon, derived from loaded data, with links to the relevant lists.
- Handle the empty case gracefully; keep it accessible.
- Do not add new fetches if the data is already available.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/dashboard-01-summary`
- Implement changes
  - **Write code in:** a summary component on the landing/dashboard area.
  - **Write comprehensive tests in:** counts reflect data, empty state, links present.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: no contracts, nothing due soon.
- Include the full test output in the PR description.

### Example commit message
`feat(dashboard): add active-work summary`

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
title: "Extract a shared Card primitive used across pages"
labels: type:refactor, area:ui, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Unify card containers

### Description
Card-like containers are re-implemented across pages with divergent padding/border styles. This issue extracts one accessible Card primitive.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Create a Card primitive (optional header/footer slots) and adopt it where ad-hoc cards exist.
- Rendered content unchanged; reuse only.
- Keep heading semantics intact where cards carry titles.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b refactor/ui-03-card`
- Implement changes
  - **Write code in:** create Card; adopt at call sites.
  - **Write comprehensive tests in:** renders children, optional header/footer, no semantic regressions.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: card with and without header.
- Include the full test output in the PR description.

### Example commit message
`refactor(ui): extract shared Card primitive`

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
title: "Announce the dialog title on open via aria-labelledby"
labels: type:a11y, area:dialog, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Name dialogs for assistive tech

### Description
Dialogs open without a programmatic name in some cases, so screen readers do not announce their purpose. This issue wires aria-labelledby to the title.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Associate each dialog with its title via aria-labelledby (stable id).
- No visual change; keep the existing focus trap.
- Verify with an automated a11y assertion if available.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b a11y/dialog-01-labelledby`
- Implement changes
  - **Write code in:** the shared dialog component.
  - **Write comprehensive tests in:** dialog is labelled by its title.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: dialog without a visible title, nested dialogs.
- Include the full test output in the PR description.

### Example commit message
`a11y(dialog): label dialogs via aria-labelledby`

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
title: "Add a compact and comfortable density preference"
labels: type:feature, area:settings, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Let users choose UI density

### Description
The UI has a single density. This issue adds a persisted compact/comfortable preference affecting list spacing.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add a density toggle persisted to a namespaced, SSR-guarded key; apply it to the lists.
- Restore on mount with a safe fallback; keep it accessible.
- Reuse the existing preferences layer.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/settings-02-density`
- Implement changes
  - **Write code in:** settings + the affected lists.
  - **Write comprehensive tests in:** toggle changes density, persists, invalid value falls back.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: corrupt stored value, SSR no-op.
- Include the full test output in the PR description.

### Example commit message
`feat(settings): add density preference`

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
title: "Add a copy-details action to error toasts"
labels: type:feature, area:toast, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Let users copy error details

### Description
When an error toast appears, users cannot copy its details for a bug report. This issue adds a copy-details action on error toasts.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add an accessible copy-details control on error toasts copying the message (and any correlation id).
- Use the Clipboard API with a documented fallback.
- Only on error-severity toasts.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/toast-02-copy-details`
- Implement changes
  - **Write code in:** the toast component.
  - **Write comprehensive tests in:** copy present on errors only, success and fallback paths.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: no details available, clipboard unavailable.
- Include the full test output in the PR description.

### Example commit message
`feat(toast): add copy-details on error toasts`

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
title: "Add a routing and layout architecture overview"
labels: type:docs, area:architecture, stack:nextjs, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Document the app routing and layout

### Description
New contributors lack a map of the App Router structure, layouts, and providers. This issue adds an overview doc.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add `docs/architecture.md` covering the route structure, root/layout composition, providers, and route announcement.
- Keep it accurate — read the app directory first.
- Link from the docs index if one exists.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b docs/arch-01-routing-layout`
- Implement changes
  - **Add documentation:** create `docs/architecture.md`.
- Test and commit

### Test and commit
- Run `npm run build`.
- Cover edge cases: n/a — verify described routes exist.
- Include the full test output in the PR description.

### Example commit message
`docs(arch): add routing and layout overview`

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
title: "Add tests for the contract status filter chips"
labels: type:test, area:contracts, stack:typescript, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Cover the contract status filter

### Description
The contract status filter chips need deterministic tests for filtering and selected state. This issue adds them.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add tests asserting each chip filters the list, the selected state is exposed, and clear restores all.
- Drive via the rendered component.
- Do not change behaviour unless a defect is found (note it).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/contracts-01-status-chips`
- Implement changes
  - **Write comprehensive tests in:** the Contracts list test suite.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: status with no contracts, combine with search.
- Include the full test output in the PR description.

### Example commit message
`test(contracts): cover status filter chips`

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
title: "Add a due-this-week quick filter to the Milestones list"
labels: type:feature, area:milestones, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Focus on imminent milestones

### Description
Finding milestones due this week requires manual scanning. This issue adds a quick filter for the current week.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add an accessible due-this-week quick filter using the existing date helpers; combine with other filters.
- Announce result counts; default off.
- Derive from loaded data.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/milestones-06-due-this-week`
- Implement changes
  - **Write code in:** the Milestones list toolbar.
  - **Write comprehensive tests in:** filter narrows to this week, boundary handling, combines with status filter.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: week boundary, timezone edge, none due.
- Include the full test output in the PR description.

### Example commit message
`feat(milestones): add due-this-week quick filter`

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
title: "Add responsive scroll semantics and labels to wide tables"
labels: type:a11y, area:tables, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Make wide tables usable on small screens

### Description
Wide tables overflow on small screens without accessible scroll semantics. This issue adds a labelled, keyboard-reachable scroll container.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Wrap wide tables in a labelled, focusable, horizontally-scrollable region (role/tabindex/aria-label).
- Do not change columns or data.
- Verify with an automated a11y assertion if available.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b a11y/tables-01-scroll`
- Implement changes
  - **Write code in:** the shared table wrapper.
  - **Write comprehensive tests in:** scroll region is labelled and keyboard-reachable.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: narrow viewport, very wide table.
- Include the full test output in the PR description.

### Example commit message
`a11y(tables): add responsive scroll semantics`

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
title: "Add a contract count summary above the Contracts list"
labels: type:feature, area:contracts, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Show how many contracts match

### Description
The Contracts list gives no total or filtered count. This issue adds an accessible count summary that updates with filters.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Render a summary (for example, showing 4 of 12 contracts) that updates with search/filter, announced politely.
- Derive from the current list state.
- Keep it accessible.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/contracts-09-count-summary`
- Implement changes
  - **Write code in:** the Contracts list header.
  - **Write comprehensive tests in:** count reflects total and filtered states, announced on change.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: zero matches, all matches.
- Include the full test output in the PR description.

### Example commit message
`feat(contracts): add contract count summary`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
