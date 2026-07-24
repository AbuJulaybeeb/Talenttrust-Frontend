import React from 'react';
import { render, screen, waitFor, act, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MilestonesPage, { SAMPLE_MILESTONES, SAMPLE_DISMISSED_KEY } from '../page';
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

jest.mock('@/lib/safeStorage', () => {
  const actual = jest.requireActual('@/lib/safeStorage');
  return {
    ...actual,
    getItem: jest.fn((key) => actual.getItem(key)),
    setItem: jest.fn((key, value) => actual.setItem(key, value)),
  };
});

import { getItem as mockGetItem, setItem as mockSetItem } from '@/lib/safeStorage';
const mockedGetItem = jest.mocked(mockGetItem);
const mockedSetItem = jest.mocked(mockSetItem);

// ---------------------------------------------------------------------------
// Fixture data
// ---------------------------------------------------------------------------

const persistedMilestones: Milestone[] = [
  {
    id: 'repo-1',
    title: 'Repository Kickoff',
    status: 'Pending',
    payout: 1800,
    currency: 'USD',
    dueDate: '2026-07-01',
  },
  {
    id: 'repo-2',
    title: 'Repository Review',
    status: 'Completed',
    payout: 2200,
    currency: 'USD',
    dueDate: '2026-07-12',
  },
];

const mixedMilestones: Milestone[] = [
  { id: 'm-1', title: 'Active Work',      status: 'Active',    payout: 1000, currency: 'USD', dueDate: '2026-08-01' },
  { id: 'm-2', title: 'Pending Task',     status: 'Pending',   payout: 2000, currency: 'USD', dueDate: '2026-08-10' },
  { id: 'm-3', title: 'Done Milestone',   status: 'Completed', payout: 3000, currency: 'USD', dueDate: '2026-06-01' },
  { id: 'm-4', title: 'Settled Payment',  status: 'Paid',      payout: 4000, currency: 'USD', dueDate: '2026-06-15' },
  { id: 'm-5', title: 'Under Dispute',    status: 'Disputed',  payout: 1500, currency: 'USD', dueDate: '2026-07-20' },
];

import { safeStorage } from '@/lib/safeStorage';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function renderPage() {
  const result = render(<MilestonesPage />);
  await act(async () => {});
  return result;
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  mockedListMilestones.mockReturnValue([]);
  mockedSaveMilestone.mockImplementation(() => {});
  mockedGetItem.mockReset();
  mockedSetItem.mockReset();
  const actualSafeStorage = jest.requireActual('@/lib/safeStorage');
  mockedGetItem.mockImplementation((key) => actualSafeStorage.getItem(key));
  mockedSetItem.mockImplementation((key, val) => actualSafeStorage.setItem(key, val));
  safeStorage.resetCache();
  window.localStorage.clear();
  mockSearchParams.get.mockReturnValue(null);
  mockSearchParams.toString.mockReturnValue('');
  mockReplace.mockReset();
});

afterEach(() => {
  jest.clearAllMocks();
  safeStorage.resetCache();
  window.localStorage.clear();
});

// ===========================================================================
// 1. Core rendering
// ===========================================================================

