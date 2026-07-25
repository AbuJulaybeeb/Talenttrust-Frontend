import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import CreateContractForm from '../CreateContractForm';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();

jest.mock('@/components/toast/toast-provider', () => ({
  useToast: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
  }),
}));

const mockSaveContract = jest.fn();
jest.mock('@/lib/repository', () => ({
  saveContract: (...args: unknown[]) => mockSaveContract(...args),
}));

jest.mock('@/lib/stellarAddress', () => ({
  isValidStellarAddress: jest.fn((addr: string) => addr.length === 56 && addr.startsWith('G')),
  normalizeStellarAddress: jest.fn((addr: string) => addr.trim()),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_ADDRESS = 'GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H';

const onSuccess = jest.fn();
const onCancel = jest.fn();

function renderForm(
  overrides: Partial<React.ComponentProps<typeof CreateContractForm>> = {},
) {
  return render(
    <CreateContractForm onSuccess={onSuccess} onCancel={onCancel} {...overrides} />,
  );
}

function fillValidForm() {
  fireEvent.change(screen.getByLabelText(/contract name/i), {
    target: { value: 'Design Sprint' },
  });
  fireEvent.change(screen.getByLabelText(/freelancer stellar address/i), {
    target: { value: VALID_ADDRESS },
  });
  fireEvent.change(screen.getByLabelText(/total value/i), {
    target: { value: '5000' },
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CreateContractForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSaveContract.mockImplementation(() => undefined); // default: succeeds
  });

  // -------------------------------------------------------------------------
  // Existing behaviour (regression guard)
  // -------------------------------------------------------------------------
  describe('existing behaviour', () => {
    it('renders all four fields and both action buttons', () => {
      renderForm();
      expect(screen.getByLabelText(/contract name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/freelancer stellar address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/total value/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/currency/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create contract/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('calls onCancel when the Cancel button is clicked', () => {
      renderForm();
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('shows an ErrorSummary with all required-field errors on empty submit', async () => {
      renderForm();
      fireEvent.click(screen.getByRole('button', { name: /create contract/i }));
      await waitFor(() => {
        expect(screen.getByRole('alert', { name: /there is a problem/i })).toBeInTheDocument();
      });
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('calls onSuccess and showSuccess toast on a valid submission', async () => {
      renderForm();
      fillValidForm();
      fireEvent.click(screen.getByRole('button', { name: /create contract/i }));
      await waitFor(() => {
        expect(mockShowSuccess).toHaveBeenCalledWith(
          expect.objectContaining({ title: 'Contract created' }),
        );
      });
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  // -------------------------------------------------------------------------
  // Error state — submission failure
  // -------------------------------------------------------------------------
  describe('error state — submission failure', () => {
    it('shows FormErrorBanner when saveContract throws', async () => {
      mockSaveContract.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      renderForm();
      fillValidForm();
      fireEvent.click(screen.getByRole('button', { name: /create contract/i }));

      await waitFor(() => {
        expect(screen.getByTestId('form-error-banner')).toBeInTheDocument();
      });
      expect(
        screen.getByText(/could not save the contract/i),
      ).toBeInTheDocument();
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('error banner has role="alert" so it is announced immediately', async () => {
      mockSaveContract.mockImplementation(() => {
        throw new Error('fail');
      });
      renderForm();
      fillValidForm();
      fireEvent.click(screen.getByRole('button', { name: /create contract/i }));

      await waitFor(() => {
        expect(screen.getByTestId('form-error-banner')).toHaveAttribute('role', 'alert');
      });
    });

    it('shows a "Try again" retry button in the error banner', async () => {
      mockSaveContract.mockImplementation(() => {
        throw new Error('fail');
      });
      renderForm();
      fillValidForm();
      fireEvent.click(screen.getByRole('button', { name: /create contract/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      });
    });

    it('retry re-submits and clears error on success', async () => {
      mockSaveContract
        .mockImplementationOnce(() => { throw new Error('fail'); })
        .mockImplementationOnce(() => undefined); // second call succeeds

      renderForm();
      fillValidForm();
      fireEvent.click(screen.getByRole('button', { name: /create contract/i }));

      await waitFor(() => {
        expect(screen.getByTestId('form-error-banner')).toBeInTheDocument();
      });

      // Click retry
      fireEvent.click(screen.getByRole('button', { name: /try again/i }));

      await waitFor(() => {
        expect(screen.queryByTestId('form-error-banner')).not.toBeInTheDocument();
      });
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it('retry button is keyboard-operable (type="button")', async () => {
      mockSaveContract.mockImplementation(() => { throw new Error('fail'); });
      renderForm();
      fillValidForm();
      fireEvent.click(screen.getByRole('button', { name: /create contract/i }));

      await waitFor(() => {
        const retryBtn = screen.getByRole('button', { name: /try again/i });
        expect(retryBtn).toHaveAttribute('type', 'button');
      });
    });

    it('clears validation ErrorSummary when retrying', async () => {
      // First submit empty to get validation errors, then fix fields and retry
      renderForm();
      fireEvent.click(screen.getByRole('button', { name: /create contract/i }));
      await waitFor(() => {
        expect(screen.getByRole('alert', { name: /there is a problem/i })).toBeInTheDocument();
      });

      // Now fill fields — validation errors should clear on next submit
      fillValidForm();
      fireEvent.click(screen.getByRole('button', { name: /create contract/i }));

      await waitFor(() => {
        expect(
          screen.queryByRole('alert', { name: /there is a problem/i }),
        ).not.toBeInTheDocument();
      });
    });
  });

  // -------------------------------------------------------------------------
  // Empty / load-error state
  // -------------------------------------------------------------------------
  describe('empty / load-error state', () => {
    it('shows load-error banner when loadError is set and initialData is null', () => {
      renderForm({
        loadError: 'Failed to load contract data.',
        initialData: null,
        onRetryLoad: jest.fn(),
      });

      expect(screen.getByTestId('form-load-error-banner')).toBeInTheDocument();
      expect(screen.getByText(/failed to load contract data/i)).toBeInTheDocument();
    });

    it('hides form fields when in load-error state', () => {
      renderForm({
        loadError: 'Failed to load contract data.',
        initialData: null,
      });

      expect(screen.queryByLabelText(/contract name/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/freelancer stellar address/i)).not.toBeInTheDocument();
    });

    it('calls onRetryLoad when the retry button in load-error banner is clicked', () => {
      const onRetryLoad = jest.fn();
      renderForm({
        loadError: 'Failed to load.',
        initialData: null,
        onRetryLoad,
      });

      fireEvent.click(screen.getByRole('button', { name: /try again/i }));
      expect(onRetryLoad).toHaveBeenCalledTimes(1);
    });

    it('does NOT show load-error banner when loadError is set but initialData is not null', () => {
      renderForm({
        loadError: 'Some error',
        initialData: { contractName: 'My Contract' },
      });

      expect(screen.queryByTestId('form-load-error-banner')).not.toBeInTheDocument();
      // Form fields should still be visible
      expect(screen.getByLabelText(/contract name/i)).toBeInTheDocument();
    });

    it('does NOT show load-error banner when loadError is null', () => {
      renderForm({
        loadError: null,
        initialData: null,
      });

      expect(screen.queryByTestId('form-load-error-banner')).not.toBeInTheDocument();
    });

    it('renders a cancel link in the load-error state', () => {
      renderForm({
        loadError: 'Failed to load.',
        initialData: null,
      });
      // The cancel button within the load-error state
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('calls onCancel from the load-error cancel button', () => {
      renderForm({
        loadError: 'Failed to load.',
        initialData: null,
      });
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  // -------------------------------------------------------------------------
  // State exclusivity
  // -------------------------------------------------------------------------
  describe('state exclusivity', () => {
    it('never shows both ErrorSummary and FormErrorBanner at the same time', async () => {
      // Validation failure → ErrorSummary only
      renderForm();
      fireEvent.click(screen.getByRole('button', { name: /create contract/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert', { name: /there is a problem/i })).toBeInTheDocument();
      });
      expect(screen.queryByTestId('form-error-banner')).not.toBeInTheDocument();
    });

    it('form-error banner does not appear until submission fails', async () => {
      renderForm();
      // No submission yet
      expect(screen.queryByTestId('form-error-banner')).not.toBeInTheDocument();
    });

    it('FormErrorBanner is cleared (not rendered) when there is no submission error', () => {
      renderForm();
      expect(screen.queryByTestId('form-error-banner')).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // initialData pre-population
  // -------------------------------------------------------------------------
  describe('initialData pre-population', () => {
    it('pre-fills contract name from initialData', () => {
      renderForm({ initialData: { contractName: 'Pre-filled Contract' } });
      expect(screen.getByLabelText(/contract name/i)).toHaveValue('Pre-filled Contract');
    });

    it('pre-fills freelancer address from initialData', () => {
      renderForm({ initialData: { freelancerAddress: VALID_ADDRESS } });
      expect(screen.getByLabelText(/freelancer stellar address/i)).toHaveValue(VALID_ADDRESS);
    });

    it('pre-fills total value from initialData', () => {
      renderForm({ initialData: { totalValue: '3000' } });
      expect(screen.getByLabelText(/total value/i)).toHaveValue(3000);
    });

    it('pre-fills currency from initialData', () => {
      renderForm({ initialData: { currency: 'EUR' } });
      expect(screen.getByLabelText(/currency/i)).toHaveValue('EUR');
    });
  });
});
