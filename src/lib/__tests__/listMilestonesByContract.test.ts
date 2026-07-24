/**
 * Test suite for `listMilestonesByContract` in src/lib/repository.ts
 *
 * Covers:
 * 1. Basic filtering — only milestones matching the given contractId are returned.
 * 2. No matches — returns [] when no milestone matches the contractId.
 * 3. Empty store — returns [] when no milestones are persisted at all.
 * 4. Legacy / contractId-less milestones — never match any contractId, including ''.
 * 5. Multiple contracts — milestones are correctly partitioned by contractId.
 * 6. Order preservation — matches are returned in their original stored order.
 * 7. Corrupt storage — returns [] gracefully instead of throwing.
 *
 * SSR ("no window") behaviour is covered separately in
 * listMilestonesByContract.ssr.test.ts under the `node` test environment —
 * see that file for why it can't live here alongside the jsdom tests.
 */

import { listMilestonesByContract, saveMilestone, STORAGE_KEY } from '../repository';
import type { Milestone } from '@/types/domain';

const milestoneForA1: Milestone = {
  id: 'ms-a1',
  title: 'Contract A — Kickoff',
  status: 'Pending',
  payout: 500,
  currency: 'USD',
  dueDate: 'Mar 1, 2025',
  contractId: 'contract-a',
};

const milestoneForA2: Milestone = {
  id: 'ms-a2',
  title: 'Contract A — Delivery',
  status: 'Completed',
  payout: 1500,
  currency: 'USD',
  dueDate: 'Apr 15, 2025',
  contractId: 'contract-a',
};

const milestoneForB1: Milestone = {
  id: 'ms-b1',
  title: 'Contract B — Kickoff',
  status: 'Active',
  payout: 750,
  currency: 'EUR',
  contractId: 'contract-b',
};

const milestoneWithoutContract: Milestone = {
  id: 'ms-orphan',
  title: 'Unlinked milestone',
  status: 'Pending',
  payout: 250,
  currency: 'USD',
};

beforeEach(() => {
  window.localStorage.clear();
  jest.restoreAllMocks();
});

describe('listMilestonesByContract', () => {
  it('returns [] when the store is empty', () => {
    expect(listMilestonesByContract('contract-a')).toEqual([]);
  });

  it('returns only the milestones matching the given contractId', () => {
    saveMilestone(milestoneForA1);
    saveMilestone(milestoneForA2);
    saveMilestone(milestoneForB1);

    expect(listMilestonesByContract('contract-a')).toEqual([milestoneForA1, milestoneForA2]);
  });

  it('returns [] when no milestone matches the given contractId', () => {
    saveMilestone(milestoneForA1);
    saveMilestone(milestoneForB1);

    expect(listMilestonesByContract('contract-does-not-exist')).toEqual([]);
  });

  it('excludes milestones with no contractId field', () => {
    saveMilestone(milestoneForA1);
    saveMilestone(milestoneWithoutContract);

    const result = listMilestonesByContract('contract-a');
    expect(result).toEqual([milestoneForA1]);
    expect(result).not.toContainEqual(milestoneWithoutContract);
  });

  it('does not match milestones with no contractId when queried with an empty string', () => {
    saveMilestone(milestoneWithoutContract);

    expect(listMilestonesByContract('')).toEqual([]);
  });

  it('partitions milestones correctly across multiple distinct contracts', () => {
    saveMilestone(milestoneForA1);
    saveMilestone(milestoneForB1);
    saveMilestone(milestoneForA2);

    expect(listMilestonesByContract('contract-a')).toEqual([milestoneForA1, milestoneForA2]);
    expect(listMilestonesByContract('contract-b')).toEqual([milestoneForB1]);
  });

  it('preserves the original stored order of matching milestones', () => {
    saveMilestone(milestoneForA2);
    saveMilestone(milestoneForB1);
    saveMilestone(milestoneForA1);

    expect(listMilestonesByContract('contract-a')).toEqual([milestoneForA2, milestoneForA1]);
  });

  it('does not mutate persisted milestones or other contracts', () => {
    saveMilestone(milestoneForA1);
    saveMilestone(milestoneForB1);

    listMilestonesByContract('contract-a');

    expect(listMilestonesByContract('contract-b')).toEqual([milestoneForB1]);
  });

  it('returns [] without throwing when localStorage contains corrupt JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, '%%%not-json%%%');
    expect(() => listMilestonesByContract('contract-a')).not.toThrow();
    expect(listMilestonesByContract('contract-a')).toEqual([]);
  });
});
