import { useCallback, useState } from 'react';

export type FetchState = 'idle' | 'loading' | 'success' | 'error' | 'empty';

export interface UseFetchStateReturn<T> {
  state: FetchState;
  data: T | null;
  error: Error | null;
  retry: () => Promise<void>;
  setData: (data: T | null) => void;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  isSuccess: boolean;
}

/**
 * Hook for managing async data fetch states with distinct handling for:
 * - loading: data is being fetched
 * - empty: fetch succeeded but returned no data (null or empty array)
 * - error: fetch failed with an error
 * - success: fetch succeeded with data
 *
 * Ensures states are mutually exclusive for predictable UI rendering.
 */
export function useFetchState<T>(
  fetchFn: () => Promise<T>,
  onSuccess?: (data: T) => void,
  onError?: (error: Error) => void
): UseFetchStateReturn<T> {
  const [state, setState] = useState<FetchState>('idle');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setState('loading');
    setError(null);
    setData(null);
    try {
      const result = await fetchFn();
      // Determine if result is empty: null, undefined, or empty array
      const isEmpty =
        result === null ||
        result === undefined ||
        (Array.isArray(result) && result.length === 0);

      if (isEmpty) {
        setState('empty');
        setData(null);
      } else {
        setState('success');
        setData(result);
        onSuccess?.(result);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState('error');
      setError(error);
      onError?.(error);
    }
  }, [fetchFn, onSuccess, onError]);

  return {
    state,
    data,
    error,
    retry: fetch,
    setData,
    isLoading: state === 'loading',
    isError: state === 'error',
    isEmpty: state === 'empty',
    isSuccess: state === 'success',
  };
}
