import {
  isSettingsValid,
  validateSettings,
  type SettingsRules,
} from '../settingsValidation';

const rules: SettingsRules = {
  displayName: {
    required: true,
    minLength: 2,
    maxLength: 40,
  },
  email: {
    required: true,
    type: 'email',
  },
  hourlyRate: {
    required: true,
    type: 'number',
    min: 1,
    max: 10000,
  },
  walletAddress: {
    pattern: /^G[A-Z2-7]{55}$/,
    invalidMessage: 'Enter a valid wallet address.',
  },
};

describe('validateSettings', () => {
  it('returns no errors for valid settings', () => {
    expect(
      validateSettings(
        {
          displayName: 'Ada Lovelace',
          email: 'ada@example.com',
          hourlyRate: '125',
          walletAddress: 'G' + 'A'.repeat(55),
        },
        rules,
      ),
    ).toEqual({});
  });

  it('reports required errors for empty values', () => {
    expect(
      validateSettings(
        {
          displayName: '',
          email: '   ',
          hourlyRate: undefined,
        },
        rules,
      ),
    ).toEqual({
      displayName: 'This field is required.',
      email: 'This field is required.',
      hourlyRate: 'This field is required.',
    });
  });

  it('reports email format errors', () => {
    expect(
      validateSettings(
        {
          displayName: 'Ada',
          email: 'not-an-email',
          hourlyRate: 100,
        },
        rules,
      ),
    ).toEqual({ email: 'Enter a valid email address.' });
  });

  it('reports numeric format errors', () => {
    expect(
      validateSettings(
        {
          displayName: 'Ada',
          email: 'ada@example.com',
          hourlyRate: 'not-a-number',
        },
        rules,
      ),
    ).toEqual({ hourlyRate: 'Enter a valid number.' });
  });

  it('reports values below the minimum', () => {
    expect(
      validateSettings(
        {
          displayName: 'Ada',
          email: 'ada@example.com',
          hourlyRate: 0,
        },
        rules,
      ),
    ).toEqual({ hourlyRate: 'Value must be at least 1.' });
  });

  it('reports values above the maximum', () => {
    expect(
      validateSettings(
        {
          displayName: 'Ada',
          email: 'ada@example.com',
          hourlyRate: 10001,
        },
        rules,
      ),
    ).toEqual({ hourlyRate: 'Value must be no more than 10000.' });
  });

  it('reports text length violations', () => {
    expect(
      validateSettings(
        {
          displayName: 'A',
          email: 'ada@example.com',
          hourlyRate: 100,
        },
        rules,
      ),
    ).toEqual({ displayName: 'Enter at least 2 characters.' });
  });

  it('reports custom pattern violations', () => {
    expect(
      validateSettings(
        {
          displayName: 'Ada',
          email: 'ada@example.com',
          hourlyRate: 100,
          walletAddress: 'invalid-wallet',
        },
        rules,
      ),
    ).toEqual({ walletAddress: 'Enter a valid wallet address.' });
  });

  it('does not reject optional empty fields', () => {
    expect(
      validateSettings(
        {
          displayName: 'Ada',
          email: 'ada@example.com',
          hourlyRate: 100,
          walletAddress: '',
        },
        rules,
      ),
    ).toEqual({});
  });
});

describe('isSettingsValid', () => {
  it('returns true when every field is valid', () => {
    expect(
      isSettingsValid(
        {
          displayName: 'Ada',
          email: 'ada@example.com',
          hourlyRate: 100,
        },
        rules,
      ),
    ).toBe(true);
  });

  it('returns false when any field is invalid', () => {
    expect(
      isSettingsValid(
        {
          displayName: 'Ada',
          email: 'invalid',
          hourlyRate: 100,
        },
        rules,
      ),
    ).toBe(false);
  });
});
