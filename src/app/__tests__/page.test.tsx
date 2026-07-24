import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../page';
import { PreferencesProvider } from '@/lib/preferences';
import { ToastProvider } from '@/components/toast/toast-provider';
import { assertNoA11yViolations } from '@/test-utils/a11y';
import { safeStorage } from '@/lib/safeStorage';

// Mock wallet is already mocked in jest.setup.ts
// Mock next/navigation if needed (not needed for this test

function renderHome() {
  return render(
    <PreferencesProvider>
      <ToastProvider>
        <Home />
      </ToastProvider>
    </PreferencesProvider>
  );
}

describe('Home Page Login Form', () => {
  beforeEach(() => {
    safeStorage.resetCache();
    window.localStorage.clear();
  });

  it('has no a11y violations', async () => {
    const { container } = renderHome();
    await assertNoA11yViolations(container);
  });

  it('form has noValidate attribute', () => {
  renderHome();
  const forms = screen.getAllByRole('form');
  expect(forms[0]).toHaveAttribute('novalidate');
});

it('shows error summary and per-field errors when submitting empty form', async () => {
  const user = userEvent.setup();
  renderHome();
  await user.click(screen.getByRole('button', { name: /sign in/i }));
  
  // Get the error summary alert specifically
  const alerts = screen.getAllByRole('alert');
  expect(alerts.length > 0).toBe(true);
  
  expect(screen.getByLabelText(/email/i)).toBeInvalid();
  expect(screen.getByLabelText(/password/i)).toBeInvalid();
});

 it('shows per-field errors for invalid email and short password', async () => {
  const user = userEvent.setup();
  renderHome();
  await user.type(screen.getByLabelText(/email/i), 'invalid-email');
  await user.type(screen.getByLabelText(/password/i), '1234567');
  await user.click(screen.getByRole('button', { name: /sign in/i }));
  
  // Check per-field errors
  expect(screen.getByLabelText(/email/i)).toBeInvalid();
  expect(screen.getByLabelText(/password/i)).toBeInvalid();
  
  // Use getAllByText and get first match
  expect(screen.getAllByText(/email must be valid/i)[0]).toBeInTheDocument();
  expect(screen.getAllByText(/password must be at least 8 characters/i)[0]).toBeInTheDocument();
});

  it('shows success toast when valid email and password submitted', async () => {
    const user = userEvent.setup();
    renderHome();
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByRole('status')).toBeInTheDocument(); // toast
  });
});
