import { render, screen, fireEvent, act } from '@testing-library/react';
import CommandPalette from '../CommandPalette';
import { clearCommands, registerCommand } from '@/lib/commands';

beforeEach(() => {
  clearCommands();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  jest.restoreAllMocks();
  clearCommands();
});

const openPalette = () => {
  act(() => {
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
  });
};

describe('CommandPalette', () => {
  it('does not render when closed', () => {
    render(<CommandPalette />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens on Ctrl+K', () => {
    render(<CommandPalette />);
    openPalette();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Search commands')).toBeInTheDocument();
  });

  it('closes on Escape', () => {
    render(<CommandPalette />);
    openPalette();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the contracts command', () => {
    render(<CommandPalette />);
    openPalette();
    expect(screen.getByText('Go to Contracts')).toBeInTheDocument();
  });

  it('filters commands by label', () => {
    render(<CommandPalette />);
    openPalette();
    const input = screen.getByLabelText('Search commands');
    act(() => {
      fireEvent.change(input, { target: { value: 'contract' } });
    });
    expect(screen.getByText('Go to Contracts')).toBeInTheDocument();
  });

  it('shows no results message for unmatched query', () => {
    render(<CommandPalette />);
    openPalette();
    const input = screen.getByLabelText('Search commands');
    act(() => {
      fireEvent.change(input, { target: { value: 'zzzzz' } });
    });
    expect(screen.getByText('No commands found')).toBeInTheDocument();
  });

  it('navigates with arrow keys', () => {
    registerCommand({ id: 'a', label: 'Alpha', keywords: [], action: jest.fn() });
    registerCommand({ id: 'b', label: 'Beta', keywords: [], action: jest.fn() });
    render(<CommandPalette />);
    openPalette();
    act(() => {
      fireEvent.keyDown(document, { key: 'ArrowDown' });
    });
    expect(screen.getByRole('option', { name: 'Beta' })).toHaveAttribute('aria-selected', 'true');
  });

  it('activates command on Enter', () => {
    const action = jest.fn();
    registerCommand({ id: 'go', label: 'Go Somewhere', keywords: [], action });
    render(<CommandPalette />);
    openPalette();
    act(() => {
      fireEvent.keyDown(document, { key: 'Enter' });
    });
    expect(action).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes when clicking outside', () => {
    render(<CommandPalette />);
    openPalette();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    act(() => {
      fireEvent.mouseDown(document.body);
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('toggles open/close on repeated Ctrl+K', () => {
    render(<CommandPalette />);
    openPalette();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    act(() => {
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { axe } = await import('jest-axe');
    const { container } = render(<CommandPalette />);
    openPalette();
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});
