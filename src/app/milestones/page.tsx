'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import EmptyState from '../../components/EmptyState';
import MilestonesList from '../../components/MilestonesList';
import MilestoneFilter, { type MilestoneStatusFilter } from '../../components/milestones/MilestoneFilter';
import { MilestoneCreationForm } from '../../components/milestones/MilestoneCreationForm';
import { listMilestones, saveMilestone } from '@/lib/repository';
import { getItem, setItem } from '@/lib/safeStorage';
import type { Milestone } from '@/types/domain';
import type { FetchState } from '@/hooks/useFetchState';

export const SAMPLE_DISMISSED_KEY = 'talenttrust-milestones-sample-dismissed';

export const SAMPLE_MILESTONES: Milestone[] = [
  {
    id: '1',
    title: 'Project Kickoff & Discovery',
    status: 'Completed',
    payout: 2500,
    currency: 'USD',
    dueDate: '2026-03-15',
  },
  {
    id: '2',
    title: 'UI/UX Design Handoff',
    status: 'Paid',
    payout: 3500,
    currency: 'USD',
    dueDate: '2026-04-01',
  },
  {
    id: '3',
    title: 'Frontend Development – Sprint 1',
    status: 'Pending',
    payout: 5000,
    currency: 'USD',
    dueDate: '2026-05-01',
  },
  {
    id: '4',
    title: 'API Integration & Testing',
    status: 'Pending',
    payout: 4000,
    currency: 'USD',
    dueDate: '2026-05-15',
  },
  {
    id: '5',
    title: 'Payment Gateway Integration',
    status: 'Disputed',
    payout: 3000,
    currency: 'USD',
    dueDate: '2026-04-20',
  },
];

const VALID_STATUSES: MilestoneStatusFilter[] = ['All', 'Pending', 'Completed', 'Paid', 'Disputed'];

export type MilestoneSortOption =
  | 'dueDate-asc'
  | 'dueDate-desc'
  | 'payout-asc'
  | 'payout-desc'
  | 'title-asc'
  | 'title-desc';

export interface MilestonePreferences {
  filter: MilestoneStatusFilter;
  sort: MilestoneSortOption;
}

export const PREFERENCES_STORAGE_KEY = 'talenttrust-milestones-preferences';

export const DEFAULT_PREFERENCES: MilestonePreferences = {
  filter: 'All',
  sort: 'dueDate-asc',
};

const VALID_SORT_OPTIONS: MilestoneSortOption[] = [
  'dueDate-asc',
  'dueDate-desc',
  'payout-asc',
  'payout-desc',
  'title-asc',
  'title-desc',
];

const VALID_ALL_STATUSES: MilestoneStatusFilter[] = [
  'All',
  'Active',
  'Pending',
  'Completed',
  'Paid',
  'Disputed',
];

function getValidPreferences(storedStr: string | null): MilestonePreferences {
  if (!storedStr) {
    return DEFAULT_PREFERENCES;
  }
  try {
    const parsed = JSON.parse(storedStr);
    if (parsed && typeof parsed === 'object') {
      const filter = VALID_ALL_STATUSES.includes(parsed.filter)
        ? parsed.filter
        : DEFAULT_PREFERENCES.filter;
      const sort = VALID_SORT_OPTIONS.includes(parsed.sort)
        ? parsed.sort
        : DEFAULT_PREFERENCES.sort;
      return { filter, sort };
    }
  } catch {
    // Ignore and fallback
  }
  return DEFAULT_PREFERENCES;
}

function getValidStatus(param: string | null): MilestoneStatusFilter {
  return param && (VALID_STATUSES as string[]).includes(param)
    ? (param as MilestoneStatusFilter)
    : 'All';
}

