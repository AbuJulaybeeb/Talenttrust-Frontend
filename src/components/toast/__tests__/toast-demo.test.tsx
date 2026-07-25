/// <reference types="jest" />

import { fireEvent, render, screen } from '@testing-library/react';
import { ToastDemo } from '../toast-demo';
import { ToastProvider } from '../toast-provider';
import { PreferencesProvider } from '@/lib/preferences';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <PreferencesProvider>
      <ToastProvider>{ui}</ToastProvider>
    </PreferencesProvider>
  );
};

describe('ToastDemo validation', () => {
  it('renders with default valid values', () => {
    renderWithProviders(<ToastDemo />);
    expect(screen.getByLabelText(/title/i)).toHaveValue('Milestone released');
    expect(screen.getByLabelText(/description/i)).toHaveValue('Funds are on the way to the freelancer wallet.');
  });

  it('shows error and blocks submit when title is empty', () => {
    renderWithProviders(<ToastDemo />);
    const titleInput = screen.getByLabelText(/title/i);
    
    // Clear title
    fireEvent.change(titleInput, { target: { value: '   ' } });
    
    // Try to submit
    const successBtn = screen.getByRole('button', { name: /show success/i });
    fireEvent.click(successBtn);
    
    // Validation error should appear
    expect(screen.getByRole('alert')).toHaveTextContent('Title is required');
    expect(titleInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows error when title is out of range', () => {
    renderWithProviders(<ToastDemo />);
    const titleInput = screen.getByLabelText(/title/i);
    
    // Set a very long title
    const longTitle = 'a'.repeat(51);
    fireEvent.change(titleInput, { target: { value: longTitle } });
    
    fireEvent.click(screen.getByRole('button', { name: /show success/i }));
    
    expect(screen.getByRole('alert')).toHaveTextContent('Title must be 50 characters or less');
  });

  it('shows error when description is out of range', () => {
    renderWithProviders(<ToastDemo />);
    const descInput = screen.getByLabelText(/description/i);
    
    // Set a very long description
    const longDesc = 'a'.repeat(201);
    fireEvent.change(descInput, { target: { value: longDesc } });
    
    fireEvent.click(screen.getByRole('button', { name: /show success/i }));
    
    expect(screen.getByRole('alert')).toHaveTextContent('Description must be 200 characters or less');
  });

  it('shows error when duration is invalid format or out of range', () => {
    renderWithProviders(<ToastDemo />);
    const durationInput = screen.getByLabelText(/duration/i);
    
    // Set invalid duration
    fireEvent.change(durationInput, { target: { value: '500' } });
    fireEvent.click(screen.getByRole('button', { name: /show success/i }));
    
    expect(screen.getByRole('alert')).toHaveTextContent('Duration must be between 1000 and 60000 ms');
  });

  it('submits valid input successfully and clears errors', () => {
    renderWithProviders(<ToastDemo />);
    const titleInput = screen.getByLabelText(/title/i);
    
    // Trigger an error first
    fireEvent.change(titleInput, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /show success/i }));
    
    // In our implementation we used standard `alert` role for form errors
    // Since FormField sets `role="alert"` for the error, there should be one
    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    
    // Fix the error
    fireEvent.change(titleInput, { target: { value: 'Valid Title' } });
    fireEvent.click(screen.getByRole('button', { name: /show error/i }));
    
    // Error should be gone (the validation error text shouldn't be there)
    expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
    
    // The error toast itself acts as an alert for the notification.
    // The previous error was a validation alert. The new one is the toast itself.
    // The toast contains the title text.
    expect(screen.getByText('Valid Title')).toBeInTheDocument();
  });
});
