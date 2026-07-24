# FormField Component

The `FormField` component is a wrapper for form controls that provides an accessible label, optional helper text, and an optional error message. It handles all of the ARIA wiring (`aria-describedby`, `aria-invalid`, `aria-required`) automatically, so individual forms don't need to reimplement accessibility plumbing for every input.

Use this component to wrap any single interactive form control (`input`, `select`, `textarea`, etc.) inside a form. It is used throughout `CreateContractForm` and `MilestoneCreationForm`.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `label` | `string` | Yes | The text content for the label element. |
| `id` | `string` | Yes | The unique identifier for the form control. Linked with the label's `htmlFor` attribute and passed down to the child. |
| `error` | `string` | No | Optional error message. When provided, sets `aria-invalid="true"` on the child, appends error styling, and renders a `role="alert"` message below the field. |
| `helperText` | `string` | No | Optional helper text describing the field's purpose or constraints. |
| `children` | `React.ReactElement` | Yes | A single interactive form element (input, select, textarea, etc.) that will have accessibility props injected. |
| `required` | `boolean` | No | If `true`, renders a visual `*` indicator in the label, hidden from screen readers via `aria-hidden="true"`. |

## Prop Behavior

- `children` must be a **single** React element — `FormField` clones it and injects `id`, `aria-describedby`, `aria-invalid`, `aria-required`, and `className`.
- `id` is passed to the child and used to derive `${id}-error` and `${id}-helper` ids for the error and helper text elements.
- `aria-describedby` on the child is built from whichever of `error` / `helperText` are present (error id first, then helper id), space-separated. It's omitted entirely if neither is present.
- `aria-invalid` on the child is `"true"` when `error` is set, otherwise `"false"`.
- The required indicator is shown whenever `required` is `true` **or** the child element itself already has `required` or `aria-required="true"` set — so a plain `<input required />` inside `FormField` will show the `*` even without passing the `required` prop explicitly.
- When `error` is present, `border-red-500 focus:ring-red-500 focus:border-red-500` is appended to the child's existing `className` (existing classes are preserved).
- The error message (`role="alert"`) and helper text render below the field; both can be shown at the same time.

## Usage Examples

### Basic Field

```tsx
import { FormField } from '@/components/FormField';

<FormField id="contractName" label="Contract name" required>
  <input
    type="text"
    value={contractName}
    onChange={(e) => setContractName(e.target.value)}
  />
</FormField>
```

### Field with Helper Text

```tsx
<FormField
  id="freelancerAddress"
  label="Freelancer Stellar address"
  helperText="Must be a valid Stellar public key starting with G"
  required
>
  <input
    type="text"
    value={freelancerAddress}
    onChange={(e) => setFreelancerAddress(e.target.value)}
  />
</FormField>
```

### Field with Error

```tsx
<FormField
  id="totalValue"
  label="Total value"
  error={errors.find((e) => e.fieldId === 'totalValue')?.message}
  required
>
  <input
    type="number"
    value={totalValue}
    onChange={(e) => setTotalValue(e.target.value)}
  />
</FormField>
```

### Field Wrapping a Select

```tsx
<FormField
  id="currency"
  label="Currency"
  error={errors.find((e) => e.fieldId === 'currency')?.message}
  required
>
  <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
    {/* options */}
  </select>
</FormField>
```

### Optional Field (No `required`)

```tsx
<FormField
  id="milestone-dueDate"
  label="Due Date"
  helperText="Optional — e.g., Jun 1, 2025"
>
  <input
    type="text"
    value={dueDate}
    onChange={(e) => setDueDate(e.target.value)}
  />
</FormField>
```

## States

| State | Trigger | Rendered output |
|-------|---------|------------------|
| Default | No `error`, no `helperText` | Label + child only. No `aria-describedby`. `aria-invalid="false"`. |
| Helper text | `helperText` set | Helper `<p>` rendered with id `${id}-helper`; child gets `aria-describedby` pointing to it. |
| Error | `error` set | Error `<p role="alert">` rendered with id `${id}-error`; child gets `aria-describedby`, `aria-invalid="true"`, and red border/ring classes appended. |
| Helper + Error | Both set | Both ids present in `aria-describedby`, in the order `${id}-error ${id}-helper`. |
| Required | `required` prop, or child already has `required`/`aria-required` | Visual `*` appended to the label, `aria-hidden="true"`. |

## Current Usage

| Form | File | Fields wrapped |
|------|------|-----------------|
| Contract creation | `src/components/contracts/CreateContractForm.tsx` (also re-exported as `src/components/ContractCreationForm.tsx`) | Contract name, freelancer Stellar address, total value, currency |
| Milestone creation | `src/components/milestones/MilestoneCreationForm.tsx` | Title, payout amount, currency, status, due date |

## Accessibility

- Label and control are linked via `htmlFor` / `id`.
- Helper text and error message ids are wired into the child's `aria-describedby` automatically — callers never set this manually.
- `aria-invalid` reflects error state so assistive tech announces invalid fields.
- The error message uses `role="alert"` so it is announced immediately when it appears (e.g. after a failed submit).
- The required asterisk is `aria-hidden="true"`; screen readers instead rely on `aria-required`, which `FormField` sets on the child based on the `required` prop or the child's own `required`/`aria-required` attributes.
- Covered by the shared a11y regression suite (`src/components/__tests__/a11y.test.tsx`) across default and errored states.

## Testing

Unit tests live in `src/components/__tests__/FormField.test.tsx` and cover:

- Default rendering with no error or helper text (no `aria-describedby`, `aria-invalid="false"`).
- Helper text rendering and `aria-describedby` wiring.
- Error rendering: `role="alert"`, `aria-describedby`, `aria-invalid="true"`, and appended error classes.
- Combined helper + error `aria-describedby` wiring.
- Required marker rendering with `aria-hidden="true"`.
- Preservation of the child's existing `className` when there is no error.
- Zero a11y violations in both the default and errored (with helper text and required) states via `testA11y`.

When adding a new prop or behavior, extend this file and update the a11y suite if the new state changes rendered DOM.
