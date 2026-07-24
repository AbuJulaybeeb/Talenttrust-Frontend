'use client';

import React from 'react';
import { usePreferences, ListDensity } from '@/lib/preferences';

/**
 * DensityToggle — a radio-group toggle that lets users choose between
 * `comfortable` (default, generous padding) and `compact` (reduced spacing)
 * list density.  The preference is persisted through `PreferencesProvider`.
 *
 * Accessibility:
 * - Uses `role="radiogroup"` / `role="radio"` pattern (buttons with aria-checked)
 *   to match the existing `SettingsPanel` toggle style.
 * - Labelled via a visible `<label>` element whose `id` is referenced by
 *   `aria-labelledby` on the radiogroup.
 * - Every option has an accessible name derived from its text content.
 * - Focus-visible ring styles are consistent with other panel controls.
 */
export function DensityToggle() {
  const { preferences, updatePreference } = usePreferences();

  const options: { value: ListDensity; label: string }[] = [
    { value: 'comfortable', label: 'Comfortable' },
    { value: 'compact', label: 'Compact' },
  ];

  return (
    <div>
      <label
        id="list-density-label"
        className="block text-sm font-medium mb-2 text-[var(--foreground)]"
      >
        List Density
      </label>
      <div
        role="radiogroup"
        aria-labelledby="list-density-label"
        aria-label="List Density"
        className="grid grid-cols-2 gap-2"
      >
        {options.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => updatePreference('listDensity', value)}
            role="radio"
            aria-checked={preferences.listDensity === value}
            className={`px-3 py-2 text-sm rounded-md border capitalize transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 ${
              preferences.listDensity === value
                ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--muted-foreground)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
