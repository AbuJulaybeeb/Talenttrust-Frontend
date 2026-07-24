import { useEffect, useState } from 'react';

/**
 * Returns true when the given CSS media query matches, false otherwise.
 *
 * SSR-safe: on the server (or any environment where `window.matchMedia` is
 * absent) the hook returns `false` — a stable, predictable default that avoids
 * hydration mismatches on first client render.
 *
 * The listener is removed on unmount so there are no memory leaks even if the
 * consuming component is mounted and unmounted rapidly.
 *
 * @param query - A valid CSS media query string, e.g. `'(prefers-color-scheme: dark)'`.
 * @returns `true` if the query currently matches, `false` otherwise.
 *
 * @example
 * const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
 * const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
 * const isWide = useMediaQuery('(min-width: 1024px)');
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Guard: environments like Node/jsdom without matchMedia get a stable false.
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQueryList = window.matchMedia(query);

    // Sync state immediately so the component reflects the real value after
    // the first paint (after hydration).
    setMatches(mediaQueryList.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQueryList.addEventListener('change', listener);

    return () => {
      mediaQueryList.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
}
