import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MilestoneCreationForm } from '../milestones/MilestoneCreationForm';
import type { Milestone } from '@/types/domain';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function fillValidForm() {
  fireEvent.change(screen.getByLabelText(/title/i), {
    target: { value: 'My Milestone' },
  });
  fireEvent.change(screen.getByLabelText(/payout amount/i), {
    target: { value: '500' },
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('MilestoneCreationForm — empty & error states', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Existing behaviour (regression guard)
  // -------------------------------------------------------------------------
  describe('existing behaviour', () => {
    it('renders the dialog with all fields', () => {
      renderForm();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/payout amount/i)).toBeInTheDocument();
    });

    it('calls onCancel when cancel is clicked', () => {
      const { onCancel } = renderForm();
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('shows field validation errors on empty submit', async () => {
      renderForm();
      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));
      await waitFor(() => {
        expect(screen.getByRole('alert', { name: /there is a problem/i })).toBeInTheDocument();
      });
    });

    it('calls onSubmit with correct data on valid submission', async () => {
      const { onSubmit } = renderForm();
      fillValidForm();
      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1);
      });
      const ms: Milestone = onSubmit.mock.calls[0][0];
      expect(ms.title).toBe('My Milestone');
      expect(ms.payout).toBe(500);
    });
  });

  // -------------------------------------------------------------------------
  // Error state — submission failure
  // -------------------------------------------------------------------------
  describe('error state — submission failure', () => {
    it('shows FormErrorBanner when onSubmit throws', async () => {
      const throwingSubmit = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });
      renderForm({ onSubmit: throwingSubmit });
      fillValidForm();
      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

      await waitFor(() => {
        expect(screen.getByTestId('form-error-banner')).toBeInTheDocument();
      });
      expect(screen.getByText(/could not save the milestone/i)).toBeInTheDocument();
    });

    it('error banner has role="alert"', async () => {
      const throwingSubmit = jest.fn(() => { throw new Error('fail'); });
      renderForm({ onSubmit: throwingSubmit });
      fillValidForm();
      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

      await waitFor(() => {
        expect(screen.getByTestId('form-error-banner')).toHaveAttribute('role', 'alert');
      });
    });

    it('shows "Try again" retry button in the error banner', async () => {
      const throwingSubmit = jest.fn(() => { throw new Error('fail'); });
      renderForm({ onSubmit: throwingSubmit });
      fillValidForm();
      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      });
    });

    it('retry button is type="button" (keyboard operable)', async () => {
      const throwingSubmit = jest.fn(() => { throw new Error('fail'); });
      renderForm({ onSubmit: throwingSubmit });
      fillValidForm();
      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

      await waitFor(() => {
        const btn = screen.getByRole('button', { name: /try again/i });
        expect(btn).toHaveAttribute('type', 'button');
      });
    });

    it('retry clears error and succeeds on second attempt', async () => {
      let callCount = 0;
      const flakySubmit = jest.fn(() => {
        callCount++;
        if (callCount === 1) throw new Error('transient fail');
        // second call succeeds silently
      });

      renderForm({ onSubmit: flakySubmit });
      fillValidForm();
      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

      await waitFor(() => {
        expect(screen.getByTestId('form-error-banner')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /try again/i }));

      await waitFor(() => {
        expect(screen.queryByTestId('form-error-banner')).not.toBeInTheDocument();
      });
      expect(flakySubmit).toHaveBeenCalledTimes(2);
    });

    it('does not show error banner before any submission', () => {
      renderForm();
      expect(screen.queryByTestId('form-error-banner')).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Empty / load-error state
  // -------------------------------------------------------------------------
  describe('empty / load-error state', () => {
    it('shows load-error banner when loadError is set and initialData is null', () => {
      renderForm({ loadError: 'Could not load milestone data.', initialData: null });
      expect(screen.getByTestId('form-load-error-banner')).toBeInTheDocument();
      expect(screen.getByText(/could not load milestone data/i)).toBeInTheDocument();
    });

    it('hides form fields when in load-error state', () => {
      renderForm({ loadError: 'Load failed.', initialData: null });
      expect(screen.queryByLabelText(/title/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/payout amount/i)).not.toBeInTheDocument();
    });

    it('load-error banner has role="alert"', () => {
      renderForm({ loadError: 'Load failed.', initialData: null });
      expect(screen.getByTestId('form-load-error-banner')).toHaveAttribute('role', 'alert');
    });

    it('calls onRetryLoad when retry is clicked in load-error state', () => {
      const onRetryLoad = jest.fn();
      renderForm({ loadError: 'Load failed.', initialData: null, onRetryLoad });
      fireEvent.click(screen.getByRole('button', { name: /try again/i }));
      expect(onRetryLoad).toHaveBeenCalledTimes(1);
    });

    it('does NOT show load-error banner when initialData is not null', () => {
      renderForm({ loadError: 'Some error', initialData: { title: 'Prefilled' } });
      expect(screen.queryByTestId('form-load-error-banner')).not.toBeInTheDocument();
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    });

    it('does NOT show load-error banner when loadError is null', () => {
      renderForm({ loadError: null, initialData: null });
      expect(screen.queryByTestId('form-load-error-banner')).not.toBeInTheDocument();
    });

    it('provides a cancel button in the load-error state', () => {
      const { onCancel } = renderForm({ loadError: 'Load failed.', initialData: null });
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  // -------------------------------------------------------------------------
  // State exclusivity
  // -------------------------------------------------------------------------
  describe('state exclusivity', () => {
    it('never shows both ErrorSummary and FormErrorBanner simultaneously', async () => {
      // Submit empty form: should show ErrorSummary, NOT FormErrorBanner
      renderForm();
      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));
      await waitFor(() => {
        expect(screen.getByRole('alert', { name: /there is a problem/i })).toBeInTheDocument();
      });
      expect(screen.queryByTestId('form-error-banner')).not.toBeInTheDocument();
    });

    it('FormErrorBanner clears when retry succeeds', async () => {
      let first = true;
      const flakySubmit = jest.fn(() => {
        if (first) { first = false; throw new Error('fail'); }
      });
      renderForm({ onSubmit: flakySubmit });
      fillValidForm();
      fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

      await waitFor(() =>
        expect(screen.getByTestId('form-error-banner')).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByRole('button', { name: /try again/i }));
      await waitFor(() =>
        expect(screen.queryByTestId('form-error-banner')).not.toBeInTheDocument(),
      );
    });
  });

  // -------------------------------------------------------------------------
  // initialData pre-population
  // -------------------------------------------------------------------------
  describe('initialData pre-population', () => {
    it('pre-fills title', () => {
      renderForm({ initialData: { title: 'Pre-filled Milestone' } });
      expect(screen.getByLabelText(/title/i)).toHaveValue('Pre-filled Milestone');
    });

    it('pre-fills payout', () => {
      renderForm({ initialData: { payout: '1500' } });
      expect(screen.getByLabelText(/payout amount/i)).toHaveValue('1500');
    });

    it('pre-fills currency', () => {
      renderForm({ initialData: { currency: 'EUR' } });
      expect(screen.getByLabelText(/currency/i)).toHaveValue('EUR');
    });

    it('pre-fills status', () => {
      renderForm({ initialData: { status: 'Completed' } });
      expect(screen.getByLabelText(/status/i)).toHaveValue('Completed');
    });
  });
});
