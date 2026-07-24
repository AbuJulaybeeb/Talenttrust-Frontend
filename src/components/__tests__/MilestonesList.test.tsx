import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
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

const SEARCH_SORT_SAMPLE: Milestone[] = [
  { id: '1', title: 'Design Phase', status: 'Pending', payout: 500, currency: 'USD', dueDate: 'May 10, 2026' },
  { id: '2', title: 'Development Phase', status: 'Active', payout: 1500, currency: 'USD', dueDate: 'Jun 1, 2026' },
  { id: '3', title: 'Testing Phase', status: 'Pending', payout: 750, currency: 'USD', dueDate: 'May 20, 2026' },
  { id: '4', title: 'Deployment', status: 'Completed', payout: 250, currency: 'USD', dueDate: 'Jun 15, 2026' },
  { id: '5', title: 'Documentation', status: 'Pending', payout: 300, currency: 'USD', dueDate: undefined },
];

const scrollRegion = (container: HTMLElement) =>
  container.querySelector('.max-h-\\[calc\\(100vh-260px\\)\\]') as HTMLElement;

describe('MilestonesList', () => {
  it('renders each milestone item with status and payout', () => {
    render(<MilestonesList milestones={SAMPLE} />);

    expect(screen.getByText('Milestone 1')).toBeInTheDocument();
    expect(screen.getByText('Milestone 2')).toBeInTheDocument();
    expect(screen.getAllByText('Pending')).toHaveLength(2);
    expect(screen.getAllByText('Completed')).toHaveLength(2);
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

  describe('search and sort functionality', () => {
    it('renders search input and sort select', () => {
      render(<MilestonesList milestones={SEARCH_SORT_SAMPLE} />);

      expect(screen.getByLabelText('Search milestones')).toBeInTheDocument();
      expect(screen.getByLabelText('Sort by:')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('filters milestones by title case-insensitively', () => {
      render(<MilestonesList milestones={SEARCH_SORT_SAMPLE} />);

      const searchInput = screen.getByLabelText('Search milestones');
      fireEvent.change(searchInput, { target: { value: 'design' } });

      expect(screen.getByText('Design Phase')).toBeInTheDocument();
      expect(screen.queryByText('Development Phase')).not.toBeInTheDocument();
      expect(screen.queryByText('Testing Phase')).not.toBeInTheDocument();
    });

    it('filters milestones with partial matches', () => {
      render(<MilestonesList milestones={SEARCH_SORT_SAMPLE} />);

      const searchInput = screen.getByLabelText('Search milestones');
      fireEvent.change(searchInput, { target: { value: 'phase' } });

      expect(screen.getByText('Design Phase')).toBeInTheDocument();
      expect(screen.getByText('Development Phase')).toBeInTheDocument();
      expect(screen.getByText('Testing Phase')).toBeInTheDocument();
      expect(screen.queryByText('Deployment')).not.toBeInTheDocument();
    });

    it('shows all milestones when search query is empty', () => {
      render(<MilestonesList milestones={SEARCH_SORT_SAMPLE} />);

      const searchInput = screen.getByLabelText('Search milestones');
      fireEvent.change(searchInput, { target: { value: 'design' } });
      expect(screen.queryByText('Deployment')).not.toBeInTheDocument();

      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByText('Deployment')).toBeInTheDocument();
      expect(screen.getByText('Documentation')).toBeInTheDocument();
    });

    it('shows no matches message when filter returns empty results', () => {
      render(<MilestonesList milestones={SEARCH_SORT_SAMPLE} />);

      const searchInput = screen.getByLabelText('Search milestones');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      expect(screen.getByText('No milestones match your search.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();
    });

    it('clears search when clear button is clicked', () => {
      render(<MilestonesList milestones={SEARCH_SORT_SAMPLE} />);

      const searchInput = screen.getByLabelText('Search milestones');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      const clearButton = screen.getByRole('button', { name: 'Clear search' });
      fireEvent.click(clearButton);

      expect(screen.getByText('Design Phase')).toBeInTheDocument();
      expect(searchInput).toHaveValue('');
    });

    it('announces filtered result count via aria-live region', () => {
      render(<MilestonesList milestones={SEARCH_SORT_SAMPLE} />);

      const searchInput = screen.getByLabelText('Search milestones');
      fireEvent.change(searchInput, { target: { value: 'phase' } });

      expect(screen.getByText('Showing 3 of 5 milestones')).toBeInTheDocument();
    });

    it('announces all results when filter matches everything', () => {
      render(<MilestonesList milestones={SEARCH_SORT_SAMPLE} />);

      const searchInput = screen.getByLabelText('Search milestones');
      fireEvent.change(searchInput, { target: { value: '' } });

      expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
    });

    it('sorts milestones by due date ascending', () => {
      render(<MilestonesList milestones={SEARCH_SORT_SAMPLE} />);

      const sortSelect = screen.getByRole('combobox');
      fireEvent.change(sortSelect, { target: { value: 'dueDate-asc' } });

      const milestones = screen.getAllByRole('article');
      expect(milestones[0]).toHaveTextContent('Design Phase');
      expect(milestones[1]).toHaveTextContent('Testing Phase');
      expect(milestones[2]).toHaveTextContent('Development Phase');
      expect(milestones[3]).toHaveTextContent('Deployment');
    });

    it('sorts milestones by due date descending', () => {
      render(<MilestonesList milestones={SEARCH_SORT_SAMPLE} />);

      const sortSelect = screen.getByRole('combobox');
      fireEvent.change(sortSelect, { target: { value: 'dueDate-desc' } });

      const milestones = screen.getAllByRole('article');
      expect(milestones[0]).toHaveTextContent('Deployment');
      expect(milestones[1]).toHaveTextContent('Development Phase');
      expect(milestones[2]).toHaveTextContent('Testing Phase');
      expect(milestones[3]).toHaveTextContent('Design Phase');
    });

    it('sorts milestones by payout ascending', () => {
      render(<MilestonesList milestones={SEARCH_SORT_SAMPLE} />);

      const sortSelect = screen.getByRole('combobox');
      fireEvent.change(sortSelect, { target: { value: 'payout-asc' } });

      const milestones = screen.getAllByRole('article');
      expect(milestones[0]).toHaveTextContent('$250.00');
      expect(milestones[1]).toHaveTextContent('$300.00');
      expect(milestones[2]).toHaveTextContent('$500.00');
      expect(milestones[3]).toHaveTextContent('$750.00');
    });

    it('sorts milestones by payout descending', () => {
      render(<MilestonesList milestones={SEARCH_SORT_SAMPLE} />);

      const sortSelect = screen.getByRole('combobox');
      fireEvent.change(sortSelect, { target: { value: 'payout-desc' } });

      const milestones = screen.getAllByRole('article');
      expect(milestones[0]).toHaveTextContent('$1,500.00');
      expect(milestones[1]).toHaveTextContent('$750.00');
      expect(milestones[2]).toHaveTextContent('$500.00');
      expect(milestones[3]).toHaveTextContent('$300.00');
    });

    it('places milestones without due dates at end when sorting by due date', () => {
      render(<MilestonesList milestones={SEARCH_SORT_SAMPLE} />);

      const sortSelect = screen.getByRole('combobox');
      fireEvent.change(sortSelect, { target: { value: 'dueDate-asc' } });

      const milestones = screen.getAllByRole('article');
      expect(milestones[milestones.length - 1]).toHaveTextContent('Documentation');
    });

    it('combines filter and sort correctly', () => {
      render(<MilestonesList milestones={SEARCH_SORT_SAMPLE} />);

      const searchInput = screen.getByLabelText('Search milestones');
      fireEvent.change(searchInput, { target: { value: 'phase' } });

      const sortSelect = screen.getByRole('combobox');
      fireEvent.change(sortSelect, { target: { value: 'payout-desc' } });

      const milestones = screen.getAllByRole('article');
      expect(milestones[0]).toHaveTextContent('Development Phase');
      expect(milestones[1]).toHaveTextContent('Testing Phase');
      expect(milestones[2]).toHaveTextContent('Design Phase');
    });

    it('handles single item list with search and sort', () => {
      const singleMilestone: Milestone[] = [
        { id: '1', title: 'Single Milestone', status: 'Pending', payout: 500, currency: 'USD', dueDate: 'May 10, 2026' },
      ];

      render(<MilestonesList milestones={singleMilestone} />);

      const searchInput = screen.getByLabelText('Search milestones');
      fireEvent.change(searchInput, { target: { value: 'single' } });

      expect(screen.getByText('Single Milestone')).toBeInTheDocument();
      expect(screen.getByText('Showing all 1 milestones')).toBeInTheDocument();
    });

    it('handles ties in payout sorting', () => {
      const tiedPayouts: Milestone[] = [
        { id: '1', title: 'First', status: 'Pending', payout: 500, currency: 'USD', dueDate: 'May 10, 2026' },
        { id: '2', title: 'Second', status: 'Active', payout: 500, currency: 'USD', dueDate: 'Jun 1, 2026' },
      ];

      render(<MilestonesList milestones={tiedPayouts} />);

      const sortSelect = screen.getByRole('combobox');
      fireEvent.change(sortSelect, { target: { value: 'payout-asc' } });

      const milestones = screen.getAllByRole('article');
      expect(milestones).toHaveLength(2);
    });
  });

  describe('filterMilestonesByTitle helper', () => {
    it('returns all milestones when query is empty', () => {
      const result = filterMilestonesByTitle(SEARCH_SORT_SAMPLE, '');
      expect(result).toEqual(SEARCH_SORT_SAMPLE);
    });

    it('returns all milestones when query is whitespace only', () => {
      const result = filterMilestonesByTitle(SEARCH_SORT_SAMPLE, '   ');
      expect(result).toEqual(SEARCH_SORT_SAMPLE);
    });

    it('filters case-insensitively', () => {
      const result = filterMilestonesByTitle(SEARCH_SORT_SAMPLE, 'DESIGN');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Design Phase');
    });

    it('returns empty array when no matches', () => {
      const result = filterMilestonesByTitle(SEARCH_SORT_SAMPLE, 'nonexistent');
      expect(result).toHaveLength(0);
    });

    it('handles partial string matches', () => {
      const result = filterMilestonesByTitle(SEARCH_SORT_SAMPLE, 'phase');
      expect(result).toHaveLength(3);
    });
  });

  describe('sortMilestones helper', () => {
    it('returns original array when sort option is unrecognized', () => {
      const result = sortMilestones(SEARCH_SORT_SAMPLE, 'invalid' as SortOption);
      expect(result).toEqual(SEARCH_SORT_SAMPLE);
    });

    it('sorts by due date ascending correctly', () => {
      const result = sortMilestones(SEARCH_SORT_SAMPLE, 'dueDate-asc');
      expect(result[0].title).toBe('Design Phase');
      expect(result[1].title).toBe('Testing Phase');
      expect(result[result.length - 1].title).toBe('Documentation');
    });

    it('sorts by due date descending correctly', () => {
      const result = sortMilestones(SEARCH_SORT_SAMPLE, 'dueDate-desc');
      expect(result[0].title).toBe('Deployment');
      expect(result[1].title).toBe('Development Phase');
    });

    it('sorts by payout ascending correctly', () => {
      const result = sortMilestones(SEARCH_SORT_SAMPLE, 'payout-asc');
      expect(result[0].payout).toBe(250);
      expect(result[1].payout).toBe(300);
      expect(result[result.length - 1].payout).toBe(1500);
    });

    it('sorts by payout descending correctly', () => {
      const result = sortMilestones(SEARCH_SORT_SAMPLE, 'payout-desc');
      expect(result[0].payout).toBe(1500);
      expect(result[1].payout).toBe(750);
      expect(result[result.length - 1].payout).toBe(250);
    });

    it('does not mutate original array', () => {
      const original = [...SEARCH_SORT_SAMPLE];
      sortMilestones(SEARCH_SORT_SAMPLE, 'payout-desc');
      expect(SEARCH_SORT_SAMPLE).toEqual(original);
    });
  });

  it('passes axe accessibility checks with search and sort toolbar', async () => {
    const { container } = render(<MilestonesList milestones={SEARCH_SORT_SAMPLE} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
