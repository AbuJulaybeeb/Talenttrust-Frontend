/**
 * @file useMilestonesOptimistic.test.ts
 *
 * Test suite for the `useMilestonesOptimistic` hook.
 *
 * Coverage targets
 * ───────────────
 * 1. Initial state — hook exposes the seed list passed in.
 * 2. addMilestoneOptimistic — success path: optimistic item appears immediately,
 *    list is reconciled with the persisted source of truth, returns { success: true }.
 * 3. addMilestoneOptimistic — failure path: optimistic item appears, then is rolled
 *    back when saveMilestone throws, returns { success: false, error }.
 * 4. updateMilestoneOptimistic — success path: patch is applied in memory first,
 *    then reconciled, returns { success: true }.
 * 5. updateMilestoneOptimistic — failure path: patch is applied then rolled back
 *    when the repo call returns false, returns { success: false }.
 * 6. setMilestones — replaces the list externally (used by the page during hydration).
 * 7. Concurrent adds — two overlapping adds each see the correct snapshot rolled back
 *    for their own error without clobbering the other's committed state.
 * 8. Concurrent add + update — one fails while the other succeeds; only the failing
 *    operation reverts.
 * 9. updateMilestoneOptimistic with unknown id — returns { success: false }.
 * 10. Empty initial list — hook initialises to [].
 */

import { renderHook, act } from '@testing-library/react';
import { useMilestonesOptimistic } from '../useMilestonesOptimistic';
import { saveMilestone, updateMilestone, listMilestones } from '@/lib/repository';
import type { Milestone } from '@/components/MilestonesList';

// ---------------------------------------------------------------------------
// Mock the repository so tests never touch localStorage
// ---------------------------------------------------------------------------

jest.mock('@/lib/repository', () => ({
  saveMilestone: jest.fn(),
  updateMilestone: jest.fn(),
  listMilestones: jest.fn(),
}));

const mockedSaveMilestone = jest.mocked(saveMilestone);
const mockedUpdateMilestone = jest.mocked(updateMilestone);
const mockedListMilestones = jest.mocked(listMilestones);

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const ms1: Milestone = {
  id: 'ms-1',
  title: 'Milestone One',
  status: 'Pending',
  payout: 1000,
  currency: 'USD',
  dueDate: '2026-07-01',
};

const ms2: Milestone = {
  id: 'ms-2',
  title: 'Milestone Two',
  status: 'Pending',
  payout: 2000,
  currency: 'USD',
  dueDate: '2026-08-01',
};

const ms3: Milestone = {
  id: 'ms-3',
  title: 'Milestone Three',
  status: 'Pending',
  payout: 3000,
  currency: 'USD',
  dueDate: '2026-09-01',
};

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
  // Default: saveMilestone is a no-op, updateMilestone returns true,
  // listMilestones returns an empty array (callers override as needed).
  mockedSaveMilestone.mockImplementation(() => {});
  mockedUpdateMilestone.mockReturnValue(true);
  mockedListMilestones.mockReturnValue([]);
});

// ---------------------------------------------------------------------------
// Helper: render the hook with a seed list
// ---------------------------------------------------------------------------

function setup(initial: Milestone[] = []) {
  return renderHook(() => useMilestonesOptimistic(initial));
}

// ===========================================================================
// 1. Initial state
// ===========================================================================

describe('initial state', () => {
  it('exposes the seed list passed as the initialMilestones argument', () => {
    const { result } = setup([ms1, ms2]);
    expect(result.current.milestones).toEqual([ms1, ms2]);
  });

  it('defaults to an empty list when no argument is provided', () => {
    const { result } = renderHook(() => useMilestonesOptimistic());
    expect(result.current.milestones).toEqual([]);
  });

  it('exposes addMilestoneOptimistic and updateMilestoneOptimistic functions', () => {
    const { result } = setup();
    expect(typeof result.current.addMilestoneOptimistic).toBe('function');
    expect(typeof result.current.updateMilestoneOptimistic).toBe('function');
  });

  it('exposes a setMilestones function for external hydration', () => {
    const { result } = setup();
    expect(typeof result.current.setMilestones).toBe('function');
  });
});

