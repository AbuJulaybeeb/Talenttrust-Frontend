import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { setErrorReporter } from '@/lib/errorReporter';

jest.mock('@/lib/repository', () => ({
  listContracts: jest.fn().mockReturnValue([]),
  saveContract: jest.fn(),
}));
jest.mock('@/lib/stellarAddress', () => ({
  isValidStellarAddress: jest.fn().mockReturnValue(true),
}));

jest.mock('../../../components/ContractCreationForm', () => ({
  ContractCreationForm: () => {
    throw new Error('Form render error');
  },
}));

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  setErrorReporter(null);
});
afterEach(() => {
  jest.restoreAllMocks();
  setErrorReporter(null);
});

describe('ContractsPage error boundary around form', () => {
  it('shows fallback when form child throws', () => {
    const ContractsPage = require('../page').default;
    render(<ContractsPage />);
    fireEvent.click(screen.getByRole('button', { name: /create contract/i }));

    expect(screen.getByText('This section failed to load.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('logs error via reportError when form throws', () => {
    const mockReporter = jest.fn();
    setErrorReporter(mockReporter);

    const ContractsPage = require('../page').default;
    render(<ContractsPage />);
    fireEvent.click(screen.getByRole('button', { name: /create contract/i }));

    expect(mockReporter).toHaveBeenCalledWith(
      expect.any(Error),
      'SafeBoundary',
      undefined,
      undefined,
    );
  });

  it('page content remains visible when form throws', () => {
    const ContractsPage = require('../page').default;
    render(<ContractsPage />);
    expect(screen.getByRole('heading', { name: 'Contracts', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('retry button is accessible', () => {
    const ContractsPage = require('../page').default;
    render(<ContractsPage />);
    fireEvent.click(screen.getByRole('button', { name: /create contract/i }));

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    expect(retryBtn).toBeEnabled();
  });
});
