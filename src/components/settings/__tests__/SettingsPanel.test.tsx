import React from 'react';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import { axe } from 'jest-axe';
import { SettingsPanel } from '../SettingsPanel';
import { PreferencesProvider } from '@/lib/preferences';
import { resetCache } from '@/lib/safeStorage';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const renderWithProvider = (ui: React.ReactElement) =>
  render(<PreferencesProvider>{ui}</PreferencesProvider>);

/** Selector matching the FOCUSABLE_SELECTORS constant used inside SettingsPanel */
const FOCUSABLE_SEL =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const getFocusableEls = () => {
  const dialog = screen.getByRole('dialog');
  return Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SEL));
};

/**
 * Return the current text content of the aria-live announcement region.
 */
function getAnnouncementText(): string {
  const region = screen.getByRole('status');
  return region.textContent ?? '';
}

describe('SettingsPanel', () => {
  beforeEach(() => {
    localStorage.clear();
    resetCache();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

beforeEach(() => {
  localStorage.clear();
  resetCache();
});

// ---------------------------------------------------------------------------
// 1. Closed state (isOpen = false)
// ---------------------------------------------------------------------------

describe('SettingsPanel – closed state', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = renderWithProvider(
      <SettingsPanel isOpen={false} onClose={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('does not render a dialog when closed', () => {
    renderWithProvider(<SettingsPanel isOpen={false} onClose={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not call onClose on Escape when closed (useEffect guard)', () => {
    // Covers line 29: if (!isOpen) return inside useEffect
    const onClose = jest.fn();
    renderWithProvider(<SettingsPanel isOpen={false} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not register a keydown listener when closed', () => {
    const addSpy = jest.spyOn(document, 'addEventListener');
    renderWithProvider(<SettingsPanel isOpen={false} onClose={() => {}} />);
    expect(addSpy).not.toHaveBeenCalledWith('keydown', expect.any(Function));
    addSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// 2. Open state – structure and accessibility
// ---------------------------------------------------------------------------

describe('SettingsPanel – open state: structure', () => {
  it('renders the dialog when isOpen is true', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('has role="dialog" and aria-modal="true"', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('aria-labelledby points to the "Settings" h2 heading', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    const dialog = screen.getByRole('dialog');
    const labelId = dialog.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    const heading = document.getElementById(labelId!);
    expect(heading).not.toBeNull();
    expect(heading!.textContent).toBe('Settings');
  });

  it('renders the "Appearance" and "Notifications" section headings', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('renders all three theme radio buttons', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    const themeGroup = screen.getByRole('radiogroup', { name: /theme/i });
    const radios = within(themeGroup).getAllByRole('radio');
    expect(radios).toHaveLength(3);
    expect(radios[0]).toHaveAccessibleName('light');
    expect(radios[1]).toHaveAccessibleName('dark');
    expect(radios[2]).toHaveAccessibleName('system');
  });

  it('renders all three currency radio buttons', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    const currencyGroup = screen.getByRole('radiogroup', { name: /currency display/i });
    const radios = within(currencyGroup).getAllByRole('radio');
    expect(radios).toHaveLength(3);
    expect(radios.map(r => r.textContent)).toEqual(['usd', 'ngn', 'compact']);
  });

  it('renders both toast density radio buttons', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    const densityGroup = screen.getByRole('radiogroup', { name: /toast density/i });
    const radios = within(densityGroup).getAllByRole('radio');
    expect(radios).toHaveLength(2);
    expect(radios[0]).toHaveAccessibleName('relaxed');
    expect(radios[1]).toHaveAccessibleName('compact');
  });

  it('renders the Quiet Mode switch', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    expect(screen.getByRole('switch', { name: /quiet mode/i })).toBeInTheDocument();
  });

  it('renders the Close and Done buttons', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    expect(screen.getByRole('button', { name: /close settings/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /done/i })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 3. Default preference values
// ---------------------------------------------------------------------------

describe('SettingsPanel – default preference values', () => {
  it('defaults to system theme (aria-checked=true on "system" radio)', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    const themeGroup = screen.getByRole('radiogroup', { name: /theme/i });
    expect(within(themeGroup).getByRole('radio', { name: /system/i })).toHaveAttribute('aria-checked', 'true');
    expect(within(themeGroup).getByRole('radio', { name: /light/i })).toHaveAttribute('aria-checked', 'false');
    expect(within(themeGroup).getByRole('radio', { name: /dark/i })).toHaveAttribute('aria-checked', 'false');
  });

  it('defaults to usd amount format', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    const currencyGroup = screen.getByRole('radiogroup', { name: /currency display/i });
    expect(within(currencyGroup).getByRole('radio', { name: /^usd$/i })).toHaveAttribute('aria-checked', 'true');
    expect(within(currencyGroup).getByRole('radio', { name: /^ngn$/i })).toHaveAttribute('aria-checked', 'false');
    expect(within(currencyGroup).getByRole('radio', { name: /^compact$/i })).toHaveAttribute('aria-checked', 'false');
  });

  it('defaults to relaxed toast density', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    const densityGroup = screen.getByRole('radiogroup', { name: /toast density/i });
    expect(within(densityGroup).getByRole('radio', { name: /relaxed/i })).toHaveAttribute('aria-checked', 'true');
    expect(within(densityGroup).getByRole('radio', { name: /compact/i })).toHaveAttribute('aria-checked', 'false');
  });

  it('defaults to quietMode off (aria-checked=false)', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    expect(screen.getByRole('switch', { name: /quiet mode/i })).toHaveAttribute('aria-checked', 'false');
  });
});

// ---------------------------------------------------------------------------
// 4. Preference interactions
// ---------------------------------------------------------------------------

describe('SettingsPanel – preference interactions', () => {
  it('selects light theme', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    const themeGroup = screen.getByRole('radiogroup', { name: /theme/i });
    const lightBtn = within(themeGroup).getByRole('radio', { name: /light/i });
    fireEvent.click(lightBtn);
    expect(lightBtn).toHaveAttribute('aria-checked', 'true');
    expect(within(themeGroup).getByRole('radio', { name: /dark/i })).toHaveAttribute('aria-checked', 'false');
    expect(within(themeGroup).getByRole('radio', { name: /system/i })).toHaveAttribute('aria-checked', 'false');
  });

  it('selects dark theme', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    const themeGroup = screen.getByRole('radiogroup', { name: /theme/i });
    const darkBtn = within(themeGroup).getByRole('radio', { name: /dark/i });
    fireEvent.click(darkBtn);
    expect(darkBtn).toHaveAttribute('aria-checked', 'true');
    expect(within(themeGroup).getByRole('radio', { name: /system/i })).toHaveAttribute('aria-checked', 'false');
  });

  it('selects system theme explicitly', () => {
    // Pre-seed dark so system is not the default active
    localStorage.setItem('talenttrust-user-preferences', JSON.stringify({ theme: 'dark' }));
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    const themeGroup = screen.getByRole('radiogroup', { name: /theme/i });
    fireEvent.click(within(themeGroup).getByRole('radio', { name: /system/i }));
    expect(within(themeGroup).getByRole('radio', { name: /system/i })).toHaveAttribute('aria-checked', 'true');
  });

  it('selects NGN currency', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    const currencyGroup = screen.getByRole('radiogroup', { name: /currency display/i });
    const ngnBtn = within(currencyGroup).getByRole('radio', { name: /ngn/i });
    fireEvent.click(ngnBtn);
    expect(ngnBtn).toHaveAttribute('aria-checked', 'true');
    expect(within(currencyGroup).getByRole('radio', { name: /usd/i })).toHaveAttribute('aria-checked', 'false');
  });

  it('selects compact currency', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    const currencyGroup = screen.getByRole('radiogroup', { name: /currency display/i });
    const compactBtn = within(currencyGroup).getByRole('radio', { name: /compact/i });
    fireEvent.click(compactBtn);
    expect(compactBtn).toHaveAttribute('aria-checked', 'true');
  });

  it('selects compact toast density', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    const densityGroup = screen.getByRole('radiogroup', { name: /toast density/i });
    const compactBtn = within(densityGroup).getByRole('radio', { name: /compact/i });
    fireEvent.click(compactBtn);
    expect(compactBtn).toHaveAttribute('aria-checked', 'true');
    expect(within(densityGroup).getByRole('radio', { name: /relaxed/i })).toHaveAttribute('aria-checked', 'false');
  });

  it('selects relaxed toast density when compact was active', () => {
    localStorage.setItem('talenttrust-user-preferences', JSON.stringify({ toastDensity: 'compact' }));
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    const densityGroup = screen.getByRole('radiogroup', { name: /toast density/i });
    fireEvent.click(within(densityGroup).getByRole('radio', { name: /relaxed/i }));
    expect(within(densityGroup).getByRole('radio', { name: /relaxed/i })).toHaveAttribute('aria-checked', 'true');
  });

  it('toggles quiet mode from off to on', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    const quietSwitch = screen.getByRole('switch', { name: /quiet mode/i });
    expect(quietSwitch).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(quietSwitch);
    expect(quietSwitch).toHaveAttribute('aria-checked', 'true');
  });

  it('toggles quiet mode from on to off', () => {
    localStorage.setItem('talenttrust-user-preferences', JSON.stringify({ quietMode: true }));
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    const quietSwitch = screen.getByRole('switch', { name: /quiet mode/i });
    expect(quietSwitch).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(quietSwitch);
    expect(quietSwitch).toHaveAttribute('aria-checked', 'false');
  });
});

// ---------------------------------------------------------------------------
// 5. Persistence (localStorage round-trip)
// ---------------------------------------------------------------------------

describe('SettingsPanel – localStorage persistence', () => {
  const getStored = () =>
    JSON.parse(localStorage.getItem('talenttrust-user-preferences') || '{}');

  it('persists theme: dark', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    fireEvent.click(screen.getByRole('radio', { name: /dark/i }));
    expect(getStored().theme).toBe('dark');
  });

  it('persists theme: light', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    fireEvent.click(within(screen.getByRole('radiogroup', { name: /theme/i })).getByRole('radio', { name: /light/i }));
    expect(getStored().theme).toBe('light');
  });

  it('persists amountFormat: ngn', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    fireEvent.click(within(screen.getByRole('radiogroup', { name: /currency display/i })).getByRole('radio', { name: /ngn/i }));
    expect(getStored().amountFormat).toBe('ngn');
  });

  it('persists amountFormat: compact', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    fireEvent.click(within(screen.getByRole('radiogroup', { name: /currency display/i })).getByRole('radio', { name: /compact/i }));
    expect(getStored().amountFormat).toBe('compact');
  });

  it('persists toastDensity: compact', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    fireEvent.click(within(screen.getByRole('radiogroup', { name: /toast density/i })).getByRole('radio', { name: /compact/i }));
    expect(getStored().toastDensity).toBe('compact');
  });

  it('persists quietMode: true', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    fireEvent.click(screen.getByRole('switch', { name: /quiet mode/i }));
    expect(getStored().quietMode).toBe(true);
  });

  it('persists quietMode: false (toggle twice)', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    const sw = screen.getByRole('switch', { name: /quiet mode/i });
    fireEvent.click(sw);
    fireEvent.click(sw);
    expect(getStored().quietMode).toBe(false);
  });

  it('restores all preferences from localStorage on mount', () => {
    localStorage.setItem(
      'talenttrust-user-preferences',
      JSON.stringify({ theme: 'dark', amountFormat: 'ngn', toastDensity: 'compact', quietMode: true })
    );
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);

    expect(within(screen.getByRole('radiogroup', { name: /theme/i })).getByRole('radio', { name: /dark/i })).toHaveAttribute('aria-checked', 'true');
    expect(within(screen.getByRole('radiogroup', { name: /currency display/i })).getByRole('radio', { name: /ngn/i })).toHaveAttribute('aria-checked', 'true');
    expect(within(screen.getByRole('radiogroup', { name: /toast density/i })).getByRole('radio', { name: /compact/i })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('switch', { name: /quiet mode/i })).toHaveAttribute('aria-checked', 'true');
  });
});

