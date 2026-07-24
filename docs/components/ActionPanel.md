# ActionPanel Component

`ActionPanel` renders the contract actions available from the escrow detail page. The component is intentionally built from native `button` controls so actions remain reachable and operable by keyboard without custom key handling.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `status` | `'Active' \| 'Completed' \| 'Disputed' \| 'Pending'` | Yes | Determines which actions are shown and their tab order. |
| `onSubmitMilestone` | `() => void` | No | Callback for submitting milestone work for approval. |
| `onDispute` | `(reason: string) => void` | No | Callback for confirming a dispute with a trimmed, non-empty reason. |
| `onReleaseFunds` | `() => void` | No | Callback for releasing escrow funds. |
| `onViewSummary` | `() => void` | No | Callback for viewing the completed contract summary. |
| `disabledReasons` | `ActionPanelDisabledReasons` | No | Disables specific visible actions globally and exposes the provided reason through `aria-describedby` (e.g. `submitMilestone`, `releaseFunds`, `dispute`, `viewSummary`). |
| `errorMessage` | `string` | No | Announces transient API or network errors with a `role="alert"` region rendered above the actions. |
| `isLoading` | `boolean` | No | Disables all visible actions while contract or wallet state is loading, providing a universal screen-reader loading reason. |

## Aria Descriptions & Disabled Reasons

The `ActionPanel` manages accessibility heavily through `aria-describedby` for disabled buttons, allowing screen reader users to understand *why* an action cannot be performed:

- **`isLoading`**: When `true`, it renders a hidden span with `id="action-panel-loading-reason"` containing "Action is disabled while contract data is loading." All visible buttons point to this ID via `aria-describedby`.
- **`disabledReasons`**: If `isLoading` is false, the panel checks `disabledReasons` for each action key (e.g., `submitMilestone`). If a reason string is provided, a hidden span is rendered with `id="action-panel-${key}-reason"`, and the button points to this ID via `aria-describedby`.

**Note on Wallet Gating**: Buttons are automatically disabled and receive a `title` (tooltip) if `isWalletConnected` is false, overriding individual `disabledReasons` visually but still preserving the accessible structure.

The inline dispute form also re-checks the wallet connection at submit time before invoking `onDispute(reason)`. This protects the mid-flow disconnect case where a user opens the form while connected, then the wallet session expires or disconnects before the final submit. When blocked, the form keeps focus on the reason field and announces the wallet error through the existing `role="alert"` dispute validation region.

## Accessibility

