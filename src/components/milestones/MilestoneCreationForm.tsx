'use client';

import React, { useState, useCallback, FormEvent } from 'react';
import { FormField } from '@/components/FormField';
import { ErrorSummary } from '@/components/ErrorSummary';
import { FormErrorBanner } from '@/components/FormErrorBanner';
import { sanitizeUserText } from '@/lib/sanitizeUserText';
import type { Milestone } from '@/types/domain';

export const MAX_MILESTONE_TITLE_LENGTH = 200;

/** Status options available when creating a milestone. */
const STATUS_OPTIONS: Milestone['status'][] = [
  'Pending',
  'Active',
  'Completed',
  'Paid',
  'Disputed',
];

/** Currency options available when creating a milestone. */
const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'XLM'] as const;

export interface MilestoneCreationFormProps {
  /**
   * Called with the fully-constructed `Milestone` object when the form
   * passes validation and the user submits.
   */
  onSubmit: (milestone: Milestone) => void;
  /** Called when the user cancels out of the form without saving. */
  onCancel: () => void;
  /**
   * Id of the parent contract this milestone is being created for. When
   * supplied (i.e. the form is opened from a contract detail context),
   * it is stamped onto the constructed `Milestone` so
   * `listMilestonesByContract` can later resolve it back to that contract.
   */
  contractId?: string;
  /**
   * Optional initial data to pre-populate the form fields. When `null` and
   * `loadError` is set, the form shows an error state instead of a blank form.
   */
  initialData?: {
    title?: string;
    payout?: string;
    currency?: string;
    status?: Milestone['status'];
    dueDate?: string;
  } | null;
  /**
   * When non-null, a `FormErrorBanner` is shown describing a failure that
   * occurred before this component mounted (e.g. loading pre-fill data).
   * Pair with `onRetryLoad` to offer a keyboard-operable retry button.
   */
  loadError?: string | null;
  /** Called when the user clicks "Try again" in the load-error banner. */
  onRetryLoad?: () => void;
}

/**
 * Accessible modal form for creating a new milestone.
 *
 * States:
 * - **Empty state** — rendered when `loadError` is set and `initialData` is
 *   `null`, indicating pre-fill data could not be loaded. A `FormErrorBanner`
 *   with a retry action is shown instead of a blank form body.
 * - **Error state** — after `onSubmit` throws, a `FormErrorBanner` is shown
 *   above the submit button with a "Try again" action that re-submits.
 * - **Loaded / success state** — calls `onSubmit` and the parent dismisses.
 *
 * Accessibility contract:
 * - `role="dialog"` / `aria-modal` for correct AT announcement.
 * - `ErrorSummary` with `role="alert"` focus management for invalid submissions.
 * - `FormErrorBanner` uses `role="alert"` and auto-focuses on mount.
 * - `FormField` handles per-field `aria-invalid`, `aria-describedby`, and
 *   error-border injection.
 * - `id` is generated from the title slug + a timestamp so duplicate titles
 *   never collide across sessions.
 */
