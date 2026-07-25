/**
 * ReputationProfileSkeleton
 *
 * Mirrors the visual shape of `ReputationProfile` with pulsing shimmer
 * blocks so the page does not jump when the real content appears.
 *
 * Accessibility:
 * - All shimmer blocks carry `aria-hidden="true"`.
 * - A visually-hidden `role="status"` announces "Loading reputation…".
 * - The wrapper section carries `aria-label="Loading reputation"`.
 * - The consuming `<main>` (in loading.tsx) carries `aria-busy="true"`.
 * - `motion-reduce:animate-none` suppresses shimmer for users who prefer
 *   reduced motion.
 */

import React from 'react';

// ---------------------------------------------------------------------------
// ProfileCardSkeleton
// ---------------------------------------------------------------------------

/** Mirrors the top profile card (avatar, name, privacy note, metric tiles). */
export const ProfileCardSkeleton = () => (
  <div
    aria-hidden="true"
    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
  >
    {/* Avatar + name row */}
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-4">
        {/* Avatar square */}
        <div className="h-16 w-16 rounded-2xl bg-slate-200 animate-shimmer motion-reduce:animate-none" />
        <div className="space-y-2">
          <div className="h-3.5 w-28 rounded bg-slate-200 animate-shimmer motion-reduce:animate-none" />
          <div className="h-6 w-40 rounded-lg bg-slate-200 animate-shimmer motion-reduce:animate-none" />
        </div>
      </div>
      {/* Privacy note panel */}
      <div className="flex flex-col gap-2 rounded-3xl bg-slate-50 p-4 sm:p-5 lg:w-72">
        <div className="h-3.5 w-36 rounded bg-slate-200 animate-shimmer motion-reduce:animate-none" />
        <div className="h-3 w-full rounded bg-slate-200 animate-shimmer motion-reduce:animate-none" />
        <div className="h-3 w-4/5 rounded bg-slate-200 animate-shimmer motion-reduce:animate-none" />
      </div>
    </div>

    {/* Three metric tiles */}
    <div className="mt-8 grid gap-4 sm:grid-cols-3">
      {['Reputation score', 'Level', 'Explanation'].map((label) => (
        <div
          key={label}
          className="rounded-3xl border border-slate-200 bg-slate-50 p-5 space-y-3"
        >
          <div className="h-3.5 w-28 rounded bg-slate-200 animate-shimmer motion-reduce:animate-none" />
          <div className="h-8 w-20 rounded-lg bg-slate-200 animate-shimmer motion-reduce:animate-none" />
        </div>
      ))}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// HistoryCardSkeleton
// ---------------------------------------------------------------------------

/** Mirrors the reputation history card with 3 event rows. */
export const HistoryCardSkeleton = () => (
  <div
    aria-hidden="true"
    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
  >
    {/* Heading row + badge */}
    <div className="mb-6 flex items-center justify-between gap-4">
      <div className="space-y-2">
        <div className="h-6 w-44 rounded-lg bg-slate-200 animate-shimmer motion-reduce:animate-none" />
        <div className="h-3.5 w-64 rounded bg-slate-200 animate-shimmer motion-reduce:animate-none" />
      </div>
      <div className="h-6 w-28 rounded-full bg-slate-200 animate-shimmer motion-reduce:animate-none" />
    </div>

    {/* History event rows */}
    <ol className="space-y-4">
      {Array.from({ length: 3 }, (_, i) => (
        <li
          key={i}
          className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="h-3.5 w-24 rounded bg-slate-200 animate-shimmer motion-reduce:animate-none" />
              <div className="h-5 w-56 rounded-lg bg-slate-200 animate-shimmer motion-reduce:animate-none" />
            </div>
            <div className="h-3.5 w-20 rounded bg-slate-200 animate-shimmer motion-reduce:animate-none" />
          </div>
        </li>
      ))}
    </ol>
  </div>
);

// ---------------------------------------------------------------------------
// ReputationProfileSkeleton (composed)
// ---------------------------------------------------------------------------

/**
 * Full-page reputation loading skeleton.
 *
 * Composes `ProfileCardSkeleton` and `HistoryCardSkeleton` within a
 * layout that mirrors the real `ReputationProfile` component, preventing
 * cumulative layout shift (CLS) when content loads in.
 */
export default function ReputationProfileSkeleton() {
  return (
    <section
      aria-label="Loading reputation"
      className="w-full max-w-5xl mx-auto space-y-8 px-4 py-10 sm:px-6 lg:px-8"
    >
      <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        Loading reputation…
      </span>

      <ProfileCardSkeleton />
      <HistoryCardSkeleton />
    </section>
  );
}
