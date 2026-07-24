import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { axe } from 'jest-axe';
import { DensityToggle } from '../DensityToggle';
import { PreferencesProvider, usePreferences } from '@/lib/preferences';
import { resetCache } from '@/lib/safeStorage';

const KEY = 'talenttrust-user-preferences';

const renderWithProvider = (ui: React.ReactElement) =>
  render(<PreferencesProvider>{ui}</PreferencesProvider>);

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PreferencesProvider>{children}</PreferencesProvider>
);

beforeEach(() => {
  localStorage.clear();
  resetCache();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('DensityToggle – rendering', () => {
  it('renders a radiogroup labelled "List Density"', () => {
    renderWithProvider(<DensityToggle />);
    expect(screen.getByRole('radiogroup', { name: /list density/i })).toBeInTheDocument();
  });

  it('renders two options: Comfortable and Compact', () => {
    renderWithProvider(<DensityToggle />);
    const group = screen.getByRole('radiogroup', { name: /list density/i });
    const options = within(group).getAllByRole('radio');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveAccessibleName('Comfortable');
    expect(options[1]).toHaveAccessibleName('Compact');
  });

  it('defaults to comfortable selected', () => {
    renderWithProvider(<DensityToggle />);
    const group = screen.getByRole('radiogroup', { name: /list density/i });
    expect(within(group).getByRole('radio', { name: /comfortable/i }).getAttribute('aria-checked')).toBe('true');
    expect(within(group).getByRole('radio', { name: /compact/i }).getAttribute('aria-checked')).toBe('false');
  });
});

describe('DensityToggle – toggle changes density', () => {
  it('switches to compact when compact is clicked', () => {
    renderWithProvider(<DensityToggle />);
    const group = screen.getByRole('radiogroup', { name: /list density/i });
    const compactBtn = within(group).getByRole('radio', { name: /compact/i });

    fireEvent.click(compactBtn);

    expect(compactBtn.getAttribute('aria-checked')).toBe('true');
    expect(within(group).getByRole('radio', { name: /comfortable/i }).getAttribute('aria-checked')).toBe('false');
  });

  it('switches back to comfortable from compact', () => {
    renderWithProvider(<DensityToggle />);
    const group = screen.getByRole('radiogroup', { name: /list density/i });
    const compactBtn = within(group).getByRole('radio', { name: /compact/i });
    const comfortableBtn = within(group).getByRole('radio', { name: /comfortable/i });

    fireEvent.click(compactBtn);
    expect(compactBtn.getAttribute('aria-checked')).toBe('true');

    fireEvent.click(comfortableBtn);
    expect(comfortableBtn.getAttribute('aria-checked')).toBe('true');
    expect(compactBtn.getAttribute('aria-checked')).toBe('false');
  });
});

describe('DensityToggle – persists to localStorage', () => {
  it('persists compact to localStorage when compact is clicked', () => {
    renderWithProvider(<DensityToggle />);
    const group = screen.getByRole('radiogroup', { name: /list density/i });
    fireEvent.click(within(group).getByRole('radio', { name: /compact/i }));

    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    expect(saved.listDensity).toBe('compact');
  });

  it('persists comfortable to localStorage when comfortable is clicked', () => {
    localStorage.setItem(KEY, JSON.stringify({ listDensity: 'compact' }));
    renderWithProvider(<DensityToggle />);
    const group = screen.getByRole('radiogroup', { name: /list density/i });
    fireEvent.click(within(group).getByRole('radio', { name: /comfortable/i }));

    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    expect(saved.listDensity).toBe('comfortable');
  });

  it('restores compact from localStorage on remount', () => {
    localStorage.setItem(KEY, JSON.stringify({ listDensity: 'compact' }));
    renderWithProvider(<DensityToggle />);
    const group = screen.getByRole('radiogroup', { name: /list density/i });
    expect(within(group).getByRole('radio', { name: /compact/i }).getAttribute('aria-checked')).toBe('true');
    expect(within(group).getByRole('radio', { name: /comfortable/i }).getAttribute('aria-checked')).toBe('false');
  });
});

describe('DensityToggle – invalid stored value falls back', () => {
  it('falls back to comfortable when stored listDensity is invalid', () => {
    localStorage.setItem(KEY, JSON.stringify({ listDensity: 'wide' }));
    renderWithProvider(<DensityToggle />);
    const group = screen.getByRole('radiogroup', { name: /list density/i });
    expect(within(group).getByRole('radio', { name: /comfortable/i }).getAttribute('aria-checked')).toBe('true');
  });

  it('falls back to comfortable when stored value is a number', () => {
    localStorage.setItem(KEY, JSON.stringify({ listDensity: 42 }));
    renderWithProvider(<DensityToggle />);
    const group = screen.getByRole('radiogroup', { name: /list density/i });
    expect(within(group).getByRole('radio', { name: /comfortable/i }).getAttribute('aria-checked')).toBe('true');
  });

  it('falls back to comfortable when localStorage is corrupt JSON', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem(KEY, '%%%not-json%%%');
    renderWithProvider(<DensityToggle />);
    const group = screen.getByRole('radiogroup', { name: /list density/i });
    expect(within(group).getByRole('radio', { name: /comfortable/i }).getAttribute('aria-checked')).toBe('true');
  });

  it('falls back to comfortable when localStorage is absent (SSR no-op)', () => {
    // Simulate SSR: no stored value at all.
    localStorage.clear();
    renderWithProvider(<DensityToggle />);
    const group = screen.getByRole('radiogroup', { name: /list density/i });
    expect(within(group).getByRole('radio', { name: /comfortable/i }).getAttribute('aria-checked')).toBe('true');
  });
});

describe('DensityToggle – PreferencesProvider hook integration', () => {
  it('updatePreference("listDensity", "compact") is reflected in hook state', () => {
    const { result } = renderHook(() => usePreferences(), { wrapper });
    expect(result.current.preferences.listDensity).toBe('comfortable');

    act(() => {
      result.current.updatePreference('listDensity', 'compact');
    });

    expect(result.current.preferences.listDensity).toBe('compact');
  });

  it('listDensity preference is persisted and re-hydrated', () => {
    const { result } = renderHook(() => usePreferences(), { wrapper });
    act(() => {
      result.current.updatePreference('listDensity', 'compact');
    });

    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    expect(saved.listDensity).toBe('compact');

    // New hook instance sees the saved value
    const { result: result2 } = renderHook(() => usePreferences(), { wrapper });
    act(() => {}); // flush effects
    expect(result2.current.preferences.listDensity).toBe('compact');
  });
});

describe('DensityToggle – accessibility', () => {
  it('all buttons have focus-visible ring classes', () => {
    renderWithProvider(<DensityToggle />);
    const group = screen.getByRole('radiogroup', { name: /list density/i });
    within(group).getAllByRole('radio').forEach((btn) => {
      expect(btn.className).toMatch(/focus-visible/);
    });
  });

  it('passes axe accessibility audit', async () => {
    const { container } = renderWithProvider(<DensityToggle />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe audit with compact selected', async () => {
    localStorage.setItem(KEY, JSON.stringify({ listDensity: 'compact' }));
    const { container } = renderWithProvider(<DensityToggle />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