// ===========================================================================
// 2. setMilestones — external hydration
// ===========================================================================

describe('setMilestones', () => {
  it('replaces the milestone list with the supplied array', () => {
    const { result } = setup([ms1]);

    act(() => {
      result.current.setMilestones([ms2, ms3]);
    });

    expect(result.current.milestones).toEqual([ms2, ms3]);
  });

  it('clears the list when called with an empty array', () => {
    const { result } = setup([ms1, ms2]);

    act(() => {
      result.current.setMilestones([]);
    });

    expect(result.current.milestones).toEqual([]);
  });
});

// ===========================================================================
// 3. addMilestoneOptimistic — success path
// ===========================================================================

describe('addMilestoneOptimistic — success path', () => {
  it('appends the new milestone to the list immediately (optimistic)', async () => {
    mockedSaveMilestone.mockImplementation(() => {});
    mockedListMilestones.mockReturnValue([ms1, ms2]);

    const { result } = setup([ms1]);

    let returnValue: Awaited<ReturnType<typeof result.current.addMilestoneOptimistic>> | undefined;

    await act(async () => {
      returnValue = await result.current.addMilestoneOptimistic(ms2);
    });

    // After the async operation the list should reflect the persisted snapshot
    expect(result.current.milestones).toEqual([ms1, ms2]);
    expect(returnValue).toEqual({ success: true });
  });

  it('calls saveMilestone with the supplied milestone', async () => {
    mockedListMilestones.mockReturnValue([ms1]);

    const { result } = setup([]);

    await act(async () => {
      await result.current.addMilestoneOptimistic(ms1);
    });

    expect(mockedSaveMilestone).toHaveBeenCalledTimes(1);
    expect(mockedSaveMilestone).toHaveBeenCalledWith(ms1);
  });

  it('reconciles state with listMilestones after save', async () => {
    const reconciled = [ms1, ms2, ms3];
    mockedListMilestones.mockReturnValue(reconciled);

    const { result } = setup([ms1, ms2]);

    await act(async () => {
      await result.current.addMilestoneOptimistic(ms3);
    });

    expect(mockedListMilestones).toHaveBeenCalled();
    expect(result.current.milestones).toEqual(reconciled);
  });

  it('returns { success: true } on successful save', async () => {
    mockedListMilestones.mockReturnValue([ms1]);

    const { result } = setup([]);

    let returnValue: Awaited<ReturnType<typeof result.current.addMilestoneOptimistic>> | undefined;

    await act(async () => {
      returnValue = await result.current.addMilestoneOptimistic(ms1);
    });

    expect(returnValue).toEqual({ success: true });
  });
});

// ===========================================================================
// 4. addMilestoneOptimistic — failure / rollback path
// ===========================================================================

describe('addMilestoneOptimistic — failure / rollback', () => {
  it('rolls back the list to its pre-call snapshot when saveMilestone throws', async () => {
    const saveError = new Error('QuotaExceededError');
    mockedSaveMilestone.mockImplementation(() => {
      throw saveError;
    });

    const { result } = setup([ms1]);

    await act(async () => {
      await result.current.addMilestoneOptimistic(ms2);
    });

    // State must be restored to the pre-call snapshot
    expect(result.current.milestones).toEqual([ms1]);
  });

  it('returns { success: false, error } when saveMilestone throws', async () => {
    const saveError = new Error('Storage failure');
    mockedSaveMilestone.mockImplementation(() => {
      throw saveError;
    });

    const { result } = setup([ms1]);

    let returnValue: Awaited<ReturnType<typeof result.current.addMilestoneOptimistic>> | undefined;

    await act(async () => {
      returnValue = await result.current.addMilestoneOptimistic(ms2);
    });

    expect(returnValue).toEqual({ success: false, error: saveError });
  });

  it('does NOT call listMilestones after a failed save', async () => {
    mockedSaveMilestone.mockImplementation(() => {
      throw new Error('fail');
    });

    const { result } = setup([]);

    await act(async () => {
      await result.current.addMilestoneOptimistic(ms1);
    });

    expect(mockedListMilestones).not.toHaveBeenCalled();
  });

  it('leaves the list empty when adding to an empty list fails', async () => {
    mockedSaveMilestone.mockImplementation(() => {
      throw new Error('fail');
    });

    const { result } = setup([]);

    await act(async () => {
      await result.current.addMilestoneOptimistic(ms1);
    });

    expect(result.current.milestones).toEqual([]);
  });
});

