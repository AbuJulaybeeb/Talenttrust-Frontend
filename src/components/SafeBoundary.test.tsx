import { render, screen, fireEvent, act } from '@testing-library/react';
import SafeBoundary from './SafeBoundary';
import { setErrorReporter } from '../lib/errorReporter';

// Suppress React error boundary console noise
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  setErrorReporter(null);
});
afterEach(() => {
  jest.restoreAllMocks();
  setErrorReporter(null);
});

const Bomb = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) throw new Error('Test explosion');
  return <div>Safe content</div>;
};

describe('SafeBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <SafeBoundary>
        <Bomb shouldThrow={false} />
      </SafeBoundary>
    );
    expect(screen.getByText('Safe content')).toBeInTheDocument();
  });

  it('renders default fallback UI when a child throws', () => {
    render(
      <SafeBoundary>
        <Bomb shouldThrow={true} />
      </SafeBoundary>
    );
    expect(screen.getByText('This section failed to load.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go home/i })).toBeInTheDocument();
  });

  it('renders a custom fallback when provided', () => {
    render(
      <SafeBoundary fallback={<div>Custom fallback</div>}>
        <Bomb shouldThrow={true} />
      </SafeBoundary>
    );
    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
  });

  it('recovers after clicking Retry', () => {
    // Wrapper lets us flip shouldThrow externally after the boundary resets
    let triggerThrow = true;
    const Child = () => <Bomb shouldThrow={triggerThrow} />;

    const { rerender } = render(
      <SafeBoundary>
        <Child />
      </SafeBoundary>
    );

    expect(screen.getByText('This section failed to load.')).toBeInTheDocument();

    // Flip the flag before clicking Retry so the next render attempt succeeds
    triggerThrow = false;

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    });

    // Force a rerender so React picks up the new triggerThrow value
    rerender(
      <SafeBoundary>
        <Child />
      </SafeBoundary>
    );

    expect(screen.getByText('Safe content')).toBeInTheDocument();
  });

  it('logs to console in non-production when a child throws', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <SafeBoundary>
        <Bomb shouldThrow={true} />
      </SafeBoundary>
    );
    // componentDidCatch fires with the error — check it was called
    expect(spy).toHaveBeenCalledWith('[SafeBoundary]', expect.any(Error));
  });

  it('invokes the pluggable error reporter when a child throws', () => {
    const mockReporter = jest.fn();
    setErrorReporter(mockReporter);

    render(
      <SafeBoundary>
        <Bomb shouldThrow={true} />
      </SafeBoundary>
    );

    expect(mockReporter).toHaveBeenCalledTimes(1);
    expect(mockReporter).toHaveBeenCalledWith(expect.any(Error), 'SafeBoundary', undefined, undefined);
  });
});
