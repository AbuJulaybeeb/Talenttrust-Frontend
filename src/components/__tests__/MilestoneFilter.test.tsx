import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import MilestoneFilter, { type MilestoneStatusFilter } from '../milestones/MilestoneFilter';

const FILTER_OPTIONS: MilestoneStatusFilter[] = [
  'All',
  'Active',
  'Pending',
  'Completed',
  'Paid',
  'Disputed',
];

describe('MilestoneFilter', () => {
  beforeEach(() => {
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

  it('calls onChange with the newly selected status', () => {
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

  it('renders an empty polite live region on mount', () => {
    render(
      <MilestoneFilter
        selected="All"
        onChange={jest.fn()}
        resultCount={2}
      />,
    );

    const liveRegion = screen.getByRole('status', {
      name: 'Milestone filter updates',
    });
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    expect(liveRegion).toHaveTextContent('');
  });

  it('debounces filtered result announcements until updates settle', () => {
    jest.useFakeTimers();

    const { rerender } = render(
      <MilestoneFilter
        selected="All"
        onChange={jest.fn()}
        resultCount={5}
      />,
    );

    const liveRegion = screen.getByRole('status', {
      name: 'Milestone filter updates',
    });

    rerender(
      <MilestoneFilter
        selected="Paid"
        onChange={jest.fn()}
        resultCount={1}
      />,
    );

    act(() => {
      jest.advanceTimersByTime(249);
    });
    expect(liveRegion).toHaveTextContent('');

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(liveRegion).toHaveTextContent('Showing 1 paid milestone');
  });

  it('announces only the latest result after rapid successive updates', () => {
    jest.useFakeTimers();

    const { rerender } = render(
      <MilestoneFilter
        selected="All"
        onChange={jest.fn()}
        resultCount={5}
      />,
    );

    const liveRegion = screen.getByRole('status', {
      name: 'Milestone filter updates',
    });

    rerender(
      <MilestoneFilter
        selected="Pending"
        onChange={jest.fn()}
        resultCount={2}
      />,
    );
    act(() => {
      jest.advanceTimersByTime(125);
    });

    rerender(
      <MilestoneFilter
        selected="Disputed"
        onChange={jest.fn()}
        resultCount={3}
      />,
    );

    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(liveRegion).toHaveTextContent('Showing 3 disputed milestones');
    expect(liveRegion).not.toHaveTextContent('Showing 2 pending milestones');
  });

  it('announces zero-result filters with plural lowercase status text', () => {
    jest.useFakeTimers();

    const { rerender } = render(
      <MilestoneFilter
        selected="All"
        onChange={jest.fn()}
        resultCount={2}
      />,
    );

    rerender(
      <MilestoneFilter
        selected="Paid"
        onChange={jest.fn()}
        resultCount={0}
      />,
    );

    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(
      screen.getByRole('status', { name: 'Milestone filter updates' }),
    ).toHaveTextContent('Showing 0 paid milestones');
  });

  it('passes axe accessibility checks', async () => {
    const { container } = render(
      <MilestoneFilter
        selected="Pending"
        onChange={jest.fn()}
        resultCount={5}
      />,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
