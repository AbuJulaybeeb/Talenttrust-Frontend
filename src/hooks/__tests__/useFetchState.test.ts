import { renderHook, act, waitFor } from '@testing-library/react';
import { useFetchState } from '../useFetchState';

describe('useFetchState', () => {
  describe('Success State', () => {
    it('transitions from idle to loading to success', async () => {
      const mockData = { theme: 'dark' };
      const fetchFn = jest.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useFetchState(fetchFn));

      expect(result.current.state).toBe('idle');
      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.retry();
      });

      // Should transition to success
      await waitFor(() => {
        expect(result.current.state).toBe('success');
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toEqual(mockData);
      });
    });

    it('calls onSuccess callback when data is fetched', async () => {
      const mockData = { theme: 'light' };
      const fetchFn = jest.fn().mockResolvedValue(mockData);
      const onSuccess = jest.fn();

      const { result } = renderHook(() => useFetchState(fetchFn, onSuccess));

      act(() => {
        result.current.retry();
      });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(mockData);
      });
    });
  });

  describe('Empty State', () => {
    it('transitions to empty state when null is returned', async () => {
      const fetchFn = jest.fn().mockResolvedValue(null);

      const { result } = renderHook(() => useFetchState(fetchFn));

      act(() => {
        result.current.retry();
      });

      await waitFor(() => {
        expect(result.current.state).toBe('empty');
        expect(result.current.isEmpty).toBe(true);
        expect(result.current.data).toBeNull();
      });
    });

    it('transitions to empty state when undefined is returned', async () => {
      const fetchFn = jest.fn().mockResolvedValue(undefined);

      const { result } = renderHook(() => useFetchState(fetchFn));

      act(() => {
        result.current.retry();
      });

      await waitFor(() => {
        expect(result.current.state).toBe('empty');
        expect(result.current.isEmpty).toBe(true);
      });
    });

    it('transitions to empty state when empty array is returned', async () => {
      const fetchFn = jest.fn().mockResolvedValue([]);

      const { result } = renderHook(() => useFetchState(fetchFn));

      act(() => {
        result.current.retry();
      });

      await waitFor(() => {
        expect(result.current.state).toBe('empty');
        expect(result.current.isEmpty).toBe(true);
      });
    });

    it('does not call onSuccess for empty state', async () => {
      const fetchFn = jest.fn().mockResolvedValue(null);
      const onSuccess = jest.fn();

      const { result } = renderHook(() => useFetchState(fetchFn, onSuccess));

      act(() => {
        result.current.retry();
      });

      await waitFor(() => {
        expect(result.current.state).toBe('empty');
        expect(onSuccess).not.toHaveBeenCalled();
      });
    });
  });

  describe('Error State', () => {
    it('transitions to error state when fetch throws', async () => {
      const error = new Error('Network failed');
      const fetchFn = jest.fn().mockRejectedValue(error);

      const { result } = renderHook(() => useFetchState(fetchFn));

      act(() => {
        result.current.retry();
      });

      await waitFor(() => {
        expect(result.current.state).toBe('error');
        expect(result.current.isError).toBe(true);
        expect(result.current.error?.message).toBe('Network failed');
      });
    });

    it('calls onError callback when fetch fails', async () => {
      const error = new Error('Test error');
      const fetchFn = jest.fn().mockRejectedValue(error);
      const onError = jest.fn();

      const { result } = renderHook(() => useFetchState(fetchFn, undefined, onError));

      act(() => {
        result.current.retry();
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
        expect(onError.mock.calls[0][0].message).toBe('Test error');
      });
    });

    it('converts non-Error throws to Error objects', async () => {
      const fetchFn = jest.fn().mockRejectedValue('String error');

      const { result } = renderHook(() => useFetchState(fetchFn));

      act(() => {
        result.current.retry();
      });

      await waitFor(() => {
        expect(result.current.state).toBe('error');
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe('String error');
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading state during fetch', () => {
      const fetchFn = jest.fn(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useFetchState(fetchFn));

      act(() => {
        result.current.retry();
      });

      expect(result.current.state).toBe('loading');
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('State Exclusivity', () => {
    it('clears data and error when retrying', async () => {
      const fetchFn = jest
        .fn()
        .mockResolvedValueOnce({ data: 'first' })
        .mockRejectedValueOnce(new Error('Failed'));

      const { result } = renderHook(() => useFetchState(fetchFn));

      // First call succeeds
      act(() => {
        result.current.retry();
      });

      await waitFor(() => {
        expect(result.current.state).toBe('success');
        expect(result.current.data).toEqual({ data: 'first' });
      });

      // Second call fails
      act(() => {
        result.current.retry();
      });

      await waitFor(() => {
        expect(result.current.state).toBe('error');
        // Old data should be cleared
        expect(result.current.data).toBeNull();
      });
    });

    it('ensures only one state is true at a time', async () => {
      const mockData = { test: 'data' };
      const fetchFn = jest.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useFetchState(fetchFn));

      act(() => {
        result.current.retry();
      });

      await waitFor(() => {
        const activeStates = [
          result.current.isLoading,
          result.current.isError,
          result.current.isEmpty,
          result.current.isSuccess,
        ].filter(Boolean);

        expect(activeStates.length).toBe(1);
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe('Retry Functionality', () => {
    it('refetches data when retry is called', async () => {
      const fetchFn = jest
        .fn()
        .mockResolvedValueOnce({ attempt: 1 })
        .mockResolvedValueOnce({ attempt: 2 });

      const { result } = renderHook(() => useFetchState(fetchFn));

      act(() => {
        result.current.retry();
      });

      await waitFor(() => {
        expect(result.current.data).toEqual({ attempt: 1 });
      });

      act(() => {
        result.current.retry();
      });

      await waitFor(() => {
        expect(result.current.data).toEqual({ attempt: 2 });
        expect(fetchFn).toHaveBeenCalledTimes(2);
      });
    });

    it('transitions from error to success on successful retry', async () => {
      const fetchFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce({ data: 'success' });

      const { result } = renderHook(() => useFetchState(fetchFn));

      // First attempt fails
      act(() => {
        result.current.retry();
      });

      await waitFor(() => {
        expect(result.current.state).toBe('error');
      });

      // Retry succeeds
      act(() => {
        result.current.retry();
      });

      await waitFor(() => {
        expect(result.current.state).toBe('success');
        expect(result.current.data).toEqual({ data: 'success' });
      });
    });
  });

  describe('Manual Data Setting', () => {
    it('allows manual setData call', () => {
      const fetchFn = jest.fn();

      const { result } = renderHook(() => useFetchState(fetchFn));

      const newData = { manual: 'data' };
      act(() => {
        result.current.setData(newData);
      });

      expect(result.current.data).toEqual(newData);
    });
  });
});
