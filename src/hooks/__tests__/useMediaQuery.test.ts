import { act, renderHook, waitFor } from '@testing-library/react';
import { useMediaQuery } from '../useMediaQuery';

function createMatchMedia(matches: boolean) {
  const addEventListener = jest.fn();
  const removeEventListener = jest.fn();

  const mediaQueryList = {
    matches,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener,
    removeEventListener,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  } as unknown as MediaQueryList;

  return {
    mediaQueryList,
    addEventListener,
    removeEventListener,
  };
}

describe('useMediaQuery', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns false before hydration and updates to the current match state', () => {
    const { mediaQueryList, addEventListener, removeEventListener } = createMatchMedia(true);
    const matchMedia = jest.fn(() => mediaQueryList);

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMedia,
    });

    const { result, unmount } = renderHook(() => useMediaQuery('(prefers-color-scheme: dark)'));

    expect(result.current).toBe(true);
    expect(matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    act(() => {
      const listener = addEventListener.mock.calls[0][1] as (event: MediaQueryListEvent) => void;
      listener({ matches: true } as MediaQueryListEvent);
    });

    expect(result.current).toBe(true);

    unmount();
    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('falls back to false when matchMedia is unavailable', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));

    expect(result.current).toBe(false);
  });

  it('uses the latest query when the query string changes', async () => {
    const first = createMatchMedia(false);
    const second = createMatchMedia(true);
    const matchMedia = jest.fn((query: string) =>
      query === '(min-width: 1024px)' ? first.mediaQueryList : second.mediaQueryList,
    );

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMedia,
    });

    const { result, rerender } = renderHook(({ query }) => useMediaQuery(query), {
      initialProps: { query: '(min-width: 1024px)' },
    });

    expect(result.current).toBe(false);

    rerender({ query: '(prefers-reduced-motion: reduce)' });

    expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });
});
