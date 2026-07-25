/**
 * ContractsErrorBoundary — comprehensive test suite
 *
 * Covers:
 *  - Normal render (children pass-through, no error)
 *  - Fallback UI shown when a child throws
 *  - Accessible attributes of the fallback (role=alert, aria-live)
 *  - Custom fallback prop replaces the default UI
 *  - Retry re-mounts children after the boundary resets
 *  - Error is forwarded to the reportError seam (not swallowed)
 *  - componentStack metadata is passed to the reporter
 *  - Pluggable reporter receives the right arguments
 *  - Go Home link navigates to '/'
 *  - Multiple independent boundaries do not interfere
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ContractsErrorBoundary from './ContractsErrorBoundary';
import { setErrorReporter } from '../lib/errorReporter';

// ---------------------------------------------------------------------------
// Suppress React error boundary noise in test output
// ---------------------------------------------------------------------------
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  setErrorReporter(null); // reset to default before each test
});

afterEach(() => {
  jest.restoreAllMocks();
  setErrorReporter(null);
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** A child that throws if shouldThrow is true, otherwise renders fine. */
const Bomb = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) throw new Error('contracts render failure');
  return <div>Contracts loaded</div>;
};

Bomb.displayName = 'Bomb';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ContractsErrorBoundary', () => {
  // ── Normal render ─────────────────────────────────────────────────────────

  describe('normal render (no error)', () => {
    it('renders children when no error occurs', () => {
      render(
        <ContractsErrorBoundary>
          <Bomb shouldThrow={false} />
        </ContractsErrorBoundary>,
      );

      expect(screen.getByText('Contracts loaded')).toBeInTheDocument();
    });

    it('does not render the fallback UI when children render successfully', () => {
      render(
        <ContractsErrorBoundary>
          <Bomb shouldThrow={false} />
        </ContractsErrorBoundary>,
      );

      expect(
        screen.queryByText(/the contracts section failed to load/i),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /retry/i }),
      ).not.toBeInTheDocument();
    });
  });

  // ── Fallback UI ───────────────────────────────────────────────────────────

  describe('fallback UI when a child throws', () => {
    it('shows the default fallback message', () => {
      render(
        <ContractsErrorBoundary>
          <Bomb shouldThrow={true} />
        </ContractsErrorBoundary>,
      );

      expect(
        screen.getByText(/the contracts section failed to load/i),
      ).toBeInTheDocument();
    });

    it('shows the secondary help text', () => {
      render(
        <ContractsErrorBoundary>
          <Bomb shouldThrow={true} />
        </ContractsErrorBoundary>,
      );

      expect(
        screen.getByText(/an unexpected error occurred/i),
      ).toBeInTheDocument();
    });

    it('renders a Retry button', () => {
      render(
        <ContractsErrorBoundary>
          <Bomb shouldThrow={true} />
        </ContractsErrorBoundary>,
      );

      expect(
        screen.getByRole('button', { name: /retry/i }),
      ).toBeInTheDocument();
    });

    it('renders a Go Home link pointing to "/"', () => {
      render(
        <ContractsErrorBoundary>
          <Bomb shouldThrow={true} />
        </ContractsErrorBoundary>,
      );

      const link = screen.getByRole('link', { name: /go home/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/');
    });

    it('does not render children when in error state', () => {
      render(
        <ContractsErrorBoundary>
          <Bomb shouldThrow={true} />
        </ContractsErrorBoundary>,
      );

      expect(screen.queryByText('Contracts loaded')).not.toBeInTheDocument();
    });
  });

  // ── Accessibility ─────────────────────────────────────────────────────────

  describe('fallback accessibility', () => {
    it('fallback container has role="alert"', () => {
      render(
        <ContractsErrorBoundary>
          <Bomb shouldThrow={true} />
        </ContractsErrorBoundary>,
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('fallback container has aria-live="assertive"', () => {
      render(
        <ContractsErrorBoundary>
          <Bomb shouldThrow={true} />
        </ContractsErrorBoundary>,
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });
  });

  // ── Custom fallback ───────────────────────────────────────────────────────

  describe('custom fallback prop', () => {
    it('renders the custom fallback when provided and a child throws', () => {
      render(
        <ContractsErrorBoundary fallback={<div>Custom error UI</div>}>
          <Bomb shouldThrow={true} />
        </ContractsErrorBoundary>,
      );

      expect(screen.getByText('Custom error UI')).toBeInTheDocument();
    });

    it('does not render the default fallback when a custom fallback is provided', () => {
      render(
        <ContractsErrorBoundary fallback={<div>Custom error UI</div>}>
          <Bomb shouldThrow={true} />
        </ContractsErrorBoundary>,
      );

      expect(
        screen.queryByText(/the contracts section failed to load/i),
      ).not.toBeInTheDocument();
    });

    it('does not render the custom fallback when no error occurs', () => {
      render(
        <ContractsErrorBoundary fallback={<div>Custom error UI</div>}>
          <Bomb shouldThrow={false} />
        </ContractsErrorBoundary>,
      );

      expect(screen.queryByText('Custom error UI')).not.toBeInTheDocument();
      expect(screen.getByText('Contracts loaded')).toBeInTheDocument();
    });
  });

  // ── Retry ─────────────────────────────────────────────────────────────────

  describe('retry behaviour', () => {
    it('re-renders children after clicking Retry when the underlying issue is resolved', () => {
      let shouldThrow = true;
      const Child = () => <Bomb shouldThrow={shouldThrow} />;

      const { rerender } = render(
        <ContractsErrorBoundary>
          <Child />
        </ContractsErrorBoundary>,
      );

      // Boundary should be in error state
      expect(
        screen.getByText(/the contracts section failed to load/i),
      ).toBeInTheDocument();

      // Fix the root cause before retry
      shouldThrow = false;

      act(() => {
        fireEvent.click(screen.getByRole('button', { name: /retry/i }));
      });

      rerender(
        <ContractsErrorBoundary>
          <Child />
        </ContractsErrorBoundary>,
      );

      expect(screen.getByText('Contracts loaded')).toBeInTheDocument();
      expect(
        screen.queryByText(/the contracts section failed to load/i),
      ).not.toBeInTheDocument();
    });

    it('shows the fallback again if the child throws again after retry', () => {
      // shouldThrow stays true — retry will fail again
      const { rerender } = render(
        <ContractsErrorBoundary>
          <Bomb shouldThrow={true} />
        </ContractsErrorBoundary>,
      );

      expect(
        screen.getByText(/the contracts section failed to load/i),
      ).toBeInTheDocument();

      act(() => {
        fireEvent.click(screen.getByRole('button', { name: /retry/i }));
      });

      // Child still throws — boundary must catch again
      rerender(
        <ContractsErrorBoundary>
          <Bomb shouldThrow={true} />
        </ContractsErrorBoundary>,
      );

      expect(
        screen.getByText(/the contracts section failed to load/i),
      ).toBeInTheDocument();
    });
  });

  // ── Error logging / reporting ─────────────────────────────────────────────

  describe('error logging', () => {
    it('calls console.error in non-production when a child throws', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ContractsErrorBoundary>
          <Bomb shouldThrow={true} />
        </ContractsErrorBoundary>,
      );

      // The default reporter forwards to console.error with [ContractsErrorBoundary] prefix
      expect(spy).toHaveBeenCalledWith(
        '[ContractsErrorBoundary]',
        expect.any(Error),
        expect.any(Object), // meta: { componentStack }
      );
    });

    it('does not swallow the error silently', () => {
      const mockReporter = jest.fn();
      setErrorReporter(mockReporter);

      render(
        <ContractsErrorBoundary>
          <Bomb shouldThrow={true} />
        </ContractsErrorBoundary>,
      );

      expect(mockReporter).toHaveBeenCalledTimes(1);
    });
  });

  describe('pluggable error reporter', () => {
    it('invokes the injected reporter with the thrown error', () => {
      const mockReporter = jest.fn();
      setErrorReporter(mockReporter);

      render(
        <ContractsErrorBoundary>
          <Bomb shouldThrow={true} />
        </ContractsErrorBoundary>,
      );

      expect(mockReporter).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'contracts render failure' }),
        'ContractsErrorBoundary',
        'error',
        expect.any(Object),
      );
    });

    it('passes componentStack metadata to the reporter', () => {
      const mockReporter = jest.fn();
      setErrorReporter(mockReporter);

      render(
        <ContractsErrorBoundary>
          <Bomb shouldThrow={true} />
        </ContractsErrorBoundary>,
      );

      const [, , , meta] = mockReporter.mock.calls[0];
      expect(meta).toHaveProperty('componentStack');
    });

    it('uses context label "ContractsErrorBoundary"', () => {
      const mockReporter = jest.fn();
      setErrorReporter(mockReporter);

      render(
        <ContractsErrorBoundary>
          <Bomb shouldThrow={true} />
        </ContractsErrorBoundary>,
      );

      const [, context] = mockReporter.mock.calls[0];
      expect(context).toBe('ContractsErrorBoundary');
    });

    it('reports with severity level "error"', () => {
      const mockReporter = jest.fn();
      setErrorReporter(mockReporter);

      render(
        <ContractsErrorBoundary>
          <Bomb shouldThrow={true} />
        </ContractsErrorBoundary>,
      );

      const [, , level] = mockReporter.mock.calls[0];
      expect(level).toBe('error');
    });

    it('does not call the reporter when children render without error', () => {
      const mockReporter = jest.fn();
      setErrorReporter(mockReporter);

      render(
        <ContractsErrorBoundary>
          <Bomb shouldThrow={false} />
        </ContractsErrorBoundary>,
      );

      expect(mockReporter).not.toHaveBeenCalled();
    });
  });

  // ── Multiple independent boundaries ───────────────────────────────────────

  describe('multiple independent boundaries', () => {
    it('a throwing child in one boundary does not affect a sibling boundary', () => {
      render(
        <>
          <ContractsErrorBoundary>
            <Bomb shouldThrow={true} />
          </ContractsErrorBoundary>
          <ContractsErrorBoundary>
            <Bomb shouldThrow={false} />
          </ContractsErrorBoundary>
        </>,
      );

      // First boundary shows fallback
      expect(
        screen.getAllByText(/the contracts section failed to load/i).length,
      ).toBeGreaterThanOrEqual(1);

      // Second boundary renders children
      expect(screen.getByText('Contracts loaded')).toBeInTheDocument();
    });
  });
});