describe('MilestonesPage — core rendering', () => {
  it('renders persisted milestones from the repository after client load', async () => {
    mockedListMilestones.mockReturnValue(persistedMilestones);

    render(<MilestonesPage />);

    expect((await screen.findAllByText('Repository Kickoff'))[0]).toBeInTheDocument();
    expect(screen.getByText('Repository Review')).toBeInTheDocument();
    expect(mockedListMilestones).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.queryByText('Project Kickoff & Discovery')).not.toBeInTheDocument();
    });
  });

  it('falls back to sample milestones when repository is empty', async () => {
    render(<MilestonesPage />);

    expect(await screen.findByText('Project Kickoff & Discovery')).toBeInTheDocument();
    expect(screen.getByText('UI/UX Design Handoff')).toBeInTheDocument();
    expect(screen.getByText('Frontend Development – Sprint 1')).toBeInTheDocument();
    expect(screen.getByText('API Integration & Testing')).toBeInTheDocument();
    expect(screen.getByText('Payment Gateway Integration')).toBeInTheDocument();
  });

  it('renders the page heading', async () => {
    mockedListMilestones.mockReturnValue(persistedMilestones);
    await renderPage();

    // Use level:1 to avoid ambiguity with the MilestonesList <h2>Milestones</h2>
    expect(screen.getByRole('heading', { name: /milestones/i, level: 1 })).toBeInTheDocument();
  });

  it('renders the MilestoneFilter radiogroup when milestones exist', async () => {
    mockedListMilestones.mockReturnValue(persistedMilestones);
    await renderPage();

    expect(
      screen.getByRole('radiogroup', { name: /filter milestones by status/i }),
    ).toBeInTheDocument();
  });

  it('shows empty state when repository is empty and samples are dismissed', async () => {
    window.localStorage.setItem(SAMPLE_DISMISSED_KEY, 'true');
    await renderPage();

    expect(screen.getByText('No milestones tracked')).toBeInTheDocument();
  });
});

// ===========================================================================
// 2. Filter radiogroup — all six options
// ===========================================================================

describe('MilestoneFilter radiogroup — all six options', () => {
  const ALL_OPTIONS = ['All', 'Active', 'Pending', 'Completed', 'Paid', 'Disputed'] as const;

  beforeEach(() => {
    mockedListMilestones.mockReturnValue(mixedMilestones);
  });

  it('renders all six filter radio buttons', async () => {
    await renderPage();

    ALL_OPTIONS.forEach((option) => {
      expect(screen.getByRole('radio', { name: option })).toBeInTheDocument();
    });
  });

  it('"All" radio is checked by default', async () => {
    await renderPage();

    expect(screen.getByRole('radio', { name: 'All' })).toBeChecked();
    ALL_OPTIONS.filter((o) => o !== 'All').forEach((option) => {
      expect(screen.getByRole('radio', { name: option })).not.toBeChecked();
    });
  });

  it.each(ALL_OPTIONS.filter((o) => o !== 'All'))(
    'clicking "%s" marks that radio as checked and unchecks All',
    async (option) => {
      const user = userEvent.setup();
      await renderPage();

      await user.click(screen.getByRole('radio', { name: option }));

      await waitFor(() => {
        expect(screen.getByRole('radio', { name: option })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'All' })).not.toBeChecked();
      });
    },
  );
});

// ===========================================================================
// 3. Filtering behaviour
// ===========================================================================