const MilestonesContent: React.FC = () => {
  const [milestones, setMilestones] = useState<Milestone[]>(SAMPLE_MILESTONES);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const startFromScratchRef = useRef<HTMLButtonElement | null>(null);

  const initialStatus = getValidStatus(searchParams.get('status'));
  const [statusFilter, setStatusFilter] = useState<MilestoneStatusFilter>(initialStatus);
  const [sortBy, setSortBy] = useState<MilestoneSortOption>(DEFAULT_PREFERENCES.sort);
  const [showForm, setShowForm] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  // Sync state if searchParams change externally (e.g. back/forward navigation)
  useEffect(() => {
    const currentParam = searchParams.get('status');
    setStatusFilter(getValidStatus(currentParam));
  }, [searchParams]);

  // Sync statusFilter state changes to URL without adding browser history entries
  useEffect(() => {
    const currentUrlStatus = searchParams.get('status');
    if (currentUrlStatus !== statusFilter && !(currentUrlStatus === null && statusFilter === 'All')) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('status', statusFilter);
      router.replace(`?${params.toString()}`);
    }
  }, [statusFilter, router, searchParams]);

  /**
   * Loads persisted milestones from the repository. Reused on mount and as the
   * keyboard-operable "Retry" action in the error state — `listMilestones` is
   * documented as never throwing, but the repository read is wrapped here so a
   * future storage failure (or a thrown error in tests) surfaces as a distinct,
   * announced error state instead of leaving the page blank.
   */
  const loadMilestonesData = useCallback(() => {
    try {
      const persisted = listMilestones();
      setLoadError(null);
      if (persisted.length > 0) {
        setMilestones(persisted);
        setIsDismissed(true);
      } else {
        try {
          const dismissed = getItem(SAMPLE_DISMISSED_KEY) === 'true';
          setIsDismissed(dismissed);
        } catch {
          setIsDismissed(true);
        }
        setMilestones(SAMPLE_MILESTONES);
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err : new Error('Failed to load milestones.'));
    }
  }, []);

  // Rehydrate from localStorage after the client mounts to avoid SSR mismatches.
  useEffect(() => {
    // Load preferences
    try {
      const stored = getItem(PREFERENCES_STORAGE_KEY);
      const prefs = getValidPreferences(stored);
      const urlStatus = searchParams.get('status');
      const validUrlStatus = urlStatus ? getValidStatus(urlStatus) : null;

      setStatusFilter(validUrlStatus || prefs.filter);
      setSortBy(prefs.sort);
    } catch {
      setStatusFilter('All');
      setSortBy('dueDate-asc');
    }

    loadMilestonesData();
  }, []);

  const handleRetry = useCallback(() => {
    loadMilestonesData();
  }, [loadMilestonesData]);

  // Persist preferences to storage on state change
  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    try {
      setItem(
        PREFERENCES_STORAGE_KEY,
        JSON.stringify({ filter: statusFilter, sort: sortBy })
      );
    } catch {
      // safe fallback
    }
  }, [statusFilter, sortBy]);

  const handleFilterChange = useCallback((newFilter: MilestoneStatusFilter) => {
    setStatusFilter(newFilter);
  }, []);

  const handleSortChange = useCallback((newSort: MilestoneSortOption) => {
    setSortBy(newSort);
  }, []);

  const handleDismissSampleBanner = useCallback(() => {
    try {
      setItem(SAMPLE_DISMISSED_KEY, 'true');
    } catch {
      // safeStorage failure resilience
    }
    setIsDismissed(true);
    setMilestones([]);
    setTimeout(() => {
      startFromScratchRef.current?.focus();
    }, 0);
  }, []);

  const isUsingSampleData = milestones === SAMPLE_MILESTONES;
  const showSampleBanner = isUsingSampleData && !isDismissed;
  const displayMilestones = isUsingSampleData && isDismissed ? [] : milestones;

  // Fetch-state model shared with other views (see hooks/useFetchState.ts):
  // 'error' takes precedence, then 'empty', then 'success' — mutually exclusive
  // so exactly one state renders at a time.
  const pageState: FetchState = loadError ? 'error' : displayMilestones.length === 0 ? 'empty' : 'success';
  const loadErrorMessage =
    loadError?.message || 'Failed to load milestones. Please check your connection and try again.';

  const filtered = useMemo(() => {
    if (statusFilter === 'All') return displayMilestones;
    return displayMilestones.filter((m) => m.status === statusFilter);
  }, [displayMilestones, statusFilter]);

  const sortedAndFiltered = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === 'dueDate-asc') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (sortBy === 'dueDate-desc') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return b.dueDate.localeCompare(a.dueDate);
      }
      if (sortBy === 'payout-asc') {
        return a.payout - b.payout;
      }
      if (sortBy === 'payout-desc') {
        return b.payout - a.payout;
      }
      if (sortBy === 'title-asc') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'title-desc') {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });
  }, [filtered, sortBy]);

  const handleAddMilestone = useCallback(() => {
    setShowForm(true);
  }, []);

  const handleSubmitMilestone = useCallback((milestone: Milestone) => {
    saveMilestone(milestone);
    const persisted = listMilestones();
    setMilestones(persisted);
    setIsDismissed(true);
    setShowForm(false);
  }, []);

  const handleCancelForm = useCallback(() => {
    setShowForm(false);
  }, []);

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Milestones</h1>

      {pageState === 'error' ? (
        <>
          <div role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">
            {loadErrorMessage}
          </div>
          <div
            data-testid="milestones-error"
            className="flex flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50 p-8 text-center shadow-sm max-w-2xl mx-auto my-8"
          >
            <div
              className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 ring-1 ring-red-200"
              aria-hidden="true"
            >
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-red-950">
              Failed to load milestones
            </h2>
            <p className="mb-6 max-w-md text-sm leading-6 text-red-800">
              {loadErrorMessage}
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-red-900"
              aria-label="Retry loading milestones"
            >
              Retry
            </button>
          </div>
        </>
      ) : (
        <>
          {showSampleBanner && (
        <div
          data-testid="sample-data-banner"
          role="status"
          aria-label="Sample data notice"
          className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-900">
                You're viewing sample data
              </p>
              <p className="mt-1 text-sm text-blue-700">
                These are example milestones to help you get started.
              </p>
              <button
                ref={startFromScratchRef}
                data-testid="start-from-scratch-btn"
                type="button"
                onClick={handleDismissSampleBanner}
                className="mt-3 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              >
                Start from scratch
              </button>
            </div>
            <button
              type="button"
              onClick={handleDismissSampleBanner}
              aria-label="Dismiss sample data notice"
              className="text-blue-500 hover:text-blue-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {pageState === 'empty' ? (
        <>
          <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
            No milestones tracked
          </div>
          <EmptyState
            illustration="milestones"
            title="No milestones tracked"
            description="Track your progress by adding milestones to your contracts. Milestones help you stay organized and ensure timely delivery."
            actionLabel="Add Milestone"
            onAction={handleAddMilestone}
          />
        </>
      ) : (
        <>
          <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
            {`${displayMilestones.length} milestone${displayMilestones.length === 1 ? '' : 's'} loaded`}
          </div>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <MilestoneFilter
                selected={statusFilter}
                onChange={handleFilterChange}
                resultCount={filtered.length}
              />
              <div className="flex flex-col mb-6">
                <label htmlFor="sort-milestones" className="text-sm font-medium text-slate-700 mb-3">
                  Sort by
                </label>
                <select
                  id="sort-milestones"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as MilestoneSortOption)}
                  className="rounded-2xl border border-slate-200 px-4 py-1.5 text-sm text-slate-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="dueDate-asc">Due Date (Earliest)</option>
                  <option value="dueDate-desc">Due Date (Latest)</option>
                  <option value="payout-asc">Payout (Low to High)</option>
                  <option value="payout-desc">Payout (High to Low)</option>
                  <option value="title-asc">Title (A to Z)</option>
                  <option value="title-desc">Title (Z to A)</option>
                </select>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddMilestone}
              className="flex-shrink-0 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              Add Milestone
            </button>
          </div>

          {sortedAndFiltered.length === 0 ? (
            <EmptyState
              illustration="milestones"
              title="No milestones match this filter"
              description={`There are no ${statusFilter.toLowerCase()} milestones at the moment. Try a different filter or add a new milestone.`}
              actionLabel="Add Milestone"
              onAction={handleAddMilestone}
            />
          ) : (
            <MilestonesList milestones={sortedAndFiltered} />
          )}
        </>
      )}
      </>
      )}

      {showForm && (
        <MilestoneCreationForm
          onSubmit={handleSubmitMilestone}
          onCancel={handleCancelForm}
        />
      )}
    </main>
  );
};

const MilestonesPage: React.FC = () => (
  <Suspense fallback={null}>
    <MilestonesContent />
  </Suspense>
);

export default MilestonesPage;
