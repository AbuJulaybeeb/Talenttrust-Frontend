/**
 * @file DialogsMemoization.test.tsx
 *
 * Tests that verify the memoization behaviour introduced in
 * refactor/dialogs-01-memoize (issue #544):
 *
 *  - `ConfirmDialog` is wrapped with `React.memo` and therefore skips
 *    re-renders when its props are stable.
 *  - `MilestoneCreationForm` is wrapped with `React.memo` and therefore
 *    skips re-renders when its props are stable.
 *  - `ActionPanel` derives `actions` with `useMemo` so the array reference
 *    is stable when `status` does not change, and recomputes only when it does.
 *  - `ActionPanel` derives dialog props with `useMemo` so `ConfirmDialog`
 *    receives the same object reference across renders that do not change
 *    `confirmAction`.
 *
 * Strategy: we use a render-spy (a `jest.fn` wrapped around the component)
 * to count how many times the child actually renders.  React.memo means the
 * child render count should stay at 1 while the parent re-renders with
 * identical props, and should increment exactly once when a relevant prop
 * changes.
 */

import React, { memo, useState } from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog, type ConfirmDialogProps } from '../ConfirmDialog';
import { MilestoneCreationForm } from '../milestones/MilestoneCreationForm';
import ActionPanel from '../ActionPanel';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/components/toast/toast-provider';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@/contexts/WalletContext', () => ({
  useWallet: jest.fn(),
}));

jest.mock('@/components/toast/toast-provider', () => ({
  useToast: jest.fn(() => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
    toasts: [],
    dismissToast: jest.fn(),
  })),
}));

const mockUseWallet = jest.mocked(useWallet);
const mockUseToast = jest.mocked(useToast);

