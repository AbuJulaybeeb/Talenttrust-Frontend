import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Navbar, { isNavRouteActive } from '../Navbar';

expect.extend(toHaveNoViolations);

// Mock next/navigation usePathname
const mockUsePathname = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

// ---------------------------------------------------------------------------
// Unit tests for the pure isNavRouteActive helper
// ---------------------------------------------------------------------------
describe('isNavRouteActive', () => {
  it('returns true for an exact match', () => {
    expect(isNavRouteActive('/contracts', '/contracts')).toBe(true);
    expect(isNavRouteActive('/milestones', '/milestones')).toBe(true);
    expect(isNavRouteActive('/reputation', '/reputation')).toBe(true);
  });

  it('returns true for a nested sub-route (one level deep)', () => {
    expect(isNavRouteActive('/contracts/abc-123', '/contracts')).toBe(true);
    expect(isNavRouteActive('/milestones/42', '/milestones')).toBe(true);
    expect(isNavRouteActive('/reputation/overview', '/reputation')).toBe(true);
  });

  it('returns true for a nested sub-route (multiple levels deep)', () => {
    expect(isNavRouteActive('/contracts/abc/milestones', '/contracts')).toBe(true);
    expect(isNavRouteActive('/contracts/abc/milestones/1', '/contracts')).toBe(true);
  });

  it('returns false for an unrelated route', () => {
    expect(isNavRouteActive('/milestones', '/contracts')).toBe(false);
    expect(isNavRouteActive('/reputation', '/contracts')).toBe(false);
  });

  it('returns false when pathname only shares a prefix but no slash separator', () => {
    // "/contractsExtra" should NOT match "/contracts"
    expect(isNavRouteActive('/contractsExtra', '/contracts')).toBe(false);
    expect(isNavRouteActive('/milestonesX', '/milestones')).toBe(false);
  });

  it('returns false when href is "/" to prevent matching every route', () => {
    expect(isNavRouteActive('/contracts', '/')).toBe(false);
    expect(isNavRouteActive('/milestones', '/')).toBe(false);
    expect(isNavRouteActive('/', '/')).toBe(true); // exact match still works
  });

  it('returns false for an unknown/unrelated route', () => {
    expect(isNavRouteActive('/settings', '/contracts')).toBe(false);
    expect(isNavRouteActive('/unknown', '/milestones')).toBe(false);
    expect(isNavRouteActive('/404', '/reputation')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Integration tests for the Navbar component
// ---------------------------------------------------------------------------
describe('Navbar', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders navigation links to /contracts, /milestones, and /reputation', () => {
      render(<Navbar />);

    expect(screen.getByRole('link', { name: 'Contracts' })).toHaveAttribute('href', '/contracts');
    expect(screen.getByRole('link', { name: 'Milestones' })).toHaveAttribute('href', '/milestones');
    expect(screen.getByRole('link', { name: 'Reputation' })).toHaveAttribute('href', '/reputation');
  });

  it('marks the current route with aria-current="page" (exact match)', () => {
    mockUsePathname.mockReturnValue('/contracts');
    render(<Navbar />);

    expect(screen.getByRole('link', { name: 'Contracts' })).toHaveAttribute('aria-current', 'page');
  });

  it('does not mark inactive routes with aria-current', () => {
    mockUsePathname.mockReturnValue('/contracts');
    render(<Navbar />);

    expect(screen.getByRole('link', { name: 'Milestones' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Reputation' })).not.toHaveAttribute('aria-current');
  });

  it('marks the parent nav item with aria-current="page" on a nested route', () => {
    mockUsePathname.mockReturnValue('/contracts/abc-123');
    render(<Navbar />);

    expect(screen.getByRole('link', { name: 'Contracts' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Milestones' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Reputation' })).not.toHaveAttribute('aria-current');
  });

  it('marks the parent nav item with aria-current="page" on a deeply nested route', () => {
    mockUsePathname.mockReturnValue('/contracts/abc-123/milestones');
    render(<Navbar />);

    expect(screen.getByRole('link', { name: 'Contracts' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Milestones' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Reputation' })).not.toHaveAttribute('aria-current');
  });

  it('marks no nav item with aria-current on an unknown route', () => {
    mockUsePathname.mockReturnValue('/unknown-page');
    render(<Navbar />);

    expect(screen.getByRole('link', { name: 'Contracts' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Milestones' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Reputation' })).not.toHaveAttribute('aria-current');
  });

  it('marks no nav item with aria-current on the home "/" route', () => {
    mockUsePathname.mockReturnValue('/');
    render(<Navbar />);

    expect(screen.getByRole('link', { name: 'Contracts' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Milestones' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Reputation' })).not.toHaveAttribute('aria-current');
  });

  it('updates active highlight when route changes', () => {
    const { rerender } = render(<Navbar />);
    mockUsePathname.mockReturnValue('/milestones');

    rerender(<Navbar />);

    expect(screen.getByRole('link', { name: 'Milestones' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Contracts' })).not.toHaveAttribute('aria-current');
  });

  it('updates active highlight from nested route to a different section', () => {
    mockUsePathname.mockReturnValue('/contracts/abc');
    const { rerender } = render(<Navbar />);
    expect(screen.getByRole('link', { name: 'Contracts' })).toHaveAttribute('aria-current', 'page');

    mockUsePathname.mockReturnValue('/milestones');
    rerender(<Navbar />);

    expect(screen.getByRole('link', { name: 'Milestones' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Contracts' })).not.toHaveAttribute('aria-current');
  });

  it('renders inside a <nav> landmark with accessible label "Primary"', () => {
    render(<Navbar />);
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
  });

  it('maintains logical focus order (keyboard tab navigation)', () => {
    render(<Navbar />);

    const nav = screen.getByRole('navigation', { name: 'Primary' });
    const links = screen.getAllByRole('link');

    // All links must be focusable and inside the nav landmark
    links.forEach((link) => {
      expect(nav).toContainElement(link);
      expect(link).not.toHaveAttribute('tabindex'); // Link elements are naturally focusable
    });

    it('renders navigation landmark with correct aria-label', () => {
      render(<Navbar />);

      const nav = screen.getByRole('navigation', { name: 'Primary' });
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveAttribute('aria-label', 'Primary');
    });

    it('renders unordered list with correct flex classes', () => {
      render(<Navbar />);

      const nav = screen.getByRole('navigation', { name: 'Primary' });
      const list = nav.querySelector('ul');
      
      expect(list).toBeInTheDocument();
      expect(list?.className).toMatch(/flex-wrap/);
      expect(list?.className).toMatch(/items-center/);
      expect(list?.className).toMatch(/gap-1/);
    });

    it('has correct number of navigation items', () => {
      render(<Navbar />);

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(3);
    });
  });

  it('applies active visual styling to the current nav item', () => {
    mockUsePathname.mockReturnValue('/milestones');
    render(<Navbar />);

    const activeLink = screen.getByRole('link', { name: 'Milestones' });
    const inactiveLink = screen.getByRole('link', { name: 'Contracts' });

    expect(activeLink.className).toMatch(/text-\[var\(--primary\)\]/);
    expect(inactiveLink.className).toMatch(/text-\[var\(--muted-foreground\)\]/);
  });

  it('renders without horizontal overflow on 320px viewport (mobile)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 320,
    });

    it('does not mark inactive routes with aria-current', () => {
      mockUsePathname.mockReturnValue('/contracts');
      render(<Navbar />);

      const milestonesLink = screen.getByRole('link', { name: 'Milestones' });
      const reputationLink = screen.getByRole('link', { name: 'Reputation' });

      expect(milestonesLink).not.toHaveAttribute('aria-current');
      expect(reputationLink).not.toHaveAttribute('aria-current');
    });

    it('updates active highlight when route changes', () => {
      const { rerender } = render(<Navbar />);
      
      mockUsePathname.mockReturnValue('/milestones');
      rerender(<Navbar />);

      expect(screen.getByRole('link', { name: 'Milestones' })).toHaveAttribute('aria-current', 'page');
      expect(screen.getByRole('link', { name: 'Contracts' })).not.toHaveAttribute('aria-current');
      expect(screen.getByRole('link', { name: 'Reputation' })).not.toHaveAttribute('aria-current');
    });

    it('applies active styles to current route', () => {
      mockUsePathname.mockReturnValue('/contracts');
      render(<Navbar />);

      const activeLink = screen.getByRole('link', { name: 'Contracts' });
      expect(activeLink.className).toMatch(/text-\[var\(--primary\)\]/);
      expect(activeLink.className).toMatch(/bg-\[var\(--primary\)\]\/10/);
    });

    it('applies inactive styles to non-current routes', () => {
      mockUsePathname.mockReturnValue('/contracts');
      render(<Navbar />);

      const inactiveLink = screen.getByRole('link', { name: 'Milestones' });
      expect(inactiveLink.className).toMatch(/text-\[var\(--muted-foreground\)\]/);
      expect(inactiveLink.className).toMatch(/hover:text-\[var\(--foreground\)\]/);
      expect(inactiveLink.className).toMatch(/hover:bg-\[var\(--muted\)\]/);
    });

    it('handles root path correctly', () => {
      mockUsePathname.mockReturnValue('/');
      render(<Navbar />);

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).not.toHaveAttribute('aria-current');
      });
    });
  });

  it('passes jest-axe accessibility audit on home route', async () => {
    mockUsePathname.mockReturnValue('/');
    const { container } = render(<Navbar />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes jest-axe accessibility audit on an active route', async () => {
    mockUsePathname.mockReturnValue('/contracts');
    const { container } = render(<Navbar />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes jest-axe accessibility audit on a nested route', async () => {
    mockUsePathname.mockReturnValue('/contracts/abc-123');
    const { container } = render(<Navbar />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
