export type ScrollableTableProps = {
  /** A descriptive label for the scrollable table region (required for a11y). */
  ariaLabel: string;
  /** Optional id for the scroll region element. */
  id?: string;
  /** The <table> element and any accompanying elements (caption, etc.). */
  children: React.ReactNode;
};

/**
 * ScrollableTable wraps a wide HTML `<table>` in a labelled, keyboard-reachable,
 * horizontally-scrollable region. On narrow viewports the container allows
 * horizontal scrolling while keeping the table data intact.
 *
 * Accessibility:
 * - `role="region"` with a descriptive `aria-label` identifies the scroll area.
 * - `tabIndex={0}` makes the region keyboard-reachable so users can scroll
 *   it with arrow keys after focusing it.
 * - A visible focus-visible ring highlights the container for sighted
 *   keyboard users.
 */
const ScrollableTable = ({ ariaLabel, id, children }: ScrollableTableProps) => {
  return (
    <div
      id={id}
      role="region"
      tabIndex={0}
      aria-label={ariaLabel}
      className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                 focus-visible:ring-offset-2"
    >
      {children}
    </div>
  );
};

export default ScrollableTable;
