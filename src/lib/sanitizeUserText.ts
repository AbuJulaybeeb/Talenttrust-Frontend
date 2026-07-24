/**
 * Produces display-safe, consistently formatted user text.
 *
 * Control characters are removed before whitespace is normalised, then the
 * result is capped. Callers that accept user input should validate the
 * normalised, uncapped value before saving so an over-length value can be
 * reported instead of silently truncated.
 */
export function sanitizeUserText(value: string, maxLength: number): string {
  if (!Number.isSafeInteger(maxLength) || maxLength < 0) {
    throw new RangeError('maxLength must be a non-negative safe integer');
  }

  return value
    // Stripping C0/C1 control characters is the purpose of this function.
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, maxLength);
}
