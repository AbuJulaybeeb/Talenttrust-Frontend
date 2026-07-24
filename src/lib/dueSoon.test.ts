// Pin timezone for deterministic tests
process.env.TZ = 'UTC';

import { parseLocalDate, isDueSoon } from './dueSoon';

describe('dueSoon utility tests', () => {
  describe('parseLocalDate', () => {
    it('parses valid YYYY-MM-DD strings and normalizes to local midnight', () => {
      const parsed = parseLocalDate('2026-05-10');
      expect(parsed).not.toBeNull();
      if (parsed) {
        expect(parsed.getFullYear()).toBe(2026);
        expect(parsed.getMonth()).toBe(4); // 0-indexed May
        expect(parsed.getDate()).toBe(10);
        expect(parsed.getHours()).toBe(0);
        expect(parsed.getMinutes()).toBe(0);
        expect(parsed.getSeconds()).toBe(0);
      }
    });

    it('returns null for invalid calendar dates (e.g., Feb 30th)', () => {
      expect(parseLocalDate('2026-02-30')).toBeNull();
      expect(parseLocalDate('2026-04-31')).toBeNull();
    });

    it('returns null for empty or whitespace-only strings', () => {
      expect(parseLocalDate('')).toBeNull();
      expect(parseLocalDate('   ')).toBeNull();
    });

    it('returns null for non-string inputs', () => {
      expect(parseLocalDate(null as any)).toBeNull();
      expect(parseLocalDate(undefined as any)).toBeNull();
      expect(parseLocalDate(12345 as any)).toBeNull();
      expect(parseLocalDate({} as any)).toBeNull();
    });

    it('falls back to standard parsing and normalizes to local midnight for full ISO strings', () => {
      const parsed = parseLocalDate('2026-05-10T15:30:00Z');
      expect(parsed).not.toBeNull();
      if (parsed) {
        // Since process.env.TZ = 'UTC' is set:
        // '2026-05-10T15:30:00Z' is 15:30 UTC.
        // Normalized to UTC midnight should be May 10, 2026.
        expect(parsed.getFullYear()).toBe(2026);
        expect(parsed.getMonth()).toBe(4);
        expect(parsed.getDate()).toBe(10);
        expect(parsed.getHours()).toBe(0);
      }
    });

    it('returns null for completely invalid date strings', () => {
      expect(parseLocalDate('not-a-date')).toBeNull();
      expect(parseLocalDate('2026-99-99')).toBeNull();
    });
  });

  describe('isDueSoon', () => {
    const today = new Date(2026, 4, 10); // May 10, 2026
    const windowDays = 7;

    it('returns true when due date is exactly today (0 days remaining)', () => {
      expect(isDueSoon('2026-05-10', today, windowDays)).toBe(true);
    });

    it('returns true when due date is exactly at the window edge (windowDays remaining)', () => {
      // May 17 is exactly 7 days after May 10
      expect(isDueSoon('2026-05-17', today, windowDays)).toBe(true);
    });

    it('returns false when due date is one day past the window', () => {
      // May 18 is 8 days after May 10
      expect(isDueSoon('2026-05-18', today, windowDays)).toBe(false);
    });

    it('returns false when due date is already overdue (e.g., yesterday)', () => {
      expect(isDueSoon('2026-05-09', today, windowDays)).toBe(false);
    });

    it('returns false for empty or invalid due dates', () => {
      expect(isDueSoon('', today, windowDays)).toBe(false);
      expect(isDueSoon(undefined, today, windowDays)).toBe(false);
      expect(isDueSoon('invalid-date', today, windowDays)).toBe(false);
    });
  });
});
