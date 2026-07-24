import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MilestonesPage from '../milestones/page';

// Mock next/navigation hooks
jest.mock('next/navigation', () => {
  const original = jest.requireActual('next/navigation');
  return {
    ...original,
    useSearchParams: jest.fn(),
    useRouter: jest.fn(),
  };
});

import { useSearchParams, useRouter } from 'next/navigation';

describe('Milestones page filter URL sync', () => {
  const replaceMock = jest.fn();
  beforeEach(() => {
    replaceMock.mockReset();
    (useRouter as jest.Mock).mockReturnValue({ replace: replaceMock });
  });

  it('initializes filter from URL query', () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => (key === 'status' ? 'Paid' : null),
      toString: () => 'status=Paid',
    });
    render(<MilestonesPage />);
    const paidRadio = screen.getByRole('radio', { name: 'Paid' }) as HTMLInputElement;
    expect(paidRadio.checked).toBe(true);
  });

  it('defaults to All for unknown status', () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: () => 'Foo',
      toString: () => 'status=Foo',
    });
    render(<MilestonesPage />);
    const allRadio = screen.getByRole('radio', { name: 'All' }) as HTMLInputElement;
    expect(allRadio.checked).toBe(true);
  });

  it('updates URL when filter changes', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: () => null,
      toString: () => '',
    });
    render(<MilestonesPage />);
    const pendingRadio = screen.getByRole('radio', { name: 'Pending' }) as HTMLInputElement;
    fireEvent.click(pendingRadio);
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('?status=Pending');
    });
  });
});