// ---------------------------------------------------------------------------
// 6. Close interactions
// ---------------------------------------------------------------------------

describe('SettingsPanel – close interactions', () => {
  it('calls onClose when the close button is clicked', () => {
    const onClose = jest.fn();
    renderWithProvider(<SettingsPanel isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /close settings/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the Done button is clicked', () => {
    const onClose = jest.fn();
    renderWithProvider(<SettingsPanel isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /done/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = jest.fn();
    const { container } = renderWithProvider(
      <SettingsPanel isOpen={true} onClose={onClose} />
    );
    const backdrop = container.querySelector('.absolute.inset-0');
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when the panel content area is clicked', () => {
    const onClose = jest.fn();
    renderWithProvider(<SettingsPanel isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// 7. Keyboard / focus management
// ---------------------------------------------------------------------------

describe('SettingsPanel – keyboard interactions', () => {
  it('sets initial focus on the close button when opened', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: /close settings/i })
    );
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = jest.fn();
    renderWithProvider(<SettingsPanel isOpen={true} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose for a non-Escape, non-Tab key', () => {
    const onClose = jest.fn();
    renderWithProvider(<SettingsPanel isOpen={true} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('Tab on the last focusable element wraps focus to the first (forward wrap)', () => {
    // Covers line 48: else if (!e.shiftKey && activeElement === last)
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    const els = getFocusableEls();
    expect(els.length).toBeGreaterThan(0);
    const last = els[els.length - 1];
    last.focus();
    expect(document.activeElement).toBe(last);
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
    expect(document.activeElement).toBe(els[0]);
  });

  it('Shift+Tab on the first focusable element wraps focus to the last (backward wrap)', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    const els = getFocusableEls();
    const first = els[0];
    first.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(els[els.length - 1]);
  });

  // --- Accessibility validation with jest-axe ---

  it('passes accessibility audit with jest-axe when open', async () => {
    jest.useRealTimers();
    const { container } = renderWithProvider(
      <SettingsPanel isOpen={true} onClose={() => {}} />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes accessibility audit with jest-axe when closed', async () => {
    jest.useRealTimers();
    const { container } = renderWithProvider(
      <SettingsPanel isOpen={false} onClose={() => {}} />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ---------------------------------------------------------------------------
// 8. Focus trap: Tab with empty focusable list (covers lines 40-42)
// ---------------------------------------------------------------------------

describe('SettingsPanel – Tab with empty focusable element list', () => {
  it('does not throw when Tab is pressed and no focusable elements exist', () => {
    // Render open panel normally, then temporarily remove all focusable els
    // via querySelectorAll mock to simulate the els.length === 0 guard.
    const origQSA = HTMLElement.prototype.querySelectorAll;
    let callCount = 0;

    // Only intercept the FOCUSABLE_SELECTORS call inside handleKeyDown
    jest.spyOn(HTMLElement.prototype, 'querySelectorAll').mockImplementation(function (
      this: HTMLElement,
      selector: string
    ) {
      if (selector.includes('button:not([disabled])') && callCount === 0) {
        callCount++;
        // Return empty NodeList by calling with a selector that matches nothing
        return origQSA.call(this, '.____nonexistent____');
      }
      return origQSA.call(this, selector);
    });

    const onClose = jest.fn();
    renderWithProvider(<SettingsPanel isOpen={true} onClose={onClose} />);

    // Should not throw and should not call onClose
    expect(() => {
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
    }).not.toThrow();
    expect(onClose).not.toHaveBeenCalled();

    jest.restoreAllMocks();
  });
});

// ---------------------------------------------------------------------------
// 9. Open → closed → open cycle (useEffect re-runs)
// ---------------------------------------------------------------------------

describe('SettingsPanel – open/close lifecycle', () => {
  it('re-registers the keydown handler on re-open and fires onClose on Escape', () => {
    const onClose = jest.fn();
    const { rerender } = renderWithProvider(
      <SettingsPanel isOpen={true} onClose={onClose} />
    );
    // Close it
    rerender(
      <PreferencesProvider>
        <SettingsPanel isOpen={false} onClose={onClose} />
      </PreferencesProvider>
    );
    // Re-open it
    rerender(
      <PreferencesProvider>
        <SettingsPanel isOpen={true} onClose={onClose} />
      </PreferencesProvider>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not announce on Escape when isOpen transitions to false', () => {
    const onClose = jest.fn();
    const { rerender } = renderWithProvider(
      <SettingsPanel isOpen={true} onClose={onClose} />
    );
    // Close: the effect cleanup removes the listener
    rerender(
      <PreferencesProvider>
        <SettingsPanel isOpen={false} onClose={onClose} />
      </PreferencesProvider>
    );
    // Now pressing Escape should do nothing
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('multiple preference changes in a session are each reflected immediately', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    const themeGroup = screen.getByRole('radiogroup', { name: /theme/i });

    fireEvent.click(within(themeGroup).getByRole('radio', { name: /dark/i }));
    expect(within(themeGroup).getByRole('radio', { name: /dark/i })).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(within(themeGroup).getByRole('radio', { name: /light/i }));
    expect(within(themeGroup).getByRole('radio', { name: /light/i })).toHaveAttribute('aria-checked', 'true');
    expect(within(themeGroup).getByRole('radio', { name: /dark/i })).toHaveAttribute('aria-checked', 'false');
  });

  // ------------------------------------------------------------------
  // aria-live announcement region tests
  // ------------------------------------------------------------------

  describe('aria-live announcements', () => {
    it('does not announce anything on mount (empty live region)', () => {
      renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);

      // Even after the debounce window passes, nothing should appear.
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(getAnnouncementText()).toBe('');
    });

    it('announces a single preference change after debounce', () => {
      renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);

      fireEvent.click(screen.getByRole('radio', { name: /dark/i }));

      // Before debounce — still empty.
      expect(getAnnouncementText()).toBe('');

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(getAnnouncementText()).toContain('Theme changed to dark');
    });

    it('includes the "Settings updated:" prefix', () => {
      renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);

      fireEvent.click(screen.getByRole('radio', { name: /light/i }));

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(getAnnouncementText()).toMatch(/^Settings updated:/);
    });

    it('announces theme changes with correct wording', () => {
      renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);

      // Start from default 'system' → click 'dark'
      fireEvent.click(screen.getByRole('radio', { name: /dark/i }));
      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(getAnnouncementText()).toContain('Theme changed to dark');
    });

    it('announces currency format changes with correct wording', () => {
      renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);

      fireEvent.click(screen.getByRole('radio', { name: /ngn/i }));
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(getAnnouncementText()).toContain('Currency format changed to ngn');
    });

    it('announces toast density changes with correct wording', () => {
      renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);

      const densityGroup = screen.getByRole('radiogroup', { name: /toast density/i });
      fireEvent.click(within(densityGroup).getByRole('radio', { name: /compact/i }));
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(getAnnouncementText()).toContain('Toast density changed to compact');
    });

    it('announces quiet mode enabled', () => {
      renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);

      fireEvent.click(screen.getByRole('switch', { name: /quiet mode/i }));
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(getAnnouncementText()).toContain('Quiet mode enabled');
    });

    it('announces quiet mode disabled', () => {
      // Seed with quietMode already on so toggling disables it.
      localStorage.setItem(
        'talenttrust-user-preferences',
        JSON.stringify({ quietMode: true }),
      );

      renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);

      fireEvent.click(screen.getByRole('switch', { name: /quiet mode/i }));
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(getAnnouncementText()).toContain('Quiet mode disabled');
    });

    it('debounces rapid successive updates into one combined announcement', () => {
      renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);

      // Fire three changes in quick succession
      fireEvent.click(screen.getByRole('radio', { name: /dark/i }));
      fireEvent.click(screen.getByRole('radio', { name: /ngn/i }));
      fireEvent.click(screen.getByRole('switch', { name: /quiet mode/i }));

      // After a short time (within debounce window), nothing announced yet.
      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(getAnnouncementText()).toBe('');

      // After full debounce, a single announcement covers all changes.
      act(() => {
        jest.advanceTimersByTime(300);
      });

      const text = getAnnouncementText();
      expect(text).toContain('Theme changed to dark');
      expect(text).toContain('Currency format changed to ngn');
      expect(text).toContain('Quiet mode enabled');
      // Ensure there is exactly one "Settings updated:" prefix (combined).
      expect(text.split('Settings updated:').length).toBe(2);
    });

    it('does not announce when clicking the already-active option (zero changes)', () => {
      renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);

      // Default theme is 'system'; click 'system' radio.
      fireEvent.click(screen.getByRole('radio', { name: /^system$/i }));

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(getAnnouncementText()).toBe('');
    });

    it('live region has correct ARIA attributes', () => {
      renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);

      const region = screen.getByRole('status');
      expect(region.getAttribute('aria-live')).toBe('polite');
      expect(region.getAttribute('aria-atomic')).toBe('true');
    });

    it('live region is visually hidden (sr-only)', () => {
      renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);

      const region = screen.getByRole('status');
      expect(region.className).toContain('sr-only');
    });

    it('does not announce when rapid toggling results in no net change', () => {
      renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);

      // Rapidly toggle quiet mode twice (on then off) — net change is zero.
      const quietSwitch = screen.getByRole('switch', { name: /quiet mode/i });
      fireEvent.click(quietSwitch); // off → on
      fireEvent.click(quietSwitch); // on → off

      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Net zero change → nothing to announce.
      expect(getAnnouncementText()).toBe('');
    });

    it('does not announce when panel is closed (no render)', () => {
      renderWithProvider(
        <SettingsPanel isOpen={false} onClose={() => {}} />,
      );

      expect(screen.queryByRole('status')).toBeNull();
    });
  });
});
