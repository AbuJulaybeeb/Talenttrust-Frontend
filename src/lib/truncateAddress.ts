import { isValidStellarAddress, normalizeStellarAddress } from './stellarAddress';

/**
 * Truncates a Stellar address (or any string) by keeping the start and end, and inserting an ellipsis.
 * The string is left untouched if its total length is at or below the threshold: `prefixLength + suffixLength + 3`.
 * This prevents truncating strings that wouldn't actually be shortened.
 */
export function truncateAddress(value: string, prefixLength = 6, suffixLength = 4): string {
  if (!value) {
    return '';
  }

  const normalizedValue = normalizeStellarAddress(value);
  const displayValue = isValidStellarAddress(normalizedValue) ? normalizedValue : value;

  if (displayValue.length <= prefixLength + suffixLength + 3) {
    return displayValue;
  }

  return `${displayValue.slice(0, prefixLength)}...${displayValue.slice(-suffixLength)}`;
}
