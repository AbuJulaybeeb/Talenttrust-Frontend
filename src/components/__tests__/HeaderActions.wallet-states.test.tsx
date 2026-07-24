/**
 * @file HeaderActions.wallet-states.test.tsx
 *
 * HeaderActions.test.tsx stubs WalletConnectButton with a static placeholder,
 * which proves the disclosure toggle/panel mechanics but can't show that the
 * real connected-state markup (address pill + copy + disconnect buttons)
 * actually fits inside the disclosure without breaking it. This file renders
 * the real WalletConnectButton against a mocked WalletContext for both the
 * connected and disconnected cases.
 *
 * Also covers the "no horizontal overflow at 320px" requirement the way a
 * jsdom test actually can: jsdom has no layout engine, so it cannot measure
 * rendered pixel widths. What it CAN verify is that the responsive contract
 * itself is in place — the disclosure toggle carries `sm:hidden` and the
 * panel carries `sm:block`, which is what prevents the connected-state pill
 * from ever sharing a row with the brand/nav on a 320px viewport.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import HeaderActions from '../HeaderActions';
import { WalletContextType, useWallet } from '@/contexts/WalletContext';

expect.extend(toHaveNoViolations);

jest.mock('@/contexts/WalletContext', () => ({
  useWallet: jest.fn(),
}));

jest.mock('@/components/toast/toast-provider', () => ({
  useToast: jest.fn(() => ({ showError: jest.fn() })),
}));

jest.mock('@/components/ThemeToggle', () => ({
  ThemeToggle: () => <button type="button">Theme</button>,
}));

const mockUseWallet = useWallet as jest.MockedFunction<typeof useWallet>;

function walletState(overrides: Partial<WalletContextType> = {}): WalletContextType {
  return {
    address: null,
    isConnecting: false,
    error: null,
    connect: jest.fn(),
    disconnect: jest.fn(),
    ...overrides,
  };
}

describe('HeaderActions with the real WalletConnectButton — disconnected wallet', () => {
  beforeEach(() => {
    mockUseWallet.mockReturnValue(walletState());
  });

  it('renders the Connect Wallet button inside the disclosure panel', () => {
    render(<HeaderActions />);
    expect(screen.getByRole('button', { name: /^connect wallet$/i })).toBeInTheDocument();
  });

  it('keeps the toggle and panel working normally', async () => {
    const user = userEvent.setup();
    render(<HeaderActions />);

    const toggle = screen.getByRole('button', { name: /open wallet actions/i });
    await user.click(toggle);

    expect(screen.getByRole('button', { name: /close wallet actions/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('region', { name: /wallet actions/i })).not.toHaveClass('hidden');
  });

  it('has no axe violations when expanded', async () => {
    const user = userEvent.setup();
    const { container } = render(<HeaderActions />);
    await user.click(screen.getByRole('button', { name: /open wallet actions/i }));

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('HeaderActions with the real WalletConnectButton — connected wallet', () => {
  beforeEach(() => {
    mockUseWallet.mockReturnValue(
      walletState({ address: 'GABCDE1234FGHIJ5678KLMNO9012PQRST3456UVWX' }),
    );
  });

  it('renders the address pill, copy button, and disconnect button inside the disclosure panel', () => {
    render(<HeaderActions />);

    expect(screen.getByRole('button', { name: /copy address to clipboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /disconnect wallet/i })).toBeInTheDocument();
    // The connected pill is present in the DOM even while the panel is
    // collapsed (display:none via the "hidden" class) — it isn't remounted
    // when the disclosure toggles, so wallet state is preserved.
    expect(screen.getByRole('region', { name: /wallet actions/i })).toHaveClass('hidden');
  });

  it('the connected-state markup remains present after opening and closing the disclosure', async () => {
    const user = userEvent.setup();
    render(<HeaderActions />);

    const toggle = screen.getByRole('button', { name: /open wallet actions/i });
    await user.click(toggle);
    expect(screen.getByRole('button', { name: /disconnect wallet/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /close wallet actions/i }));
    expect(screen.getByRole('button', { name: /disconnect wallet/i })).toBeInTheDocument();
  });

  it('has no axe violations with a connected wallet in either disclosure state', async () => {
    const user = userEvent.setup();
    const { container } = render(<HeaderActions />);

    expect(await axe(container)).toHaveNoViolations();

    await user.click(screen.getByRole('button', { name: /open wallet actions/i }));
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('HeaderActions — narrow-viewport responsive contract', () => {
  beforeEach(() => {
    mockUseWallet.mockReturnValue(walletState());
  });

  // jsdom has no layout engine, so "no horizontal overflow at 320px" can't be
  // measured directly here — that's a manual/visual-regression concern. What
  // this test confirms is the CSS contract that makes it true: the toggle is
  // only ever visible below the `sm` breakpoint, and the panel is only ever
  // visible inline at `sm` and above, so the connected-state pill (with its
  // copy/disconnect icons) never shares a row with the brand and nav links
  // on a viewport narrower than `sm`.
  it('the disclosure toggle is hidden at sm and above (sm:hidden)', () => {
    render(<HeaderActions />);
    const toggle = screen.getByRole('button', { name: /open wallet actions/i });
    expect(toggle.className).toContain('sm:hidden');
  });

  it('the wallet-actions panel is always visible at sm and above (sm:block)', () => {
    render(<HeaderActions />);
    const panel = screen.getByRole('region', { name: /wallet actions/i });
    expect(panel.className).toContain('sm:block');
  });
});
