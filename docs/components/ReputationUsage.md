# Reputation Components — Usage Guide

This guide covers practical usage of the reputation components: `ReputationProfile` (the core presentational component) and `ReputationPageContent` (the page-level wrapper). All examples compile against the current API.

---

## Components at a glance

| Component | File | Purpose |
|-----------|------|---------|
| `ReputationProfile` | `src/components/ReputationProfile.tsx` | Renders a user's score, level, legend, and history |
| `ReputationPageContent` | `src/app/reputation/page.tsx` | Page wrapper; shows `EmptyState` when no reputation exists |

---

## Types

All types are exported from `src/components/ReputationProfile.tsx` and re-exported through `src/types/domain.ts`.

```typescript
// A single entry in the reputation timeline
export type ReputationEvent = {
  id: string;       // unique key for React list rendering
  type: string;     // human-readable event category, e.g. "Verification"
  summary: string;  // one-line description of the event
  date: string;     // ISO-8601 date string, e.g. "2026-04-24"
};

// Props for ReputationProfile
export type ReputationProfileProps = {
  name: string;           // display name shown in the avatar and heading
  score?: number | null;  // numeric reputation score; null/undefined = no reputation
  level?: string;         // explicit level label; derived from score when omitted
  history?: ReputationEvent[];
  maxScore?: number;      // upper bound of the score scale (default: 5)
};

// Domain type — page-level shape (name is optional)
export type Reputation = Omit<ReputationProfileProps, 'name'> & { name?: string };
```

---

## ReputationProfile

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | — | User's display name. The avatar shows the uppercased first character. |
| `score` | `number \| null` | `undefined` | Reputation score. Must be `≥ 0` to be treated as a real score. `null` or `undefined` shows the no-reputation state. |
| `level` | `string` | derived | Level label. When omitted, the level is resolved automatically from `score` and `maxScore` using the built-in band table. |
| `history` | `ReputationEvent[]` | `[]` | Ordered list of reputation events. An empty array triggers the partial-reputation state if a score is present. |
| `maxScore` | `number` | `5` | Maximum value on the score scale. Adjusting this re-scales the level bands proportionally. |

---

### Rendering states

#### No reputation

Rendered when `score` is `undefined`, `null`, or negative.

```tsx
import ReputationProfile from '@/components/ReputationProfile';

<ReputationProfile name="Alice" />
// — Score block: "No reputation yet"
// — Level block: "Pending"
// — History pill: "Private by default"
// — History body: empty-state message
```

#### Partial reputation (score, no history)

Rendered when `score >= 0` but `history` is empty. An amber notice explains that history is hidden until verified actions are available.

```tsx
<ReputationProfile
  name="Alice"
  score={2.5}
  history={[]}
/>
// — Score block: "2.5"
// — Level block: resolved from score ("Active Contributor" for 2.5 on a 0–5 scale)
// — Amber banner: "Partial reputation data"
// — History pill: "Private by default"
```

#### Full reputation

Rendered when `score >= 0` and `history` contains at least one event.

```tsx
import type { ReputationEvent } from '@/components/ReputationProfile';

const events: ReputationEvent[] = [
  {
    id: 'ev-1',
    type: 'Verification',
    summary: 'Completed identity verification',
    date: '2026-04-24',
  },
  {
    id: 'ev-2',
    type: 'On-chain review',
    summary: 'Received positive trust signal',
    date: '2026-04-23',
  },
];

<ReputationProfile
  name="Alice"
  score={4.1}
  history={events}
/>
// — Score block: "4.1"
// — Level block: "Expert"
// — Reputation Level Legend: all five bands shown; active band highlighted in indigo
// — History pill: "Visible"
// — History list: ordered <ol> with one <li> per event, dates wrapped in <time>
```

---

### Providing an explicit level

Pass `level` to override the derived label. Useful when the API returns a pre-computed tier.

```tsx
<ReputationProfile
  name="Bob"
  score={88}
  level="Trusted Partner"
  history={events}
/>
```

---

### Custom score scale

Set `maxScore` when the score is not on a 0–5 scale. The level bands and meter `aria-valuemax` both update automatically.

```tsx
// Score out of 100
<ReputationProfile
  name="Carol"
  score={72}
  maxScore={100}
  history={events}
/>
// Level bands become: 0–20, 20–40, 40–60, 60–80, 80–100
// aria-valuemax="100"
```

---

### Level bands

When `level` is not provided, the component resolves it from the score using these bands (scaled to `maxScore`):

| Band (default 0–5) | Level |
|--------------------|-------|
| 0.0 – 1.0 | Newcomer |
| 1.0 – 2.0 | Contributor |
| 2.0 – 3.0 | Active Contributor |
| 3.0 – 4.0 | Trusted Partner |
| 4.0 – 5.0 | Expert |

