import { act, render, screen, waitFor } from '@testing-library/react';
import DialogAnnouncer from '../DialogAnnouncer';
import { assertNoA11yViolations } from '@/test-utils/a11y';

describe('DialogAnnouncer', () => {
  it('renders empty on initial mount', () => {
    render(<DialogAnnouncer count={0} />);
    const region = screen.getByRole('status');
    expect(region).toBeEmptyDOMElement();
  });

  it('has correct aria attributes', () => {
    render(<DialogAnnouncer count={0} />);
    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveAttribute('aria-atomic', 'true');
    expect(region).toHaveAttribute('class', 'sr-only');
  });

  it('announces a count change', async () => {
    const { rerender } = render(<DialogAnnouncer count={0} />);

    rerender(<DialogAnnouncer count={3} />);

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('3 items');
    });
  });

  it('announces a status change', async () => {
    const { rerender } = render(<DialogAnnouncer status="closed" />);

    rerender(<DialogAnnouncer status="open" />);

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('open');
    });
  });

  it('does not announce a same-count rerender', () => {
    const { rerender } = render(<DialogAnnouncer count={5} />);

    rerender(<DialogAnnouncer count={5} />);

    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('does not announce a same-status rerender', () => {
    const { rerender } = render(<DialogAnnouncer status="pending" />);

    rerender(<DialogAnnouncer status="pending" />);

    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('does not announce on mount even when count is provided', () => {
    render(<DialogAnnouncer count={42} />);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('does not announce on mount even when status is provided', () => {
    render(<DialogAnnouncer status="open" />);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('settles on the latest count during rapid updates', async () => {
    const { rerender } = render(<DialogAnnouncer count={0} />);

    act(() => {
      rerender(<DialogAnnouncer count={1} />);
      rerender(<DialogAnnouncer count={2} />);
      rerender(<DialogAnnouncer count={5} />);
    });

    await waitFor(() => {
      const region = screen.getByRole('status');
      expect(region).toHaveTextContent('5 items');
      expect(region).not.toHaveTextContent('1 items');
      expect(region).not.toHaveTextContent('2 items');
    });
  });

  it('settles on the latest status during rapid updates', async () => {
    const { rerender } = render(<DialogAnnouncer status="closed" />);

    act(() => {
      rerender(<DialogAnnouncer status="editing" />);
      rerender(<DialogAnnouncer status="saving" />);
      rerender(<DialogAnnouncer status="submitted" />);
    });

    await waitFor(() => {
      const region = screen.getByRole('status');
      expect(region).toHaveTextContent('submitted');
      expect(region).not.toHaveTextContent('editing');
      expect(region).not.toHaveTextContent('saving');
    });
  });

  it('announces zero count', async () => {
    const { rerender } = render(<DialogAnnouncer count={5} />);

    rerender(<DialogAnnouncer count={0} />);

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('0 items');
    });
  });

  it('uses a custom label for count announcements', async () => {
    const { rerender } = render(<DialogAnnouncer count={0} label="errors" />);

    rerender(<DialogAnnouncer count={2} label="errors" />);

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('2 errors');
    });
  });

  it('respects a custom debounce delay', async () => {
    const { rerender } = render(
      <DialogAnnouncer count={0} debounceMs={500} />,
    );

    rerender(<DialogAnnouncer count={1} debounceMs={500} />);

    await waitFor(
      () => {
        expect(screen.getByRole('status')).toHaveTextContent('1 items');
      },
      { timeout: 800 },
    );
  });

  it('cancels pending announcement when value reverts to original', async () => {
    const { rerender } = render(<DialogAnnouncer count={5} />);

    act(() => {
      rerender(<DialogAnnouncer count={10} />);
      rerender(<DialogAnnouncer count={5} />);
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 500));
    });

    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('uses count change when both count and status change', async () => {
    const { rerender } = render(
      <DialogAnnouncer count={0} status="closed" />,
    );

    rerender(<DialogAnnouncer count={3} status="open" />);

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('3 items');
      expect(screen.getByRole('status')).not.toHaveTextContent('open');
    });
  });

  it('has no automated accessibility violations', async () => {
    const { container } = render(<DialogAnnouncer count={0} />);
    await assertNoA11yViolations(container);
  });
});
