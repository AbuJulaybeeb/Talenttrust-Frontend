import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Navbar from '../Navbar';
import * as navHook from '@/hooks/useNavigation';

expect.extend(toHaveNoViolations);

// Mock next/navigation usePathname
const mockUsePathname = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

const mockRoutes = [
  { href: '/contracts', label: 'Contracts' },
  { href: '/milestones', label: 'Milestones' },
  { href: '/reputation', label: 'Reputation' },
];

describe('Navbar', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
    jest.spyOn(navHook, 'useNavigation').mockReturnValue({
      routes: mockRoutes,
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('settled state (fast load / content swap)', () => {
    it('renders navigation links to /contracts, /milestones, and /reputation', () => {
      render(<Navbar />);
      expect(screen.getByRole('link', { name: 'Contracts' })).toHaveAttribute('href', '/contracts');
      expect(screen.getByRole('link', { name: 'Milestones' })).toHaveAttribute('href', '/milestones');
      expect(screen.getByRole('link', { name: 'Reputation' })).toHaveAttribute('href', '/reputation');
    });

    it('marks the current route with aria-current="page"', () => {
      mockUsePathname.mockReturnValue('/contracts');
      render(<Navbar />);
      const contractsLink = screen.getByRole('link', { name: 'Contracts' });
      expect(contractsLink).toHaveAttribute('aria-current', 'page');
    });

    it('does not mark inactive routes with aria-current', () => {
      mockUsePathname.mockReturnValue('/contracts');
      render(<Navbar />);
      const milestonesLink = screen.getByRole('link', { name: 'Milestones' });
      const reputationLink = screen.getByRole('link', { name: 'Reputation' });
      expect(milestonesLink).not.toHaveAttribute('aria-current');
      expect(reputationLink).not.toHaveAttribute('aria-current');
    });

    it('maintains logical focus order (keyboard tab navigation)', () => {
      render(<Navbar />);
      const nav = screen.getByRole('navigation', { name: 'Primary' });
      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(nav).toContainElement(link);
        expect(link).not.toHaveAttribute('tabindex');
      });
      expect(links[0]).toHaveTextContent('Contracts');
      expect(links[1]).toHaveTextContent('Milestones');
      expect(links[2]).toHaveTextContent('Reputation');
    });
  });

  describe('loading state (slow load / skeleton)', () => {
    beforeEach(() => {
      jest.spyOn(navHook, 'useNavigation').mockReturnValue({
        routes: mockRoutes,
        isLoading: true,
        error: null,
      });
    });

    it('renders a skeleton matching the navigation layout', () => {
      render(<Navbar />);
      // Should not render actual links
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      
      const nav = screen.getByRole('navigation', { name: 'Primary' });
      expect(nav).toHaveAttribute('aria-busy', 'true');

      // The layout should match visually by rendering the labels invisibly
      expect(screen.getByText('Contracts')).toBeInTheDocument();
      expect(screen.getByText('Milestones')).toBeInTheDocument();
      expect(screen.getByText('Reputation')).toBeInTheDocument();

      // Check aria-hidden on the skeleton wrapper
      const ul = nav.querySelector('ul');
      expect(ul).toHaveAttribute('aria-hidden', 'true');
    });

    it('exposes a polite busy state for screen readers', () => {
      render(<Navbar />);
      const liveRegion = screen.getByText('Loading navigation...');
      expect(liveRegion).toHaveAttribute('role', 'status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveClass('sr-only');
    });
  });

  describe('error state', () => {
    beforeEach(() => {
      jest.spyOn(navHook, 'useNavigation').mockReturnValue({
        routes: [],
        isLoading: false,
        error: new Error('Failed to load'),
      });
    });

    it('replaces skeleton with an error message', () => {
      render(<Navbar />);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(screen.queryByText('Loading navigation...')).not.toBeInTheDocument();
      expect(screen.getByText('Navigation unavailable')).toBeInTheDocument();
    });
  });

  it('passes jest-axe accessibility audit across states', async () => {
    // Settled
    const { container, rerender } = render(<Navbar />);
    let results = await axe(container);
    expect(results).toHaveNoViolations();

    // Loading
    jest.spyOn(navHook, 'useNavigation').mockReturnValue({
      routes: mockRoutes,
      isLoading: true,
      error: null,
    });
    rerender(<Navbar />);
    results = await axe(container);
    expect(results).toHaveNoViolations();

    // Error
    jest.spyOn(navHook, 'useNavigation').mockReturnValue({
      routes: [],
      isLoading: false,
      error: new Error('Network error'),
    });
    rerender(<Navbar />);
    results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
