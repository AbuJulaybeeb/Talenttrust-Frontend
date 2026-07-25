# ReputationProfile Component

The `ReputationProfile` component displays verified trust signals, reputation score meters, level bands, privacy disclosures, and chronological activity history for a user within the TalentTrust application.

It is mounted by the Reputation page (`src/app/reputation/page.tsx`) when reputation data exists, or can be used as a standalone profile section in user dashboards.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `name` | `string` | Yes | — | The display name of the user. Used in section headings, screen-reader labels, and avatar badge. |
| `score` | `number \| null` | No | `undefined` | The numeric reputation score. When `typeof score === 'number'` and `score >= 0`, score meter semantics are enabled. |
| `level` | `string` | No | Derived / `'Community Member'` | Custom level label. If omitted and `score` exists, level is auto-calculated via `resolveReputationLevel(score, maxScore)`. |
| `history` | `ReputationEvent[]` | No | `[]` | Chronological array of reputation event objects. |
| `maxScore` | `number` | No | `5` | Maximum possible score value. Used for `aria-valuemax` and scaling reputation level bands. |

## Exported Types & Utilities

### Types

```typescript
export type ReputationEvent = {
  id: string;
  type: string;
  summary: string;
  date: string;
};

export type ReputationProfileProps = {
  name: string;
  score?: number | null;
  level?: string;
  history?: ReputationEvent[];
  maxScore?: number;
};

export type ReputationBand = {
  min: number;
  max: number;
  label: string;
};
```

### Helper Functions

- **`getReputationBands(maxScore: number): ReputationBand[]`**
  Calculates the 5 scaled reputation score bands based on `maxScore`. Baseline bands for `maxScore = 5`:
  - `0.0 – 1.0`: Newcomer
  - `1.0 – 2.0`: Contributor
  - `2.0 – 3.0`: Active Contributor
  - `3.0 – 4.0`: Trusted Partner
  - `4.0 – 5.0`: Expert

- **`resolveReputationLevel(score: number, maxScore: number): string`**
  Maps a numeric score to its corresponding band label. Clamps scores below `0` to `Newcomer` and scores at or above `maxScore` to `Expert`.

---

## Rendering States

The component renders one of three distinct states based on the presence of `score` and `history`.

### State 1: No Reputation State

**Condition:** `score` is `undefined`, `null`, or `< 0`.

**Render:**
- Score card displays: `"No reputation yet"` (without meter role).
- Level card displays: `"Pending"`.
- Reputation Legend: Hidden.
- Amber callout banner: Hidden.
- History header badge: `"Private by default"`.
- History section: Displays empty history card (`"No reputation history available yet."`).

### State 2: Partial Reputation State

**Condition:** `score >= 0` AND `history.length === 0`.

**Render:**
- Score card displays numeric score with `role="meter"` semantics.
- Level card displays resolved level label.
- Reputation Legend: Rendered with active level band highlighted.
- Amber callout banner: Rendered (`"Partial reputation data"` - `"A score exists but history is currently hidden..."`).
- History header badge: `"Private by default"`.
- History section: Displays empty history card (`"No reputation history available yet."`).

### State 3: Full Reputation State

**Condition:** `score >= 0` AND `history.length > 0`.

**Render:**
- Score card displays numeric score with `role="meter"` semantics.
- Level card displays resolved level label.
- Reputation Legend: Rendered with active level band highlighted.
- Amber callout banner: Hidden.
- History header badge: `"Visible"`.
- History section: Renders semantic ordered list (`<ol>`) containing event items with `<time>` elements.

---

## Usage Examples

### Basic / Partial Reputation

```tsx
import ReputationProfile from '@/components/ReputationProfile';

export function UserDashboard() {
  return (
    <ReputationProfile
      name="Alice Smith"
      score={3.5}
      history={[]}
    />
  );
}
```

### Full Reputation with History

```tsx
import ReputationProfile, { ReputationEvent } from '@/components/ReputationProfile';

const historyEvents: ReputationEvent[] = [
  {
    id: 'ev-1',
    type: 'Verification',
    summary: 'Completed identity verification',
    date: '2026-04-24',
  },
  {
    id: 'ev-2',
    type: 'Contract Completion',
    summary: 'Successfully finalized escrow contract #104',
    date: '2026-04-20',
  },
];

export function UserProfile() {
  return (
    <ReputationProfile
      name="Bob Jones"
      score={4.2}
      level="Expert"
      history={historyEvents}
      maxScore={5}
    />
  );
}
```

### Custom `maxScore` Scale

```tsx
<ReputationProfile
  name="Carol Danvers"
  score={75}
  maxScore={100}
  history={[]}
/>
```

---

## Accessibility

The component adheres to WCAG accessibility guidelines and includes comprehensive screen-reader semantics:

- **Landmark & Region:** Top-level `<section>` has `aria-labelledby="profile-heading"`, pointing to an `sr-only` `<h2>Reputation profile for {name}</h2>`.
- **Score Meter:** Rendered using `<span role="meter">` with `aria-valuenow`, `aria-valuemin={0}`, `aria-valuemax={maxScore}`, `aria-labelledby="reputation-score-label"`, and `aria-describedby="reputation-legend"`.
- **Screen Reader Announcements:** Includes `.sr-only` utility text for numeric scores (`"Reputation score 3.5 out of 5"`) and levels (`"Level Expert"`).
- **Chronological List Semantics:** Event history uses `<ol>` (ordered list) to communicate chronological sequence.
- **Machine-Readable Dates:** Each event date is enclosed in a `<time>` element. Valid ISO dates include a `dateTime` attribute.
- **Axe Audits:** Tested via `jest-axe` across all rendering states with zero accessibility violations.

---

## Testing

Comprehensive tests live in [`src/components/ReputationProfile.test.tsx`](file:///c:/Users/Ososanwo%20Idris/Documents/Talenttrust-Frontend/src/components/ReputationProfile.test.tsx).

Run tests with:
```bash
npm test -- src/components/ReputationProfile.test.tsx
```

## Related Files

- **Component:** [`src/components/ReputationProfile.tsx`](file:///c:/Users/Ososanwo%20Idris/Documents/Talenttrust-Frontend/src/components/ReputationProfile.tsx)
- **Component Tests:** [`src/components/ReputationProfile.test.tsx`](file:///c:/Users/Ososanwo%20Idris/Documents/Talenttrust-Frontend/src/components/ReputationProfile.test.tsx)
- **Page Documentation:** [`docs/components/ReputationPage.md`](file:///c:/Users/Ososanwo%20Idris/Documents/Talenttrust-Frontend/docs/components/ReputationPage.md)
