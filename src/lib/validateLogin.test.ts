import {
  MAX_EMAIL_LENGTH,
  MAX_PASSWORD_LENGTH,
  validateLogin,
} from './validateLogin';

const EMAIL_SUFFIX = '@example.com';

function validEmailWithLength(length: number): string {
  if (length < EMAIL_SUFFIX.length + 1) {
    throw new Error('Email length must leave room for a local part');
  }

  return `${'a'.repeat(length - EMAIL_SUFFIX.length)}${EMAIL_SUFFIX}`;
}

describe('validateLogin', () => {
  it('should return no errors for valid inputs', () => {
    const errors = validateLogin('test@example.com', 'password123');
    expect(errors).toEqual([]);
  });

  it('should require email', () => {
    const errors = validateLogin('', 'password123');
    expect(errors).toEqual([
      { fieldId: 'email', message: 'Email is required' },
    ]);
  });

  it('should validate email format', () => {
    const errors = validateLogin('invalid-email', 'password123');
    expect(errors).toEqual([
      { fieldId: 'email', message: 'Email must be valid' },
    ]);
  });

  it('should require password', () => {
    const errors = validateLogin('test@example.com', '');
    expect(errors).toEqual([
      { fieldId: 'password', message: 'Password is required' },
    ]);
  });

  it('should validate password length', () => {
    const errors = validateLogin('test@example.com', 'short');
    expect(errors).toEqual([
      { fieldId: 'password', message: 'Password must be at least 8 characters' },
    ]);
  });

  it('should collect multiple validation errors', () => {
    const errors = validateLogin('', 'short');
    expect(errors).toEqual([
      { fieldId: 'email', message: 'Email is required' },
      { fieldId: 'password', message: 'Password must be at least 8 characters' },
    ]);
  });

  describe('length ceilings', () => {
    it('exports MAX_EMAIL_LENGTH as 254 per RFC 5321', () => {
      expect(MAX_EMAIL_LENGTH).toBe(254);
    });

    it('exports MAX_PASSWORD_LENGTH as 128', () => {
      expect(MAX_PASSWORD_LENGTH).toBe(128);
    });

    it('trims surrounding whitespace from the email before validating', () => {
      const errors = validateLogin('  test@example.com  ', 'password123');
      expect(errors).toEqual([]);
    });

    it('treats a whitespace-only email as empty after trimming', () => {
      const errors = validateLogin('     ', 'password123');
      expect(errors).toEqual([
        { fieldId: 'email', message: 'Email is required' },
      ]);
    });

    it.each([MAX_EMAIL_LENGTH - 1, MAX_EMAIL_LENGTH])(
      'accepts a valid email at %i characters',
      (length) => {
        const email = validEmailWithLength(length);

        expect(email).toHaveLength(length);
        expect(validateLogin(email, 'password123')).toEqual([]);
      },
    );

    it('rejects a valid email at 255 characters', () => {
      const email = validEmailWithLength(MAX_EMAIL_LENGTH + 1);

      expect(email).toHaveLength(255);
      const errors = validateLogin(email, 'password123');
      expect(errors).toEqual([
        {
          fieldId: 'email',
          message: `Email must be no more than ${MAX_EMAIL_LENGTH} characters`,
        },
      ]);
    });

    it('counts length against the trimmed email, not the raw input', () => {
      const paddedEmail = `   ${validEmailWithLength(MAX_EMAIL_LENGTH)}   `;

      expect(validateLogin(paddedEmail, 'password123')).toEqual([]);
    });

    it.each([
      {
        length: 7,
        expected: [
          {
            fieldId: 'password',
            message: 'Password must be at least 8 characters',
          },
        ],
      },
      { length: 8, expected: [] },
      { length: MAX_PASSWORD_LENGTH, expected: [] },
      {
        length: MAX_PASSWORD_LENGTH + 1,
        expected: [
          {
            fieldId: 'password',
            message: `Password must be no more than ${MAX_PASSWORD_LENGTH} characters`,
          },
        ],
      },
    ])('validates the $length-character password boundary', ({ length, expected }) => {
      const password = 'a'.repeat(length);

      expect(password).toHaveLength(length);
      expect(validateLogin('test@example.com', password)).toEqual(expected);
    });

    it('returns the over-length email error before checking email format', () => {
      const malformedEmail = 'a'.repeat(MAX_EMAIL_LENGTH + 1);

      expect(malformedEmail).not.toContain('@');
      const errors = validateLogin(malformedEmail, 'password123');
      expect(errors).toEqual([
        {
          fieldId: 'email',
          message: `Email must be no more than ${MAX_EMAIL_LENGTH} characters`,
        },
      ]);
    });

    it('returns the required email error before length or format errors', () => {
      const errors = validateLogin('     ', 'password123');

      expect(errors).toEqual([
        {
          fieldId: 'email',
          message: 'Email is required',
        },
      ]);
    });

    it('keeps errors in form-field order when both fields fail', () => {
      const longEmail = 'a'.repeat(MAX_EMAIL_LENGTH + 1);
      const longPassword = 'a'.repeat(MAX_PASSWORD_LENGTH + 1);
      const errors = validateLogin(longEmail, longPassword);

      expect(errors.map(({ fieldId }) => fieldId)).toEqual(['email', 'password']);
      expect(errors).toEqual([
        {
          fieldId: 'email',
          message: `Email must be no more than ${MAX_EMAIL_LENGTH} characters`,
        },
        {
          fieldId: 'password',
          message: `Password must be no more than ${MAX_PASSWORD_LENGTH} characters`,
        },
      ]);
    });
  });
});
