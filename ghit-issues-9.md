---
type: Feature
title: "Export due milestones as an ICS calendar file from the Milestones page"
labels: type:feature, area:milestones, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Export due milestones as an ICS calendar file from the Milestones page

### Description
`src/app/milestones/page.tsx` renders milestones with due dates that are only surfaced in-app through `src/lib/dueSoon.ts`. Freelancers cannot move those deadlines into their own calendar. Add an "Add to calendar" action that serializes the visible milestones into a downloadable `.ics` file.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add `src/lib/icsExport.ts` that builds RFC 5545 VEVENT blocks from milestone title, due date, and status, escaping commas, semicolons, and newlines.
- Reuse `parseLocalDate` from `src/lib/dueSoon.ts` so exported dates do not shift across timezones.
- Trigger the download with a Blob object URL and revoke it after the click; skip milestones with no due date.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/milestones-ics-export`
- **Write code in:** `src/lib/icsExport.ts`
- **Write comprehensive tests in:** `src/lib/__tests__/icsExport.test.ts`
- **Add documentation:** `docs/lib/ics-export.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`feat(milestones): export due milestones as an ICS calendar file`

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
title: "Add a keyboard command palette for jumping between contracts, milestones, and reputation"
labels: type:feature, area:navigation, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Add a keyboard command palette for jumping between contracts, milestones, and reputation

### Description
Navigation today is limited to `src/components/Navbar.tsx` links and the header controls in `src/components/HeaderActions.tsx`. Power users repeatedly mouse through the same three routes. Add a Cmd/Ctrl+K command palette that lists routes and quick actions with fuzzy filtering.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Create `src/components/CommandPalette.tsx` mounted from `src/app/layout.tsx`, opening on Cmd+K / Ctrl+K and closing on Escape.
- Implement the listbox with `role="combobox"`/`role="listbox"`, `aria-activedescendant`, and arrow-key navigation; return focus to the previously focused element on close.
- Respect `useMediaQuery` from `src/hooks/useMediaQuery.ts` for reduced-motion open transitions.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/navigation-command-palette`
- **Write code in:** `src/components/CommandPalette.tsx`
- **Write comprehensive tests in:** `src/components/__tests__/CommandPalette.test.tsx`
- **Add documentation:** `docs/components/CommandPalette.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`feat(navigation): add cmd+k command palette for route navigation`

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
title: "Add a print-friendly stylesheet and print action for the contract detail page"
labels: type:feature, area:contract-detail, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Add a print-friendly stylesheet and print action for the contract detail page

### Description
`src/app/contracts/[id]/page.tsx` composes `ContractSummary`, `ContractProgress`, and `ActionPanel`, none of which degrade well when printed or saved to PDF. Add a print action plus `@media print` rules so a contract can be archived as a clean one-page record.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Hide `src/components/ActionPanel.tsx` controls, the navbar, and the header actions in print, and expand truncated addresses to their full value.
- Add a "Print contract" button on the detail page that calls `window.print()` and is itself excluded from print output.
- Keep print colors legible on white by forcing high-contrast text for `src/components/StatusBadge.tsx`.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/contract-detail-print-view`
- **Write code in:** `src/app/contracts/[id]/page.tsx`
- **Write comprehensive tests in:** `src/app/contracts/[id]/__tests__/page.test.tsx`
- **Add documentation:** `docs/components/ContractDetail.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`feat(contract-detail): add print stylesheet and print action`

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
title: "Surface an offline connectivity banner that blocks wallet actions while the browser is offline"
labels: type:enhancement, area:connectivity, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Surface an offline connectivity banner that blocks wallet actions while the browser is offline

