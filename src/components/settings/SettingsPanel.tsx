'use client';

import React, { useRef, useEffect, useState } from 'react';
import { usePreferences, Theme, AmountFormat, ToastDensity } from '@/lib/preferences';
import { useFetchState } from '@/hooks/useFetchState';
import {
  SettingsLoadingState,
  SettingsEmptyState,
  SettingsErrorState,
} from './SettingsStates';

const FOCUSABLE_SELECTORS =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * SettingsPanel — A settings drawer with empty, error, and loading state support.
 * 
 * Features:
 * - Uses useFetchState hook to manage preferences loading states
 * - Distinct empty state when no preferences are available
 * - Error state with keyboard-accessible retry button
 * - Proper focus management and ARIA announcements
 * - Keyboard navigation with focus trapping
 * - Accessibility: WCAG 2.1 AA compliant dialog with proper semantics
 */
export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { preferences, updatePreference } = usePreferences();
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  /**
   * Simulated fetch function that loads preferences.
   * In a real app, this would call an API endpoint.
   * 
   * For now, it returns the preferences after a short delay to simulate network latency.
   * Preferences are loaded from localStorage via usePreferences hook.
   */
  const fetchPreferences = async () => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return preferences;
  };

  const { state, error, retry } = useFetchState(fetchPreferences);

  /**
   * Initialize preferences fetch when panel opens
   */
  useEffect(() => {
    if (isOpen && !hasInitialized) {
      retry();
      setHasInitialized(true);
    }
  }, [isOpen, hasInitialized, retry]);

  /**
   * Focus management effect for modal dialog accessibility.
   * - Sets initial focus to the close button when dialog opens
   * - Implements focus trapping to prevent focus from leaving the dialog
   * - Handles Tab key wrapping from last to first element
   * - Handles Shift+Tab wrapping from first to last element
   * - Closes dialog on Escape key press
   */
  useEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    if (!panel) return;

    // Set initial focus to the close button
    const closeBtn = panel.querySelector<HTMLElement>('[aria-label="Close settings"]');
    closeBtn?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const els = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS));
        if (els.length === 0) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-panel-title"
        className="relative w-full max-w-md bg-[var(--background)] shadow-xl flex flex-col h-full border-l border-[var(--border)]"
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <h2 id="settings-panel-title" className="text-xl font-bold text-[var(--foreground)]">Settings</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--accent)] text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
            aria-label="Close settings"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Loading State */}
          {state === 'loading' && (
            <div className="p-6">
              <SettingsLoadingState message="Loading your settings..." />
            </div>
          )}

          {/* Empty State */}
          {state === 'empty' && (
            <div className="p-6">
              <SettingsEmptyState
                title="No Settings Available"
                description="Your account doesn't have any custom settings yet. Defaults will be applied."
              />
            </div>
          )}

          {/* Error State */}
          {state === 'error' && error && (
            <div className="p-6">
              <SettingsErrorState
                error={error}
                onRetry={() => retry()}
                retryLabel="Reload Settings"
              />
            </div>
          )}

          {/* Success State - Settings Form */}
          {state === 'success' && (
            <div ref={contentRef} className="p-6 space-y-8">
              {/* Appearance Section */}
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Appearance</h3>
                
                <div className="space-y-4">
                  <div>
                    <label id="theme-label" className="block text-sm font-medium mb-2 text-[var(--foreground)]">Theme</label>
                    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-labelledby="theme-label" aria-label="Theme">
                      {(['light', 'dark', 'system'] as Theme[]).map((t) => (
                        <button
                          key={t}
                          onClick={() => updatePreference('theme', t)}
                          role="radio"
                          aria-checked={preferences.theme === t}
                          className={`px-3 py-2 text-sm rounded-md border capitalize transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 ${
                            preferences.theme === t 
                              ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]' 
                              : 'border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--muted-foreground)]'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label id="currency-label" className="block text-sm font-medium mb-2 text-[var(--foreground)]">Currency Display</label>
                    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-labelledby="currency-label" aria-label="Currency Display">
                      {(['usd', 'ngn', 'compact'] as AmountFormat[]).map((f) => (
                        <button
                          key={f}
                          onClick={() => updatePreference('amountFormat', f)}
                          role="radio"
                          aria-checked={preferences.amountFormat === f}
                          className={`px-3 py-2 text-sm rounded-md border uppercase transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 ${
                            preferences.amountFormat === f 
                              ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]' 
                              : 'border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--muted-foreground)]'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Notifications Section */}
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Notifications</h3>
                
                <div className="space-y-4">
                  <div>
                    <label id="density-label" className="block text-sm font-medium mb-2 text-[var(--foreground)]">Toast Density</label>
                    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-labelledby="density-label" aria-label="Toast Density">
                      {(['relaxed', 'compact'] as ToastDensity[]).map((d) => (
                        <button
                          key={d}
                          onClick={() => updatePreference('toastDensity', d)}
                          role="radio"
                          aria-checked={preferences.toastDensity === d}
                          className={`px-3 py-2 text-sm rounded-md border capitalize transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 ${
                            preferences.toastDensity === d 
                              ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]' 
                              : 'border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--muted-foreground)]'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label id="quiet-mode-label" className="text-sm font-medium text-[var(--foreground)]">Quiet Mode</label>
                      <p className="text-xs text-[var(--muted-foreground)]">Suppress success notifications</p>
                    </div>
                    <button
                      onClick={() => updatePreference('quietMode', !preferences.quietMode)}
                      role="switch"
                      aria-checked={preferences.quietMode}
                      aria-labelledby="quiet-mode-label"
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 ${
                        preferences.quietMode ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.quietMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-[var(--border)] bg-[var(--surface)]">
          <button 
            onClick={onClose}
            className="w-full py-2 px-4 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-md font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
