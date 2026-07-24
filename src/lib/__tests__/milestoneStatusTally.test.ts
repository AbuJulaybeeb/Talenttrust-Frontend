import { milestoneStatusTally, STATUS_ORDER } from '../milestoneStatusTally';
import type { StatusType } from '@/components/StatusBadge';

describe('milestoneStatusTally', () => {
  it('returns counts for each status present in canonical order', () => {
    const milestones = [
      { status: 'Pending' as StatusType },
      { status: 'Active' as StatusType },
      { status: 'Pending' as StatusType },
      { status: 'Completed' as StatusType },
    ];

    const result = milestoneStatusTally(milestones);

    expect(result).toEqual([
      { status: 'Active', count: 1 },
      { status: 'Completed', count: 1 },
      { status: 'Pending', count: 2 },
    ]);
  });

  it('omits statuses with zero count', () => {
    const milestones = [
      { status: 'Paid' as StatusType },
      { status: 'Paid' as StatusType },
      { status: 'Active' as StatusType },
    ];

    const result = milestoneStatusTally(milestones);

    expect(result).toEqual([
      { status: 'Active', count: 1 },
      { status: 'Paid', count: 2 },
    ]);
  });

  it('returns all five statuses when each appears at least once', () => {
    const milestones = [
      { status: 'Active' as StatusType },
      { status: 'Completed' as StatusType },
      { status: 'Disputed' as StatusType },
      { status: 'Pending' as StatusType },
      { status: 'Paid' as StatusType },
    ];

    const result = milestoneStatusTally(milestones);

    expect(result).toHaveLength(5);
    expect(result.map((t) => t.status)).toEqual(STATUS_ORDER);
    result.forEach((t) => expect(t.count).toBe(1));
  });

  it('returns empty array for empty input', () => {
    expect(milestoneStatusTally([])).toEqual([]);
  });

  it('handles all milestones with the same status', () => {
    const milestones = Array.from(
      { length: 10 },
      () => ({ status: 'Completed' as StatusType }),
    );

    const result = milestoneStatusTally(milestones);

    expect(result).toEqual([{ status: 'Completed', count: 10 }]);
  });

  it('returns statuses in the canonical STATUS_ORDER', () => {
    const milestones = [
      { status: 'Paid' as StatusType },
      { status: 'Pending' as StatusType },
      { status: 'Active' as StatusType },
      { status: 'Completed' as StatusType },
      { status: 'Disputed' as StatusType },
    ];

    const result = milestoneStatusTally(milestones);

    const statuses = result.map((t) => t.status);
    expect(statuses).toEqual(STATUS_ORDER);
  });

  it('preserves order for partial set', () => {
    const milestones = [
      { status: 'Paid' as StatusType },
      { status: 'Active' as StatusType },
    ];

    const result = milestoneStatusTally(milestones);

    expect(result.map((t) => t.status)).toEqual(['Active', 'Paid']);
  });

  describe('unknown status values', () => {
    it('skips milestones with an unknown status that is not in STATUS_ORDER', () => {
      // The function only tallies known StatusType values.
      // Unknown values get coerced to `undefined` key, resulting in NaN
      // which the filter treats as falsy (zero), so they are omitted.
      const milestones = [
        { status: 'Active' as StatusType },
        { status: 'Cancelled' as StatusType },
        { status: 'Disputed' as StatusType },
        { status: 'Unknown' as StatusType },
      ];

      const result = milestoneStatusTally(milestones);

      // Only known statuses with a positive count appear
      expect(result).toEqual([
        { status: 'Active', count: 1 },
        { status: 'Disputed', count: 1 },
      ]);
    });

    it('ignores milestones with a runtime string that is not a valid StatusType', () => {
      const milestones = [
        { status: 'Active' as StatusType },
        { status: 'OnHold' as StatusType },
        { status: 'Active' as StatusType },
      ];

      const result = milestoneStatusTally(milestones);

      expect(result).toEqual([{ status: 'Active', count: 2 }]);
    });
  });

  describe('mutation guard', () => {
    it('does not mutate the input milestones array', () => {
      const milestones = [
        { status: 'Pending' as StatusType },
        { status: 'Active' as StatusType },
        { status: 'Completed' as StatusType },
      ];
      const snapshot = [...milestones];

      milestoneStatusTally(milestones);

      expect(milestones).toEqual(snapshot);
    });

    it('does not mutate milestone objects within the input array', () => {
      const milestones = [
        { status: 'Pending' as StatusType },
      ];
      const originalStatus = milestones[0].status;

      milestoneStatusTally(milestones);

      expect(milestones[0].status).toBe(originalStatus);
    });
  });
});