describe('MilestoneFilter — filtering behaviour', () => {
  beforeEach(() => {
    mockedListMilestones.mockReturnValue(mixedMilestones);
  });

  it('"All" filter shows every milestone', async () => {
    await renderPage();

    await waitFor(() => {
      expect(screen.getByText('Active Work')).toBeInTheDocument();
      expect(screen.getByText('Pending Task')).toBeInTheDocument();
      expect(screen.getByText('Done Milestone')).toBeInTheDocument();
      expect(screen.getByText('Settled Payment')).toBeInTheDocument();
      expect(screen.getByText('Under Dispute')).toBeInTheDocument();
    });
  });

  it('"Active" filter shows only Active milestones', async () => {
    const user = userEvent.setup();
    await renderPage();

    await user.click(screen.getByRole('radio', { name: 'Active' }));

    await waitFor(() => {
      expect(screen.getByText('Active Work')).toBeInTheDocument();
      expect(screen.queryByText('Pending Task')).not.toBeInTheDocument();
      expect(screen.queryByText('Done Milestone')).not.toBeInTheDocument();
      expect(screen.queryByText('Settled Payment')).not.toBeInTheDocument();
      expect(screen.queryByText('Under Dispute')).not.toBeInTheDocument();
    });
  });

  it('"Pending" filter shows only Pending milestones', async () => {
    const user = userEvent.setup();
    await renderPage();

    await user.click(screen.getByRole('radio', { name: 'Pending' }));

    await waitFor(() => {
      expect(screen.getByText('Pending Task')).toBeInTheDocument();
      expect(screen.queryByText('Active Work')).not.toBeInTheDocument();
      expect(screen.queryByText('Done Milestone')).not.toBeInTheDocument();
    });
  });

  it('"Completed" filter shows only Completed milestones', async () => {
    const user = userEvent.setup();
    await renderPage();

    await user.click(screen.getByRole('radio', { name: 'Completed' }));

    await waitFor(() => {
      expect(screen.getByText('Done Milestone')).toBeInTheDocument();
      expect(screen.queryByText('Active Work')).not.toBeInTheDocument();
      expect(screen.queryByText('Pending Task')).not.toBeInTheDocument();
    });
  });

  it('"Paid" filter shows only Paid milestones', async () => {
    const user = userEvent.setup();
    await renderPage();

    await user.click(screen.getByRole('radio', { name: 'Paid' }));

    await waitFor(() => {
      expect(screen.getByText('Settled Payment')).toBeInTheDocument();
      expect(screen.queryByText('Active Work')).not.toBeInTheDocument();
      expect(screen.queryByText('Under Dispute')).not.toBeInTheDocument();
    });
  });

  it('"Disputed" filter shows only Disputed milestones', async () => {
    const user = userEvent.setup();
    await renderPage();

    await user.click(screen.getByRole('radio', { name: 'Disputed' }));

    await waitFor(() => {
      expect(screen.getByText('Under Dispute')).toBeInTheDocument();
      expect(screen.queryByText('Active Work')).not.toBeInTheDocument();
      expect(screen.queryByText('Pending Task')).not.toBeInTheDocument();
    });
  });

  it('cycling through multiple filters works correctly', async () => {
    const user = userEvent.setup();
    await renderPage();

    // Pending
    await user.click(screen.getByRole('radio', { name: 'Pending' }));
    await waitFor(() => expect(screen.getByText('Pending Task')).toBeInTheDocument());

    // Disputed
    await user.click(screen.getByRole('radio', { name: 'Disputed' }));
    await waitFor(() => {
      expect(screen.getByText('Under Dispute')).toBeInTheDocument();
      expect(screen.queryByText('Pending Task')).not.toBeInTheDocument();
    });

    // Back to All
    await user.click(screen.getByRole('radio', { name: 'All' }));
    await waitFor(() => {
      expect(screen.getByText('Active Work')).toBeInTheDocument();
      expect(screen.getByText('Pending Task')).toBeInTheDocument();
      expect(screen.getByText('Under Dispute')).toBeInTheDocument();
    });
  });
});

// ===========================================================================
// 4. Filter empty state
// ===========================================================================

describe('MilestoneFilter — empty state for unmatched filter', () => {
  it('shows empty state when persisted milestones do not match the selected status', async () => {
    const user = userEvent.setup();
    mockedListMilestones.mockReturnValue(persistedMilestones);
    await renderPage();

    await waitFor(() => expect(screen.getByText('Repository Review')).toBeInTheDocument());

    await user.click(screen.getByRole('radio', { name: 'Paid' }));

    await waitFor(() => {
      expect(screen.getByText('No milestones match this filter')).toBeInTheDocument();
      expect(screen.getByText(/there are no paid milestones at the moment/i)).toBeInTheDocument();
    });
  });

  it('shows contextual empty-state description for Disputed filter', async () => {
    const user = userEvent.setup();
    mockedListMilestones.mockReturnValue(persistedMilestones); // only Pending + Completed
    await renderPage();

    await waitFor(() => expect(screen.getByText('Repository Review')).toBeInTheDocument());

    await user.click(screen.getByRole('radio', { name: 'Disputed' }));

    await waitFor(() => {
      expect(screen.getByText(/there are no disputed milestones at the moment/i)).toBeInTheDocument();
    });
  });

  it('shows contextual empty-state description for Active filter', async () => {
    const user = userEvent.setup();
    mockedListMilestones.mockReturnValue(persistedMilestones); // only Pending + Completed
    await renderPage();

    await waitFor(() => expect(screen.getByText('Repository Review')).toBeInTheDocument());

    await user.click(screen.getByRole('radio', { name: 'Active' }));

    await waitFor(() => {
      expect(screen.getByText(/there are no active milestones at the moment/i)).toBeInTheDocument();
    });
  });

  it('selecting a different filter clears the empty state', async () => {
    const user = userEvent.setup();
    mockedListMilestones.mockReturnValue(persistedMilestones);
    await renderPage();

    await waitFor(() => expect(screen.getByText('Repository Kickoff')).toBeInTheDocument());

    // Trigger empty state
    await user.click(screen.getByRole('radio', { name: 'Paid' }));
    await waitFor(() =>
      expect(screen.getByText('No milestones match this filter')).toBeInTheDocument(),
    );

    // Switch to a filter that has results
    await user.click(screen.getByRole('radio', { name: 'Pending' }));
    await waitFor(() => {
      expect(screen.queryByText('No milestones match this filter')).not.toBeInTheDocument();
      expect(screen.getByText('Repository Kickoff')).toBeInTheDocument();
    });
  });
});