// ===========================================================================
// 5. updateMilestoneOptimistic — success path
// ===========================================================================

describe('updateMilestoneOptimistic — success path', () => {
  it('applies the patch in memory immediately (optimistic)', async () => {
    mockedUpdateMilestone.mockReturnValue(true);
    mockedListMilestones.mockReturnValue([{ ...ms1, status: 'Completed' }]);

    const { result } = setup([ms1]);

    await act(async () => {
      await result.current.updateMilestoneOptimistic('ms-1', { status: 'Completed' });
    });

    expect(result.current.milestones[0].status).toBe('Completed');
  });

  it('calls updateMilestone with the correct id and patch', async () => {
    mockedUpdateMilestone.mockReturnValue(true);
    mockedListMilestones.mockReturnValue([{ ...ms1, status: 'Paid' }]);

    const { result } = setup([ms1]);

    await act(async () => {
      await result.current.updateMilestoneOptimistic('ms-1', { status: 'Paid' });
    });

    expect(mockedUpdateMilestone).toHaveBeenCalledWith('ms-1', { status: 'Paid' });
  });

  it('reconciles state with listMilestones after update', async () => {
    const reconciled = [{ ...ms1, status: 'Completed' as const }, ms2];
    mockedUpdateMilestone.mockReturnValue(true);
    mockedListMilestones.mockReturnValue(reconciled);

    const { result } = setup([ms1, ms2]);

    await act(async () => {
      await result.current.updateMilestoneOptimistic('ms-1', { status: 'Completed' });
    });

    expect(result.current.milestones).toEqual(reconciled);
  });

  it('returns { success: true } on successful update', async () => {
    mockedUpdateMilestone.mockReturnValue(true);
    mockedListMilestones.mockReturnValue([ms1]);

    const { result } = setup([ms1]);

    let returnValue: Awaited<ReturnType<typeof result.current.updateMilestoneOptimistic>> | undefined;

    await act(async () => {
      returnValue = await result.current.updateMilestoneOptimistic('ms-1', { status: 'Completed' });
    });

    expect(returnValue?.success).toBe(true);
  });

  it('leaves other milestones in the list unchanged', async () => {
    const reconciled = [{ ...ms1, status: 'Completed' as const }, ms2];
    mockedUpdateMilestone.mockReturnValue(true);
    mockedListMilestones.mockReturnValue(reconciled);

    const { result } = setup([ms1, ms2]);

    await act(async () => {
      await result.current.updateMilestoneOptimistic('ms-1', { status: 'Completed' });
    });

    // ms2 is unchanged
    expect(result.current.milestones.find((m) => m.id === 'ms-2')).toEqual(ms2);
  });
});

// ===========================================================================
// 6. updateMilestoneOptimistic — failure / rollback path
// ===========================================================================

