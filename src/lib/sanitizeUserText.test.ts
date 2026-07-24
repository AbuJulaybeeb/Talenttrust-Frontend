import { sanitizeUserText } from './sanitizeUserText';

describe('sanitizeUserText', () => {
  it('trims surrounding whitespace and collapses internal whitespace', () => {
    expect(sanitizeUserText('  Website\t\n  Redesign  ', 100)).toBe('Website Redesign');
  });

  it('removes C0, DEL, and C1 control characters', () => {
    expect(sanitizeUserText('Client\u0000\u001F\u007F\u0085 Name', 100)).toBe('Client Name');
  });

  it('returns an empty string when the input is only whitespace or controls', () => {
    expect(sanitizeUserText('\t\u0000\n\u007F ', 100)).toBe('');
  });

  it('preserves printable Unicode characters', () => {
    expect(sanitizeUserText('  Café — 開発  ', 100)).toBe('Café — 開発');
  });

  it('caps the cleaned value at maxLength', () => {
    expect(sanitizeUserText('  abcdef  ', 4)).toBe('abcd');
  });

  it('supports a zero-length cap', () => {
    expect(sanitizeUserText('text', 0)).toBe('');
  });

  it.each([-1, 1.5, Number.POSITIVE_INFINITY, Number.NaN])(
    'rejects an invalid maxLength of %p',
    (maxLength) => {
      expect(() => sanitizeUserText('text', maxLength)).toThrow(RangeError);
    },
  );
});
