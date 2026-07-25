import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommandPalette } from '../CommandPalette';
import { useRouter } from 'next/navigation';
import { useMediaQuery } from '@/hooks/useMediaQuery';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(),
}));

describe('CommandPalette', () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    });
    (useMediaQuery as jest.Mock).mockReturnValue(false);
  });

  it('does not render when closed', () => {
    render(<CommandPalette />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens on Cmd+K and closes on Escape', () => {
    render(<CommandPalette />);
    
    // Trigger Cmd+K
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    // Trigger Escape
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens on Ctrl+K', () => {
    render(<CommandPalette />);
    
    // Trigger Ctrl+K
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders all default actions', () => {
    render(<CommandPalette />);
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    
    const textContent = options.map(opt => opt.textContent);
    expect(textContent).toContain('Contracts');
    expect(textContent).toContain('Milestones');
    expect(textContent).toContain('Reputation');
  });

  it('filters actions by search query', () => {
    render(<CommandPalette />);
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'reputation' } });
    
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent('Reputation');
  });

  it('shows no results message when query matches nothing', () => {
    render(<CommandPalette />);
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'invalid query' } });
    
    expect(screen.queryByRole('option')).toBeNull();
    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });

  it('navigates to /reputation when Reputation is activated via click', () => {
    render(<CommandPalette />);
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    
    const reputationOption = screen.getByText('Reputation');
    fireEvent.click(reputationOption);
    
    expect(pushMock).toHaveBeenCalledWith('/reputation');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('navigates to /reputation when Reputation is activated via keyboard (ArrowDown + Enter)', () => {
    render(<CommandPalette />);
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    
    const input = screen.getByRole('combobox');
    
    // Focus is initially on first option (Contracts).
    // Arrow down twice to reach Reputation (index 2).
    fireEvent.keyDown(input, { key: 'ArrowDown' }); // index 1
    fireEvent.keyDown(input, { key: 'ArrowDown' }); // index 2
    
    const options = screen.getAllByRole('option');
    expect(options[2]).toHaveAttribute('aria-selected', 'true');
    
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(pushMock).toHaveBeenCalledWith('/reputation');
    expect(screen.queryByRole('dialog')).toBeNull(); // it should close
  });

  it('wraps around keyboard navigation using ArrowUp and ArrowDown', () => {
    render(<CommandPalette />);
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    
    const input = screen.getByRole('combobox');
    
    // Go up from 0 to last
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    let options = screen.getAllByRole('option');
    expect(options[2]).toHaveAttribute('aria-selected', 'true');
    
    // Go down from last to 0
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('respects prefers-reduced-motion media query', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true);
    render(<CommandPalette />);
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    
    const dialog = screen.getByRole('dialog');
    // Shouldn't have transform transition-all classes
    expect(dialog).not.toHaveClass('transform', 'transition-all');
  });
});
