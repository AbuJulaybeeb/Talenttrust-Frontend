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

### Copy to Clipboard

The component supports copying the full address of any party to the system clipboard.
- **Trigger**: Clicking the copy icon next to a party's truncated address.
- **Visual Feedback**: The copy icon temporarily transitions to a green checkmark icon for 2 seconds.
- **Toast Notifications**:
  - Displays a success toast upon successful copy.
  - Displays an error toast if browser clipboard API access fails or is rejected.
- **Accessibility**: The copy control is a standard `<button>` with an explicit `aria-label` identifying the target party (e.g., `Copy Client address to clipboard`).
  When a copy succeeds, the control updates its accessible name to reflect the copied state (e.g., `Client address copied`) for direct screen reader confirmation.