- Buttons use browser-native keyboard support for `Tab`, `Enter`, and `Space`.
- Visible focus rings use high-contrast Tailwind `focus-visible:outline` utilities and are not removed in any state.
- Actions are rendered in contract workflow order: submit milestone, release funds, dispute, then summary when applicable.
- Submit Milestone opens the shared confirmation dialog before invoking the callback, then shows a success toast once the action is confirmed.
- Dispute opens an inline reason form. The submitted reason is validated using the shared `validateDisputeReason` utility from [disputeReason.ts](file:///c:/Users/USER/Desktop/Talenttrust-Frontend/src/lib/disputeReason.ts), which enforces `DISPUTE_REASON_MAX_LENGTH` (500 characters). The submitted reason is trimmed, must be non-empty, and is only passed to `onDispute` while a wallet address is still connected.
- Unavailable actions stay visible as disabled buttons with an accessible reason. Use `disabledReasons` for states such as no wallet, missing permissions, pending API responses, or unmet milestone conditions.
- Loading states disable all visible actions and describe that contract data is still loading.
- Error states are announced through `role="alert"` without moving focus or changing the action order.
- **Dispute Reason Character Counter**: The character counter in the inline dispute form is associated with the textarea via `aria-describedby` (`id="dispute-reason-counter"`). The current character count is announced to screen reader users using the format `"X of 500 characters"` in an `aria-live` region:
  - **Debouncing/Throttling**: To avoid screen reader spam, updates are debounced by `1000ms` when typing non-boundary characters. Immediate announcements occur when pausing typing, or when crossing meaningful boundaries (multiples of 50, multiples of 10 when remaining count is $\le 50$, or every character when $\le 10$).
  - **Assertive Escalation**: The live region defaults to `aria-live="polite"`, but escalates to `aria-live="assertive"` when within the threshold of $50$ characters or fewer remaining.
  - **Clean State**: The live region is only rendered when the form is open, ensuring it remains quiet when closed.

## Focus Restoration

When a confirmation-gated action (Submit Milestone or Release Funds) opens the `ConfirmDialog`, focus moves into the dialog per the ARIA dialog pattern. When the dialog closes — by confirming, cancelling, or pressing Escape — focus is restored to the button that originally opened it. The Dispute action uses an inline form instead; cancelling or submitting that form restores focus to the Dispute button, while validation failures keep focus on the textarea.

**Implementation detail:** `handleOpenConfirm` captures `event.currentTarget` into a `triggerElementRef` at the moment the button is clicked. Both `handleConfirm` and `handleCancel` call `triggerElementRef.current?.focus()` after clearing the dialog state. This is intentionally done via event capture rather than static `ref` props on each button, which would cause the last-rendered button to always win when multiple confirmation-gated buttons are visible at the same time (e.g. Release Funds and Dispute on `Active`/`Pending` status).

```
User clicks "Release Funds"
  → handleOpenConfirm('release', event)
  → triggerElementRef.current = event.currentTarget  ← captured here
  → dialog opens, focus moves to Cancel button

User clicks Cancel (or presses Escape)
  → handleCancel()
  → setConfirmAction(null)       ← dialog unmounts
  → triggerElementRef.current?.focus()  ← focus back to Release Funds ✓
```

This satisfies WCAG 2.1 SC 3.2.2 (On Input) and the WAI-ARIA Authoring Practices Guide dialog pattern requirement that focus returns to the triggering element after dialog dismissal.



| Status | Visible actions |
|--------|-----------------|
| `Active` | Submit Milestone, Release Funds, Dispute |
| `Pending` | Release Funds, Dispute |
| `Disputed` | Dispute |
| `Completed` | View Summary |

## Usage Example

```tsx
import ActionPanel from '@/components/ActionPanel';

export default function ContractDetail({ contractData, isLoading, errorMessage }) {
  const handleSubmitMilestone = () => { /* ... */ };
  const handleReleaseFunds = () => { /* ... */ };
  const handleDispute = () => { /* ... */ };
  const handleViewSummary = () => { /* ... */ };

  return (
    <ActionPanel
      status={contractData?.status || 'Active'}
      onSubmitMilestone={handleSubmitMilestone}
      onReleaseFunds={handleReleaseFunds}
      onDispute={handleDispute}
      onViewSummary={handleViewSummary}
      isLoading={isLoading}
      errorMessage={errorMessage}
      disabledReasons={{
        submitMilestone: !contractData?.canSubmit ? 'You do not have permission to submit milestones.' : undefined,
      }}
    />
  );
}
```

## Testing Notes

The component tests cover:

- Action rendering and callback behavior for active and completed contracts.
- Confirmable Submit Milestone, including success toast feedback and cancel/disconnected-wallet cases.
- Logical button order for keyboard navigation.
- Visible focus ring classes on every enabled action.
- Disabled action semantics and screen-reader descriptions.
- Loading, slow-network error, and missing-handler edge cases.
- Inline dispute validation: empty reason, whitespace-only reason, 500-character cap, trimmed valid submission, disconnect-then-submit wallet guard, and reconnect-then-submit recovery.
- **Focus restoration:** After cancel, confirm, or Escape on each confirmation-gated action, focus lands on the exact button that opened the dialog; the inline dispute form also restores focus to the Dispute trigger after cancel or valid submit.
