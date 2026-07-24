# Preferences

`src/lib/preferences.tsx`

Global user-preference state (theme, amount format, toast density, toast duration, quiet mode) backed by `localStorage`. Used across the escrow payout display in `MilestonesList` and any component that needs to format monetary amounts.

---

## API

### `PreferencesProvider`

Mount once at the app root (e.g. `app/layout.tsx`). Loads persisted preferences from `localStorage` on mount and writes back on every change.

```tsx
<PreferencesProvider>{children}</PreferencesProvider>
```

### `usePreferences()`

Returns `{ preferences, updatePreference, formatAmount }`.

| Field | Type | Description |
|---|---|---|
| `preferences` | `UserPreferences` | Current values |
| `updatePreference(key, value)` | `function` | Merge-update one field and persist |
| `formatAmount(amount, currency?)` | `function` | Format a number per `amountFormat` |

### `formatAmount(amount: number, currency?: string): string`

| `amountFormat` | Behaviour |
|---|---|
| `'usd'` (default) | `Intl.NumberFormat` `en-US`, currency style, passed `currency` (default `"USD"`) |
| `'ngn'` | `Intl.NumberFormat` `en-NG`, currency forced to `"NGN"` |
| `'compact'` | `en-US`, compact notation, currency style with passed `currency` |

Edge cases handled: `0`, fractions (e.g. `0.5`), large payouts (`1 000 000+`), negative amounts.

---

## Types

```ts
type Theme        = 'light' | 'dark' | 'system';
type AmountFormat = 'usd'   | 'ngn'  | 'compact';
type ToastDensity = 'relaxed' | 'compact';
type ToastDuration = 'short' | 'normal' | 'long' | 'persistent';

interface UserPreferences {
  theme:         Theme;
  amountFormat:  AmountFormat;
  toastDensity:  ToastDensity;
  quietMode:     boolean;
  toastDuration: ToastDuration;
}
```

---

## Usage example

```tsx
'use client';
import { usePreferences } from '@/lib/preferences';

export function PayoutAmount({ amount, currency }: { amount: number; currency: string }) {
  const { formatAmount } = usePreferences();
  return <span>{formatAmount(amount, currency)}</span>;
}
```

---

## Accessibility

- No interactive UI is provided by this module; it is a context/hook layer only.
- Components consuming `formatAmount` must wrap output in appropriate ARIA text — e.g. `<span aria-label="Payout $1,000.00">$1,000.00</span>`.

---

## Security

User preferences are persisted to `localStorage` and therefore are reachable by
anything running in the page origin (including browser extensions, shared
kiosks, or a previous tenant of a shared browser). To keep the hydrated state
trustworthy, `PreferencesProvider` routes every read through the
`sanitizePreferences(raw: unknown): UserPreferences` helper before handing the
result to React state.

`sanitizePreferences` is a pure, total function that:

1. Rejects non-object payloads (`null`, primitives, arrays) and returns a fresh
   copy of `DEFAULT_PREFERENCES` for them.
2. Iterates **only the source's own enumerable keys** (`Object.keys`) so
   keys inherited from a hostile prototype cannot reach the merge step.
3. Drops `__proto__`, `constructor`, and `prototype` keys outright — keys
   historically used to hijack prototypes via shallow merges.
4. Whitelists exactly `{ theme, amountFormat, toastDensity, quietMode, toastDuration }` and
   validates each candidate value against its allowed set:
   - `theme` ∈ `'light' | 'dark' | 'system'`
   - `amountFormat` ∈ `'usd' | 'ngn' | 'compact'`
   - `toastDensity` ∈ `'relaxed' | 'compact'`
   - `toastDuration` ∈ `'short' | 'normal' | 'long' | 'persistent'`
   - `quietMode` must be a literal `boolean` (not truthy coercibles like
     `1`, `'true'`, or objects).
5. Falls back to `DEFAULT_PREFERENCES` for any invalid or unknown value — the
   hydrating effect then composes `{ ...DEFAULT_PREFERENCES, ...sanitized }`,
   which is safe by construction because `DEFAULT_PREFERENCES` carries every
   known key with a verified value.

