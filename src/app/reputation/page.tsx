'use client';

import React, { useCallback, useState } from 'react';
import EmptyState from '../../components/EmptyState';
import ReputationProfile from '../../components/ReputationProfile';
import type { Reputation } from '@/types/domain';

export type FetchState = 'idle' | 'loading' | 'success' | 'error' | 'empty';

export type ReputationPageContentProps = {
  reputationData?: Reputation | null;
  userName?: string;
  fetchState?: FetchState;
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | string | null;
  errorMessage?: string | null;
  onRetry?: () => void;
};

export function ReputationPageContent({
  reputationData,
  userName = 'User',
  fetchState,
  isLoading = false,
  isError = false,
  error = null,
  errorMessage = null,
  onRetry,
}: ReputationPageContentProps) {
  const score = reputationData?.score;
  const hasReputation = typeof score === 'number' && score >= 0;

  const resolvedErrorMessage =
    errorMessage ||
    (typeof error === 'string' ? error : error?.message) ||
    'Failed to load reputation data. Please check your connection and try again.';

  // Determine effective fetch state with strict exclusivity
  let state: FetchState;
  if (fetchState) {
    state = fetchState;
  } else if (isLoading) {
    state = 'loading';
  } else if (isError || error !== null || errorMessage !== null) {
    state = 'error';
  } else if (!reputationData || !hasReputation) {
    state = 'empty';
  } else {
    state = 'success';
  }

  if (state === 'loading') {
    return (
      <main className="min-h-screen p-8" aria-busy="true">
        <h1 className="text-2xl font-bold mb-6">Reputation</h1>
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          Loading reputation…
        </div>
        <div
          data-testid="reputation-loading"
          className="w-full max-w-5xl mx-auto space-y-8 px-4 py-10"
        >
          <div
            aria-hidden="true"
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 animate-pulse"
          >
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-slate-200" />
              <div className="space-y-2">
                <div className="h-4 w-28 rounded bg-slate-200" />
                <div className="h-6 w-40 rounded bg-slate-200" />
              </div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="h-20 rounded-2xl bg-slate-100" />
              <div className="h-20 rounded-2xl bg-slate-100" />
              <div className="h-20 rounded-2xl bg-slate-100" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (state === 'error') {
    return (
      <main className="min-h-screen p-8">
        <h1 className="text-2xl font-bold mb-6">Reputation</h1>
        <div
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          className="sr-only"
        >
          {resolvedErrorMessage}
        </div>
        <div
          data-testid="reputation-error"
          className="flex flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50 p-8 text-center shadow-sm max-w-2xl mx-auto my-8"
        >
          <div
            className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 ring-1 ring-red-200"
            aria-hidden="true"
          >
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-red-950">
            Failed to load reputation
          </h2>
          <p className="mb-6 max-w-md text-sm leading-6 text-red-800">
            {resolvedErrorMessage}
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-red-900"
              aria-label="Retry loading reputation"
            >
              Retry
            </button>
          )}
        </div>
      </main>
    );
  }

  if (state === 'empty') {
    return (
      <main className="min-h-screen p-8">
        <h1 className="text-2xl font-bold mb-6">Reputation</h1>
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          No reputation yet
        </div>
        <EmptyState
          illustration="reputation"
          title="No reputation yet"
          description="Your reputation will be built as you complete contracts and receive feedback from clients. Start by creating and fulfilling your first contract."
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Reputation</h1>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        Reputation profile loaded
      </div>
      <ReputationProfile
        name={userName}
        score={score}
        level={reputationData?.level}
        history={reputationData?.history}
      />
    </main>
  );
}

const ReputationPage: React.FC = () => {
  const [data, setData] = useState<Reputation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchReputation = useCallback(() => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      setData(null);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to load reputation data.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <ReputationPageContent
      reputationData={data}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRetry={fetchReputation}
    />
  );
};

export default ReputationPage;

