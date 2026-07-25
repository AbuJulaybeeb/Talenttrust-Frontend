/**
 * loading.tsx – /reputation
 *
 * App Router Suspense boundary for the reputation page. Delegates to
 * `ReputationProfileSkeleton`, which mirrors the layout of
 * `ReputationProfile` to prevent layout shift.
 *
 * Accessibility:
 * - `aria-busy="true"` on <main>.
 * - Visually-hidden `role="status"` announces "Loading reputation…".
 * - All shimmer blocks carry `aria-hidden="true"`.
 * - Animation disabled for `prefers-reduced-motion` via globals.css rule
 *   and `motion-reduce:animate-none`.
 */

import ReputationProfileSkeleton from '@/components/ReputationProfileSkeleton';

export default function ReputationLoading() {
  return (
    <main className="min-h-screen p-8" aria-busy="true">
      {/* Page heading skeleton */}
      <div
        aria-hidden="true"
        className="mb-6 h-8 w-32 rounded-lg bg-slate-200 animate-shimmer motion-reduce:animate-none"
      />

      <ReputationProfileSkeleton />
    </main>
  );
}