### Description
`src/contexts/WalletContext.tsx` and `src/components/ActionPanel.tsx` let users trigger connect, release, and dispute actions with no awareness of network state, so an offline user gets a confusing generic failure. Add a connectivity hook and a persistent banner that disables those actions until connectivity returns.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add `src/hooks/useOnlineStatus.ts` subscribing to `online`/`offline` events with an SSR-safe initial value.
- Render an `aria-live="polite"` banner in `src/app/layout.tsx` and feed the offline reason into the existing `disabledReasons` API of `ActionPanel`.
- Re-enable actions and announce recovery when the browser comes back online.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/connectivity-offline-banner`
- **Write code in:** `src/hooks/useOnlineStatus.ts`
- **Write comprehensive tests in:** `src/hooks/__tests__/useOnlineStatus.test.ts`
- **Add documentation:** `docs/hooks/useOnlineStatus.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`feat(connectivity): add offline banner and gate wallet actions`

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
title: "Enforce a client bundle size budget as part of the build pipeline"
labels: type:enhancement, area:performance, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Enforce a client bundle size budget as part of the build pipeline

### Description
`package.json` exposes only `next build` with no guard on output size, and the repo root already carries stale artifacts such as `next-build.txt` and `build-out.txt` from manual size checks. Add a scripted budget check that parses the App Router build manifest and fails when a route's first-load JS exceeds a declared ceiling.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add `scripts/check-bundle-budget.mjs` reading `.next/app-build-manifest.json` and a `bundleBudget` map committed alongside it.
- Wire an `npm run analyze` script in `package.json` and document the current baselines per route.
- Exit non-zero with a per-route diff table so regressions are actionable in CI logs.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/performance-bundle-budget`
- **Write code in:** `scripts/check-bundle-budget.mjs`
- **Write comprehensive tests in:** `src/lib/__tests__/bundleBudget.test.ts`
- **Add documentation:** `docs/performance/bundle-budget.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`chore(performance): enforce first-load JS budget in the build`

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
title: "Memoize milestone rows so filtering does not re-render the whole list"
labels: type:enhancement, area:performance, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Memoize milestone rows so filtering does not re-render the whole list

### Description
`src/components/MilestonesList.tsx` re-renders every row whenever the filter in `src/components/milestones/MilestoneFilter.tsx` changes, and each row re-runs currency formatting from `src/lib/preferences.tsx`. Split the row into a memoized child and stabilize the callbacks passed down so only changed rows re-render.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Extract a `MilestoneRow` component wrapped in `React.memo` with a comparator keyed on milestone id, status, amount, and due date.
- Wrap the filtered list derivation in `useMemo` and row handlers in `useCallback` in the parent list.
- Add a render-count assertion in tests so the optimization cannot silently regress.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/performance-memoize-milestone-rows`
- **Write code in:** `src/components/MilestonesList.tsx`
- **Write comprehensive tests in:** `src/components/__tests__/MilestonesList.test.tsx`
- **Add documentation:** `docs/components/MilestonesList.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`perf(milestones): memoize milestone rows to cut filter re-renders`

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
title: "Fix the malformed img-src directive that breaks CSP parsing in next.config.js"
labels: type:security, area:csp, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Fix the malformed img-src directive that breaks CSP parsing in next.config.js

### Description
`next.config.js` emits `img-src 'self' data:'` with a stray trailing apostrophe, producing an invalid source expression that browsers drop. The result is a directive that does not mean what the surrounding comments in `docs/security-headers.md` claim. Correct the token and add a parser-level assertion so a malformed directive fails the test suite.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Change the value to `img-src 'self' data:` and confirm the joined header string round-trips cleanly.
- Extend `src/app/__tests__/csp.test.ts` with a directive tokenizer that rejects unbalanced quotes across every directive, not just `img-src`.
- Verify both the development and production branches of `cspDirectives` produce valid policies.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b security/csp-fix-img-src-directive`
- **Write code in:** `next.config.js`
- **Write comprehensive tests in:** `src/app/__tests__/csp.test.ts`
- **Add documentation:** `docs/security-headers.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`fix(security): correct malformed img-src token in the CSP header`

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
title: "Redact raw error details from the SafeBoundary fallback shown to users"
labels: type:security, area:error-handling, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Redact raw error details from the SafeBoundary fallback shown to users

