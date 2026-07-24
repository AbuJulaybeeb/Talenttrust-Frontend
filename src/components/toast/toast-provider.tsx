'use client';

import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { usePreferences } from '@/lib/preferences';
import type { ToastDuration } from '@/lib/preferences';
import { getToastStyles } from './toast-styles';
import type { ToastVariant } from './toast-styles';

/** Optional inline action attached to a toast. */
type ToastAction = {
  /** Plain-text label rendered inside the action button. Never interpolated as HTML. */
  label: string;
  /** Callback fired when the user clicks the action button. */
  onClick: () => void;
};

export type ToastInput = {
  title: string;
  description?: string;
  duration?: number;
  /**
   * Optional correlation / request ID attached to an error toast.
   * When present it is included in the copied details to help with bug reports.
   * Only meaningful on error-variant toasts; ignored on success toasts.
   */
  correlationId?: string;
  /**
   * Optional action button rendered inside the toast.
   * Clicking it fires `onClick` and immediately dismisses the toast.
   */
  action?: ToastAction;
};

export type ToastRecord = ToastInput & {
  id: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  toasts: ToastRecord[];
  showSuccess: (toast: ToastInput) => string;
  showError: (toast: ToastInput) => string;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);


/**
 * Maps each `ToastDuration` preference value to a concrete millisecond count,
 * or `null` for `'persistent'` (no auto-dismiss timer).
 */
const DURATION_MAP: Readonly<Record<ToastDuration, number | null>> = {
  short: 2500,
  normal: 5000,
  long: 10000,
  persistent: null,
};

/**
 * Maximum number of toasts that may be visible at the same time.
 * When a new toast would exceed this cap it is queued instead of shown;
 * queued toasts are promoted into view (oldest-first within the same
 * severity) as visible toasts are dismissed. This prevents a burst of
 * wallet/payout events from stacking toasts past the bottom of the
 * viewport and burying the dismiss buttons, without ever silently
 * dropping a toast — error toasts in particular always eventually show.
 */
const MAX_VISIBLE_TOASTS = 4;

type ToastQueueState = {
  visible: ToastRecord[];
  queued: ToastRecord[];
};

/**
 * Inserts a toast into a queue, keeping error toasts ahead of queued
 * success toasts (severity ordering) while preserving FIFO order within
 * each severity. This is what lets an error toast reach the front of the
 * line — and therefore get shown — sooner than success toasts that were
 * queued earlier, without ever discarding anything.
 */
function enqueueBySeverity(queue: ToastRecord[], toast: ToastRecord): ToastRecord[] {
  if (toast.variant !== 'error') {
    return [...queue, toast];
  }

  const firstSuccessIndex = queue.findIndex((queued) => queued.variant !== 'error');
  if (firstSuccessIndex === -1) {
    return [...queue, toast];
  }

  return [...queue.slice(0, firstSuccessIndex), toast, ...queue.slice(firstSuccessIndex)];
}

/**
 * Generates a unique toast ID without mutating refs during render.
 * Uses crypto.randomUUID() when available, with a timestamp-based fallback.
 * This ensures collision-free IDs even under React StrictMode double-invocation.
 *
 * @returns A unique string identifier for a toast
 */
