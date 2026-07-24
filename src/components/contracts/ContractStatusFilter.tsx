'use client';

import React from 'react';

/**
 * The set of statuses a user can filter contracts by.
 * "All" is the default and shows every contract regardless of status.
 */
export type ContractStatusValue = 'All' | 'Active' | 'Pending' | 'Completed' | 'Paid' | 'Disputed';

/** Ordered list of filter options rendered in the radiogroup. */
const FILTER_OPTIONS: ContractStatusValue[] = [
  'All',
  'Active',
  'Pending',
  'Completed',
  'Paid',
  'Disputed',
];

export interface ContractStatusFilterProps {
  /** The currently active filter. */
  selected: ContractStatusValue;
  /**
   * Called whenever the user selects a different filter option.
   * @param filter - The newly selected status filter.
   */
  onChange: (filter: ContractStatusValue) => void;
  /**
   * The number of contracts that match the current filter.
   * Used to construct the accessible live-region announcement.
   */
  resultCount: number;
}

/**
 * ContractStatusFilter renders an accessible `radiogroup` that lets users narrow
 * the contracts list by status.
 *
 * Accessibility notes:
 * - `<fieldset>` + `<legend>` satisfies WCAG 1.3.1 (Info and Relationships).
 * - An `aria-live="polite"` region announces the filter result count to
 *   assistive-technology users without interrupting ongoing speech.
 * - Each radio `<input>` is visually hidden but fully keyboard-operable; the
 *   styled `<label>` acts as the visible affordance.
 *
 * @example
 * ```tsx
 * <ContractStatusFilter
 *   selected={filter}
 *   onChange={setFilter}
 *   resultCount={filtered.length}
 * />
 * ```
 */
const ContractStatusFilter = ({ selected, onChange, resultCount }: ContractStatusFilterProps) => {
  return (
    <div className="mb-6">
      <fieldset>
        <legend className="text-sm font-medium text-slate-700 mb-3">
          Filter by status
        </legend>

        <div
          role="radiogroup"
          aria-label="Filter contracts by status"
          className="flex flex-wrap gap-2"
        >
          {FILTER_OPTIONS.map((option) => {
            const isSelected = selected === option;
            return (
              <label
                key={option}
                className={[
                  'cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                  'border focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-1',
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400 hover:text-indigo-600',
                ].join(' ')}
              >
                <input
                  type="radio"
                  name="contract-status-filter"
                  value={option}
                  checked={isSelected}
                  onChange={() => onChange(option)}
                  className="sr-only"
                />
                {option}
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* aria-live region: announces result count to screen readers on filter change */}
      <p
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {selected === 'All'
          ? `Showing all ${resultCount} contract${resultCount !== 1 ? 's' : ''}`
          : `Showing ${resultCount} ${selected.toLowerCase()} contract${resultCount !== 1 ? 's' : ''}`}
      </p>
    </div>
  );
};

export default ContractStatusFilter;
