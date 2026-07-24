---
type: Feature
title: "Add a status filter chip group to the Contracts list"
labels: type:feature, area:contracts, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Let users filter contracts by status

### Description
The Contracts list cannot be filtered by status, so users scroll to find, for example, disputed contracts. This issue adds an accessible status filter chip group.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add a filter chip group (all/active/completed/disputed/cancelled) with an accessible selected state.
- Filter client-side; combine sensibly with any existing search.
- Reuse the existing Contract status values.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/contracts-04-status-filter`
- Implement changes
  - **Write code in:** the Contracts list toolbar/component.
  - **Write comprehensive tests in:** each chip filters, all clears, selected state exposed.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: no contracts in a status, combine with search.
- Include the full test output in the PR description.

### Example commit message
`feat(contracts): add status filter chips`

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
title: "Add a copy-contract-id action to contract rows"
labels: type:feature, area:contracts, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Let users copy a contract id

### Description
Copying a contract id means selecting truncated text. This issue adds a per-row copy control with a toast.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add an accessible copy control per contract row that copies the full id.
- Use the Clipboard API with a documented fallback; confirm via the existing toast.
- Keyboard-operable with a clear label.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/contracts-05-copy-id`
- Implement changes
  - **Write code in:** the contract row component; reuse any clipboard helper.
  - **Write comprehensive tests in:** success path, clipboard-throws fallback, accessible name.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: clipboard unavailable, repeated clicks.
- Include the full test output in the PR description.

### Example commit message
`feat(contracts): add copy-contract-id action`

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
title: "Show the connected network name in the header"
labels: type:feature, area:wallet, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Tell users which network they are on

### Description
The header shows wallet connection but not which Stellar network is active, risking confusion. This issue surfaces the network name.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Display the active network name in the header when a wallet is connected.
- Handle unknown/disconnected states gracefully; keep it accessible.
- Reuse the existing wallet context.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/wallet-02-network-name`
- Implement changes
  - **Write code in:** the header/wallet status component.
  - **Write comprehensive tests in:** shows network when connected, hidden/placeholder when not.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: disconnected, unknown network id.
- Include the full test output in the PR description.

### Example commit message
`feat(wallet): show connected network name in header`

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
title: "Mark the current route in the header nav with aria-current"
labels: type:a11y, area:navigation, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Indicate the active nav item to assistive tech

### Description
The header navigation does not mark the active route, so screen-reader users cannot tell where they are. This issue adds aria-current.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Set aria-current=page on the header nav item matching the current route.
- No visual change required beyond any existing active styling.
- Verify with an automated a11y assertion if available.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b a11y/nav-01-aria-current`
- Implement changes
  - **Write code in:** the header nav component.
  - **Write comprehensive tests in:** the active item carries aria-current, others do not.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: nested routes, unknown route.
- Include the full test output in the PR description.

### Example commit message
`a11y(nav): mark active item with aria-current`

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
title: "Add a milestone completion progress bar to the contract detail page"
labels: type:feature, area:contracts, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Summarize milestone progress visually

### Description
The contract detail page lists milestones but shows no at-a-glance completion summary. This issue adds an accessible progress bar.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Render an accessible progress bar (role/aria-valuenow) summarizing completed vs total milestones.
- Derive from existing milestone data; do not refetch.
- Convey the value as text too, not colour alone.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/contracts-06-progress-bar`
- Implement changes
  - **Write code in:** the contract detail page.
  - **Write comprehensive tests in:** value reflects completed/total, zero and full cases.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: no milestones, all complete.
- Include the full test output in the PR description.

### Example commit message
`feat(contracts): add milestone progress bar`

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
title: "Add an empty state when a contract has no milestones"
labels: type:feature, area:milestones, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Guide users when a contract has no milestones

### Description
A contract with no milestones renders a blank section with no guidance. This issue adds an accessible empty state with a create affordance.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Render an announced empty state (with a create-milestone affordance if applicable) when a contract has no milestones.
- Keep it distinct from loading/error.
- Reuse the existing milestone data flow.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/milestones-03-empty-state`
- Implement changes
  - **Write code in:** the milestones section of the contract detail page.
  - **Write comprehensive tests in:** empty renders guidance + create affordance.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: loading vs empty exclusivity.
- Include the full test output in the PR description.

### Example commit message
`feat(milestones): add empty state for no milestones`

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
title: "Filter the reputation history by event type"
labels: type:feature, area:reputation, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Let users focus the reputation history

### Description
The reputation history mixes all event types, making it hard to scan. This issue adds a client-side filter by event type.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add an accessible filter to show only selected reputation event types; default to all.
- Filter client-side over the existing history; announce result counts.
- Reuse the existing history data.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/reputation-01-history-filter`
- Implement changes
  - **Write code in:** the ReputationProfile history section.
  - **Write comprehensive tests in:** filter narrows entries, all restores, empty result guidance.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: type with no entries, single entry.
- Include the full test output in the PR description.

### Example commit message
`feat(reputation): filter history by event type`

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
title: "Extract a shared StatusBadge component for contract and milestone statuses"
labels: type:refactor, area:ui, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Unify status badge rendering

### Description
Status badges are re-implemented for contracts and milestones with divergent styles. This issue extracts one accessible StatusBadge.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Create a StatusBadge (status -> label + accessible styling, not colour alone) and adopt it at the contract/milestone sites.
- Rendered labels unchanged; reuse only.
- Cover each status value.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b refactor/ui-02-status-badge`
- Implement changes
  - **Write code in:** create StatusBadge; adopt at call sites.
  - **Write comprehensive tests in:** each status renders the right label + accessible name.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: unknown status fallback.
