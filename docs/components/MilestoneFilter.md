# MilestoneFilter — radiogroup usage guide

`MilestoneFilter` renders the accessible status filter used above the milestones list.
It is a **controlled component**: the parent owns state, filters data, and passes the
matching result count back so screen readers can announce how many items the current
filter returned.

**Source:** `src/components/milestones/MilestoneFilter.tsx`  
**Tests:** `src/components/__tests__/MilestoneFilter.test.tsx`

---

## Table of contents

1. [Type exports](#type-exports)
2. [Props](#props)
3. [Announcement wording rules](#announcement-wording-rules)
4. [WCAG rationale](#wcag-rationale)
5. [Consumption example](#consumption-example)
6. [Copying the pattern to other list views](#copying-the-pattern-to-other-list-views)
7. [Testing checklist](#testing-checklist)

---

## Type exports

### `MilestoneStatusFilter`

```ts
export type MilestoneStatusFilter =
  | 'All'
  | 'Active'
  | 'Pending'
  | 'Completed'
  | 'Paid'
  | 'Disputed';
```

`All` is the default state and bypasses status filtering entirely.
Every other value maps directly to the `status` field on the `Milestone` domain type.

### `FILTER_OPTIONS`

The component exports an ordered constant array that drives the rendered radio inputs:

```ts
const FILTER_OPTIONS: MilestoneStatusFilter[] = [
  'All',
  'Active',
  'Pending',
  'Completed',
  'Paid',
  'Disputed',
];
```

> **Note on `Active` and URL state.** `Active` is a valid `MilestoneStatusFilter` and
> renders as a selectable radio. The milestones page's URL parser (`getValidStatus`)
> currently omits `Active` from its `VALID_STATUSES` list, so `?status=Active` in the
> URL is coerced to `All`. Users who click the radio still filter by `Active` correctly;
> only the URL-driven initial load does not support it. If URL persistence for `Active`
> is added later, include `'Active'` in `VALID_STATUSES` and add a URL-sync test.

---

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `selected` | `MilestoneStatusFilter` | ✓ | The currently active filter. Must be one of the six union members. |
| `onChange` | `(filter: MilestoneStatusFilter) => void` | ✓ | Callback fired when the user selects a different radio option. Receives the new filter value. |
| `resultCount` | `number` | ✓ | The number of milestones that match the current filter. Used exclusively by the hidden `aria-live` region. Must equal `filtered.length`, including `0`. |

### `MilestoneFilterProps` interface

```ts
export interface MilestoneFilterProps {
  selected: MilestoneStatusFilter;
  onChange: (filter: MilestoneStatusFilter) => void;
  resultCount: number;
}
```

---

## Announcement wording rules

The hidden `<p aria-live="polite" aria-atomic="true">` constructs one of two sentence
forms depending on whether `All` or a specific status is selected.

### Rule 1 — All filter

```
Showing all {resultCount} milestone(s)
```

| `resultCount` | Rendered text |
|---------------|---------------|
| `0` | `Showing all 0 milestones` |
| `1` | `Showing all 1 milestone` |
| `5` | `Showing all 5 milestones` |

### Rule 2 — Specific status filter

```
Showing {resultCount} {status.toLowerCase()} milestone(s)
```

| `selected` | `resultCount` | Rendered text |
|------------|---------------|---------------|
| `Active` | `1` | `Showing 1 active milestone` |
| `Pending` | `3` | `Showing 3 pending milestones` |
| `Completed` | `0` | `Showing 0 completed milestones` |
| `Paid` | `1` | `Showing 1 paid milestone` |
| `Disputed` | `2` | `Showing 2 disputed milestones` |

**Singular / plural rule:** append `s` to `milestone` whenever `resultCount !== 1`.

**Case rule:** the status name is always lowercased in the announcement
(`selected.toLowerCase()`), even though the radio label is title-cased.

---

## WCAG rationale

### `<fieldset>` + `<legend>` — WCAG 1.3.1 Info and Relationships

WCAG 1.3.1 requires that information conveyed through visual presentation is also
available programmatically. A group of related radio buttons must have a programmatic
group label so assistive technology announces the group name when the user enters it.

The HTML specification defines two standard mechanisms for this:

| Mechanism | Use case |
|-----------|----------|
| `<fieldset>` + `<legend>` | Native form grouping; `legend` text is announced as the group label by all major screen readers |
| `role="group"` + `aria-labelledby` | Custom grouping when wrapping in `<fieldset>` is not practical |

`MilestoneFilter` uses the native `<fieldset>` + `<legend>` approach because it
requires no ARIA attributes on the wrapping element and has the broadest screen-reader
support. The rendered `<legend>` reads **"Filter by status"**, which is what screen
readers announce when focus enters the group.

A `role="radiogroup"` `<div>` with `aria-label` is also rendered inside the fieldset
to provide a more specific label (`"Filter milestones by status"`) for the interactive
radio row. This dual-layer labelling is intentional: the `<legend>` gives the fieldset
its required programmatic label, while `aria-label` on the inner container provides a
richer label in tools that expose the radiogroup role directly (e.g. VoiceOver rotor).

### `aria-live="polite"` — why not `assertive`

There are two values for `aria-live`:

| Value | Behaviour |
|-------|-----------|
| `"assertive"` | Interrupts the screen reader immediately, even mid-sentence |
| `"polite"` | Waits until the screen reader finishes its current utterance before announcing |

Filter result counts are supplementary information. Interrupting a user who is reading
a milestone title or navigating the list to announce "Showing 3 pending milestones"
would be disruptive and unhelpful. `polite` lets the current speech finish first, then
inserts the count announcement at the next natural pause.

`assertive` is appropriate for **errors and urgent alerts** — situations where the user
must act immediately (e.g. form validation failures, session expiry warnings). A filter
count change does not meet that bar.

`aria-atomic="true"` ensures the entire sentence is re-read whenever any part of the
text changes. Without it, some screen readers announce only the changed word (e.g. the
number), which produces an unintelligible fragment like "3" instead of
"Showing 3 pending milestones".

---

## Consumption example

The following is the actual integration pattern used in
`src/app/milestones/page.tsx`.

```tsx
'use client';

import { useCallback, useMemo, useState } from 'react';
import MilestoneFilter, {
  type MilestoneStatusFilter,
} from '@/components/milestones/MilestoneFilter';
import type { Milestone } from '@/types/domain';

// ─── State ───────────────────────────────────────────────────────────────────

const [milestones, setMilestones] = useState<Milestone[]>([]);
const [statusFilter, setStatusFilter] = useState<MilestoneStatusFilter>('All');

// ─── Derived filtered list ────────────────────────────────────────────────────
//
// Both `filtered` (rendered list) and `filtered.length` (resultCount) are
// derived from the same useMemo so the visual list and the live-region
// announcement are always in sync.

const filtered = useMemo(() => {
  if (statusFilter === 'All') return milestones;
  return milestones.filter((m) => m.status === statusFilter);
}, [milestones, statusFilter]);

// ─── JSX ─────────────────────────────────────────────────────────────────────

<MilestoneFilter
  selected={statusFilter}
  onChange={setStatusFilter}
  resultCount={filtered.length}   // ← must be filtered.length, never milestones.length
/>

{/* Render filtered, not milestones */}
<MilestonesList milestones={filtered} />
```

### URL synchronisation

The page also syncs `statusFilter` to the `?status` query parameter using
`useSearchParams` and `useRouter`. The filter value is initialised from the URL on
mount and written back with `router.replace` (not `push`, to avoid cluttering browser
history) on each filter change.

```ts
const VALID_STATUSES: MilestoneStatusFilter[] = [
  'All', 'Pending', 'Completed', 'Paid', 'Disputed',
];

function getValidStatus(param: string | null): MilestoneStatusFilter {
  return param && (VALID_STATUSES as string[]).includes(param)
    ? (param as MilestoneStatusFilter)
    : 'All';
}

// On mount / searchParams change:
setStatusFilter(getValidStatus(searchParams.get('status')));

// On filter change (write back to URL):
const params = new URLSearchParams(searchParams.toString());
params.set('status', statusFilter);
router.replace(`?${params.toString()}`);
```

---

## Copying the pattern to other list views

Follow these steps to add a comparable radiogroup filter to a new list view:

1. **Define a status union** analogous to `MilestoneStatusFilter` for the domain
   (e.g. `ContractStatusFilter`).
2. **Export a `FILTER_OPTIONS` array** in the order you want the radios rendered,
   starting with `'All'`.
3. **Render `<fieldset>` + `<legend>`** wrapping a `role="radiogroup"` container.
4. **Use `sr-only` radio inputs** with matching visible `<label>` elements for
   keyboard operability and custom styling.
5. **Add a `<p aria-live="polite" aria-atomic="true">`** that constructs the
   announcement sentence using the same singular/plural and lowercase-status rules
   described in [Announcement wording rules](#announcement-wording-rules).
6. **Derive `resultCount` from the same `useMemo`** that produces the filtered list —
   never pass the total item count when a specific filter is active.
7. **Write tests** covering all items in the [Testing checklist](#testing-checklist).

---

## Testing checklist

Tests for any component or page that uses `MilestoneFilter` should cover:

- [ ] All filter options render as radio inputs.
- [ ] The `selected` prop marks the correct radio as checked.
- [ ] Selecting each radio calls `onChange` with the correct value.
- [ ] The `"All"` filter shows every item; each specific filter shows only matching items.
- [ ] Filtering to a status with no matches shows the empty state.
- [ ] The live region contains the correct announcement text (`aria-live="polite"`, `aria-atomic="true"`).
- [ ] Singular form (`"1 milestone"`) and plural form (`"2 milestones"`) are both correct.
- [ ] Announcement text uses the lowercased status name for specific filters.
- [ ] Cycling through multiple filters in sequence produces correct intermediate states.
- [ ] URL `?status=` query param initialises the correct radio on page load.
- [ ] An unknown `?status=` value falls back to `All`.
- [ ] The component passes `axe` with no violations.

Reference implementations:

- Component unit tests: `src/components/__tests__/MilestoneFilter.test.tsx`
- Page integration tests: `src/app/milestones/__tests__/page.test.tsx`
- URL sync tests: `src/app/__tests__/milestones-filter-url.test.tsx`
