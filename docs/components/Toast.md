# Toast

Transient notification system for success and error feedback. Supports auto-dismiss, pause-on-interaction (hover and focus), screen-reader announcements, density preferences, and quiet-mode suppression.

**Source:** `src/components/toast/toast-provider.tsx`
**Tests:** `src/components/toast/toast-provider.test.tsx`

---

## Provider Architecture

```text
<PreferencesProvider>            <- src/lib/preferences.tsx
  <ToastProvider>                <- src/components/toast/toast-provider.tsx
    {children}
    <ToastAnnouncer />           {/* two sr-only live-region <div>s */}
    <ToastViewport />            {/* fixed top-right visual stack */}
  </ToastProvider>
</PreferencesProvider>
```

`ToastProvider` **must** be a descendant of `PreferencesProvider` because it reads
`quietMode`, `toastDensity`, and `toastDuration` from `usePreferences()`
(source line 403; JSDoc lines 229-231).

All active toasts render in a **single** fixed column anchored `top-4 right-4`
(source line 125). There is no multi-column layout.

---

## Exports

| Export          | Kind      | Description                                            |
|-----------------|-----------|--------------------------------------------------------|
| `ToastProvider` | Component | Context provider; renders viewport and announcer        |
| `useToast`      | Hook      | Returns `{ toasts, showSuccess, showError, dismissToast }` |

Both are named exports from `@/components/toast/toast-provider`.

---

## API Reference

### Types

```ts
type ToastVariant = 'success' | 'error';             // source line 15

type ToastAction = {
  /** Plain-text label. Never interpolated as HTML. */
  label: string;                                      // source lines 19-20
  /** Called when the user clicks the action button. */
  onClick: () => void;                                // source line 22
};

type ToastInput = {
  title: string;                                      // source line 26
  description?: string;                               // source line 27
  duration?: number;      // ms; overrides preference  // source line 28
  action?: ToastAction;   // optional inline button    // source line 33
};

type ToastRecord = ToastInput & {
  id: string;
  variant: ToastVariant;
};                                                    // source lines 36-39

type ToastContextValue = {
  toasts: ToastRecord[];
  showSuccess: (toast: ToastInput) => string;
  showError:   (toast: ToastInput) => string;
  dismissToast: (id: string) => void;
};                                                    // source lines 41-46
```

### `useToast()` hook

Must be called inside `<ToastProvider>`.
Throws `Error('useToast must be used within a ToastProvider')` otherwise
(source lines 532-534).

Returns the `ToastContextValue` object:

| Member              | Type                         | Description                                      |
|---------------------|------------------------------|--------------------------------------------------|
| `toasts`            | `ToastRecord[]`              | All currently visible toasts                     |
| `showSuccess(toast)`| `(ToastInput) => string`     | Creates a success toast; see return-value table  |
| `showError(toast)`  | `(ToastInput) => string`     | Creates an error toast; always returns an ID     |
| `dismissToast(id)`  | `(string) => void`           | Removes the toast with the given ID immediately  |

### `showSuccess(toast: ToastInput): string`

```ts
// source lines 405-416
const showSuccess = useCallback(
  (toast: ToastInput) => {
    if (preferences.quietMode) {
      return 'suppressed';          // literal string when quietMode is true
    }
    const durationMs =
      toast.duration !== undefined ? toast.duration : DURATION_MAP[preferences.toastDuration];
    return createToast('success', toast, durationMs);
  },
  [createToast, preferences.quietMode, preferences.toastDuration],
);
```

### `showError(toast: ToastInput): string`

```ts
// source lines 418-425
const showError = useCallback(
  (toast: ToastInput) => {
    const durationMs =
      toast.duration !== undefined ? toast.duration : DURATION_MAP[preferences.toastDuration];
    return createToast('error', toast, durationMs);
  },
  [createToast, preferences.toastDuration],
);
```

