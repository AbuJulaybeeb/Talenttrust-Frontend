'use client';

import Link from 'next/link';
import type { Contract, Milestone } from '@/types/domain';
import { isDueSoon } from '@/lib/dueSoon';

export const DUE_SOON_WINDOW_DAYS = 7;

export type WorkSummary = {
  activeContracts: number;
  upcomingMilestones: number;
};

/**
 * Produces the two dashboard counts from data the application has already loaded.
 * Paid and completed milestones are intentionally omitted because they no longer
 * require upcoming work.
 */
export function getWorkSummary(
  contracts: Contract[],
  milestones: Milestone[],
  today = new Date(),
): WorkSummary {
  return {
    activeContracts: contracts.filter((contract) => contract.status === 'Active').length,
    upcomingMilestones: milestones.filter(
      (milestone) =>
        milestone.status !== 'Paid' &&
        milestone.status !== 'Completed' &&
        isDueSoon(milestone.dueDate, today, DUE_SOON_WINDOW_DAYS),
    ).length,
  };
}

type DashboardWorkSummaryProps = {
  contracts: Contract[];
  milestones: Milestone[];
};

export function DashboardWorkSummary({
  contracts,
  milestones,
}: DashboardWorkSummaryProps): React.JSX.Element {
  const { activeContracts, upcomingMilestones } = getWorkSummary(contracts, milestones);

  return (
    <section aria-labelledby="work-summary-title" className="mt-8 w-full max-w-3xl text-left">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="work-summary-title" className="text-xl font-semibold text-slate-900">
          Your work at a glance
        </h2>
        <p className="text-sm text-slate-500">Upcoming means due within the next 7 days.</p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Link
          href="/contracts"
          aria-label={`View contracts: ${activeContracts} active`}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
        >
          <p className="text-sm font-medium text-slate-600">Active contracts</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{activeContracts}</p>
          <p className="mt-2 text-sm text-emerald-700">
            {activeContracts === 0 ? 'No active contracts right now.' : 'View all contracts'}
          </p>
        </Link>

        <Link
          href="/milestones"
          aria-label={`View milestones: ${upcomingMilestones} due soon`}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        >
          <p className="text-sm font-medium text-slate-600">Milestones due soon</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{upcomingMilestones}</p>
          <p className="mt-2 text-sm text-blue-700">
            {upcomingMilestones === 0 ? 'Nothing is due soon.' : 'View all milestones'}
          </p>
        </Link>
      </div>
    </section>
  );
}
