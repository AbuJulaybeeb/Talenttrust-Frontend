/**
 * @jest-environment node
 *
 * SSR ("no window") test for Milestones page preferences storage access.
 * Verifies that rendering or initializing storage access during SSR does not error out.
 */

import { PREFERENCES_STORAGE_KEY, DEFAULT_PREFERENCES } from '../page';
import * as safeStorage from '@/lib/safeStorage';

describe('MilestonesPage SSR context (no window)', () => {
  it('does not run or error during SSR when window is undefined', () => {
    // Assert that checkStorageAvailability returns false when window is undefined
    expect(safeStorage.checkStorageAvailability()).toBe(false);

    // Assert that safeStorage getItem falls back to in-memory/null and does not throw
    expect(() => safeStorage.getItem(PREFERENCES_STORAGE_KEY)).not.toThrow();
    expect(safeStorage.getItem(PREFERENCES_STORAGE_KEY)).toBeNull();

    // Assert setItem returns true (accepts value in fallbackStore) and does not throw
    expect(() => safeStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(DEFAULT_PREFERENCES))).not.toThrow();
    expect(safeStorage.getItem(PREFERENCES_STORAGE_KEY)).toBe(JSON.stringify(DEFAULT_PREFERENCES));
  });
});