export const MilestoneCreationForm: React.FC<MilestoneCreationFormProps> = ({
  onSubmit,
  onCancel,
  contractId,
  initialData,
  loadError,
  onRetryLoad,
}) => {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [payout, setPayout] = useState(initialData?.payout ?? '');
  const [currency, setCurrency] = useState<string>(initialData?.currency ?? 'USD');
  const [status, setStatus] = useState<Milestone['status']>(initialData?.status ?? 'Pending');
  const [dueDate, setDueDate] = useState(initialData?.dueDate ?? '');
  const [errors, setErrors] = useState<Array<{ fieldId: string; message: string }>>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Validates form fields and returns an array of error objects.
   * An empty array means the form is valid.
   */
  const validateForm = useCallback((): Array<{ fieldId: string; message: string }> => {
    const errs: Array<{ fieldId: string; message: string }> = [];

    const sanitizedTitle = sanitizeUserText(title, MAX_MILESTONE_TITLE_LENGTH);
    const unboundedTitle = sanitizeUserText(title, Number.MAX_SAFE_INTEGER);
    if (!sanitizedTitle) {
      errs.push({ fieldId: 'milestone-title', message: 'Title is required' });
    } else if (unboundedTitle.length > MAX_MILESTONE_TITLE_LENGTH) {
      errs.push({
        fieldId: 'milestone-title',
        message: `Title must be no more than ${MAX_MILESTONE_TITLE_LENGTH} characters`,
      });
    }

    const numericPayout = parseFloat(payout);
    if (!payout.trim()) {
      errs.push({ fieldId: 'milestone-payout', message: 'Payout amount is required' });
    } else if (isNaN(numericPayout) || numericPayout <= 0) {
      errs.push({ fieldId: 'milestone-payout', message: 'Payout must be a positive number' });
    }

    if (!currency.trim()) {
      errs.push({ fieldId: 'milestone-currency', message: 'Currency is required' });
    }

    return errs;
  }, [title, payout, currency]);

  /**
   * Core submission logic, shared between the form's `onSubmit` handler and
   * the retry callback on `FormErrorBanner`.
   */
  const attemptSubmit = useCallback(() => {
    const validationErrors = validateForm();
    setErrors(validationErrors);
    setSubmitError(null);

    if (validationErrors.length > 0) return;

    // Generate a stable id from title slug + current timestamp
    const sanitizedTitle = sanitizeUserText(title, MAX_MILESTONE_TITLE_LENGTH);
    const slug = sanitizedTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const id = `${slug}-${Date.now()}`;

    const milestone: Milestone = {
      id,
      title: sanitizedTitle,
      status,
      payout: parseFloat(payout),
      currency: currency.trim(),
      dueDate: dueDate.trim() || undefined,
      contractId,
    };

    try {
      onSubmit(milestone);
    } catch {
      setSubmitError(
        'Could not save the milestone. Please check your connection and try again.',
      );
    }
  }, [title, payout, currency, status, dueDate, contractId, validateForm, onSubmit]);

  /**
   * Handles form submission: validates, then calls `onSubmit` with the
   * constructed `Milestone` object on success.
   */
  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      attemptSubmit();
    },
    [attemptSubmit],
  );

  const getFieldError = (fieldId: string): string | undefined =>
    errors.find((e) => e.fieldId === fieldId)?.message;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-labelledby="create-milestone-title"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <h2
          id="create-milestone-title"
          className="text-2xl font-bold text-slate-900 mb-6"
        >
          Add Milestone
        </h2>

        {loadError && initialData === null ? (
          /* Empty / load-error state — shown when pre-fill data could not be
             fetched. Gives users actionable guidance instead of a blank form. */
          <div data-testid="form-load-error">
            <FormErrorBanner
              message={loadError}
              onRetry={onRetryLoad}
              retryLabel="Try again"
              testId="form-load-error-banner"
            />
            <p className="mt-2 text-sm text-slate-600">
              The form could not be loaded. Use the button above to retry, or{' '}
              <button
                type="button"
                onClick={onCancel}
                className="underline text-blue-600 hover:text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-600"
              >
                cancel
              </button>{' '}
              and try again later.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <ErrorSummary errors={errors} />

            {/* Submission error — shown after onSubmit throws. */}
            <FormErrorBanner
              message={submitError}
              onRetry={attemptSubmit}
              retryLabel="Try again"
            />

            <FormField
              label="Title"
              id="milestone-title"
              error={getFieldError('milestone-title')}
              required
            >
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Frontend Development – Sprint 1"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Payout Amount"
                id="milestone-payout"
                error={getFieldError('milestone-payout')}
                required
              >
                <input
                  type="text"
                  inputMode="decimal"
                  value={payout}
                  onChange={(e) => setPayout(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2500"
                />
              </FormField>

              <FormField
                label="Currency"
                id="milestone-currency"
                error={getFieldError('milestone-currency')}
                required
              >
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CURRENCY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <FormField label="Status" id="milestone-status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Milestone['status'])}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Due Date"
              id="milestone-dueDate"
              helperText="Optional — e.g., Jun 1, 2025"
            >
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Jun 1, 2025"
              />
            </FormField>

            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium"
              >
                Add Milestone
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
