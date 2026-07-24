import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import ContractStatusFilter, {
  type ContractStatusValue,
} from '../ContractStatusFilter';

const FILTER_OPTIONS: ContractStatusValue[] = [
  'All',
  'Active',
  'Pending',
  'Completed',
  'Paid',
  'Disputed',
];

describe('ContractStatusFilter', () => {
  it('renders every contract status as a radio option', () => {
    render(
      <ContractStatusFilter
        selected="All"
        onChange={jest.fn()}
        resultCount={12}
      />,
    );

    const radiogroup = screen.getByRole('radiogroup', {
      name: 'Filter contracts by status',
    });

    expect(radiogroup).toBeInTheDocument();

    FILTER_OPTIONS.forEach((option) => {
      expect(screen.getByRole('radio', { name: option })).toBeInTheDocument();
    });
  });

  it('marks the selected status as checked', () => {
    render(
      <ContractStatusFilter
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
      <ContractStatusFilter
        selected="All"
        onChange={handleChange}
        resultCount={4}
      />,
    );

    fireEvent.click(screen.getByRole('radio', { name: 'Active' }));

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('Active');
  });

  it('does not call onChange when clicking the already-selected filter', () => {
    const handleChange = jest.fn();

    render(
      <ContractStatusFilter
        selected="Completed"
        onChange={handleChange}
        resultCount={2}
      />,
    );

    fireEvent.click(screen.getByRole('radio', { name: 'Completed' }));

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('calls onChange for every filter option except the pre-selected one', () => {
    const handleChange = jest.fn();

    render(
      <ContractStatusFilter
        selected="All"
        onChange={handleChange}
        resultCount={5}
      />,
    );

    FILTER_OPTIONS.filter((o) => o !== 'All').forEach((option) => {
      fireEvent.click(screen.getByRole('radio', { name: option }));
    });

    expect(handleChange).toHaveBeenCalledTimes(FILTER_OPTIONS.length - 1);
    FILTER_OPTIONS.filter((o) => o !== 'All').forEach((option, idx) => {
      expect(handleChange).toHaveBeenNthCalledWith(idx + 1, option);
    });
  });

  it('announces the all-status result count in a polite live region', () => {
    render(
      <ContractStatusFilter
        selected="All"
        onChange={jest.fn()}
        resultCount={2}
      />,
    );

    const liveRegion = screen.getByText('Showing all 2 contracts');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
  });

  it('announces filtered result counts with singular and lowercase status text', () => {
    const { rerender } = render(
      <ContractStatusFilter
        selected="Paid"
        onChange={jest.fn()}
        resultCount={1}
      />,
    );

    expect(screen.getByText('Showing 1 paid contract')).toBeInTheDocument();

    rerender(
      <ContractStatusFilter
        selected="Disputed"
        onChange={jest.fn()}
        resultCount={3}
      />,
    );

    expect(screen.getByText('Showing 3 disputed contracts')).toBeInTheDocument();
  });

  it('announces singular for "All" filter with one result', () => {
    render(
      <ContractStatusFilter
        selected="All"
        onChange={jest.fn()}
        resultCount={1}
      />,
    );

    expect(screen.getByText('Showing all 1 contract')).toBeInTheDocument();
  });

  it('announces zero results correctly', () => {
    render(
      <ContractStatusFilter
        selected="Active"
        onChange={jest.fn()}
        resultCount={0}
      />,
    );

    expect(screen.getByText('Showing 0 active contracts')).toBeInTheDocument();
  });

  it('renders a fieldset with a legend', () => {
    render(
      <ContractStatusFilter
        selected="All"
        onChange={jest.fn()}
        resultCount={0}
      />,
    );

    expect(screen.getByText('Filter by status')).toBeInTheDocument();
  });

  it('does not check any other radio when one is selected', () => {
    render(
      <ContractStatusFilter
        selected="Disputed"
        onChange={jest.fn()}
        resultCount={1}
      />,
    );

    FILTER_OPTIONS.forEach((option) => {
      const radio = screen.getByRole('radio', { name: option });
      if (option === 'Disputed') {
        expect(radio).toBeChecked();
      } else {
        expect(radio).not.toBeChecked();
      }
    });
  });

  it('passes axe accessibility checks', async () => {
    const { container } = render(
      <ContractStatusFilter
        selected="Pending"
        onChange={jest.fn()}
        resultCount={5}
      />,
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('all radio inputs are visually hidden', () => {
    render(
      <ContractStatusFilter
        selected="All"
        onChange={jest.fn()}
        resultCount={0}
      />,
    );

    FILTER_OPTIONS.forEach((option) => {
      const radio = screen.getByRole('radio', { name: option });
      expect(radio).toHaveClass('sr-only');
    });
  });
});
