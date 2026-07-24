/**
 * LoadingSkeleton
 *
 * A reusable, accessible shimmer skeleton block.
 *
 * Accessibility contract:
 * - The visual blocks carry `aria-hidden="true"` — they convey no information
 *   to assistive technologies on their own.
 * - A visually-hidden `aria-live="polite"` sibling announces "Loading…" to
 *   screen readers as soon as the component mounts.
 * - The shimmer animation is suppressed entirely when the user has opted into
 *   `prefers-reduced-motion: reduce` (via the project-wide globals.css rule
 *   that collapses all animation-durations to 0.01 ms), so no explicit inline
 *   media-query override is needed here — Tailwind's `motion-reduce:` variant
 *   additionally removes the `animate-shimmer` class as a belt-and-suspenders
 *   guard.
 */

import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LoadingSkeletonProps {
  /**
   * Number of stacked rows to render.
   * @default 1
   */
  rows?: number;

  /**
   * Tailwind width class (or arbitrary value) applied to every row.
   * @example "w-full" | "w-64" | "w-[240px]"
   * @default "w-full"
   */
  width?: string;

  /**
   * Tailwind height class (or arbitrary value) applied to every row.
   * @example "h-4" | "h-10" | "h-[48px]"
   * @default "h-4"
   */
  height?: string;

  /**
   * Tailwind border-radius class applied to every row.
   * @default "rounded-lg"
   */
  rounded?: string;

  /**
   * Spacing between rows (Tailwind gap class).
   * @default "gap-3"
   */
  gap?: string;

  /**
   * Optional additional class names forwarded to the wrapper element.
   */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LoadingSkeleton({
  rows = 1,
  width = 'w-full',
  height = 'h-4',
  rounded = 'rounded-lg',
  gap = 'gap-3',
  className = '',
}: LoadingSkeletonProps) {
  return (
    <div className={`flex flex-col ${gap} ${className}`}>
      {/*
       * Visually hidden live region — announces "Loading…" to screen readers
       * once the component is inserted into the DOM.
       */}
      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        Loading…
      </span>

      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className={[
            width,
            height,
            rounded,
            'bg-slate-200',
            /*
             * The shimmer keyframe is defined below via a Tailwind @keyframes
             * extension. `motion-reduce:animate-none` removes the animation for
             * users who prefer reduced motion as a belt-and-suspenders measure
             * on top of the project-wide globals.css rule.
             */
            'animate-shimmer motion-reduce:animate-none',
          ].join(' ')}
        />
      ))}
    </div>
  );
}

export default LoadingSkeleton;