The original `try / catch` is preserved, so a malformed JSON string still
falls back to defaults rather than throwing.

### Threat model

| Threat                                          | Mitigation                                                |
|-------------------------------------------------|-----------------------------------------------------------|
| Tampered `localStorage` value with unknown keys | Whitelisting — unknown keys are silently dropped          |
| Invalid enum values driving rendering           | Per-field allow-list validation                           |
| `__proto__` pollution via spread/Object.assign  | Explicit rejection of `__proto__` during sanitization     |
| `constructor` / `prototype` pollution           | Explicit rejection of these dangerous key names           |
| `quietMode` truthy coercion (`1`, `"true"`)     | Strict `typeof === 'boolean'` check                       |
| Invalid `toastDuration` string                  | Allow-list check; falls back to `'normal'` (5 000 ms)    |
| Inherited keys on attacker objects              | `Object.keys` enumerates own enumerable keys only         |
| Non-object payloads (arrays, primitives, null)  | Early-return with `DEFAULT_PREFERENCES`                   |

### Usage notes

- The sanitizer is exported so it can be unit-tested in isolation.
- Re-saving sanitized preferences back to `localStorage` guarantees the
  stored payload contains only the five known keys, so a corrupt value can
  eventually self-heal once the user changes any preference.

---

## Testing

File: `src/lib/__tests__/preferences.test.tsx`

Coverage targets (≥ 95%):

| Area | Tests |
|---|---|
| Default preferences | `provides default preferences` |
| localStorage read | `loads preferences from localStorage on mount`, `merges partial data with defaults`, `falls back on invalid JSON` |
| localStorage write | `updates preferences and persists` |
| `formatAmount` – USD | zero, fraction, large, negative, default currency |
| `formatAmount` – NGN | typical, zero, large |
| `formatAmount` – compact | thousands (`K`), millions (`M`), zero |
| Custom currency handling | default and compact formats preserve caller-provided currency |
| Re-render consumer | `consumer component re-renders with updated format` |
| Outside provider | default fallback formatting and no-op `updatePreference` |

Run tests:

```bash
npm test -- --testPathPattern=preferences --coverage
```

---

## ThemeToggle

`src/components/ThemeToggle.tsx`

One-click header button that toggles between `light` and `dark` themes. Uses the same `updatePreference('theme', ...)` call as `SettingsPanel`, so the two stay in sync.

### Behaviour

| Current theme | Button action | Result |
|---|---|---|
| `'light'` | click | sets `'dark'` |
| `'dark'` | click | sets `'light'` |
| `'system'` | click | sets `'dark'` (gives the user an explicit state) |

`'system'` remains available via **Settings → Appearance → system**.

### SSR safety

The component renders `null` until its `useEffect` fires (mounted guard), preventing hydration mismatch. No flash of incorrect icon occurs because the `PreferencesProvider` also waits for `isHydrated`.

### Accessibility

- `aria-label` reflects the *next* action: `"Switch to dark theme"` / `"Switch to light theme"`.
- `aria-pressed` reflects the *current* dark state (`true` when dark, `false` otherwise).
- Inherits project focus-ring via `focus-visible:ring-2 focus-visible:ring-[var(--primary)]`.

### Usage

Mount once in the app header (already done in `src/app/layout.tsx`):

```tsx
import { ThemeToggle } from '@/components/ThemeToggle';

<div className="flex items-center gap-2">
  <ThemeToggle />
  <WalletConnectButton />
</div>
```

### Testing

File: `src/components/__tests__/ThemeToggle.test.tsx`

| Test | Description |
|---|---|
| SSR guard | button present after mount |
| Light label/icon | moon icon, aria-label "Switch to dark theme", aria-pressed false |
| Dark label/icon | sun icon, aria-label "Switch to light theme", aria-pressed true |
| light → dark | click updates preference to dark |
| dark → light | click updates preference to light |
| system → dark | first click from system sets dark |
| aria-pressed | reflects dark state after toggle |
| localStorage | toggled value persisted |