function generateToastId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `toast-${crypto.randomUUID()}`;
  }
  // Fallback for environments without crypto.randomUUID support
  return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Renders a single toast panel. Memoized so that an unrelated re-render of
 * `ToastProvider` (e.g. a preference or sibling state change that leaves
 * this toast's own props untouched) does not re-run the row's derived-data
 * computation (`getToastStyles`) or re-render its DOM.
 */
export const ToastRow = memo(function ToastRow({
  toast,
  onDismiss,
  onPauseTimer,
  onResumeTimer,
}: {
  toast: ToastRecord;
  onDismiss: (id: string) => void;
  onPauseTimer: (id: string) => void;
  onResumeTimer: (id: string) => void;
}) {
  const styles = useMemo(() => getToastStyles(toast.variant), [toast.variant]);
  const badgeLabel = toast.variant === 'success' ? 'Success' : 'Error';

  return (
    <div
      className={`pointer-events-auto overflow-hidden rounded-2xl border ${styles.panel} shadow-lg`}
      onBlur={() => onResumeTimer(toast.id)}
      onFocus={() => onPauseTimer(toast.id)}
      onMouseEnter={() => onPauseTimer(toast.id)}
      onMouseLeave={() => onResumeTimer(toast.id)}
      role={toast.variant === 'error' ? 'alert' : 'status'}
    >
      <div className={`h-1.5 w-full ${styles.accent}`} />
      <div className="flex items-start gap-3 p-4">
        <div className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${styles.badge}`}>
          {badgeLabel}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{toast.title}</p>
          {toast.description ? (
            // a11y/theming-27: was `text-slate-600`, which measured
            // 2.36:1 against the dark --surface (#0f172a) — well
            // below the 4.5:1 AA minimum for body text. Replaced
            // with --muted-foreground, which is themed in
            // globals.css and passes AA in both modes (4.55:1
            // light, 6.96:1 dark). See docs/components/Accessibility.md.
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{toast.description}</p>
          ) : null}
          {toast.action ? (
            // Action button: label is a plain text node — never set via
            // innerHTML or dangerouslySetInnerHTML. Clicking fires the
            // caller-supplied callback then immediately dismisses this toast.
            <button
              type="button"
              onClick={() => {
                toast.action!.onClick();
                onDismiss(toast.id);
              }}
              className="mt-2 rounded-md px-3 py-1 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1 bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
            >
              {toast.action.label}
            </button>
          ) : null}
        </div>
        <button
          aria-label={`Dismiss ${badgeLabel.toLowerCase()} notification`}
          // a11y/theming-27: was `text-slate-500 hover:bg-slate-100
          // hover:text-slate-900`. text-slate-500 measured 3.75:1
          // against the dark --surface — fails AA. The light hover
          // background also stayed fixed-light, producing a bright
          // patch on a dark panel. Replaced with themed tokens that
          // pass AA in both modes.
          // The `transition` utility is kept here; the global
          // @media (prefers-reduced-motion: reduce) rule in
          // globals.css collapses its duration to 0.01ms so the
          // button snaps to its hover/focus state instantly for
          // users who prefer reduced motion, without any layout
          // shift or visibility change.
          className="rounded-full p-1.5 text-[var(--muted-foreground)] transition hover:bg-[var(--accent)] hover:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          onClick={() => onDismiss(toast.id)}
          type="button"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </div>
  );
});

export const ToastViewport = memo(function ToastViewport({
  toasts,
  onDismiss,
  onPauseTimer,
  onResumeTimer,
  density,
}: {
  toasts: ToastRecord[];
  onDismiss: (id: string) => void;
  onPauseTimer: (id: string) => void;
  onResumeTimer: (id: string) => void;
  density: 'relaxed' | 'compact';
}) {
  return (
    <div
      role="region"
      aria-atomic="false" // Individual toasts are atomic, not the container
      aria-label="Notifications"
      className={`pointer-events-none fixed right-4 top-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col ${
        density === 'compact' ? 'gap-1.5' : 'gap-3'
      }`}
    >
      {toasts.map((toast) => (
        <ToastRow
          key={toast.id}
          onDismiss={onDismiss}
          onPauseTimer={onPauseTimer}
          onResumeTimer={onResumeTimer}
          toast={toast}
        />
      ))}
    </div>
  );
});

export const ToastAnnouncer = memo(function ToastAnnouncer({ toasts }: { toasts: ToastRecord[] }) {
  const latestSuccess = useMemo(
    () => [...toasts].reverse().find((toast) => toast.variant === 'success'),
    [toasts],
  );
  const latestError = useMemo(
    () => [...toasts].reverse().find((toast) => toast.variant === 'error'),
    [toasts],
  );

  return (
    <>
      <div aria-atomic="true" aria-live="polite" className="sr-only">
        {latestSuccess ? `${latestSuccess.title}${latestSuccess.description ? `. ${latestSuccess.description}` : ''}` : ''}
      </div>
      <div aria-atomic="true" aria-live="assertive" className="sr-only">
        {latestError ? `${latestError.title}${latestError.description ? `. ${latestError.description}` : ''}` : ''}
      </div>
    </>
  );
});

type ToastTimerState = {
  expiresAt: number | null;
  pauseCount: number;
  remainingMs: number;
  timeoutId: number | null;
};

/**
 * Provides toast notification context to the component tree. Renders the
 * `ToastViewport` (visual toast stack) and `ToastAnnouncer` (screen-reader
 * live regions).
 *
 * Must be mounted inside `<PreferencesProvider>` because it reads `quietMode`,
 * `toastDensity`, and `toastDuration` from user preferences.
 *
 * @see `docs/components/Toast.md` for detailed behavioral guarantees.
 *
 * @param children - React children that will have access to `useToast`.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * <PreferencesProvider> <ToastProvider> <App /> </ToastProvider> </PreferencesProvider>
 * ```
 *
 * ## Quiet mode
 *
 * When `preferences.quietMode` is `true`, `showSuccess()` returns the literal
 * string `'suppressed'` and does **not** create a toast. `showError()` is
 * unaffected and always creates a toast.
 *
 * ## Density
 *
 * `preferences.toastDensity` controls the vertical gap between stacked toasts:
 * - `'relaxed'` (default) → `gap-3`
 * - `'compact'` → `gap-1.5`
 *
 * ## Auto-Dismiss Duration
 *
 * Duration is resolved in order of precedence:
 * 1.  **Per-call `duration`**: `showSuccess({ duration: 1000 })` always wins.
 * 2.  **User preference**: `preferences.toastDuration` is used as a fallback.
 *
 * | Value          | Duration  | Behaviour                       |
 * |----------------|-----------|---------------------------------|
 * | `'short'`      | 2500 ms   | Fast, low-priority confirmation |
 * | `'normal'`     | 5000 ms   | Default behaviour               |
 * | `'long'`       | 10000 ms  | Longer read time                |
 * | `'persistent'` | `null`    | No timer; manual dismiss only   |
 *
 * ## Visible cap and queueing
 *
 * A maximum of `4` toasts are visible at once. Anything created beyond that
 * cap is queued rather than dropped, and gets promoted into view as soon as
 * a visible toast is dismissed (auto or manual). Error toasts queued behind
 * success toasts are promoted first — a burst of successes can never bury or
 * silently discard an error.
 *
 * ## Action button
 *
 * Pass `action: { label, onClick }` in the toast input to render an inline
 * action button. Clicking it fires `onClick` then immediately dismisses the
 * toast. The label is always rendered as a plain text node to prevent XSS.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [queueState, setQueueState] = useState<ToastQueueState>({ visible: [], queued: [] });
  const toasts = queueState.visible;
  const toastTimersRef = useRef<Record<string, ToastTimerState>>({});

  /**
   * Dismisses a toast and, if it was actually visible, promotes the next
   * queued toast into the freed slot — queue order already accounts for
   * severity, so an error toast waiting in the queue is promoted ahead of
   * any success toasts queued before it.
   *
   * The `wasVisible` guard matters: a dismiss button click and its
   * auto-dismiss timer can race (e.g. the timer fires the same tick the
   * user clicks dismiss), so this can be called twice for the same id.
   * Without the guard, the second call would see a full visible list, a
   * non-empty queue, and incorrectly promote another toast without
   * actually freeing a slot — pushing the visible count past the cap.
   */
  const dismissToast = useCallback((id: string) => {
    setQueueState((current) => {
      const wasVisible = current.visible.some((toast) => toast.id === id);
      const remainingVisible = current.visible.filter((toast) => toast.id !== id);

      if (!wasVisible || current.queued.length === 0) {
        return { visible: remainingVisible, queued: current.queued };
      }

      const [promoted, ...restQueue] = current.queued;
      return { visible: [...remainingVisible, promoted], queued: restQueue };
    });
  }, []);

  /**
   * Starts (or restarts) the auto-dismiss timeout for a toast.
   * Stores the expiry timestamp so remaining time can be recovered when pausing.
   */
  const scheduleToastDismiss = useCallback(
    (id: string, durationMs: number) => {
      const existingTimer = toastTimersRef.current[id];
      const timer: ToastTimerState = existingTimer ?? {
        expiresAt: null,
        pauseCount: 0,
        remainingMs: durationMs,
        timeoutId: null,
      };

      if (timer.timeoutId !== null) {
        window.clearTimeout(timer.timeoutId);
      }

      timer.remainingMs = durationMs;
      timer.expiresAt = Date.now() + durationMs;
      timer.timeoutId = window.setTimeout(() => {
        dismissToast(id);
      }, durationMs);

      toastTimersRef.current[id] = timer;
    },
    [dismissToast],
  );

  /**
   * Clears a toast's auto-dismiss timeout and removes its timer state.
   * Called when a toast is dismissed or unmounted.
   */
  const clearToastTimer = useCallback((id: string) => {
    const timer = toastTimersRef.current[id];

    if (!timer) {
      return;
    }

    if (timer.timeoutId !== null) {
      window.clearTimeout(timer.timeoutId);
    }

    delete toastTimersRef.current[id];
  }, []);

  /**
   * Pauses the auto-dismiss timer while a toast is hovered or focused.
   * Uses a pause counter so overlapping hover and focus keep the timer
   * paused until both interactions end.
   */
  const pauseToastTimer = useCallback((id: string) => {
    const timer = toastTimersRef.current[id];

    if (!timer) {
      return;
    }

    timer.pauseCount += 1;

    if (timer.pauseCount === 1 && timer.timeoutId !== null) {
      window.clearTimeout(timer.timeoutId);
      timer.timeoutId = null;

      if (timer.expiresAt !== null) {
        timer.remainingMs = Math.max(0, timer.expiresAt - Date.now());
        timer.expiresAt = null;
      }
    }
  }, []);

  /**
   * Resumes the auto-dismiss timer after hover or focus ends.
   * Only restarts the timeout once every pause source has cleared.
   */
  const resumeToastTimer = useCallback(
    (id: string) => {
      const timer = toastTimersRef.current[id];

      if (!timer || timer.pauseCount === 0) {
        return;
      }

      timer.pauseCount -= 1;

      if (timer.pauseCount === 0 && timer.timeoutId === null) {
        scheduleToastDismiss(id, timer.remainingMs);
      }
    },
    [scheduleToastDismiss],
  );

  const createToast = useCallback(
    (variant: ToastVariant, toast: ToastInput, durationMs: number | null) => {
      const id = generateToastId();
      const record: ToastRecord = { ...toast, duration: durationMs ?? undefined, id, variant };

      setQueueState((current) => {
        if (current.visible.length < MAX_VISIBLE_TOASTS) {
          return { visible: [...current.visible, record], queued: current.queued };
        }
        // At capacity — queue it instead of evicting anything. Error toasts
        // jump ahead of already-queued success toasts (severity ordering);
        // nothing is ever dropped.
        return { visible: current.visible, queued: enqueueBySeverity(current.queued, record) };
      });

      return id;
    },
    [],
  );

  const { preferences } = usePreferences();

  const showSuccess = useCallback(
    (toast: ToastInput) => {
      if (preferences.quietMode) {
        return 'suppressed';
      }
      // Per-call duration takes precedence; fall back to the preference mapping.
      const durationMs =
        toast.duration !== undefined ? toast.duration : DURATION_MAP[preferences.toastDuration];
      return createToast('success', toast, durationMs);
    },
    [createToast, preferences.quietMode, preferences.toastDuration],
  );

  const showError = useCallback(
    (toast: ToastInput) => {
      const durationMs =
        toast.duration !== undefined ? toast.duration : DURATION_MAP[preferences.toastDuration];
      return createToast('error', toast, durationMs);
    },
    [createToast, preferences.toastDuration],
  );

  useEffect(() => {
    toasts.forEach((toast) => {
      if (toastTimersRef.current[toast.id]) {
        return;
      }

      // `toast.duration` on the record is the resolved duration computed at
      // creation time (number | undefined). `undefined` means the toast was
      // created with `toastDuration: 'persistent'` — skip scheduling.
      if (toast.duration === undefined || toast.duration === null) {
        return;
      }

      scheduleToastDismiss(toast.id, toast.duration);
    });

    Object.keys(toastTimersRef.current).forEach((toastId) => {
      const toastStillVisible = toasts.some((toast) => toast.id === toastId);

      if (!toastStillVisible) {
        clearToastTimer(toastId);
      }
    });

    return undefined;
  }, [clearToastTimer, scheduleToastDismiss, toasts]);

  useEffect(() => {
    const timers = toastTimersRef.current;
    return () => {
      Object.keys(timers).forEach((toastId) => {
        const timer = timers[toastId];

        if (timer.timeoutId !== null) {
          clearTimeout(timer.timeoutId);
        }
      });
    };
  }, []);

  const value = useMemo(
    () => ({
      dismissToast,
      showError,
      showSuccess,
      toasts,
    }),
    [dismissToast, showError, showSuccess, toasts],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastAnnouncer toasts={toasts} />
      <ToastViewport
        density={preferences.toastDensity}
        onDismiss={dismissToast}
        onPauseTimer={pauseToastTimer}
        onResumeTimer={resumeToastTimer}
        toasts={toasts}
      />
    </ToastContext.Provider>
  );
}

