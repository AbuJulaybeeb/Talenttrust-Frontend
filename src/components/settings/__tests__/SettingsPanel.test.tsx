import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { SettingsPanel } from '../SettingsPanel';
import { PreferencesProvider } from '@/lib/preferences';
import { resetCache } from '@/lib/safeStorage';

expect.extend(toHaveNoViolations);

const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <PreferencesProvider>
      {ui}
    </PreferencesProvider>
  );
};

describe('SettingsPanel', () => {
  beforeEach(() => {
    localStorage.clear();
    resetCache();
  });

  it('renders nothing when closed', () => {
    const { container } = renderWithProvider(
      <SettingsPanel isOpen={false} onClose={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows loading state initially when open', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    // Loading state should show
    expect(screen.getByText(/Loading your settings/i)).toBeInTheDocument();
  });

  it('transitions to success state and renders settings form', async () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    
    // Initially shows loading
    expect(screen.getByText(/Loading your settings/i)).toBeInTheDocument();
    
    // Wait for transition to success state
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Appearance')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = jest.fn();
    renderWithProvider(<SettingsPanel isOpen={true} onClose={onClose} />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /Close settings/i });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('updates theme preference when theme button is clicked', async () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByRole('radio', { name: /dark/i })).toBeInTheDocument();
    });

    const darkButton = screen.getByRole('radio', { name: /dark/i });
    fireEvent.click(darkButton);
    
    // Check if it's active
    expect(darkButton.getAttribute('aria-checked')).toBe('true');
    expect(darkButton.className).toContain('bg-[var(--primary)]');
  });

  it('updates currency preference when currency button is clicked', async () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByRole('radio', { name: /ngn/i })).toBeInTheDocument();
    });

    const ngnButton = screen.getByRole('radio', { name: /ngn/i });
    fireEvent.click(ngnButton);
    
    expect(ngnButton.getAttribute('aria-checked')).toBe('true');
  });

  it('updates toast density preference', async () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);

    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByRole('radiogroup', { name: /toast density/i })).toBeInTheDocument();
    });

    // Scope to the Toast Density radiogroup to avoid collision with the
    // "compact" option that also exists in the Currency Display group.
    const densityGroup = screen.getByRole('radiogroup', { name: /toast density/i });
    const compactButton = within(densityGroup).getByRole('radio', { name: /compact/i });
    fireEvent.click(compactButton);

    expect(compactButton.getAttribute('aria-checked')).toBe('true');
  });

  it('toggles quiet mode switch', async () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByRole('switch', { name: /Quiet Mode/i })).toBeInTheDocument();
    });

    const quietSwitch = screen.getByRole('switch', { name: /Quiet Mode/i });
    expect(quietSwitch.getAttribute('aria-checked')).toBe('false');
    
    fireEvent.click(quietSwitch);
    expect(quietSwitch.getAttribute('aria-checked')).toBe('true');
  });

  it('persists theme preference to localStorage when changed', async () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);

    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByRole('radio', { name: /dark/i })).toBeInTheDocument();
    });

    const darkButton = screen.getByRole('radio', { name: /dark/i });
    fireEvent.click(darkButton);

    const saved = JSON.parse(
      localStorage.getItem('talenttrust-user-preferences') || '{}'
    );
    expect(saved.theme).toBe('dark');
  });

  it('persists currency preference to localStorage when changed', async () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);

    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByRole('radio', { name: /ngn/i })).toBeInTheDocument();
    });

    const ngnButton = screen.getByRole('radio', { name: /ngn/i });
    fireEvent.click(ngnButton);

    const saved = JSON.parse(
      localStorage.getItem('talenttrust-user-preferences') || '{}'
    );
    expect(saved.amountFormat).toBe('ngn');
  });

  it('persists quietMode to localStorage when toggled', async () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);

    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByRole('switch', { name: /Quiet Mode/i })).toBeInTheDocument();
    });

    const quietSwitch = screen.getByRole('switch', { name: /Quiet Mode/i });
    fireEvent.click(quietSwitch);

    const saved = JSON.parse(
      localStorage.getItem('talenttrust-user-preferences') || '{}'
    );
    expect(saved.quietMode).toBe(true);
  });

  it('persists toastDensity preference to localStorage when changed', async () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);

    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByRole('radiogroup', { name: /toast density/i })).toBeInTheDocument();
    });

    const densityGroup = screen.getByRole('radiogroup', { name: /toast density/i });
    const compactButton = within(densityGroup).getByRole('radio', { name: /compact/i });
    fireEvent.click(compactButton);

    const saved = JSON.parse(
      localStorage.getItem('talenttrust-user-preferences') || '{}'
    );
    expect(saved.toastDensity).toBe('compact');
  });

  it('restores preferences from localStorage on remount (simulated reload)', async () => {
    // Pre-seed localStorage as if a previous session saved dark + NGN
    localStorage.setItem(
      'talenttrust-user-preferences',
      JSON.stringify({ theme: 'dark', amountFormat: 'ngn', toastDensity: 'compact', quietMode: true })
    );

    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);

    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByRole('radiogroup', { name: /theme/i })).toBeInTheDocument();
    });

    // Theme: dark should be checked
    const themeGroup = screen.getByRole('radiogroup', { name: /theme/i });
    expect(within(themeGroup).getByRole('radio', { name: /dark/i }).getAttribute('aria-checked')).toBe('true');
    expect(within(themeGroup).getByRole('radio', { name: /light/i }).getAttribute('aria-checked')).toBe('false');

    // Currency: ngn should be checked
    const currencyGroup = screen.getByRole('radiogroup', { name: /currency display/i });
    expect(within(currencyGroup).getByRole('radio', { name: /ngn/i }).getAttribute('aria-checked')).toBe('true');

    // Toast density: compact should be checked
    const densityGroup = screen.getByRole('radiogroup', { name: /toast density/i });
    expect(within(densityGroup).getByRole('radio', { name: /compact/i }).getAttribute('aria-checked')).toBe('true');

    // Quiet mode: on
    expect(screen.getByRole('switch', { name: /quiet mode/i }).getAttribute('aria-checked')).toBe('true');
  });

  it('closes when backdrop is clicked', async () => {
    const onClose = jest.fn();
    const { container } = renderWithProvider(
      <SettingsPanel isOpen={true} onClose={onClose} />
    );

    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // The backdrop is the first child of the outer wrapper
    const backdrop = container.querySelector('.absolute.inset-0');
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalled();
  });

  it('closes when Done button is clicked', async () => {
    const onClose = jest.fn();
    renderWithProvider(<SettingsPanel isOpen={true} onClose={onClose} />);

    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /done/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /done/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('all interactive controls are keyboard-accessible (have focus-visible ring classes)', async () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);

    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /close settings/i })).toBeInTheDocument();
    });

    const focusableControls = [
      screen.getByRole('button', { name: /close settings/i }),
      screen.getByRole('switch', { name: /quiet mode/i }),
      screen.getByRole('button', { name: /done/i }),
    ];

    focusableControls.forEach((el) => {
      expect(el.className).toMatch(/focus-visible/);
    });
  });

  // --- Accessibility: dialog semantics ---

  it('has role="dialog" when open', async () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    
    // Wait for dialog to be rendered
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeDefined();
    });
  });

  it('has aria-modal="true" on the dialog', async () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    
    // Wait for dialog to be rendered
    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog.getAttribute('aria-modal')).toBe('true');
    });
  });

  it('aria-labelledby points to the "Settings" heading', async () => {
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

  // --- Accessibility: keyboard interactions ---

  it('closes when Escape is pressed', async () => {
    const onClose = jest.fn();
    renderWithProvider(<SettingsPanel isOpen={true} onClose={onClose} />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('sets initial focus on the close button when opened', async () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: /close settings/i })
    );
  });

  it('Tab on the last focusable element wraps focus to the first', async () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const dialog = screen.getByRole('dialog');
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
    const last = focusable[focusable.length - 1];
    last.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
    expect(document.activeElement).toBe(focusable[0]);
  });

  it('Shift+Tab on the first focusable element wraps focus to the last', async () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const dialog = screen.getByRole('dialog');
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
    const first = focusable[0];
    first.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(focusable[focusable.length - 1]);
  });

  // --- Accessibility validation with jest-axe ---

  it('passes accessibility audit with jest-axe when open and loaded', async () => {
    const { container } = renderWithProvider(
      <SettingsPanel isOpen={true} onClose={() => {}} />
    );
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes accessibility audit with jest-axe when closed', async () => {
    const { container } = renderWithProvider(
      <SettingsPanel isOpen={false} onClose={() => {}} />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes accessibility audit with jest-axe in loading state', async () => {
    const { container } = renderWithProvider(
      <SettingsPanel isOpen={true} onClose={() => {}} />
    );
    
    // Capture loading state before it transitions
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // --- Edge cases for focus management ---

  it('does not call onClose when Escape is pressed while dialog is closed', () => {
    const onClose = jest.fn();
    renderWithProvider(<SettingsPanel isOpen={false} onClose={onClose} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('initial focus is not set when panel is not open', () => {
    renderWithProvider(<SettingsPanel isOpen={false} onClose={() => {}} />);
    
    // Should not have any dialog content
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.activeElement).not.toBe(screen.queryByRole('button', { name: /close settings/i }));
  });

  // --- Verify all preference controls are properly labeled ---

  it('all preference controls have proper ARIA labels and roles', async () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByRole('radiogroup', { name: /theme/i })).toBeInTheDocument();
    });

    // Theme radiogroup
    const themeGroup = screen.getByRole('radiogroup', { name: /theme/i });
    expect(themeGroup).toBeInTheDocument();
    
    // Currency radiogroup
    const currencyGroup = screen.getByRole('radiogroup', { name: /currency display/i });
    expect(currencyGroup).toBeInTheDocument();
    
    // Toast density radiogroup
    const densityGroup = screen.getByRole('radiogroup', { name: /toast density/i });
    expect(densityGroup).toBeInTheDocument();
    
    // Quiet mode switch
    const quietSwitch = screen.getByRole('switch', { name: /quiet mode/i });
    expect(quietSwitch).toBeInTheDocument();
    
    // All theme radio buttons should be properly labeled
    const themeButtons = within(themeGroup).getAllByRole('radio');
    expect(themeButtons).toHaveLength(3);
    expect(themeButtons[0]).toHaveAccessibleName('light');
    expect(themeButtons[1]).toHaveAccessibleName('dark');
    expect(themeButtons[2]).toHaveAccessibleName('system');
  });

  // --- New tests for state management ---

  it('shows loading state when panel opens', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/Loading your settings/i)).toBeInTheDocument();
  });

  it('transitions from loading to success state', async () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    
    // Initially loading
    expect(screen.getByText(/Loading your settings/i)).toBeInTheDocument();
    
    // Then success
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.queryByText(/Loading your settings/i)).not.toBeInTheDocument();
    });
  });

  it('announces loading state to assistive tech', () => {
    renderWithProvider(<SettingsPanel isOpen={true} onClose={() => {}} />);
    
    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toHaveAttribute('aria-live', 'polite');
  });
});
