/**
 * @jest-environment node
 *
 * SSR-context tests for src/lib/repository.ts.
 *
 * These are isolated into their own `node`-environment file because
 * jest-environment-jsdom 30 made the global `window` a non-configurable
 * accessor — `delete global.window` (the previous SSR-simulation technique
 * used in repository.test.ts) now throws instead of emulating SSR. Running
 * under the plain `node` test environment gives a real
 * `typeof window === 'undefined'` context with no workaround needed.
 */

import {
  listContracts,
  saveContract,
  listMilestones,
  saveMilestone,
  clearAppData,
  clearByPrefix,
} from '../repository';
import type { Contract, Milestone } from '@/types/domain';
import { setErrorReporter } from '../errorReporter';

const contractA: Contract = {
  contractName: 'Alpha Contract',
  parties: [{ label: 'Client', address: '0xAAA' }],
  totalValue: 1000,
  currency: 'USD',
  status: 'Active',
  createdAt: 'Jan 1, 2025',
  milestoneCount: 2,
};

const milestoneA: Milestone = {
  id: 'ms-001',
  title: 'Kickoff',
  status: 'Pending',
  payout: 500,
  currency: 'USD',
  dueDate: 'Mar 1, 2025',
};

afterEach(() => {
  setErrorReporter(null);
});

describe('repository SSR context (no window)', () => {
  it('listContracts returns [] without throwing when window is undefined', () => {
    expect(() => listContracts()).not.toThrow();
    expect(listContracts()).toEqual([]);
  });

  it('listMilestones returns [] without throwing when window is undefined', () => {
    expect(() => listMilestones()).not.toThrow();
    expect(listMilestones()).toEqual([]);
  });

  it('saveContract does not throw when window is undefined', () => {
    expect(() => saveContract(contractA)).not.toThrow();
  });

  it('saveMilestone does not throw when window is undefined', () => {
    expect(() => saveMilestone(milestoneA)).not.toThrow();
  });

  it('listMilestonesByContract-style reads stay safe under SSR (readStore never touches storage)', () => {
    // Guards the same isBrowser() short-circuit that listMilestonesByContract relies on.
    expect(() => listMilestones()).not.toThrow();
  });
});

describe('clearAppData SSR context (no window)', () => {
  it('returns false without throwing when window is undefined', () => {
    expect(() => clearAppData()).not.toThrow();
    expect(clearAppData()).toBe(false);
  });

  it('does not call the error reporter when window is undefined', () => {
    const mockReporter = jest.fn();
    setErrorReporter(mockReporter);

    clearAppData();

    expect(mockReporter).not.toHaveBeenCalled();
  });
});

describe('clearByPrefix SSR context (no window)', () => {
  it('returns 0 without throwing when window is undefined', () => {
    expect(() => clearByPrefix('talenttrust_')).not.toThrow();
    expect(clearByPrefix('talenttrust_')).toBe(0);
  });

  it('does not call the error reporter when window is undefined', () => {
    const mockReporter = jest.fn();
    setErrorReporter(mockReporter);

    clearByPrefix('talenttrust_');

    expect(mockReporter).not.toHaveBeenCalled();
  });
});
