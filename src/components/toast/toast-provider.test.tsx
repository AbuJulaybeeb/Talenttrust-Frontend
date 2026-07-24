/// <reference types="jest" />

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { StrictMode, useState } from 'react';
import { PreferencesProvider, usePreferences } from '@/lib/preferences';
import { ToastAnnouncer, ToastProvider, ToastRow, ToastViewport, useToast } from './toast-provider';
import * as toastStyles from './toast-styles';

function ToastHarness() {
  const { showError, showSuccess } = useToast();

  return (
    <div>
      <button
        onClick={() =>
          showSuccess({
            title: 'Milestone released',
            description: 'Funds are on the way.',
            duration: 2000,
          })
        }
        type="button"
      >
        Trigger success
      </button>
      <button
        onClick={() =>
          showError({
            title: 'Wallet not connected',
            description: 'Connect a wallet first.',
            duration: 2000,
          })
        }
        type="button"
      >
        Trigger error
      </button>
    </div>
  );
}

describe('ToastProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.clearAllTimers();
    });
    jest.useRealTimers();
  });

  it('renders success toasts and announces them in a polite live region', () => {
    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger success/i }));

    expect(screen.getByRole('status')).toHaveTextContent('Milestone released');
    expect(screen.getByLabelText('Notifications')).toHaveTextContent('Funds are on the way.');
    expect(screen.getByLabelText('Notifications')).toHaveAttribute('aria-atomic', 'false');
    expect(screen.getByText(/Milestone released\. Funds are on the way\./i)).toHaveAttribute('aria-live', 'polite');
  });

  it('renders error toasts and announces them in an assertive live region', () => {
    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger error/i }));

    expect(screen.getByRole('alert')).toHaveTextContent('Wallet not connected');
    expect(screen.getByText(/Wallet not connected\. Connect a wallet first\./i)).toHaveAttribute('aria-live', 'assertive');
  });

  it('dismisses a toast when the dismiss button is clicked', async () => {
    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger success/i }));
    fireEvent.click(screen.getByRole('button', { name: /dismiss success notification/i }));

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it('automatically dismisses toasts after their duration', async () => {
    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger success/i }));

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it('generates unique ids for rapid toast creation', () => {
    const ids: string[] = [];

    function RapidToastHarness() {
      const { showSuccess } = useToast();

      return (
        <div>
          <button
            onClick={() => {
              const id = showSuccess({ title: 'Toast 1' });
              ids.push(id);
            }}
            type="button"
          >
            Create toast 1
          </button>
          <button
            onClick={() => {
              const id = showSuccess({ title: 'Toast 2' });
              ids.push(id);
            }}
            type="button"
          >
            Create toast 2
          </button>
          <button
            onClick={() => {
              const id = showSuccess({ title: 'Toast 3' });
              ids.push(id);
            }}
            type="button"
          >
            Create toast 3
          </button>
        </div>
      );
    }

    render(
      <ToastProvider>
        <RapidToastHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /create toast 1/i }));
    fireEvent.click(screen.getByRole('button', { name: /create toast 2/i }));
    fireEvent.click(screen.getByRole('button', { name: /create toast 3/i }));

    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(3);
    expect(uniqueIds.size).toBe(3);
    expect(ids.every((id) => id.startsWith('toast-'))).toBe(true);
  });

  it('does not create duplicate toasts under StrictMode double invocation', () => {
    const ids: string[] = [];

    function StrictModeHarness() {
      const { showSuccess } = useToast();

      return (
        <div>
          <button
            onClick={() => {
              const id = showSuccess({ title: 'StrictMode toast' });
              ids.push(id);
            }}
            type="button"
          >
            Create toast
          </button>
        </div>
      );
    }

    render(
      <StrictMode>
        <ToastProvider>
          <StrictModeHarness />
        </ToastProvider>
      </StrictMode>,
    );

    fireEvent.click(screen.getByRole('button', { name: /create toast/i }));

    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(1);
    expect(uniqueIds.size).toBe(1);
  });

  it('pauses auto-dismiss while a toast is hovered', async () => {
    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger success/i }));

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    fireEvent.mouseEnter(screen.getByRole('status'));

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.getByRole('status')).toBeInTheDocument();

    fireEvent.mouseLeave(screen.getByRole('status'));

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it('pauses auto-dismiss while a toast is focused', async () => {
    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger success/i }));

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    fireEvent.focus(screen.getByRole('button', { name: /dismiss success notification/i }));

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.getByRole('status')).toBeInTheDocument();

    fireEvent.blur(screen.getByRole('button', { name: /dismiss success notification/i }));

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it('dismisses toast by returned id', async () => {
    let returnedId: string | null = null;

    function DismissByIdHarness() {
      const { showSuccess, dismissToast } = useToast();

      return (
        <div>
          <button
            onClick={() => {
              returnedId = showSuccess({ title: 'Dismissible toast' });
            }}
            type="button"
          >
            Create toast
          </button>
          <button
            onClick={() => {
              if (returnedId) {
                dismissToast(returnedId);
              }
            }}
            type="button"
          >
            Dismiss by id
          </button>
        </div>
      );
    }

    render(
      <ToastProvider>
        <DismissByIdHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /create toast/i }));
    expect(screen.getByRole('status')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /dismiss by id/i }));

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });
});

