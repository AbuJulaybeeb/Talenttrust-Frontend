import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import MilestoneFilter, {
  MILESTONE_ANNOUNCEMENT_DELAY_MS,
  type MilestoneStatusFilter,
} from '../milestones/MilestoneFilter';

const FILTER_OPTIONS: MilestoneStatusFilter[] = [
  'All',
  'Active',
  'Pending',
  'Completed',
  'Paid',
  'Disputed',
];

describe('MilestoneFilter', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders every milestone status as a radio option', () => {
    render(
      <MilestoneFilter
        selected="All"
        onChange={jest.fn()}
        resultCount={12}
      />,
    );

    const radiogroup = screen.getByRole('radiogroup', {
      name: 'Filter milestones by status',
    });

    expect(radiogroup).toBeInTheDocument();

    FILTER_OPTIONS.forEach((option) => {
      expect(screen.getByRole('radio', { name: option })).toBeInTheDocument();
    });
  });

  it('marks the selected status as checked', () => {
    render(
      <MilestoneFilter
        selected="Paid"
        onChange={jest.fn()}
        resultCount={1}
      />,
    );

    expect(screen.getByRole('radio', { name: 'Paid' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'All' })).not.toBeChecked();
  });

  it('calls onChange with the newly selected status on click', () => {
    const handleChange = jest.fn();

    render(
      <MilestoneFilter
        selected="All"
        onChange={handleChange}
        resultCount={4}
      />,
    );

    fireEvent.click(screen.getByRole('radio', { name: 'Active' }));

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('Active');
  });

  it('does not announce the initial filter state', () => {
    jest.useFakeTimers();

    const { container } = render(
      <React.StrictMode>
        <MilestoneFilter
          selected="All"
          onChange={jest.fn()}
          resultCount={2}
        />
      </React.StrictMode>,
    );

    act(() => {
      jest.advanceTimersByTime(MILESTONE_ANNOUNCEMENT_DELAY_MS);
    });

    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    expect(liveRegion).toBeEmptyDOMElement();
  });

  it('debounces rapid updates and announces only the latest result', () => {
    jest.useFakeTimers();

    const { container, rerender } = render(
      <MilestoneFilter
        selected="All"
        onChange={jest.fn()}
        resultCount={5}
      />,
    );

    rerender(
      <MilestoneFilter
        selected="Active"
        onChange={jest.fn()}
        resultCount={3}
      />,
    );

    act(() => {
      jest.advanceTimersByTime(MILESTONE_ANNOUNCEMENT_DELAY_MS - 100);
    });

    rerender(
      <MilestoneFilter
        selected="Paid"
        onChange={jest.fn()}
        resultCount={1}
      />,
    );

    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeEmptyDOMElement();

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(liveRegion).toBeEmptyDOMElement();

    act(() => {
      jest.advanceTimersByTime(MILESTONE_ANNOUNCEMENT_DELAY_MS - 100);
    });

    expect(liveRegion).toHaveTextContent('Showing 1 paid milestone');
    expect(liveRegion).not.toHaveTextContent('active');
  });

  it('announces zero results after the debounce interval', () => {
    jest.useFakeTimers();

    const { container, rerender } = render(
      <MilestoneFilter
        selected="All"
        onChange={jest.fn()}
        resultCount={5}
      />,
    );

    rerender(
      <MilestoneFilter
        selected="Disputed"
        onChange={jest.fn()}
        resultCount={0}
      />,
    );

    act(() => {
      jest.advanceTimersByTime(MILESTONE_ANNOUNCEMENT_DELAY_MS);
    });

    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent(
      'Showing 0 disputed milestones',
    );
  });

  it('announces count changes while showing all statuses', () => {
    jest.useFakeTimers();

    const { container, rerender } = render(
      <MilestoneFilter
        selected="All"
        onChange={jest.fn()}
        resultCount={5}
      />,
    );

    rerender(
      <MilestoneFilter
        selected="All"
        onChange={jest.fn()}
        resultCount={2}
      />,
    );

    act(() => {
      jest.advanceTimersByTime(MILESTONE_ANNOUNCEMENT_DELAY_MS);
    });

    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent(
      'Showing all 2 milestones',
    );
  });

  it('passes axe accessibility checks via a11y helper', async () => {
    const { container } = render(
      <MilestoneFilter
        selected="Pending"
        onChange={jest.fn()}
        resultCount={5}
      />,
    );

    await assertNoA11yViolations(container);
  });
});
