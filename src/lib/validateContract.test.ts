import { validateContract } from './validateContract';

const VALID_STELLAR_KEY = 'GAAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQDZ7H';
const INVALID_CHECKSUM_KEY = 'GABQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQDZ7H';

function validPayload(overrides: Record<string, string> = {}) {
  return {
    contractName: 'Freelance Website',
    freelancerAddress: VALID_STELLAR_KEY,
    totalValue: '5000.00',
    currency: 'USD',
    ...overrides,
  };
}

describe('validateContract', () => {
  describe('contractName', () => {
    it('returns a required error when contractName is empty', () => {
      const errors = validateContract(validPayload({ contractName: '' }));
      expect(errors).toHaveLength(1);
      expect(errors[0].fieldId).toBe('contractName');
      expect(errors[0].message).toBe('Contract name is required');
    });

    it('returns a required error when contractName is whitespace only', () => {
      const errors = validateContract(validPayload({ contractName: '   ' }));
      expect(errors).toHaveLength(1);
      expect(errors[0].fieldId).toBe('contractName');
      expect(errors[0].message).toBe('Contract name is required');
    });

    it('trims surrounding whitespace and accepts the value', () => {
      const errors = validateContract(validPayload({ contractName: '   Test   ' }));
      expect(errors).toEqual([]);
    });
  });

  describe('freelancerAddress', () => {
    it('returns exactly one "required" error for an empty address', () => {
      const errors = validateContract(validPayload({ freelancerAddress: '' }));
      expect(errors).toHaveLength(1);
      expect(errors[0].fieldId).toBe('freelancerAddress');
      expect(errors[0].message).toBe('Freelancer address is required');
    });

    it('returns exactly one "required" error for whitespace-only address', () => {
      const errors = validateContract(validPayload({ freelancerAddress: '   ' }));
      expect(errors).toHaveLength(1);
      expect(errors[0].fieldId).toBe('freelancerAddress');
      expect(errors[0].message).toBe('Freelancer address is required');
    });

    it('returns exactly one format error for a malformed short address', () => {
      const errors = validateContract(validPayload({ freelancerAddress: 'G12345' }));
      expect(errors).toHaveLength(1);
      expect(errors[0].fieldId).toBe('freelancerAddress');
      expect(errors[0].message).toBe(
        'Freelancer address must be a valid Stellar G... address',
      );
    });

    it('returns a format error for an address with invalid checksum', () => {
      const errors = validateContract(
        validPayload({ freelancerAddress: INVALID_CHECKSUM_KEY }),
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].fieldId).toBe('freelancerAddress');
      expect(errors[0].message).toBe(
        'Freelancer address must be a valid Stellar G... address',
      );
    });

    it('returns a format error for an address that starts with the wrong prefix', () => {
      const errors = validateContract(
        validPayload({ freelancerAddress: `S${VALID_STELLAR_KEY.slice(1)}` }),
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].fieldId).toBe('freelancerAddress');
      expect(errors[0].message).toBe(
        'Freelancer address must be a valid Stellar G... address',
      );
    });

    it('accepts a valid Stellar address', () => {
      const errors = validateContract(
        validPayload({ freelancerAddress: VALID_STELLAR_KEY }),
      );
      const addressErrors = errors.filter(
        (e) => e.fieldId === 'freelancerAddress',
      );
      expect(addressErrors).toHaveLength(0);
    });

    it('accepts a valid Stellar address with extra whitespace and lower case', () => {
      const errors = validateContract(
        validPayload({ freelancerAddress: `  ${VALID_STELLAR_KEY.toLowerCase()}  ` }),
      );
      expect(errors).toEqual([]);
    });
  });

  describe('totalValue', () => {
    it.each([
      ['empty string', ''],
      ['whitespace only', '   '],
      ['non-numeric text', 'abc'],
      ['zero', '0'],
      ['negative number', '-5'],
      ['Infinity', 'Infinity'],
      ['-Infinity', '-Infinity'],
    ])('returns an error for totalValue of %s', (_, value) => {
      const errors = validateContract(validPayload({ totalValue: value }));
      expect(errors).toHaveLength(1);
      expect(errors[0].fieldId).toBe('totalValue');
      expect(errors[0].message).toBe('Total value must be a positive number');
    });

    it('accepts a valid decimal totalValue', () => {
      const errors = validateContract(validPayload({ totalValue: '12.99' }));
      const tvErrors = errors.filter((e) => e.fieldId === 'totalValue');
      expect(tvErrors).toHaveLength(0);
    });

    it('accepts a whole number totalValue', () => {
      const errors = validateContract(validPayload({ totalValue: '42' }));
      const tvErrors = errors.filter((e) => e.fieldId === 'totalValue');
      expect(tvErrors).toHaveLength(0);
    });

    it('accepts a large integer totalValue', () => {
      const errors = validateContract(validPayload({ totalValue: '999999999' }));
      const tvErrors = errors.filter((e) => e.fieldId === 'totalValue');
      expect(tvErrors).toHaveLength(0);
    });
  });

  describe('currency', () => {
    it('returns a required error when currency is empty', () => {
      const errors = validateContract(validPayload({ currency: '' }));
      expect(errors).toHaveLength(1);
      expect(errors[0].fieldId).toBe('currency');
      expect(errors[0].message).toBe('Currency is required');
    });

    it('returns a required error when currency is whitespace only', () => {
      const errors = validateContract(validPayload({ currency: '   ' }));
      expect(errors).toHaveLength(1);
      expect(errors[0].fieldId).toBe('currency');
      expect(errors[0].message).toBe('Currency is required');
    });

    it('trims surrounding whitespace from currency', () => {
      const errors = validateContract(validPayload({ currency: '  USDC  ' }));
      expect(errors).toEqual([]);
    });
  });

  describe('multiple errors', () => {
    it('returns errors for all empty fields in deterministic order', () => {
      const errors = validateContract({
        contractName: '',
        freelancerAddress: '',
        totalValue: '',
        currency: '',
      });
      expect(errors).toHaveLength(4);
      expect(errors[0].fieldId).toBe('contractName');
      expect(errors[1].fieldId).toBe('freelancerAddress');
      expect(errors[2].fieldId).toBe('totalValue');
      expect(errors[3].fieldId).toBe('currency');
    });

    it('returns errors for multiple invalid fields simultaneously', () => {
      const errors = validateContract({
        contractName: '',
        freelancerAddress: 'invalid',
        totalValue: '-1',
        currency: '',
      });
      expect(errors).toHaveLength(4);
      expect(errors[0].fieldId).toBe('contractName');
      expect(errors[0].message).toBe('Contract name is required');
      expect(errors[1].fieldId).toBe('freelancerAddress');
      expect(errors[1].message).toBe(
        'Freelancer address must be a valid Stellar G... address',
      );
      expect(errors[2].fieldId).toBe('totalValue');
      expect(errors[2].message).toBe('Total value must be a positive number');
      expect(errors[3].fieldId).toBe('currency');
      expect(errors[3].message).toBe('Currency is required');
    });
  });

  describe('valid payload', () => {
    it('returns an empty array for fully valid input', () => {
      const errors = validateContract(validPayload());
      expect(errors).toEqual([]);
    });
  });
});
