# WalletContext

`src/contexts/WalletContext.tsx`

Provides global Stellar wallet connection state to the entire application via
React Context. Consumed through the `useWallet` hook; the raw context object
is not exported for direct use.

---

> ⚠️ **Mock implementation notice**
>
> `connect()` is **currently mocked**. It simulates a 1-second delay and always
> resolves with the hard-coded Stellar placeholder address exported as
> `MOCKED_STELLAR_ADDRESS`. No real Freighter or any other wallet provider is
> wired up yet. The public `WalletContextType` API will remain unchanged when
> real integration lands; only the internals of `connect()` will change.

---

## Provider: `WalletProvider`

```tsx
<WalletProvider idleTimeout={300_000}>
  {children}
</WalletProvider>
```

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | React subtree that requires wallet context. |
| `idleTimeout` | `number` | `preferences.idleDisconnectMs` | Inactivity duration in milliseconds before the session is automatically terminated. `0` disables the behaviour. When omitted, falls back to the value from `PreferencesProvider`. |

### Placement in `src/app/layout.tsx`

`WalletProvider` is rendered at the root layout level, inside `ToastProvider`
and `PreferencesProvider`, so every page and component in the application can
access wallet state without prop-drilling:

```
RootLayout
└── PreferencesProvider
    └── ToastProvider
        └── WalletProvider   ← global wallet state
            └── {children}   ← all app pages and components
```

```tsx
// src/app/layout.tsx (simplified)
import { WalletProvider } from '@/contexts/WalletContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PreferencesProvider>
          <ToastProvider>
            <WalletProvider>
              {children}
            </WalletProvider>
          </ToastProvider>
        </PreferencesProvider>
      </body>
    </html>
  );
}
```

### Idle auto-disconnect

When `idleTimeout > 0`, the provider attaches passive event listeners for
`pointermove`, `keydown`, `visibilitychange`, `mousedown`, and `touchstart`.
If none of these events fires within `idleTimeout` milliseconds, `disconnect()`
is called automatically and a "Session expired" success toast is displayed. The
timer resets on each activity event and is fully cleaned up when the component
unmounts.

Recommended production value: `900000` (15 minutes).

```tsx
<WalletProvider idleTimeout={900000}>
  {children}
</WalletProvider>
```

---

## Hook: `useWallet`

```tsx
const { address, isConnecting, error, connect, disconnect } = useWallet();
```

Returns the current `WalletContextType` value. Must be called inside a
`<WalletProvider>` subtree.

### Safety guard

If `useWallet` is called outside of a `<WalletProvider>`, it throws immediately:

```
Error: useWallet must be used within a WalletProvider
```

This makes misconfigured component trees fail fast and visibly during development
rather than silently propagating `undefined` values.

```tsx
// ❌ This throws: "useWallet must be used within a WalletProvider"
function Broken() {
  const { address } = useWallet(); // no WalletProvider above this
  return <p>{address}</p>;
}
```

---

## `WalletContextType` API reference

### `address`

```ts
address: string | null
```

The connected Stellar public key (G-address), or `null` when no wallet is
connected. Rehydrated from `localStorage` (`wallet_connected_address`) on
client mount, so the session survives page refreshes without requiring a fresh
`connect()` call.

> **Mock value:** `MOCKED_STELLAR_ADDRESS` =
> `"GAAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQDZ7H"`

---

### `isConnecting`

```ts
isConnecting: boolean
```

`true` while a connection attempt is in progress — from the moment `connect()`
is called until it either succeeds or fails. Use this to disable the connect
button and show a loading indicator in the UI.

---

### `error`

```ts
error: string | null
```

Human-readable error message from the most recent failed `connect()` attempt,
or `null` when no error is present. Cleared automatically at the start of each
new `connect()` call.

When a connection failure occurs, the provider does **two** things:

1. **Sets `error`** — so consuming components (e.g. `WalletConnectButton`) can
   render an inline message next to the button.
2. **Calls `showError` from `ToastProvider`** — so screen-reader users receive
   an assertive `role="alert"` announcement via the `aria-live="assertive"`
   region without relying on the inline element being visible or focused.

Known error string constants (exported from `WalletContext.tsx`):

| Constant | Value | Cause |
|---|---|---|
| `FREIGHTER_NOT_INSTALLED` | `"Freighter wallet is not installed…"` | Browser extension not detected. |
| `USER_REJECTED` | `"User rejected the connection request."` | User dismissed the Freighter approval popup. |

---

### `connect`

```ts
connect: () => Promise<void>
```

