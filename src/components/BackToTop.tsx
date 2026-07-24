'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

export type BackToTopProps = {
  /**
   * The scrollable element to watch and control. Pass this when the list
   * scrolls inside its own container (e.g. `overflow-y-auto`). Omit it to
   * track the window instead, for lists that grow the page itself.
   */
  containerRef?: RefObject<HTMLElement | null>;
  /**
   * Element that should receive focus once the view returns to the top
   * (WCAG 2.4.3 – focus order). Defaults to the scroll container itself
   * when `containerRef` is provided; pass an explicit ref (e.g. a heading
   * with `tabIndex={-1}`) when operating on the window.
   */
  focusTargetRef?: RefObject<HTMLElement | null>;
  /** Scroll distance in pixels past which the button appears. */
  threshold?: number;
  /** Accessible label and visible text for the button. */
  label?: string;
  /** Extra classes merged onto the button for per-usage placement. */
  className?: string;
};

const DEFAULT_THRESHOLD = 300;
const DEFAULT_LABEL = 'Back to top';

/**
 * Accessible, reusable back-to-top control for long lists.
 *
 * Renders nothing until the tracked scroll position passes `threshold`,
 * hides again near the top, and moves focus to `focusTargetRef` (or the
 * container) on activation so keyboard and screen-reader users aren't left
 * behind visually. Works against either a specific scrollable container or
 * the window, so the same component can be reused across different list
 * layouts.
 */
const BackToTop = ({
  containerRef,
  focusTargetRef,
  threshold = DEFAULT_THRESHOLD,
  label = DEFAULT_LABEL,
  className = '',
}: BackToTopProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const rafIdRef = useRef<number | null>(null);

  const getScrollTop = useCallback(() => {
    const el = containerRef?.current;
    return el ? el.scrollTop : window.scrollY;
  }, [containerRef]);

  const checkThreshold = useCallback(() => {
    setIsVisible(getScrollTop() > threshold);
  }, [getScrollTop, threshold]);

  useEffect(() => {
    const scrollTarget: HTMLElement | Window = containerRef?.current ?? window;

    // Coalesce rapid scroll events to at most one visibility check per
    // animation frame, so fast/continuous scrolling doesn't thrash state.
    const handleScroll = () => {
      if (rafIdRef.current !== null) return;
      rafIdRef.current = window.requestAnimationFrame(() => {
        rafIdRef.current = null;
        checkThreshold();
      });
    };

    // Establish the correct initial state (e.g. a restored scroll position,
    // or a list too short to scroll at all).
    checkThreshold();

    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      scrollTarget.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [containerRef, checkThreshold]);

  const handleActivate = useCallback(() => {
    const el = containerRef?.current;

    if (el) {
      el.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const focusTarget = focusTargetRef?.current ?? el;
    focusTarget?.focus();
  }, [containerRef, focusTargetRef]);

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={handleActivate}
      aria-label={label}
      className={`inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 ${className}`.trim()}
    >
      <span aria-hidden="true">&uarr;</span>
      {label}
    </button>
  );
};

export default BackToTop;
