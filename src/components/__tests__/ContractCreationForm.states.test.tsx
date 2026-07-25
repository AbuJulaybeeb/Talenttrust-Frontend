import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ContractCreationForm } from '../ContractCreationForm';

jest.mock('@/lib/stellarAddress', () => ({
  isValidStellarAddress: jest.fn((addr: string) => addr.length === 56 && addr.startsWith('G')),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_ADDRESS = 'GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H';

function renderForm(
  overrides: Partial<React.ComponentProps<typeof ContractCreationForm>> = {},
) {
  const onSubmit = jest.fn();
  const onCancel = jest.fn();
  const utils = render(
    <ContractCreationForm onSubmit={onSubmit} onCancel={onCancel} {...overrides} />,
  );
  return { onSubmit, onCancel, ...utils };
}

function fillValidForm() {
  fireEvent.change(screen.getByLabelText(/contract name/i), {
    target: { value: 'Design Sprint' },
  });
  fireEvent.change(screen.getByLabelText(/total value/i), {
    target: { value: '5000' },
  });
  const labels = screen.getAllByPlaceholderText(/e\.g\., client, freelancer/i);
  const addresses = screen.getAllByPlaceholderText(/GXXXXXXXXXX/i);
  fireEvent.change(labels[0], { target: { value: 'Client' } });
  fireEvent.change(addresses[0], { target: { value: VALID_ADDRESS } });
  fireEvent.change(labels[1], { target: { value: 'Freelancer' } });
  fireEvent.change(addresses[1], { target: { value: VALID_ADDRESS } });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ContractCreationForm — empty & error states', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Existing behaviour (regression guard)
  // -------------------------------------------------------------------------
  describe('existing behaviour', () => {
    it('renders the modal dialog', () => {
      renderForm();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('calls onCancel when cancel is clicked', () => {
      const { onCancel } = renderForm();
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('shows field validation errors on empty submit', async () => {
      renderForm();
      fireEvent.click(screen.getByRole('button', { name: /create contract/i }));
      await waitFor(() => {
        expect(screen.getByRole('alert', { name: /there is a problem/i })).toBeInTheDocument();
      });
    });

    it('calls onSubmit with correct data on a valid submission', async () => {
      const { onSubmit } = renderForm();
      fillValidForm();
      fireEvent.click(screen.getByRole('button', { name: /create contract/i }));
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1);
      });
    });
  });

  // -------------------------------------------------------------------------
  // Error state — submission failure
  // -------------------------------------------------------------------------
  describe('error state — submission failure', () => {
    it('shows FormErrorBanner when onSubmit throws', async () => {
      const throwingSubmit = jest.fn(() => {
        throw new Error('Persistence error');
      });
      renderForm({ onSubmit: throwingSubmit });
      fillValidForm();
      fireEvent.click(screen.getByRole('button', { name: /create contract/i }));

      await waitFor(() => {
        expect(screen.getByTestId('form-error-banner')).toBeInTheDocument();
      });
      expect(screen.getByText(/could not save the contract/i)).toBeInTheDocument();
    });

    it('error banner has role="alert"', async () => {
      renderForm({ onSubmit: jest.fn(() => { throw new Error('fail'); }) });
      fillValidForm();
      fireEvent.click(screen.getByRole('button', { name: /create contract/i }));

      await waitFor(() => {
        expect(screen.getByTestId('form-error-banner')).toHaveAttribute('role', 'alert');
      });
    });

    it('shows "Try again" retry button in the error banner', async () => {
      renderForm({ onSubmit: jest.fn(() => { throw new Error('fail'); }) });
      fillValidForm();
      fireEvent.click(screen.getByRole('button', { name: /create contract/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      });
    });

    it('retry button is type="button" (keyboard operable)', async () => {
      renderForm({ onSubmit: jest.fn(() => { throw new Error('fail'); }) });
      fillValidForm();
      fireEvent.click(screen.getByRole('button', { name: /create contract/i }));

      await waitFor(() => {
        const btn = screen.getByRole('button', { name: /try again/i });
        expect(btn).toHaveAttribute('type', 'button');
      });
    });

    it('retry clears error and succeeds on second attempt', async () => {
      let calls = 0;
      const flakySubmit = jest.fn(() => {
        calls++;
        if (calls === 1) throw new Error('transient fail');
      });
      renderForm({ onSubmit: flakySubmit });
      fillValidForm();
      fireEvent.click(screen.getByRole('button', { name: /create contract/i }));

      await waitFor(() =>
        expect(screen.getByTestId('form-error-banner')).toBeInTheDocument(),
      );

      fireEvent.click(screen.getByRole('button', { name: /try again/i }));

      await waitFor(() =>
        expect(screen.queryByTestId('form-error-banner')).not.toBeInTheDocument(),
      );
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
      renderForm({ loadError: 'Could not load contract data.', initialData: null });
      expect(screen.getByTestId('form-load-error-banner')).toBeInTheDocument();
      expect(screen.getByText(/could not load contract data/i)).toBeInTheDocument();
    });

    it('hides form fields when in load-error state', () => {
      renderForm({ loadError: 'Load failed.', initialData: null });
      expect(screen.queryByLabelText(/contract name/i)).not.toBeInTheDocument();
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
      renderForm({
        loadError: 'some error',
        initialData: { contractName: 'Test' },
      });
      expect(screen.queryByTestId('form-load-error-banner')).not.toBeInTheDocument();
      expect(screen.getByLabelText(/contract name/i)).toBeInTheDocument();
    });

    it('does NOT show load-error banner when loadError is null', () => {
      renderForm({ loadError: null, initialData: null });
      expect(screen.queryByTestId('form-load-error-banner')).not.toBeInTheDocument();
    });

    it('calls onCancel from the cancel button in load-error state', () => {
      const { onCancel } = renderForm({ loadError: 'fail', initialData: null });
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  // -------------------------------------------------------------------------
  // State exclusivity
  // -------------------------------------------------------------------------
  describe('state exclusivity', () => {
    it('never shows both ErrorSummary and FormErrorBanner simultaneously', async () => {
      renderForm();
      fireEvent.click(screen.getByRole('button', { name: /create contract/i }));
      await waitFor(() => {
        expect(screen.getByRole('alert', { name: /there is a problem/i })).toBeInTheDocument();
      });
      expect(screen.queryByTestId('form-error-banner')).not.toBeInTheDocument();
    });

    it('FormErrorBanner not shown before any submission', () => {
      renderForm();
      expect(screen.queryByTestId('form-error-banner')).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // initialData pre-population
  // -------------------------------------------------------------------------
  describe('initialData pre-population', () => {
    it('pre-fills contract name', () => {
      renderForm({ initialData: { contractName: 'Pre-filled' } });
      expect(screen.getByLabelText(/contract name/i)).toHaveValue('Pre-filled');
    });

    it('pre-fills total value', () => {
      renderForm({ initialData: { totalValue: '2000' } });
      expect(screen.getByLabelText(/total value/i)).toHaveValue('2000');
    });

    it('pre-fills currency', () => {
      renderForm({ initialData: { currency: 'GBP' } });
      expect(screen.getByLabelText(/currency/i)).toHaveValue('GBP');
    });

    it('pre-fills parties', () => {
      renderForm({
        initialData: {
          parties: [
            { label: 'Client', address: VALID_ADDRESS },
            { label: 'Dev', address: VALID_ADDRESS },
          ],
        },
      });
      const labels = screen.getAllByPlaceholderText(/e\.g\., client, freelancer/i);
      expect(labels[0]).toHaveValue('Client');
      expect(labels[1]).toHaveValue('Dev');
    });
  });
});