`showError` has **no** quiet-mode branch - it always creates a toast (source line 418;
confirmed by test `quietMode - does not suppress error toasts when quietMode is true`,
lines 360-395).

### `dismissToast(id: string): void`

Removes the matching toast by filtering state (source lines 286-288).
If `id` does not correspond to any visible toast the call is a no-op.

---

## Return-Value Table

| Function       | Scenario                                       | Return value                  |
|----------------|------------------------------------------------|-------------------------------|
| `showSuccess`  | Normal (quietMode is `false`)                  | Unique ID string e.g. `"toast-<uuid>"` |
| `showSuccess`  | Quiet mode active (`preferences.quietMode === true`) | `'suppressed'` - no toast is created |
| `showError`    | Any (quiet mode is ignored)                    | Unique ID string e.g. `"toast-<uuid>"` |
| `dismissToast` | -                                              | `void`                        |

The returned ID prefix is always `"toast-"` (source line 80; test line 163:
`expect(ids.every((id) => id.startsWith('toast-'))).toBe(true)`).

---

## Behavioral Guarantees

### Quiet Mode

Source: lines 405-409.
Test suite: `describe('quietMode', ...)` (test lines 313-396).

When `preferences.quietMode === true`:

- `showSuccess()` returns the **literal string `'suppressed'`** and does **not** add
  any entry to the `toasts` array (test line 356-357:
  `expect(result).toBe('suppressed')` and
  `expect(screen.queryByRole('status')).not.toBeInTheDocument()`).
- `showError()` is **completely unaffected**. It returns a valid `toast-...` ID,
  the toast is rendered, and `role="alert"` is present (test lines 392-394).
- The quiet-mode gate is applied **before** `createToast`, so no ID is ever
  generated for suppressed calls (source line 407-408).

Callers may branch on the literal `'suppressed'` string:

```ts
const result = showSuccess({ title: 'Done' });
if (result === 'suppressed') { /* user preference active */ }
```

### `MAX_VISIBLE_TOASTS` and the Overflow Queue

Test suite: `describe('toast queue (MAX_VISIBLE_TOASTS = 4)', ...)`.

```ts
const MAX_VISIBLE_TOASTS = 4;
```

At most `4` toasts are visible at once. A toast created while at that cap is
**queued**, not evicted — nothing already on screen is ever pushed off to
make room, and a queued toast is never silently discarded. Internally the
provider tracks `{ visible: ToastRecord[], queued: ToastRecord[] }`; only
`visible` is rendered and only `visible` toasts get auto-dismiss timers.

Queued toasts are promoted into the freed slot when a visible toast is
dismissed (dismiss button or its own auto-dismiss timer), oldest-first
**within the same severity**. Error toasts jump ahead of any success toasts
already sitting in the queue, so a burst of success toasts can never bury or
drop an error — see `enqueueBySeverity`. Tests confirm:

- Adding 5 toasts: `Toast 1`-`Toast 4` stay visible, `Toast 5` waits in the
  queue (it is not rendered, and not lost).
- Dismissing one visible toast promotes the oldest queued toast into view,
  with a fresh auto-dismiss timer scheduled at promotion time.
- The live region only ever announces a toast that is actually visible —
  never one still waiting in the queue.
- Queuing an error behind an already-queued success promotes the error
  first once a slot frees up (severity ordering).
- A large success burst followed by one error still surfaces that error
  well before the ten successes ahead of it have all cycled through.
- The same queueing behavior holds when `toastDuration` is `'persistent'`.

### Density and Stacking Gap

Source: lines 125-127 (JSX), lines 255-258 (JSDoc), line 482 (prop pass).
Test suite: `describe('density', ...)` (test lines 398-441).

`preferences.toastDensity` controls the Tailwind `gap-*` class on the viewport container:

| `toastDensity` value  | CSS class | Approximate gap |
|-----------------------|-----------|-----------------|
| `'relaxed'` (default) | `gap-3`   | 12 px           |
| `'compact'`           | `gap-1.5` | 6 px            |