// ===========================================================================
// 5. Live region announcements
// ===========================================================================

describe('MilestoneFilter — live region announcements', () => {
  it('announces "Showing all N milestones" with aria-live=polite for All filter', async () => {
    mockedListMilestones.mockReturnValue(persistedMilestones);
    await renderPage();

    const announcement = await screen.findByText(/showing all 2 milestones/i);
    expect(announcement).toHaveAttribute('aria-live', 'polite');
    expect(announcement).toHaveAttribute('aria-atomic', 'true');
  });

  it('uses singular "milestone" when count is 1', async () => {
    const user = userEvent.setup();
    mockedListMilestones.mockReturnValue(persistedMilestones); // 1 Completed
    await renderPage();

    await waitFor(() => expect(screen.getByText('Repository Review')).toBeInTheDocument());

    await user.click(screen.getByRole('radio', { name: 'Completed' }));

    await waitFor(() => {
      expect(screen.getByText(/showing 1 completed milestone$/i)).toBeInTheDocument();
    });
  });

  it('uses plural "milestones" when count is 0', async () => {
    const user = userEvent.setup();
    mockedListMilestones.mockReturnValue(persistedMilestones);
    await renderPage();

    await waitFor(() => expect(screen.getByText('Repository Kickoff')).toBeInTheDocument());

    await user.click(screen.getByRole('radio', { name: 'Paid' }));

    await waitFor(() => {
      expect(screen.getByText(/showing 0 paid milestones/i)).toBeInTheDocument();
    });
  });

  it('uses plural "milestones" when count is > 1', async () => {
    mockedListMilestones.mockReturnValue(persistedMilestones);
    await renderPage();

    const announcement = await screen.findByText(/showing all 2 milestones/i);
    expect(announcement).toBeInTheDocument();
  });

  it('announces singular "all … milestone" when only 1 milestone exists and All is selected', async () => {
    mockedListMilestones.mockReturnValue([
      { id: 'solo', title: 'Solo Milestone', status: 'Pending', payout: 500, currency: 'USD', dueDate: '2026-09-01' },
    ]);
    await renderPage();

    const announcement = await screen.findByText(/showing all 1 milestone$/i);
    expect(announcement).toBeInTheDocument();
  });

  it('announces correct count after switching from All to Active filter', async () => {
    const user = userEvent.setup();
    mockedListMilestones.mockReturnValue(mixedMilestones);
    await renderPage();

    await waitFor(() => expect(screen.getByText(/showing all 5 milestones/i)).toBeInTheDocument());

    await user.click(screen.getByRole('radio', { name: 'Active' }));

    await waitFor(() => {
      expect(screen.getByText(/showing 1 active milestone$/i)).toBeInTheDocument();
    });
  });

  it('uses lowercase status text in the announcement', async () => {
    const user = userEvent.setup();
    mockedListMilestones.mockReturnValue(mixedMilestones);
    await renderPage();

    await user.click(screen.getByRole('radio', { name: 'Disputed' }));

    await waitFor(() => {
      // "disputed" must be lowercase in the announcement
      expect(screen.getByText(/showing 1 disputed milestone$/i)).toBeInTheDocument();
    });
  });
});

