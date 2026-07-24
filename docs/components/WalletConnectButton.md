# WalletConnectButton

`WalletConnectButton` is the header wallet control for TalentTrust. It owns no
wallet state itself; it renders the current state exposed by `useWallet()` and
delegates session actions back to `WalletContext`.

## Location

- Component: `src/components/WalletConnectButton.tsx`
- Provider: `src/contexts/WalletContext.tsx`
- Current root usage: `src/components/HeaderActions.tsx`, mounted from `src/app/layout.tsx`

## Props

`WalletConnectButton` accepts no props.

All state and actions come from `useWallet()`:

| Field | Type | Used for |
|---|---|---|
| `address` | `string \| null` | Chooses the connected branch and supplies the full address copied to the clipboard. The visible address is formatted with `truncateAddress(address)`. |
| `isConnecting` | `boolean` | Disables the connect button and swaps its label to `Connecting...`. |
| `error` | `string \| null` | Chooses the error branch. The current UI displays `Connection Error` and exposes a retry button. |
| `connect` | `() => Promise<void>` | Called by the disconnected button and retry button. |
| `disconnect` | `() => void` | Called by the connected-state disconnect control. |

The component also uses `useToast().showError` for clipboard failures and
`useCopyToClipboard({ delay: 2000 })` for the copied confirmation state.

## Rendered states

| State | Condition | Rendered UI | Primary actions |
|---|---|---|---|
| Disconnected | `!address && !error && !isConnecting` | Blue `Connect Wallet` button with `aria-label="Connect wallet"`. | Click calls `connect()`. |
| Connecting | `isConnecting` and no `address` or `error` | Disabled connect button with a spinner and `Connecting...` text. | No action while disabled. |
| Error | `error` is truthy | Red inline `Connection Error` message with `Retry`. | Retry calls `connect()`. |
| Connected | `address` is truthy | Address pill, copy button, and disconnect button. | Copy writes the full address; disconnect calls `disconnect()`. |

If both `error` and `address` are present, the error branch wins because the
component checks `error` before `address`.

## Clipboard behavior

The connected-state copy button has `aria-label="Copy address to clipboard"`.
It copies the full `address`, not the truncated display value.

| Scenario | Behavior |
|---|---|
| Copy succeeds | Shows the check icon, then resets after 2 seconds. |
| Clipboard API is missing | Shows a `Copy not supported` error toast and does not show the check icon. |
| `writeText` rejects | Shows a `Copy failed` error toast and does not show the check icon. |
| No address is available | `handleCopy` returns without attempting a clipboard write. This is a defensive guard; the copy control is only rendered in the connected branch. |

The component does not log wallet addresses on clipboard failure.

## Minimal usage

`WalletConnectButton` must be rendered under `WalletProvider`, and clipboard
failure toasts require `ToastProvider`.

```tsx
import { ToastProvider } from '@/components/toast/toast-provider';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { WalletProvider } from '@/contexts/WalletContext';

export function Header() {
  return (
    <ToastProvider>
      <WalletProvider>
        <header>
          <WalletConnectButton />
        </header>
      </WalletProvider>
    </ToastProvider>
  );
}
```

In the application, providers are already installed at the root layout, so
callers usually render the component directly:

```tsx
import { WalletConnectButton } from '@/components/WalletConnectButton';

export function HeaderActions() {
  return <WalletConnectButton />;
}
```

## Accessibility contract

- Connect control: `aria-label="Connect wallet"`.
- Retry control: `aria-label="Retry wallet connection"`.
- Copy control: `aria-label="Copy address to clipboard"` and `title="Copy address"`.
- Disconnect control: `aria-label="Disconnect wallet"` and `title="Disconnect wallet"`.
- Connecting spinner is decorative with `aria-hidden="true"`; the visible
  `Connecting...` text communicates progress.
- Focus rings are present on interactive controls.

## Related docs

- `docs/components/WalletContext.md`
- `docs/contexts/wallet-session.md`
- `docs/hooks/useCopyToClipboard.md`
