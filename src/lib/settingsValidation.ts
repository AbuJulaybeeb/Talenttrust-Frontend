export type SettingsValue = string | number | null | undefined;

export type SettingsFieldRule = {
  required?: boolean;
  type?: 'email' | 'number' | 'text';
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  requiredMessage?: string;
  invalidMessage?: string;
  minMessage?: string;
  maxMessage?: string;
};

export type SettingsRules = Record<string, SettingsFieldRule>;
export type SettingsErrors = Record<string, string>;

const DEFAULT_REQUIRED_MESSAGE = 'This field is required.';
const DEFAULT_INVALID_MESSAGE = 'Enter a valid value.';

function isEmpty(value: SettingsValue): boolean {
  return value === null || value === undefined || String(value).trim() === '';
}

function validateValue(value: SettingsValue, rule: SettingsFieldRule): string | undefined {
  if (isEmpty(value)) {
    return rule.required
      ? rule.requiredMessage ?? DEFAULT_REQUIRED_MESSAGE
      : undefined;
  }

  const text = String(value).trim();

  if (rule.type === 'email') {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(text)) {
      return rule.invalidMessage ?? 'Enter a valid email address.';
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
    return rule.invalidMessage ?? `Enter at least ${rule.minLength} characters.`;
  }

  if (rule.maxLength !== undefined && text.length > rule.maxLength) {
    return rule.invalidMessage ?? `Enter no more than ${rule.maxLength} characters.`;
  }

  if (rule.pattern !== undefined) {
    const pattern = new RegExp(rule.pattern.source, rule.pattern.flags);
    if (!pattern.test(text)) {
      return rule.invalidMessage ?? DEFAULT_INVALID_MESSAGE;
    }
  }

  return undefined;
}

export function validateSettings(
  values: Record<string, SettingsValue>,
  rules: SettingsRules,
): SettingsErrors {
  const errors: SettingsErrors = {};

  Object.entries(rules).forEach(([field, rule]) => {
    const error = validateValue(values[field], rule);
    if (error !== undefined) {
      errors[field] = error;
    }
  });

  return errors;
}

export function isSettingsValid(
  values: Record<string, SettingsValue>,
  rules: SettingsRules,
): boolean {
  return Object.keys(validateSettings(values, rules)).length === 0;
}
