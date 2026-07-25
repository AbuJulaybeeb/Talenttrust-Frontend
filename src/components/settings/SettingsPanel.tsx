'use client';

import React, { useEffect, useRef, useState } from 'react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type Theme = 'light' | 'dark' | 'system';
type AmountFormat = 'usd' | 'eur' | 'gbp' | 'ngn' | 'compact';
type ToastDensity = 'comfortable' | 'compact';

interface StoredPreferences {
  theme?: Theme;
  amountFormat?: AmountFormat;
  toastDensity?: ToastDensity;
  quietMode?: boolean;
}

const STORAGE_KEY = 'talenttrust-user-preferences';

const themes: Array<{ value: Theme; label: string }> = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

const currencies: Array<{ value: AmountFormat; label: string }> = [
  { value: 'usd', label: 'USD' },
  { value: 'eur', label: 'EUR' },
  { value: 'gbp', label: 'GBP' },
  { value: 'ngn', label: 'NGN' },
  { value: 'compact', label: 'Compact' },
];

const densities: Array<{ value: ToastDensity; label: string }> = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'compact', label: 'Compact' },
];

function readPreferences(): Required<StoredPreferences> {
  const defaults: Required<StoredPreferences> = {
    theme: 'system',
    amountFormat: 'usd',
    toastDensity: 'comfortable',
    quietMode: false,
  };

  if (typeof window === 'undefined') return defaults;

  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}') as StoredPreferences;
    return { ...defaults, ...stored };
  } catch {
    return defaults;
  }
}

function savePreferences(preferences: Required<StoredPreferences>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

interface RadioGroupProps<T extends string> {
  label: string;
  name: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}

function RadioGroup<T extends string>({
  label,
  name,
  value,
  options,
  onChange,
}: RadioGroupProps<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  const moveFocus = (index: number) => {
    const nextIndex = (index + options.length) % options.length;
    onChange(options[nextIndex].value);
    refs.current[nextIndex]?.focus();
  };

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-[var(--foreground)]">{label}</legend>
      <div
        className="flex flex-wrap gap-2"
        role="radiogroup"
        aria-label={label}
      >
        {options.map((option, index) => {
          const checked = option.value === value;
          return (
            <button
              key={option.value}
              ref={(element) => {
                refs.current[index] = element;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked || (selectedIndex === 0 && index === 0) ? 0 : -1}
              className={`rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 ${
                checked
                  ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                  : 'border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]'
              }`}
              onClick={() => onChange(option.value)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                  event.preventDefault();
                  moveFocus(index + 1);
                } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                  event.preventDefault();
                  moveFocus(index - 1);
                } else if (event.key === 'Home') {
                  event.preventDefault();
                  moveFocus(0);
                } else if (event.key === 'End') {
                  event.preventDefault();
                  moveFocus(options.length - 1);
                }
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <span className="sr-only" id={`${name}-description`}>{label}</span>
    </fieldset>
  );
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [preferences, setPreferences] = useState<Required<StoredPreferences>>(readPreferences);

  useEffect(() => {
    if (isOpen) setPreferences(readPreferences());
  }, [isOpen]);

  const update = <K extends keyof Required<StoredPreferences>>(
    key: K,
    value: Required<StoredPreferences>[K],
  ) => {
    setPreferences((current) => {
      const next = { ...current, [key]: value };
      savePreferences(next);
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <aside
      aria-label="Settings"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-[var(--background)] p-6 shadow-xl"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">Settings</h2>
        <button
          type="button"
          aria-label="Close settings"
          className="rounded-md p-2 text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
          onClick={onClose}
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>

      <div className="space-y-8">
        <section aria-labelledby="appearance-heading" className="space-y-6">
          <h3 id="appearance-heading" className="text-base font-semibold text-[var(--foreground)]">Appearance</h3>
          <RadioGroup
            label="Theme"
            name="theme"
            value={preferences.theme}
            options={themes}
            onChange={(value) => update('theme', value)}
          />
          <RadioGroup
            label="Currency Display"
            name="currency"
            value={preferences.amountFormat}
            options={currencies}
            onChange={(value) => update('amountFormat', value)}
          />
        </section>

        <section aria-labelledby="notifications-heading" className="space-y-6">
          <h3 id="notifications-heading" className="text-base font-semibold text-[var(--foreground)]">Notifications</h3>
          <RadioGroup
            label="Toast Density"
            name="toast-density"
            value={preferences.toastDensity}
            options={densities}
            onChange={(value) => update('toastDensity', value)}
          />
          <button
            type="button"
            role="switch"
            aria-checked={preferences.quietMode}
            aria-label="Quiet Mode"
            className="flex w-full items-center justify-between rounded-md p-2 text-left text-sm text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
            onClick={() => update('quietMode', !preferences.quietMode)}
          >
            <span>Quiet Mode</span>
            <span aria-hidden="true" className="rounded-full border px-2 py-1">
              {preferences.quietMode ? 'On' : 'Off'}
            </span>
          </button>
        </section>
      </div>
    </aside>
  );
}

export default SettingsPanel;
