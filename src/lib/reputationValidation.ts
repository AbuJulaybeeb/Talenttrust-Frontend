import { sanitizeUserText } from './sanitizeUserText';

export const MAX_COMMENT_LENGTH = 1000;
export const MIN_RATING = 1;
export const MAX_RATING = 5;

/**
 * Client-side validation for the "submit a reputation rating" form.
 *
 * These rules mirror `updateReputationSchema` in
 * `Talenttrust-Backend/src/modules/reputation/dto/reputation.dto.ts`
 * (PUT /api/v1/reputation/:id) field-for-field, so a submission that passes
 * here should never be rejected by the server for a reason a user could have
 * fixed up front. The server remains the source of truth and re-validates
 * independently; this module only lets the UI surface the same problems
 * inline, before a round trip.
 */

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

/**
 * Mirrors `isNotSpamComment` in reputation.dto.ts: rejects a comment where
 * any single character makes up more than half of its content.
 */
export function isSpamComment(comment: string): boolean {
  if (comment.length === 0) {
    return false;
  }

  const charCount: Record<string, number> = {};
  for (const char of comment) {
    charCount[char] = (charCount[char] || 0) + 1;
  }

  const maxCharCount = Math.max(...Object.values(charCount));
  const repetitionRatio = maxCharCount / comment.length;

  return repetitionRatio > 0.5;
}

export function validateReviewerId(value: string): string | undefined {
  if (!value.trim()) {
    return 'Reviewer ID is required';
  }
  return undefined;
}

export function validateContextId(value: string): string | undefined {
  if (!value.trim()) {
    return 'Context ID is required';
  }
  if (!isValidUuid(value.trim())) {
    return 'Context ID must be a valid UUID';
  }
  return undefined;
}

/**
 * Validates a rating value, accepting the raw string a text/number input
 * produces. Mirrors the backend's `.finite().int().min(1).max(5)` chain.
 */
export function validateRating(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'Rating is required';
  }

  const parsed = Number(trimmed);

  if (!Number.isFinite(parsed)) {
    return 'Rating must be a finite number';
  }
  if (!Number.isInteger(parsed)) {
    return 'Rating must be an integer';
  }
  if (parsed < MIN_RATING) {
    return `Rating must be at least ${MIN_RATING}`;
  }
  if (parsed > MAX_RATING) {
    return `Rating must be at most ${MAX_RATING}`;
  }
  return undefined;
}

/** Comment is optional — an empty string is valid. */
export function validateComment(value: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const unbounded = sanitizeUserText(value, Number.MAX_SAFE_INTEGER);
  if (unbounded.length > MAX_COMMENT_LENGTH) {
    return `Comment must not exceed ${MAX_COMMENT_LENGTH} characters`;
  }

  if (isSpamComment(value)) {
    return 'Comment contains excessive repetitive content';
  }

  return undefined;
}

export interface ReputationRatingFormValues {
  reviewerId: string;
  contextId: string;
  rating: string;
  comment: string;
}

export interface FieldError {
  fieldId: string;
  message: string;
}

/**
 * Validates the full reputation rating form and returns every failing
 * field, in the same `{ fieldId, message }` shape `ErrorSummary` and
 * `FormField` already expect elsewhere in this app (see
 * `ContractCreationForm.tsx`).
 */
export function validateReputationRatingForm(
  values: ReputationRatingFormValues,
): FieldError[] {
  const errors: FieldError[] = [];

  const reviewerIdError = validateReviewerId(values.reviewerId);
  if (reviewerIdError) errors.push({ fieldId: 'reviewerId', message: reviewerIdError });

  const contextIdError = validateContextId(values.contextId);
  if (contextIdError) errors.push({ fieldId: 'contextId', message: contextIdError });

  const ratingError = validateRating(values.rating);
  if (ratingError) errors.push({ fieldId: 'rating', message: ratingError });

  const commentError = validateComment(values.comment);
  if (commentError) errors.push({ fieldId: 'comment', message: commentError });

  return errors;
}
