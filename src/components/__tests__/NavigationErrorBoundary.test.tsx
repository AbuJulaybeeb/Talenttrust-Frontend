import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import NavigationErrorBoundary from '../NavigationErrorBoundary';
import { setErrorReporter } from '@/lib/errorReporter';

expect.extend(toHaveNoViolations);

// Suppress console.error noise from React error boundary boundary during error testing
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  setErrorReporter(null);
});

afterEach(() => {
  jest.restoreAllMocks();
  setErrorReporter(null);
});

const ThrowsError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Navigation render error test');
  }
  return <nav aria-label="Primary">Nav Content</nav>;
};

describe('NavigationErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <NavigationErrorBoundary>
        <ThrowsError shouldThrow={false} />
      </NavigationErrorBoundary>
    );

    expect(screen.getByText('Nav Content')).toBeInTheDocument();
  });

  it('renders accessible default fallback UI when child navigation throws', () => {
    render(
      <NavigationErrorBoundary>
        <ThrowsError shouldThrow={true} />
      </NavigationErrorBoundary>
    );

    expect(screen.getByRole('navigation', { name: 'Primary navigation error' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Navigation failed to load');
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('renders custom fallback when fallback prop is provided', () => {
    render(
      <NavigationErrorBoundary fallback={<div>Custom Navigation Fallback</div>}>
        <ThrowsError shouldThrow={true} />
      </NavigationErrorBoundary>
    );

    expect(screen.getByText('Custom Navigation Fallback')).toBeInTheDocument();
    expect(screen.queryByText('Navigation failed to load')).not.toBeInTheDocument();
  });

  it('invokes reportError seam when navigation child throws', () => {
    const mockReporter = jest.fn();
    setErrorReporter(mockReporter);

    render(
      <NavigationErrorBoundary>
        <ThrowsError shouldThrow={true} />
      </NavigationErrorBoundary>
    );

    expect(mockReporter).toHaveBeenCalledTimes(1);
    expect(mockReporter).toHaveBeenCalledWith(
      expect.any(Error),
      'NavigationErrorBoundary',
      'error',
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('resets error state and recovers upon clicking Retry', () => {
    let shouldThrow = true;
    const DynamicChild = () => <ThrowsError shouldThrow={shouldThrow} />;

    const { rerender } = render(
      <NavigationErrorBoundary>
        <DynamicChild />
      </NavigationErrorBoundary>
    );

    expect(screen.getByText('Navigation failed to load')).toBeInTheDocument();

    // Reset throw condition before retry click
    shouldThrow = false;

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    });

    rerender(
      <NavigationErrorBoundary>
        <DynamicChild />
      </NavigationErrorBoundary>
    );

    expect(screen.getByText('Nav Content')).toBeInTheDocument();
    expect(screen.queryByText('Navigation failed to load')).not.toBeInTheDocument();
  });

  it('passes jest-axe accessibility audit on fallback UI', async () => {
    const { container } = render(
      <NavigationErrorBoundary>
        <ThrowsError shouldThrow={true} />
      </NavigationErrorBoundary>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
