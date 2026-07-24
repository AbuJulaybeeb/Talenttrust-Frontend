import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { WalletConnectButton } from '../WalletConnectButton';
import { WalletContextType, useWallet } from '@/contexts/WalletContext';
import * as truncateAddressModule from '@/lib/truncateAddress';
import { testA11y } from '@/test-utils/a11y';

jest.mock('@/contexts/WalletContext', () => ({
  useWallet: jest.fn(),
}));

const mockShowError = jest.fn();
jest.mock('@/components/toast/toast-provider', () => ({
  useToast: jest.fn(() => ({ showError: mockShowError })),
}));

const mockUseWallet = useWallet as jest.MockedFunction<typeof useWallet>;

const COPY_ICON_PATH = 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z';
const COPIED_ICON_PATH = 'M5 13l4 4L19 7';

const originalClipboard = navigator.clipboard;

function createWalletState(overrides: Partial<WalletContextType> = {}): WalletContextType {
  return {
    address: null,
    isConnecting: false,
    error: null,
    connect: jest.fn(),
    disconnect: jest.fn(),
    ...overrides,
  };
}

function installClipboardMock() {
  const writeText = jest.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
  return writeText;
}

function getButtonIconPath(button: HTMLElement) {
  return button.querySelector('path')?.getAttribute('d');
}

