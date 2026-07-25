function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-slate-200 motion-reduce:animate-none ${className}`}
    />
  );
}

/**
 * Content-shaped placeholder for the settings view.
 *
 * The loading region remains in the document flow with the same broad
 * dimensions as the settings content, preventing layout shift while the
 * route is loading. Placeholder content is hidden from assistive
 * technologies, while aria-busy communicates the loading state on the region.
 */
export default function SettingsSkeleton() {
  return (
    <section aria-busy="true" aria-label="Loading settings">
      <div
        aria-hidden="true"
        data-testid="settings-loading-skeleton"
        className="mx-auto min-h-[640px] w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8"
      >
        <div className="space-y-8">
          <header className="space-y-3">
            <SkeletonBlock className="h-9 w-48" />
            <SkeletonBlock className="h-5 w-full max-w-xl" />
          </header>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="space-y-4">
                <SkeletonBlock className="h-6 w-32" />
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="h-4 w-4/5" />
                <div className="space-y-3 pt-3">
                  <SkeletonBlock className="h-10 w-full" />
                  <SkeletonBlock className="h-10 w-full" />
                  <SkeletonBlock className="h-10 w-full" />
                </div>
              </div>
            </aside>

            <div className="space-y-6">
              <section className="min-h-[220px] rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-5">
                  <SkeletonBlock className="h-6 w-40" />
                  <SkeletonBlock className="h-4 w-3/4" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SkeletonBlock className="h-11 w-full" />
                    <SkeletonBlock className="h-11 w-full" />
                  </div>
                  <SkeletonBlock className="h-11 w-32" />
                </div>
              </section>

              <section className="min-h-[220px] rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-5">
                  <SkeletonBlock className="h-6 w-48" />
                  <SkeletonBlock className="h-4 w-4/5" />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <SkeletonBlock className="h-5 w-2/5" />
                      <SkeletonBlock className="h-7 w-12 rounded-full" />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <SkeletonBlock className="h-5 w-1/2" />
                      <SkeletonBlock className="h-7 w-12 rounded-full" />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <SkeletonBlock className="h-5 w-1/3" />
                      <SkeletonBlock className="h-7 w-12 rounded-full" />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { SettingsSkeleton };