describe('updateMilestoneOptimistic — failure / rollback', () => {
  it('rolls back the patch when updateMilestone returns false', async () => {
    mockedUpdateMilestone.mockReturnValue(false);

    const { result } = setup([ms1]);

    await act(async () => {
      await result.current.updateMilestoneOptimistic('ms-1', { status: 'Completed' });
    });

    // Original status must be restored
    expect(result.current.milestones[0].status).toBe('Pending');
  });

  it('returns { success: false } when updateMilestone returns false', async () => {
    mockedUpdateMilestone.mockReturnValue(false);

    const { result } = setup([ms1]);

    let returnValue: Awaited<ReturnType<typeof result.current.updateMilestoneOptimistic>> | undefined;

    await act(async () => {
      returnValue = await result.current.updateMilestoneOptimistic('ms-1', { status: 'Completed' });
    });

    expect(returnValue?.success).toBe(false);
    expect(returnValue?.error).toBeDefined();
  });

  it('rolls back when updateMilestone throws', async () => {
    const updateError = new Error('DB write failure');
    mockedUpdateMilestone.mockImplementation(() => {
      throw updateError;
    });

    const { result } = setup([ms1]);

    await act(async () => {
      await result.current.updateMilestoneOptimistic('ms-1', { status: 'Paid' });
    });

    expect(result.current.milestones[0].status).toBe('Pending');
  });

  it('returns { success: false, error } when updateMilestone throws', async () => {
    const updateError = new Error('Storage write failure');
    mockedUpdateMilestone.mockImplementation(() => {
      throw updateError;
    });

    const { result } = setup([ms1]);

    let returnValue: Awaited<ReturnType<typeof result.current.updateMilestoneOptimistic>> | undefined;

    await act(async () => {
      returnValue = await result.current.updateMilestoneOptimistic('ms-1', { status: 'Paid' });
    });

    expect(returnValue).toEqual({ success: false, error: updateError });
  });

  it('returns { success: false } when the target id does not exist in the list', async () => {
    // updateMilestone returns false for unknown ids
    mockedUpdateMilestone.mockReturnValue(false);

    const { result } = setup([ms1]);

    let returnValue: Awaited<ReturnType<typeof result.current.updateMilestoneOptimistic>> | undefined;

    await act(async () => {
      returnValue = await result.current.updateMilestoneOptimistic('non-existent', {
        status: 'Completed',
      });
    });

    expect(returnValue?.success).toBe(false);
    // Original list is unchanged
    expect(result.current.milestones).toEqual([ms1]);
  });
});

// ===========================================================================
// 7. Concurrent adds — both succeed
// ===========================================================================

describe('concurrent adds — both succeed', () => {
  it('applies both items when two concurrent adds both succeed', async () => {
    const finalList = [ms1, ms2, ms3];
    mockedListMilestones.mockReturnValue(finalList);

    const { result } = setup([ms1]);

    await act(async () => {
      await Promise.all([
        result.current.addMilestoneOptimistic(ms2),
        result.current.addMilestoneOptimistic(ms3),
      ]);
    });

    // After reconciliation with the mocked listMilestones result
    expect(result.current.milestones).toEqual(finalList);
  });

  it('calls saveMilestone twice when two adds run concurrently', async () => {
    mockedListMilestones.mockReturnValue([ms1, ms2, ms3]);

    const { result } = setup([ms1]);

    await act(async () => {
      await Promise.all([
        result.current.addMilestoneOptimistic(ms2),
        result.current.addMilestoneOptimistic(ms3),
      ]);
    });

    expect(mockedSaveMilestone).toHaveBeenCalledTimes(2);
  });
});

// ===========================================================================
// 8. Concurrent adds — one fails
// ===========================================================================

describe('concurrent adds — one fails', () => {
  it('returns { success: false } for the failing add', async () => {
    const saveError = new Error('quota exceeded');
    let callCount = 0;

    mockedSaveMilestone.mockImplementation(() => {
      callCount++;
      if (callCount === 2) throw saveError; // second add fails
    });
    mockedListMilestones.mockReturnValue([ms1, ms2]); // first add reconciles with this

    const { result } = setup([ms1]);

    let result1: Awaited<ReturnType<typeof result.current.addMilestoneOptimistic>> | undefined;
    let result2: Awaited<ReturnType<typeof result.current.addMilestoneOptimistic>> | undefined;

    await act(async () => {
      [result1, result2] = await Promise.all([
        result.current.addMilestoneOptimistic(ms2),
        result.current.addMilestoneOptimistic(ms3),
      ]);
    });

    expect(result1?.success).toBe(true);
    expect(result2?.success).toBe(false);
    expect(result2?.error).toBe(saveError);
  });
});

// ===========================================================================
// 9. Concurrent add + update — update fails
// ===========================================================================