- Include the full test output in the PR description.

### Example commit message
`refactor(ui): extract shared StatusBadge component`

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
title: "Associate form field hints with inputs via aria-describedby"
labels: type:a11y, area:forms, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Make form hints programmatically linked

### Description
Form field hints are visually present but not linked to their inputs, so assistive tech does not announce them. This issue wires aria-describedby.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Associate each field's hint (and error) to its input via aria-describedby with stable ids.
- No change to the visible layout.
- Verify with an automated a11y assertion if available.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b a11y/forms-01-describedby`
- Implement changes
  - **Write code in:** the shared FormField component.
  - **Write comprehensive tests in:** input is described by its hint and error ids.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: field with hint only, with error only, with both.
- Include the full test output in the PR description.

### Example commit message
`a11y(forms): link hints via aria-describedby`

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
title: "Cap the maximum visible toasts with a queue"
labels: type:feature, area:toast, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Prevent toast overflow

### Description
Many rapid events can stack unbounded toasts, covering the UI. This issue caps visible toasts and queues the rest.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Cap concurrently visible toasts at a small maximum and queue overflow, promoting queued toasts as slots free.
- Preserve severity ordering; do not drop error toasts silently.
- Reuse the existing toast provider.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/toast-01-max-visible`
- Implement changes
  - **Write code in:** the toast provider.
  - **Write comprehensive tests in:** cap enforced, queued toast promoted on dismiss, errors not dropped.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: burst of toasts, all-error burst.
- Include the full test output in the PR description.

### Example commit message
`feat(toast): cap visible toasts with a queue`

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
title: "Add a JSON export of all locally stored app data"
labels: type:feature, area:data, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Let users back up their local data

### Description
App data lives in localStorage with no export path, so users cannot back it up or move browsers. This issue adds a JSON export.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add an accessible export control that downloads all namespaced app data as JSON.
- Read via the safe storage wrapper; do not include unrelated keys.
- Handle an empty store gracefully.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/data-01-export-json`
- Implement changes
  - **Write code in:** a settings/data section + a small export helper.
  - **Write comprehensive tests in:** export includes stored keys, empty store yields an empty document.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: empty store, corrupt stored value skipped.
- Include the full test output in the PR description.

### Example commit message
`feat(data): add JSON export of local app data`

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
title: "Document the app keyboard shortcuts and focus model"
labels: type:docs, area:a11y, stack:nextjs, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Document keyboard interaction

### Description
The app has various keyboard interactions but no single reference, hurting discoverability and a11y review. This issue documents them.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add `docs/keyboard.md` listing shortcuts, focus-trap behaviours (dialogs), and the route-announcement model.
- Keep it accurate — read the relevant components first.
- Link from the docs index if one exists.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b docs/a11y-01-keyboard`
- Implement changes
  - **Add documentation:** create `docs/keyboard.md`.
- Test and commit

### Test and commit
- Run `npm run build`.
- Cover edge cases: n/a — verify each shortcut against source.
- Include the full test output in the PR description.

### Example commit message
`docs(a11y): document keyboard shortcuts and focus model`

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
title: "Add a back-to-top control on long scrollable lists"
labels: type:feature, area:ui, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Help users return to the top of long lists

### Description
Long contract/milestone lists offer no quick way back to the top. This issue adds an accessible back-to-top control that appears after scrolling.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Show an accessible back-to-top button after the list scrolls past a threshold; activating it returns focus to the top.
- Hide it near the top; keep it keyboard-operable.
- Reuse across the long lists.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/ui-01-back-to-top`
- Implement changes
  - **Write code in:** a shared control adopted by the long lists.
  - **Write comprehensive tests in:** appears past threshold, hidden near top, moves focus to top on activate.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: short list (never shows), rapid scroll.
- Include the full test output in the PR description.

### Example commit message
`feat(ui): add back-to-top control for long lists`

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
title: "Add a status legend to the Milestones list"
labels: type:a11y, area:milestones, stack:nextjs, stack:react, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---

## Explain milestone status indicators

### Description
Milestone status indicators are shown without a key, so their meaning is not obvious. This issue adds an accessible status legend.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add a concise legend mapping each status indicator to its meaning, associated with the list.
- Convey status by text, not colour alone.
- No change to the milestone data.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b a11y/milestones-01-status-legend`
- Implement changes
  - **Write code in:** the Milestones list.
  - **Write comprehensive tests in:** legend lists each status with a text label.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: single status present, all statuses present.
- Include the full test output in the PR description.

### Example commit message
`a11y(milestones): add a status legend`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
