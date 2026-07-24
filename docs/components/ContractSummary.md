# ContractSummary

`ContractSummary` is a React component that displays the summary of a contract including its name, total value (formatted according to user preferences), creation date, status, milestone count, and the parties involved.

## Props

The component accepts the following props:

- `contractName` (`string`): The name of the contract.
- `parties` (`ContractParty[]`): An array of parties involved in the contract.
  - `label` (`string`): The role of the party (e.g., "Client", "Freelancer").
  - `address` (`string`): The full wallet address of the party.
- `totalValue` (`number`): The numerical value of the contract.
- `currency` (`string`): The currency code (e.g., "USD", "NGN").
- `status` (`StatusType`): The status of the contract (e.g., "Active", "Pending").
- `createdAt` (`string`): The creation date string.
- `milestoneCount` (`number`): The total count of milestones.

## Features

### Preference-Driven Currency Formatting

The component uses the `formatAmount` function from the preferences context to format the total value according to user preferences:

- **USD format** (default): Formats using `en-US` locale with the caller-provided currency.
- **NGN format**: Forces Nigerian Naira currency using `en-NG` locale, overriding the caller-provided currency.
- **Compact format**: Uses compact notation (e.g., "1.2K") with the caller-provided currency and `en-US` locale.

The formatting is locale-robust and falls back to USD if the provided currency code is invalid.

### Address Truncation

Party addresses are displayed in truncated form using the `truncateAddress` utility function. The full address is only copied to clipboard when the user clicks the copy button.

### Labelled Region Semantics

The component uses proper ARIA semantics for accessibility:
- The main section is wrapped in a `<section>` element with `aria-labelledby="contract-summary-title"`.
- The contract name heading has `id="contract-summary-title"` to establish the labelled region relationship.
- This ensures screen readers can properly announce the section's purpose.

### Milestone Count Pluralization

The component automatically handles singular/plural forms:
- "1 milestone" for a single milestone
- "0 milestones" or "N milestones" for zero or multiple milestones

### Party Count Display

The component shows the number of parties with proper pluralization:
- "1 party" for a single party
- "0 parties" or "N parties" for zero or multiple parties
- Renders "No parties listed" fallback message when the parties array is empty

### Copy to Clipboard

The component supports copying the full address of any party to the system clipboard.
- **Trigger**: Clicking the copy icon next to a party's truncated address.
- **Visual Feedback**: The copy icon temporarily transitions to a green checkmark icon for 2 seconds.
- **Toast Notifications**:
  - Displays a success toast upon successful copy.
  - Displays an error toast if browser clipboard API access fails or is rejected.
- **Accessibility**: The copy control is a standard `<button>` with an explicit `aria-label` identifying the target party (e.g., `Copy Client address to clipboard`).
  When a copy succeeds, the control updates its accessible name to reflect the copied state (e.g., `Client address copied`) for direct screen reader confirmation.
- **Security**: Addresses are sanitized before copying to remove ASCII control characters and Unicode bidirectional text override characters to prevent clipboard injection attacks.

## Accessibility

The component is tested with jest-axe to ensure it has no accessibility violations. Key accessibility features include:
- Proper labelled region semantics via `aria-labelledby`
- Semantic HTML structure with `<section>` and `<h1>`
- Accessible copy buttons with descriptive `aria-label` attributes
- Live region announcements for party count changes
- Status badge with proper `aria-label`
