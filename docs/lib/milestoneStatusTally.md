# Milestone Status Tally

## Purpose

Derive per-status counts from a list of milestones so the UI can render a compact summary without iterating over milestones in component code.

## `milestoneStatusTally(milestones)`

**Location:** `src/lib/milestoneStatusTally.ts`

**Signature:**
```typescript
function milestoneStatusTally(
  milestones: { status: StatusType }[],
): StatusTally[]
```

**Behavior:**
- Returns an array of `{ status, count }` objects for every `StatusType` that appears at least once in `milestones`.
- Results are ordered in the canonical `STATUS_ORDER`: `Active`, `Completed`, `Disputed`, `Pending`, `Paid`.
- Zero-count statuses are omitted.
- Pure function — no side effects, no UI, no dependencies beyond the `StatusType` type.

**Constants:**

| Export          | Type                          | Value                                                              |
|-----------------|-------------------------------|--------------------------------------------------------------------|
| `STATUS_ORDER`  | `StatusType[]`                | `['Active', 'Completed', 'Disputed', 'Pending', 'Paid']`          |
| `StatusTally`   | `{ status: StatusType; count: number }` | —                                                        |

## Status Tally Chip Row

When `MilestonesList` renders one or more milestones, a chip row labelled `"Milestone status summary"` appears above the scrollable list and below the heading. Each chip:

- Uses the same CSS variable colour tokens as `StatusBadge` (`--status-success-*`, `--status-info-*`, `--status-error-*`, `--status-warning-*`).
- Shows the status icon (decorative, `aria-hidden`), the status label, and the count in a compact pill.
- Is a `<span role="listitem">` inside a `<div role="list" aria-label="Milestone status summary">`.

When no milestones exist the chip row is not rendered (no layout shift).

## Test coverage

- `src/lib/__tests__/milestoneStatusTally.test.ts` — covers counts per status, omission of zero-count statuses, all-five representation, empty input, single-status lists, and canonical ordering.
- `src/components/__tests__/MilestonesList.test.tsx` — covers chip rendering with correct counts, STATUS_ORDER, omission of zero-count statuses, empty list, accessible labelling, axe checks for populated/same-status/empty lists, and coexistence with existing elements.
