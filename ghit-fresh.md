---
type: Feature
title: "Persist contracts and milestones to localStorage with a typed repository module"
labels: type:feature, area:persistence, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Implement a typed localStorage repository for contracts and milestones

### Description
The list pages [`src/app/contracts/page.tsx`](src/app/contracts/page.tsx) and [`src/app/milestones/page.tsx`](src/app/milestones/page.tsx) each hard-code an empty `any[]` and their add handlers only `console.log`, so nothing a user creates ever survives a navigation or refresh. There is no shared place to read or write app data. This issue introduces a small, typed client-side repository (backed by `localStorage`) that the pages can read from and write to, giving the otherwise-stubbed create flows somewhere durable to land until a real backend exists.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Create `src/lib/repository.ts` exposing typed `listContracts`/`saveContract` and `listMilestones`/`saveMilestone` functions over a single namespaced key, reusing the `Contract`/`Milestone` shapes already exported by [`ContractSummary`](src/components/ContractSummary.tsx) and [`MilestonesList`](src/components/MilestonesList.tsx).
- Guard all access for SSR (no `window`/`localStorage` on the server) and wrap reads in try/catch with a safe empty-array fallback, mirroring the hydration pattern in [`src/lib/preferences.tsx`](src/lib/preferences.tsx).
- Keep the API synchronous and pure enough to unit test; do not couple it to React.
- Replace the `any[]` placeholders on both pages with calls into the repository so created items render after refresh.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/persistence-01-local-repository`
- Implement changes
  - **Write code in:** create [`src/lib/repository.ts`](src/lib/repository.ts); update [`src/app/contracts/page.tsx`](src/app/contracts/page.tsx) and [`src/app/milestones/page.tsx`](src/app/milestones/page.tsx).
  - **Write comprehensive tests in:** create [`src/lib/__tests__/repository.test.ts`](src/lib/__tests__/repository.test.ts) — read, write, corrupt JSON, SSR (no window).
  - **Add documentation:** add `docs/persistence.md` describing the storage key and shapes.
  - Add JSDoc to each exported function.
  - Validate security: namespaced key, no PII beyond what the app already stores.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: empty store, corrupt value, write-then-read round trip, SSR no-op.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(persistence): add typed localStorage repository for contracts and milestones`

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
title: "Add a search and sort toolbar to the Milestones list"
labels: type:feature, area:milestones, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Implement search and sort controls for the Milestones list

### Description
[`src/components/MilestonesList.tsx`](src/components/MilestonesList.tsx) renders every milestone in insertion order inside a scroll container with no way to find or reorder items. As a contract grows, scanning a long list by hand becomes painful. This issue adds an accessible search box and a sort control (by due date and by payout) above the list, filtering and ordering the rendered milestones.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add a labelled search input that filters milestones by `title` (case-insensitive) and a sort `select` offering "Due date" and "Payout" (ascending/descending), keeping the existing `Milestone` type and `StatusBadge`/`formatAmount` rendering intact.
- Announce the filtered result count to assistive tech via an `aria-live` region, and show a friendly "no matches" message when the filter empties the list.
- Keep the component a pure presentational consumer — derive the displayed list from props plus local UI state; do not mutate the incoming array.
- Preserve the existing heading, total count, and scroll-container behavior.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/milestones-02-search-and-sort`
- Implement changes
  - **Write code in:** [`src/components/MilestonesList.tsx`](src/components/MilestonesList.tsx) (and optionally `src/components/milestones/MilestoneToolbar.tsx`).
  - **Write comprehensive tests in:** [`src/components/__tests__/MilestonesList.test.tsx`](src/components/__tests__/MilestonesList.test.tsx) (extend) — search filters, sort orders, empty matches, count announcement.
  - **Add documentation:** add a note to `docs/components` describing the toolbar.
  - Add JSDoc to the filter/sort helpers.
  - Validate a11y: labelled controls, live result count.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: empty query, no matches, ties in payout/date, single item.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(milestones): add accessible search and sort toolbar to the list`

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
title: "Show aggregate escrow totals and milestone progress on the contract detail page"
labels: type:feature, area:contracts, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Implement an escrow summary with milestone progress on the contract detail page

