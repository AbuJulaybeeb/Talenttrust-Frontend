import type { ValidationError } from './validateLogin';
import { sanitizeUserText } from './sanitizeUserText';

export const MAX_MILESTONE_TITLE_LENGTH = 200;
export const MAX_MILESTONE_PAYOUT_LIMIT = 1_000_000_000;
export const ALLOWED_CURRENCIES = ['USD', 'EUR', 'GBP', 'XLM'] as const;

/**
 * Raw input values for milestone creation or editing.
 */
export interface MilestoneFormValues {
  /** Title of the milestone */
  title: string;
  /** Payout amount as raw input string */
  payout: string;
  /** Currency code (e.g. "USD", "XLM") */
  currency: string;
  /** Optional status (e.g. "Pending", "Active") */
  status?: string;
  /** Optional due date string */
  dueDate?: string;
}

/**
 * Pure client-side validator for milestone dialog inputs.
 *
 * Rules:
 * - `title`: Required (non-empty after trim), max 200 characters.
 * - `payout`: Required, must parse as a positive finite number (> 0) and not exceed 1,000,000,000.
 * - `currency`: Required, must be one of the supported currencies (USD, EUR, GBP, XLM).
 * - `dueDate`: Optional, but if provided, must parse as a valid date with year between 2000 and 2100.
 *
 * @param values - Raw string form values captured from milestone dialog inputs.
 * @returns Array of `ValidationError` objects. Empty array indicates valid inputs.
 */
export function validateMilestone(values: MilestoneFormValues): ValidationError[] {
  const errors: ValidationError[] = [];

  const titleTrimmed = (values.title || '').trim();
  const sanitizedTitle = sanitizeUserText(titleTrimmed, MAX_MILESTONE_TITLE_LENGTH);
  const unboundedTitle = sanitizeUserText(titleTrimmed, Number.MAX_SAFE_INTEGER);

  if (!sanitizedTitle) {
    errors.push({ fieldId: 'milestone-title', message: 'Title is required' });
  } else if (unboundedTitle.length > MAX_MILESTONE_TITLE_LENGTH) {
    errors.push({
      fieldId: 'milestone-title',
      message: `Title must be no more than ${MAX_MILESTONE_TITLE_LENGTH} characters`,
    });
  }

  const rawPayout = (values.payout || '').trim();
  const numericPayout = parseFloat(rawPayout);

  if (!rawPayout) {
    errors.push({ fieldId: 'milestone-payout', message: 'Payout amount is required' });
  } else if (isNaN(numericPayout) || !isFinite(numericPayout) || numericPayout <= 0) {
    errors.push({ fieldId: 'milestone-payout', message: 'Payout must be a positive number' });
  } else if (numericPayout > MAX_MILESTONE_PAYOUT_LIMIT) {
    errors.push({
      fieldId: 'milestone-payout',
      message: `Payout amount cannot exceed ${MAX_MILESTONE_PAYOUT_LIMIT.toLocaleString()}`,
    });
  }

  const currencyTrimmed = (values.currency || '').trim().toUpperCase();
  if (!currencyTrimmed) {
    errors.push({ fieldId: 'milestone-currency', message: 'Currency is required' });
  } else if (!ALLOWED_CURRENCIES.includes(currencyTrimmed as any)) {
    errors.push({ fieldId: 'milestone-currency', message: 'Invalid currency selected' });
  }

  if (values.dueDate && values.dueDate.trim().length > 0) {
    const rawDate = values.dueDate.trim();
    const timestamp = Date.parse(rawDate);
    if (isNaN(timestamp)) {
      errors.push({
        fieldId: 'milestone-dueDate',
        message: 'Due date must be a valid date string (e.g. YYYY-MM-DD or MMM D, YYYY)',
      });
    } else {
      const year = new Date(timestamp).getFullYear();
      if (year < 2000 || year > 2100) {
        errors.push({
          fieldId: 'milestone-dueDate',
          message: 'Due date year must be between 2000 and 2100',
        });
      }
    }
  }

  return errors;
}