Initiates a wallet connection attempt. Sets `isConnecting` to `true` for the
duration and resets it in the `finally` block regardless of outcome. The
returned `Promise` always resolves; errors are surfaced through the `error`
field **and via an accessible error toast** (`showError`) rather than via rejection.

**State transitions:**

1. Sets `isConnecting` to `true`.
2. Clears `error` to `null`.
3. Attempts to connect (see mock notice below).
4. On success: sets `address` and persists it to `localStorage`.
5. On failure: sets `error` and fires a `showError` toast.
6. Sets `isConnecting` to `false` in all cases.

> ⚠️ **Temporary mock — real Freighter integration pending.**
>
> The current implementation does **not** contact any wallet extension. It:
>
> 1. Waits **1 second** via `setTimeout` to simulate latency.
> 2. Sets `address` to `MOCKED_STELLAR_ADDRESS` and persists it to `localStorage`.
>
> The intended real implementation will:
>
> 1. Guard against server-side rendering (`typeof window === 'undefined'`).
> 2. Detect `window.freighter`; surface `FREIGHTER_NOT_INSTALLED` if absent.
> 3. Call `window.freighter.requestAccess()`; map a user rejection to `USER_REJECTED`.
> 4. Validate and persist the returned Stellar public key.

---

### `disconnect`

```ts
disconnect: () => void
```

Terminates the active wallet session synchronously:

1. Sets `address` to `null`.
2. Removes `wallet_connected_address` from `localStorage`.
3. Cancels any running inactivity-timeout timer.

---

## Named exports

| Export | Kind | Description |
|---|---|---|
| `WalletProvider` | Component | Context provider — place at the root of the app. |
| `useWallet` | Hook | Primary consumer API; throws outside `WalletProvider`. |
| `WalletContextType` | TypeScript type | Shape of the context value. |
| `MOCKED_STELLAR_ADDRESS` | Constant | Hard-coded G-address used by the mock `connect()`. |
| `FREIGHTER_NOT_INSTALLED` | Constant | Error string: extension not detected. |
| `USER_REJECTED` | Constant | Error string: user dismissed the approval prompt. |

---

## Full usage example

```tsx
'use client';

import { useWallet } from '@/contexts/WalletContext';

export default function ConnectButton() {
  const { address, isConnecting, error, connect, disconnect } = useWallet();

  if (isConnecting) {
    return <p aria-live="polite">Connecting to wallet…</p>;
  }

  if (error) {
    return (
      <div role="alert">
        <p>Connection error: {error}</p>
        <button onClick={connect}>Retry</button>
      </div>
    );
  }

  if (address) {
    return (
      <button onClick={disconnect}>
        Disconnect ({address.slice(0, 6)}…)
      </button>
    );
  }

  return <button onClick={connect}>Connect Wallet</button>;
}
```

---

## Related files

| File | Role |
|---|---|
| `src/app/layout.tsx` | Mounts `WalletProvider` at the application root. |
| `src/components/WalletConnectButton.tsx` | Primary UI consumer of `useWallet`. |
| `src/lib/safeStorage.ts` | `getItem` / `setItem` / `removeItem` wrappers used for address persistence. |
| `src/lib/preferences.tsx` | Supplies the default `idleDisconnectMs` preference consumed by `WalletProvider`. |
| `docs/components/WalletConnectButton.md` | UI component documentation for the connect button. |

---

## Testing

Tests live in `src/contexts/__tests__/WalletContext.test.tsx` and use Jest with
React Testing Library.

Covered scenarios:

- `connect()` sets `isConnecting` during the attempt and populates `address` after success.
- `connect()` sets a valid Stellar G-address that passes `isValidStellarAddress`.
- Each new `connect()` call clears `error` before attempting.
- `connect()` returns a Promise that always resolves, never rejects.
- `disconnect()` clears `address` back to `null`.
- `disconnect()` without a prior `connect()` is a no-op (address stays `null`).
- `disconnect()` does not affect `isConnecting` or `error` state.
- Reconnect after disconnect populates address again.
- Idle auto-disconnect fires after the configured timeout.
- Activity events reset the idle timer.
- `idleTimeout={0}` disables auto-disconnect entirely.
- `address` is rehydrated from `localStorage` on mount.
- `connect()` persists the address to `localStorage`.
- `disconnect()` removes the address from `localStorage`.
- Idle timeout disconnect also clears `localStorage`.
- `useWallet()` called outside a `WalletProvider` throws the expected error.
- The thrown error is an instance of `Error`.
- No error toast fires on a successful `connect()`.
- Inline `error` state is set on a failed `connect()`.
- All `WalletContextType` fields exist at runtime.

Run the tests:

```bash
npm test -- --testPathPattern=WalletContext
```
