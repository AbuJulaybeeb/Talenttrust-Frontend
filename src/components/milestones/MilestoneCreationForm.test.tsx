import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MilestoneCreationForm } from './MilestoneCreationForm';
import { MAX_MILESTONE_TITLE_LENGTH, MAX_MILESTONE_PAYOUT_LIMIT } from '@/lib/validateMilestone';

describe('MilestoneCreationForm', () => {
  const onSubmit = jest.fn();
  const onCancel = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders all form fields and role="dialog" container', () => {
    render(<MilestoneCreationForm onSubmit={onSubmit} onCancel={onCancel} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/payout amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/currency/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
  });

  it('submits successfully with valid data and normalized title', async () => {
    render(<MilestoneCreationForm onSubmit={onSubmit} onCancel={onCancel} contractId="contract-123" />);

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: '  Design\u0000\n  review  ' },
    });
    fireEvent.change(screen.getByLabelText(/payout amount/i), { target: { value: '500' } });
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2026-10-15' } });
    fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const submitted = onSubmit.mock.calls[0][0];
    expect(submitted.title).toBe('Design review');
    expect(submitted.payout).toBe(500);
    expect(submitted.currency).toBe('USD');
    expect(submitted.dueDate).toBe('2026-10-15');
    expect(submitted.contractId).toBe('contract-123');
  });

  it('blocks submission and displays inline aria-describedby errors for empty required fields', async () => {
    render(<MilestoneCreationForm onSubmit={onSubmit} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

    await waitFor(() => {
      expect(screen.getAllByText('Title is required').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Payout amount is required').length).toBeGreaterThan(0);
    });

    expect(onSubmit).not.toHaveBeenCalled();

    const titleInput = screen.getByLabelText(/title/i);
    expect(titleInput).toHaveAttribute('aria-invalid', 'true');
    expect(titleInput).toHaveAttribute('aria-describedby', expect.stringContaining('milestone-title-error'));

    const payoutInput = screen.getByLabelText(/payout amount/i);
    expect(payoutInput).toHaveAttribute('aria-invalid', 'true');
    expect(payoutInput).toHaveAttribute('aria-describedby', expect.stringContaining('milestone-payout-error'));
  });

  it('rejects an over-length title instead of truncating it', async () => {
    render(<MilestoneCreationForm onSubmit={onSubmit} onCancel={onCancel} />);

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'a'.repeat(MAX_MILESTONE_TITLE_LENGTH + 1) },
    });
    fireEvent.change(screen.getByLabelText(/payout amount/i), { target: { value: '500' } });
    fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

    await waitFor(() => {
      expect(
        screen.getAllByText(`Title must be no more than ${MAX_MILESTONE_TITLE_LENGTH} characters`)[0],
      ).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects out-of-range or non-numeric payout values with inline errors', async () => {
    render(<MilestoneCreationForm onSubmit={onSubmit} onCancel={onCancel} />);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Milestone 1' } });

    // Non-numeric payout
    fireEvent.change(screen.getByLabelText(/payout amount/i), { target: { value: 'invalid-number' } });
    fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

    await waitFor(() => {
      expect(screen.getAllByText('Payout must be a positive number').length).toBeGreaterThan(0);
    });
    expect(onSubmit).not.toHaveBeenCalled();

    // Negative payout
    fireEvent.change(screen.getByLabelText(/payout amount/i), { target: { value: '-100' } });
    fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

    await waitFor(() => {
      expect(screen.getAllByText('Payout must be a positive number').length).toBeGreaterThan(0);
    });

    // Payout exceeding max limit
    fireEvent.change(screen.getByLabelText(/payout amount/i), {
      target: { value: (MAX_MILESTONE_PAYOUT_LIMIT + 1).toString() },
    });
    fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

    await waitFor(() => {
      expect(
        screen.getAllByText(`Payout amount cannot exceed ${MAX_MILESTONE_PAYOUT_LIMIT.toLocaleString()}`)[0],
      ).toBeInTheDocument();
    });
  });

  it('rejects invalid due date format with inline error', async () => {
    render(<MilestoneCreationForm onSubmit={onSubmit} onCancel={onCancel} />);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Valid Title' } });
    fireEvent.change(screen.getByLabelText(/payout amount/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: 'not-a-valid-date' } });

    fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));

    await waitFor(() => {
      expect(
        screen.getAllByText('Due date must be a valid date string (e.g. YYYY-MM-DD or MMM D, YYYY)')[0],
      ).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();

    const dateInput = screen.getByLabelText(/due date/i);
    expect(dateInput).toHaveAttribute('aria-invalid', 'true');
    expect(dateInput).toHaveAttribute('aria-describedby', expect.stringContaining('milestone-dueDate-error'));
  });

  it('clears inline error when user types into the field', async () => {
    render(<MilestoneCreationForm onSubmit={onSubmit} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole('button', { name: /add milestone/i }));
    await waitFor(() => {
      expect(screen.getAllByText('Title is required').length).toBeGreaterThan(0);
    });

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Title' } });
    expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
  });

  it('invokes onCancel when Cancel button is clicked', () => {
    render(<MilestoneCreationForm onSubmit={onSubmit} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
