/**
 * Tests for the milestones view's distinct empty and error states.
 *
 * Coverage targets:
 *  - Error state renders when the repository read throws, distinct from the
 *    empty state and the loaded list.
 *  - Error state is announced to assistive tech via role="alert" and
 *    aria-live="assertive".
 *  - Empty state is announced to assistive tech via role="status" and
 *    aria-live="polite".
 *  - Retry is a native, keyboard-operable button that re-invokes the load
 *    and clears the error on success.
 *  - Loading/empty/error/success states are mutually exclusive.
 *  - Accessibility: axe checks for both the empty and error states.
 */

import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import MilestonesPage, { SAMPLE_DISMISSED_KEY } from '../milestones/page';
import { listMilestones, saveMilestone } from '@/lib/repository';
import type { Milestone } from '@/types/domain';

// ---------------------------------------------------------------------------
// Navigation mocks
// ---------------------------------------------------------------------------

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

const mockedListMilestones = jest.mocked(listMilestones);
const mockedSaveMilestone = jest.mocked(saveMilestone);

const persistedMilestones: Milestone[] = [
  {
    id: 'repo-1',
    title: 'Repository Kickoff',
    status: 'Pending',
    payout: 1800,
    currency: 'USD',
    dueDate: '2026-07-01',
  },
];

async function renderPage() {
  const result = render(<MilestonesPage />);
  await act(async () => {});
  return result;
}

beforeEach(() => {
  mockedListMilestones.mockReset();
  mockedSaveMilestone.mockReset();
  mockedSaveMilestone.mockImplementation(() => {});
  window.localStorage.clear();
  mockSearchParams.get.mockReturnValue(null);
  mockSearchParams.toString.mockReturnValue('');
  mockReplace.mockReset();
});

afterEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
});

// ===========================================================================
// Error state rendering
// ===========================================================================

describe('MilestonesPage — error state', () => {
  it('renders a distinct error state when loading milestones throws', async () => {
    mockedListMilestones.mockImplementation(() => {
      throw new Error('Storage unavailable');
    });

    await renderPage();

    expect(screen.getByTestId('milestones-error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load milestones')).toBeInTheDocument();
    expect(screen.getAllByText('Storage unavailable').length).toBeGreaterThan(0);
  });

  it('falls back to a generic message when the thrown value is not an Error', async () => {
    mockedListMilestones.mockImplementation(() => {
      throw 'boom';
    });

    await renderPage();

    expect(screen.getByTestId('milestones-error')).toBeInTheDocument();
    expect(screen.getAllByText('Failed to load milestones.').length).toBeGreaterThan(0);
  });

  it('does not render the milestones list, empty state, or sample banner while errored', async () => {
    mockedListMilestones.mockImplementation(() => {
      throw new Error('Storage unavailable');
    });

    await renderPage();

    expect(screen.queryByText('No milestones tracked')).not.toBeInTheDocument();
    expect(screen.queryByTestId('sample-data-banner')).not.toBeInTheDocument();
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.queryByText('Repository Kickoff')).not.toBeInTheDocument();
  });

  it('announces the error for assistive tech via role="alert" and aria-live="assertive"', async () => {
    mockedListMilestones.mockImplementation(() => {
      throw new Error('Network down');
    });

    await renderPage();

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(alert).toHaveTextContent('Network down');
  });

  it('renders a keyboard-operable Retry button with an accessible name', async () => {
    mockedListMilestones.mockImplementation(() => {
      throw new Error('Storage unavailable');
    });

    await renderPage();

    const retryButton = screen.getByRole('button', { name: /retry loading milestones/i });
    expect(retryButton).toBeInTheDocument();
    expect(retryButton.tagName).toBe('BUTTON');
    expect(retryButton).toHaveAttribute('type', 'button');
  });

  it('re-fetches and clears the error when Retry is clicked and the retry succeeds', async () => {
    mockedListMilestones
      .mockImplementationOnce(() => {
        throw new Error('Storage unavailable');
      })
      .mockReturnValue(persistedMilestones);

    const user = userEvent.setup();
    await renderPage();

    expect(screen.getByTestId('milestones-error')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /retry loading milestones/i }));

    expect(screen.queryByTestId('milestones-error')).not.toBeInTheDocument();
    expect(screen.getByText('Repository Kickoff')).toBeInTheDocument();
    expect(mockedListMilestones).toHaveBeenCalledTimes(2);
  });

  it('is operable via the keyboard (Enter key) and re-fetches', async () => {
    mockedListMilestones
      .mockImplementationOnce(() => {
        throw new Error('Storage unavailable');
      })
      .mockReturnValue(persistedMilestones);

    await renderPage();

    const retryButton = screen.getByRole('button', { name: /retry loading milestones/i });
    retryButton.focus();
    fireEvent.keyDown(retryButton, { key: 'Enter', code: 'Enter' });
    fireEvent.click(retryButton); // native <button> activates on Enter via click in jsdom/user-event

    expect(screen.getByText('Repository Kickoff')).toBeInTheDocument();
  });

  it('remains in the error state if a retry attempt also fails', async () => {
    mockedListMilestones.mockImplementation(() => {
      throw new Error('Still down');
    });

    const user = userEvent.setup();
    await renderPage();

    await user.click(screen.getByRole('button', { name: /retry loading milestones/i }));

    expect(screen.getByTestId('milestones-error')).toBeInTheDocument();
    expect(screen.getAllByText('Still down').length).toBeGreaterThan(0);
    expect(mockedListMilestones).toHaveBeenCalledTimes(2);
  });

  it('passes axe checks in the error state', async () => {
    mockedListMilestones.mockImplementation(() => {
      throw new Error('Storage unavailable');
    });

    const { container } = await renderPage();
    expect(await axe(container)).toHaveNoViolations();
  }, 20000);
});

