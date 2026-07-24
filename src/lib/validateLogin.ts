/**
 * The maximum allowed length for an email address on the login form.
 *
 * Set to 254 characters per RFC 5321 §4.5.3.1, which is the longest
 * legal email address deliverable on the public internet. The browser
 * input layer (`maxLength`) and the validator both enforce this ceiling
 * so a pathologically large paste cannot reach downstream
 * validation, rendering, or auth code.
 */
export const MAX_EMAIL_LENGTH = 254;

/**
 * The maximum allowed length for a password on the login form.
 *
 * 128 characters is a defensive upper bound: bcrypt and Argon2 will
 * silently truncate anything longer, so capping at the UI layer
 * surfaces the constraint to the user instead of silently dropping
 * characters. Combined with the existing 8-character minimum this
 * matches common industry limits and prevents denial-of-service from
 * arbitrarily large pasted secrets.
 */
export const MAX_PASSWORD_LENGTH = 128;

/**
 * Represents a validation error for a specific form field.
 */
export interface ValidationError {
  /** The unique identifier of the form field that has the error. */
  fieldId: string;
  /** The localized/readable error message string. */
  message: string;
}

/**
 * Validates the email and password fields for the login form.
 *
 * Rules:
 * - **Email**: required; trimmed of surrounding whitespace before
 *   validation; must be no longer than {@link MAX_EMAIL_LENGTH}
 *   characters after trimming; must contain `@`.
 * - **Password**: required; must be no longer than
 *   {@link MAX_PASSWORD_LENGTH} characters; must be at least 8
 *   characters long.
 *
 * Validation order per field is **required → length → format**, so the
 * most actionable error is surfaced first. A whitespace-only email
 * (`"   "`) is treated as empty and surfaces `"Email is required"`,
 * while a 300-character pasted email surfaces the over-length error
 * before the `must be valid` error so the user is told to shorten the
 * input rather than fix its shape.
 *
 * The function is pure and side-effect-free so it can be safely called
 * from both the React form component and unit tests.
 *
 * @param email - The raw email string from the email input. Surrounding
 *                whitespace is trimmed before validation.
 * @param password - The raw password string from the password input.
 *                  Passwords are **not** trimmed because leading or
 *                  trailing spaces can be a deliberate part of the
 *                  secret.
 * @returns An array of validation errors, each containing the `fieldId`
 *          and the corresponding error message. Returns an empty
 *          array when the input passes every rule.
 *
 * @example
 * ```ts
 * validateLogin('  test@example.com  ', 'password123'); // []
 * validateLogin('   ', 'password123');                  // [{ email: 'Email is required' }]
 * validateLogin('a'.repeat(300), 'password123');        // [{ email: 'Email must be no more than 254 characters' }]
 * ```
 */
export function validateLogin(email: string, password: string): ValidationError[] {
  const errors: ValidationError[] = [];

  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    errors.push({ fieldId: 'email', message: 'Email is required' });
  } else if (trimmedEmail.length > MAX_EMAIL_LENGTH) {
    errors.push({
      fieldId: 'email',
      message: `Email must be no more than ${MAX_EMAIL_LENGTH} characters`,
    });
  } else if (!trimmedEmail.includes('@')) {
    errors.push({ fieldId: 'email', message: 'Email must be valid' });
  }

  if (!password) {
    errors.push({ fieldId: 'password', message: 'Password is required' });
  } else if (password.length > MAX_PASSWORD_LENGTH) {
    errors.push({
      fieldId: 'password',
      message: `Password must be no more than ${MAX_PASSWORD_LENGTH} characters`,
    });
  } else if (password.length < 8) {
    errors.push({ fieldId: 'password', message: 'Password must be at least 8 characters' });
  }

  return errors;
}