describe('quietMode', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('suppresses success toasts when quietMode is true and returns "suppressed"', () => {
    localStorage.setItem(
      'talenttrust-user-preferences',
      JSON.stringify({ quietMode: true }),
    );

    let result: string | null = null;

    function QuietModeHarness() {
      const { showSuccess } = useToast();
      return (
        <button
          onClick={() => {
            result = showSuccess({ title: 'Quiet test' });
          }}
          type="button"
        >
          Trigger
        </button>
      );
    }

    render(
      <PreferencesProvider>
        <ToastProvider>
          <QuietModeHarness />
        </ToastProvider>
      </PreferencesProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger/i }));

    expect(result).toBe('suppressed');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('does not suppress error toasts when quietMode is true', () => {
    localStorage.setItem(
      'talenttrust-user-preferences',
      JSON.stringify({ quietMode: true }),
    );

    let result: string | null = null;

    function QuietModeErrorHarness() {
      const { showError } = useToast();
      return (
        <button
          onClick={() => {
            result = showError({ title: 'Error test' });
          }}
          type="button"
        >
          Trigger error
        </button>
      );
    }

    render(
      <PreferencesProvider>
        <ToastProvider>
          <QuietModeErrorHarness />
        </ToastProvider>
      </PreferencesProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger error/i }));

    expect(result).not.toBe('suppressed');
    expect(result).toMatch(/^toast-/);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

describe('density', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('renders viewport with relaxed (gap-3) spacing by default', () => {
    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger success/i }));

    const viewport = screen.getByLabelText('Notifications');
    expect(viewport.className).toMatch(/gap-3/);
  });

  it('renders viewport with compact (gap-1.5) spacing when toastDensity is compact', () => {
    localStorage.setItem(
      'talenttrust-user-preferences',
      JSON.stringify({ toastDensity: 'compact' }),
    );

    render(
      <PreferencesProvider>
        <ToastProvider>
          <ToastHarness />
        </ToastProvider>
      </PreferencesProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger success/i }));

    const viewport = screen.getByLabelText('Notifications');
    expect(viewport.className).toMatch(/gap-1\.5/);
  });
});

