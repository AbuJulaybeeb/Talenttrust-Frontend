import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { assertNoA11yViolations } from '@/test-utils/a11y';
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

  describe('keyboard navigation', () => {
    it('moves forward with ArrowDown and fires onChange exactly once', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(
        <MilestoneFilter
          selected="All"
          onChange={handleChange}
          resultCount={12}
        />,
      );

      screen.getByRole('radio', { name: 'All' }).focus();
      await user.keyboard('{ArrowDown}');

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith('Active');
    });

    it('moves backward with ArrowUp and fires onChange exactly once', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(
        <MilestoneFilter
          selected="Pending"
          onChange={handleChange}
          resultCount={12}
        />,
      );

      screen.getByRole('radio', { name: 'Pending' }).focus();
      await user.keyboard('{ArrowUp}');

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith('Active');
    });

    it('moves forward with ArrowRight', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(
        <MilestoneFilter
          selected="Completed"
          onChange={handleChange}
          resultCount={12}
        />,
      );

      screen.getByRole('radio', { name: 'Completed' }).focus();
      await user.keyboard('{ArrowRight}');

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith('Paid');
    });

    it('moves backward with ArrowLeft', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(
        <MilestoneFilter
          selected="Paid"
          onChange={handleChange}
          resultCount={12}
        />,
      );

      screen.getByRole('radio', { name: 'Paid' }).focus();
      await user.keyboard('{ArrowLeft}');

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith('Completed');
    });
  });

  describe('live region announcements', () => {
    it('marks the container as a polite atomic live region', () => {
      render(
        <MilestoneFilter
          selected="All"
          onChange={jest.fn()}
          resultCount={2}
        />,
      );

      const liveRegion = screen.getByText('Showing all 2 milestones');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });

    it('announces count with plural wording when resultCount > 1', () => {
      render(
        <MilestoneFilter
          selected="Disputed"
          onChange={jest.fn()}
          resultCount={5}
        />,
      );

      expect(screen.getByText('Showing 5 disputed milestones')).toBeInTheDocument();
    });

    it('announces count with singular wording when resultCount === 1', () => {
      render(
        <MilestoneFilter
          selected="Paid"
          onChange={jest.fn()}
          resultCount={1}
        />,
      );

      expect(screen.getByText('Showing 1 paid milestone')).toBeInTheDocument();
    });

    it('announces zero results with plural wording', () => {
      const { rerender } = render(
        <MilestoneFilter
          selected="All"
          onChange={jest.fn()}
          resultCount={0}
        />,
      );

      expect(screen.getByText('Showing all 0 milestones')).toBeInTheDocument();

      rerender(
        <MilestoneFilter
          selected="Pending"
          onChange={jest.fn()}
          resultCount={0}
        />,
      );

      expect(screen.getByText('Showing 0 pending milestones')).toBeInTheDocument();
    });

    it('uses "Showing all ..." phrasing when filter is All', () => {
      render(
        <MilestoneFilter
          selected="All"
          onChange={jest.fn()}
          resultCount={3}
        />,
      );

      expect(screen.getByText('Showing all 3 milestones')).toBeInTheDocument();
    });

    it('lowercases the status name in the announcement', () => {
      render(
        <MilestoneFilter
          selected="Completed"
          onChange={jest.fn()}
          resultCount={2}
        />,
      );

      expect(screen.getByText('Showing 2 completed milestones')).toBeInTheDocument();
    });
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
