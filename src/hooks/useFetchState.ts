import { useState, useCallback } from 'react';

/**
 * The four mutually exclusive fetch states for a data-loading operation.
 *
 * - `idle` — no fetch has started yet (initial state).
 * - `loading` — a fetch is in flight.
 * - `error` — the last fetch failed.
 * - `empty` — the fetch succeeded but returned no usable data.
 * - `loaded` — the fetch succeeded and data is available.
 */
export type FetchStatus = 'idle' | 'loading' | 'error' | 'empty' | 'loaded';

export interface UseFetchStateReturn {
  /** The current status of the fetch operation. Exactly one value at a time. */
  status: FetchStatus;
  /** The error message when `status === 'error'`, otherwise `null`. */
  errorMessage: string | null;
  /** `true` only while `status === 'loading'`. */
  isLoading: boolean;
  /** `true` only while `status === 'empty'`. */
  isEmpty: boolean;
  /** `true` only while `status === 'error'`. */
  isError: boolean;
  /** `true` only while `status === 'loaded'`. */
  isLoaded: boolean;
  /** Transition to the `loading` state and clear any previous error. */
  setLoading: () => void;
  /** Transition to the `loaded` state and clear any previous error. */
  setLoaded: () => void;
  /** Transition to the `empty` state and clear any previous error. */
  setEmpty: () => void;
  /**
   * Transition to the `error` state with the supplied message.
   * @param message - A user-readable description of what went wrong.
   */
  setError: (message: string) => void;
  /** Transition back to the `idle` state and clear any previous error. */
  reset: () => void;
}

/**
 * `useFetchState` — a lightweight hook that manages the four mutually
 * exclusive states for a data-loading operation: idle, loading, empty,
 * error, and loaded.
 *
 * This hook encapsulates the pattern already used in
 * `src/app/contracts/[id]/page.tsx` and `ActionPanel` — where `isLoading`,
 * `errorMessage`, and `setErrorMessage` are managed in parallel — and exposes
 * them through a single, type-safe API.
 *
 * State exclusivity is enforced: every transition setter first sets
 * `status` to the target value before updating `errorMessage`, so callers
 * never observe a combination like `{ isLoading: true, isError: true }`.
 *
 * @param initial - Optional starting state. Defaults to `'idle'`.
 *
 * @example
 * ```tsx
 * const { isLoading, isEmpty, isError, errorMessage, setLoading, setLoaded, setEmpty, setError } =
 *   useFetchState();
 *
 * const load = async () => {
 *   setLoading();
 *   try {
 *     const data = await fetchData();
 *     if (!data || data.length === 0) {
 *       setEmpty();
 *     } else {
 *       setLoaded();
 *     }
 *   } catch (err) {
 *     setError(err instanceof Error ? err.message : 'Failed to load data.');
 *   }
 * };
 * ```
 */
export function useFetchState(initial: FetchStatus = 'idle'): UseFetchStateReturn {
  const [status, setStatus] = useState<FetchStatus>(initial);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setLoading = useCallback(() => {
    setStatus('loading');
    setErrorMessage(null);
  }, []);

  const setLoaded = useCallback(() => {
    setStatus('loaded');
    setErrorMessage(null);
  }, []);

  const setEmpty = useCallback(() => {
    setStatus('empty');
    setErrorMessage(null);
  }, []);

  const setError = useCallback((message: string) => {
    setStatus('error');
    setErrorMessage(message);
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  return {
    status,
    errorMessage,
    isLoading: status === 'loading',
    isEmpty: status === 'empty',
    isError: status === 'error',
    isLoaded: status === 'loaded',
    setLoading,
    setLoaded,
    setEmpty,
    setError,
    reset,
  };
}
