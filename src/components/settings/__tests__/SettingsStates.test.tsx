import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import {
  SettingsLoadingState,
  SettingsEmptyState,
  SettingsErrorState,
} from '../SettingsStates';

expect.extend(toHaveNoViolations);

describe('SettingsStates', () => {
  describe('SettingsLoadingState', () => {
    it('renders loading spinner and message', () => {
      render(<SettingsLoadingState />);

      expect(screen.getByText(/Loading your settings/i)).toBeInTheDocument();
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });

    it('announces loading state to assistive tech', () => {
      render(<SettingsLoadingState />);

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveAttribute('aria-live', 'polite');
      expect(statusRegion).toHaveAttribute('aria-atomic', 'true');
    });

    it('uses custom message when provided', () => {
      render(<SettingsLoadingState message="Fetching your preferences..." />);

      expect(screen.getByText(/Fetching your preferences/i)).toBeInTheDocument();
    });

    it('passes accessibility audit', async () => {
      const { container } = render(<SettingsLoadingState />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('SettingsEmptyState', () => {
    it('renders empty state with title and description', () => {
      render(
        <SettingsEmptyState
          title="No Settings"
          description="Your account has no settings yet."
        />
      );

      expect(screen.getByText(/No Settings/)).toBeInTheDocument();
      expect(screen.getByText(/Your account has no settings yet/)).toBeInTheDocument();
    });

    it('announces empty state to assistive tech', () => {
      render(
        <SettingsEmptyState
          title="No Settings"
          description="Test description"
        />
      );

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveAttribute('aria-live', 'polite');
      expect(statusRegion).toHaveAttribute('aria-atomic', 'true');
    });

    it('sets focus to container for screen readers', () => {
      render(
        <SettingsEmptyState title="Empty" description="Description" />
      );

      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('tabIndex', '-1');
    });

    it('passes accessibility audit', async () => {
      const { container } = render(
        <SettingsEmptyState title="Empty" description="Description" />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('SettingsErrorState', () => {
    it('renders error message and retry button', () => {
      const mockRetry = jest.fn();
      render(
        <SettingsErrorState
          error={new Error('Network failed')}
          onRetry={mockRetry}
        />
      );

      expect(screen.getByText(/Unable to Load Settings/i)).toBeInTheDocument();
      expect(screen.getByText(/Network failed/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
    });

    it('announces error state with alert role', () => {
      render(
        <SettingsErrorState
          error={new Error('Test error')}
          onRetry={jest.fn()}
        />
      );

      const alertRegion = screen.getByRole('alert');
      expect(alertRegion).toHaveAttribute('aria-live', 'assertive');
      expect(alertRegion).toHaveAttribute('aria-atomic', 'true');
    });

    it('calls retry callback when button is clicked', async () => {
      const mockRetry = jest.fn();
      render(
        <SettingsErrorState
          error={new Error('Test error')}
          onRetry={mockRetry}
        />
      );

      const retryButton = screen.getByRole('button', { name: /Try Again/i });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockRetry).toHaveBeenCalledTimes(1);
      });
    });

    it('handles async retry function', async () => {
      const mockRetry = jest.fn().mockResolvedValue(undefined);
      render(
        <SettingsErrorState
          error={new Error('Test error')}
          onRetry={mockRetry}
        />
      );

      const retryButton = screen.getByRole('button', { name: /Try Again/i });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockRetry).toHaveBeenCalledTimes(1);
      });
    });

    it('retry button is keyboard-accessible with Enter key', async () => {
      const mockRetry = jest.fn();
      render(
        <SettingsErrorState
          error={new Error('Test error')}
          onRetry={mockRetry}
        />
      );

      const retryButton = screen.getByRole('button', { name: /Try Again/i });
      retryButton.focus();

      fireEvent.keyDown(retryButton, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(mockRetry).toHaveBeenCalledTimes(1);
      });
    });

    it('retry button is keyboard-accessible with Space key', async () => {
      const mockRetry = jest.fn();
      render(
        <SettingsErrorState
          error={new Error('Test error')}
          onRetry={mockRetry}
        />
      );

      const retryButton = screen.getByRole('button', { name: /Try Again/i });
      retryButton.focus();

      fireEvent.keyDown(retryButton, { key: ' ', code: 'Space' });

      await waitFor(() => {
        expect(mockRetry).toHaveBeenCalledTimes(1);
      });
    });

    it('retry button has keyboard focus styles', () => {
      render(
        <SettingsErrorState
          error={new Error('Test error')}
          onRetry={jest.fn()}
        />
      );

      const retryButton = screen.getByRole('button', { name: /Try Again/i });
      expect(retryButton.className).toMatch(/focus-visible/);
    });

    it('uses custom retry label when provided', () => {
      render(
        <SettingsErrorState
          error={new Error('Test error')}
          onRetry={jest.fn()}
          retryLabel="Reload Settings"
        />
      );

      expect(
        screen.getByRole('button', { name: /Reload Settings/i })
      ).toBeInTheDocument();
    });

    it('passes accessibility audit', async () => {
      const { container } = render(
        <SettingsErrorState
          error={new Error('Test error')}
          onRetry={jest.fn()}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
