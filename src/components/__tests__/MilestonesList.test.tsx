import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { axe } from 'jest-axe';

const mockStatusBadge = jest.fn(({ status }: { status: string }) => <span>{status}</span>);

jest.mock('../StatusBadge', () => ({
  __esModule: true,
  default: ({ status }: { status: string }) => mockStatusBadge({ status }),
  statusColorMap: {},
  statusIconMap: {},
}));

import MilestonesList, { filterMilestonesByTitle, sortMilestones, type SortOption } from '../MilestonesList';
import type { Milestone } from '../MilestonesList';
import { parseLocalDate, isDueSoon } from '../../lib/dueSoon';

const SAMPLE: Milestone[] = [
  { id: '1', title: 'Milestone 1', status: 'Pending', payout: 500, currency: 'USD', dueDate: 'May 10, 2026' },
  { id: '2', title: 'Milestone 2', status: 'Completed', payout: 1000, currency: 'USD', dueDate: 'Jun 1, 2026' },
];

const MIXED_CURRENCY_SAMPLE: Milestone[] = [
  { id: '1', title: 'Milestone 1', status: 'Pending', payout: 500, currency: 'USD', dueDate: 'May 10, 2026' },
  { id: '2', title: 'Milestone 2', status: 'Completed', payout: 1000, currency: 'EUR', dueDate: 'Jun 1, 2026' },
  { id: '3', title: 'Milestone 3', status: 'Pending', payout: 250, currency: 'GBP', dueDate: 'Jun 15, 2026' },
];

const scrollRegion = (container: HTMLElement) =>
  container.querySelector('.max-h-\\[calc\\(100vh-260px\\)\\]') as HTMLElement;