Boundary rule: the lower bound is inclusive, the upper bound is exclusive — except for the top band, where both bounds are inclusive. A score of exactly `0` resolves to Newcomer; a score of exactly `5` (or `maxScore`) resolves to Expert.

```typescript
import { resolveReputationLevel, getReputationBands } from '@/components/ReputationProfile';

resolveReputationLevel(3.0, 5);   // "Trusted Partner"
resolveReputationLevel(5.0, 5);   // "Expert"
resolveReputationLevel(72, 100);  // "Trusted Partner" (band: 60–80)

getReputationBands(10);
// [
//   { min: 0, max: 2, label: 'Newcomer' },
//   { min: 2, max: 4, label: 'Contributor' },
//   ...
// ]
```

---

## ReputationPageContent

The page-level component handles the routing between `EmptyState` and `ReputationProfile`. Use this when you need the full page layout with a heading.

```tsx
import { ReputationPageContent } from '@/app/reputation/page';
import type { Reputation } from '@/types/domain';

// No data — shows EmptyState
<ReputationPageContent />

// With data — shows ReputationProfile
const data: Reputation = {
  score: 3.8,
  level: 'Trusted Partner',
  history: events,
};
<ReputationPageContent reputationData={data} userName="Alice" />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `reputationData` | `Reputation \| null` | `undefined` | Reputation payload from the API. `null` or `undefined` shows the empty state. |
| `userName` | `string` | `"User"` | Passed to `ReputationProfile` as `name`. |

### Data shaping

When connecting to a real API, shape the response before passing it in:

```typescript
import type { Reputation } from '@/types/domain';

async function fetchReputation(userId: string): Promise<Reputation | null> {
  const res = await fetch(`/api/reputation/${userId}`);
  if (!res.ok) return null;
  const raw = await res.json();
  return {
    score: raw.score ?? null,
    level: raw.level,               // undefined is fine — level will be derived
    history: raw.history ?? [],
  };
}
```

---

## Common patterns

### Memoising props to avoid unnecessary re-renders

```tsx
import { useMemo } from 'react';
import { ReputationPageContent } from '@/app/reputation/page';
import type { Reputation } from '@/types/domain';

function UserReputation({ apiData, userName }: { apiData: unknown; userName: string }) {
  const reputationData = useMemo<Reputation | null>(() => {
    if (!apiData || typeof (apiData as Reputation).score !== 'number') return null;
    return apiData as Reputation;
  }, [apiData]);

  return <ReputationPageContent reputationData={reputationData} userName={userName} />;
}
```

### Rendering ReputationProfile standalone (outside the page route)

```tsx
import ReputationProfile from '@/components/ReputationProfile';

// Inside a modal, sidebar, or summary card
<ReputationProfile
  name="Dave"
  score={1.8}
  history={[]}
/>
```

### Testing with the component directly

```tsx
import { render, screen } from '@testing-library/react';
import ReputationProfile from '@/components/ReputationProfile';

test('shows full profile', () => {
  render(
    <ReputationProfile
      name="Test User"
      score={3.5}
      history={[
        { id: '1', type: 'Verification', summary: 'ID verified', date: '2026-01-01' },
      ]}
    />
  );
  expect(screen.getByText('3.5')).toBeInTheDocument();
  expect(screen.getByText('Trusted Partner')).toBeInTheDocument();
  expect(screen.getByText(/Visible/i)).toBeInTheDocument();
});
```

---

## Accessibility notes

- The score is exposed with `role="meter"` and `aria-valuenow` / `aria-valuemin` / `aria-valuemax` so assistive technologies announce it as a measured value, not plain text. The meter is absent when no score exists.
- A visually hidden `<h2>` with `id="profile-heading"` labels the outer `<section aria-labelledby="profile-heading">`.
- History renders as `<ol>` (ordered list) because the sequence is chronological.
- Each event date is wrapped in `<time dateTime="...">` with the ISO value in `dateTime`. If the date string is not a valid ISO date the attribute is omitted to keep the markup valid.
- All states pass `jest-axe` audits. Run `npm test -- src/components/ReputationProfile.test.tsx` to verify.

---

## Files

| Purpose | Path |
|---------|------|
| Core component | `src/components/ReputationProfile.tsx` |
| Component tests | `src/components/ReputationProfile.test.tsx` |
| Page wrapper | `src/app/reputation/page.tsx` |
| Page tests | `src/app/reputation/__tests__/page.test.tsx` |
| Domain types | `src/types/domain.ts` |
| Page-level docs | `docs/components/ReputationPage.md` |
