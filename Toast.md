# Toast System

The toast system provides global, non-modal notifications for transient events like success confirmations or errors. It is composed of a `ToastProvider`, a `useToast` hook for triggering notifications, and several internal components that handle rendering and accessibility.

The provider is located at `src/components/toast/toast-provider.tsx`.

## API

### `ToastProvider`

The `ToastProvider` is a context provider that must be mounted near the root of the application tree, inside the `<PreferencesProvider>`. It manages the state of all toasts and renders the `ToastViewport` (the visible list of toasts) and `ToastAnnouncer` (for screen reader announcements).

**Props**

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | `React.ReactNode` | Yes | The rest of the application that needs access to the toast system. |

**Usage**

In `src/app/layout.tsx`, wrap your main content:

```tsx
<PreferencesProvider>
  <ToastProvider>
    <App />
  </ToastProvider>
</PreferencesProvider>
```

### `useToast()`

The `useToast` hook provides access to the toast context from any client component rendered inside `ToastProvider`.

**Return Value**

It returns an object with the following properties:

| Method | Type | Description |
|---|---|---|
| `showSuccess(toast)` | `(toast: ToastInput) => string` | Displays a success toast. Returns a unique ID, or `'suppressed'` in Quiet Mode. |
| `showError(toast)` | `(toast: ToastInput) => string` | Displays an error toast. Returns a unique ID. |
| `dismissToast(id)` | `(id: string) => void` | Manually dismisses a toast by its ID. |
| `toasts` | `ToastRecord[]` | An array of the currently visible toast objects. |

**`ToastInput` Type**

The `showSuccess` and `showError` methods accept an object with the following shape:

| Prop | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | Yes | The main heading for the toast. |
| `description` | `string` | No | Additional explanatory text. |
| `duration` | `number` | No | Auto-dismiss delay in milliseconds. Overrides the user's preference. |
| `action` | `ToastAction` | No | An optional action button. See `ToastAction` below. |

**`ToastAction` Type**

| Prop | Type | Required | Description |
|---|---|---|---|
| `label` | `string` | Yes | The text label for the action button. |
| `onClick` | `() => void` | Yes | Callback fired when the button is clicked. The toast is dismissed immediately after. |

## Features

### Quiet Mode

When the user preference `quietMode` is `true`, `showSuccess()` calls are suppressed. The function returns the string `'suppressed'` and no toast is shown. This allows users to opt out of non-critical notifications.

`showError()` calls are **not** affected by Quiet Mode and will always display a toast.

### Duration Control

The auto-dismiss duration for a toast is determined in the following order of precedence:

1.  **Per-call `duration`**: A `duration` (in milliseconds) passed directly in the `ToastInput` object always takes priority.
2.  **User Preference**: If no per-call duration is provided, the system uses the `toastDuration` value from `usePreferences()`:

    | Preference | Duration |
    |---|---|
    | `'short'` | 2500 ms |
    | `'normal'` | 5000 ms |
    | `'long'` | 10000 ms |
    | `'persistent'` | No auto-dismiss |

### Density

The vertical spacing between stacked toasts is controlled by the user's `toastDensity` preference:

- **`'relaxed'`** (default): `gap-3` (12px)
- **`'compact'`**: `gap-1.5` (6px)

### Toast Eviction

To prevent the UI from being overwhelmed, a maximum of **4** toasts can be visible at once. If a fifth toast is created, the oldest (top-most) toast is automatically dismissed to make room.

### Pause on Hover/Focus

Auto-dismiss timers are automatically paused when a toast is hovered with the mouse or receives keyboard focus. The timer resumes when the interaction ends.

## Accessibility

The toast system is designed to be accessible to screen reader users through several mechanisms.

### `ToastViewport`

The visible container for toasts has `role="region"` and an `aria-label="Notifications"`. Individual toasts have roles based on their variant:

- **Success Toasts**: `role="status"` for polite announcements.
- **Error Toasts**: `role="alert"` for assertive, immediate announcements.

### `ToastAnnouncer`

In addition to the roles on the toasts themselves, `ToastProvider` renders a `ToastAnnouncer` component. This component contains two visually hidden `aria-live` regions to ensure announcements are handled correctly and consistently across screen readers:

- **`aria-live="polite"`**: Announces the title and description of the most recent **success** toast. This does not interrupt the user.
- **`aria-live="assertive"`**: Announces the title and description of the most recent **error** toast. This will interrupt the user to deliver the time-sensitive message.

This dual-region approach provides a robust fallback for assistive technologies that may handle `role="alert"` and `role="status"` on dynamic elements inconsistently.

## Usage Example

```tsx
'use client';

import { useToast } from '@/components/toast/toast-provider';
import { Button } from '@/components/ui/button';

function MyComponent() {
  const { showSuccess, showError } = useToast();

  const handleSuccess = () => {
    showSuccess({
      title: 'Profile Updated',
      description: 'Your changes have been saved successfully.',
    });
  };

  const handleError = () => {
    showError({
      title: 'Connection Lost',
      description: 'Please check your network and try again.',
      action: {
        label: 'Retry',
        onClick: () => console.log('Retrying...'),
      },
    });
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handleSuccess}>Show Success</Button>
      <Button variant="destructive" onClick={handleError}>
        Show Error
      </Button>
    </div>
  );
}
```