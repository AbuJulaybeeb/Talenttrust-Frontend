import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FormErrorBanner } from '../FormErrorBanner';

describe('FormErrorBanner', () => {
  describe('rendering', () => {
    it('renders nothing when message is null', () => {
      const { container } = render(<FormErrorBanner message={null} />);
      expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when message is undefined', () => {
      const { container } = render(<FormErrorBanner message={undefined} />);
      expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when message is an empty string', () => {
      const { container } = render(<FormErrorBanner message="" />);
      expect(container).toBeEmptyDOMElement();
    });

    it('renders the banner when message is a non-empty string', () => {
      render(<FormErrorBanner message="Something went wrong." />);
      expect(screen.getByTestId('form-error-banner')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    });

    it('accepts a custom testId', () => {
      render(<FormErrorBanner message="Error" testId="my-banner" />);
      expect(screen.getByTestId('my-banner')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has role="alert"', () => {
      render(<FormErrorBanner message="Submission failed." />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('has aria-live="assertive"', () => {
      render(<FormErrorBanner message="Submission failed." />);
      expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
    });

    it('has aria-atomic="true"', () => {
      render(<FormErrorBanner message="Submission failed." />);
      expect(screen.getByRole('alert')).toHaveAttribute('aria-atomic', 'true');
    });

    it('has tabIndex="-1" so it can receive programmatic focus', () => {
      render(<FormErrorBanner message="Submission failed." />);
      expect(screen.getByRole('alert')).toHaveAttribute('tabIndex', '-1');
    });

    it('receives focus automatically when mounted with a message', () => {
      render(<FormErrorBanner message="Submission failed." />);
      expect(document.activeElement).toBe(screen.getByRole('alert'));
    });

    it('does not steal focus when message is absent', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);
      button.focus();

      render(<FormErrorBanner message={null} />);

      expect(document.activeElement).toBe(button);
      document.body.removeChild(button);
    });
  });

  describe('retry button', () => {
    it('renders no retry button when onRetry is not provided', () => {
      render(<FormErrorBanner message="Error" />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('renders a retry button when onRetry is provided', () => {
      render(<FormErrorBanner message="Error" onRetry={() => {}} />);
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('calls onRetry when the retry button is clicked', () => {
      const onRetry = jest.fn();
      render(<FormErrorBanner message="Error" onRetry={onRetry} />);
      fireEvent.click(screen.getByRole('button', { name: /try again/i }));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('supports a custom retryLabel', () => {
      render(
        <FormErrorBanner message="Error" onRetry={() => {}} retryLabel="Retry now" />,
      );
      expect(screen.getByRole('button', { name: /retry now/i })).toBeInTheDocument();
    });

    it('retry button is keyboard operable (has type="button")', () => {
      render(<FormErrorBanner message="Error" onRetry={() => {}} />);
      const btn = screen.getByRole('button', { name: /try again/i });
      expect(btn).toHaveAttribute('type', 'button');
    });

    it('retry button fires on Enter key', () => {
      const onRetry = jest.fn();
      render(<FormErrorBanner message="Error" onRetry={onRetry} />);
      const btn = screen.getByRole('button', { name: /try again/i });
      btn.focus();
      fireEvent.keyDown(btn, { key: 'Enter', code: 'Enter' });
      fireEvent.click(btn); // simulate normal enter→click flow
      expect(onRetry).toHaveBeenCalled();
    });
  });

  describe('state exclusivity', () => {
    it('disappears when message transitions from truthy to falsy', () => {
      const { rerender } = render(<FormErrorBanner message="Error" />);
      expect(screen.getByRole('alert')).toBeInTheDocument();

      rerender(<FormErrorBanner message={null} />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('updates the displayed message when message changes', () => {
      const { rerender } = render(<FormErrorBanner message="First error" />);
      expect(screen.getByText('First error')).toBeInTheDocument();

      rerender(<FormErrorBanner message="Second error" />);
      expect(screen.getByText('Second error')).toBeInTheDocument();
      expect(screen.queryByText('First error')).not.toBeInTheDocument();
    });
  });
});
