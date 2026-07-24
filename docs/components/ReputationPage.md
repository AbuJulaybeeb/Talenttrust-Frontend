# Reputation Page

The Reputation page (`src/app/reputation/page.tsx`) displays user reputation data using the `ReputationProfile` component, with explicit, accessible empty and error states (including keyboard-operable retry) and live region announcements for assistive technologies.

## Overview

The page handles user reputation data via a strict fetch-state model (`'idle' | 'loading' | 'success' | 'error' | 'empty'`), ensuring clear guidance in every loading, empty, and failure scenario.

## Rendering States

### State 1: Loading State
**Condition:** `fetchState === 'loading'` or `isLoading === true`

**Render:**
- Skeleton UI matching ReputationProfile layout
- `<main aria-busy="true">`
- Visually hidden live region: `<div role="status" aria-live="polite">Loading reputation…</div>`

---

### State 2: Error State (with Retry)
**Condition:** `fetchState === 'error'`, `isError === true`, or `error`/`errorMessage` present

**Render:**
- Accessible error card with heading "Failed to load reputation"
- Descriptive error message text
- Visually hidden live region: `<div role="alert" aria-live="assertive">{errorMessage}</div>`
- Keyboard-operable `<button type="button">` with focus outline for triggering `onRetry` callback

---

### State 3: Empty State (No Reputation)
**Condition:** `fetchState === 'empty'` or no reputation score exists (null, undefined, or negative)

**Render:**
- `EmptyState` component with `illustration="reputation"`
- Title: "No reputation yet"
- Description: Guidance on building reputation through contracts
- Visually hidden live region: `<div role="status" aria-live="polite">No reputation yet</div>`
- No `ReputationProfile` rendered

---

### State 4: Partial Reputation
**Condition:** Score exists, but history is empty

**Render:**
- `ReputationProfile` with partial-state UI (amber notification banner, "Private by default" pill)
- Visually hidden live region: `<div role="status" aria-live="polite">Reputation profile loaded</div>`

---

### State 5: Full Reputation
**Condition:** Score exists and history contains events

**Render:**
- `ReputationProfile` with full profile data and chronological history events (`<ol>` with `<time>` elements)
- Visually hidden live region: `<div role="status" aria-live="polite">Reputation profile loaded</div>`

---

## State Exclusivity Matrix

| `fetchState` / Flags | Active Render State | Live Region Role & Type |
|----------------------|--------------------|------------------------|
| `isLoading={true}` | Loading Skeleton | `role="status" aria-live="polite"` |
| `isError={true}` / Error | Error Card + Retry Button | `role="alert" aria-live="assertive"` |
| `reputationData={null}` | EmptyState | `role="status" aria-live="polite"` |
| `reputationData={score: 88}` | ReputationProfile | `role="status" aria-live="polite"` |

---

## Props

```typescript
export type FetchState = 'idle' | 'loading' | 'success' | 'error' | 'empty';

export type ReputationPageContentProps = {
  reputationData?: Reputation | null;
  userName?: string;
  fetchState?: FetchState;
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | string | null;
  errorMessage?: string | null;
  onRetry?: () => void;
};
```

---

## Accessibility

- **Page Heading:** `<h1>Reputation</h1>` maintained across all states as the single primary heading.
- **Live Regions:** State transitions are announced via `role="status"` / `aria-live="polite"` for non-disruptive changes (loading, empty, success) and `role="alert"` / `aria-live="assertive"` for time-sensitive error state changes.
- **Keyboard Operable Retry:** The retry control is a semantic `<button type="button">` with focus rings (`focus-visible:outline`), triggerable via keyboard (`Enter` or `Space`).

---

## Testing

### Running Tests

```bash
npm test -- src/app/reputation/__tests__/page.test.tsx
```

---

## Files

- **Page:** `src/app/reputation/page.tsx`
- **Component:** `src/components/ReputationProfile.tsx`
- **Tests:** `src/app/reputation/__tests__/page.test.tsx`
- **Component Tests:** `src/components/ReputationProfile.test.tsx`

