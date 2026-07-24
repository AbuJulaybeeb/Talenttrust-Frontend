'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/components/toast/toast-provider';
import { getItem, setItem, removeItem } from '@/lib/safeStorage';
import { usePreferences } from '@/lib/preferences';

/** Debounce delay (ms) before flushing a live-region announcement. */
export const ANNOUNCE_DEBOUNCE_MS = 300;

/**
 * Supported Stellar networks.
 */
export type StellarNetwork = 'Mainnet' | 'Testnet' | 'Futurenet' | 'Unknown';

/**
 * Shape of the value exposed by {@link WalletContext}.
 *
 * Consumed exclusively through the {@link useWallet} hook; do not read from
 * `WalletContext` directly.
 */
export type WalletContextType = {
  /**
   * The connected Stellar public key (G-address), or `null` when no wallet
   * is connected. The value is rehydrated from `localStorage` on mount so it
   * survives page refreshes without requiring a fresh `connect()` call.
   *
   * @example "GAAQ…DZ7H"
   */
  address: string | null;

  /**
   * The active Stellar network name when wallet is connected, or `null` when
   * disconnected. Possible values are 'Mainnet', 'Testnet', 'Futurenet', or
   * 'Unknown' if the network cannot be determined.
   *
   * @example "Testnet" | "Mainnet"
   */
  network: StellarNetwork | null;

  /**
   * `true` while a connection attempt is in progress (i.e. between the
   * `connect()` call and its resolution). Use this to disable the connect
   * button and show a loading indicator.
   */
  isConnecting: boolean;

  /**
   * Human-readable error message from the most recent failed `connect()`
   * attempt, or `null` when no error is present. Cleared automatically at the
   * start of each new `connect()` call.
   *
   * Known values (exported as named constants):
   * - {@link FREIGHTER_NOT_INSTALLED} – browser extension absent.
   * - {@link USER_REJECTED} – user dismissed the approval prompt.
   */
  error: string | null;

  /**
   * Initiates a wallet connection sequence.
   *
   * **Current implementation (mock):** waits 1 second via `setTimeout`, then
   * sets `address` to the hard-coded {@link MOCKED_STELLAR_ADDRESS} constant
   * and persists it in `localStorage`. No real wallet extension is contacted.
   *
   * **Intended implementation:** will call the Freighter browser-extension API
   * (`window.freighter.requestAccess()`), validate the returned public key,
   * and persist it. Tracked in the pending Freighter integration milestone.
   *
   * Sets `isConnecting` to `true` for the duration of the attempt and resets
   * it in the `finally` block regardless of outcome.
   *
   * @returns A `Promise` that resolves when the attempt completes (success or
   *   failure). The promise never rejects; errors are surfaced through the
   *   `error` field instead.
   */
  connect: () => Promise<void>;

  /**
   * Terminates the active wallet session.
   *
   * Clears `address` in state, removes the persisted key from `localStorage`,
   * and cancels any running inactivity-timeout timer so no phantom disconnect
   * fires after a manual sign-out.
   */
  disconnect: () => void;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const FREIGHTER_NOT_INSTALLED = 'Freighter wallet is not installed. Please install the Freighter browser extension.';
export const USER_REJECTED = 'User rejected the connection request.';
export const MOCKED_STELLAR_ADDRESS = 'GAAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQDZ7H';

/** localStorage key used to persist the connected wallet address across page reloads. */
const STORAGE_KEY = 'wallet_connected_address';

/**
 * DOM events that count as "user activity" and reset the idle timer.
 *
 * - `pointermove` / `mousedown` / `touchstart` — pointer & touch gestures.
 * - `keydown` — any keyboard interaction.
 * - `visibilitychange` — tab becomes visible again (user returns to the page).
 *
 * All listeners are registered as passive to guarantee they never block
 * scrolling or other default browser actions.
 */
const IDLE_EVENTS: ReadonlyArray<string> = [
  'pointermove',
  'keydown',
  'visibilitychange',
  'mousedown',
  'touchstart',
];

/**
 * Safe wrapper around `useToast` that returns no-op stubs when called outside
 * a `ToastProvider` subtree (e.g. in unit tests that mount `WalletProvider`
 * in isolation).
 *
 * Defined at module scope so it is a stable, unconditionally-called hook and
 * never violates the React rules-of-hooks.
 */
function useSafeToast() {
  try {
    return useToast();
  } catch {
    return {
      showSuccess: (_input: unknown) => '',
      showError: (_input: unknown) => '',
    };
  }
}

/**
 * WalletAnnouncer — internal component that announces wallet state transitions
 * to assistive technologies through a polite ARIA live region.
 *
 * ## Behaviour
 * - **No mount or rehydration announcement** — the first render and the
 *   subsequent localStorage-rehydration update are both intentionally silent,
 *   so screen-reader users are not interrupted when the page loads (even when
 *   it has a pre-existing session restored from `localStorage`).
 * - **Debounced** — rapid successive address changes (e.g. connect → reconnect
 *   within a short interval) are collapsed into a single announcement after
 *   {@link ANNOUNCE_DEBOUNCE_MS} ms of quiet, preventing queue spam.
 * - **Polite priority** — uses `aria-live="polite"` so the announcement waits
 *   for the user's current utterance to finish rather than interrupting it.
 * - **Atomic** — `aria-atomic="true"` ensures assistive tech reads the full
 *   announcement string, not just the changed portion.
 *
 * ## Announcement copy
 * | Transition          | Announcement                              |
 * |---------------------|-------------------------------------------|
 * | `null` → address    | `"Wallet connected."`                     |
 * | address → `null`    | `"Wallet disconnected."`                  |
 * | address → address   | `"Wallet address changed."` (edge case)   |
 *
 * This component is rendered inside `WalletContext.Provider` so it can
 * consume `useWallet()` and react to context changes without prop-drilling.
 *
 * @param hydratedRef - Ref set to `true` by `WalletProvider` once the initial
 *   `localStorage` rehydration effect has run.  Announcements are suppressed
 *   until this flag is `true` so that restoring a pre-existing session on
 *   page load does not trigger a spurious "Wallet connected." announcement.
 *
 * @internal Not exported; only used inside {@link WalletProvider}.
 */
function WalletAnnouncer({ hydratedRef }: { hydratedRef: React.MutableRefObject<boolean> }) {
  const { address } = useWallet();
  const [announcement, setAnnouncement] = useState('');

  // Remember the previous address to compute the transition direction.
  const prevAddressRef = useRef(address);
  // Debounce timer handle.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const prev = prevAddressRef.current;
    prevAddressRef.current = address;

    // Suppress announcements until the provider's hydration effect has run.
    // This silences both the initial mount (address = null) and the immediate
    // rehydration update (null → stored address).
    if (!hydratedRef.current) return;

    // Nothing changed — nothing to announce.
    if (prev === address) return;

    // Compute announcement string for this transition.
    let message: string;
    if (!prev && address) {
      message = 'Wallet connected.';
    } else if (prev && !address) {
      message = 'Wallet disconnected.';
    } else {
      // address → different address (unlikely in practice, but handle it)
      message = 'Wallet address changed.';
    }

    // Debounce: cancel any pending timer and restart.
    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setAnnouncement(message);
      debounceRef.current = null;
    }, ANNOUNCE_DEBOUNCE_MS);
  }, [address, hydratedRef]);

  // Clean up debounce timer on unmount.
  useEffect(() => {
    return () => {
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <span
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label="Wallet status updates"
      className="sr-only"
    >
      {announcement}
    </span>
  );
}

/**
 * Provides global wallet connection state to the React tree.
 *
 * ## Placement
 * Rendered inside `src/app/layout.tsx`, wrapping the entire application so
 * every page and component can access wallet state without prop-drilling:
 *
 * ```
 * <PreferencesProvider>
 *   <ToastProvider>
 *     <WalletProvider>   ← here
 *       {children}
 *     </WalletProvider>
 *   </ToastProvider>
 * </PreferencesProvider>
 * ```
 *
 * ## Exposed context fields
 * | Field          | Type                     | Description                                      |
 * |----------------|--------------------------|-------------------------------------------------|
 * | `address`      | `string \| null`         | Connected Stellar public key; `null` if none.    |
 * | `network`      | `StellarNetwork \| null` | Active network name; `null` if disconnected.     |
 * | `isConnecting` | `boolean`                | `true` while a connection attempt is in flight.  |
 * | `error`        | `string \| null`         | Last connection error message, or `null`.        |
 * | `connect`      | `() => Promise<void>`    | Initiates a connection attempt (currently mock). |
 * | `disconnect`   | `() => void`             | Clears session state and storage.                |
 *
 * ## Idle auto-disconnect
 * When `idleTimeout` is a positive number the provider registers passive
 * listeners for {@link IDLE_EVENTS} on `window`. If no event fires within
 * `idleTimeout` milliseconds the session is terminated automatically and a
 * "Session expired" toast is shown. Pass `0` (the default) to disable this
 * feature entirely.
 *
 * The timeout value can also be set via the `idleDisconnectMs` user
 * preference (see `src/lib/preferences.tsx`); a direct `idleTimeout` prop
 * takes precedence over the preference value.
 *
 * @param children    - React subtree that requires wallet context.
 * @param idleTimeout - Inactivity duration in milliseconds before
 *                      auto-disconnect. `0` disables the feature (default).
 *                      Injectable for deterministic tests via fake timers.
 */
export function WalletProvider({
  children,
  idleTimeout: propIdleTimeout,
}: {
  children: ReactNode;
  idleTimeout?: number;
}) {
  const { preferences } = usePreferences();
  /**
   * Prop takes precedence over the stored preference so tests can inject an
   * exact value without touching `localStorage`.
   */
  const idleTimeout = propIdleTimeout !== undefined ? propIdleTimeout : preferences.idleDisconnectMs;

  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<StellarNetwork | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { showSuccess, showError } = useSafeToast();

  /**
   * Ref that holds the active idle `setTimeout` handle.
   * Using a ref (rather than state) avoids re-renders when the timer is reset
   * and ensures `clearTimeout` always receives the most current handle even
   * inside stale closures.
   */
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const STORAGE_KEY = 'wallet_connected_address';

  /**
   * Tracks whether the initial localStorage rehydration effect has run.
   * Set to `true` synchronously *inside* the rehydration effect (before
   * `setAddress`) so that `WalletAnnouncer` can distinguish the boot-time
   * address restoration (silent) from a subsequent user-driven connect.
   *
   * Using a `ref` (not `state`) deliberately: we do not want an extra render
   * cycle — the value is consumed only by `WalletAnnouncer`'s effect guard.
   */
  const hydratedRef = useRef(false);  const disconnect = useCallback(() => {
    setAddress(null);
    setNetwork(null);
    removeItem(STORAGE_KEY_ADDRESS);
    removeItem(STORAGE_KEY_NETWORK);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!address || idleTimeout <= 0) {
      return;
    }
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      disconnect();
      showSuccess({
        title: 'Session expired',
        description: 'You have been disconnected due to inactivity.',
      });
    }, idleTimeout);
  }, [address, idleTimeout, disconnect, showSuccess]);

  // Rehydrate address and network from storage on mount (client only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedAddress = getItem(STORAGE_KEY_ADDRESS);
    const storedNetwork = getItem(STORAGE_KEY_NETWORK);
    if (storedAddress) {
      setAddress(storedAddress);
    }
    if (storedNetwork && ['Mainnet', 'Testnet', 'Futurenet', 'Unknown'].includes(storedNetwork)) {
      setNetwork(storedNetwork as StellarNetwork);
    }
    // Mark hydration complete.  This must happen *after* the potential
    // setAddress call so that WalletAnnouncer's effect — which runs after
    // this one due to child-before-parent effect ordering — still sees
    // hydratedRef.current === false during the rehydration update.
    // We schedule it as a microtask to run after all synchronous effects in
    // this batch (including the child WalletAnnouncer's effect) have fired.
    Promise.resolve().then(() => {
      hydratedRef.current = true;
    });
  }, []);

  /**
   * Idle auto-disconnect effect.
   *
   * Lifecycle:
   * 1. Skipped entirely on the server (`typeof window === 'undefined'`),
   *    when no wallet is connected, or when the feature is disabled
   *    (`idleTimeout === 0`).
   * 2. Registers passive listeners for all {@link IDLE_EVENTS} on `window`.
   * 3. Starts the initial countdown via {@link resetTimer}.
   * 4. Cleanup function (runs on unmount or when deps change):
   *    - Removes every listener added in step 2 — no leaks.
   *    - Clears the pending timeout so no phantom disconnect fires after
   *      the component unmounts or the address is cleared.
   */
  useEffect(() => {
    if (typeof window === 'undefined' || !address || idleTimeout <= 0) {
      return;
    }

    const handleActivity = () => resetTimer();

    IDLE_EVENTS.forEach(evt =>
      window.addEventListener(evt, handleActivity, { passive: true }),
    );

    resetTimer();

    return () => {
      IDLE_EVENTS.forEach(evt =>
        window.removeEventListener(evt, handleActivity),
      );
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [address, idleTimeout, resetTimer]);

  /**
   * Initiates a wallet connection attempt.
   *
   * ⚠️  MOCK IMPLEMENTATION — real Freighter integration pending.
   *
   * Steps performed by the current mock:
   *   1. Sets `isConnecting` to `true` and clears any previous `error`.
   *   2. Waits exactly **1 second** via `setTimeout` to simulate network /
   *      extension latency (no real wallet API is called).
   *   3. Sets `address` to the hard-coded {@link MOCKED_STELLAR_ADDRESS}
   *      constant, sets `network` to "Testnet", and persists both to `localStorage`.
   *   4. Resets `isConnecting` to `false` in the `finally` block.
   *
   * Intended behaviour (post-integration):
   *   1. Guard against SSR (`typeof window === 'undefined'`).
   *   2. Detect Freighter via `window.freighter`; surface
   *      {@link FREIGHTER_NOT_INSTALLED} if absent.
   *   3. Call `window.freighter.requestAccess()`; map a user-rejection to
   *      {@link USER_REJECTED}.
   *   4. Detect the active network from Freighter wallet state.
   *   5. Validate and persist the returned Stellar public key and network.
   */
  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      // ── MOCK: simulates a 1-second connection delay. ──────────────────────
      // Replace this block with the real Freighter requestAccess() call when
      // the Freighter integration milestone is implemented.
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // ── MOCK: hard-coded Stellar G-address for UI development only. ───────
      // Replace with the public key returned by window.freighter.getPublicKey()
      // once the real wallet integration is in place.
      setAddress(MOCKED_STELLAR_ADDRESS);
      setItem(STORAGE_KEY_ADDRESS, MOCKED_STELLAR_ADDRESS);
      // ── MOCK: hard-coded network for UI development (Testnet). ────────────
      // Replace with network detection from window.freighter.getNetworkDetails()
      // once the real wallet integration is in place.
      const mockNetwork: StellarNetwork = 'Testnet';
      setNetwork(mockNetwork);
      setItem(STORAGE_KEY_NETWORK, mockNetwork);
    } catch (_err) {
      const message = 'Failed to connect wallet';
      /**
       * Set inline error state so button-level consumers can render it.
       * The toast below provides an assertive screen-reader announcement;
       * avoid duplicating the message in aria-live regions by keeping a
       * single source-of-truth in the toast system.
       */
      setError(message);
      /**
       * Surface the failure via the toast system so screen-reader users
       * receive an assertive `role="alert"` announcement in addition to
       * the inline error rendered by consuming components.
       */
      showError({
        title: 'Wallet connection failed',
        description: message,
      });
    } finally {
      setIsConnecting(false);
    }
  }, [showError]);

  return (
    <WalletContext.Provider value={{ address, isConnecting, error, connect, disconnect }}>
      <WalletAnnouncer hydratedRef={hydratedRef} />
      {children}
    </WalletContext.Provider>
  );
}

/**
 * Accesses the wallet connection context from any client component.
 *
 * Returns the full {@link WalletContextType} value: the connected Stellar
 * address, active network, connection-in-progress flag, last error string,
 * and the `connect` / `disconnect` actions.
 *
 * **Safety guard:** throws an `Error` with a descriptive message if called
 * outside of a `<WalletProvider>` subtree. This makes misconfigured trees
 * fail fast and visibly during development rather than silently reading
 * `undefined`.
 *
 * @example
 * ```tsx
 * const { address, network, isConnecting, connect, disconnect, error } = useWallet();
 * ```
 *
 * @returns The current {@link WalletContextType} value.
 * @throws {Error} `"useWallet must be used within a WalletProvider"` when the
 *   hook is called outside of a `<WalletProvider>`.
 */
export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
