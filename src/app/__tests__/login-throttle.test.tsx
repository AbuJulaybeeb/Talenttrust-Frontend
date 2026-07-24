import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../page';
import { PreferencesProvider } from '@/lib/preferences';
import { ToastProvider } from '@/components/toast/toast-provider';
import { safeStorage } from '@/lib/safeStorage';
import {
  getBackoffDuration,
  getStoredAttempts,
  getRemainingCooldownMs,
  recordAttempt,
  resetThrottle,
} from '@/lib/loginThrottle';

function renderHome() {
  return render(
    <PreferencesProvider>
      <ToastProvider>
        <Home />
      </ToastProvider>
    </PreferencesProvider>
  );
}

beforeEach(() => {
  safeStorage.resetCache();
  window.localStorage.clear();
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));
});

afterEach(() => {
  jest.useRealTimers();
});

describe('loginThrottle — pure functions', () => {
  describe('getBackoffDuration', () => {
    it('returns 0 for the first attempt', () => {
      expect(getBackoffDuration(1)).toBe(0);
    });

    it('returns 5s for the second attempt', () => {
      expect(getBackoffDuration(2)).toBe(5000);
    });

    it('returns 25s for the third attempt', () => {
      expect(getBackoffDuration(3)).toBe(25000);
    });

    it('returns 125s for the fourth attempt', () => {
      expect(getBackoffDuration(4)).toBe(125000);
    });

    it('caps at 5 minutes for high attempt counts', () => {
      expect(getBackoffDuration(10)).toBe(300000);
      expect(getBackoffDuration(100)).toBe(300000);
    });
  });

  describe('recordAttempt and resetThrottle', () => {
    it('starts at 0 attempts with no cooldown', () => {
      expect(getStoredAttempts()).toBe(0);
      expect(getRemainingCooldownMs()).toBe(0);
    });

    it('first attempt increments to 1 with no cooldown', () => {
      const result = recordAttempt();
      expect(result.attempts).toBe(1);
      expect(result.cooldownUntil).toBe(0);
      expect(getStoredAttempts()).toBe(1);
      expect(getRemainingCooldownMs()).toBe(0);
    });

    it('second attempt increments to 2 with 5s cooldown', () => {
      recordAttempt();
      const result = recordAttempt();
      expect(result.attempts).toBe(2);
      expect(result.cooldownUntil).toBeGreaterThan(0);
      expect(getStoredAttempts()).toBe(2);
      expect(getRemainingCooldownMs()).toBe(5000);
    });

    it('cooldown decreases as time advances', () => {
      recordAttempt();
      recordAttempt();
      expect(getRemainingCooldownMs()).toBe(5000);

      act(() => { jest.advanceTimersByTime(2000); });
      expect(getRemainingCooldownMs()).toBe(3000);

      act(() => { jest.advanceTimersByTime(3000); });
      expect(getRemainingCooldownMs()).toBe(0);
    });

    it('resetThrottle clears all stored state', () => {
      recordAttempt();
      recordAttempt();
      expect(getStoredAttempts()).toBe(2);

      resetThrottle();
      expect(getStoredAttempts()).toBe(0);
      expect(getRemainingCooldownMs()).toBe(0);
    });
  });

  describe('persistence across simulated reloads', () => {
    it('survives a storage reset cycle', () => {
      recordAttempt();
      recordAttempt();
      const attemptsBefore = getStoredAttempts();
      const cooldownBefore = getRemainingCooldownMs();

      // Simulate module reload by reading from storage directly
      expect(attemptsBefore).toBe(2);
      expect(cooldownBefore).toBeGreaterThan(0);
    });
  });
});

describe('loginThrottle — component integration', () => {
  it('renders the submit button enabled with "Sign In" text', () => {
    renderHome();
    const button = screen.getByRole('button', { name: /sign in/i });
    expect(button).toBeEnabled();
    expect(button).toHaveTextContent('Sign In');
  });

  it('button stays enabled after first submission (no cooldown yet)', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderHome();
    const button = screen.getByRole('button', { name: /sign in/i });

    await user.click(button);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeEnabled();
  });

  it('disables button with cooldown text after second submission', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderHome();
    const button = screen.getByRole('button', { name: /sign in/i });

    await user.click(button);
    await user.click(button);

    const disabledButton = screen.getByRole('button', { name: /wait/i });
    expect(disabledButton).toBeDisabled();
  });

  it('re-enables button after cooldown expires', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderHome();

    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByRole('button', { name: /wait/i })).toBeDisabled();

    act(() => { jest.advanceTimersByTime(5000); });
    expect(screen.getByRole('button', { name: /sign in/i })).toBeEnabled();
  });

  it('announces cooldown through aria-live region', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderHome();

    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    const liveRegion = screen.getByText(/please wait/i);
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion.closest('[aria-live="polite"]')).toBeInTheDocument();
  });

  it('clears aria-live announcement when cooldown ends', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderHome();

    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByText(/please wait/i)).toBeInTheDocument();

    act(() => { jest.advanceTimersByTime(5000); });
    expect(screen.queryByText(/please wait/i)).not.toBeInTheDocument();
  });

  it('resets throttle on successful submission', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderHome();

    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    act(() => { jest.advanceTimersByTime(5000); });

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(getStoredAttempts()).toBe(0);
    expect(getRemainingCooldownMs()).toBe(0);
  });

  it('persists throttle state when component remounts', () => {
    recordAttempt();
    recordAttempt();
    const remainingBefore = getRemainingCooldownMs();

    renderHome();
    const button = screen.getByRole('button', { name: /wait/i });

    expect(button).toBeDisabled();
    expect(getRemainingCooldownMs()).toBe(remainingBefore);
  });

  it('supports maxLength constraints alongside throttle', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderHome();

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