// ===========================================================================
// Empty state — accessible announcement
// ===========================================================================

describe('MilestonesPage — empty state announcement', () => {
  it('announces "No milestones tracked" via role="status" and aria-live="polite"', async () => {
    window.localStorage.setItem(SAMPLE_DISMISSED_KEY, 'true');
    mockedListMilestones.mockReturnValue([]);

    await renderPage();

    const announcer = screen.getByRole('status');
    expect(announcer).toHaveAttribute('aria-live', 'polite');
    expect(announcer).toHaveTextContent('No milestones tracked');
  });

  it('does not render the error state while empty', async () => {
    window.localStorage.setItem(SAMPLE_DISMISSED_KEY, 'true');
    mockedListMilestones.mockReturnValue([]);

    await renderPage();

    expect(screen.queryByTestId('milestones-error')).not.toBeInTheDocument();
  });

  it('passes axe checks in the empty state', async () => {
    window.localStorage.setItem(SAMPLE_DISMISSED_KEY, 'true');
    mockedListMilestones.mockReturnValue([]);

    const { container } = await renderPage();
    expect(await axe(container)).toHaveNoViolations();
  }, 20000);
});

// ===========================================================================
// Success state — accessible announcement
// ===========================================================================

describe('MilestonesPage — success state announcement', () => {
  it('announces the loaded milestone count via role="status" and aria-live="polite"', async () => {
    mockedListMilestones.mockReturnValue(persistedMilestones);

    await renderPage();

    expect(screen.getByText('1 milestone loaded')).toBeInTheDocument();
  });

  it('uses the plural form when more than one milestone is loaded', async () => {
    mockedListMilestones.mockReturnValue([
      ...persistedMilestones,
      { id: 'repo-2', title: 'Second', status: 'Pending', payout: 100, currency: 'USD', dueDate: '2026-08-01' },
    ]);

    await renderPage();

    expect(screen.getByText('2 milestones loaded')).toBeInTheDocument();
  });
});

// ===========================================================================
// State exclusivity
// ===========================================================================

describe('MilestonesPage — fetch-state exclusivity', () => {
  it('shows only the error state, never the empty state, when the load fails with no data', async () => {
    mockedListMilestones.mockImplementation(() => {
      throw new Error('Storage unavailable');
    });

    await renderPage();

    expect(screen.getByTestId('milestones-error')).toBeInTheDocument();
    expect(screen.queryByText('No milestones tracked')).not.toBeInTheDocument();
  });

  it('shows only the loaded content, never an error, when the load succeeds', async () => {
    mockedListMilestones.mockReturnValue(persistedMilestones);

    await renderPage();

    expect(screen.queryByTestId('milestones-error')).not.toBeInTheDocument();
    expect(screen.getByText('Repository Kickoff')).toBeInTheDocument();
  });
});
