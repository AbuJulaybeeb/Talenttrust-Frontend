import { act, render, screen, waitFor } from '@testing-library/react';
import ContractStatusAnnouncer from '../ContractStatusAnnouncer';
import { assertNoA11yViolations } from '@/test-utils/a11y';

describe('ContractStatusAnnouncer', () => {
  it('renders an empty polite live region on initial mount', () => {
    render(<ContractStatusAnnouncer status="Active" />);

    const liveRegion = screen.getByRole('status', { name: 'Contract status updates' });
    expect(liveRegion).toBeEmptyDOMElement();
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
  });

  it('announces a genuine status transition', async () => {
    const { rerender } = render(<ContractStatusAnnouncer status="Active" />);

    rerender(<ContractStatusAnnouncer status="Completed" />);

    await waitFor(() => {
      expect(
        screen.getByRole('status', { name: 'Contract status updates' }),
      ).toHaveTextContent('Contract status changed to Completed.');
    });
  });

  it('does not announce a same-status rerender', () => {
    const { rerender } = render(<ContractStatusAnnouncer status="Pending" />);

    rerender(<ContractStatusAnnouncer status="Pending" />);

    expect(
      screen.getByRole('status', { name: 'Contract status updates' }),
    ).toBeEmptyDOMElement();
  });

  it('settles on the latest status during rapid transitions', async () => {
    const { rerender } = render(<ContractStatusAnnouncer status="Active" />);

    act(() => {
      rerender(<ContractStatusAnnouncer status="Pending" />);
      rerender(<ContractStatusAnnouncer status="Disputed" />);
    });

    await waitFor(() => {
      const liveRegion = screen.getByRole('status', { name: 'Contract status updates' });
      expect(liveRegion).toHaveTextContent('Contract status changed to Disputed.');
      expect(liveRegion).not.toHaveTextContent('Pending');
    });
  });

  it('has no automated accessibility violations', async () => {
    const { container } = render(<ContractStatusAnnouncer status="Active" />);

    await assertNoA11yViolations(container);
  });
});
