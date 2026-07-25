import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import MilestonesPage from '../page';
import { listMilestones, saveMilestone } from '@/lib/repository';
import { setErrorReporter } from '@/lib/errorReporter';

const mockSearchParams = {
  get: jest.fn(() => null),
  toString: jest.fn(() => ''),
};
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), prefetch: jest.fn() }),
}));

jest.mock('@/lib/repository', () => ({
  listMilestones: jest.fn(),
  saveMilestone: jest.fn(),
}));

// The real MilestoneCreationForm is replaced with a controllable stand-in so
// these tests can force it to throw during render without needing invalid
// props or a real rendering bug.
let mockShouldThrow = true;
jest.mock('@/components/milestones/MilestoneCreationForm', () => ({
  MilestoneCreationForm: () => {
    if (mockShouldThrow) {
      throw new Error('Simulated MilestoneCreationForm render failure');
    }
    return <div>Milestone form rendered fine</div>;
  },
}));

const mockedListMilestones = jest.mocked(listMilestones);
const mockedSaveMilestone = jest.mocked(saveMilestone);

describe('MilestonesPage — dialog error boundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockedListMilestones.mockReturnValue([
      {
        id: 'm-1',
        title: 'Existing milestone',
        status: 'Active',
        payout: 1000,
        currency: 'USD',
      },
    ]);
    mockedSaveMilestone.mockImplementation(() => {});
    mockShouldThrow = true;
    jest.spyOn(console, 'error').mockImplementation(() => {});
    setErrorReporter(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    setErrorReporter(null);
  });

  it('does not blank the whole page when the add-milestone dialog throws', async () => {
    render(<MilestonesPage />);

    const addButtons = await screen.findAllByRole('button', { name: /add milestone/i });
    fireEvent.click(addButtons[0]);

    expect(screen.getByRole('heading', { name: /milestones/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText('This section failed to load.')).toBeInTheDocument();
  });

  it('shows an accessible, non-silent failure with a retry control', async () => {
    render(<MilestonesPage />);
    const addButtons = await screen.findAllByRole('button', { name: /add milestone/i });
    fireEvent.click(addButtons[0]);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('This section failed to load.');
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('logs the error via the shared error-reporting channel instead of swallowing it', async () => {
    const reporter = jest.fn();
    setErrorReporter(reporter);

    render(<MilestonesPage />);
    const addButtons = await screen.findAllByRole('button', { name: /add milestone/i });
    fireEvent.click(addButtons[0]);

    expect(reporter).toHaveBeenCalledWith(expect.any(Error), 'SafeBoundary', undefined, undefined);
  });

  it('recovers and renders the dialog normally after Retry once the underlying issue clears', async () => {
    render(<MilestonesPage />);
    const addButtons = await screen.findAllByRole('button', { name: /add milestone/i });
    fireEvent.click(addButtons[0]);

    expect(screen.getByText('This section failed to load.')).toBeInTheDocument();

    mockShouldThrow = false;

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    });

    expect(screen.getByText('Milestone form rendered fine')).toBeInTheDocument();
    expect(screen.queryByText('This section failed to load.')).not.toBeInTheDocument();
  });

  it('renders the dialog normally when nothing throws (unaffected by the boundary)', async () => {
    mockShouldThrow = false;
    render(<MilestonesPage />);

    const addButtons = await screen.findAllByRole('button', { name: /add milestone/i });
    fireEvent.click(addButtons[0]);

    expect(screen.getByText('Milestone form rendered fine')).toBeInTheDocument();
    expect(screen.queryByText('This section failed to load.')).not.toBeInTheDocument();
  });
});
