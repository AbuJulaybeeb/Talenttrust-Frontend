import React, { createRef } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { assertNoA11yViolations } from '@/test-utils/a11y';
import BackToTop from '../BackToTop';

// jsdom doesn't implement scrollTo/rAF – provide deterministic mocks so we
// can assert on them and so the component doesn't throw "not implemented".
const flushRaf = () => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
};

beforeEach(() => {
  jest.useFakeTimers();
  window.requestAnimationFrame = (cb: (time: number) => void): number => {
    return setTimeout(() => cb(0), 0) as unknown as number;
  };
  window.cancelAnimationFrame = (id: number) => clearTimeout(id);
  window.scrollTo = jest.fn();
  Element.prototype.scrollTo = jest.fn();
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('BackToTop (window mode)', () => {
  it('is hidden on initial render when the page has not scrolled', () => {
    render(<BackToTop />);
    expect(screen.queryByRole('button', { name: 'Back to top' })).not.toBeInTheDocument();
  });

  it('never appears for a short page that cannot scroll past the threshold', () => {
    render(<BackToTop threshold={300} />);

    // Simulate a short list: scroll events fire but scrollY stays under
    // the threshold because there's nothing to scroll.
    Object.defineProperty(window, 'scrollY', { value: 50, configurable: true });
    fireEvent.scroll(window);
    flushRaf();

    expect(screen.queryByRole('button', { name: 'Back to top' })).not.toBeInTheDocument();
  });

  it('appears once scrolled past the threshold', () => {
    render(<BackToTop threshold={300} />);

    Object.defineProperty(window, 'scrollY', { value: 500, configurable: true });
    fireEvent.scroll(window);
    flushRaf();

    expect(screen.getByRole('button', { name: 'Back to top' })).toBeInTheDocument();
  });

  it('hides again once scrolled back near the top', () => {
    render(<BackToTop threshold={300} />);

    Object.defineProperty(window, 'scrollY', { value: 500, configurable: true });
    fireEvent.scroll(window);
    flushRaf();
    expect(screen.getByRole('button', { name: 'Back to top' })).toBeInTheDocument();

    Object.defineProperty(window, 'scrollY', { value: 10, configurable: true });
    fireEvent.scroll(window);
    flushRaf();
    expect(screen.queryByRole('button', { name: 'Back to top' })).not.toBeInTheDocument();
  });

  it('coalesces rapid scroll events into a single visibility check per frame', () => {
    render(<BackToTop threshold={300} />);

    Object.defineProperty(window, 'scrollY', { value: 500, configurable: true });
    // Fire a burst of scroll events, as happens on a fast trackpad/wheel scroll.
    for (let i = 0; i < 20; i += 1) {
      fireEvent.scroll(window);
    }

    // Only one rAF-scheduled check should be pending, regardless of how many
    // scroll events fired in the same frame.
    expect(jest.getTimerCount()).toBe(1);

    flushRaf();
    expect(screen.getByRole('button', { name: 'Back to top' })).toBeInTheDocument();
  });

  it('scrolls the window to top and moves focus to the given target on click', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const focusTargetRef = createRef<HTMLHeadingElement>();

    render(
      <>
        <h1 ref={focusTargetRef} tabIndex={-1}>
          Contracts
        </h1>
        <BackToTop threshold={300} focusTargetRef={focusTargetRef} />
      </>,
    );

    Object.defineProperty(window, 'scrollY', { value: 500, configurable: true });
    fireEvent.scroll(window);
    flushRaf();

    const button = screen.getByRole('button', { name: 'Back to top' });
    await user.click(button);

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    expect(focusTargetRef.current).toHaveFocus();
  });

  it('is operable from the keyboard (Enter and Space activate it)', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const focusTargetRef = createRef<HTMLHeadingElement>();

    render(
      <>
        <h1 ref={focusTargetRef} tabIndex={-1}>
          Contracts
        </h1>
        <BackToTop threshold={300} focusTargetRef={focusTargetRef} />
      </>,
    );

    Object.defineProperty(window, 'scrollY', { value: 500, configurable: true });
    fireEvent.scroll(window);
    flushRaf();

    const button = screen.getByRole('button', { name: 'Back to top' });
    button.focus();
    expect(button).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(focusTargetRef.current).toHaveFocus();

    // Re-show the button to test Space as well.
    focusTargetRef.current?.blur();
    Object.defineProperty(window, 'scrollY', { value: 500, configurable: true });
    fireEvent.scroll(window);
    flushRaf();
    const buttonAgain = screen.getByRole('button', { name: 'Back to top' });
    buttonAgain.focus();

    await user.keyboard(' ');
    expect(window.scrollTo).toHaveBeenCalledTimes(2);
    expect(focusTargetRef.current).toHaveFocus();
  });

  it('falls back to no-op focus when no focus target is provided in window mode', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<BackToTop threshold={300} />);

    Object.defineProperty(window, 'scrollY', { value: 500, configurable: true });
    fireEvent.scroll(window);
    flushRaf();

    const button = screen.getByRole('button', { name: 'Back to top' });
    await expect(user.click(button)).resolves.not.toThrow();
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('cleans up its scroll listener and any pending frame on unmount', () => {
    const removeSpy = jest.spyOn(window, 'removeEventListener');
    const { unmount } = render(<BackToTop threshold={300} />);

    Object.defineProperty(window, 'scrollY', { value: 500, configurable: true });
    fireEvent.scroll(window);
    // Unmount before the scheduled rAF check flushes.
    unmount();

    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    // Flushing after unmount should not throw even though a frame was pending.
    expect(() => flushRaf()).not.toThrow();
  });

  it('respects a custom label', () => {
    render(<BackToTop threshold={300} label="Top of milestones" />);

    Object.defineProperty(window, 'scrollY', { value: 500, configurable: true });
    fireEvent.scroll(window);
    flushRaf();

    expect(screen.getByRole('button', { name: 'Top of milestones' })).toBeInTheDocument();
  });

  it('has no detectable accessibility violations when visible', async () => {
    // axe's internal async work doesn't play well with fake timers, so use
    // real ones for just this assertion.
    jest.useRealTimers();
    const { container } = render(<BackToTop threshold={300} />);

    Object.defineProperty(window, 'scrollY', { value: 500, configurable: true });
    fireEvent.scroll(window);
    await act(async () => {
      await new Promise((resolve) => window.requestAnimationFrame(resolve));
    });

    await assertNoA11yViolations(container);
  });
});