describe('MilestonesList', () => {
  it('renders each milestone item with status and payout', () => {
    render(<MilestonesList milestones={SAMPLE} />);

    expect(screen.getByText('Milestone 1')).toBeInTheDocument();
    expect(screen.getByText('Milestone 2')).toBeInTheDocument();
    expect(screen.getAllByText('Pending').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Completed').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('$500.00')).toBeInTheDocument();
    expect(screen.getByText('$1,000.00')).toBeInTheDocument();
  });

  describe('scroll region labelling', () => {
    it('associates the region with the visible heading via aria-labelledby', () => {
      const { container } = render(<MilestonesList milestones={SAMPLE} />);

      const heading = screen.getByRole('heading', { name: 'Milestones' });
      expect(heading).toHaveAttribute('id', 'milestones-title');

      const region = scrollRegion(container);
      expect(region).toHaveAttribute('role', 'region');
      expect(region.getAttribute('aria-labelledby')).toContain('milestones-title');
    });

    it('includes the count span id in aria-labelledby', () => {
      const { container } = render(<MilestonesList milestones={SAMPLE} />);

      const countSpan = container.querySelector('#milestones-count');
      expect(countSpan).toBeInTheDocument();
      expect(countSpan).toHaveTextContent('2 total');

      const region = scrollRegion(container);
      expect(region.getAttribute('aria-labelledby')).toContain('milestones-count');
    });

    it('count span reflects a single-item list', () => {
      const { container } = render(
        <MilestonesList milestones={[SAMPLE[0]]} />
      );
      expect(container.querySelector('#milestones-count')).toHaveTextContent('1 total');
    });

    it('does not apply region attributes when the list is empty', () => {
      const { container } = render(<MilestonesList milestones={[]} />);
      const region = scrollRegion(container);
      expect(region).not.toHaveAttribute('role');
      expect(region).not.toHaveAttribute('tabIndex');
      expect(region).not.toHaveAttribute('aria-labelledby');
    });

    it('does not use a static aria-label on the scroll region', () => {
      const { container } = render(<MilestonesList milestones={SAMPLE} />);
      expect(scrollRegion(container)).not.toHaveAttribute('aria-label');
    });
  });

  it('makes the scroll region keyboard-focusable with focus-ring styles when populated', () => {
    const { container } = render(<MilestonesList milestones={SAMPLE} />);
    const region = scrollRegion(container);
    expect(region).toHaveAttribute('tabIndex', '0');
    expect(region).toHaveClass(
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-[var(--ring)]',
      'focus-visible:ring-offset-2'
    );
  });

  it('does not render a currency warning when the contract currency is absent', () => {
    render(<MilestonesList milestones={MIXED_CURRENCY_SAMPLE} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders an accessible warning for milestone currencies that differ from the contract', () => {
    render(
      <MilestonesList
        milestones={MIXED_CURRENCY_SAMPLE}
        contractCurrency="usd"
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('2 milestones use EUR, GBP instead of USD.');
    expect(alert).toHaveTextContent('Milestone 2: €1,000.00');
    expect(alert).toHaveTextContent('Milestone 3: £250.00');
  });

  it('passes axe accessibility checks with a populated list', async () => {
    const { container } = render(<MilestonesList milestones={SAMPLE} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('does not re-render milestone rows when unrelated parent state changes', () => {
    mockStatusBadge.mockClear();

    const milestones: Milestone[] = [
      { id: '1', title: 'Row A', status: 'Pending', payout: 500, currency: 'USD', dueDate: 'May 10, 2026' },
      { id: '2', title: 'Row B', status: 'Active', payout: 1000, currency: 'USD', dueDate: 'Jun 1, 2026' },
    ];

    function Harness() {
      const [count, setCount] = React.useState(0);

      return (
        <div>
          <button type="button" onClick={() => setCount((value) => value + 1)}>
            toggle unrelated state
          </button>
          <span>{count}</span>
          <MilestonesList milestones={milestones} />
        </div>
      );
    }

    render(<Harness />);
    mockStatusBadge.mockClear();

    fireEvent.click(screen.getByRole('button', { name: 'toggle unrelated state' }));

    expect(mockStatusBadge).not.toHaveBeenCalled();
  });

  it('passes axe accessibility checks with a currency mismatch warning', async () => {
    const { container } = render(
      <MilestonesList
        milestones={MIXED_CURRENCY_SAMPLE}
        contractCurrency="USD"
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe accessibility checks with an empty list', async () => {
    const { container } = render(<MilestonesList milestones={[]} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  describe('due-soon reminder banner', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2026-05-10T12:00:00'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('does not render banner if no milestones are due soon', () => {
      const milestones: Milestone[] = [
        { id: '1', title: 'Future Milestone', status: 'Pending', payout: 500, currency: 'USD', dueDate: 'May 20, 2026' }, // 10 days away
        { id: '2', title: 'TBD Milestone', status: 'Pending', payout: 1000, currency: 'USD', dueDate: undefined },
      ];
      render(<MilestonesList milestones={milestones} />);
      expect(screen.queryByText(/due within/i)).not.toBeInTheDocument();
    });

    it('renders banner with correct pluralization for 1 due-soon milestone', () => {
      const milestones: Milestone[] = [
        { id: '1', title: 'Due Soon Milestone', status: 'Pending', payout: 500, currency: 'USD', dueDate: 'May 15, 2026' }, // 5 days away
      ];
      render(<MilestonesList milestones={milestones} />);
      expect(screen.getByText('1 milestone is due within 7 days')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Due Soon Milestone' })).toHaveAttribute('href', '#milestone-1');
    });

    it('renders banner with correct pluralization for multiple due-soon milestones', () => {
      const milestones: Milestone[] = [
        { id: '1', title: 'Milestone A', status: 'Pending', payout: 500, currency: 'USD', dueDate: 'May 12, 2026' }, // 2 days away
        { id: '2', title: 'Milestone B', status: 'Active', payout: 1000, currency: 'USD', dueDate: 'May 17, 2026' }, // 7 days away
      ];
      render(<MilestonesList milestones={milestones} />);
      expect(screen.getByText('2 milestones are due within 7 days')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Milestone A' })).toHaveAttribute('href', '#milestone-1');
      expect(screen.getByRole('link', { name: 'Milestone B' })).toHaveAttribute('href', '#milestone-2');
    });

    it('excludes milestones with terminal statuses (Paid, Completed)', () => {
      const milestones: Milestone[] = [
        { id: '1', title: 'Milestone A', status: 'Paid', payout: 500, currency: 'USD', dueDate: 'May 12, 2026' }, // 2 days away (Paid)
        { id: '2', title: 'Milestone B', status: 'Completed', payout: 1000, currency: 'USD', dueDate: 'May 15, 2026' }, // 5 days away (Completed)
      ];
      render(<MilestonesList milestones={milestones} />);
      expect(screen.queryByText(/due within/i)).not.toBeInTheDocument();
    });

    it('handles exactly-at-boundary due dates (today and 7 days from now)', () => {
      const milestones: Milestone[] = [
        { id: '1', title: 'Due Today', status: 'Pending', payout: 500, currency: 'USD', dueDate: '2026-05-10' }, // Today (May 10)
        { id: '2', title: 'Due in 7 Days', status: 'Pending', payout: 1000, currency: 'USD', dueDate: '2026-05-17' }, // Exactly 7 days
      ];
      render(<MilestonesList milestones={milestones} />);
      expect(screen.getByText('2 milestones are due within 7 days')).toBeInTheDocument();
    });

    it('ignores milestones with invalid/unparseable due dates', () => {
      const milestones: Milestone[] = [
        { id: '1', title: 'Invalid Date', status: 'Pending', payout: 500, currency: 'USD', dueDate: 'Not a Date' },
      ];
      render(<MilestonesList milestones={milestones} />);
      expect(screen.queryByText(/due within/i)).not.toBeInTheDocument();
    });

    it('hides the banner on dismiss and shifts focus to the scroll region', async () => {
      const milestones: Milestone[] = [
        { id: '1', title: 'Due Soon', status: 'Pending', payout: 500, currency: 'USD', dueDate: 'May 15, 2026' },
      ];
      const { container } = render(<MilestonesList milestones={milestones} />);
      
      const dismissBtn = screen.getByRole('button', { name: 'Dismiss reminder' });
      expect(dismissBtn).toBeInTheDocument();
      
      // Focus the dismiss button first to simulate user keyboard interaction
      dismissBtn.focus();
      expect(document.activeElement).toBe(dismissBtn);

      // Click the dismiss button
      fireEvent.click(dismissBtn);

      // Banner should be removed
      expect(screen.queryByText(/due within/i)).not.toBeInTheDocument();

      // Focus should shift to the scroll container
      const region = container.querySelector('.max-h-\\[calc\\(100vh-260px\\)\\]');
      expect(document.activeElement).toBe(region);
    });
  });

  it('passes axe accessibility checks when banner is rendered', async () => {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowStr = tomorrow.toLocaleDateString('en-US');
    const milestones: Milestone[] = [
      { id: '1', title: 'Due Soon', status: 'Pending', payout: 500, currency: 'USD', dueDate: tomorrowStr },
    ];
    const { container } = render(<MilestonesList milestones={milestones} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  describe('status legend', () => {
    const ALL_STATUSES = ['Active', 'Completed', 'Disputed', 'Pending', 'Paid'];

    it('renders a status legend with all five statuses and their text labels', () => {
      render(<MilestonesList milestones={SAMPLE} />);

      const legend = screen.getByRole('list', { name: 'Status legend' });
      expect(legend).toBeInTheDocument();
      expect(legend).toHaveAttribute('id', 'milestones-status-legend');

      // "Status key:" label is present
      expect(screen.getByText('Status key:')).toBeInTheDocument();

      // Each status appears as a listitem with its text label
      const legendItems = within(legend).getAllByRole('listitem');
      const legendStatusTexts = legendItems.map((el) => el.textContent ?? '');
      for (const status of ALL_STATUSES) {
        expect(legendStatusTexts.some((t) => t.includes(status))).toBe(true);
      }
    });

    it('renders the legend even when only a single status is present in the data', () => {
      const singleStatusMilestones: Milestone[] = [
        { id: '1', title: 'Only Pending', status: 'Pending', payout: 500, currency: 'USD', dueDate: 'May 10, 2026' },
        { id: '2', title: 'Also Pending', status: 'Pending', payout: 300, currency: 'USD', dueDate: 'May 12, 2026' },
      ];

      render(<MilestonesList milestones={singleStatusMilestones} />);

      const legend = screen.getByRole('list', { name: 'Status legend' });
      expect(legend).toBeInTheDocument();

      // Legend lists all 5 statuses (not just "Pending") with text labels
      for (const status of ALL_STATUSES) {
        expect(legend.textContent).toContain(status);
      }
    });

    it('renders the legend even with an empty milestones list', () => {
      render(<MilestonesList milestones={[]} />);

      const legend = screen.getByRole('list', { name: 'Status legend' });
      expect(legend).toBeInTheDocument();

      // All 5 statuses are present as text labels even when no milestones exist
      for (const status of ALL_STATUSES) {
        expect(legend.textContent).toContain(status);
      }
    });

    it('renders the legend when all five statuses are present in the data', () => {
      const allStatusesMilestones: Milestone[] = ALL_STATUSES.map((status, i) => ({
        id: String(i + 1),
        title: `Milestone ${status}`,
        status: status as Milestone['status'],
        payout: 100 * (i + 1),
        currency: 'USD',
        dueDate: 'May 10, 2026',
      }));

      render(<MilestonesList milestones={allStatusesMilestones} />);

      const legend = screen.getByRole('list', { name: 'Status legend' });
      expect(legend).toBeInTheDocument();

      // All 5 statuses are present as text labels in the legend
      for (const status of ALL_STATUSES) {
        expect(legend.textContent).toContain(status);
      }
    });

    it('uses status icons (not color alone) to convey meaning', () => {
      render(<MilestonesList milestones={SAMPLE} />);

      const legend = screen.getByRole('list', { name: 'Status legend' });

      // Icons in the legend are marked aria-hidden (decorative) while status text provides the meaning
      const iconSpans = legend.querySelectorAll('span[aria-hidden="true"]');
      expect(iconSpans.length).toBe(ALL_STATUSES.length);

      // Verify each icon span contains a non-empty icon character
      for (const iconSpan of iconSpans) {
        expect(iconSpan.textContent?.trim().length).toBeGreaterThan(0);
      }

      // The legend conveys status by text — each status name is visible as readable text
      for (const status of ALL_STATUSES) {
        expect(legend.textContent).toContain(status);
      }
    });
  });

  describe('dueSoon helper utilities', () => {
    it('parseLocalDate returns null for invalid types and empty values', () => {
      expect(parseLocalDate('')).toBeNull();
      expect(parseLocalDate(null as any)).toBeNull();
      expect(parseLocalDate(undefined as any)).toBeNull();
      expect(parseLocalDate(123 as any)).toBeNull();
    });

    it('parseLocalDate returns null for invalid date strings', () => {
      expect(parseLocalDate('not-a-date')).toBeNull();
      expect(parseLocalDate('2026-99-99')).toBeNull();
    });

    it('parseLocalDate parses ISO format to local midnight correctly', () => {
      const date = parseLocalDate('2026-05-15');
      expect(date).not.toBeNull();
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(4); // 0-indexed May
      expect(date?.getDate()).toBe(15);
    });

    it('isDueSoon returns false for missing or invalid dates', () => {
      const today = new Date('2026-05-10');
      expect(isDueSoon(undefined, today, 7)).toBe(false);
      expect(isDueSoon('not-a-date', today, 7)).toBe(false);
    });
  });
});
