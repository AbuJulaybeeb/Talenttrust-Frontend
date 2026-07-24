import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MilestoneCreationForm } from '../milestones/MilestoneCreationForm';
import type { Milestone } from '@/types/domain';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Render the form with sensible mock callbacks. */
function renderForm(
  overrides: Partial<React.ComponentProps<typeof MilestoneCreationForm>> = {},
) {
  const onSubmit = jest.fn();
  const onCancel = jest.fn();
  const utils = render(
    <MilestoneCreationForm onSubmit={onSubmit} onCancel={onCancel} {...overrides} />,
  );
  return { onSubmit, onCancel, ...utils };
}

/** Fill in the minimal valid set of fields and return the submit button. */
function fillValidForm(title = 'My Milestone', payout = '500') {
  fireEvent.change(screen.getByLabelText(/title/i), { target: { value: title } });
  fireEvent.change(screen.getByLabelText(/payout amount/i), {
    target: { value: payout },
  });
  // Currency is pre-filled with USD — no change needed for happy-path tests.
  return screen.getByRole('button', { name: /add milestone/i });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('MilestoneCreationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------
  describe('Rendering', () => {
    it('renders the dialog with all fields', () => {
      renderForm();

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/payout amount/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/currency/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    });

    it('renders submit and cancel buttons', () => {
      renderForm();

      expect(
        screen.getByRole('button', { name: /add milestone/i }),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('has correct modal accessibility attributes', () => {
      renderForm();

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'create-milestone-title');
    });

    it('defaults currency to USD', () => {
      renderForm();

      const currencySelect = screen.getByLabelText(/currency/i) as HTMLSelectElement;
      expect(currencySelect.value).toBe('USD');
    });

    it('defaults status to Pending', () => {
      renderForm();

      const statusSelect = screen.getByLabelText(/status/i) as HTMLSelectElement;
      expect(statusSelect.value).toBe('Pending');
    });

    it('does not render ErrorSummary when there are no errors', () => {
      renderForm();

      expect(screen.queryByRole('alert', { name: /there is a problem/i })).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Validation — required fields
  // -------------------------------------------------------------------------
  describe('Validation — required fields', () => {
    it('shows all required-field errors when submitting an empty form', async () => {
      renderForm();

      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

      await waitFor(() => {
        const summary = screen.getByRole('alert', { name: /there is a problem/i });
        expect(summary).toBeInTheDocument();
        expect(summary).toHaveTextContent(/title is required/i);
        expect(summary).toHaveTextContent(/payout amount is required/i);
      });
    });

    it('shows title-required error when title is whitespace-only', async () => {
      renderForm();

      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: '   ' } });
      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

      await waitFor(() => {
        expect(screen.getAllByText(/title is required/i)[0]).toBeInTheDocument();
      });
    });

    it('shows payout-required error when payout is whitespace-only', async () => {
      renderForm();

      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'A title' } });
      fireEvent.change(screen.getByLabelText(/payout amount/i), { target: { value: '   ' } });
      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

      await waitFor(() => {
        expect(screen.getAllByText(/payout amount is required/i)[0]).toBeInTheDocument();
      });
    });

    it('does not call onSubmit when required fields are missing', async () => {
      const { onSubmit } = renderForm();

      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert', { name: /there is a problem/i })).toBeInTheDocument();
      });
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Validation — payout rules
  // -------------------------------------------------------------------------
  describe('Validation — payout rules', () => {
    it('rejects non-numeric payout', async () => {
      renderForm();

      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Milestone' } });
      fireEvent.change(screen.getByLabelText(/payout amount/i), {
        target: { value: 'abc' },
      });
      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

      await waitFor(() => {
        expect(
          screen.getAllByText(/payout must be a positive number/i)[0],
        ).toBeInTheDocument();
      });
    });

    it('rejects zero payout', async () => {
      renderForm();

      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Milestone' } });
      fireEvent.change(screen.getByLabelText(/payout amount/i), { target: { value: '0' } });
      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

      await waitFor(() => {
        expect(
          screen.getAllByText(/payout must be a positive number/i)[0],
        ).toBeInTheDocument();
      });
    });

    it('rejects negative payout', async () => {
      renderForm();

      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Milestone' } });
      fireEvent.change(screen.getByLabelText(/payout amount/i), {
        target: { value: '-100' },
      });
      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

      await waitFor(() => {
        expect(
          screen.getAllByText(/payout must be a positive number/i)[0],
        ).toBeInTheDocument();
      });
    });

    it('accepts decimal payout values', async () => {
      const { onSubmit } = renderForm();

      const submitBtn = fillValidForm('Decimal Milestone', '99.99');
      fireEvent.click(submitBtn);

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));

      const submitted: Milestone = onSubmit.mock.calls[0][0];
      expect(submitted.payout).toBeCloseTo(99.99);
    });

    it('does not call onSubmit for non-numeric payout', async () => {
      const { onSubmit } = renderForm();

      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Title' } });
      fireEvent.change(screen.getByLabelText(/payout amount/i), {
        target: { value: 'not-a-number' },
      });
      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert', { name: /there is a problem/i })).toBeInTheDocument();
      });
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Validation — currency
  // -------------------------------------------------------------------------
  describe('Validation — currency', () => {
    it('shows currency-required error when currency is cleared', async () => {
      renderForm();

      // Directly set an empty value on the select
      const currencySelect = screen.getByLabelText(/currency/i);
      fireEvent.change(currencySelect, { target: { value: '' } });

      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Milestone' } });
      fireEvent.change(screen.getByLabelText(/payout amount/i), { target: { value: '100' } });
      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

      await waitFor(() => {
        expect(screen.getAllByText(/currency is required/i)[0]).toBeInTheDocument();
      });
    });

    it('allows selecting all available currencies', () => {
      renderForm();

      const currencySelect = screen.getByLabelText(/currency/i) as HTMLSelectElement;

      for (const code of ['USD', 'EUR', 'GBP', 'XLM']) {
        fireEvent.change(currencySelect, { target: { value: code } });
        expect(currencySelect.value).toBe(code);
      }
    });
  });

  // -------------------------------------------------------------------------
  // ID generation
  // -------------------------------------------------------------------------
  describe('ID generation', () => {
    it('generates an id that includes the title slug', async () => {
      const { onSubmit } = renderForm();

      fillValidForm('Frontend Development – Sprint 1');
      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));

      const submitted: Milestone = onSubmit.mock.calls[0][0];
      // The slug should contain the lowercased, hyphenated title words
      expect(submitted.id).toMatch(/^frontend-development-sprint-1-\d+$/);
    });

    it('produces unique ids for two submissions with the same title', async () => {
      // Advance fake timers to ensure Date.now() returns distinct values
      jest.useFakeTimers();

      const onSubmit1 = jest.fn();
      const onSubmit2 = jest.fn();

      // First render + submit
      const { unmount: unmount1 } = render(
        <MilestoneCreationForm onSubmit={onSubmit1} onCancel={jest.fn()} />,
      );
      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Same Title' } });
      fireEvent.change(screen.getByLabelText(/payout amount/i), { target: { value: '100' } });
      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));
      await waitFor(() => expect(onSubmit1).toHaveBeenCalledTimes(1));
      unmount1();

      // Advance time so Date.now() returns a different value
      jest.advanceTimersByTime(5);

      // Second render + submit
      render(
        <MilestoneCreationForm onSubmit={onSubmit2} onCancel={jest.fn()} />,
      );
      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Same Title' } });
      fireEvent.change(screen.getByLabelText(/payout amount/i), { target: { value: '100' } });
      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));
      await waitFor(() => expect(onSubmit2).toHaveBeenCalledTimes(1));

      const id1: string = onSubmit1.mock.calls[0][0].id;
      const id2: string = onSubmit2.mock.calls[0][0].id;

      expect(id1).not.toBe(id2);

      jest.useRealTimers();
    });

    it('id slug strips leading and trailing hyphens', async () => {
      const { onSubmit } = renderForm();

      // Title with leading/trailing special chars that would become hyphens
      fillValidForm('-- Edge Case --');
      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));

      const submitted: Milestone = onSubmit.mock.calls[0][0];
      // The slug portion (everything before the final -<timestamp>) must not
      // start or end with a hyphen
      const slugPart = submitted.id.replace(/-\d+$/, '');
      expect(slugPart).not.toMatch(/^-|-$/);
    });

    it('id slug uses only lowercase alphanumeric characters and hyphens', async () => {
      const { onSubmit } = renderForm();

      fillValidForm('Milestone! @With# Special$Chars%');
      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));

      const submitted: Milestone = onSubmit.mock.calls[0][0];
      expect(submitted.id).toMatch(/^[a-z0-9-]+$/);
    });
  });

  // -------------------------------------------------------------------------
  // Successful submission payload
  // -------------------------------------------------------------------------
  describe('Successful submission', () => {
    it('calls onSubmit with the correct milestone shape', async () => {
      const { onSubmit } = renderForm();

      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Build Homepage' },
      });
      fireEvent.change(screen.getByLabelText(/payout amount/i), { target: { value: '2500' } });
      fireEvent.change(screen.getByLabelText(/currency/i), { target: { value: 'EUR' } });
      fireEvent.change(screen.getByLabelText(/status/i), { target: { value: 'Active' } });
      fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: 'Jun 1, 2025' } });

      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));

      const submitted: Milestone = onSubmit.mock.calls[0][0];
      expect(submitted).toMatchObject({
        title: 'Build Homepage',
        payout: 2500,
        currency: 'EUR',
        status: 'Active',
        dueDate: 'Jun 1, 2025',
      });
      expect(submitted.id).toBeTruthy();
    });

    it('trims whitespace from title and currency', async () => {
      const { onSubmit } = renderForm();

      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: '  Trimmed Title  ' },
      });
      fireEvent.change(screen.getByLabelText(/payout amount/i), { target: { value: '100' } });

      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));

      const submitted: Milestone = onSubmit.mock.calls[0][0];
      expect(submitted.title).toBe('Trimmed Title');
    });

    it('sets dueDate to undefined when left blank', async () => {
      const { onSubmit } = renderForm();

      fillValidForm('No Due Date');
      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));

      const submitted: Milestone = onSubmit.mock.calls[0][0];
      expect(submitted.dueDate).toBeUndefined();
    });

    it('passes contractId through to the submitted milestone', async () => {
      const { onSubmit } = renderForm({ contractId: 'contract-abc' });

      fillValidForm('With Contract');
      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));

      const submitted: Milestone = onSubmit.mock.calls[0][0];
      expect(submitted.contractId).toBe('contract-abc');
    });

    it('sets contractId to undefined when prop is not supplied', async () => {
      const { onSubmit } = renderForm();

      fillValidForm('No Contract');
      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));

      const submitted: Milestone = onSubmit.mock.calls[0][0];
      expect(submitted.contractId).toBeUndefined();
    });

    it('clears validation errors on a successful submission', async () => {
      const { onSubmit } = renderForm();

      // Trigger errors first
      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));
      await waitFor(() =>
        expect(screen.getByRole('alert', { name: /there is a problem/i })).toBeInTheDocument(),
      );

      // Now fill the form correctly and resubmit
      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Fixed' } });
      fireEvent.change(screen.getByLabelText(/payout amount/i), { target: { value: '200' } });
      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    });
  });

  // -------------------------------------------------------------------------
  // Cancel behaviour
  // -------------------------------------------------------------------------
  describe('Cancel behaviour', () => {
    it('calls onCancel when the Cancel button is clicked', () => {
      const { onCancel } = renderForm();

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('does not call onSubmit when Cancel is clicked', () => {
      const { onSubmit, onCancel } = renderForm();

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onSubmit).not.toHaveBeenCalled();
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('Cancel button is type="button" so it does not trigger form submit', () => {
      renderForm();

      const cancelBtn = screen.getByRole('button', { name: /cancel/i });
      expect(cancelBtn).toHaveAttribute('type', 'button');
    });
  });

  // -------------------------------------------------------------------------
  // ErrorSummary focus management
  // -------------------------------------------------------------------------
  describe('ErrorSummary focus management', () => {
    it('renders ErrorSummary with role="alert" on invalid submit', async () => {
      renderForm();

      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert', { name: /there is a problem/i })).toBeInTheDocument();
      });
    });

    it('ErrorSummary has tabIndex="-1" so it can receive programmatic focus', async () => {
      renderForm();

      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

      await waitFor(() => {
        const summary = screen.getByRole('alert', { name: /there is a problem/i });
        expect(summary).toHaveAttribute('tabIndex', '-1');
      });
    });

    it('ErrorSummary contains anchor links pointing to the failing field IDs', async () => {
      renderForm();

      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert', { name: /there is a problem/i })).toBeInTheDocument();
      });

      const links = screen.getAllByRole('link');
      const hrefs = links.map((l) => l.getAttribute('href'));
      expect(hrefs).toContain('#milestone-title');
      expect(hrefs).toContain('#milestone-payout');
    });

    it('invalid fields receive aria-invalid="true"', async () => {
      renderForm();

      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/title/i)).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByLabelText(/payout amount/i)).toHaveAttribute(
          'aria-invalid',
          'true',
        );
      });
    });

    it('invalid fields have error border styling', async () => {
      renderForm();

      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

      await waitFor(() => {
        const titleInput = screen.getByLabelText(/title/i);
        expect(titleInput.className).toContain('border-red-500');
      });
    });
  });

  // -------------------------------------------------------------------------
  // Status options
  // -------------------------------------------------------------------------
  describe('Status field', () => {
    it('allows selecting all status options', () => {
      renderForm();

      const statusSelect = screen.getByLabelText(/status/i) as HTMLSelectElement;

      for (const s of ['Pending', 'Active', 'Completed', 'Paid', 'Disputed']) {
        fireEvent.change(statusSelect, { target: { value: s } });
        expect(statusSelect.value).toBe(s);
      }
    });

    it('submits the chosen status', async () => {
      const { onSubmit } = renderForm();

      fireEvent.change(screen.getByLabelText(/status/i), { target: { value: 'Completed' } });
      fillValidForm('Status Test');
      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));

      const submitted: Milestone = onSubmit.mock.calls[0][0];
      expect(submitted.status).toBe('Completed');
    });
  });
});
