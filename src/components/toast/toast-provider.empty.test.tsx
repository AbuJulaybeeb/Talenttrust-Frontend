// @jest-environment jsdom
/// <reference types="jest" />
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ToastProvider, useToast } from './toast-provider';

function MinimalToastHarness() {
  const { showSuccess } = useToast();
  return (
    <div>
      <button
        onClick={() => {
          showSuccess({ title: 'Only title' }); // No description
        }}
        type="button"
      >
        Trigger minimal
      </button>
    </div>
  );
}

describe('ToastProvider empty/description handling', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.clearAllTimers();
    });
    jest.useRealTimers();
  });

  it('renders toast with only title and no description', () => {
    render(
      <ToastProvider>
        <MinimalToastHarness />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger minimal/i }));

    const toast = screen.getByRole('status');
    expect(toast).toHaveTextContent('Only title');
    // Description element should not be rendered
    // Ensure that description paragraph is absent
    expect(toast.querySelector('p')).toBeNull();
    // Accessible name should be just the title
    expect(toast).toHaveAccessibleName('Only title');
  });

  it('has no toasts initially (empty state)', () => {
    render(
      <ToastProvider>
        <div>Nothing here</div>
      </ToastProvider>
    );
    // The live region should exist but contain no visible toast
    const liveRegion = screen.getByLabelText('Notifications');
    expect(liveRegion).toBeInTheDocument();
    // No toast roles should be present
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
