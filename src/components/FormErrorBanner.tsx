'use client';

import React, { useEffect, useRef } from 'react';

export interface FormErrorBannerProps {
  /**
   * The error message to display. When `null` or `undefined` the banner is
   * not rendered — this keeps the host form's conditional rendering simple.
   */
  message: string | null | undefined;
  /**
   * Optional callback invoked when the user activates the "Try again" button.
   * When omitted the retry button is not rendered.
   */
  onRetry?: () => void;
  /**
   * Optional label for the retry button.
   * Defaults to `"Try again"`.
   */
  retryLabel?: string;
  /**
   * Optional `data-testid` attribute forwarded to the banner root element.
   * Defaults to `"form-error-banner"`.
   */
  testId?: string;
}

/**
 * `FormErrorBanner` — an accessible inline banner that surfaces a
 * **form-level submission error** distinct from per-field validation errors.
 *
 * Accessibility contract:
 * - Uses `role="alert"` so assistive technologies announce the message
 *   immediately when it is mounted or updated.
 * - On mount the banner receives programmatic focus (`tabIndex={-1}`) so
 *   keyboard-only users are not left hunting for the new content.
 * - The optional retry button is a plain `<button type="button">` so it is
 *   keyboard-operable (Enter / Space) and receives visible focus styles.
 * - The banner is hidden (`return null`) when `message` is falsy, which keeps
 *   the host component's layout clean.
 *
 * State exclusivity:
 * - This component intentionally carries *no* internal state. The hosting
 *   form component owns the `message` value and clears it (e.g., by setting
 *   to `null`) when the user corrects the problem or retries. This makes the
 *   exclusivity between loading / empty / error / success states trivially
 *   verifiable at the host level.
 *
 * @example
 * ```tsx
 * const [submitError, setSubmitError] = useState<string | null>(null);
 *
 * const handleSubmit = async () => {
 *   setSubmitError(null);
 *   try {
 *     await save(data);
 *   } catch (err) {
 *     setSubmitError('Could not save. Please try again.');
 *   }
 * };
 *
 * <FormErrorBanner message={submitError} onRetry={handleSubmit} />
 * ```
 */
export const FormErrorBanner: React.FC<FormErrorBannerProps> = ({
  message,
  onRetry,
  retryLabel = 'Try again',
  testId = 'form-error-banner',
}) => {
  const bannerRef = useRef<HTMLDivElement>(null);

  // Move focus to the banner whenever a new error message appears so
  // keyboard-only and screen-reader users are immediately informed.
  useEffect(() => {
    if (message) {
      bannerRef.current?.focus();
    }
  }, [message]);

  if (!message) return null;

  return (
    <div
      ref={bannerRef}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      tabIndex={-1}
      data-testid={testId}
      className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-red-800">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex-shrink-0 rounded-md bg-red-100 px-3 py-1 text-xs font-semibold text-red-800 transition hover:bg-red-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            aria-label={retryLabel}
          >
            {retryLabel}
          </button>
        )}
      </div>
    </div>
  );
};