Source (line 126):

```tsx
density === 'compact' ? 'gap-1.5' : 'gap-3'
```

Tests assert the className via `viewport.className.match(/gap-3/)` and
`/gap-1\.5/` (test lines 419, 439).

### Auto-Dismiss Duration

Source: lines 55-60 (`DURATION_MAP`), lines 410-413 / 420-422 (resolution logic).
Test suite: `describe('toastDuration preference', ...)` (test lines 1002-1373).

```ts
const DURATION_MAP: Readonly<Record<ToastDuration, number | null>> = {
  short:      2500,
  normal:     5000,
  long:      10000,
  persistent: null,   // null -> no timer scheduled
};
```

**Resolution order** (same for both `showSuccess` and `showError`):

1. If `toast.duration` is explicitly supplied, use it **as-is** (even `0`).
2. Otherwise look up `DURATION_MAP[preferences.toastDuration]`.

Per-call `duration` always wins, including over `'persistent'`
(source lines 410-412; test lines 1178-1214).

For `'persistent'`, `DURATION_MAP` returns `null`. When `durationMs` is `null`,
`createToast` stores `undefined` on the record (source line 388:
`duration: durationMs ?? undefined`). The `useEffect` then skips
`scheduleToastDismiss` for that toast (source lines 436-438).

| Preference value | Effective duration | Auto-dismissed? |
|------------------|--------------------|-----------------|
| `'short'`        | 2 500 ms           | Yes             |
| `'normal'`       | 5 000 ms           | Yes (default)   |
| `'long'`         | 10 000 ms          | Yes             |
| `'persistent'`   | -                  | No              |

### Pause on Hover / Focus

Source: lines 137-140 (event handlers), lines 342-381 (pause/resume logic).
Test suite: tests at lines 202-264.

Each toast panel listens for:

| Event        | Handler           |
|--------------|-------------------|
| `mouseenter` | `onPauseTimer`    |
| `mouseleave` | `onResumeTimer`   |
| `focus`      | `onPauseTimer`    |
| `blur`       | `onResumeTimer`   |

A `pauseCount` integer tracks overlapping interactions (source lines 349, 374).
The timer only resumes when `pauseCount` returns to `0` (source line 376).
Remaining time is computed from `expiresAt - Date.now()` at pause time
(source lines 355-357) and passed to a fresh `setTimeout` on resume (source line 377).

### Action Button Contract

Source: lines 17-23 (type), lines 159-173 (render), lines 277-281 (JSDoc).
Test suite: `describe('toast action button', ...)` (test lines 684-995).

```ts
type ToastAction = {
  label: string;        // rendered as a plain text node - never set via innerHTML
  onClick: () => void;  // callback; toast dismissed unconditionally after call
};
```

**Plain-text enforcement.** `label` is rendered as a React text child:

```tsx
{toast.action.label}   // source line 171
```

It is **never** set via `innerHTML` or `dangerouslySetInnerHTML`.
The XSS test (test lines 892-924) verifies that a malicious label string
`'<img src=x onerror=alert(1)>'` appears as literal text and
`actionBtn.querySelector('img')` returns `null`.

**Dismiss-on-fire.** Clicking the action button **always** calls `onDismiss`
immediately after `onClick`, unconditionally (source lines 165-168):

```tsx
onClick={() => {
  toast.action!.onClick();
  onDismiss(toast.id);
}}
```

The action button fires the callback (test line 783) and the toast is removed
(test lines 786-824). The auto-dismiss timer is cancelled once the toast is
gone (test lines 821-824).

**Backward compatibility.** Omitting `action` renders no action button;
only the dismiss `x` button is present inside the toast panel
(test lines 862-889).

---

## Accessibility

### `role` attributes

Source: line 141.
Tests: line 60 (`getByRole('status')`), line 74 (`getByRole('alert')`).

