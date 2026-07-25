'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNavigation } from '@/hooks/useNavigation';

/**
 * Navbar — accessible primary navigation for the TalentTrust application.
 *
 * Renders persistent links to /contracts, /milestones, and /reputation.
 * The active route is determined via `usePathname` and announced to
 * assistive technology through `aria-current="page"`. Inactive routes
 * are styled with subdued foreground color to reduce visual noise.
 *
 * @remarks
 * - This component is marked `'use client'` because it consumes
 *   `usePathname` from `next/navigation`.
 * - Focus rings and color tokens inherit from `globals.css` CSS custom
 *   properties to remain consistent with the existing design system.
 * - On narrow viewports the links wrap naturally via flex-wrap; no
 *   hamburger menu is used to avoid hidden-focus management complexity.
 *
 * @example
 * // In src/app/layout.tsx
 * <header className="sticky top-0 z-40 ...">
 *   <span className="brand">TalentTrust</span>
 *   <Navbar />
 *   <WalletConnectButton />
 * </header>
 */
export default function Navbar(): React.JSX.Element {
  const pathname = usePathname();
  const { routes, isLoading, error } = useNavigation();

  if (error) {
    return (
      <nav aria-label="Primary">
        <div className="flex h-9 items-center rounded-lg bg-red-50 px-3 text-sm font-medium text-red-600 ring-1 ring-inset ring-red-200">
          Navigation unavailable
        </div>
      </nav>
    );
  }

  if (isLoading) {
    return (
      <nav aria-label="Primary" aria-busy="true">
        <ul className="flex flex-wrap items-center gap-1 sm:gap-2" aria-hidden="true">
          {routes.map(({ href, label }) => (
            <li key={href}>
              <div
                className="rounded-lg px-3 py-2 text-sm font-medium bg-slate-200 text-transparent animate-shimmer motion-reduce:animate-none select-none"
              >
                {label}
              </div>
            </li>
          ))}
        </ul>
        <span className="sr-only" role="status" aria-live="polite">Loading navigation...</span>
      </nav>
    );
  }

  return (
    <nav aria-label="Primary">
      <ul className="flex flex-wrap items-center gap-1 sm:gap-2">
        {routes.map(({ href, label }) => {
          const isActive = pathname === href;

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1',
                  isActive
                    ? 'text-[var(--primary)] bg-[var(--primary)]/10'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]',
                ].join(' ')}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
