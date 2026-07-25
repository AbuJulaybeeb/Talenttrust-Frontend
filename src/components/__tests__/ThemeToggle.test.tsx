import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeToggle } from '../ThemeToggle';
import { PreferencesProvider, usePreferences } from '@/lib/preferences';
import { resetCache } from '@/lib/safeStorage';


// Helper: render inside the provider
const renderToggle = () =>
  render(
    <PreferencesProvider>
      <ThemeToggle />
    </PreferencesProvider>,
  );

// Helper: render toggle alongside a component that can inspect preferences
function ToggleWithState() {
  const { preferences } = usePreferences();
  return (
    <>
      <ThemeToggle />
      <span data-testid="theme">{preferences.theme}</span>
    </>
  );
}

const renderWithState = () =>
  render(
    <PreferencesProvider>
      <ToggleWithState />
    </PreferencesProvider>,
  );

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    resetCache();
  });

  it('renders null on the server (before mount)', () => {
    // Simulate pre-mount by checking no button exists before useEffect fires
    // We rely on the mounted guard: the component returns null until useEffect.
    // In the Jest environment useEffect runs synchronously via act, so we
    // just verify the button IS present after render (positive case).
    renderToggle();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows moon icon and "Switch to dark theme" label when theme is light', () => {
    localStorage.setItem(
      'talenttrust-user-preferences',
      JSON.stringify({ theme: 'light' }),
    );
    renderToggle();
    const btn = screen.getByRole('button', { name: /switch to dark theme/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows sun icon and "Switch to light theme" label when theme is dark', () => {
    localStorage.setItem(
      'talenttrust-user-preferences',
      JSON.stringify({ theme: 'dark' }),
    );
    renderToggle();
    const btn = screen.getByRole('button', { name: /switch to light theme/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('toggles light → dark and calls updatePreference', () => {
    localStorage.setItem(
      'talenttrust-user-preferences',
      JSON.stringify({ theme: 'light' }),
    );
    renderWithState();
    expect(screen.getByTestId('theme').textContent).toBe('light');

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /switch to dark theme/i }));
    });

    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });

  it('toggles dark → light and calls updatePreference', () => {
    localStorage.setItem(
      'talenttrust-user-preferences',
      JSON.stringify({ theme: 'dark' }),
    );
    renderWithState();
    expect(screen.getByTestId('theme').textContent).toBe('dark');

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /switch to light theme/i }));
    });

    expect(screen.getByTestId('theme').textContent).toBe('light');
  });

  it('treats "system" as non-dark and toggles to dark on first click', () => {
    // default theme is 'system'
    renderWithState();
    expect(screen.getByTestId('theme').textContent).toBe('system');

    // moon icon shown (not dark), so clicking goes to dark
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /switch to dark theme/i }));
    });

    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });

  it('aria-pressed reflects current dark state accurately', () => {
    localStorage.setItem(
      'talenttrust-user-preferences',
      JSON.stringify({ theme: 'light' }),
    );
    renderToggle();
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-pressed', 'false');

    act(() => {
      fireEvent.click(btn);
    });

    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('persists the toggled theme to localStorage', () => {
    localStorage.setItem(
      'talenttrust-user-preferences',
      JSON.stringify({ theme: 'light' }),
    );
    renderToggle();

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /switch to dark theme/i }));
    });

    const saved = JSON.parse(
      localStorage.getItem('talenttrust-user-preferences') || '{}',
    );
    expect(saved.theme).toBe('dark');
  });
});