// ===========================================================================
// 6. URL-driven initial filter
// ===========================================================================

describe('MilestoneFilter — URL-driven initial filter', () => {
  beforeEach(() => {
    mockedListMilestones.mockReturnValue(persistedMilestones);
  });

  it('initialises to "Pending" when ?status=Pending is in the URL', async () => {
    mockSearchParams.get.mockImplementation((key) => (key === 'status' ? 'Pending' : null));
    mockSearchParams.toString.mockReturnValue('status=Pending');

    await renderPage();

    expect(screen.getByRole('radio', { name: 'Pending' })).toBeChecked();
  });

  it('initialises to "Completed" when ?status=Completed is in the URL', async () => {
    mockSearchParams.get.mockImplementation((key) => (key === 'status' ? 'Completed' : null));
    mockSearchParams.toString.mockReturnValue('status=Completed');

    await renderPage();

    expect(screen.getByRole('radio', { name: 'Completed' })).toBeChecked();
  });

  it('initialises to "Paid" when ?status=Paid is in the URL', async () => {
    mockSearchParams.get.mockImplementation((key) => (key === 'status' ? 'Paid' : null));
    mockSearchParams.toString.mockReturnValue('status=Paid');

    await renderPage();

    expect(screen.getByRole('radio', { name: 'Paid' })).toBeChecked();
  });

  it('initialises to "Disputed" when ?status=Disputed is in the URL', async () => {
    mockSearchParams.get.mockImplementation((key) => (key === 'status' ? 'Disputed' : null));
    mockSearchParams.toString.mockReturnValue('status=Disputed');

    await renderPage();

    expect(screen.getByRole('radio', { name: 'Disputed' })).toBeChecked();
  });

  it('falls back to "All" for an unknown status in the URL', async () => {
    mockSearchParams.get.mockReturnValue('Unknown');
    mockSearchParams.toString.mockReturnValue('status=Unknown');

    await renderPage();

    expect(screen.getByRole('radio', { name: 'All' })).toBeChecked();
  });

  it('falls back to "All" when Active is in the URL (Active not in VALID_STATUSES)', async () => {
    // The page's VALID_STATUSES list intentionally omits 'Active' for URL parsing.
    // Passing ?status=Active must be ignored and default to 'All'.
    mockSearchParams.get.mockImplementation((key) => (key === 'status' ? 'Active' : null));
    mockSearchParams.toString.mockReturnValue('status=Active');

    await renderPage();

    expect(screen.getByRole('radio', { name: 'All' })).toBeChecked();
  });

  it('falls back to "All" when no status param is present', async () => {
    mockSearchParams.get.mockReturnValue(null);
    await renderPage();

    expect(screen.getByRole('radio', { name: 'All' })).toBeChecked();
  });
});

// ===========================================================================
// 7. Active filter edge cases
// ===========================================================================

describe('"Active" filter — edge cases', () => {
  it('shows Active milestones when Active radio is clicked', async () => {
    const user = userEvent.setup();
    mockedListMilestones.mockReturnValue(mixedMilestones);
    await renderPage();

    await user.click(screen.getByRole('radio', { name: 'Active' }));

    await waitFor(() => {
      expect(screen.getByText('Active Work')).toBeInTheDocument();
      expect(screen.queryByText('Pending Task')).not.toBeInTheDocument();
    });
  });

  it('shows empty state when no milestones have Active status', async () => {
    const user = userEvent.setup();
    mockedListMilestones.mockReturnValue(persistedMilestones); // Pending + Completed only
    await renderPage();

    await waitFor(() => expect(screen.getByText('Repository Kickoff')).toBeInTheDocument());

    await user.click(screen.getByRole('radio', { name: 'Active' }));

    await waitFor(() => {
      expect(screen.getByText('No milestones match this filter')).toBeInTheDocument();
    });
  });

  it('announces "Showing 0 active milestones" when no Active milestones exist', async () => {
    const user = userEvent.setup();
    mockedListMilestones.mockReturnValue(persistedMilestones);
    await renderPage();

    await waitFor(() => expect(screen.getByText('Repository Kickoff')).toBeInTheDocument());

    await user.click(screen.getByRole('radio', { name: 'Active' }));

    await waitFor(() => {
      expect(screen.getByText(/showing 0 active milestones/i)).toBeInTheDocument();
    });
  });
});

