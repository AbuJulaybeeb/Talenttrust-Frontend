'use client';

import React, { useState, useCallback, FormEvent } from 'react';
import { FormField } from './FormField';
import { ErrorSummary } from './ErrorSummary';
import {
  MAX_COMMENT_LENGTH,
  MIN_RATING,
  MAX_RATING,
  validateReputationRatingForm,
  type ReputationRatingFormValues,
  type FieldError,
} from '@/lib/reputationValidation';

export interface ReputationRatingSubmission {
  reviewerId: string;
  contextId: string;
  rating: number;
  comment?: string;
}

interface ReputationRatingFormProps {
  onSubmit: (submission: ReputationRatingSubmission) => void;
  onCancel?: () => void;
}

/**
 * Accessible form for submitting a reputation rating.
 *
 * Validation rules mirror the server's `updateReputationSchema`
 * (Talenttrust-Backend, PUT /api/v1/reputation/:id) exactly:
 * - reviewerId is required
 * - contextId is required and must be a valid UUID
 * - rating is required, must be an integer from 1 to 5
 * - comment is optional, max 1000 characters, and rejected as spam if a
 *   single character makes up more than half its content
 *
 * Errors are surfaced both via `ErrorSummary` (screen-reader-focused
 * summary at the top of the form) and inline per-field via `FormField`'s
 * `aria-describedby` wiring, matching the pattern already used by
 * `ContractCreationForm`. Submission is blocked entirely while any field is
 * invalid.
 */
export const ReputationRatingForm: React.FC<ReputationRatingFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [reviewerId, setReviewerId] = useState('');
  const [contextId, setContextId] = useState('');
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<FieldError[]>([]);

  const getFieldError = (fieldId: string): string | undefined =>
    errors.find((e) => e.fieldId === fieldId)?.message;

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const values: ReputationRatingFormValues = {
        reviewerId,
        contextId,
        rating,
        comment,
      };
      const validationErrors = validateReputationRatingForm(values);
      setErrors(validationErrors);

      if (validationErrors.length > 0) {
        return;
      }

      onSubmit({
        reviewerId: reviewerId.trim(),
        contextId: contextId.trim(),
        rating: Number(rating.trim()),
        ...(comment.trim() ? { comment: comment.trim() } : {}),
      });
    },
    [reviewerId, contextId, rating, comment, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} noValidate aria-labelledby="reputation-rating-form-title">
      <h2 id="reputation-rating-form-title" className="text-xl font-semibold text-slate-900 mb-6">
        Submit a reputation rating
      </h2>

      <ErrorSummary errors={errors} />

      <FormField
        label="Reviewer ID"
        id="reviewerId"
        error={getFieldError('reviewerId')}
        required
      >
        <input
          type="text"
          value={reviewerId}
          onChange={(e) => setReviewerId(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., user-123"
        />
      </FormField>

      <FormField
        label="Context ID"
        id="contextId"
        error={getFieldError('contextId')}
        helperText="The UUID of the contract or engagement this rating relates to"
        required
      >
        <input
          type="text"
          value={contextId}
          onChange={(e) => setContextId(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="550e8400-e29b-41d4-a716-446655440000"
        />
      </FormField>

      <FormField
        label="Rating"
        id="rating"
        error={getFieldError('rating')}
        helperText={`Integer from ${MIN_RATING} to ${MAX_RATING}`}
        required
      >
        <input
          type="number"
          min={MIN_RATING}
          max={MAX_RATING}
          step={1}
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="5"
        />
      </FormField>

      <FormField
        label="Comment"
        id="comment"
        error={getFieldError('comment')}
        helperText={`Optional, up to ${MAX_COMMENT_LENGTH} characters`}
      >
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Optional feedback for this rating"
        />
      </FormField>

      <div className="flex gap-3 justify-end mt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium"
        >
          Submit Rating
        </button>
      </div>
    </form>
  );
};

export default ReputationRatingForm;
