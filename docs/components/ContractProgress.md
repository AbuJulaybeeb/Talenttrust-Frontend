# ContractProgress

The `ContractProgress` component renders an accessible escrow summary and milestone progress panel. It calculates fund distribution (paid vs. outstanding) and milestone completion from a `Milestone[]` array, and presents the data with a semantic progress indicator.

## Location

`src/components/ContractProgress.tsx`

## Usage

```tsx
import ContractProgress from '@/components/ContractProgress';
import { Milestone } from '@/components/MilestonesList';

const milestones: Milestone[] = [
  { id: 'ms-1', title: 'Kickoff', status: 'Completed', payout: 1500, currency: 'USD' },
  { id: 'ms-2', title: 'Design', status: 'Pending', payout: 2500, currency: 'USD' },
];

<ContractProgress milestones={milestones} />
```

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `milestones` | `Milestone[]` | ✅ | Array of milestone objects. An empty array renders zero-state values safely. |

The `Milestone` type is defined in `src/components/MilestonesList.tsx`:

```ts
type Milestone = {
  id: string;
  title: string;
  status: StatusType;   // 'Active' | 'Completed' | 'Disputed' | 'Pending' | 'Paid'
  payout: number;
  currency: string;
  dueDate?: string;
};
```

## Data Calculation Logic

All calculation is performed by the internal `calculateProgress(milestones)` helper function.

**Completion:** A milestone is counted as completed when its `status` is either `"Completed"` or `"Paid"`. All other statuses (`"Pending"`, `"Active"`, `"Disputed"`) are counted as outstanding.

**Fund split:**
- **Paid** — sum of `payout` for all `Completed` and `Paid` milestones.
- **Outstanding** — sum of `payout` for all remaining milestones.

**Progress percentage:** `Math.round((completedCount / totalCount) * 100)`, clamped to 0 when `totalCount === 0`.

**Edge cases:** An empty or undefined `milestones` array safely returns all-zero values without throwing.

**Currency:** Derived from the first milestone's `currency` field; falls back to `"USD"` when the array is empty. Monetary values are formatted via `formatAmount` from `usePreferences`, so they respect the user's selected amount format (USD, NGN, compact).

## Empty State

When `milestones` is an empty array, `ContractProgress` renders an explicit **"No milestones yet"** message in place of the completion row and progress bar. The financial cards (Paid / Outstanding) remain visible showing zero values so the card layout stays consistent.

The `role="progressbar"` element is intentionally omitted for the empty state. An `aria-valuenow="0"` bar with no milestones to measure conveys no meaningful information to assistive technologies and reads as a broken state to both sighted users and screen reader users. A plain `<p>` announcement of "No milestones yet" is unambiguous.

```
Empty state layout:
┌──────────────────────────────────────────┐
│ Escrow Progress                          │
│                                          │
│  No milestones yet                       │
│                                          │
│  ┌──────────────┐  ┌──────────────┐     │
│  │  Paid        │  │  Outstanding │     │
│  │  $0.00       │  │  $0.00       │     │
│  └──────────────┘  └──────────────┘     │
└──────────────────────────────────────────┘
```



The component renders as a `<section>` card that follows the same `rounded-3xl border shadow-sm` card style used by `ContractSummary` and `MilestonesList`.

Internal layout:

```
┌──────────────────────────────────────────┐
│ Escrow Progress                          │
│                                          │
│  Milestones completed        1 / 3       │
│  ███████░░░░░░░░░░░░░░░░░░░░░░  33%      │
│                                          │
│  ┌──────────────┐  ┌──────────────┐     │
│  │  Paid        │  │  Outstanding │     │
│  │  $1,500.00   │  │  $5,500.00   │     │
│  └──────────────┘  └──────────────┘     │
└──────────────────────────────────────────┘
```

The two fund cards use a `sm:grid-cols-2` responsive grid. On narrow screens they stack vertically.

## Integration

`ContractProgress` is rendered in `src/app/contracts/[id]/page.tsx` inside the left column, between `ContractSummary` and `MilestonesList`. Milestones are sourced directly from the resolved `ContractData` object returned by `resolveContractData` — no additional repository call is needed.

```tsx
// src/app/contracts/[id]/page.tsx (simplified)
<SafeBoundary>
  {isLoading ? (
    <ContractProgressSkeleton />
  ) : contractData ? (
    /**
     * getMilestonesForContract – extracts the milestones that belong
     * to a resolved contract.
     *
     * ContractData already carries its own `milestones` array (populated
     * by resolveContractData), so no extra repository call is needed.
     * Currency is intentionally NOT hardcoded; each Milestone already
     * carries its own `currency` field that matches the contract.
     *
     * @param data - The fully resolved ContractData object.
     * @returns The milestone array for that contract, or [] if absent.
     */
    <ContractProgress milestones={contractData.milestones} />
  ) : null}
</SafeBoundary>
```

Key design points:
- **Loading state**: `ContractProgressSkeleton` is shown while `isLoading` is true. It mirrors the visual shape of `ContractProgress` and carries `aria-busy="true"` / `aria-label="Loading escrow progress"` for screen readers.
- **Currency**: Never hardcoded in the page. Each `Milestone` carries its own `currency` field; `ContractProgress` derives the display currency from `milestones[0].currency`.
- **Empty milestones**: An empty `milestones: []` renders a zero-state panel (0 / 0, 0%) without errors.
- **Error state**: If `resolveContractData` rejects, `contractData` stays `null` and the component is not mounted — the `ActionPanel` receives the `errorMessage` prop instead.

The surrounding two-column responsive grid (`lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]`) is unchanged.

## Accessibility (a11y)

| Feature | Implementation |
|---|---|
| Landmark | `<section aria-labelledby="contract-progress-title">` |
| Section heading | `<h2 id="contract-progress-title">Escrow Progress</h2>` |
| Progress bar | `role="progressbar"` on the track element |
| Numeric range | `aria-valuemin="0"` and `aria-valuemax="100"` |
| Current value | `aria-valuenow={progressPercent}` (integer 0–100) |
| Descriptive label | `aria-label="{n} of {total} milestones completed, {pct}%"` |
| Screen reader text | `<span class="sr-only">{pct}% complete</span>` inside the fill bar |

The progress bar conveys meaning through both the visible fill and the ARIA numeric attributes, meeting WCAG 2.1 SC 4.1.2 (Name, Role, Value) at AA level.

## Testing

Tests are in `src/components/__tests__/ContractProgress.test.tsx`, targeting ≥ 95% branch coverage.

| Test group | Scenarios |
|---|---|
| Rendering | Heading, progressbar (non-empty only), and fund cards always present |
| Empty state | "No milestones yet" message shown; no progressbar rendered; fund cards show zero; section heading present; no throw |
| Zero milestones | Both amounts show zero (legacy coverage via fund cards) |
| All-paid | 2 / 2 ratio, `aria-valuenow="100"`, correct paid sum, outstanding = 0 |
| None-paid | 0 / N ratio, `aria-valuenow="0"`, paid = 0, correct outstanding sum |
| Mixed | Partial ratio, rounded percentage, correct paid/outstanding split |
| ARIA attributes | `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-label` content; progressbar absent for empty |
| "Paid" status | Treated identically to "Completed" for count and fund calculations |
| Currency fallback | Empty array → USD; first milestone's currency used otherwise |
