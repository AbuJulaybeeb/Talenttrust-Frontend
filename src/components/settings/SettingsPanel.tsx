'use client';

import React, { useRef, useEffect, useState } from 'react';
import { usePreferences, Theme, AmountFormat, ToastDensity } from '@/lib/preferences';
import { exportAppDataAsJson } from '@/lib/dataExport';

const FOCUSABLE_SELECTORS =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Compares two preference objects and returns a human-readable array of
 * change descriptions, e.g. ["Theme changed to dark"].
 */
function describePreferenceChanges(
  prev: UserPreferences,
  curr: UserPreferences,
): string[] {
  const changes: string[] = [];
  if (prev.theme !== curr.theme) {
    changes.push(`Theme changed to ${curr.theme}`);
  }
  if (prev.amountFormat !== curr.amountFormat) {
    changes.push(`Currency format changed to ${curr.amountFormat}`);
  }
  if (prev.toastDensity !== curr.toastDensity) {
    changes.push(`Toast density changed to ${curr.toastDensity}`);
  }
  if (prev.quietMode !== curr.quietMode) {
    changes.push(`Quiet mode ${curr.quietMode ? 'enabled' : 'disabled'}`);
  }
  return changes;
}

const ANNOUNCE_DEBOUNCE_MS = 400;

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { preferences, isHydrated, updatePreference } = usePreferences();
  const panelRef = useRef<HTMLDivElement>(null);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleExportData = () => {
    try {
      exportAppDataAsJson();
      setExportStatus('success');
    } catch {
      setExportStatus('error');
    }
  };

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
        {/* Polite live region announcing preference changes to assistive tech */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {announcement}
        </div>

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

          {/* Layout Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Layout</h3>
            <DensityToggle />
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
          </section>

          {/* Data Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Data</h3>

            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Export your data</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Download a JSON file of everything saved in this browser so you can back it up
                  or move to another browser.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportData}
                className="w-full py-2 px-4 rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] text-sm font-medium hover:border-[var(--muted-foreground)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
              >
                Export data as JSON
              </button>
              <p role="status" aria-live="polite" className="text-xs text-[var(--muted-foreground)]">
                {exportStatus === 'success' && 'Export downloaded.'}
                {exportStatus === 'error' && 'Export failed. Please try again.'}
              </p>
            </div>
          </section>
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