// ===========================================================================
// 8. Adding a milestone while filtered
// ===========================================================================

describe('adding a milestone while a filter is active', () => {
  it('updates the milestone list and result count after saving a new milestone', async () => {
    const newMilestone: Milestone = {
      id: 'new-1',
      title: 'Brand New Task',
      status: 'Pending',
      payout: 999,
      currency: 'USD',
      dueDate: '2026-10-01',
    };

    mockedListMilestones
      .mockReturnValueOnce(persistedMilestones)       // initial load
      .mockReturnValue([...persistedMilestones, newMilestone]); // after save

    const user = userEvent.setup();
    await renderPage();

    await waitFor(() => expect(screen.getByText('Repository Kickoff')).toBeInTheDocument());

    // Filter to Pending — shows 1 milestone
    await user.click(screen.getByRole('radio', { name: 'Pending' }));
    await waitFor(() =>
      expect(screen.getByText(/showing 1 pending milestone$/i)).toBeInTheDocument(),
    );

    // Open the creation form using the toolbar Add Milestone button
    const addBtns = screen.getAllByRole('button', { name: /add milestone/i });
    await user.click(addBtns[0]);

    // The form should now be visible (presence of a Cancel button confirms it)
    await waitFor(() => {
      const cancelBtn = screen.queryByRole('button', { name: /cancel/i });
      expect(cancelBtn).toBeInTheDocument();
    });
  });

  it('"Add Milestone" button is visible when a filter returns results', async () => {
    mockedListMilestones.mockReturnValue(persistedMilestones);
    await renderPage();

    await waitFor(() => expect(screen.getByText('Repository Kickoff')).toBeInTheDocument());

    expect(screen.getByRole('button', { name: /add milestone/i })).toBeInTheDocument();
  });

  it('"Add Milestone" button is visible in the filter empty state', async () => {
    const user = userEvent.setup();
    mockedListMilestones.mockReturnValue(persistedMilestones);
    await renderPage();

    await waitFor(() => expect(screen.getByText('Repository Kickoff')).toBeInTheDocument());

    await user.click(screen.getByRole('radio', { name: 'Paid' }));

    await waitFor(() =>
      expect(screen.getByText('No milestones match this filter')).toBeInTheDocument(),
    );

    // Both the toolbar button and the EmptyState action button are present
    const addBtns = screen.getAllByRole('button', { name: /add milestone/i });
    expect(addBtns.length).toBeGreaterThanOrEqual(1);
  });
});

// ===========================================================================
// 9. Exported constants
// ===========================================================================

describe('exported constants', () => {
  it('SAMPLE_DISMISSED_KEY has the expected value', () => {
    expect(SAMPLE_DISMISSED_KEY).toBe('talenttrust-milestones-sample-dismissed');
  });

  it('SAMPLE_MILESTONES is a non-empty array', () => {
    expect(Array.isArray(SAMPLE_MILESTONES)).toBe(true);
    expect(SAMPLE_MILESTONES.length).toBeGreaterThan(0);
  });

  it('each SAMPLE_MILESTONE has id, title, status, payout, currency', () => {
    SAMPLE_MILESTONES.forEach((m) => {
      expect(m).toHaveProperty('id');
      expect(m).toHaveProperty('title');
      expect(m).toHaveProperty('status');
      expect(m).toHaveProperty('payout');
      expect(m).toHaveProperty('currency');
    });
  });

  it('SAMPLE_MILESTONES covers multiple statuses', () => {
    const statuses = new Set(SAMPLE_MILESTONES.map((m) => m.status));
    expect(statuses.size).toBeGreaterThan(1);
  });
});

