'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * The set of statuses a user can filter milestones by.
 * "All" is the default and shows every milestone regardless of status.
 */
export type MilestoneStatusFilter = 'All' | 'Active' | 'Pending' | 'Completed' | 'Paid' | 'Disputed';

/** Ordered list of filter options rendered in the radiogroup. */
const FILTER_OPTIONS: MilestoneStatusFilter[] = [
  'All',
  'Active',
  'Pending',
  'Completed',
  'Paid',
  'Disputed',
];

const ANNOUNCEMENT_DEBOUNCE_MS = 250;

const getResultAnnouncement = (selected: MilestoneStatusFilter, resultCount: number) => {
  const noun = resultCount === 1 ? 'milestone' : 'milestones';

  return selected === 'All'
    ? `Showing all ${resultCount} ${noun}`
    : `Showing ${resultCount} ${selected.toLowerCase()} ${noun}`;
};

export interface MilestoneFilterProps {
  /** The currently active filter. */
  selected: MilestoneStatusFilter;
  /**
   * Called whenever the user selects a different filter option.
   * @param filter - The newly selected status filter.
   */
  onChange: (filter: MilestoneStatusFilter) => void;
  /**
   * The number of milestones that match the current filter.
   * Used to construct the accessible live-region announcement.
   */
  resultCount: number;
}

/**
 * MilestoneFilter renders an accessible `radiogroup` that lets users narrow
 * the milestones list by status.
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
 * <MilestoneFilter
 *   selected={filter}
 *   onChange={setFilter}
 *   resultCount={filtered.length}
 * />
 * ```
 */
const MilestoneFilter = ({ selected, onChange, resultCount }: MilestoneFilterProps) => {
  const [announcement, setAnnouncement] = useState('');
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const timer = window.setTimeout(() => {
      setAnnouncement(getResultAnnouncement(selected, resultCount));
    }, ANNOUNCEMENT_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [selected, resultCount]);

  return (
    <div className="mb-6">
      <fieldset>
        <legend className="text-sm font-medium text-slate-700 mb-3">
          Filter by status
        </legend>

        <div
          role="radiogroup"
          aria-label="Filter milestones by status"
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
                  name="milestone-status-filter"
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

      <p
        className="sr-only"
        role="status"
        aria-label="Milestone filter updates"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </p>
    </div>
  );
};

export default MilestoneFilter;