### Description
`src/components/SafeBoundary.tsx` and the route boundaries in `src/app/error.tsx` and `src/app/global-error.tsx` can surface raw exception text, which may include wallet addresses, storage keys, or stack frames. Show a stable user-facing message and route the full detail only through `src/lib/errorReporter.ts`.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add a redaction helper that strips Stellar G-addresses, URLs, and stack traces before any detail reaches the DOM.
- Keep an unredacted path in development behind a `process.env.NODE_ENV` check, and always redact in production builds.
- Display the reporter's error digest instead of the message so users can quote a safe identifier in support requests.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b security/error-handling-redact-boundary-details`
- **Write code in:** `src/components/SafeBoundary.tsx`
- **Write comprehensive tests in:** `src/components/SafeBoundary.test.tsx`
- **Add documentation:** `docs/error-reporting.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`fix(security): redact sensitive error detail in boundary fallbacks`

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
title: "Add tests for MilestoneFilter radiogroup keyboard selection and result-count announcements"
labels: type:test, area:milestones, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Add tests for MilestoneFilter radiogroup keyboard selection and result-count announcements

### Description
`src/components/milestones/MilestoneFilter.tsx` implements a fieldset-based radiogroup with a polite live region reporting `resultCount`, but it has no dedicated test file. Cover selection via keyboard and pointer, the announcement text, and the zero-result wording.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Assert every option in the `All | Pending | Completed | Paid | Disputed` set renders, is reachable with arrow keys, and fires `onChange` exactly once.
- Assert the live region updates when `resultCount` changes, including singular versus plural phrasing at 1 and 0 results.
- Include a `jest-axe` pass using the helpers in `src/test-utils/a11y.tsx`.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/milestones-milestone-filter`
- **Write code in:** `src/components/milestones/MilestoneFilter.tsx`
- **Write comprehensive tests in:** `src/components/milestones/__tests__/MilestoneFilter.test.tsx`
- **Add documentation:** `docs/components/MilestonesList.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`test(milestones): cover MilestoneFilter selection and live region`

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
title: "Add tests for the RouteAnnouncer main-landmark focus and h1 fallback text"
labels: type:test, area:navigation, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Add tests for the RouteAnnouncer main-landmark focus and h1 fallback text

### Description
`src/components/RouteAnnouncer.tsx` focuses `<main>` and announces the first `<h1>` on every pathname change, falling back to `Page: <pathname>`. The existing `src/components/__tests__/RouteAnnouncer.test.tsx` should be extended to pin down the first-render no-op and the fallback path.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Mock `usePathname` from `next/navigation` and assert no announcement fires on the initial mount.
- Assert `<main tabIndex={-1}>` receives focus on navigation, and that a missing `<main>` does not throw.
- Cover the `Page: /milestones` fallback when the document has no `<h1>` and the whitespace-only `<h1>` case.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/navigation-route-announcer`
- **Write code in:** `src/components/RouteAnnouncer.tsx`
- **Write comprehensive tests in:** `src/components/__tests__/RouteAnnouncer.test.tsx`
- **Add documentation:** `docs/components/Accessibility.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`test(navigation): cover RouteAnnouncer focus and fallback announcement`

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
title: "Add tests for validateLogin length ceilings and required-then-length-then-format ordering"
labels: type:test, area:auth, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Add tests for validateLogin length ceilings and required-then-length-then-format ordering

### Description
`src/lib/validateLogin.ts` documents `MAX_EMAIL_LENGTH` of 254 and `MAX_PASSWORD_LENGTH` of 128 plus a strict required → length → format precedence, but `src/lib/validateLogin.test.ts` does not exercise those boundaries. Add exhaustive boundary and ordering assertions.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Test emails at 253, 254, and 255 characters, and passwords at 7, 8, 128, and 129 characters.
- Assert a whitespace-only email yields the required error, and an over-length malformed email yields the length error before the format error.
- Assert the returned `ValidationError[]` order matches field order so `ErrorSummary` anchors stay stable.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/auth-validate-login-boundaries`
- **Write code in:** `src/lib/validateLogin.ts`
- **Write comprehensive tests in:** `src/lib/validateLogin.test.ts`
- **Add documentation:** `docs/lib/validate-login.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`test(auth): cover validateLogin length ceilings and error ordering`

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
title: "Add tests for the HeaderActions mobile disclosure toggle and aria-expanded state"
labels: type:test, area:header, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Add tests for the HeaderActions mobile disclosure toggle and aria-expanded state

### Description
`src/components/HeaderActions.tsx` collapses wallet actions behind a disclosure button below the `sm` breakpoint, wiring `aria-expanded`, `aria-controls`, and a swapped screen-reader label. `src/components/__tests__/HeaderActions.test.tsx` should assert that contract end to end.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Assert `aria-expanded` flips between `"true"` and `"false"` and that `aria-controls` matches the id of the rendered panel.
- Assert the visually hidden label swaps between "Open wallet actions" and "Close wallet actions".
- Assert `ThemeToggle` and `WalletConnectButton` both mount, and add a `jest-axe` check for the expanded state.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/header-header-actions-disclosure`
- **Write code in:** `src/components/HeaderActions.tsx`
- **Write comprehensive tests in:** `src/components/__tests__/HeaderActions.test.tsx`
- **Add documentation:** `docs/components/HeaderActions.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`test(header): cover HeaderActions disclosure toggle behavior`

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
title: "Document the ConfirmDialog focus-trap contract and caller responsibilities"
labels: type:docs, area:dialogs, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Document the ConfirmDialog focus-trap contract and caller responsibilities

### Description
`src/components/ConfirmDialog.tsx` traps focus, closes on Escape, and explicitly delegates focus restoration to the caller, but `docs/components` has no page for it. Contributors wiring new destructive flows have to read the source to learn that contract.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Document every prop in `ConfirmDialogProps`, including the `confirmLabel`/`cancelLabel` defaults.
- State clearly that callers must retain a trigger ref and restore focus on close, using `src/components/ActionPanel.tsx` as the worked example.
- Note the `FOCUSABLE_SELECTORS` list and what happens when the dialog contains no focusable element.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b docs/dialogs-confirm-dialog`
- **Write code in:** `src/components/ConfirmDialog.tsx`
- **Write comprehensive tests in:** `src/components/__tests__/ConfirmDialog.test.tsx`
- **Add documentation:** `docs/components/ConfirmDialog.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`docs(dialogs): document ConfirmDialog focus and escape contract`

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
title: "Write a milestone status filter guide covering the radiogroup API and live-region wording"
labels: type:docs, area:milestones, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Write a milestone status filter guide covering the radiogroup API and live-region wording

### Description
`src/components/milestones/MilestoneFilter.tsx` defines the canonical `MilestoneStatusFilter` union and an accessible radiogroup pattern that other list views should copy. Capture the API, the announcement wording rules, and the WCAG rationale in a dedicated guide.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Document the `selected`, `onChange`, and `resultCount` props plus the ordered `FILTER_OPTIONS` list.
- Explain the `<fieldset>`/`<legend>` choice for WCAG 1.3.1 and why the live region is `polite` rather than `assertive`.
- Show the consumption example from `src/app/milestones/page.tsx` including how the filtered count is derived.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b docs/milestones-status-filter-guide`
- **Write code in:** `src/components/milestones/MilestoneFilter.tsx`
- **Write comprehensive tests in:** `src/app/milestones/__tests__/page.test.tsx`
- **Add documentation:** `docs/components/MilestoneFilter.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`docs(milestones): add MilestoneFilter radiogroup usage guide`

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
title: "Consolidate the duplicate jest.setup.js and jest.setup.ts bootstrap files"
labels: type:refactor, area:test-infra, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Consolidate the duplicate jest.setup.js and jest.setup.ts bootstrap files

### Description
The repo root carries both `jest.setup.js` and `jest.setup.ts` while `jest.config.js` can only reference one of them, leaving a dead file that silently drifts from the active setup. Collapse them into a single TypeScript setup module and delete the orphan.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Diff both files, merge any unique matchers or global mocks, and keep `@testing-library/jest-dom` plus the `jest-axe` matchers registered exactly once.
- Update `setupFilesAfterEach`/`setupFilesAfterEnv` in `jest.config.js` and any path reference in `tsconfig.test.json`.
- Confirm the full suite passes unchanged after removal so no test depended on the orphaned file.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b refactor/test-infra-single-jest-setup`
- **Write code in:** `jest.setup.ts`
- **Write comprehensive tests in:** `src/components/__tests__/a11y.test.tsx`
- **Add documentation:** `CONTRIBUTING.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`refactor(test-infra): consolidate jest setup into a single module`

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
title: "Extract the nested layout providers into a single Providers client component"
labels: type:refactor, area:app-shell, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Extract the nested layout providers into a single Providers client component

### Description
`src/app/layout.tsx` nests the wallet, preferences, and toast providers together with client-only components such as `RouteAnnouncer`, which forces server/client boundary noise into the root layout. Move the provider tree into one `Providers` client component so the layout stays a server component with metadata concerns only.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Create `src/app/providers.tsx` composing `WalletProvider` from `src/contexts/WalletContext.tsx`, the provider in `src/lib/preferences.tsx`, and `src/components/toast/toast-provider.tsx` in the current order.
- Keep provider ordering identical so theme application still runs before toast density reads preferences.
- Update `src/app/__tests__/layout.test.tsx` to render through the new component without changing observable behavior.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b refactor/app-shell-extract-providers`
- **Write code in:** `src/app/providers.tsx`
- **Write comprehensive tests in:** `src/app/__tests__/layout.test.tsx`
- **Add documentation:** `docs/walkthrough.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`refactor(app-shell): extract root providers into a Providers component`

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
title: "Promote ConfirmDialog to alertdialog semantics with wired aria-labelledby and aria-describedby"
labels: type:a11y, area:dialogs, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Promote ConfirmDialog to alertdialog semantics with wired aria-labelledby and aria-describedby

### Description
`src/components/ConfirmDialog.tsx` traps focus correctly but its `title` and `description` are not programmatically associated with the dialog container, so screen readers announce an unnamed dialog. Generate ids with `useId` and expose `role="alertdialog"` for destructive confirmations such as dispute and release funds in `src/components/ActionPanel.tsx`.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Wire `aria-labelledby` and `aria-describedby` to `useId`-generated heading and description ids, and set `aria-modal="true"`.
- Add an optional `tone` prop that selects `alertdialog` for destructive actions and `dialog` otherwise, defaulting to the current behavior.
- Mark background content `inert` or `aria-hidden` while open so virtual-cursor users cannot escape the dialog.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b a11y/dialogs-confirm-dialog-alertdialog`
- **Write code in:** `src/components/ConfirmDialog.tsx`
- **Write comprehensive tests in:** `src/components/__tests__/ConfirmDialog.test.tsx`
- **Add documentation:** `docs/components/Accessibility.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`fix(a11y): give ConfirmDialog accessible name, description, and modal semantics`

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
title: "Give the breadcrumb trail a nav landmark label, aria-current, and visible focus styling"
labels: type:a11y, area:breadcrumbs, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN, Official Campaign | FWC26
assignees: ''
---
## Give the breadcrumb trail a nav landmark label, aria-current, and visible focus styling

### Description
`src/components/Breadcrumbs.tsx` renders the trail used on the contract detail route, but the current page is conveyed by styling alone and the trail competes with the primary nav in `src/components/Navbar.tsx` for landmark identity. Add proper landmark labelling, `aria-current="page"`, and keyboard-visible focus rings.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Wrap the trail in `<nav aria-label="Breadcrumb">` with an ordered list, and render the final crumb as non-interactive text carrying `aria-current="page"`.
- Mark the chevron separators `aria-hidden="true"` so they are not read between crumb names.
- Add `focus-visible` ring utilities that meet 3:1 contrast in both light and dark themes.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b a11y/breadcrumbs-landmark-and-current`
- **Write code in:** `src/components/Breadcrumbs.tsx`
- **Write comprehensive tests in:** `src/components/__tests__/Breadcrumbs.test.tsx`
- **Add documentation:** `docs/components/Accessibility.md`

### Test and commit
- Run `npm run lint`, `npm test`, `npm run build`
- Cover edge cases; include test output

### Example commit message
`fix(a11y): label the breadcrumb landmark and mark the current page`

### Guidelines
- Minimum 95 percent test coverage for impacted modules
- Clear documentation
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — a **5-star rating** is much appreciated.
