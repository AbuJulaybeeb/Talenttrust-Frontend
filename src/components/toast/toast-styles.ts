export type ToastVariant = 'success' | 'error';

/**
 * Resolves the Tailwind classes for a toast's accent bar, badge, and panel.
 * Lives in its own module so callers can memoize on `variant` without
 * recomputing this lookup, and so it stays a single well-defined seam
 * (rather than an inline object literal) if new variants are ever added.
 */
export function getToastStyles(variant: ToastVariant) {
  // a11y/theming-27: badge classes were `bg-emerald-100 text-emerald-800`
  // / `bg-rose-100 text-rose-800` — fixed Tailwind pastels that don't
  // respond to [data-theme='dark']. Swapped for the --status-* variables
  // defined in globals.css, which carry an audited light AND dark pair.
  // Light-mode hex values are unchanged from the originals.
  if (variant === 'success') {
    return {
      accent: 'bg-emerald-500',
      badge: 'bg-[var(--status-success-bg)] text-[var(--status-success-foreground)]',
      panel: 'border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-sm',
    };
  }

  return {
    accent: 'bg-rose-500',
    badge: 'bg-[var(--status-error-bg)] text-[var(--status-error-foreground)]',
    panel: 'border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-sm',
  };
}
