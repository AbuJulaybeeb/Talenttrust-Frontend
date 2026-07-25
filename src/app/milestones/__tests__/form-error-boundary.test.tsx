import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { setErrorReporter } from '@/lib/errorReporter';

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: jest.fn(() => null), toString: jest.fn(() => '') }),
  useRouter: () => ({ replace: jest.fn(), push: jest.fn(), prefetch: jest.fn() }),
}));

jest.mock('@/lib/repository', () => ({
  listMilestones: jest.fn().mockReturnValue([]),
  saveMilestone: jest.fn(),
}));

jest.mock('../../../components/milestones/MilestoneCreationForm', () => ({
  MilestoneCreationForm: () => {
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

describe('MilestonesPage error boundary around form', () => {
  it('shows fallback when form child throws', async () => {
    const MilestonesPage = require('../page').default;
    render(<MilestonesPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add milestone/i })).toBeInTheDocument();
    });

    const addBtns = screen.getAllByRole('button', { name: /add milestone/i });
    await act(async () => {
      fireEvent.click(addBtns[0]);
    });

    expect(screen.getByText('This section failed to load.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('logs error via reportError when form throws', async () => {
    const mockReporter = jest.fn();
    setErrorReporter(mockReporter);

    const MilestonesPage = require('../page').default;
    render(<MilestonesPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add milestone/i })).toBeInTheDocument();
    });

    const addBtns = screen.getAllByRole('button', { name: /add milestone/i });
    await act(async () => {
      fireEvent.click(addBtns[0]);
    });

    expect(mockReporter).toHaveBeenCalledWith(
      expect.any(Error),
      'SafeBoundary',
      undefined,
      undefined,
    );
  });

  it('page content remains visible when form throws', async () => {
    const MilestonesPage = require('../page').default;
    render(<MilestonesPage />);
    expect(screen.getByRole('heading', { name: 'Milestones', level: 1 })).toBeInTheDocument();
  });

  it('retry button is accessible', async () => {
    const MilestonesPage = require('../page').default;
    render(<MilestonesPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add milestone/i })).toBeInTheDocument();
    });

    const addBtns = screen.getAllByRole('button', { name: /add milestone/i });
    await act(async () => {
      fireEvent.click(addBtns[0]);
    });

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    expect(retryBtn).toBeEnabled();
  });
});
