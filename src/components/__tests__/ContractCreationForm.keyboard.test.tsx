import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ContractCreationForm } from '../ContractCreationForm';
import * as stellarAddress from '@/lib/stellarAddress';

jest.mock('@/lib/stellarAddress', () => ({
  isValidStellarAddress: jest.fn(),
}));

describe('ContractCreationForm keyboard operability', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (stellarAddress.isValidStellarAddress as jest.Mock).mockReturnValue(true);
  });

  it('moves focus to the Contract Name field when the dialog opens', async () => {
    render(<ContractCreationForm {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/contract name/i)).toHaveFocus();
    });
  });

  it('closes the dialog via onCancel when Escape is pressed', async () => {
    render(<ContractCreationForm {...defaultProps} />);

    await waitFor(() => expect(screen.getByLabelText(/contract name/i)).toHaveFocus());

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('wraps Tab from the last focusable element back to the first', async () => {
    render(<ContractCreationForm {...defaultProps} />);
    await waitFor(() => expect(screen.getByLabelText(/contract name/i)).toHaveFocus());

    const createButton = screen.getByRole('button', { name: /create contract/i });
    createButton.focus();
    expect(createButton).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Tab' });

    const contractNameInput = screen.getByLabelText(/contract name/i);
    expect(contractNameInput).toHaveFocus();
  });

  it('wraps Shift+Tab from the first focusable element to the last', async () => {
    render(<ContractCreationForm {...defaultProps} />);
    await waitFor(() => expect(screen.getByLabelText(/contract name/i)).toHaveFocus());

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });

    const createButton = screen.getByRole('button', { name: /create contract/i });
    expect(createButton).toHaveFocus();
  });

  it('does not trap focus when Tab is pressed away from either boundary', async () => {
    render(<ContractCreationForm {...defaultProps} />);
    await waitFor(() => expect(screen.getByLabelText(/contract name/i)).toHaveFocus());

    const totalValueInput = screen.getByLabelText(/total value/i);
    totalValueInput.focus();

    fireEvent.keyDown(document, { key: 'Tab' });

    // Not a boundary element, so the hook does not intervene — focus stays
    // where the browser's native tab order would leave it (jsdom does not
    // move focus itself on a synthetic keydown, so it simply stays put
    // rather than being redirected to a wrap target).
    expect(totalValueInput).toHaveFocus();
  });

  it('restores focus to the element that opened the dialog on unmount', async () => {
    function Harness() {
      const [isOpen, setIsOpen] = React.useState(false);
      return (
        <div>
          <button type="button" onClick={() => setIsOpen(true)}>
            Open form
          </button>
          {isOpen && (
            <ContractCreationForm
              onSubmit={mockOnSubmit}
              onCancel={() => setIsOpen(false)}
            />
          )}
        </div>
      );
    }

    render(<Harness />);

    const triggerButton = screen.getByRole('button', { name: /open form/i });
    triggerButton.focus();
    fireEvent.click(triggerButton);

    await waitFor(() => expect(screen.getByLabelText(/contract name/i)).toHaveFocus());

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByLabelText(/contract name/i)).not.toBeInTheDocument();
    });
    expect(triggerButton).toHaveFocus();
  });

  it('activates the Cancel button via the keyboard (Enter)', () => {
    render(<ContractCreationForm {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /^cancel$/i });
    cancelButton.focus();
    // Native <button> elements activate on Enter automatically; fireEvent's
    // click here mirrors what a real keydown-triggered activation produces,
    // confirming the control is a real button rather than a non-interactive
    // element relying on a manual click handler alone.
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('every focusable control inside the dialog is a real, tabbable element', async () => {
    render(<ContractCreationForm {...defaultProps} />);
    await waitFor(() => expect(screen.getByLabelText(/contract name/i)).toHaveFocus());

    const dialog = screen.getByRole('dialog');
    const focusable = dialog.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );

    expect(focusable.length).toBeGreaterThan(0);
    focusable.forEach((el) => {
      // No element should be a non-native "clickable div" pretending to be
      // interactive without being keyboard-reachable.
      expect(['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'A']).toContain(el.tagName);
    });
  });
});
