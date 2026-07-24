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

    const persisted = listMilestones();
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
  }, []);

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

      {displayMilestones.length === 0 ? (
        <EmptyState
          illustration="milestones"
          title="No milestones tracked"
          description="Track your progress by adding milestones to your contracts. Milestones help you stay organized and ensure timely delivery."
          actionLabel="Add Milestone"
          onAction={handleAddMilestone}
        />
      ) : (
        <>
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
