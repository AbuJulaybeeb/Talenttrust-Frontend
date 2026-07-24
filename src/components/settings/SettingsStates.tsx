'use client';

import { useEffect, useRef } from 'react';

export interface SettingsLoadingStateProps {
  message?: string;
}

export interface SettingsEmptyStateProps {
  title: string;
  description: string;
}

export interface SettingsErrorStateProps {
  error: Error;
  onRetry: () => void | Promise<void>;
  retryLabel?: string;
}

/**
 * Loading state component with spinner and live region announcement.
 * - Renders a spinning loader with message
 * - Announces loading state via aria-live="polite" for assistive tech
 */
export const SettingsLoadingState: React.FC<SettingsLoadingStateProps> = ({
  message = 'Loading your settings...',
}) => {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-96 gap-4"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="w-8 h-8 border-4 border-[var(--muted)] border-t-[var(--primary)] rounded-full animate-spin" />
      <p className="text-sm text-[var(--muted-foreground)]">{message}</p>
    </div>
  );
};

/**
 * Empty state component with focus management.
 * - Renders when fetch succeeds but returns no data
 * - Sets initial focus to the container for screen readers
 * - Uses status role for polite announcements
 */
export const SettingsEmptyState: React.FC<SettingsEmptyStateProps> = ({
  title,
  description,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus the empty state container so screen readers announce it
    ref.current?.focus();
  }, []);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center min-h-96 gap-4 p-6 text-center"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      tabIndex={-1}
    >
      <svg
        className="w-12 h-12 text-[var(--muted)]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <div>
        <h3 className="font-semibold text-[var(--foreground)] text-lg">
          {title}
        </h3>
        <p className="text-[var(--muted-foreground)] text-sm mt-1">
          {description}
        </p>
      </div>
    </div>
  );
};

/**
 * Error state component with keyboard-accessible retry button.
 * - Renders when fetch fails with an error
 * - Shows error message and retry button
 * - Retry button is keyboard-accessible with focus ring
 * - Sets initial focus to container and uses role="alert" for urgent announcements
 */
export const SettingsErrorState: React.FC<SettingsErrorStateProps> = ({
  error,
  onRetry,
  retryLabel = 'Try Again',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus the error state container so screen readers announce it
    ref.current?.focus();
  }, []);

  const handleRetryClick = () => {
    const result = onRetry();
    // Handle both sync and async retry functions
    if (result instanceof Promise) {
      result.catch((err) => {
        console.error('Retry failed:', err);
      });
    }
  };

  const handleRetryKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Allow Enter and Space to trigger retry
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRetryClick();
    }
  };

  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center min-h-96 gap-4 p-6 text-center"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      tabIndex={-1}
    >
      <svg
        className="w-12 h-12 text-red-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div>
        <h3 className="font-semibold text-[var(--foreground)] text-lg">
          Unable to Load Settings
        </h3>
        <p className="text-[var(--muted-foreground)] text-sm mt-1">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
      </div>
      <button
        onClick={handleRetryClick}
        onKeyDown={handleRetryKeyDown}
        className="mt-4 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-md hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 transition-colors font-medium"
        aria-label={retryLabel}
      >
        {retryLabel}
      </button>
    </div>
  );
};