| Toast variant | `role` value | AT behavior                                     |
|---------------|--------------|-------------------------------------------------|
| `'success'`   | `"status"`   | Announced when the AT is idle (non-interrupting) |
| `'error'`     | `"alert"`    | Announced immediately; may trigger alert sound   |

The viewport container carries `role="region"` and `aria-label="Notifications"`
with `aria-atomic="false"` (source lines 122-124), making it a navigable
landmark. The `aria-atomic="false"` means individual toasts, not the
entire container, are treated as atomic units.

### Live-Region Announcer

Source: lines 203-217 (`ToastAnnouncer`).
Tests: lines 62, 75.

`ToastAnnouncer` renders **two** `sr-only` `<div>` elements inside the provider:

| Region  | `aria-live`   | `aria-atomic` | Content                                              |
|---------|---------------|---------------|------------------------------------------------------|
| Success | `"polite"`    | `"true"`      | `title[. description]` of the **latest** success toast |
| Error   | `"assertive"` | `"true"`      | `title[. description]` of the **latest** error toast   |

The content formula (source lines 210, 213):

```
`${toast.title}${toast.description ? `. ${toast.description}` : ''}`
```

Only the **most recent** toast of each variant is announced — and only
among toasts that are actually **visible**. A toast still waiting in the
overflow queue is not announced until it is promoted (see
"`MAX_VISIBLE_TOASTS` and the Overflow Queue" below): after adding 5 toasts
in a row, the polite region contains `'Toast 4'`, not `'Toast 5'`, because
`Toast 5` hasn't been shown yet.

### Dismiss Button

Source: lines 175-194.
Tests: lines 86-90 (`dismiss success notification`), lines 1146, 1168.

Each toast renders one dismiss button with:

- `aria-label="Dismiss success notification"` or `"Dismiss error notification"`
  (source line 176: `` aria-label={`Dismiss ${badgeLabel.toLowerCase()} notification`} ``).
- `focus:ring-2 focus:ring-[var(--ring)]` (source line 189) - fully keyboard accessible.
- `<span aria-hidden="true">&times;</span>` hides the `x` glyph from AT.

---

## Mounting Example

The following pattern matches the actual import paths and prop signatures used in the
test file (test import lines 3-4).

```tsx
// app/layout.tsx  (or root provider file)
import { PreferencesProvider } from '@/lib/preferences';
import { ToastProvider } from '@/components/toast/toast-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PreferencesProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </PreferencesProvider>
      </body>
    </html>
  );
}
```

Consuming the hook in a client component:

```tsx
'use client';
import { useToast } from '@/components/toast/toast-provider';

export function ContractActions() {
  const { showSuccess, showError, dismissToast } = useToast();

  const handleRelease = async () => {
    try {
      await releaseFunds();
      const id = showSuccess({
        title: 'Milestone released',
        description: 'Funds are on the way to the freelancer wallet.',
        action: {
          label: 'Undo',
          onClick: () => cancelRelease(),
          // onClick fires before dismiss; toast is always removed afterward
        },
      });
      // id === 'suppressed' if quietMode is on; otherwise a 'toast-<uuid>' string
    } catch {
      showError({ title: 'Release failed', description: 'Wallet not connected.' });
    }
  };

  return <button onClick={handleRelease}>Release milestone</button>;
}
```

---

## Troubleshooting

| Symptom | Likely cause |
|---------|--------------|
| `useToast` throws `"must be used within a ToastProvider"` | Component is outside `<ToastProvider>` (source line 533) |
| Success toasts not appearing | `quietMode` is `true`; `showSuccess` returns `'suppressed'` (source lines 407-408) |
| Only 4 toasts visible after a burst | `MAX_VISIBLE_TOASTS = 4`; the rest are queued and promoted as slots free up, not dropped |
| Toast never dismisses | `toastDuration` is `'persistent'` with no per-call `duration` override (source lines 436-438) |
| Action button click does not dismiss | Impossible by design: `onDismiss` is called unconditionally after `onClick` (source lines 165-168) |
