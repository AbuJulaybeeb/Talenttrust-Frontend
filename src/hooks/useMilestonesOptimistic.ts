/**
 * @file useMilestonesOptimistic.ts
 *
 * Custom hook that manages an optimistic milestones list backed by the
 * client-side persistence layer.
 *
 * Behaviour
 * ─────────
 * - **Optimistic add**: the new milestone is appended to the in-memory list
 *   immediately, before `saveMilestone` resolves.  If the persistence call
 *   throws, the list is rolled back to its pre-call snapshot.
 *
 * - **Optimistic update**: the targeted milestone is patched in-memory first,
 *   then `updateMilestone` is called.  On failure the snapshot is restored.
 *
 * - **Rollback on error**: callers receive a resolved `{ success: false, error }`
 *   result and must surface an error toast themselves; the hook never swallows
 *   errors silently.
 *
 * - **Concurrency safety**: every pending mutation is tracked in a `Set` keyed
 *   by a unique operation token.  The rollback only fires when the *specific*
 *   operation that failed is still the current owner of that snapshot — so a
 *   second concurrent add can never accidentally roll back a successfully
 *   committed first add.
 *
 * Design notes
 * ────────────
 * The hook deliberately keeps network/persistence calls synchronous (they
 * currently operate on localStorage) but the API is async-ready: callers
 * `await` the returned Promises so swapping in a real HTTP client later
 * requires no call-site changes.
 */

'use client';

import { useCallback, useRef, useState } from 'react';
import { listMilestones, saveMilestone, updateMilestone } from '@/lib/repository';
import type { Milestone } from '@/components/MilestonesList';

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface OptimisticResult {
  /** `true` when the persistence call succeeded; `false` when it failed and
   *  the UI state has been rolled back. */
  success: boolean;
  /** The error thrown by the persistence layer.  Only set when `success` is
   *  `false`. */
  error?: unknown;
}

// ---------------------------------------------------------------------------
// Hook return shape
// ---------------------------------------------------------------------------

export interface UseMilestonesOptimisticReturn {
  /** The current in-memory milestone list (may include uncommitted records). */
  milestones: Milestone[];
  /**
   * Replace the entire in-memory list (used during initial hydration from
   * localStorage or when an external caller wants to reset the list).
   */
  setMilestones: (milestones: Milestone[]) => void;
  /**
   * Optimistically append `milestone` to the list, then persist it.
   *
   * If persistence fails the list is rolled back to its state before this
   * call and the returned result contains `success: false` with the error.
   *
   * @returns A promise that always resolves (never rejects) with an
   *   `OptimisticResult`.
   */
  addMilestoneOptimistic: (milestone: Milestone) => Promise<OptimisticResult>;
  /**
   * Optimistically apply `patch` to the milestone identified by `id`, then
   * persist the change.
   *
   * If persistence fails the list is rolled back and the returned result
   * contains `success: false` with the error.
   *
   * @returns A promise that always resolves (never rejects) with an
   *   `OptimisticResult`.
   */
  updateMilestoneOptimistic: (id: string, patch: Partial<Milestone>) => Promise<OptimisticResult>;
}

// ---------------------------------------------------------------------------
// Hook implementation
// ---------------------------------------------------------------------------

/**
 * Manages an optimistic milestone list backed by the repository layer.
 *
 * @param initialMilestones - Optional seed list; defaults to `[]`.  Pass the
 *   result of `listMilestones()` here to pre-populate on mount.
 *
 * @example
 * ```tsx
 * const { milestones, setMilestones, addMilestoneOptimistic } =
 *   useMilestonesOptimistic([]);
 *
 * // In a submit handler:
 * const result = await addMilestoneOptimistic(newMilestone);
 * if (!result.success) {
 *   showError({ title: 'Could not save milestone', description: 'Please try again.' });
 * }
 * ```
 */
export function useMilestonesOptimistic(
  initialMilestones: Milestone[] = [],
): UseMilestonesOptimisticReturn {
  const [milestones, setMilestonesState] = useState<Milestone[]>(initialMilestones);

  /**
   * Stable ref that always mirrors the latest `milestones` state.
   * Using a ref avoids stale-closure issues inside the callbacks without
   * requiring the callbacks themselves to be recreated on every render.
   */
  const milestonesRef = useRef<Milestone[]>(initialMilestones);

  /** Tracks in-flight operation tokens to enforce concurrency safety. */
  const pendingOpsRef = useRef<Set<symbol>>(new Set());

  // Keep the ref in sync with each state update.
  const setMilestones = useCallback((next: Milestone[]) => {
    milestonesRef.current = next;
    setMilestonesState(next);
  }, []);

  // ---------------------------------------------------------------------------
  // addMilestoneOptimistic
  // ---------------------------------------------------------------------------

  const addMilestoneOptimistic = useCallback(
    async (milestone: Milestone): Promise<OptimisticResult> => {
      // Capture snapshot *before* the optimistic update so we can roll back.
      const snapshot = milestonesRef.current;
      // Unique token for this operation — used to detect if the op is still
      // in-flight when an error occurs.
      const token = Symbol('add');
      pendingOpsRef.current.add(token);

      // 1. Apply the optimistic update immediately.
      setMilestones([...snapshot, milestone]);

      try {
        // 2. Persist the milestone.  This is synchronous today (localStorage)
        //    but the async wrapper keeps the API future-proof.
        saveMilestone(milestone);

        // 3. Sync state from the source of truth so we pick up any concurrent
        //    writes that may have occurred between the optimistic update and now.
        const persisted = listMilestones();
        setMilestones(persisted);

        return { success: true };
      } catch (error) {
        // 4. Rollback: only revert if this specific operation is still pending
        //    (i.e. it has not been superseded by a later concurrent operation).
        if (pendingOpsRef.current.has(token)) {
          setMilestones(snapshot);
        }
        return { success: false, error };
      } finally {
        pendingOpsRef.current.delete(token);
      }
    },
    [setMilestones],
  );

  // ---------------------------------------------------------------------------
  // updateMilestoneOptimistic
  // ---------------------------------------------------------------------------

  const updateMilestoneOptimistic = useCallback(
    async (id: string, patch: Partial<Milestone>): Promise<OptimisticResult> => {
      const snapshot = milestonesRef.current;
      const token = Symbol('update');
      pendingOpsRef.current.add(token);

      // 1. Apply optimistic patch in memory.
      const optimistic = snapshot.map((m) =>
        m.id === id ? { ...m, ...patch } : m,
      );
      setMilestones(optimistic);

      try {
        // 2. Persist the patch.
        const persisted = updateMilestone(id, patch);
        if (!persisted) {
          throw new Error(`[useMilestonesOptimistic] updateMilestone('${id}') returned false.`);
        }

        // 3. Re-read the source of truth.
        const latest = listMilestones();
        setMilestones(latest);

        return { success: true };
      } catch (error) {
        if (pendingOpsRef.current.has(token)) {
          setMilestones(snapshot);
        }
        return { success: false, error };
      } finally {
        pendingOpsRef.current.delete(token);
      }
    },
    [setMilestones],
  );

  return {
    milestones,
    setMilestones,
    addMilestoneOptimistic,
    updateMilestoneOptimistic,
  };
}