describe('default duration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('uses DEFAULT_DURATION (5000ms) when no duration is provided', () => {
    function DefaultDurationHarness() {
      const { showSuccess } = useToast();
      return (
        <button
          onClick={() => showSuccess({ title: 'Default duration' })}
          type="button"
        >
          Trigger
        </button>
      );
    }

    render(
      <ToastProvider>
        <DefaultDurationHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger/i }));
    expect(screen.getByRole('status')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByRole('status')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

describe('toast queue (MAX_VISIBLE_TOASTS = 4)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.clearAllTimers();
    });
    jest.useRealTimers();
  });

  function MultiToastHarness({ count }: { count: number }) {
    const { showSuccess } = useToast();
    return (
      <button
        onClick={() => {
          for (let i = 1; i <= count; i++) {
            showSuccess({ title: `Toast ${i}`, duration: 10000 });
          }
        }}
        type="button"
      >
        Add {count} toasts
      </button>
    );
  }

  it('shows all toasts when under the cap', () => {
    render(
      <ToastProvider>
        <MultiToastHarness count={3} />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /add 3 toasts/i }));

    expect(screen.getAllByRole('status')).toHaveLength(3);
  });

  it('shows exactly MAX_VISIBLE_TOASTS toasts when exactly at cap', () => {
    render(
      <ToastProvider>
        <MultiToastHarness count={4} />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /add 4 toasts/i }));

    expect(screen.getAllByRole('status')).toHaveLength(4);
  });

  it('queues overflow instead of evicting, keeping only MAX_VISIBLE_TOASTS visible', () => {
    render(
      <ToastProvider>
        <MultiToastHarness count={5} />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /add 5 toasts/i }));

    // Still exactly 4 visible, but they are the *first* four created —
    // nothing already on screen gets pushed off to make room.
    expect(screen.getAllByRole('status')).toHaveLength(4);
    expect(screen.getAllByText('Toast 1', { selector: 'p' })).toHaveLength(1);
    expect(screen.getAllByText('Toast 4', { selector: 'p' })).toHaveLength(1);
    expect(screen.queryAllByText('Toast 5', { selector: 'p' })).toHaveLength(0);
  });

  it('keeps every toast from a large over-cap burst somewhere (visible or queued), never dropping one', () => {
    render(
      <ToastProvider>
        <MultiToastHarness count={6} />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /add 6 toasts/i }));

    expect(screen.getAllByRole('status')).toHaveLength(4);
    expect(screen.getAllByText('Toast 1', { selector: 'p' })).toHaveLength(1);
    expect(screen.getAllByText('Toast 4', { selector: 'p' })).toHaveLength(1);
    // 5 and 6 are queued, not gone — dismissing visible toasts below
    // confirms they are still there and get promoted in order.
    expect(screen.queryAllByText('Toast 5', { selector: 'p' })).toHaveLength(0);
    expect(screen.queryAllByText('Toast 6', { selector: 'p' })).toHaveLength(0);
  });

  it('promotes the oldest queued toast into view, with a working auto-dismiss timer, when a visible toast is dismissed', async () => {
    function SequentialHarness() {
      const { showSuccess } = useToast();
      return (
        <>
          <button
            onClick={() => {
              for (let i = 1; i <= 5; i++) {
                showSuccess({ title: `SeqToast ${i}`, duration: 5000 });
              }
            }}
            type="button"
          >
            Add 5
          </button>
        </>
      );
    }

    render(
      <ToastProvider>
        <SequentialHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /add 5/i }));
    expect(screen.getAllByRole('status')).toHaveLength(4);
    expect(screen.queryAllByText('SeqToast 5', { selector: 'p' })).toHaveLength(0);

    // Dismiss the oldest visible toast — this should free a slot for the
    // queued fifth toast, not just shrink the visible count.
    fireEvent.click(screen.getAllByLabelText(/dismiss success notification/i)[0]);

    expect(screen.getAllByRole('status')).toHaveLength(4);
    expect(screen.queryAllByText('SeqToast 1', { selector: 'p' })).toHaveLength(0);
    expect(screen.getAllByText('SeqToast 5', { selector: 'p' })).toHaveLength(1);

    // The promoted toast gets its own timer, scheduled fresh at promotion time.
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(screen.queryAllByText('SeqToast 5', { selector: 'p' })).toHaveLength(0);
    });
  });

  it('announces the toast that is actually visible, not one still waiting in the queue', () => {
    render(
      <ToastProvider>
        <MultiToastHarness count={5} />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /add 5 toasts/i }));

    // Toast 5 hasn't been shown yet, so it must not be announced either.
    const politeRegion = document.querySelector('[aria-live="polite"]');
    expect(politeRegion).toHaveTextContent('Toast 4');
    expect(politeRegion).not.toHaveTextContent('Toast 5');
  });

  it('does not affect pause-on-hover for a toast promoted from the queue', async () => {
    function SingleQueueHarness() {
      const { showSuccess } = useToast();
      return (
        <button
          onClick={() => {
            for (let i = 1; i <= 5; i++) {
              showSuccess({ title: `T${i}`, duration: 2000 });
            }
          }}
          type="button"
        >
          Add 5
        </button>
      );
    }

    render(
      <ToastProvider>
        <SingleQueueHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /add 5/i }));
    fireEvent.click(screen.getAllByLabelText(/dismiss success notification/i)[0]);

    const t5Para = screen.getAllByText('T5', { selector: 'p' })[0];
    const t5 = t5Para.closest('[role="status"]')!;
    fireEvent.mouseEnter(t5);

    act(() => {
      jest.advanceTimersByTime(2500);
    });

    expect(t5).toBeInTheDocument();

    fireEvent.mouseLeave(t5);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(screen.queryAllByText('T5', { selector: 'p' })).toHaveLength(0);
    });
  });

  it('promotes a queued error ahead of a success toast that was queued earlier (severity ordering)', () => {
    function SeverityHarness() {
      const { showSuccess, showError } = useToast();
      return (
        <>
          <button
            onClick={() => {
              for (let i = 1; i <= 4; i++) {
                showSuccess({ title: `Fill ${i}`, duration: 10000 });
              }
              // Both of these are created over-cap: a success first, then an
              // error. Without severity ordering the success would be
              // promoted first since it was queued first (FIFO).
              showSuccess({ title: 'Queued success', duration: 10000 });
              showError({ title: 'Queued error', duration: 10000 });
            }}
            type="button"
          >
            Fill and queue
          </button>
        </>
      );
    }

    render(
      <ToastProvider>
        <SeverityHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /fill and queue/i }));
    expect(screen.queryAllByText('Queued success', { selector: 'p' })).toHaveLength(0);
    expect(screen.queryAllByText('Queued error', { selector: 'p' })).toHaveLength(0);

    // Free one slot — the error should be promoted, not the
    // earlier-queued success.
    fireEvent.click(screen.getAllByLabelText(/dismiss success notification/i)[0]);

    expect(screen.getAllByText('Queued error', { selector: 'p' })).toHaveLength(1);
    expect(screen.queryAllByText('Queued success', { selector: 'p' })).toHaveLength(0);
  });

  it('never silently drops a queued error toast under a large success burst', () => {
    function BigBurstHarness() {
      const { showSuccess, showError } = useToast();
      return (
        <button
          onClick={() => {
            for (let i = 1; i <= 10; i++) {
              showSuccess({ title: `Burst ${i}`, duration: 10000 });
            }
            showError({ title: 'Important failure', duration: 10000 });
          }}
          type="button"
        >
          Trigger burst plus error
        </button>
      );
    }

    render(
      <ToastProvider>
        <BigBurstHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger burst plus error/i }));

    // Not visible yet (10 success toasts are ahead of it in creation order,
    // but only 4 fit), and critically — not lost either.
    expect(screen.queryAllByText('Important failure', { selector: 'p' })).toHaveLength(0);

    // Dismiss visible toasts one at a time; the error must surface well
    // before all 10 successes have cycled through, because it jumps the
    // success queue.
    for (let i = 0; i < 4; i += 1) {
      fireEvent.click(screen.getAllByLabelText(/dismiss/i)[0]);
    }

    expect(screen.getAllByText('Important failure', { selector: 'p' })).toHaveLength(1);
  });

  it('queues an error directly (no success ahead of it) when the queue was empty', () => {
    function DirectErrorHarness() {
      const { showSuccess, showError } = useToast();
      return (
        <button
          onClick={() => {
            for (let i = 1; i <= 4; i++) {
              showSuccess({ title: `Fill ${i}`, duration: 10000 });
            }
            showError({ title: 'First queued error', duration: 10000 });
          }}
          type="button"
        >
          Fill then queue error
        </button>
      );
    }

    render(
      <ToastProvider>
        <DirectErrorHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /fill then queue error/i }));
    expect(screen.queryAllByText('First queued error', { selector: 'p' })).toHaveLength(0);

    fireEvent.click(screen.getAllByLabelText(/dismiss/i)[0]);

    expect(screen.getAllByText('First queued error', { selector: 'p' })).toHaveLength(1);
  });

  it('does not over-promote if a toast is dismissed twice (dismiss button and its own timer racing)', () => {
    function RaceHarness() {
      const { showSuccess, dismissToast } = useToast();
      return (
        <button
          onClick={() => {
            const ids: string[] = [];
            for (let i = 1; i <= 5; i++) {
              ids.push(showSuccess({ title: `Race ${i}`, duration: 10000 }));
            }
            // Simulate the dismiss button and the auto-dismiss timer both
            // resolving for the same already-visible toast.
            dismissToast(ids[0]);
            dismissToast(ids[0]);
          }}
          type="button"
        >
          Trigger race
        </button>
      );
    }

    render(
      <ToastProvider>
        <RaceHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger race/i }));

    // Exactly one queued toast should have been promoted, not two —
    // the visible count must stay at the cap.
    expect(screen.getAllByRole('status')).toHaveLength(4);
  });
});

// ---------------------------------------------------------------------------
// action button
// ---------------------------------------------------------------------------

