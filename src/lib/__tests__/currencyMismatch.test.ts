import { findCurrencyMismatches } from '../currencyMismatch';
import type { Milestone } from '@/components/MilestonesList';

const mkMilestone = (overrides: Partial<Milestone> & { id: string }): Milestone => ({
  title: 'Test milestone',
  status: 'Pending',
  payout: 100,
  currency: 'USD',
  ...overrides,
});

describe('findCurrencyMismatches', () => {
  it('returns empty array when all milestones match contract currency', () => {
    const milestones: Milestone[] = [
      mkMilestone({ id: 'ms-1', currency: 'USD' }),
      mkMilestone({ id: 'ms-2', currency: 'USD' }),
    ];
    expect(findCurrencyMismatches('USD', milestones)).toEqual([]);
  });

  it('returns ids of a single mismatched milestone', () => {
    const milestones: Milestone[] = [
      mkMilestone({ id: 'ms-1', currency: 'USD' }),
      mkMilestone({ id: 'ms-2', currency: 'EUR' }),
    ];
    expect(findCurrencyMismatches('USD', milestones)).toEqual(['ms-2']);
  });

  it('returns ids of multiple mismatched milestones with different currencies', () => {
    const milestones: Milestone[] = [
      mkMilestone({ id: 'ms-1', currency: 'USD' }),
      mkMilestone({ id: 'ms-2', currency: 'EUR' }),
      mkMilestone({ id: 'ms-3', currency: 'GBP' }),
      mkMilestone({ id: 'ms-4', currency: 'EUR' }),
    ];
    const result = findCurrencyMismatches('USD', milestones);
    expect(result).toContain('ms-2');
    expect(result).toContain('ms-3');
    expect(result).toContain('ms-4');
    expect(result).not.toContain('ms-1');
    expect(result).toHaveLength(3);
  });

  it('treats currency comparison case-insensitively', () => {
    const milestones: Milestone[] = [
      mkMilestone({ id: 'ms-1', currency: 'usd' }),
      mkMilestone({ id: 'ms-2', currency: 'Usd' }),
      mkMilestone({ id: 'ms-3', currency: 'USD' }),
    ];
    expect(findCurrencyMismatches('USD', milestones)).toEqual([]);
  });

  it('detects mismatch when contract currency casing differs from milestone casing', () => {
    const milestones: Milestone[] = [
      mkMilestone({ id: 'ms-1', currency: 'eur' }),
    ];
    expect(findCurrencyMismatches('EUR', milestones)).toEqual([]);
  });

  it('case-insensitive detection: uppercase milestone vs lowercase contract', () => {
    const milestones: Milestone[] = [
      mkMilestone({ id: 'ms-1', currency: 'EUR' }),
    ];
    expect(findCurrencyMismatches('eur', milestones)).toEqual([]);
  });

  it('returns empty array for empty milestones', () => {
    expect(findCurrencyMismatches('USD', [])).toEqual([]);
  });

  it('returns empty array when there are no milestones and contract currency is empty string', () => {
    expect(findCurrencyMismatches('', [])).toEqual([]);
  });

  it('handles milestone with empty currency string', () => {
    const milestones: Milestone[] = [
      mkMilestone({ id: 'ms-1', currency: '' }),
    ];
    expect(findCurrencyMismatches('USD', milestones)).toEqual(['ms-1']);
  });

  it('handles contract currency with empty string', () => {
    const milestones: Milestone[] = [
      mkMilestone({ id: 'ms-1', currency: 'USD' }),
    ];
    expect(findCurrencyMismatches('', milestones)).toEqual(['ms-1']);
  });

  it('preserves milestone identity when ids are not sequential', () => {
    const milestones: Milestone[] = [
      mkMilestone({ id: 'abc', currency: 'USD' }),
      mkMilestone({ id: 'xyz-123', currency: 'EUR' }),
    ];
    expect(findCurrencyMismatches('USD', milestones)).toEqual(['xyz-123']);
  });

  it('detects multiple distinct mismatched currencies', () => {
    const milestones: Milestone[] = [
      mkMilestone({ id: 'ms-1', currency: 'EUR' }),
      mkMilestone({ id: 'ms-2', currency: 'GBP' }),
      mkMilestone({ id: 'ms-3', currency: 'XLM' }),
    ];
    const result = findCurrencyMismatches('USD', milestones);
    expect(result).toEqual(['ms-1', 'ms-2', 'ms-3']);
  });

  describe('mutation guard', () => {
    it('does not mutate the input milestones array', () => {
      const milestones: Milestone[] = [
        mkMilestone({ id: 'ms-1', currency: 'USD' }),
        mkMilestone({ id: 'ms-2', currency: 'EUR' }),
      ];
      const snapshot = [...milestones];
      findCurrencyMismatches('USD', milestones);
      expect(milestones).toEqual(snapshot);
    });

    it('does not mutate milestone objects within the input array', () => {
      const milestones: Milestone[] = [
        mkMilestone({ id: 'ms-1', currency: 'USD' }),
      ];
      const originalCurrency = milestones[0].currency;
      findCurrencyMismatches('usd', milestones);
      expect(milestones[0].currency).toBe(originalCurrency);
    });
  });
});
