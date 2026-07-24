import { truncateAddress } from '../truncateAddress';

describe('truncateAddress', () => {
  it('returns the original value when the string is short enough', () => {
    expect(truncateAddress('GABC12345')).toBe('GABC12345');
    expect(truncateAddress('1234567890')).toBe('1234567890');
  });

  it('properly truncates long addresses', () => {
    expect(truncateAddress('GABC1234DEF5678HIJK9012LMNO3456PQRS7890')).toBe('GABC12...7890');
  });

  it('handles empty or missing values safely', () => {
    expect(truncateAddress('')).toBe('');
  });

  it('keeps the existing truncation behavior for non-Stellar values', () => {
    expect(truncateAddress('not-a-valid-stellar-address')).toBe('not-a-...ress');
  });

  it('normalizes valid Stellar addresses before truncating them', () => {
    const validAddress = `gaaqcaibaeaQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQDZ7H`;

    expect(truncateAddress(validAddress)).toBe('GAAQCA...DZ7H');
  });

  describe('boundary conditions (prefixLength=6, suffixLength=4, threshold=13)', () => {
    it('returns the unchanged string when length is exactly at the threshold (13 characters)', () => {
      const atThreshold = '1234567890123';
      expect(atThreshold).toHaveLength(13);
      expect(truncateAddress(atThreshold)).toBe(atThreshold);
    });

    it('returns the unchanged string when length is just below the threshold (12 characters)', () => {
      const belowThreshold = '123456789012';
      expect(belowThreshold).toHaveLength(12);
      expect(truncateAddress(belowThreshold)).toBe(belowThreshold);
    });

    it('truncates the string when length is exactly one over the threshold (14 characters)', () => {
      const overThreshold = '12345678901234';
      expect(overThreshold).toHaveLength(14);
      expect(truncateAddress(overThreshold)).toBe('123456...1234');
    });
  });

  describe('custom prefix and suffix lengths', () => {
    it('uses custom prefix and suffix lengths correctly', () => {
      // String length 20, prefix 2, suffix 2. Threshold = 2 + 2 + 3 = 7. Length > 7, so truncated.
      expect(truncateAddress('ABCDEFGHIJKLMNOPQRST', 2, 2)).toBe('AB...ST');
    });

    it('respects the threshold dynamically based on custom arguments', () => {
      // prefix 3, suffix 3. Threshold = 3 + 3 + 3 = 9.
      const atCustomThreshold = '123456789';
      expect(atCustomThreshold).toHaveLength(9);
      expect(truncateAddress(atCustomThreshold, 3, 3)).toBe(atCustomThreshold);

      const overCustomThreshold = '1234567890';
      expect(overCustomThreshold).toHaveLength(10);
      expect(truncateAddress(overCustomThreshold, 3, 3)).toBe('123...890');
    });
  });
});