describe('toast action button', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.clearAllTimers();
    });
    jest.useRealTimers();
  });

  it('renders an action button when action is provided on a success toast', () => {
    function ActionHarness() {
      const { showSuccess } = useToast();
      return (
        <button
          type="button"
          onClick={() =>
            showSuccess({
              title: 'File saved',
              action: { label: 'Undo', onClick: jest.fn() },
            })
          }
        >
          Trigger
        </button>
      );
    }

    render(
      <ToastProvider>
        <ActionHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger/i }));

    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
  });

  it('renders an action button when action is provided on an error toast', () => {
    function ActionErrorHarness() {
      const { showError } = useToast();
      return (
        <button
          type="button"
          onClick={() =>
            showError({
              title: 'Upload failed',
              action: { label: 'Retry', onClick: jest.fn() },
            })
          }
        >
          Trigger error
        </button>
      );
    }

    render(
      <ToastProvider>
        <ActionErrorHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger error/i }));

    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('clicking the action button fires the onClick callback', async () => {
    const onActionClick = jest.fn();

    function ActionCallbackHarness() {
      const { showSuccess } = useToast();
      return (
        <button
          type="button"
          onClick={() =>
            showSuccess({
              title: 'Contract saved',
              action: { label: 'View', onClick: onActionClick },
            })
          }
        >
          Trigger
        </button>
      );
    }

    render(
      <ToastProvider>
        <ActionCallbackHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger/i }));
    fireEvent.click(screen.getByRole('button', { name: 'View' }));

    expect(onActionClick).toHaveBeenCalledTimes(1);
  });

  it('clicking the action button dismisses the toast immediately', async () => {
    function ActionDismissHarness() {
      const { showSuccess } = useToast();
      return (
        <button
          type="button"
          onClick={() =>
            showSuccess({
              title: 'Milestone released',
              duration: 10000,
              action: { label: 'Undo', onClick: jest.fn() },
            })
          }
        >
          Trigger
        </button>
      );
    }

    render(
      <ToastProvider>
        <ActionDismissHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger/i }));
    expect(screen.getByRole('status')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // The auto-dismiss timer must not fire after the toast is already gone.
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('fires onClick before dismissing (callback order)', () => {
    const callOrder: string[] = [];
    const onActionClick = jest.fn(() => callOrder.push('action'));

    function OrderHarness() {
      const { showSuccess } = useToast();
      return (
        <button
          type="button"
          onClick={() =>
            showSuccess({
              title: 'Saved',
              action: { label: 'Undo', onClick: onActionClick },
            })
          }
        >
          Trigger
        </button>
      );
    }

    // For this test we verify onClick is called, not the internal order of
    // state updates (which React batches). Just confirm onClick runs exactly once.
    render(
      <ToastProvider>
        <OrderHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));

    expect(onActionClick).toHaveBeenCalledTimes(1);
  });

  it('does not render an action button when action is omitted (backward compatibility)', () => {
    function NoActionHarness() {
      const { showSuccess } = useToast();
      return (
        <button
          type="button"
          onClick={() =>
            showSuccess({ title: 'Done', description: 'All good.' })
          }
        >
          Trigger
        </button>
      );
    }

    render(
      <ToastProvider>
        <NoActionHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger/i }));

    // Only the dismiss button should be present inside the toast
    const toast = screen.getByRole('status');
    const buttons = toast.querySelectorAll('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveAttribute('aria-label', 'Dismiss success notification');
  });

  it('action label is rendered as a plain text node, not parsed as HTML', () => {
    const maliciousLabel = '<img src=x onerror=alert(1)>';

    function XssHarness() {
      const { showSuccess } = useToast();
      return (
        <button
          type="button"
          onClick={() =>
            showSuccess({
              title: 'Test',
              action: { label: maliciousLabel, onClick: jest.fn() },
            })
          }
        >
          Trigger
        </button>
      );
    }

    render(
      <ToastProvider>
        <XssHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger/i }));

    // The button text content must equal the raw string, not contain an img element.
    const actionBtn = screen.getByRole('button', { name: maliciousLabel });
    expect(actionBtn).toBeInTheDocument();
    expect(actionBtn.querySelector('img')).toBeNull();
    expect(actionBtn.textContent).toBe(maliciousLabel);
  });

  it('action button has focus-visible ring styling class', () => {
    function FocusHarness() {
      const { showSuccess } = useToast();
      return (
        <button
          type="button"
          onClick={() =>
            showSuccess({
              title: 'Ready',
              action: { label: 'Open', onClick: jest.fn() },
            })
          }
        >
          Trigger
        </button>
      );
    }

    render(
      <ToastProvider>
        <FocusHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger/i }));

    const actionBtn = screen.getByRole('button', { name: 'Open' });
    expect(actionBtn.className).toContain('focus-visible:ring-2');
  });

  it('showSuccess and showError signatures remain backward compatible without action', () => {
    // Calling both without action must not throw and must return a valid id.
    let successId: string = '';
    let errorId: string = '';

    function BackCompatHarness() {
      const { showSuccess, showError } = useToast();
      return (
        <>
          <button
            type="button"
            onClick={() => { successId = showSuccess({ title: 'Success' }); }}
          >
            Success
          </button>
          <button
            type="button"
            onClick={() => { errorId = showError({ title: 'Error' }); }}
          >
            Error
          </button>
        </>
      );
    }

    render(
      <ToastProvider>
        <BackCompatHarness />
      </ToastProvider>,
    );

    expect(() => {
      fireEvent.click(screen.getByRole('button', { name: /^success$/i }));
      fireEvent.click(screen.getByRole('button', { name: /^error$/i }));
    }).not.toThrow();

    expect(successId).toMatch(/^toast-/);
    expect(errorId).toMatch(/^toast-/);
  });
});

// ---------------------------------------------------------------------------
// toastDuration preference
// ---------------------------------------------------------------------------

