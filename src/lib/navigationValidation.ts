export type NavigationValue = string | number | null | undefined;

export type NavigationFieldRule = {
  required?: boolean;
  type?: 'text' | 'number' | 'path';
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  requiredMessage?: string;
  invalidMessage?: string;
  minMessage?: string;
  maxMessage?: string;
  minLengthMessage?: string;
  maxLengthMessage?: string;
};

export type NavigationRules = Record<string, NavigationFieldRule>;
export type NavigationErrors = Record<string, string>;

const DEFAULT_REQUIRED_MESSAGE = 'This field is required.';
const DEFAULT_INVALID_MESSAGE = 'Enter a valid value.';

function isEmpty(value: NavigationValue): boolean {
  return value === null || value === undefined || String(value).trim() === '';
}

function validateValue(value: NavigationValue, rule: NavigationFieldRule): string | undefined {
  if (isEmpty(value)) {
    return rule.required
      ? rule.requiredMessage ?? DEFAULT_REQUIRED_MESSAGE
      : undefined;
  }

  const text = String(value).trim();

  if (rule.type === 'path') {
    const MAX_ID_LENGTH = 64;
    const VALID_ID_RE = /^[a-zA-Z0-9_-]+$/;
    
    if (text.length > MAX_ID_LENGTH) {
      return rule.maxLengthMessage ?? `Path must be no more than ${MAX_ID_LENGTH} characters.`;
    }
    
    if (!VALID_ID_RE.test(text)) {
      return rule.invalidMessage ?? 'Path contains invalid characters.';
    }
  }

  if (rule.type === 'number' || rule.min !== undefined || rule.max !== undefined) {
    const numberValue = typeof value === 'number' ? value : Number(text);
    if (!Number.isFinite(numberValue)) {
      return rule.invalidMessage ?? 'Enter a valid number.';
    }

    if (rule.min !== undefined && numberValue < rule.min) {
      return rule.minMessage ?? `Value must be at least ${rule.min}.`;
    }

    if (rule.max !== undefined && numberValue > rule.max) {
      return rule.maxMessage ?? `Value must be no more than ${rule.max}.`;
    }
  }

  if (rule.minLength !== undefined && text.length < rule.minLength) {
    return rule.minLengthMessage ?? `Enter at least ${rule.minLength} characters.`;
  }

  if (rule.maxLength !== undefined && text.length > rule.maxLength) {
    return rule.maxLengthMessage ?? `Enter no more than ${rule.maxLength} characters.`;
  }

  if (rule.pattern !== undefined) {
    const pattern = new RegExp(rule.pattern.source, rule.pattern.flags);
    if (!pattern.test(text)) {
      return rule.invalidMessage ?? DEFAULT_INVALID_MESSAGE;
    }
  }

  return undefined;
}

/**
 * Validates form values against the specified navigation rules.
 * Matches settings validation format.
 */
export function validateNavigation(
  values: Record<string, NavigationValue>,
  rules: NavigationRules,
): NavigationErrors {
  const errors: NavigationErrors = {};

  Object.entries(rules).forEach(([field, rule]) => {
    const error = validateValue(values[field], rule);
    if (error !== undefined) {
      errors[field] = error;
    }
  });

  return errors;
}

/**
 * Returns true if the values are valid according to the navigation rules.
 */
export function isNavigationValid(
  values: Record<string, NavigationValue>,
  rules: NavigationRules,
): boolean {
  return Object.keys(validateNavigation(values, rules)).length === 0;
}