describe('WalletConnectButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: originalClipboard,
    });
  });

  it('renders the disconnected branch and calls connect when clicked', async () => {
    const connect = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    mockUseWallet.mockReturnValue(createWalletState({ connect }));

    render(<WalletConnectButton />);

    const connectButton = screen.getByRole('button', { name: 'Connect wallet' });
    expect(connectButton).toBeEnabled();
    expect(connectButton).toHaveTextContent('Connect Wallet');
    expect(screen.queryByRole('button', { name: 'Copy address to clipboard' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Disconnect wallet' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry wallet connection' })).not.toBeInTheDocument();

    await user.click(connectButton);

    expect(connect).toHaveBeenCalledTimes(1);
  });

  it('renders the connecting branch with a disabled button and spinner', () => {
    mockUseWallet.mockReturnValue(createWalletState({ isConnecting: true }));

    render(<WalletConnectButton />);

    const connectButton = screen.getByRole('button', { name: 'Connect wallet' });
    expect(connectButton).toBeDisabled();
    expect(connectButton).toHaveTextContent('Connecting...');
    expect(connectButton.querySelector('svg.animate-spin')).toBeInTheDocument();
    expect(screen.queryByText(/connection error/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Disconnect wallet' })).not.toBeInTheDocument();
  });

  it('renders the error branch and retries the connection', async () => {
    const connect = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    mockUseWallet.mockReturnValue(createWalletState({
      error: 'Connection failed',
      connect,
    }));

    render(<WalletConnectButton />);

    expect(screen.getByText('Connection Error')).toBeInTheDocument();
    const retryButton = screen.getByRole('button', { name: 'Retry wallet connection' });
    expect(retryButton).toHaveTextContent('Retry');
    expect(screen.queryByRole('button', { name: 'Connect wallet' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Disconnect wallet' })).not.toBeInTheDocument();

    await user.click(retryButton);

    expect(connect).toHaveBeenCalledTimes(1);
  });

  it('renders the connected branch using truncateAddress and exposes copy and disconnect controls', () => {
    const address = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
    const truncateAddressSpy = jest.spyOn(truncateAddressModule, 'truncateAddress')
      .mockReturnValue('0x71C7...976F');

    mockUseWallet.mockReturnValue(createWalletState({ address }));
    installClipboardMock();

    render(<WalletConnectButton />);

    expect(truncateAddressSpy).toHaveBeenCalledWith(address);
    expect(screen.getByText('0x71C7...976F')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy address to clipboard' })).toHaveAttribute('title', 'Copy address');
    expect(screen.getByRole('button', { name: 'Disconnect wallet' })).toHaveAttribute('title', 'Disconnect wallet');
    expect(screen.queryByRole('button', { name: 'Connect wallet' })).not.toBeInTheDocument();
  });

  it('copies the full address, swaps to the success icon, and resets after 2 seconds', async () => {
    const address = '0xABCDEF1234567890';
    const writeText = installClipboardMock();

    mockUseWallet.mockReturnValue(createWalletState({ address }));

    render(<WalletConnectButton />);

    const copyButton = screen.getByRole('button', { name: 'Copy address to clipboard' });
    expect(getButtonIconPath(copyButton)).toBe(COPY_ICON_PATH);

    await act(async () => {
      fireEvent.click(copyButton);
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(writeText).toHaveBeenCalledWith(address);
    expect(mockShowError).not.toHaveBeenCalled();
    expect(
      getButtonIconPath(screen.getByRole('button', { name: 'Copy address to clipboard' })),
    ).toBe(COPIED_ICON_PATH);

    act(() => {
      jest.advanceTimersByTime(1999);
    });
    expect(
      getButtonIconPath(screen.getByRole('button', { name: 'Copy address to clipboard' })),
    ).toBe(COPIED_ICON_PATH);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(
      getButtonIconPath(screen.getByRole('button', { name: 'Copy address to clipboard' })),
    ).toBe(COPY_ICON_PATH);
  });

  it('calls disconnect from the connected branch', async () => {
    const disconnect = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    mockUseWallet.mockReturnValue(createWalletState({
      address: '0x1234567890abcdef1234567890abcdef12345678',
      disconnect,
    }));
    installClipboardMock();

    render(<WalletConnectButton />);

    await user.click(screen.getByRole('button', { name: 'Disconnect wallet' }));

    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('handles clipboard write failure gracefully', async () => {
    const address = '0xABCDEF1234567890';
    const writeText = jest.fn().mockRejectedValue(new Error('Write failed'));

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    mockUseWallet.mockReturnValue(createWalletState({ address }));

    render(<WalletConnectButton />);

    const copyButton = screen.getByRole('button', { name: 'Copy address to clipboard' });
    expect(getButtonIconPath(copyButton)).toBe(COPY_ICON_PATH);

    await act(async () => {
      fireEvent.click(copyButton);
    });
    await act(async () => {
      await Promise.resolve();
    });

    // Verify that the error toast was shown
    expect(mockShowError).toHaveBeenCalledWith({
      title: 'Copy failed',
      description: 'Unable to copy the address to your clipboard. Please try again.',
    });

    // Icon should remain as copy (not change to checkmark)
    expect(getButtonIconPath(copyButton)).toBe(COPY_ICON_PATH);
  });

  it('handles missing clipboard API gracefully', async () => {
    const address = '0xABCDEF1234567890';

    // Simulate missing clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });

    mockUseWallet.mockReturnValue(createWalletState({ address }));

    render(<WalletConnectButton />);

    const copyButton = screen.getByRole('button', { name: 'Copy address to clipboard' });

    await act(async () => {
      fireEvent.click(copyButton);
    });
    await act(async () => {
      await Promise.resolve();
    });

    // Verify that the appropriate error toast was shown
    expect(mockShowError).toHaveBeenCalledWith({
      title: 'Copy not supported',
      description: 'Your browser does not support clipboard access. Please copy the address manually.',
    });

    // Icon should remain as copy (not change to checkmark)
    expect(getButtonIconPath(copyButton)).toBe(COPY_ICON_PATH);
  });

  it('handles rapid consecutive copy clicks and only shows final success/error', async () => {
    const address = '0xABCDEF1234567890';
    const writeText = jest.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    mockUseWallet.mockReturnValue(createWalletState({ address }));

    render(<WalletConnectButton />);

    const copyButton = screen.getByRole('button', { name: 'Copy address to clipboard' });

    // First click
    await act(async () => {
      fireEvent.click(copyButton);
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(getButtonIconPath(copyButton)).toBe(COPIED_ICON_PATH);

    // Second click before reset (should cancel first timer and set new one)
    await act(async () => {
      fireEvent.click(copyButton);
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(writeText).toHaveBeenCalledTimes(2);
    expect(getButtonIconPath(copyButton)).toBe(COPIED_ICON_PATH);

    // Advance 1999ms (almost to first reset)
    act(() => {
      jest.advanceTimersByTime(1999);
    });
    expect(getButtonIconPath(copyButton)).toBe(COPIED_ICON_PATH);

    // Advance 1ms more (now at 2000ms from second click, should reset)
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(getButtonIconPath(copyButton)).toBe(COPY_ICON_PATH);
  });

  it('does not copy if address is not available', async () => {
    const writeText = installClipboardMock();

    mockUseWallet.mockReturnValue(createWalletState({ address: null }));

    render(<WalletConnectButton />);

    // Should render disconnected state, no copy button
    expect(screen.queryByRole('button', { name: 'Copy address to clipboard' })).not.toBeInTheDocument();

    expect(writeText).not.toHaveBeenCalled();
    expect(mockShowError).not.toHaveBeenCalled();
  });

  it('cleans up timer on unmount to prevent state updates', async () => {
    const address = '0xABCDEF1234567890';
    installClipboardMock();

    mockUseWallet.mockReturnValue(createWalletState({ address }));

    const { unmount } = render(<WalletConnectButton />);

    const copyButton = screen.getByRole('button', { name: 'Copy address to clipboard' });

    await act(async () => {
      fireEvent.click(copyButton);
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(getButtonIconPath(copyButton)).toBe(COPIED_ICON_PATH);

    // Unmount before timer fires
    act(() => {
      jest.advanceTimersByTime(500);
    });
    unmount();

    // Advance past the reset timer
    // (Should not cause errors even though component is unmounted)
    expect(() => {
      act(() => {
        jest.advanceTimersByTime(1600);
      });
    }).not.toThrow();
  });

  // ── Keyboard interaction ──────────────────────────────────────────────

  it('activates connect via keyboard (Enter key)', async () => {
    const connect = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    mockUseWallet.mockReturnValue(createWalletState({ connect }));

    render(<WalletConnectButton />);

    const connectButton = screen.getByRole('button', { name: 'Connect wallet' });
    connectButton.focus();
    await user.keyboard('{Enter}');

    expect(connect).toHaveBeenCalledTimes(1);
  });

  it('activates retry via keyboard (Enter key)', async () => {
    const connect = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    mockUseWallet.mockReturnValue(createWalletState({ error: 'Connection failed', connect }));

    render(<WalletConnectButton />);

    const retryButton = screen.getByRole('button', { name: 'Retry wallet connection' });
    retryButton.focus();
    await user.keyboard('{Enter}');

    expect(connect).toHaveBeenCalledTimes(1);
  });

  it('activates disconnect via keyboard (Enter key)', async () => {
    const disconnect = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    mockUseWallet.mockReturnValue(createWalletState({
      address: '0x1234567890abcdef1234567890abcdef12345678',
      disconnect,
    }));
    installClipboardMock();

    render(<WalletConnectButton />);

    const disconnectButton = screen.getByRole('button', { name: 'Disconnect wallet' });
    disconnectButton.focus();
    await user.keyboard('{Enter}');

    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  // ── Loading exclusivity ──────────────────────────────────────────────

  it('shows error state when both error and isConnecting are true (error wins)', () => {
    mockUseWallet.mockReturnValue(createWalletState({ error: 'Connection failed', isConnecting: true }));

    render(<WalletConnectButton />);

    expect(screen.getByText('Connection Error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry wallet connection' })).toBeInTheDocument();
    expect(screen.queryByText('Connecting...')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Connect wallet' })).not.toBeInTheDocument();
  });

  it('shows connected state when both address and isConnecting are true (address wins)', () => {
    mockUseWallet.mockReturnValue(createWalletState({ address: '0xABCDEF1234567890', isConnecting: true }));

    render(<WalletConnectButton />);

    expect(screen.getByRole('button', { name: 'Copy address to clipboard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Disconnect wallet' })).toBeInTheDocument();
    expect(screen.queryByText('Connecting...')).not.toBeInTheDocument();
    expect(screen.queryByText('Connection Error')).not.toBeInTheDocument();
  });

  it('shows error state when both error and address are set (error wins)', () => {
    mockUseWallet.mockReturnValue(createWalletState({ error: 'Connection failed', address: '0xABCDEF1234567890' }));

    render(<WalletConnectButton />);

    expect(screen.getByText('Connection Error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry wallet connection' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Copy address to clipboard' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Disconnect wallet' })).not.toBeInTheDocument();
  });

  // ── Accessible semantics ─────────────────────────────────────────────

  it('renders warning icon in error state', () => {
    mockUseWallet.mockReturnValue(createWalletState({ error: 'Something went wrong' }));

    render(<WalletConnectButton />);

    const errorSvg = screen.getByText('Connection Error').closest('div')?.querySelector('svg');
    expect(errorSvg).toBeInTheDocument();
    const warningPath = errorSvg?.querySelector('path');
    expect(warningPath).toHaveAttribute('d', expect.stringContaining('M12 9v2m0 4h.01'));
  });

  it('marks connecting spinner as aria-hidden', () => {
    mockUseWallet.mockReturnValue(createWalletState({ isConnecting: true }));

    render(<WalletConnectButton />);

    const spinnerSvg = screen.getByRole('button', { name: 'Connect wallet' }).querySelector('svg.animate-spin');
    expect(spinnerSvg).toBeInTheDocument();
    expect(spinnerSvg).toHaveAttribute('aria-hidden', 'true');
  });

  it('marks connected green dot as aria-hidden', () => {
    mockUseWallet.mockReturnValue(createWalletState({ address: '0xABCDEF1234567890' }));

    render(<WalletConnectButton />);

    const greenDot = document.querySelector('.bg-green-500');
    expect(greenDot).toBeInTheDocument();
    expect(greenDot).toHaveAttribute('aria-hidden', 'true');
  });

  // ── Accessibility audits ─────────────────────────────────────────────

  it('has no accessibility violations in the disconnected state', async () => {
    jest.useRealTimers();
    mockUseWallet.mockReturnValue(createWalletState({}));

    await testA11y(<WalletConnectButton />);

    jest.useFakeTimers();
  });

  it('has no accessibility violations in the connecting state', async () => {
    jest.useRealTimers();
    mockUseWallet.mockReturnValue(createWalletState({ isConnecting: true }));

    await testA11y(<WalletConnectButton />);

    jest.useFakeTimers();
  });

  it('has no accessibility violations in the error state', async () => {
    jest.useRealTimers();
    mockUseWallet.mockReturnValue(createWalletState({ error: 'Connection failed' }));

    await testA11y(<WalletConnectButton />);

    jest.useFakeTimers();
  });

  it('has no accessibility violations in the connected state', async () => {
    jest.useRealTimers();
    mockUseWallet.mockReturnValue(createWalletState({
      address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    }));
    installClipboardMock();

    await testA11y(<WalletConnectButton />);

    jest.useFakeTimers();
  });

  it('has no accessibility violations when clipboard write fails', async () => {
    jest.useRealTimers();
    const writeText = jest.fn().mockRejectedValue(new Error('Write failed'));

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    mockUseWallet.mockReturnValue(createWalletState({
      address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    }));

    await testA11y(<WalletConnectButton />);

    jest.useFakeTimers();
  });
});
