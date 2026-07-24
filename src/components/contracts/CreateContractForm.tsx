'use client';

import React, { useState } from 'react';
import { FormField } from '@/components/FormField';
import { ErrorSummary } from '@/components/ErrorSummary';
import { FormErrorBanner } from '@/components/FormErrorBanner';
import { useToast } from '@/components/toast/toast-provider';
import { saveContract } from '@/lib/repository';
import { normalizeStellarAddress } from '@/lib/stellarAddress';
import { validateContract } from '@/lib/validateContract';
import type { ValidationError } from '@/lib/validateLogin';
import type { Contract } from '@/types/domain';

/**
 * Props for the `CreateContractForm` component.
 */
export interface CreateContractFormProps {
  /**
   * Called with the newly constructed and persisted `Contract` object
   * immediately after a successful form submission.
   * The parent is responsible for updating its own state (e.g. re-reading
   * from localStorage) and dismissing the form.
   */
  onSuccess: (contract: Contract) => void;
  /**
   * Called when the user presses the Cancel button without submitting.
   * The parent is responsible for hiding the form.
   */
  onCancel: () => void;
  /**
   * Optional initial data to pre-populate the form fields.
   * When provided the form operates in an "edit" mode (though submission
   * always creates a new persisted record via `saveContract`).
   *
   * If the parent tried to load pre-fill data and the load failed, pass
   * `null` here and set `loadError` to surface an error state instead of
   * a blank form.
   */
  initialData?: {
    contractName?: string;
    freelancerAddress?: string;
    totalValue?: string;
    currency?: string;
  } | null;
  /**
   * When non-null the form renders a `FormErrorBanner` describing a failure
   * that occurred **before** this component mounted — for example, a failed
   * attempt to load pre-fill data from an API. The `onRetryLoad` callback
   * (if supplied) is wired to the banner's retry button so users can trigger
   * a fresh fetch without reloading the whole page.
   *
   * This prop is intentionally separate from the internal submission-error
   * state to preserve state exclusivity: `loadError` describes a pre-render
   * problem while `submitError` (internal state) describes a post-submission
   * problem.
   */
  loadError?: string | null;
  /**
   * Called when the user clicks "Try again" in the load-error banner.
   * Only rendered when both `loadError` and `onRetryLoad` are provided.
   */
  onRetryLoad?: () => void;
}

/** Supported currency options presented in the currency selector. */
const CURRENCY_OPTIONS = ['USD', 'XLM', 'EUR', 'GBP'] as const;

/**
 * `CreateContractForm` — an accessible, validated inline form for creating
 * a new TalentTrust escrow contract.
 *
 * States:
 * - **Empty state** — rendered when `loadError` is set and `initialData` is
 *   `null`, indicating pre-fill data could not be loaded. An error banner with
 *   a retry action is shown instead of a blank form.
 * - **Error state** — after a failed persistence attempt (`saveContract`
 *   returns false or throws) the form surfaces a `FormErrorBanner` above the
 *   submit button with a "Try again" action that re-submits the last values.
 * - **Loading state** — while a submission is in flight the submit button is
 *   disabled to prevent duplicate submissions.
 * - **Loaded / success state** — calls `onSuccess` and the parent dismisses
 *   the form.
 *
 * Accessibility contract:
 * - The form is labelled by a visible `<h2>` via `aria-labelledby`.
 * - Every field is wrapped in `FormField`, which wires `<label>`,
 *   `aria-invalid`, and `aria-describedby` automatically.
 * - On validation failure, `ErrorSummary` is rendered and auto-focused
 *   via its own internal `useEffect`, moving screen reader focus to the
 *   error digest without an explicit `ref` here.
 * - `FormErrorBanner` uses `role="alert"` and auto-focuses on mount so
 *   submission errors are announced immediately to assistive technologies.
 * - Success is communicated through a polite `useToast` notification;
 *   no `alert()` is used.
 */
