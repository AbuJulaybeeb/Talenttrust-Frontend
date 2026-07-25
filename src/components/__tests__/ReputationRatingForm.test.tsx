import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReputationRatingForm } from '../ReputationRatingForm';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

describe('ReputationRatingForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function fillValidForm() {
    fireEvent.change(screen.getByLabelText(/reviewer id/i), {
      target: { value: 'reviewer-1' },
    });
    fireEvent.change(screen.getByLabelText(/context id/i), {
      target: { value: VALID_UUID },
    });
    fireEvent.change(screen.getByLabelText(/^Rating/), { target: { value: '5' } });
  }

  describe('Rendering', () => {
    it('renders all fields and both buttons', () => {
      render(<ReputationRatingForm {...defaultProps} />);

      expect(screen.getByLabelText(/reviewer id/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/context id/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Rating/)).toBeInTheDocument();
      expect(screen.getByLabelText(/comment/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit rating/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('omits the cancel button when onCancel is not provided', () => {
      render(<ReputationRatingForm onSubmit={mockOnSubmit} />);

      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });

    it('marks reviewer ID, context ID, and rating as required, but not comment', () => {
      render(<ReputationRatingForm {...defaultProps} />);

      expect(screen.getByLabelText(/reviewer id/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/context id/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/^Rating/)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/comment/i)).not.toHaveAttribute('aria-required', 'true');
    });
  });

  describe('Validation - empty and invalid submissions', () => {
    it('shows validation errors and blocks submission for an empty form', async () => {
      render(<ReputationRatingForm {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /submit rating/i }));

      await waitFor(() => {
        const errorSummary = screen.getByRole('alert', { name: /there is a problem/i });
        expect(errorSummary).toHaveTextContent(/reviewer id is required/i);
        expect(errorSummary).toHaveTextContent(/context id is required/i);
        expect(errorSummary).toHaveTextContent(/rating is required/i);
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('rejects a non-UUID context ID', async () => {
      render(<ReputationRatingForm {...defaultProps} />);
      fillValidForm();
      fireEvent.change(screen.getByLabelText(/context id/i), {
        target: { value: 'not-a-uuid' },
      });

      fireEvent.click(screen.getByRole('button', { name: /submit rating/i }));

      await waitFor(() => {
        expect(screen.getAllByText(/context id must be a valid uuid/i)[0]).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('rejects a rating below the minimum', async () => {
      render(<ReputationRatingForm {...defaultProps} />);
      fillValidForm();
      fireEvent.change(screen.getByLabelText(/^Rating/), { target: { value: '0' } });

      fireEvent.click(screen.getByRole('button', { name: /submit rating/i }));

      await waitFor(() => {
        expect(screen.getAllByText(/rating must be at least 1/i)[0]).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('rejects a rating above the maximum', async () => {
      render(<ReputationRatingForm {...defaultProps} />);
      fillValidForm();
      fireEvent.change(screen.getByLabelText(/^Rating/), { target: { value: '9' } });

      fireEvent.click(screen.getByRole('button', { name: /submit rating/i }));

      await waitFor(() => {
        expect(screen.getAllByText(/rating must be at most 5/i)[0]).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('rejects a non-integer rating', async () => {
      render(<ReputationRatingForm {...defaultProps} />);
      fillValidForm();
      fireEvent.change(screen.getByLabelText(/^Rating/), { target: { value: '3.5' } });

      fireEvent.click(screen.getByRole('button', { name: /submit rating/i }));

      await waitFor(() => {
        expect(screen.getAllByText(/rating must be an integer/i)[0]).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('rejects a spam comment', async () => {
      render(<ReputationRatingForm {...defaultProps} />);
      fillValidForm();
      fireEvent.change(screen.getByLabelText(/comment/i), {
        target: { value: 'aaaaaaaaaaaaaaaaaaaa' },
      });

      fireEvent.click(screen.getByRole('button', { name: /submit rating/i }));

      await waitFor(() => {
        expect(
          screen.getAllByText(/comment contains excessive repetitive content/i)[0],
        ).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('rejects an over-length comment', async () => {
      render(<ReputationRatingForm {...defaultProps} />);
      fillValidForm();
      fireEvent.change(screen.getByLabelText(/comment/i), {
        target: { value: 'ab'.repeat(600) },
      });

      fireEvent.click(screen.getByRole('button', { name: /submit rating/i }));

      await waitFor(() => {
        expect(
          screen.getAllByText(/comment must not exceed 1000 characters/i)[0],
        ).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Valid submission', () => {
    it('submits the trimmed, well-typed payload when all fields are valid', async () => {
      render(<ReputationRatingForm {...defaultProps} />);

      fireEvent.change(screen.getByLabelText(/reviewer id/i), {
        target: { value: '  reviewer-1  ' },
      });
      fireEvent.change(screen.getByLabelText(/context id/i), {
        target: { value: `  ${VALID_UUID}  ` },
      });
      fireEvent.change(screen.getByLabelText(/^Rating/), { target: { value: '5' } });
      fireEvent.change(screen.getByLabelText(/comment/i), {
        target: { value: '  Great to work with.  ' },
      });

      fireEvent.click(screen.getByRole('button', { name: /submit rating/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });

      expect(mockOnSubmit).toHaveBeenCalledWith({
        reviewerId: 'reviewer-1',
        contextId: VALID_UUID,
        rating: 5,
        comment: 'Great to work with.',
      });
    });

    it('omits comment from the payload when left blank', async () => {
      render(<ReputationRatingForm {...defaultProps} />);
      fillValidForm();

      fireEvent.click(screen.getByRole('button', { name: /submit rating/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });

      const submitted = mockOnSubmit.mock.calls[0][0];
      expect(submitted).not.toHaveProperty('comment');
    });

    it('submits the numeric rating as a number, not a string', async () => {
      render(<ReputationRatingForm {...defaultProps} />);
      fillValidForm();

      fireEvent.click(screen.getByRole('button', { name: /submit rating/i }));

      await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledTimes(1));
      expect(typeof mockOnSubmit.mock.calls[0][0].rating).toBe('number');
    });
  });

  describe('Cancel', () => {
    it('calls onCancel when the cancel button is clicked', () => {
      render(<ReputationRatingForm {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('links the rating error to the rating field via aria-describedby', async () => {
      render(<ReputationRatingForm {...defaultProps} />);

      const ratingInput = screen.getByLabelText(/^Rating/);
      fireEvent.click(screen.getByRole('button', { name: /submit rating/i }));

      await waitFor(() => {
        expect(ratingInput).toHaveAttribute('aria-invalid', 'true');
      });

      const describedBy = ratingInput.getAttribute('aria-describedby');
      expect(describedBy).toContain('rating-error');
      expect(document.getElementById('rating-error')).toHaveTextContent(/rating is required/i);
    });

    it('renders the error summary with role="alert" so it is announced immediately', async () => {
      render(<ReputationRatingForm {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /submit rating/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert', { name: /there is a problem/i })).toBeInTheDocument();
      });
    });

    it('clears the field error once corrected and resubmitted', async () => {
      render(<ReputationRatingForm {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /submit rating/i }));
      await waitFor(() => {
        expect(screen.getAllByText(/reviewer id is required/i)[0]).toBeInTheDocument();
      });

      fillValidForm();
      fireEvent.click(screen.getByRole('button', { name: /submit rating/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });
      expect(screen.queryByText(/reviewer id is required/i)).not.toBeInTheDocument();
    });
  });
});
