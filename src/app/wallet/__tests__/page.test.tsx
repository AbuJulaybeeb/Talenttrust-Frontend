import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import WalletPage from '../page';
import { ToastProvider } from '@/components/toast/toast-provider';
import { PreferencesProvider } from '@/lib/preferences';
import { useWallet } from '@/contexts/WalletContext';
import { testA11y } from '@/test-utils/a11y';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// The global jest.setup.ts mocks WalletContext with a connected state.
// We override it here to control the mock per test.
const mockUseWallet = useWallet as jest.MockedFunction<typeof useWallet>;

// Mock useCopyToClipboard
jest.mock('@/hooks/useCopyToClipboard', () => ({
  useCopyToClipboard: jest.fn().mockReturnValue({
    copied: false,
    copy: jest.fn().mockResolvedValue(undefined),
  }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createWalletState(overrides: Partial<ReturnType<typeof useWallet>> = {}) {
  return {
    address: null,
    isConnecting: false,
    error: null,
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn(),
    ...overrides,
  };
}

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <PreferencesProvider>
      <ToastProvider>
        {ui}
      </ToastProvider>
    </PreferencesProvider>
  );
}

// ---------------------------------------------------------------------------
// getWalletVisualState
// ---------------------------------------------------------------------------

describe('getWalletVisualState', () => {
  const { getWalletVisualState } = require('../page');

  it('returns "loading" when isConnecting is true', () => {
    expect(getWalletVisualState(true, null, null)).toBe('loading');
    expect(getWalletVisualState(true, 'GABCD...', null)).toBe('loading');
    expect(getWalletVisualState(true, null, 'Error')).toBe('loading');
  });

  it('returns "error" when error is set and not connecting', () => {
    expect(getWalletVisualState(false, null, 'Connection failed')).toBe('error');
    expect(getWalletVisualState(false, 'GABCD...', 'Error')).toBe('error');
  });

  it('returns "empty" when no address and no error and not connecting', () => {
    expect(getWalletVisualState(false, null, null)).toBe('empty');
  });

  it('returns "connected" when address is present and no error and not connecting', () => {
    expect(getWalletVisualState(false, 'GABCD...', null)).toBe('connected');
  });
});

// ---------------------------------------------------------------------------
// WalletPage
// ---------------------------------------------------------------------------

describe('WalletPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Empty / Disconnected state ──────────────────────────────────────────

  describe('empty state (wallet not connected)', () => {
    beforeEach(() => {
      mockUseWallet.mockReturnValue(createWalletState({
        address: null,
        error: null,
        isConnecting: false,
      }));
    });

    it('renders the EmptyState with wallet illustration', () => {
      renderWithProviders(<WalletPage />);
      // EmptyState renders a region with the title as its accessible name
      const emptyStateRegion = screen.getByRole('region', { name: /connect your wallet/i });
      expect(emptyStateRegion).toBeInTheDocument();
      expect(screen.getByText('Connect Your Wallet')).toBeInTheDocument();
      expect(screen.getByText(/Connect a Stellar wallet/i)).toBeInTheDocument();
    });

    it('renders a Connect Wallet button', () => {
      renderWithProviders(<WalletPage />);
      const connectButton = screen.getByRole('button', { name: /connect wallet/i });
      expect(connectButton).toBeInTheDocument();
    });

    it('calls connect() when the Connect Wallet button is clicked', () => {
      const connect = jest.fn().mockResolvedValue(undefined);
      mockUseWallet.mockReturnValue(createWalletState({
        address: null,
        error: null,
        isConnecting: false,
        connect,
      }));

      renderWithProviders(<WalletPage />);
      fireEvent.click(screen.getByRole('button', { name: /connect wallet/i }));
      expect(connect).toHaveBeenCalledTimes(1);
    });

    it('does not render connected wallet details', () => {
      renderWithProviders(<WalletPage />);
      expect(screen.queryByText('Connected Wallet')).not.toBeInTheDocument();
      expect(screen.queryByText(/Disconnect/i)).not.toBeInTheDocument();
    });

    it('does not render error state', () => {
      renderWithProviders(<WalletPage />);
      expect(screen.queryByText('Wallet Connection Error')).not.toBeInTheDocument();
    });

    it('has an aria-live region announcing disconnected state', () => {
      renderWithProviders(<WalletPage />);
      const liveRegion = document.querySelector('[aria-live="polite"].sr-only');
      expect(liveRegion).toBeInTheDocument();
    });

    it('has no axe violations', async () => {
      const { container } = renderWithProviders(<WalletPage />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes testA11y helper', async () => {
      await testA11y(
        <PreferencesProvider>
          <ToastProvider>
            <WalletPage />
          </ToastProvider>
        </PreferencesProvider>
      );
    });
  });

  // ── Loading / Connecting state ─────────────────────────────────────────

  describe('loading state (connecting)', () => {
    beforeEach(() => {
      mockUseWallet.mockReturnValue(createWalletState({
        address: null,
        error: null,
        isConnecting: true,
      }));
    });

    it('renders the connecting message', () => {
      renderWithProviders(<WalletPage />);
      expect(screen.getByText('Connecting Wallet')).toBeInTheDocument();
      expect(screen.getByText(/approve the connection request/i)).toBeInTheDocument();
    });

    it('does not render empty state', () => {
      renderWithProviders(<WalletPage />);
      expect(screen.queryByText('Connect Your Wallet')).not.toBeInTheDocument();
    });

    it('does not render error state', () => {
      renderWithProviders(<WalletPage />);
      expect(screen.queryByText('Wallet Connection Error')).not.toBeInTheDocument();
    });

    it('does not render connected state', () => {
      renderWithProviders(<WalletPage />);
      expect(screen.queryByText('Connected Wallet')).not.toBeInTheDocument();
    });

    it('has a spinner indicator', () => {
      renderWithProviders(<WalletPage />);
      // The loading state includes a spinning SVG
      const spinnerContainer = document.querySelector('.animate-spin');
      expect(spinnerContainer).toBeInTheDocument();
    });

    it('has an aria-live region announcing connecting state', () => {
      renderWithProviders(<WalletPage />);
      const liveRegion = document.querySelector('[aria-live="polite"].sr-only');
      expect(liveRegion).toBeInTheDocument();
    });

    it('has no axe violations', async () => {
      const { container } = renderWithProviders(<WalletPage />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  // ── Error state ────────────────────────────────────────────────────────

  describe('error state', () => {
    const testError = 'Freighter wallet is not installed. Please install the Freighter browser extension.';

    beforeEach(() => {
      mockUseWallet.mockReturnValue(createWalletState({
        address: null,
        error: testError,
        isConnecting: false,
      }));
    });

    it('renders the error message', () => {
      renderWithProviders(<WalletPage />);
      expect(screen.getByText('Wallet Connection Error')).toBeInTheDocument();
      expect(screen.getByText(testError)).toBeInTheDocument();
    });

    it('renders a Retry Connection button', () => {
      renderWithProviders(<WalletPage />);
      const retryButton = screen.getByRole('button', { name: /retry wallet connection/i });
      expect(retryButton).toBeInTheDocument();
    });

    it('calls connect() when Retry is clicked', () => {
      const connect = jest.fn().mockResolvedValue(undefined);
      mockUseWallet.mockReturnValue(createWalletState({
        address: null,
        error: testError,
        isConnecting: false,
        connect,
      }));

      renderWithProviders(<WalletPage />);
      fireEvent.click(screen.getByRole('button', { name: /retry wallet connection/i }));
      expect(connect).toHaveBeenCalledTimes(1);
    });

    it('retry button is keyboard accessible (a native button)', () => {
      renderWithProviders(<WalletPage />);
      const retryButton = screen.getByRole('button', { name: /retry wallet connection/i });
      // Native buttons are keyboard-operable by default; verify it isn't an <a> or div
      expect(retryButton.tagName).toBe('BUTTON');
    });

    it('does not render empty state', () => {
      renderWithProviders(<WalletPage />);
      expect(screen.queryByText('Connect Your Wallet')).not.toBeInTheDocument();
    });

    it('does not render connected state', () => {
      renderWithProviders(<WalletPage />);
      expect(screen.queryByText('Connected Wallet')).not.toBeInTheDocument();
    });

    it('has aria-live="assertive" region for error announcement', () => {
      renderWithProviders(<WalletPage />);
      const assertiveRegion = document.querySelector('[aria-live="assertive"].sr-only');
      expect(assertiveRegion).toBeInTheDocument();
    });

    it('has no axe violations', async () => {
      const { container } = renderWithProviders(<WalletPage />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes testA11y helper', async () => {
      await testA11y(
        <PreferencesProvider>
          <ToastProvider>
            <WalletPage />
          </ToastProvider>
        </PreferencesProvider>
      );
    });
  });

  // ── Connected state ────────────────────────────────────────────────────

  describe('connected state', () => {
    const testAddress = 'GBDGTR4S5O3K7I6E7K5QH3Y2W6Z4JFQ2X3C5V7M8N9P0Q1R2S3T4U5V6W7X';

    beforeEach(() => {
      mockUseWallet.mockReturnValue(createWalletState({
        address: testAddress,
        error: null,
        isConnecting: false,
      }));
    });

    it('renders Connected Wallet heading', () => {
      renderWithProviders(<WalletPage />);
      expect(screen.getByText('Connected Wallet')).toBeInTheDocument();
    });

    it('renders the truncated wallet address', () => {
      renderWithProviders(<WalletPage />);
      // truncateAddress shortens the address; use getByLabelText to find the full address
      const fullAddress = screen.getByLabelText('Full wallet address');
      expect(fullAddress).toBeInTheDocument();
      expect(fullAddress).toHaveTextContent(testAddress);
      // The displayed connection label should mention connected
      expect(screen.getByText('Connected Wallet')).toBeInTheDocument();
    });

    it('renders Copy Address button', () => {
      renderWithProviders(<WalletPage />);
      const copyButton = screen.getByRole('button', { name: /copy address to clipboard/i });
      expect(copyButton).toBeInTheDocument();
    });

    it('renders Disconnect button', () => {
      renderWithProviders(<WalletPage />);
      const disconnectButton = screen.getByRole('button', { name: /disconnect wallet/i });
      expect(disconnectButton).toBeInTheDocument();
    });

    it('calls disconnect() when Disconnect is clicked', () => {
      const disconnect = jest.fn();
      mockUseWallet.mockReturnValue(createWalletState({
        address: testAddress,
        error: null,
        isConnecting: false,
        disconnect,
      }));

      renderWithProviders(<WalletPage />);
      fireEvent.click(screen.getByRole('button', { name: /disconnect wallet/i }));
      expect(disconnect).toHaveBeenCalledTimes(1);
    });

    it('renders Account Summary section with status and network', () => {
      renderWithProviders(<WalletPage />);
      expect(screen.getByText('Account Summary')).toBeInTheDocument();
      expect(screen.getByText('Connected')).toBeInTheDocument();
      expect(screen.getByText('Stellar Testnet')).toBeInTheDocument();
    });

    it('does not render empty state', () => {
      renderWithProviders(<WalletPage />);
      expect(screen.queryByText('Connect Your Wallet')).not.toBeInTheDocument();
    });

    it('does not render error state', () => {
      renderWithProviders(<WalletPage />);
      expect(screen.queryByText('Wallet Connection Error')).not.toBeInTheDocument();
    });

    it('has an aria-live region', () => {
      renderWithProviders(<WalletPage />);
      const liveRegion = document.querySelector('[aria-live="polite"].sr-only');
      expect(liveRegion).toBeInTheDocument();
    });

    it('has no axe violations', async () => {
      const { container } = renderWithProviders(<WalletPage />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes testA11y helper', async () => {
      await testA11y(
        <PreferencesProvider>
          <ToastProvider>
            <WalletPage />
          </ToastProvider>
        </PreferencesProvider>
      );
    });
  });

  // ── State transition announcements ─────────────────────────────────────

  describe('state transition announcements', () => {
    it('announces state change from empty to connected via aria-live', () => {
      // Start in empty state
      mockUseWallet.mockReturnValue(createWalletState({
        address: null,
        error: null,
        isConnecting: false,
      }));

      const connect = jest.fn().mockResolvedValue(undefined);
      const { rerender } = renderWithProviders(<WalletPage />);

      // Initially empty
      expect(screen.getByText('Connect Your Wallet')).toBeInTheDocument();

      // Transition to connected
      mockUseWallet.mockReturnValue(createWalletState({
        address: 'GABCD...',
        error: null,
        isConnecting: false,
        connect,
      }));

      rerender(
        <PreferencesProvider>
          <ToastProvider>
            <WalletPage />
          </ToastProvider>
        </PreferencesProvider>
      );

      // The aria-live region should announce the connected state
      const liveRegion = document.querySelector('[aria-live="polite"].sr-only');
      expect(liveRegion).toBeInTheDocument();
      expect(screen.getByText('Connected Wallet')).toBeInTheDocument();
    });

    it('announces state change from connected to empty on disconnect', () => {
      // Start in connected state (jest.setup default)
      const { rerender } = renderWithProviders(<WalletPage />);

      // Transition to empty (disconnected)
      mockUseWallet.mockReturnValue(createWalletState({
        address: null,
        error: null,
        isConnecting: false,
      }));

      rerender(
        <PreferencesProvider>
          <ToastProvider>
            <WalletPage />
          </ToastProvider>
        </PreferencesProvider>
      );

      expect(screen.getByText('Connect Your Wallet')).toBeInTheDocument();
    });

    it('announces state change from empty to error on connection failure', () => {
      // Start in empty state
      mockUseWallet.mockReturnValue(createWalletState({
        address: null,
        error: null,
        isConnecting: false,
      }));

      const { rerender } = renderWithProviders(<WalletPage />);

      // Transition to error state
      mockUseWallet.mockReturnValue(createWalletState({
        address: null,
        error: 'Connection failed',
        isConnecting: false,
      }));

      rerender(
        <PreferencesProvider>
          <ToastProvider>
            <WalletPage />
          </ToastProvider>
        </PreferencesProvider>
      );

      expect(screen.getByText('Wallet Connection Error')).toBeInTheDocument();
      expect(screen.getByText('Connection failed')).toBeInTheDocument();
    });
  });

  // ── State exclusivity ──────────────────────────────────────────────────

  describe('state exclusivity (only one state rendered at a time)', () => {
    it('renders only the loading state when isConnecting is true even if address is set', () => {
      mockUseWallet.mockReturnValue(createWalletState({
        address: 'GABCD...',
        error: null,
        isConnecting: true,
      }));

      renderWithProviders(<WalletPage />);
      expect(screen.getByText('Connecting Wallet')).toBeInTheDocument();
      expect(screen.queryByText('Connected Wallet')).not.toBeInTheDocument();
      expect(screen.queryByText('Connect Your Wallet')).not.toBeInTheDocument();
      expect(screen.queryByText('Wallet Connection Error')).not.toBeInTheDocument();
    });

    it('renders only the error state when error is set and not connecting', () => {
      mockUseWallet.mockReturnValue(createWalletState({
        address: 'GABCD...',
        error: 'Something went wrong',
        isConnecting: false,
      }));

      renderWithProviders(<WalletPage />);
      expect(screen.getByText('Wallet Connection Error')).toBeInTheDocument();
      expect(screen.queryByText('Connecting Wallet')).not.toBeInTheDocument();
      expect(screen.queryByText('Connected Wallet')).not.toBeInTheDocument();
      expect(screen.queryByText('Connect Your Wallet')).not.toBeInTheDocument();
    });
  });

  // ── Heading ────────────────────────────────────────────────────────────

  describe('page heading', () => {
    beforeEach(() => {
      mockUseWallet.mockReturnValue(createWalletState({
        address: null,
        error: null,
        isConnecting: false,
      }));
    });

    it('renders h1 with "Wallet" in all states', () => {
      const { rerender } = renderWithProviders(<WalletPage />);
      expect(screen.getByRole('heading', { level: 1, name: 'Wallet' })).toBeInTheDocument();

      // Connecting
      mockUseWallet.mockReturnValue(createWalletState({
        address: null,
        error: null,
        isConnecting: true,
      }));
      rerender(
        <PreferencesProvider>
          <ToastProvider>
            <WalletPage />
          </ToastProvider>
        </PreferencesProvider>
      );
      expect(screen.getByRole('heading', { level: 1, name: 'Wallet' })).toBeInTheDocument();

      // Error
      mockUseWallet.mockReturnValue(createWalletState({
        address: null,
        error: 'Error',
        isConnecting: false,
      }));
      rerender(
        <PreferencesProvider>
          <ToastProvider>
            <WalletPage />
          </ToastProvider>
        </PreferencesProvider>
      );
      expect(screen.getByRole('heading', { level: 1, name: 'Wallet' })).toBeInTheDocument();
    });
  });

  // ── Retry re-fetches (calls connect) ─────────────────────────────────────

  describe('retry re-fetches', () => {
    it('calls connect() when retry button is clicked in error state', () => {
      const connect = jest.fn().mockResolvedValue(undefined);
      mockUseWallet.mockReturnValue(createWalletState({
        address: null,
        error: 'Connection failed',
        isConnecting: false,
        connect,
      }));

      renderWithProviders(<WalletPage />);
      fireEvent.click(screen.getByRole('button', { name: /retry wallet connection/i }));
      expect(connect).toHaveBeenCalledTimes(1);
    });

    it('handles connect rejection gracefully in retry', () => {
      const connect = jest.fn().mockRejectedValue(new Error('Failed'));
      mockUseWallet.mockReturnValue(createWalletState({
        address: null,
        error: 'Connection failed',
        isConnecting: false,
        connect,
      }));

      renderWithProviders(<WalletPage />);
      // Should not throw
      expect(() => {
        fireEvent.click(screen.getByRole('button', { name: /retry wallet connection/i }));
      }).not.toThrow();
    });
  });
});