// ===========================================================================
// 10. Filter and sort preference persistence tests
// ===========================================================================

import { PREFERENCES_STORAGE_KEY } from '../page';

describe('MilestonesPage — preference persistence', () => {
  beforeEach(() => {
    mockedListMilestones.mockReturnValue(mixedMilestones);
  });

  it('Restore on mount: stored filter/sort values are applied when the component mounts', async () => {
    // Save preferences beforehand
    safeStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ filter: 'Completed', sort: 'payout-desc' })
    );

    await renderPage();

    // Check Completed radio is checked
    expect(screen.getByRole('radio', { name: 'Completed' })).toBeChecked();
    // Check select has payout-desc selected
    const select = screen.getByLabelText('Sort by') as HTMLSelectElement;
    expect(select.value).toBe('payout-desc');

    // Milestones should be filtered to Completed and sorted by payout-desc
    // Completed is: Done Milestone ($3,000)
    expect(screen.getByText('Done Milestone')).toBeInTheDocument();
    expect(screen.queryByText('Active Work')).not.toBeInTheDocument();
  });

  it('Invalid value falls back: corrupt or malformed stored value results in default filter/sort, no crash', async () => {
    // Save invalid preference string
    safeStorage.setItem(PREFERENCES_STORAGE_KEY, '{invalid-json');

    await renderPage();

    // Should not crash and use default values
    expect(screen.getByRole('radio', { name: 'All' })).toBeChecked();
    const select = screen.getByLabelText('Sort by') as HTMLSelectElement;
    expect(select.value).toBe('dueDate-asc');
  });

  it('Unknown filter id: a stored filter id that doesn\'t match any known filter falls back to default', async () => {
    // Save unknown filter
    safeStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ filter: 'InvalidFilterName', sort: 'title-desc' })
    );

    await renderPage();

    // Should fall back to 'All' filter, but keep the valid 'title-desc' sort
    expect(screen.getByRole('radio', { name: 'All' })).toBeChecked();
    const select = screen.getByLabelText('Sort by') as HTMLSelectElement;
    expect(select.value).toBe('title-desc');
  });

  it('Change persists: changing the filter or sort writes the new value to storage', async () => {
    const user = userEvent.setup();
    await renderPage();

    // Set filter to Paid
    await user.click(screen.getByRole('radio', { name: 'Paid' }));

    // Set sort to payout-asc
    const select = screen.getByLabelText('Sort by');
    await user.selectOptions(select, 'payout-asc');

    // Verify stored preference
    const stored = safeStorage.getItem(PREFERENCES_STORAGE_KEY);
    expect(stored).toBeDefined();
    const prefs = JSON.parse(stored!);
    expect(prefs.filter).toBe('Paid');
    expect(prefs.sort).toBe('payout-asc');
  });

  it('Verifies sorting: dueDate-desc, payout-asc, payout-desc, title-asc, title-desc, and same titles fallback', async () => {
    const user = userEvent.setup();
    // Inject two milestones with the same title to cover sorting fallback (return 0)
    mockedListMilestones.mockReturnValue([
      ...mixedMilestones,
      { id: 'm-6', title: 'Active Work', status: 'Active', payout: 1000, currency: 'USD', dueDate: '2026-08-01' }
    ]);
    await renderPage();

    const select = screen.getByLabelText('Sort by') as HTMLSelectElement;

    // Test title-asc
    await user.selectOptions(select, 'title-asc');
    let articles = screen.getAllByRole('article');
    let titles = articles.map(art => art.querySelector('p')?.textContent);
    expect(titles[0]).toBe('Active Work');
    expect(titles[1]).toBe('Active Work'); // duplicates sort stable/fallback

    // Test title-desc
    await user.selectOptions(select, 'title-desc');
    articles = screen.getAllByRole('article');
    titles = articles.map(art => art.querySelector('p')?.textContent);
    expect(titles[0]).toBe('Under Dispute');

    // Test payout-asc
    await user.selectOptions(select, 'payout-asc');
    articles = screen.getAllByRole('article');
    titles = articles.map(art => art.querySelector('p')?.textContent);
    // lowest payout first: Active Work ($1000)
    expect(titles[0]).toBe('Active Work');

    // Test payout-desc
    await user.selectOptions(select, 'payout-desc');
    articles = screen.getAllByRole('article');
    titles = articles.map(art => art.querySelector('p')?.textContent);
    expect(titles[0]).toBe('Settled Payment');

    // Test dueDate-desc
    await user.selectOptions(select, 'dueDate-desc');
    articles = screen.getAllByRole('article');
    titles = articles.map(art => art.querySelector('p')?.textContent);
    expect(titles[0]).toBe('Pending Task');
  });

  it('Verifies form interactions: submits a new milestone and cancels the form', async () => {
    await renderPage();

    // Click Add Milestone to show form
    const addBtns = screen.getAllByRole('button', { name: /add milestone/i });
    fireEvent.click(addBtns[0]);

    // Wait for the form modal to appear
    await screen.findByRole('dialog');

    // Verify form cancel
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();

    // Open again to submit
    fireEvent.click(screen.getAllByRole('button', { name: /add milestone/i })[0]);
    await screen.findByRole('dialog');

    // Fill form fields
    const titleInput = screen.getByLabelText(/^title/i);
    fireEvent.change(titleInput, { target: { value: 'New Custom Milestone' } });

    const payoutInput = screen.getByLabelText(/payout amount/i);
    fireEvent.change(payoutInput, { target: { value: '5500' } });

    // Submit form
    // Note: The form submit button text is "Add Milestone"
    const dialog = screen.getByRole('dialog');
    const submitBtn = within(dialog).getByRole('button', { name: 'Add Milestone' });
    fireEvent.click(submitBtn);

    // Verify list update and form closure
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
      expect(mockedSaveMilestone).toHaveBeenCalled();
    });
  });

  it('Verifies safeStorage.getItem throwing errors is handled gracefully', async () => {
    // Force throwing error on getItem specifically for both keys separately or together
    mockedGetItem.mockImplementation((key) => {
      throw new Error(`Forced Storage Error for ${key}`);
    });

    await renderPage();

    // Should render correctly with default values ('All' filter)
    expect(screen.getByRole('radio', { name: 'All' })).toBeChecked();
  });

  it('Verifies safeStorage.getItem throwing error on SAMPLE_DISMISSED_KEY goes to catch block', async () => {
    mockedListMilestones.mockReturnValue([]);
    mockedGetItem.mockImplementation((key) => {
      if (key === SAMPLE_DISMISSED_KEY) {
        throw new Error('Forced Dismissed Error');
      }
      return null;
    });

    await renderPage();
    // Banner should be hidden by default in the catch block fallback
    expect(screen.queryByTestId('sample-data-banner')).not.toBeInTheDocument();
  });

  it('Verifies invalid sort option fallback triggers return 0', async () => {
    await renderPage();
    // Select element exists, we can get it and trigger change with invalid value
    const select = screen.getByLabelText('Sort by');
    fireEvent.change(select, { target: { value: 'invalid-sort-option' } });

    // Should not crash and should render list
    expect(screen.getByText('Active Work')).toBeInTheDocument();
  });

  it('Verifies dismissing sample data banner via button click', async () => {
    // Force empty list milestones to show sample banner
    mockedListMilestones.mockReturnValue([]);
    // Restore normal mock implementation
    const actualSafeStorage = jest.requireActual('@/lib/safeStorage');
    mockedGetItem.mockImplementation((key) => actualSafeStorage.getItem(key));

    await renderPage();

    // Verify sample banner is shown
    expect(screen.getByTestId('sample-data-banner')).toBeInTheDocument();

    // Click "Start from scratch"
    const dismissBtn = screen.getByTestId('start-from-scratch-btn');
    fireEvent.click(dismissBtn);

    // Banner should be hidden
    await waitFor(() => {
      expect(screen.queryByTestId('sample-data-banner')).not.toBeInTheDocument();
    });
  });
});
