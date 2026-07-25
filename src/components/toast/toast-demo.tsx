'use client';

import { useToast } from './toast-provider';

export function ToastDemo() {
  const { showError, showSuccess } = useToast();

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
      <button
        className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
        onClick={() =>
          showSuccess({
            title: 'Milestone released',
            description: 'Funds are on the way to the freelancer wallet.',
          })
        }
        type="button"
      >
        Show success toast
      </button>
      <button
        className="rounded-full border border-rose-200 bg-white px-5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-300"
        onClick={() =>
          showError({
            title: 'Wallet not connected',
            description: 'Connect a wallet before approving this release.',
          })
        }
        type="button"
      >
        Show error toast
      </button>
    </div>
  );
}