### Description
[`src/app/contracts/[id]/page.tsx`](src/app/contracts/%5Bid%5D/page.tsx) shows the [`ContractSummary`](src/components/ContractSummary.tsx) and a flat [`MilestonesList`](src/components/MilestonesList.tsx), but never tells the user how much of the contract value is already paid versus still in escrow, nor how many milestones are complete. This issue adds a small, accessible progress panel that derives totals from the milestone data already on the page.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Create `src/components/ContractProgress.tsx` that, given `Milestone[]`, computes paid vs. outstanding amounts (using each milestone's `status` and `payout`) and the completed/total milestone count, formatting money via `formatAmount` from [`src/lib/preferences.tsx`](src/lib/preferences.tsx).
- Render an accessible progress indicator using `role="progressbar"` with `aria-valuenow`/`aria-valuemin`/`aria-valuemax` and a visible label, not a bare styled `<div>`.
- Place the panel on the contract detail page above or beside the existing summary without breaking the two-column responsive grid.
- Keep all math pure and overflow-safe (guard against empty milestone arrays).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/contracts-03-escrow-progress`
- Implement changes
  - **Write code in:** create [`src/components/ContractProgress.tsx`](src/components/ContractProgress.tsx); update [`src/app/contracts/[id]/page.tsx`](src/app/contracts/%5Bid%5D/page.tsx).
  - **Write comprehensive tests in:** create [`src/components/__tests__/ContractProgress.test.tsx`](src/components/__tests__/ContractProgress.test.tsx) — totals math, empty list, all-paid, progressbar ARIA.
  - **Add documentation:** add `docs/components/ContractProgress.md`.
  - Add JSDoc to the totals helper.
  - Validate a11y: `role="progressbar"` with correct ARIA value attributes.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: zero milestones, all paid, none paid, mixed currencies.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(contracts): add accessible escrow progress and totals panel`

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
title: "Capture a required dispute reason before raising a dispute in ActionPanel"
labels: type:feature, area:contracts, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Implement a dispute-reason capture flow for the Dispute action

### Description
The "Dispute" button in [`src/components/ActionPanel.tsx`](src/components/ActionPanel.tsx) fires `onDispute` with no context, so a dispute carries no explanation of what went wrong. For a payments product, an unexplained dispute is nearly useless. This issue adds an accessible reason-capture step (a small textarea form) whose value is passed to the dispute handler.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add a reason input (textarea) gated behind the dispute action with required, bounded-length validation surfaced through [`FormField`](src/components/FormField.tsx) and the existing toast system.
- Change the `onDispute` prop to accept a `reason: string` argument (or add an optional reason) and thread it through [`src/app/contracts/[id]/page.tsx`](src/app/contracts/%5Bid%5D/page.tsx); keep the wallet-gating and `disabledReasons` behavior intact.
- Trim and length-cap the reason before passing it on; never render it as raw HTML.
- Keep the success/cancel paths accessible and return focus to the trigger on close.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/contracts-04-dispute-reason`
- Implement changes
  - **Write code in:** [`src/components/ActionPanel.tsx`](src/components/ActionPanel.tsx) and [`src/app/contracts/[id]/page.tsx`](src/app/contracts/%5Bid%5D/page.tsx).
  - **Write comprehensive tests in:** [`src/components/__tests__/ActionPanel.test.tsx`](src/components/__tests__/ActionPanel.test.tsx) (extend) — empty reason blocked, valid reason passed, length cap.
  - **Add documentation:** update [`docs/components/ActionPanel.md`](docs/components/ActionPanel.md).
  - Add JSDoc to the updated `onDispute` signature.
  - Validate a11y: labelled textarea, error association, focus return.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: empty reason, whitespace-only, over-length, valid submit.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(contracts): capture required dispute reason before raising a dispute`

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
title: "Add a responsive mobile menu so the wallet button never overflows the header"
labels: type:feature, area:navigation, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Implement a responsive header with a collapsible mobile menu

### Description
The header in [`src/app/layout.tsx`](src/app/layout.tsx) lays the brand and the multi-state [`WalletConnectButton`](src/components/WalletConnectButton.tsx) in a single flex row. On narrow screens the connected-state button (address pill plus copy and disconnect icons) crowds the brand and can overflow. This issue makes the header responsive with an accessible disclosure/menu on small viewports.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add a `src/components/HeaderActions.tsx` (or extend the header) that collapses wallet actions behind an accessible disclosure button (`aria-expanded`, `aria-controls`) below a breakpoint, and shows them inline on larger screens.
- Preserve the sticky/backdrop styling and the brand placement; no horizontal overflow at 320px width.
- Keep `WalletConnectButton`'s API unchanged; only its container/layout changes.
- Ensure keyboard operability and visible focus on the disclosure control.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/navigation-05-responsive-header`
- Implement changes
  - **Write code in:** [`src/app/layout.tsx`](src/app/layout.tsx) and create [`src/components/HeaderActions.tsx`](src/components/HeaderActions.tsx).
  - **Write comprehensive tests in:** create [`src/components/__tests__/HeaderActions.test.tsx`](src/components/__tests__/HeaderActions.test.tsx) — disclosure toggles, ARIA wiring, wallet button present.
  - **Add documentation:** add `docs/components/HeaderActions.md`.
  - Add JSDoc to the component.
  - Validate a11y: `aria-expanded`/`aria-controls`, keyboard toggle, axe clean.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: collapsed and expanded states, connected vs disconnected wallet, narrow viewport.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(navigation): add responsive header with accessible mobile disclosure`

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
title: "Add a breadcrumb trail to the contract detail page"
labels: type:enhancement, area:navigation, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Implement an accessible breadcrumb on the contract detail page

### Description
[`src/app/contracts/[id]/page.tsx`](src/app/contracts/%5Bid%5D/page.tsx) offers only a single "Back to contracts" link and a `Contract #{id}` heading, so users have no sense of where the page sits in the hierarchy. This issue adds a reusable, accessible breadcrumb component (Contracts › Contract #id) using the App Router.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Create `src/components/Breadcrumbs.tsx` rendering a `nav` with `aria-label="Breadcrumb"`, an ordered list, `next/link` for ancestor crumbs, and `aria-current="page"` on the last crumb.
- Use it on the contract detail page; keep the existing back link or fold it into the breadcrumb consistently.
- Make the component data-driven (accepts an array of `{ label, href? }`) so it can be reused on future detail pages.
- Avoid layout regressions to the existing two-column grid and headings.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/navigation-06-breadcrumbs`
- Implement changes
  - **Write code in:** create [`src/components/Breadcrumbs.tsx`](src/components/Breadcrumbs.tsx); update [`src/app/contracts/[id]/page.tsx`](src/app/contracts/%5Bid%5D/page.tsx).
  - **Write comprehensive tests in:** create [`src/components/__tests__/Breadcrumbs.test.tsx`](src/components/__tests__/Breadcrumbs.test.tsx) — crumb rendering, current marker, links.
  - **Add documentation:** add `docs/components/Breadcrumbs.md`.
  - Add JSDoc to the component props.
  - Validate a11y: `aria-current`, nav label, axe clean.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: single crumb, multiple crumbs, last crumb has no link.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(navigation): add accessible breadcrumb component to contract detail`

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
title: "Add action buttons (undo/retry) to toasts for wallet and payout events"
labels: type:enhancement, area:toast, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Implement optional action buttons on toasts

### Description
[`src/components/toast/toast-provider.tsx`](src/components/toast/toast-provider.tsx) renders title/description text only — there is no way for a toast to offer an action such as "Retry" after a failed wallet connection or "Undo" after a reversible change. This issue adds an optional, accessible action button to the toast API without breaking existing callers.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Extend the toast input with an optional `action?: { label: string; onClick: () => void }`; render it as a real `<button>` inside the toast with a visible focus style.
- Invoking the action should run the callback and dismiss the toast; keep `showSuccess`/`showError`/`dismissToast` backward compatible (action is optional).
- Preserve the `aria-live` announcer behavior, `quietMode` suppression, and per-toast timer cleanup; ensure the action button is reachable before auto-dismiss (pair well with any hover-pause logic).
- Do not render the label as HTML.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/toast-07-action-buttons`
- Implement changes
  - **Write code in:** [`src/components/toast/toast-provider.tsx`](src/components/toast/toast-provider.tsx).
  - **Write comprehensive tests in:** [`src/components/toast/toast-provider.test.tsx`](src/components/toast/toast-provider.test.tsx) (extend) — action renders, click fires callback and dismisses, optional when absent.
  - **Add documentation:** update the toast section of [`README.md`](README.md).
  - Add JSDoc to the extended toast input type.
  - Validate a11y: focusable button, announcer unaffected.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: no action, action click, action with quietMode, multiple toasts with actions.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(toast): add optional accessible action button to toasts`

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
title: "Add Open Graph and Twitter card metadata to the root layout"
labels: type:feature, area:seo, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Implement Open Graph and Twitter card metadata

### Description
The exported `metadata` in [`src/app/layout.tsx`](src/app/layout.tsx) sets only `title` and `description`, so links shared to social platforms or chat apps render with no preview image, no Open Graph fields, and no Twitter card. This issue enriches the App Router metadata using the Next.js Metadata API.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Extend `metadata` with `openGraph` (title, description, type, siteName, url, images) and `twitter` (card, title, description, images) using Next.js's typed `Metadata`.
- Add a `metadataBase` so relative OG image URLs resolve correctly in production.
- Provide a static OG image reference under `public/` (or document where it must be added); keep copy consistent with [`docs/COPYWRITING_GUIDE.md`](docs/COPYWRITING_GUIDE.md).
- Do not break the existing title/description or the CSP in [`next.config.js`](next.config.js).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/seo-08-open-graph-metadata`
- Implement changes
  - **Write code in:** [`src/app/layout.tsx`](src/app/layout.tsx).
  - **Write comprehensive tests in:** create [`src/app/__tests__/metadata.test.ts`](src/app/__tests__/metadata.test.ts) asserting the exported metadata shape (openGraph/twitter fields present).
  - **Add documentation:** add an "SEO and social previews" section to [`README.md`](README.md).
  - Add comments noting where the OG image lives.
  - Validate that `metadataBase` and image paths resolve.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: metadata object well-formed, images array non-empty, base URL set.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(seo): add Open Graph and Twitter card metadata to root layout`

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
title: "Add robots.txt and a dynamic sitemap via the App Router metadata routes"
labels: type:feature, area:seo, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Implement robots and sitemap metadata routes

### Description
The app has no `robots.txt` or sitemap, so crawlers have no guidance on the route map (`/`, `/contracts`, `/milestones`, `/reputation`). This issue adds them using the App Router's first-class `robots.ts` and `sitemap.ts` conventions rather than static files.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add `src/app/robots.ts` exporting a default `MetadataRoute.Robots` allowing indexing and pointing at the sitemap.
- Add `src/app/sitemap.ts` exporting a default `MetadataRoute.Sitemap` enumerating the public static routes with a sensible `lastModified`.
- Drive the base URL from an env var (e.g. `NEXT_PUBLIC_SITE_URL`) with a safe localhost fallback; do not hard-code a production domain.
- Keep the routes pure and unit-testable.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/seo-09-robots-sitemap`
- Implement changes
  - **Write code in:** create [`src/app/robots.ts`](src/app/robots.ts) and [`src/app/sitemap.ts`](src/app/sitemap.ts).
  - **Write comprehensive tests in:** create [`src/app/__tests__/sitemap.test.ts`](src/app/__tests__/sitemap.test.ts) and `src/app/__tests__/robots.test.ts` asserting routes and rules.
  - **Add documentation:** add a "Crawling and sitemap" note to [`README.md`](README.md), including the env var.
  - Add JSDoc to the route functions.
  - Validate that all enumerated routes exist.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: env var set vs unset (fallback), every static route present, robots references the sitemap.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(seo): add robots and dynamic sitemap metadata routes`

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
title: "Add a web app manifest and icons for installable PWA metadata"
labels: type:feature, area:pwa, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Implement a web app manifest and icon set

### Description
There is no favicon, app icon, or web manifest configured, so browsers show a default icon and the app cannot be added to a home screen with proper branding. This issue adds a Next.js `manifest.ts` and icon metadata so TalentTrust presents a consistent installable identity.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add `src/app/manifest.ts` exporting a default `MetadataRoute.Manifest` with name, short_name, theme/background colors aligned to the palette in [`src/app/globals.css`](src/app/globals.css), display mode, and icons.
- Reference icon assets under `public/` (document any placeholder paths that a designer must fill); wire `icons` into the layout metadata if needed.
- Keep names/descriptions consistent with [`docs/COPYWRITING_GUIDE.md`](docs/COPYWRITING_GUIDE.md) and the existing `title`.
- Ensure the manifest does not conflict with the CSP in [`next.config.js`](next.config.js).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/pwa-10-web-manifest`
- Implement changes
  - **Write code in:** create [`src/app/manifest.ts`](src/app/manifest.ts) (and icon references).
  - **Write comprehensive tests in:** create [`src/app/__tests__/manifest.test.ts`](src/app/__tests__/manifest.test.ts) asserting required manifest fields.
  - **Add documentation:** add a "PWA / manifest" note to [`README.md`](README.md).
  - Add comments documenting required icon sizes.
  - Validate that referenced icon paths are documented.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: required fields present, colors match theme, icons array non-empty.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(pwa): add web app manifest and icon metadata`

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
title: "Add an inline theme toggle to the header so users can switch light/dark without opening Settings"
labels: type:feature, area:theming, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Implement a quick theme toggle in the header

### Description
Theme switching today lives only inside the [`SettingsPanel`](src/components/settings/SettingsPanel.tsx) drawer, which means two clicks (open settings, then choose). Theme is a frequent, low-stakes preference. This issue adds a one-click light/dark toggle in the header that drives the same `updatePreference('theme', ...)` from [`src/lib/preferences.tsx`](src/lib/preferences.tsx).

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Create `src/components/ThemeToggle.tsx` (client) that reads `preferences.theme` and calls `updatePreference('theme', ...)`, cycling or toggling between light and dark while leaving "system" reachable via Settings.
- Mount it in the header in [`src/app/layout.tsx`](src/app/layout.tsx) without disturbing the sticky/backdrop styling or wallet button.
- Use an icon button with a clear `aria-label` reflecting the action and `aria-pressed` (or equivalent) for current state; respect existing focus-ring styling.
- Ensure SSR safety and no hydration mismatch (the provider already gates on `isHydrated`).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/theming-11-header-theme-toggle`
- Implement changes
  - **Write code in:** create [`src/components/ThemeToggle.tsx`](src/components/ThemeToggle.tsx); update [`src/app/layout.tsx`](src/app/layout.tsx).
  - **Write comprehensive tests in:** create [`src/components/__tests__/ThemeToggle.test.tsx`](src/components/__tests__/ThemeToggle.test.tsx) — toggles theme, calls updatePreference, ARIA state.
  - **Add documentation:** update [`docs/components/Preferences.md`](docs/components/Preferences.md).
  - Add JSDoc to the component.
  - Validate a11y: labelled toggle, state announced.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: light→dark, dark→light, starting from system, label reflects state.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(theming): add header theme toggle wired to preferences`

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
title: "Add a reusable LoadingSkeleton component and route-level loading.tsx files"
labels: type:enhancement, area:loading, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Implement reusable loading skeletons and App Router loading states

### Description
The app has no `loading.tsx` at any route, so client navigations and async work show no feedback. This issue adds a small, reusable skeleton primitive and wires App Router `loading.tsx` files for the content routes so transitions present an accessible placeholder.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Create `src/components/LoadingSkeleton.tsx` — a configurable, `aria-hidden` shimmer block respecting `prefers-reduced-motion` (no animation when reduced).
- Add `loading.tsx` for `/contracts`, `/contracts/[id]`, `/milestones`, and `/reputation` that compose the skeleton into a layout matching each page, and expose a polite "Loading" status for assistive tech.
- Keep the skeletons visually consistent with the cards in [`MilestonesList`](src/components/MilestonesList.tsx) and [`ContractSummary`](src/components/ContractSummary.tsx).
- Do not introduce real network calls.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b enhancement/loading-12-skeletons`
- Implement changes
  - **Write code in:** create [`src/components/LoadingSkeleton.tsx`](src/components/LoadingSkeleton.tsx) and `loading.tsx` under each content route.
  - **Write comprehensive tests in:** create [`src/components/__tests__/LoadingSkeleton.test.tsx`](src/components/__tests__/LoadingSkeleton.test.tsx) — renders, reduced-motion path, aria-hidden.
  - **Add documentation:** add `docs/components/LoadingSkeleton.md`.
  - Add JSDoc to the component props.
  - Validate a11y: reduced-motion respected, status announced.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: default vs reduced-motion, multiple rows, custom sizing.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(loading): add reusable skeleton and route loading states`

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
title: "Add a global 'Disconnect on idle' safeguard to WalletContext"
labels: type:feature, area:wallet, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Implement an idle auto-disconnect safeguard in WalletContext

### Description
[`src/contexts/WalletContext.tsx`](src/contexts/WalletContext.tsx) keeps a wallet "connected" indefinitely once set; on a shared or public machine an address could stay exposed in the header (`WalletConnectButton`) for hours. This issue adds an optional inactivity timeout that calls `disconnect()` after a configurable idle period, improving safety for a payments app.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add an idle timer (reset on user activity: pointer/keydown/visibilitychange) that disconnects after a configurable duration when an address is present; default off or to a sensible value documented in the README.
- Keep the existing `WalletContextType` shape so [`WalletConnectButton`](src/components/WalletConnectButton.tsx) and [`ActionPanel`](src/components/ActionPanel.tsx) need no changes; surface a friendly toast on auto-disconnect.
- Guard all listeners for SSR and clean them up on unmount; never block the main thread with polling.
- Make the timeout value injectable for deterministic tests (fake timers).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/wallet-13-idle-disconnect`
- Implement changes
  - **Write code in:** [`src/contexts/WalletContext.tsx`](src/contexts/WalletContext.tsx).
  - **Write comprehensive tests in:** [`src/contexts/__tests__/WalletContext.test.tsx`](src/contexts/__tests__/WalletContext.test.tsx) (extend) — idle fires disconnect, activity resets timer, cleanup on unmount.
  - **Add documentation:** add a "Session safety" note to [`README.md`](README.md).
  - Add JSDoc to the idle-timer logic.
  - Validate security: address cleared on idle, no listener leaks.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: activity resets timer, disconnect before timeout, SSR no window, unmount cleanup.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(wallet): auto-disconnect on idle for session safety`

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
title: "Add a Stellar address validation and formatting utility used across forms"
labels: type:feature, area:utils, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Implement a Stellar address validation utility

### Description
Several places handle Stellar public keys — [`truncateAddress`](src/lib/truncateAddress.ts) for display, [`ContractSummary`](src/components/ContractSummary.tsx) parties, and the mocked address in [`WalletContext`](src/contexts/WalletContext.tsx) — but there is no single function that tells whether a string is a plausible Stellar `G...` address. Future create/contract forms will need this. This issue adds a pure, tested validator and a normalizer.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Create `src/lib/stellarAddress.ts` exporting `isValidStellarAddress(value): boolean` (starts with `G`, correct length and base32 charset) and `normalizeStellarAddress(value): string` (trim/uppercase) — without pulling in a heavy SDK dependency.
- Keep functions pure and side-effect free; do not throw on invalid input (return `false`/normalized best-effort).
- Document the exact acceptance rule so it can be tightened later if the Stellar SDK is added.
- Wire it into one real consumer (e.g. validate the display address before truncation) to prove integration.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b feature/utils-14-stellar-address`
- Implement changes
  - **Write code in:** create [`src/lib/stellarAddress.ts`](src/lib/stellarAddress.ts); wire into a consumer such as [`src/components/ContractSummary.tsx`](src/components/ContractSummary.tsx).
  - **Write comprehensive tests in:** create [`src/lib/__tests__/stellarAddress.test.ts`](src/lib/__tests__/stellarAddress.test.ts) — valid G-keys, wrong prefix, bad length, bad charset, normalization.
  - **Add documentation:** add a utils note to [`README.md`](README.md).
  - Add JSDoc describing the acceptance rule.
  - Validate determinism across inputs.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: empty, lowercase, whitespace, wrong prefix, exact-length boundary.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(utils): add Stellar address validation and normalization helpers`

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
title: "Add tests for ReputationProfile score, level, partial, and history rendering"
labels: type:test, area:reputation, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Test the ReputationProfile rendering branches

### Description
[`src/components/ReputationProfile.tsx`](src/components/ReputationProfile.tsx) has several conditional branches — `hasReputation` (score present vs "No reputation yet"), the `showPartial` amber banner (score but no history), and the history list vs empty state — driven by `score`/`history`. The existing [`ReputationProfile.test.tsx`](src/components/ReputationProfile.test.tsx) should be extended to lock down each branch and its accessible labelling.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Assert: no score renders "No reputation yet" / "Pending"; a score with empty history shows the "Partial reputation data" banner and the "Private by default" pill; a score with history renders each `ReputationEvent`.
- Verify the `sr-only` profile heading and the `aria-labelledby` associations on score/level blocks.
- Reuse the exported `ReputationEvent`/`ReputationProfileProps` types; do not duplicate them.
- Add a `jest-axe` assertion via [`src/test-utils/a11y.tsx`](src/test-utils/a11y.tsx) for the full-history state.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/reputation-15-reputationprofile-branches`
- Implement changes
  - **Write code in:** no source change expected unless a real bug is found in [`src/components/ReputationProfile.tsx`](src/components/ReputationProfile.tsx).
  - **Write comprehensive tests in:** [`src/components/ReputationProfile.test.tsx`](src/components/ReputationProfile.test.tsx) (extend).
  - **Add documentation:** note tested guarantees in [`docs/components/Accessibility.md`](docs/components/Accessibility.md).
  - Add JSDoc clarifications if behavior is ambiguous.
  - Validate a11y: axe clean across states.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: undefined score, score 0, partial (no history), full history, single-character name initial.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`test(reputation): cover ReputationProfile score, partial, and history branches`

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
title: "Add isolated unit tests for the FormField accessibility prop cloning"
labels: type:test, area:forms, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Test FormField child cloning and ARIA wiring in isolation

### Description
[`src/components/FormField.tsx`](src/components/FormField.tsx) clones its child to inject `id`, `aria-describedby`, and `aria-invalid` and conditionally renders helper and `role="alert"` error text, but it has no dedicated test file — only the combined [`FormValidation.test.tsx`](src/components/FormValidation.test.tsx) exercises it indirectly via the home form. This issue adds focused, component-level tests so the wiring is guaranteed independent of any page.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Render `FormField` with a plain `<input>` child and assert it receives the generated `id`, that `aria-describedby` lists helper and error ids when present, and `aria-invalid` flips with `error`.
- Verify the required marker is `aria-hidden`, the helper paragraph uses the helper id, and the error paragraph uses `role="alert"`.
- Confirm an existing child `className` is preserved and the error border class only appends on error.
- Add a `jest-axe` check via [`src/test-utils/a11y.tsx`](src/test-utils/a11y.tsx) for labelled and errored states.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/forms-16-formfield-isolated`
- Implement changes
  - **Write code in:** no source change expected unless a real bug is found in [`src/components/FormField.tsx`](src/components/FormField.tsx).
  - **Write comprehensive tests in:** create [`src/components/__tests__/FormField.test.tsx`](src/components/__tests__/FormField.test.tsx).
  - **Add documentation:** update [`docs/components/Accessibility.md`](docs/components/Accessibility.md) with the tested guarantees.
  - Add JSDoc where behavior needs clarifying.
  - Validate a11y: axe clean for both states.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: no error, error only, helper only, both, required marker.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`test(forms): add isolated coverage for FormField ARIA injection`

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
title: "Add tests for the SettingsTrigger open/close and focus-return behavior"
labels: type:test, area:settings, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Test the SettingsTrigger button and focus return

### Description
[`src/components/settings/SettingsTrigger.tsx`](src/components/settings/SettingsTrigger.tsx) is the floating button that opens the [`SettingsPanel`](src/components/settings/SettingsPanel.tsx) and restores focus to itself on close via `requestAnimationFrame`, but it has no test file. Because it owns the open/close state and focus-return contract for the project's reference dialog, this behavior needs coverage.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Test that clicking the trigger opens the panel, that closing it (Escape or close button) returns focus to the trigger, and that the panel is not rendered when closed.
- Wrap renders in `PreferencesProvider` from [`src/lib/preferences.tsx`](src/lib/preferences.tsx) since the panel reads preferences.
- Handle the `requestAnimationFrame` focus-return deterministically (mock or flush) so the test is stable.
- Add a `jest-axe` assertion for the open state.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/settings-17-settingstrigger`
- Implement changes
  - **Write code in:** no source change expected unless a real bug is found in [`src/components/settings/SettingsTrigger.tsx`](src/components/settings/SettingsTrigger.tsx).
  - **Write comprehensive tests in:** create [`src/components/settings/__tests__/SettingsTrigger.test.tsx`](src/components/settings/__tests__/SettingsTrigger.test.tsx).
  - **Add documentation:** update [`docs/components/SettingsPanel.md`](docs/components/SettingsPanel.md) with the trigger contract.
  - Add JSDoc to the focus-return logic.
  - Validate a11y: labelled trigger, focus restored.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: open then close, Escape close, focus returns, closed renders nothing.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`test(settings): cover SettingsTrigger open/close and focus return`

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
title: "Add tests for WalletConnectButton copy, disconnect, and error states"
labels: type:test, area:wallet, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Test the WalletConnectButton state machine

### Description
[`src/components/WalletConnectButton.tsx`](src/components/WalletConnectButton.tsx) renders three distinct branches — error (with Retry), connected (address pill plus copy/disconnect), and disconnected (Connect Wallet with a connecting spinner) — and uses `navigator.clipboard.writeText` plus a 2-second `copied` reset. The existing test should be extended to cover all branches and the clipboard timer.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Mock the `useWallet` hook to drive each branch and assert the rendered controls, `aria-label`s, and the disabled/spinner state while `isConnecting`.
- Mock `navigator.clipboard.writeText`, click Copy, and verify the icon swaps then reverts after 2s using fake timers.
- Verify Retry calls `connect`, Disconnect calls `disconnect`, and the truncated address comes from [`truncateAddress`](src/lib/truncateAddress.ts).
- Add a `jest-axe` check for the connected state via [`src/test-utils/a11y.tsx`](src/test-utils/a11y.tsx).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/wallet-18-walletconnectbutton`
- Implement changes
  - **Write code in:** no source change expected unless a real bug is found in [`src/components/WalletConnectButton.tsx`](src/components/WalletConnectButton.tsx).
  - **Write comprehensive tests in:** [`src/components/__tests__/WalletConnectButton.test.tsx`](src/components/__tests__/WalletConnectButton.test.tsx) (extend).
  - **Add documentation:** update [`docs/components/WalletConnectButton.md`](docs/components/WalletConnectButton.md).
  - Add JSDoc to the copy handler if clarifying.
  - Validate a11y: axe clean for connected state.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: error state, connecting spinner, copy success and timer reset, disconnect.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`test(wallet): cover WalletConnectButton branches and copy timer`

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
title: "Add tests for the home page form submission and ErrorSummary integration"
labels: type:test, area:auth, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Test the home page form submit, validation, and toast feedback

### Description
[`src/app/page.tsx`](src/app/page.tsx) wires the email/password form to [`validateLogin`](src/lib/validateLogin.ts), renders errors through [`ErrorSummary`](src/components/ErrorSummary.tsx) and per-field [`FormField`](src/components/FormField.tsx), and calls `useToast().showSuccess` on a valid submit. This integration — error display, success toast, and field error mapping via `getError` — needs page-level coverage.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Render the page inside the real `PreferencesProvider`/`ToastProvider` (or appropriate wrappers) and assert that submitting empty fields shows `ErrorSummary` and per-field errors, and that a valid submit triggers a success toast.
- Verify `getError` maps `email`/`password` errors to the correct `FormField`s and that the form uses `noValidate` (so JS validation runs).
- Use `@testing-library/user-event` for typing and submitting; avoid brittle text-exact assertions where copy may change.
- Add a `jest-axe` check for the rendered form via [`src/test-utils/a11y.tsx`](src/test-utils/a11y.tsx).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/auth-19-home-form-integration`
- Implement changes
  - **Write code in:** no source change expected unless a real bug is found in [`src/app/page.tsx`](src/app/page.tsx).
  - **Write comprehensive tests in:** [`src/app/page.test.tsx`](src/app/page.test.tsx) (extend).
  - **Add documentation:** note the tested behavior in [`README.md`](README.md) if helpful.
  - Add JSDoc clarifications if needed.
  - Validate a11y: error summary focus, labelled inputs, axe clean.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: empty submit, invalid email, short password, valid submit success toast.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`test(auth): cover home form submit, validation, and toast feedback`

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
title: "Add tests for the global-error boundary fallback and reset behavior"
labels: type:test, area:error-handling, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Test the global-error boundary rendering and reset

### Description
[`src/app/global-error.tsx`](src/app/global-error.tsx) is the root-level fallback that renders its own `<html>`/`<body>`, logs via `console.error` in development, and exposes a `reset()` action — but unlike [`src/app/error.tsx`](src/app/error.tsx) it has no test. Because it is the last line of defense for a crash in the root layout, its behavior must be locked down.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Render `GlobalError` with a synthetic `Error` and assert the fallback UI renders and that the `reset` prop is invoked when the retry control is activated.
- Verify `console.error` is called in development and suppressed appropriately (spy and restore) without leaking spies across tests.
- Mirror the conventions in the existing [`error.test.tsx`](src/app/error.test.tsx).
- Add a `jest-axe` assertion via [`src/test-utils/a11y.tsx`](src/test-utils/a11y.tsx) on the rendered fallback.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/error-handling-20-global-error`
- Implement changes
  - **Write code in:** no source change expected unless a real bug is found in [`src/app/global-error.tsx`](src/app/global-error.tsx).
  - **Write comprehensive tests in:** create [`src/app/global-error.test.tsx`](src/app/global-error.test.tsx).
  - **Add documentation:** add an error-handling note to [`docs/components/Accessibility.md`](docs/components/Accessibility.md) or `docs/error-handling.md`.
  - Add JSDoc clarifications if needed.
  - Validate a11y: axe clean, retry reachable.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: error rendered, reset invoked, dev logging, spy cleanup.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`test(error-handling): cover global-error fallback and reset`

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
title: "Add tests for ContractSummary parties, value formatting, and status badge"
labels: type:test, area:contracts, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Test ContractSummary rendering and currency formatting

### Description
[`src/components/ContractSummary.tsx`](src/components/ContractSummary.tsx) renders the contract name, both parties via [`truncateAddress`](src/lib/truncateAddress.ts), a [`StatusBadge`](src/components/StatusBadge.tsx), and the total value formatted through `formatAmount` from [`src/lib/preferences.tsx`](src/lib/preferences.tsx). The existing [`ContractSummary.test.tsx`](src/components/__tests__/ContractSummary.test.tsx) should be extended to cover the preference-driven formatting and the labelled region semantics.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Render inside `PreferencesProvider` with different `amountFormat` values (USD, NGN, compact) and assert the total renders with the expected formatting.
- Assert both party addresses are truncated, the status badge reflects the passed status, and the section is associated via `aria-labelledby`.
- Keep assertions locale-robust (compare formatted output rather than brittle locale internals).
- Add a `jest-axe` assertion via [`src/test-utils/a11y.tsx`](src/test-utils/a11y.tsx).

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b test/contracts-21-contractsummary`
- Implement changes
  - **Write code in:** no source change expected unless a real bug is found in [`src/components/ContractSummary.tsx`](src/components/ContractSummary.tsx).
  - **Write comprehensive tests in:** [`src/components/__tests__/ContractSummary.test.tsx`](src/components/__tests__/ContractSummary.test.tsx) (extend).
  - **Add documentation:** update or add `docs/components/ContractSummary.md` with the tested behavior.
  - Add JSDoc clarifications if needed.
  - Validate a11y: labelled region, axe clean.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: USD, NGN override, compact notation, zero milestones, long addresses.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`test(contracts): cover ContractSummary parties, formatting, and badge`

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
title: "Harden WalletConnectButton clipboard copy against rejection and missing clipboard API"
labels: type:security, area:wallet, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Harden the wallet address copy against clipboard failures

### Description
In [`src/components/WalletConnectButton.tsx`](src/components/WalletConnectButton.tsx), `handleCopy` calls `await navigator.clipboard.writeText(address)` and unconditionally flips the `copied` state — with no try/catch and no guard for environments where `navigator.clipboard` is undefined (insecure context, older browser, denied permission). A rejected promise produces an unhandled error and a misleading "copied" checkmark. This issue makes the copy robust and honest about failure.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Guard for `navigator.clipboard` availability; wrap `writeText` in try/catch and only set `copied` on success.
- On failure, surface an error via the existing toast system (`useToast().showError(...)`) and do not show the success checkmark.
- Keep the 2-second reset and the existing `aria-label`/`title` behavior intact.
- Never log the full address; treat it as user data.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b security/wallet-22-copy-hardening`
- Implement changes
  - **Write code in:** [`src/components/WalletConnectButton.tsx`](src/components/WalletConnectButton.tsx).
  - **Write comprehensive tests in:** [`src/components/__tests__/WalletConnectButton.test.tsx`](src/components/__tests__/WalletConnectButton.test.tsx) (extend) — clipboard missing, writeText rejects, success path.
  - **Add documentation:** update [`docs/components/WalletConnectButton.md`](docs/components/WalletConnectButton.md).
  - Add JSDoc to the hardened copy handler.
  - Validate security: no unhandled rejection, no false success, no address logging.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: clipboard undefined, write rejected, write succeeds, rapid repeated clicks.
- Include the full `npm test` output and a short **security notes** section in the PR description.

### Example commit message
`fix(security): handle clipboard failures in wallet address copy`

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
title: "Guard all localStorage access behind a safe storage wrapper to survive quota and privacy-mode errors"
labels: type:security, area:persistence, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Harden localStorage access with a safe storage wrapper

### Description
[`src/lib/preferences.tsx`](src/lib/preferences.tsx) calls `localStorage.getItem`/`setItem` directly. In private-browsing modes, when storage is disabled, or when the quota is exceeded, these calls can throw `SecurityError`/`QuotaExceededError` — the read path is partly wrapped but the write path in the save effect is not, so a write failure can crash a render. This issue centralizes storage access behind a defensive wrapper used by all persistence.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Create `src/lib/safeStorage.ts` exposing `getItem`/`setItem`/`removeItem` that detect availability once, swallow exceptions, and degrade to in-memory (or no-op) gracefully — SSR-safe (no `window`).
- Replace the direct `localStorage` calls in [`src/lib/preferences.tsx`](src/lib/preferences.tsx) (and any other consumer) with the wrapper, preserving the existing `isHydrated` flow and `DEFAULT_PREFERENCES` fallback.
- Never throw to the React tree on storage failure; log at most once in development.
- Keep the public preferences API unchanged.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b security/persistence-23-safe-storage`
- Implement changes
  - **Write code in:** create [`src/lib/safeStorage.ts`](src/lib/safeStorage.ts); update [`src/lib/preferences.tsx`](src/lib/preferences.tsx).
  - **Write comprehensive tests in:** create [`src/lib/__tests__/safeStorage.test.ts`](src/lib/__tests__/safeStorage.test.ts) and extend [`src/lib/__tests__/preferences.test.tsx`](src/lib/__tests__/preferences.test.tsx) — getItem throws, setItem throws (quota), unavailable storage, SSR.
  - **Add documentation:** add a "Safe storage" note to [`docs/components/Preferences.md`](docs/components/Preferences.md).
  - Add JSDoc to the wrapper functions.
  - Validate security: no thrown errors reach React, SSR safe.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: storage disabled, quota exceeded on write, corrupt read, SSR no window.
- Include the full `npm test` output and a short **security notes** section in the PR description.

### Example commit message
`fix(security): add safe storage wrapper to survive quota and privacy errors`

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
title: "Add a Dependabot configuration for npm and GitHub Actions updates"
labels: type:security, area:ci, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add automated dependency updates via Dependabot

### Description
The CI workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs an `npm audit` gate, but nothing keeps dependencies current; advisories accumulate until someone manually bumps `next`, `react`, or test tooling in [`package.json`](package.json). This issue adds a `dependabot.yml` so npm and GitHub Actions versions get automated update PRs.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add `.github/dependabot.yml` with two `package-ecosystem` entries: `npm` (root) and `github-actions`, on a weekly schedule with sensible PR limits and grouping for minor/patch updates.
- Label the generated PRs (e.g. `dependencies`) and keep them small/reviewable; avoid auto-merge.
- Document how the existing `npm audit` CI gate complements Dependabot.
- Do not alter the existing CI steps or Node version.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b security/ci-24-dependabot`
- Implement changes
  - **Write code in:** create [`.github/dependabot.yml`](.github/dependabot.yml).
  - **Write comprehensive tests in:** not unit-testable; validate the YAML parses and matches the Dependabot schema, and document the verification in the PR.
  - **Add documentation:** add a "Dependency updates" subsection to the CI part of [`README.md`](README.md).
  - Add inline comments in the config.
  - Validate security: weekly cadence, both ecosystems covered.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build` to confirm nothing else broke.
- Cover edge cases: YAML valid, both ecosystems present, schedule and limits set.
- Include the config and a short **security notes** section in the PR description.

### Example commit message
`ci(security): add Dependabot for npm and GitHub Actions updates`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules (config verified instead where no code changes).
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Tighten the Content Security Policy by removing unsafe-eval/unsafe-inline in production"
labels: type:security, area:headers, stack:nextjs, stack:react, stack:typescript, priority:high, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Tighten the production CSP per the documented roadmap

### Description
[`next.config.js`](next.config.js) ships a CSP that allows `'unsafe-eval'` (for dev Fast Refresh) and `'unsafe-inline'` (for Tailwind), and [`docs/security-headers.md`](docs/security-headers.md) already lays out a tightening roadmap (nonce/strict-dynamic for styles, dropping `unsafe-eval` in production). This issue executes that roadmap so production no longer serves the loosened directives.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Branch the CSP on environment: production must not include `'unsafe-eval'` in `script-src`; pursue the documented nonce/`strict-dynamic` path for `style-src` (or narrow it as far as Tailwind allows) while keeping dev Fast Refresh working.
- Keep the other hardening headers (HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`) unchanged.
- Update [`docs/security-headers.md`](docs/security-headers.md) to reflect what was tightened and what (if anything) remains and why.
- Verify locally that assets still load in both dev and a production build.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b security/headers-25-tighten-csp`
- Implement changes
  - **Write code in:** [`next.config.js`](next.config.js).
  - **Write comprehensive tests in:** extend or create the security-headers test asserting the production CSP omits `'unsafe-eval'` and the dev CSP still allows it (extract a helper if needed).
  - **Add documentation:** update [`docs/security-headers.md`](docs/security-headers.md).
  - Add comments documenting each directive's environment branch.
  - Validate security: production CSP stricter, no broken assets.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`; then `npm start` and confirm headers.
- Cover edge cases: dev vs prod CSP strings, assets load, Fast Refresh works in dev.
- Include the full `npm test` output and a short **security notes** section in the PR description.

### Example commit message
`feat(security): tighten production CSP by removing unsafe-eval`

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
title: "Add an issue template and PR template to standardize contributions"
labels: type:docs, area:repo, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add GitHub issue and pull-request templates

### Description
The repo has CI in [`.github/workflows/ci.yml`](.github/workflows/ci.yml) but no `.github` issue or PR templates, so contributions arrive in inconsistent shapes — missing reproduction steps, test output, or the security/a11y notes the existing issues ask for. This issue adds standard templates that nudge contributors toward the project's expectations (95% coverage, lint/test/build, a11y).

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add `.github/ISSUE_TEMPLATE/bug_report.md` and `feature_request.md` (or the YAML form equivalents) capturing route/component, reproduction, and expected behavior.
- Add `.github/pull_request_template.md` with a checklist for `npm run lint`/`npm test`/`npm run build`, coverage, and accessibility/security notes consistent with this repo's conventions.
- Reference the Discord (https://discord.gg/WqnGpcPx) and the testing utilities in [`src/test-utils/a11y.tsx`](src/test-utils/a11y.tsx).
- Keep templates concise; do not duplicate the README verbatim.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b docs/repo-26-issue-pr-templates`
- Implement changes
  - **Write code in:** documentation only — create the `.github` templates.
  - **Write comprehensive tests in:** not applicable; verify the files render in GitHub preview and links resolve.
  - **Add documentation:** the templates are the deliverable; cross-link from [`README.md`](README.md) contributing section.
  - Add a checklist mirroring the "Test and commit" steps used here.
  - Validate that referenced paths and the Discord link are correct.
- Test and commit

### Test and commit
- Run `npm run lint` and `npm run build` to confirm nothing else broke.
- Cover edge cases: bug vs feature template, PR checklist complete, links resolve.
- Include a short summary in the PR description.

### Example commit message
`docs: add issue and pull-request templates`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules (template accuracy verified instead).
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Document the WalletContext API and mocked-connection behavior"
labels: type:docs, area:wallet, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Document the WalletContext provider and useWallet hook

### Description
[`src/contexts/WalletContext.tsx`](src/contexts/WalletContext.tsx) exposes a `useWallet` hook with `address`, `isConnecting`, `error`, `connect`, and `disconnect`, currently backed by a mocked 1-second connection that returns a hard-coded address. There is no doc explaining the contract, the mock, or the throw-outside-provider behavior, so contributors don't know what's real. This issue documents the API and its current limitations.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Create `docs/components/WalletContext.md` describing each field of `WalletContextType`, the provider placement in [`src/app/layout.tsx`](src/app/layout.tsx), and the `useWallet` outside-provider guard.
- Clearly flag that `connect()` is currently mocked and returns a placeholder address, linking to the related wallet-integration work.
- Add JSDoc to the exported `WalletProvider` and `useWallet` in the source.
- Keep the doc accurate to the current code; do not document not-yet-built behavior as if it exists.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b docs/wallet-27-walletcontext-docs`
- Implement changes
  - **Write code in:** add JSDoc in [`src/contexts/WalletContext.tsx`](src/contexts/WalletContext.tsx).
  - **Write comprehensive tests in:** ensure [`src/contexts/__tests__/WalletContext.test.tsx`](src/contexts/__tests__/WalletContext.test.tsx) still passes; add a case if behavior is undocumented/untested.
  - **Add documentation:** create [`docs/components/WalletContext.md`](docs/components/WalletContext.md).
  - Add a usage example with the provider.
  - Validate that documented fields match the source.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: documented fields exist, example compiles, mock clearly flagged.
- Include a short summary in the PR description.

### Example commit message
`docs(wallet): document WalletContext API and mocked connection`

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
title: "Document the toast provider API, quiet mode, and density behavior"
labels: type:docs, area:toast, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Document the toast provider, useToast hook, and announcer behavior

### Description
[`src/components/toast/toast-provider.tsx`](src/components/toast/toast-provider.tsx) is a central piece — `showSuccess`/`showError`/`dismissToast`, the `quietMode` success suppression, density-aware spacing, the polite/assertive `aria-live` announcers, and auto-dismiss — but there is no dedicated component doc, only scattered README notes. This issue produces a complete reference doc for it.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Create `docs/components/Toast.md` documenting the `useToast` API, the toast input shape, the `'suppressed'` return under `quietMode`, the density mapping from [`src/lib/preferences.tsx`](src/lib/preferences.tsx), and the announcer roles.
- Include a usage example matching real callers (e.g. [`src/app/page.tsx`](src/app/page.tsx) and [`WalletConnectButton`](src/components/WalletConnectButton.tsx)).
- Add JSDoc to the exported provider and hook in the source.
- Keep the doc in sync with the actual default duration and announcer behavior.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b docs/toast-28-toast-docs`
- Implement changes
  - **Write code in:** add JSDoc in [`src/components/toast/toast-provider.tsx`](src/components/toast/toast-provider.tsx).
  - **Write comprehensive tests in:** ensure [`src/components/toast/toast-provider.test.tsx`](src/components/toast/toast-provider.test.tsx) still passes; add a case if a documented behavior is untested.
  - **Add documentation:** create [`docs/components/Toast.md`](docs/components/Toast.md).
  - Add copy-pasteable examples.
  - Validate that documented behavior matches the source.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: quietMode return value, density spacing, polite vs assertive roles.
- Include a short summary in the PR description.

### Example commit message
`docs(toast): document useToast API, quiet mode, and announcers`

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
title: "Document environment variables and a .env.example for site URL and config"
labels: type:docs, area:docs, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Add a .env.example and document environment configuration

### Description
The repo has no `.env*` files and the README does not enumerate any environment variables, yet the app will need at least a public site URL (for SEO/sitemap/OG) and likely a wallet/RPC endpoint as integration lands. New contributors have no single place to learn what config exists. This issue adds a documented `.env.example` and a README section.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add `.env.example` listing the variables the app reads or will read (e.g. `NEXT_PUBLIC_SITE_URL`), each with a comment and a safe default/example value — never real secrets.
- Add an "Environment variables" section to [`README.md`](README.md) explaining each variable, when it's required, and the `NEXT_PUBLIC_` exposure rule.
- Keep it accurate to current code; flag variables that are reserved for upcoming features (e.g. wallet RPC referenced in [`docs/security-headers.md`](docs/security-headers.md)).
- Do not commit a real `.env` or any secret.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b docs/docs-29-env-example`
- Implement changes
  - **Write code in:** create [`.env.example`](.env.example).
  - **Write comprehensive tests in:** not applicable; verify every variable named is actually referenced or clearly marked as upcoming.
  - **Add documentation:** add the "Environment variables" section to [`README.md`](README.md).
  - Add comments for each variable.
  - Validate that no secrets are present and `NEXT_PUBLIC_` usage is correct.
- Test and commit

### Test and commit
- Run `npm run lint` and `npm run build` to confirm nothing else broke.
- Cover edge cases: each var documented, no secrets, public vs server vars distinguished.
- Include a short summary in the PR description.

### Example commit message
`docs: add .env.example and environment variable documentation`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules (documentation accuracy verified instead).
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
++++++
---
type: Feature
title: "Respect prefers-reduced-motion for the wallet connect spinner and toast transitions"
labels: type:a11y, area:motion, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Respect prefers-reduced-motion across animated UI

### Description
The connecting spinner in [`src/components/WalletConnectButton.tsx`](src/components/WalletConnectButton.tsx) uses `animate-spin` unconditionally, and any transitions in [`src/components/toast/toast-provider.tsx`](src/components/toast/toast-provider.tsx) run regardless of user preference. WCAG 2.3.3 (Animation from Interactions) asks that non-essential motion be reducible. This issue makes animated UI honor `prefers-reduced-motion`.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Add a `prefers-reduced-motion: reduce` rule in [`src/app/globals.css`](src/app/globals.css) (or scoped utilities) that disables/limits the spin and toast transitions, keeping a static loading indicator for the spinner.
- Ensure the loading state is still perceivable without motion (e.g. text "Connecting..." remains, which it already does).
- Do not regress the default animated experience for users without the preference.
- Verify behavior in both themes.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b a11y/motion-30-reduced-motion`
- Implement changes
  - **Write code in:** [`src/app/globals.css`](src/app/globals.css) and, if needed, [`src/components/WalletConnectButton.tsx`](src/components/WalletConnectButton.tsx) / [`src/components/toast/toast-provider.tsx`](src/components/toast/toast-provider.tsx).
  - **Write comprehensive tests in:** extend the relevant component tests to assert reduced-motion behavior (mock `matchMedia`), and/or [`src/components/__tests__/a11y.test.tsx`](src/components/__tests__/a11y.test.tsx).
  - **Add documentation:** record the motion policy in [`docs/components/Accessibility.md`](docs/components/Accessibility.md).
  - Add comments where motion is gated.
  - Validate a11y: WCAG 2.3.3, motion reduced when requested.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: reduced-motion on/off, spinner still indicates loading, toasts still appear.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`feat(a11y): respect prefers-reduced-motion for spinner and toasts`

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
title: "Make the home page form errors and submit feedback fully screen-reader accessible end to end"
labels: type:a11y, area:auth, stack:nextjs, stack:react, stack:typescript, priority:medium, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Audit and fix end-to-end accessibility of the home sign-in form

### Description
[`src/app/page.tsx`](src/app/page.tsx) renders an `<h1>` "TalentTrust" inside the page even though the shared layout already provides a header, and there are two `<main>` elements at once (one in [`src/app/layout.tsx`](src/app/layout.tsx) and one here), which is an invalid landmark structure for screen readers. The form is otherwise wired to [`ErrorSummary`](src/components/ErrorSummary.tsx)/[`FormField`](src/components/FormField.tsx), but the duplicated landmark and heading order undermine it. This issue fixes the landmark/heading structure and verifies the full a11y flow.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Remove the nested `<main>` in the page (the layout already provides the single `<main id="main-content">`) and ensure exactly one top-level landmark and a sane heading hierarchy.
- Confirm the `ErrorSummary` receives focus on validation failure and that each error anchor targets the matching `FormField` id; fix any mismatch.
- Keep the existing hero copy and gradient styling; adjust only structure/semantics.
- Add `jest-axe` coverage via [`src/test-utils/a11y.tsx`](src/test-utils/a11y.tsx) for the empty, errored, and valid states.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b a11y/auth-31-home-landmarks`
- Implement changes
  - **Write code in:** [`src/app/page.tsx`](src/app/page.tsx).
  - **Write comprehensive tests in:** [`src/app/page.test.tsx`](src/app/page.test.tsx) (extend) and/or [`src/app/__tests__/layout.test.tsx`](src/app/__tests__/layout.test.tsx) — single main landmark, error summary focus, axe clean.
  - **Add documentation:** note the landmark fix in [`docs/components/Accessibility.md`](docs/components/Accessibility.md).
  - Add comments explaining the single-landmark rule.
  - Validate a11y: one `main`, ordered headings, axe clean.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: empty submit focuses summary, valid submit, no duplicate landmarks.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`fix(a11y): correct landmarks and heading order on the home sign-in form`

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
title: "Add an accessible scroll affordance and keyboard reachability to the MilestonesList scroll container"
labels: type:a11y, area:milestones, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Make the MilestonesList scroll region keyboard accessible

### Description
[`src/components/MilestonesList.tsx`](src/components/MilestonesList.tsx) wraps milestones in a fixed-height `overflow-y-auto` container, but a scrollable region with no focusable contents and no `tabindex`/role is unreachable by keyboard-only users — they cannot scroll it (WCAG 2.1.1). This issue makes the scroll region keyboard-operable and labelled.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Give the scroll container a `role="region"`, an accessible name, and `tabIndex={0}` so it is focusable and scrollable via arrow keys; ensure a visible focus indicator.
- Keep the existing heading association (`aria-labelledby="milestones-title"`) and the `StatusBadge`/`formatAmount` rendering intact.
- Only apply the focusable region when content actually overflows-or document why it's always applied; do not introduce a focus trap.
- Verify it does not interfere with the search/sort toolbar if present.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b a11y/milestones-32-scroll-region`
- Implement changes
  - **Write code in:** [`src/components/MilestonesList.tsx`](src/components/MilestonesList.tsx).
  - **Write comprehensive tests in:** [`src/components/__tests__/MilestonesList.test.tsx`](src/components/__tests__/MilestonesList.test.tsx) (extend) — region role/name, tabindex, focusable.
  - **Add documentation:** note the scroll-region pattern in [`docs/components/Accessibility.md`](docs/components/Accessibility.md).
  - Add a comment explaining the keyboard-scroll rationale.
  - Validate a11y: WCAG 2.1.1, axe clean.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: overflowing list, short list, focus indicator visible.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`fix(a11y): make MilestonesList scroll region keyboard accessible`

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
title: "Extract a reusable useCopyToClipboard hook shared by wallet and address copy UIs"
labels: type:refactor, area:hooks, stack:nextjs, stack:react, stack:typescript, priority:low, MAYBE REWARDED, GRANTFOX OSS, OFFICIAL CAMPAIGN
assignees: ''
---

## Refactor clipboard-copy logic into a reusable useCopyToClipboard hook

### Description
The copy-with-2-second-confirmation pattern lives inline in [`src/components/WalletConnectButton.tsx`](src/components/WalletConnectButton.tsx) (`handleCopy`, `copied` state, `setTimeout` reset), and any future "copy address" affordance (e.g. on [`ContractSummary`](src/components/ContractSummary.tsx)) would duplicate it. This issue extracts the behavior into a single tested hook so copy interactions stay consistent and DRY.

### Requirements and context
- **Repository scope:** Talenttrust/Talenttrust-Frontend only.
- Create `src/hooks/useCopyToClipboard.ts` returning `{ copied, copy }` where `copy(text)` writes to the clipboard, sets `copied` true, and resets after a configurable delay; guard for missing `navigator.clipboard` and clear the timer on unmount.
- Refactor [`WalletConnectButton`](src/components/WalletConnectButton.tsx) to use the hook with no change to its rendered output or `aria-label`s.
- Keep the hook framework-pure (no component coupling) and SSR-safe.
- Surface a success/failure signal the caller can use for toasts without forcing a dependency.

### Suggested execution
- Fork the repo and create a branch
- `git checkout -b refactor/hooks-33-use-copy-to-clipboard`
- Implement changes
  - **Write code in:** create [`src/hooks/useCopyToClipboard.ts`](src/hooks/useCopyToClipboard.ts); update [`src/components/WalletConnectButton.tsx`](src/components/WalletConnectButton.tsx).
  - **Write comprehensive tests in:** create [`src/hooks/__tests__/useCopyToClipboard.test.ts`](src/hooks/__tests__/useCopyToClipboard.test.ts) — success, failure, timer reset, unmount cleanup; keep [`WalletConnectButton.test.tsx`](src/components/__tests__/WalletConnectButton.test.tsx) green.
  - **Add documentation:** add `docs/hooks/useCopyToClipboard.md`.
  - Add JSDoc to the hook.
  - Validate that the wallet button output is unchanged.
- Test and commit

### Test and commit
- Run `npm run lint`, `npm test`, and `npm run build`.
- Cover edge cases: clipboard missing, copy rejected, rapid copies, unmount during timer.
- Include the full `npm test` output and notes in the PR description.

### Example commit message
`refactor(hooks): extract reusable useCopyToClipboard hook`

### Guidelines
- **Minimum 95 percent test coverage** for impacted modules.
- Clear, reviewer-focused documentation.
- **Timeframe: 96 hours.**

### Community & contribution rewards
- 💬 **Join the TalentTrust community on Discord for questions, reviews, and faster merges:** https://discord.gg/WqnGpcPx
- ⭐ This is a **GrantFox OSS / Official Campaign** task and **may be rewarded**. When your PR is merged you'll be prompted to rate the project — if this issue and the maintainers helped you ship, we'd be grateful for a **5-star rating**. Clear questions in Discord and tidy, well-tested PRs are the fastest path to a merge and a reward.
