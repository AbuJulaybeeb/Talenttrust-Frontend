# Contracts Components

This document is the canonical reference for every component and page involved in the contracts feature. It covers props, states, usage examples, and accessibility notes for each piece.

---

## Table of Contents

1. [CreateContractForm](#createcontractform)
2. [ContractCreationForm](#contractcreationform)
3. [ContractSummary](#contractsummary)
4. [ContractProgress](#contractprogress)
5. [ActionPanel](#actionpanel)
6. [Loading Skeletons](#loading-skeletons)
   - [ContractSummarySkeleton](#contractsummaryskeleton)
   - [ContractProgressSkeleton](#contractprogressskeleton)
   - [MilestonesListSkeleton](#milestoneslistskeleton)
7. [Contracts Pages](#contracts-pages)
   - [/contracts — ContractsPage](#contracts--contractspage)
   - [/contracts/[id] — ContractDetailPage](#contractsid--contractdetailpage)

---

## CreateContractForm

**File:** `src/components/contracts/CreateContractForm.tsx`

A lightweight inline form for creating a new escrow contract. It is rendered inline in the page (not as a modal) and exposes only two required props.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onSuccess` | `(contract: Contract) => void` | Yes | Called with the newly persisted `Contract` immediately after a successful submission. The parent is responsible for updating its own list state and dismissing the form. |
| `onCancel` | `() => void` | Yes | Called when the user clicks Cancel. The parent is responsible for hiding the form. |

### Fields

| Field | Type | Validation |
|-------|------|-----------|
| Contract name | `text` | Required, non-empty after trim |
| Freelancer Stellar address | `text` | Required; validated by `isValidStellarAddress` — must start with `G`, be exactly 56 characters, and use the base32 alphabet |
| Total value | `number` | Required, must be > 0 |
| Currency | `select` | Required; one of `USD`, `XLM`, `EUR`, `GBP` (defaults to `USD`) |

### Behaviour

1. On submit, `validateContract` is called with the raw field values.
2. If validation fails, `setErrors` is updated and `ErrorSummary` renders above the form with links to each failing field.
3. On success, a `Contract` object is constructed, persisted via `saveContract`, and a polite success toast is shown via `useToast`. `onSuccess` is then called with the new contract.
4. The freelancer address is normalised (trimmed, uppercased) via `normalizeStellarAddress` before being stored in the `parties` array.

### Accessibility

- The `<section>` wrapping the form has `aria-labelledby` pointing to the visible `<h2>` heading.
- Every field is wrapped in `<FormField>`, which wires `<label>`, `aria-invalid`, and `aria-describedby` automatically.
- `ErrorSummary` auto-focuses on mount when validation fails, moving screen reader focus to the error list without a manual `ref` on the form level.
- No `alert()` or native dialogs are used; all feedback goes through toast notifications.

### Usage Example

```tsx
import CreateContractForm from '@/components/contracts/CreateContractForm';

function ContractsSidebar() {
  const [showForm, setShowForm] = useState(false);

  return showForm ? (
    <CreateContractForm
      onSuccess={(contract) => {
        // update parent list state, then hide form
        setShowForm(false);
      }}
      onCancel={() => setShowForm(false)}
    />
  ) : (
    <button onClick={() => setShowForm(true)}>New Contract</button>
  );
}
```

---

## ContractCreationForm

**File:** `src/components/ContractCreationForm.tsx`

A full-featured modal form for creating contracts with multiple parties. Rendered as a fixed overlay with `role="dialog"`.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onSubmit` | `(contract: Contract) => void` | Yes | Called with the validated `Contract` object on successful submission. The parent controls visibility — the form does **not** close itself. |
| `onCancel` | `() => void` | Yes | Called when the user clicks Cancel. |

### Exported Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `MAX_CONTRACT_NAME_LENGTH` | `200` | Hard character limit for the contract name. |
| `MAX_PARTY_LABEL_LENGTH` | `100` | Hard character limit for each party label. |

### Exported Types

```ts
export interface ContractFormData {
  contractName: string;
  parties: Array<{ label: string; address: string }>;
  totalValue: string;   // string while editing; converted to number on submit
  currency: string;
}
```

### Fields

| Field | Validation |
|-------|-----------|
| Contract name | Required; max `MAX_CONTRACT_NAME_LENGTH` chars after sanitization |
| Total value | Required; must parse as a positive number |
| Currency | Required; one of `USD`, `EUR`, `GBP`, `XLM` |
| Parties | At least **two** parties required. Each must have both a label (max `MAX_PARTY_LABEL_LENGTH` chars) and a valid Stellar address. Partial entries trigger per-field errors. |

### Party Management

- Starts with two blank party rows.
- **Add a party**: click "+ Add Another Party" to append a new blank row.
- **Remove a party**: each row shows a "Remove" button when `parties.length > 2`. The button carries `aria-label="Remove party N"`.
- Empty party rows are filtered out before submission; only rows where both `label` and `address` are non-empty are included in the submitted `Contract`.

### Submitted Contract Shape

```ts
{
  contractName: string;        // sanitized, trimmed
  parties: Array<{ label: string; address: string }>; // validated parties only
  totalValue: number;          // parsed from string
  currency: string;
  status: 'Pending';
  createdAt: string;           // formatted 'MMM DD, YYYY'
  milestoneCount: 0;
}
```

### Accessibility

- Rendered as `role="dialog"` with `aria-modal="true"` and `aria-labelledby="create-contract-title"`.
- Uses `<ErrorSummary>` for aggregated error display; errors link directly to the failing field.
- Individual fields use `<FormField>` for `aria-invalid` / `aria-describedby` wiring.
- All remove and submit buttons have descriptive accessible names.
- Keyboard navigation covers all interactive elements; no custom key handling required.

### Usage Example

```tsx
import { ContractCreationForm } from '@/components/ContractCreationForm';

function ContractsPage() {
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (contract: Contract) => {
    saveContract(contract);
    setShowForm(false);
  };

  return (
    <>
      <button onClick={() => setShowForm(true)}>Create Contract</button>
      {showForm && (
        <ContractCreationForm
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </>
  );
}
```

---

## ContractSummary

**File:** `src/components/ContractSummary.tsx`

Displays the contract header card: name, status badge, total value, creation date, milestone count, and the list of parties with truncated addresses and copy-to-clipboard buttons.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `contractName` | `string` | Yes | Display name of the contract. |
| `parties` | `ContractParty[]` | Yes | List of parties. Renders "No parties listed" fallback when empty. Composite `label-address` keys handle duplicate labels safely. |
| `totalValue` | `number` | Yes | Raw numeric value; formatted via `formatAmount` from `usePreferences`. |
| `currency` | `string` | Yes | Currency code passed to `formatAmount` (e.g. `"USD"`, `"XLM"`). |
| `status` | `StatusType` | Yes | Controls which `StatusBadge` variant is rendered. One of `'Active'`, `'Completed'`, `'Disputed'`, `'Pending'`. |
| `createdAt` | `string` | Yes | Pre-formatted date string (e.g. `"Jul 24, 2026"`). |
| `milestoneCount` | `number` | Yes | Total milestone count; used for the "N milestones" label below the value. |

### `ContractParty` type

```ts
export type ContractParty = {
  label: string;   // e.g. 'Client', 'Freelancer'
  address: string; // full Stellar public key
};
```

### Copy-to-Clipboard Behaviour

Each party row includes a copy button that:

1. Sanitizes the address (strips ASCII control characters and Unicode BiDi overrides via the exported `sanitizeAddress` helper) to prevent clipboard injection.
2. Normalizes the address via `normalizeStellarAddress` (trim + uppercase).
3. Warns to the console if the normalized address fails `isValidStellarAddress` — it still copies the sanitized value.
4. Shows a success toast and swaps the copy icon for a green checkmark for 2 seconds, then reverts.
5. Shows an error toast if the Clipboard API is unavailable or the write fails.
6. Cleans up the 2-second reset timeout in an effect cleanup so no state updates happen after unmount.

### Exported Helper

```ts
export function sanitizeAddress(address: string): string;
```

Strips `\u0000–\u001F`, `\u007F–\u009F`, and BiDi control characters from an address string. Returns `''` for non-string input.

### Accessibility

- `<section aria-labelledby="contract-summary-title">` wraps the card.
- `<h1 id="contract-summary-title">` carries the contract name.
- Party count is in an `aria-live="polite"` span so additions are announced.
- Copy buttons update their `aria-label` between `"Copy {role} address to clipboard"` and `"{role} address copied"` to confirm the action to screen reader users without a separate alert.

### Usage Example

```tsx
import ContractSummary from '@/components/ContractSummary';

<ContractSummary
  contractName="Website Redesign"
  parties={[
    { label: 'Client', address: 'GABC…' },
    { label: 'Freelancer', address: 'GDEF…' },
  ]}
  totalValue={5000}
  currency="USD"
  status="Active"
  createdAt="Jul 24, 2026"
  milestoneCount={3}
/>
```

---

## ContractProgress

**File:** `src/components/ContractProgress.tsx`

Renders the "Escrow Progress" card: a milestone completion progress bar and paid / outstanding fund cards. All calculations are derived from the `milestones` prop via the `useContractProgress` hook.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `milestones` | `Milestone[]` | Yes | Array of milestone objects. An empty array triggers the zero-state without errors. |

### Milestone type (from `MilestonesList.tsx`)

```ts
type Milestone = {
  id: string;
  title: string;
  status: 'Active' | 'Completed' | 'Disputed' | 'Pending' | 'Paid';
  payout: number;
  currency: string;
  dueDate?: string;
  contractId?: string;
};
```

### Derived Values

All values come from `useContractProgress(milestones)`:

| Value | Description |
|-------|-------------|
| `completedCount` | Milestones with status `'Completed'` or `'Paid'` |
| `totalCount` | Total number of milestones |
| `paidAmount` | Sum of `payout` for completed/paid milestones |
| `outstandingAmount` | Sum of `payout` for all other milestones |
| `progressPercent` | `Math.round(completedCount / totalCount * 100)`, clamped to 0 when `totalCount === 0` |
| `currency` | `milestones[0].currency` or `'USD'` when the array is empty |

### Empty State

When `milestones.length === 0`:
- A `"No milestones yet"` paragraph replaces the progress bar and completion row.
- The `role="progressbar"` element is **omitted** (an indeterminate 0/0 bar conveys nothing useful to screen reader users).
- The Paid / Outstanding fund cards remain visible at zero so the card layout stays consistent.

### Accessibility

| Feature | Implementation |
|---------|---------------|
| Landmark | `<section aria-labelledby="contract-progress-title">` |
| Heading | `<h2 id="contract-progress-title">Escrow Progress</h2>` |
| Progress bar | `role="progressbar"` on the track element |
| Numeric range | `aria-valuemin="0"` / `aria-valuemax="100"` |
| Current value | `aria-valuenow={progressPercent}` |
| Label | `aria-label="{n} of {total} milestones completed, {pct}%"` |
| Screen reader text | `<span class="sr-only">{pct}% complete</span>` inside the fill bar |

### Usage Example

```tsx
import ContractProgress from '@/components/ContractProgress';

<ContractProgress milestones={contract.milestones} />
```

See [`docs/components/ContractProgress.md`](./ContractProgress.md) for the full data-calculation spec and ARIA attribute table.

---

## ActionPanel

**File:** `src/components/ActionPanel.tsx`

The sticky right-column card on the contract detail page. Renders context-aware action buttons based on the contract `status`, with confirmation dialogs, an inline dispute-reason form, loading states, and per-action accessible disabled reasons.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `status` | `'Active' \| 'Completed' \| 'Disputed' \| 'Pending'` | Yes | — | Drives which buttons are visible and their tab order. |
| `onSubmitMilestone` | `() => void` | No | — | Callback after the user confirms milestone submission. |
| `onDispute` | `(reason: string) => void` | No | — | Callback with the trimmed, non-empty dispute reason (max 500 chars). Called only after inline form validation passes and the wallet is still connected. |
| `onReleaseFunds` | `() => void` | No | — | Callback after the user confirms fund release. |
| `onViewSummary` | `() => void` | No | — | Callback for viewing a completed contract summary. |
| `isLoading` | `boolean` | No | `false` | Disables every visible button and links them all to a shared loading reason via `aria-describedby`. |
| `errorMessage` | `string` | No | — | Renders a `role="alert"` region above the buttons to announce transient errors (network failures, persistence errors). |
| `disabledReasons` | `ActionPanelDisabledReasons` | No | — | Per-action accessible reason for why a button is disabled (e.g. unmet conditions, missing wallet permissions). |
| `disputeFlow` | `'inline' \| 'confirm'` | No | `'inline'` | `'inline'` opens a reason textarea in the panel; `'confirm'` uses the legacy `ConfirmDialog`. |

### `ActionPanelDisabledReasons` type

```ts
export type ActionPanelDisabledReasons = {
  submitMilestone?: string;
  releaseFunds?: string;
  dispute?: string;
  viewSummary?: string;
};
```

Each provided string is rendered in a visually-hidden `<span>` linked to the corresponding button via `aria-describedby` so screen reader users hear *why* the button is disabled.

### Status → Visible Actions Mapping

| Status | Visible actions |
|--------|----------------|
| `'Active'` | Submit Milestone, Release Funds, Dispute |
| `'Pending'` | Release Funds, Dispute |
| `'Disputed'` | Dispute |
| `'Completed'` | View Summary |

### Confirmation Flows

**Submit Milestone** and **Release Funds** open a `ConfirmDialog` before invoking the callback. Cancelling or confirming returns focus to the button that opened the dialog (WCAG 2.1 SC 3.2.2).

**Dispute (inline — default `disputeFlow="inline"`):**

1. Opens an inline `role="group"` form below the Dispute button; focus moves to the textarea automatically.
2. The user types a reason (1–500 characters). A character counter live region announces progress at meaningful boundaries (every 50 chars, every 10 when ≤ 50 remaining, every char when ≤ 10 remaining), debounced to 1 second for mid-word typing, and escalates to `aria-live="assertive"` when ≤ 50 characters remain.
3. On submit, `validateDisputeReason` is called. If valid and the wallet is still connected, `onDispute(trimmedReason)` is invoked and the form closes.
4. Cancelling or submitting the form restores focus to the Dispute button.

### Wallet Gating

All action buttons check `useWallet().address` at render time. When `isWalletConnected` is `false`:
- Buttons are `disabled` with a `title` tooltip ("Connect wallet to perform this action").
- A warning banner is rendered above the buttons.
- The inline dispute form re-validates wallet connection at submit time to guard mid-flow disconnects.

### Usage Example

```tsx
import ActionPanel from '@/components/ActionPanel';

<ActionPanel
  status={contractData?.status ?? 'Active'}
  onSubmitMilestone={() => { /* open milestone submission flow */ }}
  onReleaseFunds={() => persistContractStatus('Completed', ...)}
  onDispute={(reason) => persistContractStatus('Disputed', ...)}
  onViewSummary={() => router.push('/contracts')}
  isLoading={isLoading || isPersistingStatus}
  errorMessage={errorMessage ?? undefined}
  disputeFlow="inline"
  disabledReasons={{
    submitMilestone: !canSubmit ? 'No milestones are ready to submit.' : undefined,
  }}
/>
```

See [`docs/components/ActionPanel.md`](./ActionPanel.md) for the full keyboard support, focus-restoration diagram, and testing notes.

---

## Loading Skeletons

All skeletons follow the same accessibility pattern:
- The outer element carries `aria-hidden="true"` (they are purely decorative).
- Shimmer animation is suppressed via `motion-reduce:animate-none` (and the project-wide `prefers-reduced-motion` rule in `globals.css`).
- The enclosing page/section carries `aria-busy="true"` and a visually-hidden `role="status"` span that announces the loading state to screen readers.

---

### ContractSummarySkeleton

**File:** `src/components/ContractSummarySkeleton.tsx`

Placeholder skeleton for `ContractSummary`. Rendered while contract data is loading on the `/contracts/[id]` page.

**No props.** Matches the visual shape of `ContractSummary` (header row, value card, parties card).

```tsx
import { ContractSummarySkeleton } from '@/components/ContractSummarySkeleton';

{isLoading ? <ContractSummarySkeleton /> : <ContractSummary {...data} />}
```

---

### ContractProgressSkeleton

**File:** `src/components/ContractProgressSkeleton.tsx`

Placeholder skeleton for `ContractProgress`. Mirrors the progress bar and two fund cards.

**No props.**

```tsx
import { ContractProgressSkeleton } from '@/components/ContractProgressSkeleton';

{isLoading ? <ContractProgressSkeleton /> : <ContractProgress milestones={milestones} />}
```

---

### MilestonesListSkeleton

**File:** `src/components/MilestonesListSkeleton.tsx`

Placeholder skeleton for `MilestonesList`. Renders three shimmer rows.

**No props.**

```tsx
import { MilestonesListSkeleton } from '@/components/MilestonesListSkeleton';

{isLoading ? <MilestonesListSkeleton /> : <MilestonesList milestones={milestones} />}
```

---

## Contracts Pages

### /contracts — ContractsPage

**File:** `src/app/contracts/page.tsx`

Client component that manages the contracts list and the create-contract flow.

#### State

| State | Type | Initial value | Description |
|-------|------|---------------|-------------|
| `contracts` | `Contract[]` | `listContracts()` | Initialised from `localStorage` on first render. Re-read after every successful creation. |
| `showForm` | `boolean` | `false` | Controls whether `ContractCreationForm` is visible. |

#### Behaviour

- **Empty + no form**: renders `<EmptyState>` with an "Create Contract" action.
- **Contracts + no form**: renders the list with a "Create Contract" button in the top-right.
- **Form visible**: renders `<ContractCreationForm>` (modal overlay); list and empty state are hidden.
- After `ContractCreationForm.onSubmit`, the contract is persisted via `saveContract`, `listContracts()` is re-read to refresh state, and the form is dismissed.

#### Loading State (`src/app/contracts/loading.tsx`)

App Router Suspense skeleton for the contracts list page. Mirrors the visual shape of `ContractsPage`:

- A heading shimmer block.
- A top-right "Create Contract" button shimmer.
- 5 contract-card shimmer rows (`ContractCardSkeleton`).

Accessibility:
- `aria-busy="true"` on `<main>`.
- `role="status"` + `aria-live="polite"` span announces "Loading contracts…".
- All shimmer blocks carry `aria-hidden="true"`.

---

### /contracts/[id] — ContractDetailPage

**File:** `src/app/contracts/[id]/page.tsx`

The contract detail page. The outer server component validates the `id` route parameter, then renders the client `ContractDetailPageContent` component.

#### Route Parameter Validation

`isValidContractId(id)` from `src/lib/validateContractId.ts` is applied before rendering anything:

- Non-empty
- Allowed charset: alphanumeric, `-`, `_` only
- Max 64 characters

If validation fails, `notFound()` is called immediately and the existing not-found UI is shown.

#### ContractDetailPageContent — State

| State | Type | Description |
|-------|------|-------------|
| `contractData` | `ContractData \| null` | Loaded by `resolveContractData(id)`. `null` while loading or on error. |
| `milestones` | `Milestone[]` | Merged from `contractData.milestones` and persisted milestones via `mergeContractMilestones`. |
| `isLoading` | `boolean` | `true` during the initial data fetch. |
| `errorMessage` | `string \| null` | Set when `resolveContractData` rejects or a status-persist call fails. |
| `isPersistingStatus` | `boolean` | `true` while a contract status update is being written to the repository. |

#### Data Flow

1. On mount, `resolveContractData(id)` is called. The result is merged with any persisted milestones via `mergeContractMilestones` (persisted records take precedence for duplicate IDs).
2. `handleReleaseFunds` calls `persistContractStatus('Completed', …)`, which calls `upsertContract` and mirrors the new status into `contractData` state.
3. `handleDispute` calls `persistContractStatus('Disputed', …)` with the same pattern. The dispute reason received from `ActionPanel.onDispute` is currently unused at the page level (status transition is the primary action); future iterations should store the reason.

#### Layout

Two-column responsive grid (`lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]`):

**Left column (top → bottom):**
1. `ContractSummary` (or `ContractSummarySkeleton`)
2. `ContractProgress` (or `ContractProgressSkeleton`)
3. `MilestonesList` (or `MilestonesListSkeleton`)

**Right column:**
4. `ActionPanel` — sticky (`top-6`)

All left-column components are individually wrapped in `<SafeBoundary>` to isolate render errors.

#### Loading State (`src/app/contracts/[id]/loading.tsx`)

App Router Suspense skeleton for the detail page. Mirrors the two-column layout:
- `HeaderCardSkeleton` — breadcrumb + back-link button shimmer
- `ContractSummarySkeleton`, `ContractProgressSkeleton`, `MilestonesListSkeleton` (left)
- `ActionPanelSkeleton` — 3 button shimmers (right)

Accessibility:
- `aria-busy="true"` on `<main>`.
- `role="status"` + `aria-live="polite"` span announces "Loading contract…".

#### ActionPanel wiring on ContractDetailPage

```tsx
<ActionPanel
  status={contractData?.status ?? 'Active'}
  onSubmitMilestone={handleSubmitMilestone}
  onReleaseFunds={handleReleaseFunds}
  onDispute={handleDispute}
  onViewSummary={handleViewSummary}
  isLoading={isLoading || isPersistingStatus}
  errorMessage={errorMessage ?? undefined}
  disputeFlow="confirm"
/>
```

> **Note:** The detail page passes `disputeFlow="confirm"` to use the legacy `ConfirmDialog` path for disputes rather than the default inline reason form.

---

## Related Documentation

- [`docs/components/ActionPanel.md`](./ActionPanel.md) — full ActionPanel keyboard support, focus-restoration diagram, and testing notes
- [`docs/components/ContractProgress.md`](./ContractProgress.md) — full data-calculation spec and ARIA attribute table
- [`docs/components/ContractCreationForm.md`](./ContractCreationForm.md) — detailed ContractCreationForm docs including test coverage notes
- [`docs/data-model.md`](../data-model.md) — `Contract` and `Milestone` data model and persistence API
- [`docs/persistence.md`](../persistence.md) — `saveContract`, `listContracts`, `upsertContract`, `listMilestonesByContract` reference
