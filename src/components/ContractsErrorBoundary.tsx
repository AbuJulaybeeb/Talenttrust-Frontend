'use client';

import React, { Component, ReactNode } from 'react';
import Link from 'next/link';
import { reportError } from '../lib/errorReporter';

interface Props {
  /** Content to guard. */
  children: ReactNode;
  /**
   * Optional custom fallback UI.  When provided it replaces the default
   * accessible fallback entirely; the retry button is the caller's
   * responsibility.
   */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  /** The captured error, available to custom fallback renderers. */
  error: Error | null;
}

/**
 * ContractsErrorBoundary
 *
 * Wraps the contracts section so that an unexpected render error shows an
 * accessible fallback with a Retry button instead of blanking the page.
 *
 * Errors are forwarded to the shared `reportError` seam so they can be
 * routed to any configured error reporter (e.g. Sentry) without being
 * swallowed silently.
 *
 * Usage:
 * ```tsx
 * <ContractsErrorBoundary>
 *   <ContractsPage />
 * </ContractsErrorBoundary>
 * ```
 */
export default class ContractsErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    reportError(error, 'ContractsErrorBoundary', 'error', {
      componentStack: info.componentStack ?? undefined,
    });
  }

  /**
   * Resets the error boundary state so the children are re-mounted on the
   * next render.  Callers should fix the underlying cause before triggering
   * this (e.g. by clearing stale data) so the retry attempt succeeds.
   */
  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { hasError } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) {
      return children;
    }

    if (fallback) {
      return fallback;
    }

    return (
      <div
        role="alert"
        aria-live="assertive"
        className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-8 text-center space-y-4"
      >
        <p className="text-lg font-semibold text-red-700">
          The contracts section failed to load.
        </p>
        <p className="text-sm text-red-600">
          An unexpected error occurred. You can retry or go back to the home page.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={this.reset}
            className="rounded-2xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-gray-800"
          >
            Retry
          </button>
          <Link
            href="/"
            className="rounded-2xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }
}
