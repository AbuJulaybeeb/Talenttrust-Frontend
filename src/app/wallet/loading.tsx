/**
 * loading.tsx – /wallet
 *
 * App Router Suspense boundary for the wallet page. Mirrors the layout
 * of the wallet page:
 *   - Page heading
 *   - Wallet info card skeleton (address, copy button, disconnect button)
 *   - Balance/summary rows
 *
 * Accessibility:
 * - `aria-busy="true"` on <main>.
 * - Visually-hidden `role="status"` announces "Loading wallet…".
 * - All shimmer blocks carry `aria-hidden="true"`.
 * - Animation disabled for `prefers-reduced-motion` via globals.css rule
 *   and `motion-reduce:animate-none` belt-and-suspenders guard.
 */

// ---------------------------------------------------------------------------
// Local sub-skeletons
// ---------------------------------------------------------------------------

/** Mirrors the wallet info card (address, copy, disconnect). */
const WalletInfoCardSkeleton = () => (
  <div
    aria-hidden="true"
    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
  >
    {/* Wallet icon + label */}
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 rounded-xl bg-slate-200 animate-shimmer motion-reduce:animate-none" />
      <div className="space-y-2">
        <div className="h-3.5 w-24 rounded bg-slate-200 animate-shimmer motion-reduce:animate-none" />
        <div className="h-5 w-48 rounded-lg bg-slate-200 animate-shimmer motion-reduce:animate-none" />
      </div>
    </div>

    {/* Action buttons row */}
    <div className="mt-6 flex gap-3">
      <div className="h-10 w-32 rounded-xl bg-slate-200 animate-shimmer motion-reduce:animate-none" />
      <div className="h-10 w-32 rounded-xl bg-slate-200 animate-shimmer motion-reduce:animate-none" />
    </div>
  </div>
);

/** Mirrors the balance summary section. */
const BalanceCardSkeleton = () => (
  <div
    aria-hidden="true"
    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
  >
    {/* Heading */}
    <div className="mb-4 h-5 w-32 rounded-lg bg-slate-200 animate-shimmer motion-reduce:animate-none" />
    {/* Balance rows */}
    <div className="space-y-4">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="h-4 w-24 rounded bg-slate-200 animate-shimmer motion-reduce:animate-none" />
          <div className="h-4 w-20 rounded bg-slate-200 animate-shimmer motion-reduce:animate-none" />
        </div>
      ))}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Route loading export
// ---------------------------------------------------------------------------

export default function WalletLoading() {
  return (
    <main className="min-h-screen p-8" aria-busy="true">
      <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        Loading wallet…
      </span>

      {/* Page heading skeleton */}
      <div
        aria-hidden="true"
        className="mb-6 h-8 w-32 rounded-lg bg-slate-200 animate-shimmer motion-reduce:animate-none"
      />

      {/* Wallet page layout */}
      <div className="mx-auto max-w-3xl space-y-6">
        <WalletInfoCardSkeleton />
        <BalanceCardSkeleton />
      </div>
    </main>
  );
}
