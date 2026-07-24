import { renderHook } from '@testing-library/react';
import { calculateContractProgress, useContractProgress } from '../useContractProgress';
import { Milestone } from '@/components/MilestonesList';

function makeMilestone(overrides: Partial<Milestone> = {}): Milestone {
  return {
    id: 'ms-1',
    title: 'Milestone',
    status: 'Pending',
    payout: 1000,
    currency: 'USD',
    ...overrides,
  };
}

describe('calculateContractProgress', () => {
  describe('empty array', () => {
    it('returns zeroed metrics and a USD currency fallback', () => {
      expect(calculateContractProgress([])).toEqual({
        completedCount: 0,
        totalCount: 0,
        paidAmount: 0,
        outstandingAmount: 0,
        progressPercent: 0,
        currency: 'USD',
      });
    });
  });

  describe('all paid', () => {
    it('treats both "Completed" and "Paid" statuses as completed', () => {
      const milestones = [
        makeMilestone({ id: 'ms-1', status: 'Completed', payout: 1000 }),
        makeMilestone({ id: 'ms-2', status: 'Paid', payout: 2000 }),
      ];

      expect(calculateContractProgress(milestones)).toEqual({
        completedCount: 2,
        totalCount: 2,
        paidAmount: 3000,
        outstandingAmount: 0,
        progressPercent: 100,
        currency: 'USD',
      });
    });
  });

  describe('none paid', () => {
    it('sums every milestone into outstandingAmount', () => {
      const milestones = [
        makeMilestone({ id: 'ms-1', status: 'Pending', payout: 1500 }),
        makeMilestone({ id: 'ms-2', status: 'Active', payout: 2500 }),
      ];

      expect(calculateContractProgress(milestones)).toEqual({
        completedCount: 0,
        totalCount: 2,
        paidAmount: 0,
        outstandingAmount: 4000,
        progressPercent: 0,
        currency: 'USD',
      });
    });
  });

  describe('mixed', () => {
    it('splits paid and outstanding amounts and rounds the percentage', () => {
      const milestones = [
        makeMilestone({ id: 'ms-1', status: 'Completed', payout: 1500 }),
        makeMilestone({ id: 'ms-2', status: 'Pending', payout: 2500 }),
        makeMilestone({ id: 'ms-3', status: 'Pending', payout: 3000 }),
      ];

      expect(calculateContractProgress(milestones)).toEqual({
        completedCount: 1,
        totalCount: 3,
        paidAmount: 1500,
        outstandingAmount: 5500,
        progressPercent: 33,
        currency: 'USD',
      });
    });
  });

  describe('currency', () => {
    it('uses the currency of the first milestone', () => {
      const milestones = [makeMilestone({ currency: 'NGN' }), makeMilestone({ currency: 'USD' })];
      expect(calculateContractProgress(milestones).currency).toBe('NGN');
    });
  });
});

describe('useContractProgress', () => {
  it('returns the same metrics as calculateContractProgress', () => {
    const milestones = [
      makeMilestone({ id: 'ms-1', status: 'Paid', payout: 750 }),
      makeMilestone({ id: 'ms-2', status: 'Pending', payout: 250 }),
    ];

    const { result } = renderHook(() => useContractProgress(milestones));

    expect(result.current).toEqual(calculateContractProgress(milestones));
  });

  it('memoizes the result while the milestones array reference is stable', () => {
    const milestones = [makeMilestone({ status: 'Completed' })];

    const { result, rerender } = renderHook(({ data }) => useContractProgress(data), {
      initialProps: { data: milestones },
    });

    const firstResult = result.current;
    rerender({ data: milestones });

    expect(result.current).toBe(firstResult);
  });

  it('recomputes when the milestones array reference changes', () => {
    const { result, rerender } = renderHook(({ data }) => useContractProgress(data), {
      initialProps: { data: [makeMilestone({ status: 'Pending', payout: 100 })] },
    });

    expect(result.current.outstandingAmount).toBe(100);

    rerender({ data: [makeMilestone({ status: 'Completed', payout: 100 })] });

    expect(result.current.outstandingAmount).toBe(0);
    expect(result.current.paidAmount).toBe(100);
  });
});
