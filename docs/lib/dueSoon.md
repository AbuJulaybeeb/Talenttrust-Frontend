# Due Soon Helpers

## Purpose

The `dueSoon` helpers exist to check if a milestone is due soon (today or within a configurable window of days) without falling prey to standard UTC-to-local timezone shifts. Standard YYYY-MM-DD dates parsed via default browser behavior often get shifted to the wrong day (e.g. showing yesterday) due to local time zone offsets.

---

## `parseLocalDate(dateStr)`

**Location:** `src/lib/dueSoon.ts`

**Signature:**
```typescript
function parseLocalDate(dateStr: string): Date | null
```

**Behavior:**
- Gracefully handles empty strings, null, undefined, and non-string inputs at runtime by returning `null`.
- Inspects the string for standard `YYYY-MM-DD` ISO format. If matched, parses it as a local date (preventing UTC conversion shifts) and sets the time to local midnight.
- Falls back to standard `Date.parse(trimmed)` for other ISO/RFC-2822 timestamps, normalizing the resulting timestamp to local midnight.
- Validates the calendar validity of parsed dates (e.g. `2026-02-30` is rejected and returns `null`).

---

## `isDueSoon(dueDateStr, today, windowDays)`

**Location:** `src/lib/dueSoon.ts`

**Signature:**
```typescript
function isDueSoon(
  dueDateStr: string | undefined,
  today: Date,
  windowDays: number,
): boolean
```

**Behavior:**
- Returns `false` if `dueDateStr` is empty, undefined, or invalid.
- Normalizes `today` and the parsed `dueDate` to local midnight.
- Computes the day delta between the dates. Uses `Math.round` to correctly manage daylight saving time (DST) shifts.
- Returns `true` if the due date is within the window (inclusive of `0` and `windowDays`), and `false` otherwise.

---

## Test coverage

- `src/lib/dueSoon.test.ts` — covers valid/invalid calendar dates, non-string inputs, empty strings, and timezone boundary edge cases (0 days, exact windowDays, overdue, and past-window dates).