describe('BackToTop (container mode)', () => {
  const ContainerHarness = ({ threshold = 300 }: { threshold?: number }) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    return (
      <div ref={containerRef} tabIndex={0} data-testid="scroll-container" style={{ overflowY: 'auto' }}>
        <BackToTop containerRef={containerRef} threshold={threshold} />
      </div>
    );
  };

  it('tracks the container scrollTop instead of the window', () => {
    render(<ContainerHarness threshold={300} />);
    const container = screen.getByTestId('scroll-container');

    Object.defineProperty(container, 'scrollTop', { value: 500, configurable: true });
    fireEvent.scroll(container);
    flushRaf();

    expect(screen.getByRole('button', { name: 'Back to top' })).toBeInTheDocument();
  });

  it('never appears for a short container that never scrolls', () => {
    render(<ContainerHarness threshold={300} />);
    const container = screen.getByTestId('scroll-container');

    // scrollTop stays at 0 because content is shorter than the container.
    fireEvent.scroll(container);
    flushRaf();

    expect(screen.queryByRole('button', { name: 'Back to top' })).not.toBeInTheDocument();
  });

  it('scrolls the container (not the window) and focuses it by default on activate', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<ContainerHarness threshold={300} />);
    const container = screen.getByTestId('scroll-container');

    Object.defineProperty(container, 'scrollTop', { value: 500, configurable: true });
    fireEvent.scroll(container);
    flushRaf();

    const button = screen.getByRole('button', { name: 'Back to top' });
    await user.click(button);

    expect(container.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(container).toHaveFocus();
  });
});