describe('toastDuration preference', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.clearAllTimers();
    });
    jest.useRealTimers();
  });

  // Helper: renders with a given toastDuration preference and a trigger button.
  function DurationHarness({ variant = 'success' }: { variant?: 'success' | 'error' }) {
    const { showSuccess, showError } = useToast();
    return (
      <button
        type="button"
        onClick={() => {
          if (variant === 'success') {
            showSuccess({ title: 'Duration test' });
          } else {
            showError({ title: 'Duration error test' });
          }
        }}
      >
        Trigger
      </button>
    );
  }

  it("'normal' (default) auto-dismisses at 5000ms", async () => {
    render(
      <ToastProvider>
        <DurationHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger/i }));
    expect(screen.getByRole('status')).toBeInTheDocument();

    act(() => { jest.advanceTimersByTime(4999); });
    expect(screen.getByRole('status')).toBeInTheDocument();

    act(() => { jest.advanceTimersByTime(1); });
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it("'short' auto-dismisses at 2500ms", async () => {
    localStorage.setItem(
      'talenttrust-user-preferences',
      JSON.stringify({ toastDuration: 'short' }),
    );

    render(
      <PreferencesProvider>
        <ToastProvider>
          <DurationHarness />
        </ToastProvider>
      </PreferencesProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger/i }));
    expect(screen.getByRole('status')).toBeInTheDocument();

    act(() => { jest.advanceTimersByTime(2499); });
    expect(screen.getByRole('status')).toBeInTheDocument();

    act(() => { jest.advanceTimersByTime(1); });
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it("'long' auto-dismisses at 10000ms", async () => {
    localStorage.setItem(
      'talenttrust-user-preferences',
      JSON.stringify({ toastDuration: 'long' }),
    );

    render(
      <PreferencesProvider>
        <ToastProvider>
          <DurationHarness />
        </ToastProvider>
      </PreferencesProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger/i }));
    expect(screen.getByRole('status')).toBeInTheDocument();

    act(() => { jest.advanceTimersByTime(9999); });
    expect(screen.getByRole('status')).toBeInTheDocument();

    act(() => { jest.advanceTimersByTime(1); });
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it("'persistent' — toast never auto-dismisses", async () => {
    localStorage.setItem(
      'talenttrust-user-preferences',
      JSON.stringify({ toastDuration: 'persistent' }),
    );

    render(
      <PreferencesProvider>
        <ToastProvider>
          <DurationHarness />
        </ToastProvider>
      </PreferencesProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger/i }));
    expect(screen.getByRole('status')).toBeInTheDocument();

    // Advance well past any normal timeout.
    act(() => { jest.advanceTimersByTime(60000); });

    // Toast must still be visible.
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it("'persistent' — toast is dismissible via the dismiss button", async () => {
    localStorage.setItem(
      'talenttrust-user-preferences',
      JSON.stringify({ toastDuration: 'persistent' }),
    );

    render(
      <PreferencesProvider>
        <ToastProvider>
          <DurationHarness />
        </ToastProvider>
      </PreferencesProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger/i }));
    expect(screen.getByRole('status')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /dismiss success notification/i }));

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it("'persistent' — toast is dismissible via keyboard (Enter on dismiss button)", async () => {
    localStorage.setItem(
      'talenttrust-user-preferences',
      JSON.stringify({ toastDuration: 'persistent' }),
    );

    render(
      <PreferencesProvider>
        <ToastProvider>
          <DurationHarness />
        </ToastProvider>
      </PreferencesProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger/i }));
    const dismissBtn = screen.getByRole('button', { name: /dismiss success notification/i });
    dismissBtn.focus();
    fireEvent.keyDown(dismissBtn, { key: 'Enter', code: 'Enter' });
    fireEvent.click(dismissBtn); // browser fires click on Enter for buttons

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it('per-call duration overrides the persistent preference', async () => {
    localStorage.setItem(
      'talenttrust-user-preferences',
      JSON.stringify({ toastDuration: 'persistent' }),
    );

    function OverrideHarness() {
      const { showSuccess } = useToast();
      return (
        <button
          type="button"
          onClick={() => showSuccess({ title: 'Override', duration: 1000 })}
        >
          Trigger
        </button>
      );
    }

    render(
      <PreferencesProvider>
        <ToastProvider>
          <OverrideHarness />
        </ToastProvider>
      </PreferencesProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger/i }));
    expect(screen.getByRole('status')).toBeInTheDocument();

    act(() => { jest.advanceTimersByTime(999); });
    expect(screen.getByRole('status')).toBeInTheDocument();

    act(() => { jest.advanceTimersByTime(1); });
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it('per-call duration overrides the long preference', async () => {
    localStorage.setItem(
      'talenttrust-user-preferences',
      JSON.stringify({ toastDuration: 'long' }),
    );

    function ShortOverrideHarness() {
      const { showSuccess } = useToast();
      return (
        <button
          type="button"
          onClick={() => showSuccess({ title: 'Short override', duration: 500 })}
        >
          Trigger
        </button>
      );
    }

    render(
      <PreferencesProvider>
        <ToastProvider>
          <ShortOverrideHarness />
        </ToastProvider>
      </PreferencesProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger/i }));
    expect(screen.getByRole('status')).toBeInTheDocument();

    act(() => { jest.advanceTimersByTime(500); });
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it('invalid stored toastDuration falls back to normal (5000ms)', async () => {
    localStorage.setItem(
      'talenttrust-user-preferences',
      JSON.stringify({ toastDuration: 'forever' }),
    );

    render(
      <PreferencesProvider>
        <ToastProvider>
          <DurationHarness />
        </ToastProvider>
      </PreferencesProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger/i }));
    expect(screen.getByRole('status')).toBeInTheDocument();

    act(() => { jest.advanceTimersByTime(4999); });
    expect(screen.getByRole('status')).toBeInTheDocument();

    act(() => { jest.advanceTimersByTime(1); });
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it('persistent + quietMode: success toast is still suppressed', () => {
    localStorage.setItem(
      'talenttrust-user-preferences',
      JSON.stringify({ toastDuration: 'persistent', quietMode: true }),
    );

    let result: string | null = null;

    function PersistentQuietHarness() {
      const { showSuccess } = useToast();
      return (
        <button
          type="button"
          onClick={() => { result = showSuccess({ title: 'Silent persistent' }); }}
        >
          Trigger
        </button>
      );
    }

    render(
      <PreferencesProvider>
        <ToastProvider>
          <PersistentQuietHarness />
        </ToastProvider>
      </PreferencesProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger/i }));

    expect(result).toBe('suppressed');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('persistent + quietMode: error toast is still shown and stays without auto-dismiss', async () => {
    localStorage.setItem(
      'talenttrust-user-preferences',
      JSON.stringify({ toastDuration: 'persistent', quietMode: true }),
    );

    render(
      <PreferencesProvider>
        <ToastProvider>
          <DurationHarness variant="error" />
        </ToastProvider>
      </PreferencesProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    act(() => { jest.advanceTimersByTime(60000); });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('MAX_VISIBLE_TOASTS queueing still works with persistent preference', () => {
    localStorage.setItem(
      'talenttrust-user-preferences',
      JSON.stringify({ toastDuration: 'persistent' }),
    );

    function PersistentMultiHarness({ count }: { count: number }) {
      const { showSuccess } = useToast();
      return (
        <button
          type="button"
          onClick={() => {
            for (let i = 1; i <= count; i++) {
              showSuccess({ title: `PToast ${i}` });
            }
          }}
        >
          Add toasts
        </button>
      );
    }

    render(
      <PreferencesProvider>
        <ToastProvider>
          <PersistentMultiHarness count={5} />
        </ToastProvider>
      </PreferencesProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /add toasts/i }));

    // After adding 5, only 4 should be visible — but they are the first
    // four (PToast 1 included), not evicted; the 5th is queued.
    expect(screen.getAllByRole('status')).toHaveLength(4);
    expect(screen.getAllByText('PToast 1', { selector: 'p' })).toHaveLength(1);
    expect(screen.queryAllByText('PToast 5', { selector: 'p' })).toHaveLength(0);

    // Advance time — none should auto-dismiss (all persistent), so the
    // queued toast never gets a chance to be promoted here.
    act(() => { jest.advanceTimersByTime(60000); });
    expect(screen.getAllByRole('status')).toHaveLength(4);
    expect(screen.queryAllByText('PToast 5', { selector: 'p' })).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// copy-details (issue #504)
// ---------------------------------------------------------------------------

describe('buildCopyText', () => {
  it('includes the title prefixed with "Error:"', () => {
    const result = buildCopyText({ title: 'Wallet not connected' });
    expect(result).toContain('Error: Wallet not connected');
  });

  it('includes description prefixed with "Details:" when present', () => {
    const result = buildCopyText({
      title: 'Wallet not connected',
      description: 'Connect a wallet first.',
    });
    expect(result).toContain('Details: Connect a wallet first.');
  });

  it('omits the Details line when description is absent', () => {
    const result = buildCopyText({ title: 'Network error' });
    expect(result).not.toContain('Details:');
  });

  it('includes correlationId prefixed with "Correlation ID:" when present', () => {
    const result = buildCopyText({
      title: 'Payment failed',
      correlationId: 'abc-123',
    });
    expect(result).toContain('Correlation ID: abc-123');
  });

  it('omits the Correlation ID line when correlationId is absent', () => {
    const result = buildCopyText({ title: 'Payment failed' });
    expect(result).not.toContain('Correlation ID:');
  });

  it('assembles all three lines in order when all fields are present', () => {
    const result = buildCopyText({
      title: 'Upload failed',
      description: 'File size exceeds limit.',
      correlationId: 'req-456',
    });
    expect(result).toBe(
      'Error: Upload failed\nDetails: File size exceeds limit.\nCorrelation ID: req-456',
    );
  });

  it('returns just the title line when only title is provided', () => {
    const result = buildCopyText({ title: 'Unknown error' });
    expect(result).toBe('Error: Unknown error');
  });

  it('handles a title that is an empty string without throwing', () => {
    expect(() => buildCopyText({ title: '' })).not.toThrow();
    const result = buildCopyText({ title: '' });
    expect(result).toBe('Error: ');
  });
});

describe('copyToClipboard', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses navigator.clipboard.writeText when available and returns true on success', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    const result = await copyToClipboard('hello');
    expect(writeText).toHaveBeenCalledWith('hello');
    expect(result).toBe(true);
  });

  it('falls back to execCommand when clipboard API rejects and returns true on success', async () => {
    const writeText = jest.fn().mockRejectedValue(new Error('denied'));
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    
    // Define execCommand before spying on it
    if (!document.execCommand) {
      Object.defineProperty(document, 'execCommand', {
        value: () => false,
        configurable: true,
        writable: true,
      });
    }
    const execCommandSpy = jest.spyOn(document, 'execCommand').mockReturnValue(true);

    const result = await copyToClipboard('fallback text');
    expect(execCommandSpy).toHaveBeenCalledWith('copy');
    expect(result).toBe(true);
    
    execCommandSpy.mockRestore();
  });

  it('falls back to execCommand when clipboard API is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
    });
    
    if (!document.execCommand) {
      Object.defineProperty(document, 'execCommand', {
        value: () => false,
        configurable: true,
        writable: true,
      });
    }
    const execCommandSpy = jest.spyOn(document, 'execCommand').mockReturnValue(true);

    const result = await copyToClipboard('no clipboard');
    expect(execCommandSpy).toHaveBeenCalledWith('copy');
    expect(result).toBe(true);
    
    execCommandSpy.mockRestore();
  });

  it('returns false when clipboard API rejects and execCommand returns false', async () => {
    const writeText = jest.fn().mockRejectedValue(new Error('denied'));
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    
    if (!document.execCommand) {
      Object.defineProperty(document, 'execCommand', {
        value: () => false,
        configurable: true,
        writable: true,
      });
    }
    const execCommandSpy = jest.spyOn(document, 'execCommand').mockReturnValue(false);

    const result = await copyToClipboard('will fail');
    expect(result).toBe(false);
    
    execCommandSpy.mockRestore();
  });

  it('returns false when both clipboard API and execCommand throw', async () => {
    const writeText = jest.fn().mockRejectedValue(new Error('denied'));
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    
    if (!document.execCommand) {
      Object.defineProperty(document, 'execCommand', {
        value: () => false,
        configurable: true,
        writable: true,
      });
    }
    const execCommandSpy = jest.spyOn(document, 'execCommand').mockImplementation(() => {
      throw new Error('execCommand unavailable');
    });

    const result = await copyToClipboard('will fail');
    expect(result).toBe(false);
    
    execCommandSpy.mockRestore();
  });

  it('cleans up the temporary textarea from the DOM on success', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
    });
    
    if (!document.execCommand) {
      Object.defineProperty(document, 'execCommand', {
        value: () => false,
        configurable: true,
        writable: true,
      });
    }
    const execCommandSpy = jest.spyOn(document, 'execCommand').mockReturnValue(true);
    const initialBodyChildCount = document.body.children.length;

    await copyToClipboard('cleanup test');

    expect(document.body.children.length).toBe(initialBodyChildCount);
    execCommandSpy.mockRestore();
  });

  it('cleans up the temporary textarea from the DOM even when execCommand throws', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
    });
    
    if (!document.execCommand) {
      Object.defineProperty(document, 'execCommand', {
        value: () => false,
        configurable: true,
        writable: true,
      });
    }
    const execCommandSpy = jest.spyOn(document, 'execCommand').mockImplementation(() => {
      throw new Error('execCommand unavailable');
    });
    const initialBodyChildCount = document.body.children.length;

    await copyToClipboard('cleanup error test');

    expect(document.body.children.length).toBe(initialBodyChildCount);
    execCommandSpy.mockRestore();
  });
});

