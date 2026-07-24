# Currency Mismatch Detection

## Purpose

Detect when one or more milestones carry a currency that differs from their parent contract's currency. Summing payouts or releasing funds across mixed denominations is a financial error that previously passed silently.

## `findCurrencyMismatches(contractCurrency, milestones)`

**Location:** `src/lib/currencyMismatch.ts`

**Signature:**
```typescript
function findCurrencyMismatches(
  contractCurrency: string,
  milestones: Milestone[],
): string[]
```

**Behavior:**
- Returns the `id` of every milestone whose `currency` does not match `contractCurrency`.
- Comparison is **case-insensitive** (`'usd' === 'USD'`).
- Pure function — no side effects, no UI, no dependencies beyond the `Milestone` type.

## Warning UI

When `contractCurrency` is passed to `MilestonesList`, the component surfaces mismatches via an accessible `role="alert"` inline banner placed above the milestone list. The banner:
- Shows the number of mismatched milestones.
- Lists which currencies are involved.
- Does **not** block rendering — milestones are always displayed.
- Uses the theme's warning tokens (`--status-warning-bg`, `--status-warning-foreground`).

## Test coverage

- `src/lib/__tests__/currencyMismatch.test.ts` — covers all-match, single-mismatch, multi-currency, case-insensitive, and empty edge cases.
- `src/components/__tests__/MilestonesList.test.tsx` — tests the warning banner renders correctly with singular/plural text, multiple currencies, and passes axe accessibility checks.
- `src/components/__tests__/a11y.test.tsx` — axe tests for mismatch scenarios.
