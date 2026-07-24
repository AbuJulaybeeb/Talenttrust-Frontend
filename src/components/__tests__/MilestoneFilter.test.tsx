import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
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

  it('announces the all-status result count in a polite live region', () => {
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

  it('announces filtered result counts with singular and lowercase status text', () => {
    const { rerender } = render(
      <MilestoneFilter
        selected="Paid"
        onChange={jest.fn()}
        resultCount={1}
      />,
    );

    expect(screen.getByText('Showing 1 paid milestone')).toBeInTheDocument();

    rerender(
      <MilestoneFilter
        selected="Disputed"
        onChange={jest.fn()}
        resultCount={3}
      />,
    );

    expect(screen.getByText('Showing 3 disputed milestones')).toBeInTheDocument();
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
