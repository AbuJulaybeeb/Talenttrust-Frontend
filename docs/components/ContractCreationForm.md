# ContractCreationForm Component

## Overview

`ContractCreationForm` is an accessible modal form component for creating new contracts in the TalentTrust application. It collects contract details including name, parties (with Stellar addresses), total value, and currency, validating all inputs before submission.

## Location

`src/components/ContractCreationForm.tsx`

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onSubmit` | `(contract: Contract) => void` | Yes | Callback invoked with validated contract data when form is submitted successfully |
| `onCancel` | `() => void` | Yes | Callback invoked when the user cancels form submission |

## Features

### Form Fields

1. **Contract Name** (required)
   - Text input for the contract name
   - Validates that value is not empty after trimming whitespace

2. **Total Value** (required)
   - Text input for numeric value
   - Validates that value is a positive number
   - Accepts decimal values

3. **Currency** (required)
   - Select dropdown with options: USD, EUR, GBP, XLM
   - Defaults to USD

4. **Parties** (minimum 2 required)
   - Dynamic list of party entries
   - Each party requires:
     - **Label**: Text identifier (e.g., "Client", "Freelancer")
     - **Stellar Address**: 56-character address starting with 'G'
   - Stellar addresses are validated using `isValidStellarAddress` from `@/lib/stellarAddress`
   - Users can add additional parties beyond the required two
   - Parties can be removed when more than two exist

### Validation Rules

- Contract name is required
- Total value must be a positive numeric value
- Currency is required
- At least two parties with both label and address filled are required
- Partial party entries (only label or only address) trigger validation errors
- All Stellar addresses must pass `isValidStellarAddress` validation
- Empty party entries are filtered out before submission

### Accessibility Features

- **Modal Semantics**: Uses `role="dialog"` with `aria-modal="true"` and `aria-labelledby`
- **Error Handling**: Integrates with `ErrorSummary` component for accessible error presentation
- **Focus Management**: Error summary receives focus when validation fails
- **Field-Level Errors**: Individual field errors are linked via `aria-describedby` and `aria-invalid`
- **Required Fields**: Marked with asterisks and proper ARIA attributes
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Remove Buttons**: Labeled with `aria-label` for screen reader clarity

### Styling

- Modal overlay with semi-transparent black background
- Centered white card with rounded corners and shadow
- Maximum width of 2xl (672px)
- Maximum height of 90vh with vertical scrolling
- Consistent spacing and form field styling
- Error states with red borders and focus rings
- Hover and focus states for all interactive elements

## Usage Example

```tsx
import { ContractCreationForm } from '@/components/ContractCreationForm';
import { saveContract, listContracts } from '@/lib/repository';

function ContractsPage() {
  const [showForm, setShowForm] = useState(false);
  const [contracts, setContracts] = useState(() => listContracts());

  const handleSubmit = (contract: Contract) => {
    saveContract(contract);
    setContracts(listContracts());
    setShowForm(false);
  };

  return (
    <>
      <button onClick={() => setShowForm(true)}>Create Contract</button>
      
      {showForm && (
        <ContractCreationForm
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </>
  );
}
```

## Form Submission Flow

1. User fills in form fields
2. User clicks "Create Contract" button
3. Form validates all fields:
   - If validation fails: `ErrorSummary` displays all errors with links to fields
   - If validation passes: Continue to step 4
4. Empty party entries are filtered out
5. Contract object is constructed with:
   - Trimmed input values
   - Status set to 'Pending'
   - Current date formatted as 'MMM DD, YYYY'
   - Milestone count initialized to 0
6. `onSubmit` callback is invoked with contract data
7. Form is not automatically closed - parent component controls visibility

## Data Structure

### ContractFormData Interface

```typescript
interface ContractFormData {
  contractName: string;
  parties: Array<{ label: string; address: string }>;
  totalValue: string; // String during editing, converted to number on submit
  currency: string;
}
```

### Submitted Contract Type

The form submits a complete `Contract` object conforming to the domain type:

```typescript
{
  contractName: string;
  parties: Array<{ label: string; address: string }>;
  totalValue: number;
  currency: string;
  status: 'Pending';
  createdAt: string; // Formatted date
  milestoneCount: 0;
}
```

## Dependencies

- `@/components/FormField` - Accessible form field wrapper
- `@/components/ErrorSummary` - Error summary display
- `@/lib/stellarAddress` - Stellar address validation
- `@/types/domain` - Contract type definition

## Testing

### Component tests

Covers rendering, required field validation, party management, submission, and accessibility:

See `src/components/__tests__/ContractCreationForm.test.tsx` for full test suite.

### Unit-level validation tests

The pure validation logic in `src/lib/validateContract.ts` is tested independently in:

**`src/lib/validateContract.test.ts`**

These tests cover every rule in the validator:

- **`contractName`**: empty, whitespace-only, and trimmed inputs.
- **`freelancerAddress`**: empty, whitespace-only, malformed G... key, invalid checksum, wrong prefix, and valid keys (including whitespace/normalization). Confirms that empty and structurally-invalid addresses produce **different** error messages, each with exactly one error.
- **`totalValue`**: empty, whitespace, non-numeric (`abc`), zero, negative, `Infinity`, `-Infinity`, and valid decimals.
- **`currency`**: empty, whitespace-only, and trimmed inputs.
- **Multiple errors**: verifies all four fields fail simultaneously in deterministic order.
- **Valid payload**: confirms an empty error array for fully valid input.

These tests protect against regressions in the client-side validation rules and in Stellar address rejection logic. Because `validateContract` is a pure function, the tests require no React context or DOM, making them fast and reliable.

## Best Practices

1. **Always validate on submit**: Client-side validation prevents invalid data from being persisted
2. **Clear user feedback**: `ErrorSummary` provides comprehensive error overview with field links
3. **Preserve user input**: Form state is maintained during validation failures
4. **Flexible party count**: Supports minimum required two parties with ability to add more
5. **Address validation**: Delegates to dedicated `isValidStellarAddress` utility for consistency
6. **Accessibility first**: All interactive elements and states are accessible to screen readers and keyboard users

## Future Enhancements

Potential improvements for future iterations:

- Add loading state during contract persistence
- Support editing existing contracts
- Add milestone configuration during creation
- Implement address book for quick party selection
- Add duplicate party detection
- Support batch address validation
- Add contract templates for common scenarios