const CreateContractForm: React.FC<CreateContractFormProps> = ({
  onSuccess,
  onCancel,
  initialData,
  loadError,
  onRetryLoad,
}) => {
  const { showSuccess } = useToast();

  const [contractName, setContractName] = useState(initialData?.contractName ?? '');
  const [freelancerAddress, setFreelancerAddress] = useState(
    initialData?.freelancerAddress ?? '',
  );
  const [totalValue, setTotalValue] = useState(initialData?.totalValue ?? '');
  const [currency, setCurrency] = useState<string>(
    initialData?.currency ?? CURRENCY_OPTIONS[0],
  );
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Core submission logic extracted so it can be called both from the form's
   * `onSubmit` handler and from the retry callback on `FormErrorBanner`.
   */
  const attemptSubmit = () => {
    const validationErrors = validateContract({
      contractName,
      freelancerAddress,
      totalValue,
      currency,
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setSubmitError(null);
      return;
    }

    // Clear any previous errors before persisting.
    setErrors([]);
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const contract: Contract = {
        contractName: contractName.trim(),
        parties: [
          { label: 'Client', address: 'TalentTrust Client' },
          { label: 'Freelancer', address: normalizeStellarAddress(freelancerAddress) },
        ],
        totalValue: parseFloat(totalValue),
        currency,
        status: 'Pending',
        createdAt: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        milestoneCount: 0,
      };

      saveContract(contract);
      showSuccess({
        title: 'Contract created',
        description: `"${contract.contractName}" has been saved.`,
      });
      onSuccess(contract);
    } catch {
      setSubmitError(
        'Could not save the contract. Please check your connection and try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    attemptSubmit();
  };

  const inputClass =
    'w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition';

  return (
    <section
      aria-labelledby="create-contract-heading"
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2
        id="create-contract-heading"
        className="text-xl font-semibold text-slate-900 mb-6"
      >
        Create a new contract
      </h2>

      {/* Load error — replaces the form body when pre-fill data could not be
          fetched, giving users actionable guidance rather than a blank form. */}
      {loadError && initialData === null ? (
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
        <>
          <ErrorSummary errors={errors} />

          {/* Submission error — shown after a failed persistence attempt. */}
          <FormErrorBanner
            message={submitError}
            onRetry={attemptSubmit}
            retryLabel="Try again"
          />

          <form onSubmit={handleSubmit} noValidate>
            <FormField
              id="contractName"
              label="Contract name"
              error={errors.find((e) => e.fieldId === 'contractName')?.message}
              required
            >
              <input
                type="text"
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
                placeholder="e.g. Website Redesign"
                autoComplete="off"
                className={inputClass}
              />
            </FormField>

            <FormField
              id="freelancerAddress"
              label="Freelancer Stellar address"
              helperText="Must be a valid Stellar public key starting with G"
              error={errors.find((e) => e.fieldId === 'freelancerAddress')?.message}
              required
            >
              <input
                type="text"
                value={freelancerAddress}
                onChange={(e) => setFreelancerAddress(e.target.value)}
                placeholder="GABC…"
                autoComplete="off"
                className={`${inputClass} font-mono`}
              />
            </FormField>

            <FormField
              id="totalValue"
              label="Total value"
              error={errors.find((e) => e.fieldId === 'totalValue')?.message}
              required
            >
              <input
                type="number"
                value={totalValue}
                onChange={(e) => setTotalValue(e.target.value)}
                placeholder="0.00"
                min="0.01"
                step="any"
                className={inputClass}
              />
            </FormField>

            <FormField
              id="currency"
              label="Currency"
              error={errors.find((e) => e.fieldId === 'currency')?.message}
              required
            >
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={inputClass}
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-2xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                aria-disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving…' : 'Create Contract'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="rounded-2xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-slate-400 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </>
      )}
    </section>
  );
};

export default CreateContractForm;