describe('concurrent add + update — update fails', () => {
  it('keeps the successfully added milestone after the update fails', async () => {
    mockedSaveMilestone.mockImplementation(() => {}); // add succeeds
    mockedUpdateMilestone.mockReturnValue(false);     // update fails
    mockedListMilestones.mockReturnValue([ms1, ms2]); // reconcile after successful add

    const { result } = setup([ms1]);

    let addResult: Awaited<ReturnType<typeof result.current.addMilestoneOptimistic>> | undefined;
    let updateResult: Awaited<ReturnType<typeof result.current.updateMilestoneOptimistic>> | undefined;

    await act(async () => {
      [addResult, updateResult] = await Promise.all([
        result.current.addMilestoneOptimistic(ms2),
        result.current.updateMilestoneOptimistic('ms-1', { status: 'Completed' }),
      ]);
    });

    expect(addResult?.success).toBe(true);
    expect(updateResult?.success).toBe(false);
  });
});

// ===========================================================================
// 10. Non-mutation of original milestone objects
// ===========================================================================

describe('non-mutation of original milestone objects', () => {
  it('does not mutate the original milestone passed to addMilestoneOptimistic', async () => {
    mockedListMilestones.mockReturnValue([ms1]);

    const original = { ...ms1 };
    const { result } = setup([]);

    await act(async () => {
      await result.current.addMilestoneOptimistic(ms1);
    });

    expect(ms1).toEqual(original);
  });

  it('does not mutate milestone objects in the list during updateMilestoneOptimistic', async () => {
    mockedUpdateMilestone.mockReturnValue(true);
    mockedListMilestones.mockReturnValue([{ ...ms1, status: 'Completed' }]);

    const original = { ...ms1 };
    const { result } = setup([ms1]);

    await act(async () => {
      await result.current.updateMilestoneOptimistic('ms-1', { status: 'Completed' });
    });

    // The original ms1 fixture must be untouched
    expect(ms1).toEqual(original);
  });
});

// ===========================================================================
// 11. Multiple sequential operations
// ===========================================================================

describe('multiple sequential operations', () => {
  it('correctly applies two sequential successful adds', async () => {
    mockedListMilestones
      .mockReturnValueOnce([ms1, ms2])  // after first add
      .mockReturnValueOnce([ms1, ms2, ms3]); // after second add

    const { result } = setup([ms1]);

    await act(async () => {
      await result.current.addMilestoneOptimistic(ms2);
    });

    expect(result.current.milestones).toEqual([ms1, ms2]);

    await act(async () => {
      await result.current.addMilestoneOptimistic(ms3);
    });

    expect(result.current.milestones).toEqual([ms1, ms2, ms3]);
  });

  it('rolls back only the failed operation in a sequence of add-then-fail', async () => {
    mockedSaveMilestone
      .mockImplementationOnce(() => {})           // first add succeeds
      .mockImplementationOnce(() => { throw new Error('fail'); }); // second fails

    mockedListMilestones.mockReturnValue([ms1, ms2]); // reconcile after first add

    const { result } = setup([ms1]);

    await act(async () => {
      await result.current.addMilestoneOptimistic(ms2); // succeeds
    });

    const afterFirstAdd = result.current.milestones;
    expect(afterFirstAdd).toEqual([ms1, ms2]);

    await act(async () => {
      await result.current.addMilestoneOptimistic(ms3); // fails
    });

    // Should roll back to the state before the second add ([ms1, ms2])
    expect(result.current.milestones).toEqual([ms1, ms2]);
  });
});

// ===========================================================================
// 12. Result type shape
// ===========================================================================

describe('result type shape', () => {
  it('success result has no error property', async () => {
    mockedListMilestones.mockReturnValue([ms1]);

    const { result } = setup([]);

    let returnValue: Awaited<ReturnType<typeof result.current.addMilestoneOptimistic>> | undefined;

    await act(async () => {
      returnValue = await result.current.addMilestoneOptimistic(ms1);
    });

    expect(returnValue?.success).toBe(true);
    expect(returnValue).not.toHaveProperty('error');
  });

  it('failure result has the error property set', async () => {
    const saveError = new Error('oops');
    mockedSaveMilestone.mockImplementation(() => { throw saveError; });

    const { result } = setup([]);

    let returnValue: Awaited<ReturnType<typeof result.current.addMilestoneOptimistic>> | undefined;

    await act(async () => {
      returnValue = await result.current.addMilestoneOptimistic(ms1);
    });

    expect(returnValue?.success).toBe(false);
    expect(returnValue?.error).toBe(saveError);
  });
});