describe('copy-details button rendering', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Provide a working clipboard mock for all rendering tests.
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
  });

  afterEach(() => {
    act(() => { jest.clearAllTimers(); });
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('renders a "Copy details" button on error toasts', () => {
    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger error/i }));

    expect(
      screen.getByRole('button', { name: /copy error details to clipboard/i }),
    ).toBeInTheDocument();
  });

  it('does NOT render a "Copy details" button on success toasts', () => {
    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger success/i }));

    expect(
      screen.queryByRole('button', { name: /copy error details to clipboard/i }),
    ).not.toBeInTheDocument();
  });

  it('shows "✓ Copied!" label immediately after a successful copy', async () => {
    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger error/i }));

    const copyBtn = screen.getByRole('button', { name: /copy error details to clipboard/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(screen.getByRole('button', { name: /copied to clipboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copied to clipboard/i })).toHaveTextContent('✓ Copied!');
  });

  it('resets back to "Copy details" label after 2000ms', async () => {
    // Use a long duration so the toast does not auto-dismiss while we
    // advance the 2000ms copy-reset timer.
    function LongErrorHarness() {
      const { showError } = useToast();
      return (
        <button
          type="button"
          onClick={() =>
            showError({ title: 'Persistent error', duration: 30000 })
          }
        >
          Trigger long error
        </button>
      );
    }

    render(
      <ToastProvider>
        <LongErrorHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger long error/i }));

    const copyBtn = screen.getByRole('button', { name: /copy error details to clipboard/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(screen.getByRole('button', { name: /copied to clipboard/i })).toBeInTheDocument();

    act(() => { jest.advanceTimersByTime(2000); });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /copy error details to clipboard/i })).toBeInTheDocument();
    });
  });

  it('does not change label if copy fails (returns false)', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn().mockRejectedValue(new Error('denied')) },
      configurable: true,
    });
    
    if (!document.execCommand) {
      Object.defineProperty(document, 'execCommand', {
        value: () => false,
        configurable: true,
        writable: true,
      });
    }
    const execCommandSpy = jest.spyOn(document, 'execCommand').mockReturnValue(false);

    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger error/i }));

    const copyBtn = screen.getByRole('button', { name: /copy error details to clipboard/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    // Label should NOT have changed to "Copied!" since copy failed.
    expect(screen.queryByRole('button', { name: /copied to clipboard/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy error details to clipboard/i })).toBeInTheDocument();
    
    execCommandSpy.mockRestore();
  });

  it('copies the correct text (title + description)', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger error/i }));

    const copyBtn = screen.getByRole('button', { name: /copy error details to clipboard/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(writeText).toHaveBeenCalledWith(
      'Error: Wallet not connected\nDetails: Connect a wallet first.',
    );
  });

  it('copies just the title when no description is present', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    function TitleOnlyErrorHarness() {
      const { showError } = useToast();
      return (
        <button
          type="button"
          onClick={() => showError({ title: 'Something went wrong', duration: 5000 })}
        >
          Trigger title-only error
        </button>
      );
    }

    render(
      <ToastProvider>
        <TitleOnlyErrorHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger title-only error/i }));

    const copyBtn = screen.getByRole('button', { name: /copy error details to clipboard/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(writeText).toHaveBeenCalledWith('Error: Something went wrong');
  });

  it('includes the correlationId in copied text when provided', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    function CorrelationErrorHarness() {
      const { showError } = useToast();
      return (
        <button
          type="button"
          onClick={() =>
            showError({
              title: 'Payment failed',
              description: 'Insufficient funds.',
              correlationId: 'req-789',
              duration: 5000,
            })
          }
        >
          Trigger correlation error
        </button>
      );
    }

    render(
      <ToastProvider>
        <CorrelationErrorHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger correlation error/i }));

    const copyBtn = screen.getByRole('button', { name: /copy error details to clipboard/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(writeText).toHaveBeenCalledWith(
      'Error: Payment failed\nDetails: Insufficient funds.\nCorrelation ID: req-789',
    );
  });

  it('uses the execCommand fallback when clipboard API is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
    });
    
    if (!document.execCommand) {
      Object.defineProperty(document, 'execCommand', {
        value: () => false,
        configurable: true,
        writable: true,
      });
    }
    const execCommandSpy = jest.spyOn(document, 'execCommand').mockReturnValue(true);

    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger error/i }));

    const copyBtn = screen.getByRole('button', { name: /copy error details to clipboard/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(execCommandSpy).toHaveBeenCalledWith('copy');
    expect(screen.getByRole('button', { name: /copied to clipboard/i })).toBeInTheDocument();
    
    execCommandSpy.mockRestore();
  });

  it('copy button has accessible aria-label that updates after copy', async () => {
    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger error/i }));

    const copyBtn = screen.getByRole('button', { name: /copy error details to clipboard/i });
    expect(copyBtn).toHaveAttribute('aria-label', 'Copy error details to clipboard');

    await act(async () => {
      fireEvent.click(copyBtn);
    });

    const updatedBtn = screen.getByRole('button', { name: /copied to clipboard/i });
    expect(updatedBtn).toHaveAttribute('aria-label', 'Copied to clipboard');
  });

  it('copy button has focus-visible ring styling', () => {
    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger error/i }));

    const copyBtn = screen.getByRole('button', { name: /copy error details to clipboard/i });
    expect(copyBtn.className).toContain('focus-visible:ring-2');
  });

  it('copy button does not dismiss the toast', async () => {
    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger error/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    const copyBtn = screen.getByRole('button', { name: /copy error details to clipboard/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    // Toast must still be visible after copy.
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('error toast with action button also shows the copy-details button', async () => {
    function ErrorWithActionHarness() {
      const { showError } = useToast();
      return (
        <button
          type="button"
          onClick={() =>
            showError({
              title: 'Upload failed',
              action: { label: 'Retry', onClick: jest.fn() },
              duration: 5000,
            })
          }
        >
          Trigger error with action
        </button>
      );
    }

    render(
      <ToastProvider>
        <ErrorWithActionHarness />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger error with action/i }));

    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /copy error details to clipboard/i }),
    ).toBeInTheDocument();
  });
});

