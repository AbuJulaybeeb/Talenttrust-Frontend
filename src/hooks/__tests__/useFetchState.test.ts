import { renderHook, act } from '@testing-library/react';
import { useFetchState, FetchStatus } from '../useFetchState';

describe('useFetchState', () => {
  describe('initial state', () => {
    it('defaults to idle status', () => {
      const { result } = renderHook(() => useFetchState());
      expect(result.current.status).toBe('idle');
    });

    it('accepts a custom initial status', () => {
      const { result } = renderHook(() => useFetchState('loading'));
      expect(result.current.status).toBe('loading');
    });

    it('starts with null errorMessage', () => {
      const { result } = renderHook(() => useFetchState());
      expect(result.current.errorMessage).toBeNull();
    });

    it('starts with all boolean flags false when idle', () => {
      const { result } = renderHook(() => useFetchState());
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isEmpty).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.isLoaded).toBe(false);
    });
  });

  describe('setLoading', () => {
    it('transitions status to loading', () => {
      const { result } = renderHook(() => useFetchState());
      act(() => result.current.setLoading());
      expect(result.current.status).toBe('loading');
      expect(result.current.isLoading).toBe(true);
    });

    it('clears a prior error message', () => {
      const { result } = renderHook(() => useFetchState());
      act(() => result.current.setError('previous error'));
      act(() => result.current.setLoading());
      expect(result.current.errorMessage).toBeNull();
    });

    it('only isLoading is true — all other flags are false', () => {
      const { result } = renderHook(() => useFetchState());
      act(() => result.current.setLoading());
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isEmpty).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.isLoaded).toBe(false);
    });
  });

  describe('setLoaded', () => {
    it('transitions status to loaded', () => {
      const { result } = renderHook(() => useFetchState());
      act(() => result.current.setLoaded());
      expect(result.current.status).toBe('loaded');
      expect(result.current.isLoaded).toBe(true);
    });

    it('clears a prior error message', () => {
      const { result } = renderHook(() => useFetchState());
      act(() => result.current.setError('previous error'));
      act(() => result.current.setLoaded());
      expect(result.current.errorMessage).toBeNull();
    });

    it('only isLoaded is true — all other flags are false', () => {
      const { result } = renderHook(() => useFetchState());
      act(() => result.current.setLoaded());
      expect(result.current.isLoaded).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isEmpty).toBe(false);
      expect(result.current.isError).toBe(false);
    });
  });

  describe('setEmpty', () => {
    it('transitions status to empty', () => {
      const { result } = renderHook(() => useFetchState());
      act(() => result.current.setEmpty());
      expect(result.current.status).toBe('empty');
      expect(result.current.isEmpty).toBe(true);
    });

    it('clears a prior error message', () => {
      const { result } = renderHook(() => useFetchState());
      act(() => result.current.setError('previous error'));
      act(() => result.current.setEmpty());
      expect(result.current.errorMessage).toBeNull();
    });

    it('only isEmpty is true — all other flags are false', () => {
      const { result } = renderHook(() => useFetchState());
      act(() => result.current.setEmpty());
      expect(result.current.isEmpty).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.isLoaded).toBe(false);
    });
  });

  describe('setError', () => {
    it('transitions status to error', () => {
      const { result } = renderHook(() => useFetchState());
      act(() => result.current.setError('Network failure'));
      expect(result.current.status).toBe('error');
      expect(result.current.isError).toBe(true);
    });

    it('stores the error message', () => {
      const { result } = renderHook(() => useFetchState());
      act(() => result.current.setError('Network failure'));
      expect(result.current.errorMessage).toBe('Network failure');
    });

    it('only isError is true — all other flags are false', () => {
      const { result } = renderHook(() => useFetchState());
      act(() => result.current.setError('oops'));
      expect(result.current.isError).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isEmpty).toBe(false);
      expect(result.current.isLoaded).toBe(false);
    });

    it('overwrites a prior error message', () => {
      const { result } = renderHook(() => useFetchState());
      act(() => result.current.setError('first'));
      act(() => result.current.setError('second'));
      expect(result.current.errorMessage).toBe('second');
    });
  });

  describe('reset', () => {
    it('transitions back to idle', () => {
      const { result } = renderHook(() => useFetchState());
      act(() => result.current.setError('oops'));
      act(() => result.current.reset());
      expect(result.current.status).toBe('idle');
    });

    it('clears errorMessage', () => {
      const { result } = renderHook(() => useFetchState());
      act(() => result.current.setError('oops'));
      act(() => result.current.reset());
      expect(result.current.errorMessage).toBeNull();
    });

    it('all boolean flags are false after reset', () => {
      const { result } = renderHook(() => useFetchState());
      act(() => result.current.setLoaded());
      act(() => result.current.reset());
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isEmpty).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.isLoaded).toBe(false);
    });
  });

  describe('state exclusivity — only one flag true at a time', () => {
    const transitions: Array<[string, (r: ReturnType<typeof useFetchState>) => void]> = [
      ['setLoading', (r) => r.setLoading()],
      ['setLoaded', (r) => r.setLoaded()],
      ['setEmpty', (r) => r.setEmpty()],
      ['setError', (r) => r.setError('err')],
      ['reset', (r) => r.reset()],
    ];

    it.each(transitions)('after %s at most one boolean flag is true', (_name, transition) => {
      const { result } = renderHook(() => useFetchState());
      act(() => transition(result.current));
      const flags = [
        result.current.isLoading,
        result.current.isEmpty,
        result.current.isError,
        result.current.isLoaded,
      ];
      const trueCount = flags.filter(Boolean).length;
      expect(trueCount).toBeLessThanOrEqual(1);
    });

    it('loading → error: only isError is true', () => {
      const { result } = renderHook(() => useFetchState());
      act(() => result.current.setLoading());
      act(() => result.current.setError('fail'));
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(true);
    });

    it('error → loaded (retry success): only isLoaded is true', () => {
      const { result } = renderHook(() => useFetchState());
      act(() => result.current.setError('fail'));
      act(() => result.current.setLoaded());
      expect(result.current.isError).toBe(false);
      expect(result.current.errorMessage).toBeNull();
      expect(result.current.isLoaded).toBe(true);
    });

    it('loaded → empty: only isEmpty is true', () => {
      const { result } = renderHook(() => useFetchState());
      act(() => result.current.setLoaded());
      act(() => result.current.setEmpty());
      expect(result.current.isLoaded).toBe(false);
      expect(result.current.isEmpty).toBe(true);
    });
  });

  describe('retry re-fetch pattern', () => {
    it('setLoading clears error before a re-fetch begins', () => {
      const { result } = renderHook(() => useFetchState());

      // Simulate: fetch → error → retry
      act(() => result.current.setLoading());
      act(() => result.current.setError('Timed out'));
      expect(result.current.isError).toBe(true);

      // User triggers retry
      act(() => result.current.setLoading());
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isError).toBe(false);
      expect(result.current.errorMessage).toBeNull();
    });

    it('full success lifecycle: idle → loading → loaded', () => {
      const { result } = renderHook(() => useFetchState());
      expect(result.current.status).toBe('idle');

      act(() => result.current.setLoading());
      expect(result.current.status).toBe('loading');

      act(() => result.current.setLoaded());
      expect(result.current.status).toBe('loaded');
    });

    it('full error lifecycle: idle → loading → error → loading → loaded', () => {
      const { result } = renderHook(() => useFetchState());

      act(() => result.current.setLoading());
      act(() => result.current.setError('Server error'));
      expect(result.current.status).toBe('error');

      // Retry
      act(() => result.current.setLoading());
      expect(result.current.status).toBe('loading');

      act(() => result.current.setLoaded());
      expect(result.current.status).toBe('loaded');
      expect(result.current.errorMessage).toBeNull();
    });

    it('full empty lifecycle: idle → loading → empty', () => {
      const { result } = renderHook(() => useFetchState());
      act(() => result.current.setLoading());
      act(() => result.current.setEmpty());
      expect(result.current.status).toBe('empty');
      expect(result.current.errorMessage).toBeNull();
    });
  });

  describe('valid FetchStatus values', () => {
    const statuses: FetchStatus[] = ['idle', 'loading', 'error', 'empty', 'loaded'];

    it.each(statuses)('accepts "%s" as initial status', (s) => {
      const { result } = renderHook(() => useFetchState(s));
      expect(result.current.status).toBe(s);
    });
  });
});
