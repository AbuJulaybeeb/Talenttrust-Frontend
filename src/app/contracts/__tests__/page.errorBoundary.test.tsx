import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ContractsPage from '../page';
import * as repository from '@/lib/repository';
import { setErrorReporter } from '@/lib/errorReporter';

jest.mock('@/lib/repository', () => {
  const actual = jest.requireActual('@/lib/repository');
  return {
    ...actual,
    listContracts: jest.fn(actual.listContracts),
    saveContract: jest.fn(actual.saveContract),
  };
});

// The real ContractCreationForm is replaced with a controllable stand-in so
// these tests can force it to throw during render without needing invalid
// props or a real rendering bug.
let mockShouldThrow = true;
jest.mock('@/components/ContractCreationForm', () => ({
  ContractCreationForm: () => {
    if (mockShouldThrow) {
      throw new Error('Simulated ContractCreationForm render failure');
    }
    return <div>Contract form rendered fine</div>;
  },
}));

const mockListContracts = repository.listContracts as jest.MockedFunction<
  typeof repository.listContracts
>;

describe('ContractsPage — dialog error boundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockListContracts.mockReturnValue([]);
    mockShouldThrow = true;
    // Silence React's error-boundary console noise and the pluggable
    // reporter's own console fallback for these deliberately-thrown tests.
    jest.spyOn(console, 'error').mockImplementation(() => {});
    setErrorReporter(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    setErrorReporter(null);
  });

  it('does not blank the whole page when the create-contract dialog throws', () => {
    render(<ContractsPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Create Contract' }));

    // The page shell (heading) survives — only the dialog section is
    // replaced by the boundary's fallback.
    expect(screen.getByRole('heading', { name: 'Contracts' })).toBeInTheDocument();
    expect(screen.getByText('This section failed to load.')).toBeInTheDocument();
  });

  it('shows an accessible, non-silent failure with a retry control', () => {
    render(<ContractsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Create Contract' }));

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('This section failed to load.');
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('logs the error via the shared error-reporting channel instead of swallowing it', () => {
    const reporter = jest.fn();
    setErrorReporter(reporter);

    render(<ContractsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Create Contract' }));

    expect(reporter).toHaveBeenCalledWith(expect.any(Error), 'SafeBoundary', undefined, undefined);
  });

  it('recovers and renders the dialog normally after Retry once the underlying issue clears', () => {
    render(<ContractsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Create Contract' }));

    expect(screen.getByText('This section failed to load.')).toBeInTheDocument();

    // Simulate the transient condition clearing before the retry.
    mockShouldThrow = false;

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    });

    expect(screen.getByText('Contract form rendered fine')).toBeInTheDocument();
    expect(screen.queryByText('This section failed to load.')).not.toBeInTheDocument();
  });

  it('renders the dialog normally when nothing throws (unaffected by the boundary)', () => {
    mockShouldThrow = false;
    render(<ContractsPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Create Contract' }));

    expect(screen.getByText('Contract form rendered fine')).toBeInTheDocument();
    expect(screen.queryByText('This section failed to load.')).not.toBeInTheDocument();
  });
});
