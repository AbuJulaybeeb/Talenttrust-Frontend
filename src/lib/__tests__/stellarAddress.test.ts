import { isValidStellarAddress, normalizeStellarAddress } from '../stellarAddress';

describe('stellarAddress helpers', () => {
  const VALID_KEY = 'GAAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQDZ7H';

  it('accepts well-formed Stellar public keys with valid StrKey checksum', () => {
    expect(isValidStellarAddress(VALID_KEY)).toBe(true);
    expect(isValidStellarAddress(VALID_KEY.toLowerCase())).toBe(true);
    expect(normalizeStellarAddress(VALID_KEY.toLowerCase())).toBe(VALID_KEY);
  });

  it('normalizes surrounding whitespace and casing before validation', () => {
    expect(isValidStellarAddress(`  ${VALID_KEY.toLowerCase()}  `)).toBe(true);
  });

  it('rejects keys with an invalid StrKey checksum', () => {
    expect(isValidStellarAddress('GABQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQDZ7H')).toBe(false);
    expect(isValidStellarAddress('GAAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQDZ7I')).toBe(false);
  });

  it('rejects wrong prefixes, bad lengths, and invalid characters', () => {
    expect(isValidStellarAddress('')).toBe(false);
    expect(isValidStellarAddress('ABC1234567890')).toBe(false);
    expect(isValidStellarAddress('SAAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQDZ7H')).toBe(false);
    expect(isValidStellarAddress(`G${'A'.repeat(54)}`)).toBe(false);
    expect(isValidStellarAddress(`G${'A'.repeat(55)}!`)).toBe(false);
    expect(isValidStellarAddress(`G${'A'.repeat(55)}O`)).toBe(false);
  });

  it('rejects malformed checksum corruption including truncated and extended keys', () => {
    const tooShort = VALID_KEY.slice(0, -1);
    expect(isValidStellarAddress(tooShort)).toBe(false);
    expect(isValidStellarAddress(VALID_KEY + 'A')).toBe(false);
  });

  it('normalizes whitespace and case without touching already-normalized values', () => {
    expect(normalizeStellarAddress(`  ${VALID_KEY.toLowerCase()}  `)).toBe(VALID_KEY);
    expect(normalizeStellarAddress(`\n\t${VALID_KEY}\r\n`)).toBe(VALID_KEY);
    expect(normalizeStellarAddress(VALID_KEY)).toBe(VALID_KEY);
  });

  it('returns an empty string for blank and non-string input', () => {
    expect(normalizeStellarAddress('')).toBe('');
    expect(normalizeStellarAddress('   ')).toBe('');
    expect(normalizeStellarAddress(null)).toBe('');
    expect(normalizeStellarAddress(undefined)).toBe('');
    expect(normalizeStellarAddress(12345 as unknown as string)).toBe('');
    expect(isValidStellarAddress('   ')).toBe(false);
  });

  it('handles nullish input without throwing', () => {
    expect(isValidStellarAddress(null)).toBe(false);
    expect(isValidStellarAddress(undefined)).toBe(false);
    expect(isValidStellarAddress('')).toBe(false);
  });

  it('returns false, not throws, on decode errors', () => {
    expect(isValidStellarAddress('G----IIIILLLL__IIII____OOOO000O')).toBe(false);
    expect(isValidStellarAddress('G')).toBe(false);
  });
});