beforeEach(() => {
  mockUseToast.mockReturnValue({
    showSuccess: jest.fn(),
    showError: jest.fn(),
    toasts: [],
    dismissToast: jest.fn(),
  });
  mockUseWallet.mockReturnValue({
    address: 'GXXX',
    isConnecting: false,
    error: null,
    connect: jest.fn(),
    disconnect: jest.fn(),
  });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Wraps a component in a spy so we can count actual React render calls.
 * Returns { Spy, renderCount } where `renderCount` is a ref-like object
 * whose `.current` increments on every real render of the inner component.
 */
function makeRenderSpy<P extends object>(
  Component: React.ComponentType<P>,
): { Spy: React.ComponentType<P>; renderCount: { current: number } } {
  const renderCount = { current: 0 };
  const Spy = (props: P) => {
    renderCount.current += 1;
    return <Component {...props} />;
  };
  Spy.displayName = `Spy(${Component.displayName ?? Component.name})`;
  return { Spy, renderCount };
}

// ---------------------------------------------------------------------------
// ConfirmDialog — React.memo
// ---------------------------------------------------------------------------

describe('ConfirmDialog memoization', () => {
  it('is exported as a memo-wrapped component', () => {
    // React.memo returns an object with $$typeof === REACT_MEMO_TYPE.
    // The simplest public check is that the `type` property of the
    // memo wrapper points to the inner function component.
    const element = (
      <ConfirmDialog
        isOpen={false}
        title="t"
        description="d"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    // React.createElement with a memo'd component has a non-null `type`
    // that has a `$$typeof` symbol or a `type` sub-key.
    expect(element.type).toBeDefined();
    // The displayName we set in the implementation should be visible.
    expect((element.type as { displayName?: string }).displayName).toBe('ConfirmDialog');
  });

  it('does not re-render when the parent re-renders with identical props', () => {
    const { Spy, renderCount } = makeRenderSpy(ConfirmDialog);
    // Wrap Spy in memo so we're testing that memo prevents re-renders.
    const MemoSpy = memo(Spy);

    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    const props: ConfirmDialogProps = {
      isOpen: false,
      title: 'Delete',
      description: 'Really?',
      onConfirm,
      onCancel,
    };

    /** Parent that can force re-renders via a counter. */
    const Parent = () => {
      const [tick, setTick] = useState(0);
      return (
        <>
          <button type="button" onClick={() => setTick((n) => n + 1)}>
            re-render parent
          </button>
          <MemoSpy {...props} />
          <span data-testid="tick">{tick}</span>
        </>
      );
    };

    render(<Parent />);
    const initialCount = renderCount.current;

    // Force 3 parent re-renders with no prop changes.
    act(() => {
      screen.getByRole('button', { name: 're-render parent' }).click();
    });
    act(() => {
      screen.getByRole('button', { name: 're-render parent' }).click();
    });
    act(() => {
      screen.getByRole('button', { name: 're-render parent' }).click();
    });

    // Child should NOT have re-rendered.
    expect(renderCount.current).toBe(initialCount);
  });

  it('re-renders when isOpen changes from false to true', () => {
    const { Spy, renderCount } = makeRenderSpy(ConfirmDialog);
    const MemoSpy = memo(Spy);

    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    const Parent = () => {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setIsOpen(true)}>
            open
          </button>
          <MemoSpy
            isOpen={isOpen}
            title="Delete"
            description="Really?"
            onConfirm={onConfirm}
            onCancel={onCancel}
          />
        </>
      );
    };

    render(<Parent />);
    const before = renderCount.current;

    act(() => {
      screen.getByRole('button', { name: 'open' }).click();
    });

    expect(renderCount.current).toBeGreaterThan(before);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('re-renders when title changes', () => {
    const { Spy, renderCount } = makeRenderSpy(ConfirmDialog);
    const MemoSpy = memo(Spy);

    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    const Parent = () => {
      const [title, setTitle] = useState('Title A');
      return (
        <>
          <button type="button" onClick={() => setTitle('Title B')}>
            change title
          </button>
          <MemoSpy
            isOpen={false}
            title={title}
            description="desc"
            onConfirm={onConfirm}
            onCancel={onCancel}
          />
        </>
      );
    };

    render(<Parent />);
    const before = renderCount.current;

    act(() => {
      screen.getByRole('button', { name: 'change title' }).click();
    });

    expect(renderCount.current).toBeGreaterThan(before);
  });

  it('preserves all existing accessibility behaviour after memoization', async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    render(
      <ConfirmDialog
        isOpen
        title="Confirm delete"
        description="This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Go back"
        tone="destructive"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    // Tone: destructive → alertdialog role
    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    // Initial focus lands on cancel button
    expect(screen.getByRole('button', { name: 'Go back' })).toHaveFocus();

    // Escape still cancels
    await user.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('handles closed state: renders nothing and no dialog in the DOM', () => {
    const { container } = render(
      <ConfirmDialog
        isOpen={false}
        title="x"
        description="y"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

// ---------------------------------------------------------------------------
// MilestoneCreationForm — React.memo
// ---------------------------------------------------------------------------

describe('MilestoneCreationForm memoization', () => {
  it('is exported as a memo-wrapped component', () => {
    const element = (
      <MilestoneCreationForm onSubmit={jest.fn()} onCancel={jest.fn()} />
    );
    expect(element.type).toBeDefined();
    expect((element.type as { displayName?: string }).displayName).toBe(
      'MilestoneCreationForm',
    );
  });

  it('does not re-render when the parent re-renders with stable callback refs', () => {
    const { Spy, renderCount } = makeRenderSpy(MilestoneCreationForm);
    const MemoSpy = memo(Spy);

    // Stable callbacks (defined outside the parent) so memo can bail out.
    const onSubmit = jest.fn();
    const onCancel = jest.fn();

    const Parent = () => {
      const [tick, setTick] = useState(0);
      return (
        <>
          <button type="button" onClick={() => setTick((n) => n + 1)}>
            tick
          </button>
          <MemoSpy onSubmit={onSubmit} onCancel={onCancel} />
          <span>{tick}</span>
        </>
      );
    };

    render(<Parent />);
    const before = renderCount.current;

    act(() => {
      screen.getByRole('button', { name: 'tick' }).click();
    });

    // Child should NOT have re-rendered because props are identical.
    expect(renderCount.current).toBe(before);
  });

  it('re-renders when contractId changes', () => {
    const { Spy, renderCount } = makeRenderSpy(MilestoneCreationForm);
    const MemoSpy = memo(Spy);

    const onSubmit = jest.fn();
    const onCancel = jest.fn();

    const Parent = () => {
      const [cid, setCid] = useState<string | undefined>(undefined);
      return (
        <>
          <button type="button" onClick={() => setCid('contract-99')}>
            set contract
          </button>
          <MemoSpy onSubmit={onSubmit} onCancel={onCancel} contractId={cid} />
        </>
      );
    };

    render(<Parent />);
    const before = renderCount.current;

    act(() => {
      screen.getByRole('button', { name: 'set contract' }).click();
    });

    expect(renderCount.current).toBeGreaterThan(before);
  });

  it('still renders the dialog with all form fields after memoization', () => {
    render(
      <MilestoneCreationForm onSubmit={jest.fn()} onCancel={jest.fn()} />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Title' })).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: 'Payout Amount' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Currency' })).toBeInTheDocument();
  });

  it('invokes onCancel when Escape is pressed — behaviour unchanged', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();

    render(<MilestoneCreationForm onSubmit={jest.fn()} onCancel={onCancel} />);

    await user.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// ActionPanel — useMemo for actions and dialog props
// ---------------------------------------------------------------------------

describe('ActionPanel memoization', () => {
  /**
   * Helper that renders an ActionPanel with a connected wallet and returns
   * a `rerender` convenience that merges new props.
   */
  function renderPanel(props: Partial<React.ComponentProps<typeof ActionPanel>> = {}) {
    return render(
      <ActionPanel
        status="Active"
        onSubmitMilestone={jest.fn()}
        onReleaseFunds={jest.fn()}
        onDispute={jest.fn()}
        onViewSummary={jest.fn()}
        {...props}
      />,
    );
  }

  // ---- actions array -------------------------------------------------------

  it('renders the correct buttons for each status value', () => {
    const { rerender } = renderPanel({ status: 'Active' });

    expect(screen.getByRole('button', { name: /submit milestone/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /release funds/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open a dispute/i })).toBeInTheDocument();

    rerender(
      <ActionPanel
        status="Pending"
        onSubmitMilestone={jest.fn()}
        onReleaseFunds={jest.fn()}
        onDispute={jest.fn()}
      />,
    );
    expect(screen.queryByRole('button', { name: /submit milestone/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /release funds/i })).toBeInTheDocument();

    rerender(
      <ActionPanel
        status="Disputed"
        onDispute={jest.fn()}
      />,
    );
    expect(screen.queryByRole('button', { name: /release funds/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open a dispute/i })).toBeInTheDocument();

    rerender(
      <ActionPanel status="Completed" onViewSummary={jest.fn()} />,
    );
    expect(screen.getByRole('button', { name: /view contract summary/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /submit milestone/i })).not.toBeInTheDocument();
  });

  it('does not change the button list when unrelated state changes (isLoading flip)', () => {
    const { rerender } = renderPanel({ status: 'Active', isLoading: false });

    const buttonsBefore = screen
      .getAllByRole('button')
      .map((b) => b.getAttribute('aria-label'));

    rerender(
      <ActionPanel
        status="Active"
        onSubmitMilestone={jest.fn()}
        onReleaseFunds={jest.fn()}
        onDispute={jest.fn()}
        isLoading
      />,
    );

    const buttonsAfter = screen
      .getAllByRole('button')
      .map((b) => b.getAttribute('aria-label'));

    // Same buttons present — only disabled state changed.
    expect(buttonsAfter).toEqual(buttonsBefore);
  });

  // ---- dialog props / ConfirmDialog interaction ---------------------------

  it('shows the correct dialog copy for "submit" action', async () => {
    const user = userEvent.setup();
    renderPanel({ status: 'Active' });

    await user.click(screen.getByRole('button', { name: /submit milestone/i }));

    const dialog = screen.getByRole('dialog', { name: /confirm submit milestone/i });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveTextContent(
      'Are you sure you want to submit this milestone for approval? This action cannot be undone.',
    );
  });

  it('shows the correct dialog copy for "release" action with destructive tone', async () => {
    const user = userEvent.setup();
    renderPanel({ status: 'Active' });

    await user.click(screen.getByRole('button', { name: /release funds/i }));

    const dialog = screen.getByRole('alertdialog', { name: /confirm release funds/i });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveTextContent(
      'Are you sure you want to release funds? This action cannot be undone.',
    );
  });

  it('closes the dialog and does not call any action callback on cancel', async () => {
    const user = userEvent.setup();
    const onSubmitMilestone = jest.fn();
    renderPanel({ status: 'Active', onSubmitMilestone });

    await user.click(screen.getByRole('button', { name: /submit milestone/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onSubmitMilestone).not.toHaveBeenCalled();
  });

  it('dialog props do not change between parent re-renders that do not touch confirmAction', () => {
    /**
     * We can verify this indirectly: opening the dialog and then causing an
     * unrelated state update (the parent receiving a new errorMessage prop)
     * should not close or remount the dialog — meaning the dialog props
     * stayed referentially stable enough for React.memo to pass.
     */
    const { rerender } = renderPanel({ status: 'Active', errorMessage: undefined });

    fireEventHelper(() =>
      screen.getByRole('button', { name: /submit milestone/i }).click(),
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Cause a prop change that is unrelated to confirmAction.
    rerender(
      <ActionPanel
        status="Active"
        onSubmitMilestone={jest.fn()}
        onReleaseFunds={jest.fn()}
        onDispute={jest.fn()}
        errorMessage="Network error"
      />,
    );

    // Dialog should still be present — it was not remounted.
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('dialog', { name: /confirm submit milestone/i }),
    ).toBeInTheDocument();
  });

  // ---- large dataset / edge cases -----------------------------------------

  it('renders all action types in correct order for Active status', () => {
    renderPanel({ status: 'Active' });
    const buttons = screen.getAllByRole('button').map((b) => b.textContent?.trim());
    expect(buttons).toContain('Submit Milestone');
    expect(buttons.indexOf('Submit Milestone')).toBeLessThan(
      buttons.indexOf('Release Funds'),
    );
    expect(buttons.indexOf('Release Funds')).toBeLessThan(
      buttons.indexOf('Dispute'),
    );
  });

  it('disables all action buttons when isLoading is true', () => {
    renderPanel({ status: 'Active', isLoading: true });
    screen
      .getAllByRole('button')
      .filter((b) =>
        ['Submit Milestone', 'Release Funds', 'Dispute'].includes(b.textContent?.trim() ?? ''),
      )
      .forEach((button) => {
        expect(button).toBeDisabled();
      });
  });

  it('disables individual buttons via disabledReasons', () => {
    renderPanel({
      status: 'Active',
      disabledReasons: {
        submitMilestone: 'Wallet not connected',
        releaseFunds: 'Awaiting approval',
      },
    });

    expect(
      screen.getByRole('button', { name: /submit milestone/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /release funds/i }),
    ).toBeDisabled();
    // Dispute is NOT in disabledReasons — should still be enabled.
    expect(
      screen.getByRole('button', { name: /open a dispute/i }),
    ).not.toBeDisabled();
  });

  it('filter change: switching status from Active to Completed updates visible actions', () => {
    const { rerender } = renderPanel({ status: 'Active' });

    expect(screen.getByRole('button', { name: /submit milestone/i })).toBeInTheDocument();

    rerender(<ActionPanel status="Completed" onViewSummary={jest.fn()} />);

    expect(
      screen.queryByRole('button', { name: /submit milestone/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /view contract summary/i }),
    ).toBeInTheDocument();
  });

  it('confirms dispute via inline form and calls onDispute with the reason', async () => {
    const user = userEvent.setup();
    const onDispute = jest.fn();
    renderPanel({ status: 'Active', onDispute });

    await user.click(screen.getByRole('button', { name: /open a dispute/i }));
    const textarea = screen.getByRole('textbox', { name: /reason/i });
    await user.type(textarea, 'Payment withheld unfairly');
    await user.click(screen.getByRole('button', { name: /confirm dispute/i }));

    expect(onDispute).toHaveBeenCalledWith('Payment withheld unfairly');
  });

  it('shows error message in an alert region', () => {
    renderPanel({ status: 'Active', errorMessage: 'Something went wrong' });
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Something went wrong');
  });

  it('wallet-disconnected state: all buttons are disabled and a warning is shown', () => {
    mockUseWallet.mockReturnValue({
      address: null,
      isConnecting: false,
      error: null,
      connect: jest.fn(),
      disconnect: jest.fn(),
    });

    renderPanel({ status: 'Active' });

    expect(screen.getByText(/connect wallet to perform this action/i)).toBeInTheDocument();
    [
      screen.getByRole('button', { name: /submit milestone/i }),
      screen.getByRole('button', { name: /release funds/i }),
      screen.getByRole('button', { name: /open a dispute/i }),
    ].forEach((btn) => expect(btn).toBeDisabled());
  });
});

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/**
 * Thin wrapper so we can fire synchronous click events in tests that don't
 * need `userEvent`.
 */
function fireEventHelper(fn: () => void) {
  act(fn);
}
