import { render, screen, fireEvent } from '@testing-library/react';
import GlobalError from './global-error';
import { setErrorReporter } from '../lib/errorReporter';
import { testA11y } from '../test-utils/a11y';

// Suppress React error boundary noise in test output
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  setErrorReporter(null);
});

afterEach(() => {
  jest.restoreAllMocks();
  setErrorReporter(null);
});

const testError = Object.assign(new Error('Synthetic root crash'), { digest: undefined });
const mockReset = jest.fn();

describe('GlobalError page', () => {
  it('renders critical error message without leaking error details', () => {
    render(<GlobalError error={testError} reset={mockReset} />);
    expect(screen.getByRole('heading', { name: /critical error/i })).toBeInTheDocument();
    expect(screen.queryByText('Synthetic root crash')).not.toBeInTheDocument();
  });

  it('calls reset when Try Again is clicked', () => {
    render(<GlobalError error={testError} reset={mockReset} />);
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('renders Home, Contact Support links and try again button', () => {
    render(<GlobalError error={testError} reset={mockReset} />);
    expect(screen.getByRole('link', { name: /go home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /contact support/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('logs error to console only in non-production', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    // NODE_ENV is 'test' in Jest, which is !== 'production', so logging should fire
    render(<GlobalError error={testError} reset={mockReset} />);
    expect(spy).toHaveBeenCalledWith('[Global Error Boundary]', testError);
  });

  it('does not render error message or stack trace in the UI', () => {
    render(<GlobalError error={testError} reset={mockReset} />);
    expect(screen.queryByText(/synthetic root crash/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/digest/i)).not.toBeInTheDocument();
  });

  it('invokes the pluggable error reporter when rendered', () => {
    const mockReporter = jest.fn();
    setErrorReporter(mockReporter);
    
    render(<GlobalError error={testError} reset={mockReset} />);
    
    expect(mockReporter).toHaveBeenCalledTimes(1);
    expect(mockReporter).toHaveBeenCalledWith(testError, 'Global Error Boundary', undefined, undefined);
  });

  it('is accessible and clean of violations via jest-axe', async () => {
    // Render and check for accessibility violations
    await testA11y(<GlobalError error={testError} reset={mockReset} />);
  });
});
