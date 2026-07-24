import { render, screen } from '@testing-library/react';
import { DashboardWorkSummary, getWorkSummary } from './DashboardWorkSummary';
import type { Contract, Milestone } from '@/types/domain';

const contracts: Contract[] = [
  { contractName: 'Active project', parties: [], totalValue: 100, currency: 'USD', status: 'Active', createdAt: '2026-07-01', milestoneCount: 1 },
  { contractName: 'Finished project', parties: [], totalValue: 100, currency: 'USD', status: 'Completed', createdAt: '2026-07-01', milestoneCount: 1 },
];

const milestones: Milestone[] = [
  { id: 'due', title: 'Due soon', status: 'Pending', payout: 100, currency: 'USD', dueDate: '2026-07-28' },
  { id: 'paid', title: 'Paid soon', status: 'Paid', payout: 100, currency: 'USD', dueDate: '2026-07-28' },
  { id: 'later', title: 'Later', status: 'Pending', payout: 100, currency: 'USD', dueDate: '2026-08-01' },
];

describe('DashboardWorkSummary', () => {
  it('counts active contracts and actionable milestones due within seven days', () => {
    expect(getWorkSummary(contracts, milestones, new Date(2026, 6, 24))).toEqual({
      activeContracts: 1,
      upcomingMilestones: 1,
    });
  });

  it('renders counts and links to the relevant lists', () => {
    render(<DashboardWorkSummary contracts={contracts} milestones={[]} />);

    expect(screen.getByRole('heading', { name: /your work at a glance/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view contracts: 1 active/i })).toHaveAttribute('href', '/contracts');
    expect(screen.getByRole('link', { name: /view milestones: 0 due soon/i })).toHaveAttribute('href', '/milestones');
  });

  it('handles an empty workload gracefully', () => {
    render(<DashboardWorkSummary contracts={[]} milestones={[]} />);

    expect(screen.getByText(/no active contracts right now/i)).toBeInTheDocument();
    expect(screen.getByText(/nothing is due soon/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view contracts: 0 active/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view milestones: 0 due soon/i })).toBeInTheDocument();
  });
});