describe('row and derived-data memoization', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.clearAllTimers();
    });
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  function Trigger({ title }: { title: string }) {
    const { showSuccess } = useToast();
    return (
      <button onClick={() => showSuccess({ title, duration: 2000 })} type="button">
        {`Create ${title}`}
      </button>
    );
  }

  /**
   * Mounts `ToastProvider` behind its own unrelated state so that clicking
   * "Unrelated update" re-renders `ToastProvider` (a new element is created
   * for it on every `NoisyAncestor` render) without touching toasts or
   * preferences — reproducing the "unrelated state change" from the ticket.
   */
  function NoisyAncestor({ children }: { children: React.ReactNode }) {
    const [count, setCount] = useState(0);
    return (
      <div>
        <button onClick={() => setCount((current) => current + 1)} type="button">
          Unrelated update
        </button>
        <span data-testid="unrelated-count">{count}</span>
        <ToastProvider>{children}</ToastProvider>
      </div>
    );
  }

  function isMemoComponent(value: unknown) {
    return (
      typeof value === 'object' &&
      value !== null &&
      (value as { $$typeof?: symbol }).$$typeof === Symbol.for('react.memo')
    );
  }

  it('wraps ToastRow, ToastViewport, and ToastAnnouncer in React.memo', () => {
    expect(isMemoComponent(ToastRow)).toBe(true);
    expect(isMemoComponent(ToastViewport)).toBe(true);
    expect(isMemoComponent(ToastAnnouncer)).toBe(true);
  });

  it("does not recompute a toast row's derived styles when an unrelated ancestor re-renders", () => {
    const stylesSpy = jest.spyOn(toastStyles, 'getToastStyles');

    render(
      <NoisyAncestor>
        <Trigger title="Milestone" />
      </NoisyAncestor>,
    );

    fireEvent.click(screen.getByRole('button', { name: /create milestone/i }));
    expect(stylesSpy).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /unrelated update/i }));
    fireEvent.click(screen.getByRole('button', { name: /unrelated update/i }));
    fireEvent.click(screen.getByRole('button', { name: /unrelated update/i }));

    // The unrelated state did update…
    expect(screen.getByTestId('unrelated-count')).toHaveTextContent('3');
    // …but the toast row's derived data was not recomputed, and the toast
    // itself is unaffected.
    expect(stylesSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent('Milestone');
  });

  it('recomputes styles only for a newly added toast, not for existing rows', () => {
    const stylesSpy = jest.spyOn(toastStyles, 'getToastStyles');

    render(
      <ToastProvider>
        <Trigger title="Toast A" />
        <Trigger title="Toast B" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /create toast a/i }));
    expect(stylesSpy).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /create toast b/i }));
    expect(stylesSpy).toHaveBeenCalledTimes(2);
  });

  it("does not recompute a surviving toast's styles when a sibling toast is dismissed", () => {
    const stylesSpy = jest.spyOn(toastStyles, 'getToastStyles');

    render(
      <ToastProvider>
        <Trigger title="Toast A" />
        <Trigger title="Toast B" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /create toast a/i }));
    fireEvent.click(screen.getByRole('button', { name: /create toast b/i }));
    expect(stylesSpy).toHaveBeenCalledTimes(2);

    const dismissButtons = screen.getAllByRole('button', { name: /dismiss success notification/i });
    fireEvent.click(dismissButtons[0]);

    expect(screen.getByText('Toast B', { selector: 'p' })).toBeInTheDocument();
    expect(stylesSpy).toHaveBeenCalledTimes(2);
  });

  it('computes styles exactly once per toast across a large, evicting burst of toasts', () => {
    const stylesSpy = jest.spyOn(toastStyles, 'getToastStyles');

    function BurstTrigger() {
      const { showSuccess } = useToast();
      return (
        <button onClick={() => showSuccess({ title: 'Burst toast', duration: 2000 })} type="button">
          Fire one
        </button>
      );
    }

    render(
      <ToastProvider>
        <BurstTrigger />
      </ToastProvider>,
    );

    const fireButton = screen.getByRole('button', { name: /fire one/i });
    for (let i = 0; i < 25; i += 1) {
      fireEvent.click(fireButton);
    }

    // Every created toast gets exactly one style computation the moment it
    // mounts, even though only MAX_VISIBLE_TOASTS (4) remain after eviction.
    expect(stylesSpy).toHaveBeenCalledTimes(25);
    expect(screen.getAllByRole('status')).toHaveLength(4);
  });

  it('still updates the viewport when a relevant preference actually changes, even amid unrelated noise', () => {
    function DensityToggle() {
      const { updatePreference } = usePreferences();
      return (
        <button onClick={() => updatePreference('toastDensity', 'compact')} type="button">
          Switch to compact
        </button>
      );
    }

    render(
      <PreferencesProvider>
        <NoisyAncestor>
          <Trigger title="Milestone" />
          <DensityToggle />
        </NoisyAncestor>
      </PreferencesProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /create milestone/i }));

    const viewport = screen.getByLabelText('Notifications');
    expect(viewport.className).toMatch(/gap-3/);

    fireEvent.click(screen.getByRole('button', { name: /unrelated update/i }));
    fireEvent.click(screen.getByRole('button', { name: /switch to compact/i }));

    expect(viewport.className).toMatch(/gap-1\.5/);
  });
});
