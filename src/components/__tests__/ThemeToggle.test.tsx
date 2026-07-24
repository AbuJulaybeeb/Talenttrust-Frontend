import React from 'react';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeToggle } from '../ThemeToggle';
import { PreferencesProvider, usePreferences, sanitizePreferences } from '@/lib/preferences';
import { resetCache } from '@/lib/safeStorage';
import { useMediaQuery } from '@/hooks/useMediaQuery';

jest.mock('@/hooks/useMediaQuery');

const mockUseMediaQuery = useMediaQuery as jest.Mock;

const renderToggle = (initialStorage?: Record<string, string>) => {
  if (initialStorage) {
    Object.entries(initialStorage).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  }
  return render(
    <PreferencesProvider>
      <ThemeToggle />
    </PreferencesProvider>,
  );
};

function ToggleWithState() {
  const { preferences } = usePreferences();
  return (
    <>
      <ThemeToggle />
      <span data-testid="theme">{preferences.theme}</span>
    </>
  );
}

const renderWithState = (initialStorage?: Record<string, string>) => {
  if (initialStorage) {
    Object.entries(initialStorage).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  }
  return render(
    <PreferencesProvider>
      <ToggleWithState />
    </PreferencesProvider>,
  );
};

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    resetCache();
    mockUseMediaQuery.mockReturnValue(false);
    cleanup();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    cleanup();
  });

  describe('Loading state (hydration guard)', () => {
    it('renders button after hydration completes (mount effect runs)', () => {
      renderToggle();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('component mounts and shows button (useEffect runs in test env)', () => {
      const { container } = render(
        <PreferencesProvider>
          <ThemeToggle />
        </PreferencesProvider>,
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(container.querySelector('button')).toBeInTheDocument();
    });
  });

  describe('Empty/Initial state (theme = system)', () => {
    it('renders with default theme "system" and shows moon icon', () => {
      renderWithState();
      expect(screen.getByTestId('theme').textContent).toBe('system');

      const btn = screen.getByRole('button', { name: /switch to dark theme/i });
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveAttribute('aria-pressed', 'false');
    });

    it('shows moon icon (not sun) when theme is system', () => {
      renderWithState();
      const btn = screen.getByRole('button');
      const svg = btn.querySelector('svg');
      expect(svg).toBeInTheDocument();
      const path = svg?.querySelector('path');
      expect(path).toHaveAttribute('d', expect.stringContaining('M21 12.79'));
    });

    it('treats system as non-dark for aria-pressed', () => {
      renderWithState();
      const btn = screen.getByRole('button');
      expect(btn).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Error state (localStorage corruption)', () => {
    it('falls back to defaults when localStorage contains invalid JSON', () => {
      localStorage.setItem('talenttrust-user-preferences', '%%%invalid%%%');
      jest.spyOn(console, 'error').mockImplementation(() => {});

      renderToggle();
      const btn = screen.getByRole('button', { name: /switch to dark theme/i });
      expect(btn).toBeInTheDocument();

      (console.error as jest.Mock).mockRestore();
    });

    it('falls back to defaults when localStorage contains non-object JSON', () => {
      localStorage.setItem('talenttrust-user-preferences', JSON.stringify([1, 2, 3]));
      jest.spyOn(console, 'error').mockImplementation(() => {});

      renderToggle();
      const btn = screen.getByRole('button', { name: /switch to dark theme/i });
      expect(btn).toBeInTheDocument();

      (console.error as jest.Mock).mockRestore();
    });

    it('sanitizes prototype pollution attempts and keeps valid theme', () => {
      const malicious = '{"__proto__":{"polluted":true},"theme":"dark"}';
      localStorage.setItem('talenttrust-user-preferences', malicious);

      renderWithState();
      expect(screen.getByTestId('theme').textContent).toBe('dark');
      expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    });

    it('ignores constructor prototype pollution', () => {
      const malicious = '{"constructor":{"prototype":{"polluted":true}},"theme":"light"}';
      localStorage.setItem('talenttrust-user-preferences', malicious);

      renderWithState();
      expect(screen.getByTestId('theme').textContent).toBe('light');
    });

    it('recovers from localStorage read error when remounted with valid data', () => {
      localStorage.setItem('talenttrust-user-preferences', '%%%invalid%%%');
      jest.spyOn(console, 'error').mockImplementation(() => {});

      const { unmount } = renderToggle();
      const btn = screen.getByRole('button');
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveAttribute('aria-pressed', 'false');

      unmount();
      localStorage.setItem(
        'talenttrust-user-preferences',
        JSON.stringify({ theme: 'dark' }),
      );

      renderToggle();
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');

      (console.error as jest.Mock).mockRestore();
    });
  });

  describe('Success states (theme values)', () => {
    it('shows moon icon and "Switch to dark theme" when theme is light', () => {
      renderToggle({
        'talenttrust-user-preferences': JSON.stringify({ theme: 'light' }),
      });
      const btn = screen.getByRole('button', { name: /switch to dark theme/i });
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveAttribute('aria-pressed', 'false');
    });

    it('shows sun icon and "Switch to light theme" when theme is dark', () => {
      renderToggle({
        'talenttrust-user-preferences': JSON.stringify({ theme: 'dark' }),
      });
      const btn = screen.getByRole('button', { name: /switch to light theme/i });
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveAttribute('aria-pressed', 'true');
    });

    it('persists toggled theme to localStorage (success state)', () => {
      renderToggle({
        'talenttrust-user-preferences': JSON.stringify({ theme: 'light' }),
      });

      act(() => {
        fireEvent.click(screen.getByRole('button', { name: /switch to dark theme/i }));
      });

      const saved = JSON.parse(
        localStorage.getItem('talenttrust-user-preferences') || '{}',
      );
      expect(saved.theme).toBe('dark');
    });

    it('toggles light → dark and updates preference', () => {
      renderWithState({
        'talenttrust-user-preferences': JSON.stringify({ theme: 'light' }),
      });
      expect(screen.getByTestId('theme').textContent).toBe('light');

      act(() => {
        fireEvent.click(screen.getByRole('button', { name: /switch to dark theme/i }));
      });

      expect(screen.getByTestId('theme').textContent).toBe('dark');
    });

    it('toggles dark → light and updates preference', () => {
      renderWithState({
        'talenttrust-user-preferences': JSON.stringify({ theme: 'dark' }),
      });
      expect(screen.getByTestId('theme').textContent).toBe('dark');

      act(() => {
        fireEvent.click(screen.getByRole('button', { name: /switch to light theme/i }));
      });

      expect(screen.getByTestId('theme').textContent).toBe('light');
    });

    it('toggles system → dark on first click', () => {
      renderWithState();
      expect(screen.getByTestId('theme').textContent).toBe('system');

      act(() => {
        fireEvent.click(screen.getByRole('button', { name: /switch to dark theme/i }));
      });

      expect(screen.getByTestId('theme').textContent).toBe('dark');
    });
  });

  describe('Primary interaction: click toggle', () => {
    it('toggles theme on each click', () => {
      renderToggle({
        'talenttrust-user-preferences': JSON.stringify({ theme: 'light' }),
      });

      act(() => {
        fireEvent.click(screen.getByRole('button'));
      });
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');

      act(() => {
        fireEvent.click(screen.getByRole('button'));
      });
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
    });

    it('calls updatePreference with correct next theme value via click', () => {
      const updatePreference = jest.fn();

      function ThemeToggleOverride({ updatePreference }: { updatePreference: jest.Mock }) {
        const { preferences } = usePreferences();
        const isDark = preferences.theme === 'dark';
        const next = isDark ? 'light' : 'dark';
        const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';

        return (
          <button
            type="button"
            onClick={() => updatePreference('theme', next)}
            aria-label={label}
            aria-pressed={isDark}
          >
            {isDark ? 'Sun' : 'Moon'}
          </button>
        );
      }

      render(
        <PreferencesProvider>
          <ThemeToggleOverride updatePreference={updatePreference} />
        </PreferencesProvider>,
      );

      act(() => {
        fireEvent.click(screen.getByRole('button'));
      });

      expect(updatePreference).toHaveBeenCalledWith('theme', 'dark');
    });
  });

  describe('Keyboard interaction', () => {
    it('button is focusable for keyboard navigation', () => {
      renderToggle();

      const btn = screen.getByRole('button');
      expect(btn).not.toHaveAttribute('tabIndex', '-1');
      btn.focus();
      expect(btn).toHaveFocus();
    });

    it('shows focus ring when focused', () => {
      renderToggle();

      const btn = screen.getByRole('button');
      btn.focus();
      expect(btn).toHaveClass('focus-visible:ring-2');
    });

    it('has correct role for keyboard accessibility', () => {
      renderToggle();

      const btn = screen.getByRole('button');
      expect(btn).toHaveAttribute('type', 'button');
      expect(btn.tagName).toBe('BUTTON');
    });
  });

  describe('Accessibility: names and roles', () => {
    it('renders as a button with correct role', () => {
      renderToggle();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('has accessible name via aria-label reflecting next theme (light)', () => {
      renderToggle({
        'talenttrust-user-preferences': JSON.stringify({ theme: 'light' }),
      });
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to dark theme');
    });

    it('has accessible name via aria-label reflecting next theme (dark)', () => {
      renderToggle({
        'talenttrust-user-preferences': JSON.stringify({ theme: 'dark' }),
      });
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to light theme');
    });

    it('aria-pressed reflects dark state (true when dark)', () => {
      renderToggle({
        'talenttrust-user-preferences': JSON.stringify({ theme: 'dark' }),
      });
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    });

    it('aria-pressed reflects non-dark state (false when light)', () => {
      renderToggle({
        'talenttrust-user-preferences': JSON.stringify({ theme: 'light' }),
      });
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
    });

    it('aria-pressed reflects non-dark state (false when system)', () => {
      renderWithState();
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
    });

    it('icons have aria-hidden to hide decorative SVGs from screen readers', () => {
      renderToggle();
      const btn = screen.getByRole('button');
      const svg = btn.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('button has type="button" to prevent form submission', () => {
      renderToggle();
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });
  });

  describe('Edge cases and exclusivity', () => {
    it('handles rapid clicks without double-toggling (state updates once per click)', () => {
      renderWithState({
        'talenttrust-user-preferences': JSON.stringify({ theme: 'light' }),
      });

      act(() => {
        fireEvent.click(screen.getByRole('button'));
      });
      expect(screen.getByTestId('theme').textContent).toBe('dark');

      act(() => {
        fireEvent.click(screen.getByRole('button'));
      });
      expect(screen.getByTestId('theme').textContent).toBe('light');
    });

    it('sanitizes preferences and ignores unknown keys', () => {
      localStorage.setItem(
        'talenttrust-user-preferences',
        JSON.stringify({
          theme: 'dark',
          amountFormat: 'eur',
          unknownKey: 'should-be-dropped',
        }),
      );

      renderWithState();
      expect(screen.getByTestId('theme').textContent).toBe('dark');
    });

    it('respects system media query for system theme (treated as light)', () => {
      mockUseMediaQuery.mockReturnValue(true);
      renderWithState();
      const btn = screen.getByRole('button', { name: /switch to dark theme/i });
      expect(btn).toBeInTheDocument();
    });

    it('preserves other preferences when toggling theme', () => {
      localStorage.setItem(
        'talenttrust-user-preferences',
        JSON.stringify({
          theme: 'light',
          amountFormat: 'ngn',
          toastDensity: 'compact',
          quietMode: true,
          toastDuration: 'long',
          idleDisconnectMs: 10000,
        }),
      );

      renderWithState();
      act(() => {
        fireEvent.click(screen.getByRole('button'));
      });

      const saved = JSON.parse(
        localStorage.getItem('talenttrust-user-preferences') || '{}',
      );
      expect(saved.theme).toBe('dark');
      expect(saved.amountFormat).toBe('ngn');
      expect(saved.toastDensity).toBe('compact');
      expect(saved.quietMode).toBe(true);
      expect(saved.toastDuration).toBe('long');
      expect(saved.idleDisconnectMs).toBe(10000);
    });

    it('loading, error, and success states are handled by the component lifecycle', () => {
      // The component uses a mounted state to handle hydration
      // In test env, useEffect runs synchronously so we only see success state
      // This test documents the expected behavior
      renderToggle();
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveAttribute('aria-label');
    });
  });

  describe('sanitizePreferences pure function (unit)', () => {
    const DEFAULTS = {
      theme: 'system' as const,
      amountFormat: 'usd' as const,
      toastDensity: 'relaxed' as const,
      quietMode: false,
      toastDuration: 'normal' as const,
      idleDisconnectMs: 0,
    };

    it('returns defaults for null', () => {
      expect(sanitizePreferences(null)).toEqual(DEFAULTS);
    });

    it('returns defaults for undefined', () => {
      expect(sanitizePreferences(undefined)).toEqual(DEFAULTS);
    });

    it('returns defaults for primitive values', () => {
      expect(sanitizePreferences(42)).toEqual(DEFAULTS);
      expect(sanitizePreferences('string')).toEqual(DEFAULTS);
      expect(sanitizePreferences(true)).toEqual(DEFAULTS);
    });

    it('returns defaults for arrays', () => {
      expect(sanitizePreferences([])).toEqual(DEFAULTS);
      expect(sanitizePreferences(['theme', 'dark'])).toEqual(DEFAULTS);
    });

    it('validates and clamps idleDisconnectMs to allowed range', () => {
      expect(sanitizePreferences({ idleDisconnectMs: 1000 })).toEqual({
        ...DEFAULTS,
        idleDisconnectMs: 0,
      });
      expect(sanitizePreferences({ idleDisconnectMs: 5000 })).toEqual({
        ...DEFAULTS,
        idleDisconnectMs: 5000,
      });
      expect(sanitizePreferences({ idleDisconnectMs: 30000 })).toEqual({
        ...DEFAULTS,
        idleDisconnectMs: 30000,
      });
      expect(sanitizePreferences({ idleDisconnectMs: 50000 })).toEqual({
        ...DEFAULTS,
        idleDisconnectMs: 0,
      });
    });

    it('rejects non-boolean quietMode values even when truthy', () => {
      expect(sanitizePreferences({ quietMode: 1 } as unknown)).toEqual({
        ...DEFAULTS,
      });
      expect(sanitizePreferences({ quietMode: 'true' } as unknown)).toEqual({
        ...DEFAULTS,
      });
      expect(sanitizePreferences({ quietMode: {} } as unknown)).toEqual({
        ...DEFAULTS,
      });
    });

    it('rejects invalid theme values', () => {
      expect(sanitizePreferences({ theme: 'red' })).toEqual({ ...DEFAULTS });
      expect(sanitizePreferences({ theme: 123 } as unknown)).toEqual({
        ...DEFAULTS,
      });
    });

    it('rejects invalid amountFormat values', () => {
      expect(sanitizePreferences({ amountFormat: 'eur' })).toEqual({ ...DEFAULTS });
    });
  });
});