import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsPanel } from '../SettingsPanel';

function renderPanel(onClose = jest.fn()) {
  return {
    onClose,
    ...render(<SettingsPanel isOpen onClose={onClose} />),
  };
}

describe('SettingsPanel keyboard interaction', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('places all settings controls in logical tab order', async () => {
    const user = userEvent.setup();
    renderPanel();

    const close = screen.getByRole('button', { name: /close settings/i });
    const theme = screen.getByRole('radio', { name: /system/i });
    const currency = screen.getByRole('radio', { name: /usd/i });
    const density = screen.getByRole('radio', { name: /comfortable/i });
    const quietMode = screen.getByRole('switch', { name: /quiet mode/i });

    close.focus();
    expect(close).toHaveFocus();
    await user.tab();
    expect(theme).toHaveFocus();
    await user.tab();
    expect(currency).toHaveFocus();
    await user.tab();
    expect(density).toHaveFocus();
    await user.tab();
    expect(quietMode).toHaveFocus();
  });

  it('activates the close control with Enter', async () => {
    const user = userEvent.setup();
    const { onClose } = renderPanel();
    const close = screen.getByRole('button', { name: /close settings/i });

    close.focus();
    await user.keyboard('{Enter}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('activates radio options with Enter and Space', async () => {
    const user = userEvent.setup();
    renderPanel();

    const dark = screen.getByRole('radio', { name: /dark/i });
    dark.focus();
    await user.keyboard('{Enter}');
    expect(dark).toHaveAttribute('aria-checked', 'true');

    const ngn = screen.getByRole('radio', { name: /ngn/i });
    ngn.focus();
    await user.keyboard(' ');
    expect(ngn).toHaveAttribute('aria-checked', 'true');
  });

  it('supports arrow-key navigation within radio groups', async () => {
    const user = userEvent.setup();
    renderPanel();

    const light = screen.getByRole('radio', { name: /light/i });
    const dark = screen.getByRole('radio', { name: /dark/i });
    light.focus();
    await user.keyboard('{ArrowRight}');

    expect(dark).toHaveFocus();
    expect(dark).toHaveAttribute('aria-checked', 'true');
  });

  it('activates Quiet Mode with Enter and Space', async () => {
    const user = userEvent.setup();
    renderPanel();

    const quietMode = screen.getByRole('switch', { name: /quiet mode/i });
    quietMode.focus();
    await user.keyboard('{Enter}');
    expect(quietMode).toHaveAttribute('aria-checked', 'true');
    await user.keyboard(' ');
    expect(quietMode).toHaveAttribute('aria-checked', 'false');
  });

  it('provides visible focus styling for every interactive control', () => {
    renderPanel();

    const controls = screen.getAllByRole('button').concat(screen.getByRole('switch'));
    controls.forEach((control) => {
      expect(control.className).toMatch(/focus-visible:ring/);
      expect(control.className).toMatch(/focus-visible:outline-none/);
    });
  });
});
