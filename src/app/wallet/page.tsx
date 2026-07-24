'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import EmptyState from '../../components/EmptyState';
import { useWallet } from '@/contexts/WalletContext';
import { truncateAddress } from '@/lib/truncateAddress';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

// ---------------------------------------------------------------------------
// WalletStateVisual — renders the visual content based on wallet state
// ---------------------------------------------------------------------------

type WalletVisualState = 'loading' | 'empty' | 'error' | 'connected';

/**
 * Determines the current wallet visual state from the WalletContext values.
 * Exported for testing.
 */
export function getWalletVisualState(
  isConnecting: boolean,
  address: string | null,
  error: string | null,
): WalletVisualState {
  if (isConnecting) return 'loading';
  if (error) return 'error';
  if (!address) return 'empty';
  return 'connected';
}

// ---------------------------------------------------------------------------
// Label map for screen-reader announcements
// ---------------------------------------------------------------------------

const STATE_LABELS: Record<WalletVisualState, string> = {
  loading: 'Connecting wallet',
  empty: 'Wallet not connected',
  error: 'Wallet connection error',
  connected: 'Wallet connected',
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Connected wallet details card. */
function ConnectedWallet({ address, onDisconnect }: { address: string; onDisconnect: () => void }) {
  const { copy, copied } = useCopyToClipboard({ delay: 2000 });

  const handleCopy = useCallback(async () => {
    await copy(address);
  }, [address, copy]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-4">
        {/* Wallet icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700 ring-1 ring-violet-200" aria-hidden="true">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 64 64">
            <rect x="8" y="16" width="48" height="36" rx="6" stroke="currentColor" strokeWidth="4" />
            <rect x="24" y="28" width="16" height="12" rx="3" stroke="currentColor" strokeWidth="3" />
            <circle cx="34" cy="34" r="2" fill="currentColor" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Connected Wallet</p>
          <p className="text-lg font-semibold text-slate-900 font-mono tracking-tight">
            {truncateAddress(address)}
          </p>
          <p className="mt-0.5 text-xs text-slate-400 font-mono break-all" aria-label="Full wallet address">
            {address}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCopy}
          disabled={copied}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-400 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:opacity-70"
          aria-label={copied ? 'Address copied to clipboard' : 'Copy address to clipboard'}
        >
          {copied ? (
            <>
              <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied</span>
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy Address</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onDisconnect}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:border-red-300 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-red-500"
          aria-label="Disconnect wallet"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Disconnect</span>
        </button>
      </div>
    </div>
  );
}

/** Error state card with retry button. */
function WalletErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm sm:p-8">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 ring-1 ring-red-200" aria-hidden="true">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-semibold text-red-900">Wallet Connection Error</h2>
        <p className="mb-6 max-w-md text-sm leading-6 text-red-700">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-red-900"
          aria-label="Retry wallet connection"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Retry Connection</span>
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// WalletPage
// ---------------------------------------------------------------------------

const WalletPage: React.FC = () => {
  const { address, isConnecting, error, connect, disconnect } = useWallet();

  const visualState = getWalletVisualState(isConnecting, address, error);
  const prevStateRef = useRef<WalletVisualState | null>(null);
  const [announcement, setAnnouncement] = useState('');

  // Announce state changes to assistive technology
  useEffect(() => {
    if (prevStateRef.current !== null && prevStateRef.current !== visualState) {
      setAnnouncement(STATE_LABELS[visualState]);
      // Clear the announcement after it's been read
      const timer = setTimeout(() => setAnnouncement(''), 3000);
      return () => clearTimeout(timer);
    }
    prevStateRef.current = visualState;
  }, [visualState]);

  const handleRetry = useCallback(() => {
    connect().catch(() => {
      // Error is surfaced through the WalletContext error state;
      // no additional toast needed here.
    });
  }, [connect]);

  const handleConnect = useCallback(() => {
    connect().catch(() => {
      // Error surfaced through WalletContext
    });
  }, [connect]);

  const handleDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  // Loading state is handled by the route's loading.tsx Suspense boundary,
  // but we still show an inline loading state for the connection attempt.
  if (isConnecting) {
    return (
      <main className="min-h-screen p-8">
        <h1 className="text-2xl font-bold mb-6">Wallet</h1>

        {/* Screen-reader announcement */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {announcement || 'Connecting wallet…'}
        </div>

        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col items-center text-center">
              {/* Spinner */}
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 ring-1 ring-slate-200" aria-hidden="true">
                <svg className="h-8 w-8 animate-spin motion-reduce:animate-none" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-semibold text-slate-900">Connecting Wallet</h2>
              <p className="text-sm leading-6 text-slate-600">
                Please approve the connection request in your wallet extension.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (visualState === 'error' && error) {
    return (
      <main className="min-h-screen p-8">
        <h1 className="text-2xl font-bold mb-6">Wallet</h1>

        {/* Screen-reader announcement */}
        <div aria-live="assertive" aria-atomic="true" className="sr-only">
          {announcement}
        </div>

        <div className="mx-auto max-w-3xl">
          <WalletErrorState error={error} onRetry={handleRetry} />
        </div>
      </main>
    );
  }

  // Empty / disconnected state
  if (visualState === 'empty') {
    return (
      <main className="min-h-screen p-8">
        <h1 className="text-2xl font-bold mb-6">Wallet</h1>

        {/* Screen-reader announcement */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {announcement || 'No wallet connected'}
        </div>

        <div className="mx-auto max-w-3xl">
          <EmptyState
            illustration="wallet"
            title="Connect Your Wallet"
            description="Connect a Stellar wallet to manage your account, track transactions, and interact with the TalentTrust escrow protocol securely."
            actionLabel="Connect Wallet"
            onAction={handleConnect}
          />
        </div>
      </main>
    );
  }

  // Connected state
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Wallet</h1>

      {/* Screen-reader announcement */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      <div className="mx-auto max-w-3xl space-y-6">
        <ConnectedWallet address={address!} onDisconnect={handleDisconnect} />

        {/* Placeholder for future wallet details section */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Account Summary</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
              <span className="text-sm font-medium text-slate-600">Status</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
              <span className="text-sm font-medium text-slate-600">Network</span>
              <span className="text-sm font-semibold text-slate-900">Stellar Testnet</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default WalletPage;
