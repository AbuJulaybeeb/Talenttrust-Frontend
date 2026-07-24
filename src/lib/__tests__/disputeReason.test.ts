import { validateDisputeReason, DISPUTE_REASON_MAX_LENGTH } from '../disputeReason';

describe('validateDisputeReason', () => {
  it('returns invalid for empty input', () => {
    const result = validateDisputeReason('');
    expect(result).toEqual({
      valid: false,
      error: 'Please provide a reason for the dispute.',
    });
  });

  it('returns invalid for null/undefined/empty string coercion', () => {
    // Cast to any to test potential javascript/runtime fallback cases
    expect(validateDisputeReason(null as any)).toEqual({
      valid: false,
      error: 'Please provide a reason for the dispute.',
    });
    expect(validateDisputeReason(undefined as any)).toEqual({
      valid: false,
      error: 'Please provide a reason for the dispute.',
    });
  });

  it('returns invalid for whitespace-only input', () => {
    const result = validateDisputeReason('    ');
    expect(result).toEqual({
      valid: false,
      error: 'Please provide a reason for the dispute.',
    });
  });

  it('returns valid for normal reason input', () => {
    const result = validateDisputeReason('The developer failed to deliver the final milestone milestone-3.');
    expect(result).toEqual({
      valid: true,
    });
  });

  it('returns valid when exactly at the character limit (500 characters)', () => {
    const atLimitReason = 'a'.repeat(DISPUTE_REASON_MAX_LENGTH);
    const result = validateDisputeReason(atLimitReason);
    expect(result).toEqual({
      valid: true,
    });
  });

  it('returns invalid when over the character limit (501 characters)', () => {
    const overLimitReason = 'a'.repeat(DISPUTE_REASON_MAX_LENGTH + 1);
    const result = validateDisputeReason(overLimitReason);
    expect(result).toEqual({
      valid: false,
      error: `Reason must be ${DISPUTE_REASON_MAX_LENGTH} characters or fewer.`,
    });
  });

  it('correctly handles leading/trailing whitespace without failing validation if the trimmed content is valid', () => {
    const reasonableText = '  This is a valid dispute reason after trimming.  ';
    const result = validateDisputeReason(reasonableText);
    expect(result).toEqual({
      valid: true,
    });
  });

  it('fails if the trimmed content exceeds the limit', () => {
    const tooLong = '  ' + 'a'.repeat(DISPUTE_REASON_MAX_LENGTH + 1) + '  ';
    const result = validateDisputeReason(tooLong);
    expect(result).toEqual({
      valid: false,
      error: `Reason must be ${DISPUTE_REASON_MAX_LENGTH} characters or fewer.`,
    });
  });
});