/**
 * Grants access to the global toast context: `{ toasts, showSuccess,
 * showError, dismissToast }`.
 *
 * Must be called from a component rendered inside `<ToastProvider>`.
 *
 * @returns `{ toasts, showSuccess, showError, dismissToast }`
 *
 * @throws `Error` if called outside a `ToastProvider` tree.
 *
 * @example
 * ```tsx
 * 'use client';
 * import { useToast } from '@/components/toast/toast-provider';
 *
 * function MyComponent() {
 *   const { showSuccess, showError } = useToast();
 *
 *   const onSave = () => {
 *     const id = showSuccess({ title: 'Profile saved!' });
 *     if (id === 'suppressed') {
 *       // User has quiet mode on
 *     }
 *   };
 * }
 * ```
 *
 * ## Return Value Contract
 *
 * | Method               | Normal scenario                | `quietMode: true`              |
 * |----------------------|--------------------------------|--------------------------------|
 * | `showSuccess(toast)` | Unique ID string (`'toast-...'`) | `'suppressed'` (no toast shown) |
 * | `showError(toast)`   | Unique ID string (`'toast-...'`) | Unique ID string (always shown) |
 *
 * ## Accessibility
 *
 * `ToastProvider` renders a `ToastAnnouncer` with two `aria-live` regions
 * (`polite` for success, `assertive` for error) to ensure screen readers
 * announce new toasts reliably. Individual toasts also carry `role="status"`
 * or `role="alert"`.
 */
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}
