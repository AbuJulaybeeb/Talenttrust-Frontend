'use client';

import React from 'react';

/**
 * WalletSkeleton Props
 */
export interface WalletSkeletonProps {
  /**
   * Optional additional CSS classes forwarded to the root skeleton container.
   */
  className?: string;
}

/**
 * WalletSkeleton Component
 *
 * Renders a content-shaped skeleton placeholder matching the layout and dimensions
 * of the wallet view (`WalletConnectButton`), eliminating layout shift during initial load
 * or wallet connection.
 *
 * Accessibility features:
 * - Exposes `aria-busy="true"` and `aria-label="Loading wallet"` to assistive technology.
 * - Visual placeholder elements carry `aria-hidden="true"`.
 * - Includes a visually-hidden screen reader status message (`aria-live="polite"`).
 * - Suppresses shimmer animation under `prefers-reduced-motion: reduce`.
 */
export const WalletSkeleton: React.FC<WalletSkeletonProps> = ({ className = '' }) => {
  return (
    <div
      role="region"
      aria-busy="true"
      aria-label="Loading wallet"
      className={[
        'flex h-10 min-w-[140px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-sm',
        className,
      ].join(' ')}
    >
      <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        Loading wallet...
      </span>

      <div
        aria-hidden="true"
        className="h-full w-full rounded-lg bg-slate-200 animate-shimmer motion-reduce:animate-none"
      />
    </div>
  );
};

export default WalletSkeleton;
