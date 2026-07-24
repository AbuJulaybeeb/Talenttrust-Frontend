/**
 * Maximum character length for a dispute reason.
 */
export const DISPUTE_REASON_MAX_LENGTH = 500;

/**
 * Validates a dispute reason string.
 *
 * Rules:
 *   1. Must not be empty or contain only whitespace characters.
 *   2. Trimmed length must not exceed DISPUTE_REASON_MAX_LENGTH.
 *
 * @param value The raw dispute reason input from the user.
 * @returns An object containing the validation status and an optional error message.
 */
export function validateDisputeReason(value: string): { valid: boolean; error?: string } {
  const trimmed = (value || '').trim();

  if (trimmed.length === 0) {
    return {
      valid: false,
      error: 'Please provide a reason for the dispute.',
    };
  }

  if (trimmed.length > DISPUTE_REASON_MAX_LENGTH) {
    return {
      valid: false,
      error: `Reason must be ${DISPUTE_REASON_MAX_LENGTH} characters or fewer.`,
    };
  }

  return { valid: true };
}
