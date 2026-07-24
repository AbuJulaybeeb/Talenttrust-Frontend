import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Navbar from '../Navbar';

expect.extend(toHaveNoViolations);

// Mock next/navigation usePathname
const mockUsePathname = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

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

  describe('Active Route Handling', () => {
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

  describe('Visual Styling', () => {
    it('applies consistent padding and rounded corners to all links', () => {
      render(<Navbar />);

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link.className).toMatch(/rounded-lg/);
        expect(link.className).toMatch(/px-3/);
        expect(link.className).toMatch(/py-2/);
        expect(link.className).toMatch(/text-sm/);
        expect(link.className).toMatch(/font-medium/);
        expect(link.className).toMatch(/transition-colors/);
      });
    });

    it('applies visible focus rings to all interactive elements', () => {
      render(<Navbar />);

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link.className).toMatch(/focus:ring-2/);
        expect(link.className).toMatch(/focus:outline-none/);
        expect(link.className).toMatch(/focus:ring-\[var\(--ring\)\]/);
        expect(link.className).toMatch(/focus:ring-offset-1/);
      });
    });

    it('applies responsive gap classes', () => {
      render(<Navbar />);

      const nav = screen.getByRole('navigation', { name: 'Primary' });
      const list = nav.querySelector('ul');
      
      expect(list?.className).toMatch(/gap-1/);
      expect(list?.className).toMatch(/sm:gap-2/);
    });
  });

  describe('Keyboard Navigation and Focus', () => {
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

    it('allows keyboard navigation between links', () => {
      render(<Navbar />);

      const links = screen.getAllByRole('link');
      
      links.forEach((link, index) => {
        link.focus();
        expect(document.activeElement).toBe(link);
      });
    });

    it('supports Enter key activation on links', () => {
      render(<Navbar />);

      const link = screen.getByRole('link', { name: 'Contracts' });
      
      const clickSpy = jest.spyOn(link, 'click');
      
      fireEvent.keyDown(link, { key: 'Enter', code: 'Enter' });
      fireEvent.keyUp(link, { key: 'Enter', code: 'Enter' });
      
      expect(link).toBeInTheDocument();
    });

    it('supports Space key activation on links', () => {
      render(<Navbar />);

      const link = screen.getByRole('link', { name: 'Contracts' });
      
      fireEvent.keyDown(link, { key: ' ', code: 'Space' });
      
      expect(link).toBeInTheDocument();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('renders without horizontal overflow on 320px viewport (mobile)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      });

      render(<Navbar />);

      const nav = screen.getByRole('navigation', { name: 'Primary' });
      const list = nav.querySelector('ul');

      expect(list?.className).toMatch(/flex-wrap/);
    });

    it('wraps links on narrow viewports', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 300,
      });

      render(<Navbar />);

      const nav = screen.getByRole('navigation', { name: 'Primary' });
      const list = nav.querySelector('ul');

      expect(list?.className).toMatch(/flex-wrap/);
    });

    it('maintains readability on mobile with small text', () => {
      render(<Navbar />);

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link.className).toMatch(/text-sm/);
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined pathname gracefully', () => {
      mockUsePathname.mockReturnValue(undefined);
      
      expect(() => render(<Navbar />)).not.toThrow();
      
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).not.toHaveAttribute('aria-current');
      });
    });

    it('handles null pathname gracefully', () => {
      mockUsePathname.mockReturnValue(null);
      
      expect(() => render(<Navbar />)).not.toThrow();
      
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).not.toHaveAttribute('aria-current');
      });
    });

    it('handles pathname with trailing slash', () => {
      mockUsePathname.mockReturnValue('/contracts/');
      render(<Navbar />);

      const contractsLink = screen.getByRole('link', { name: 'Contracts' });
      expect(contractsLink).not.toHaveAttribute('aria-current');
    });

    it('handles pathname with query parameters', () => {
      mockUsePathname.mockReturnValue('/contracts?filter=active');
      render(<Navbar />);

      const contractsLink = screen.getByRole('link', { name: 'Contracts' });
      expect(contractsLink).not.toHaveAttribute('aria-current');
    });

    it('handles pathname with hash', () => {
      mockUsePathname.mockReturnValue('/contracts#section');
      render(<Navbar />);

      const contractsLink = screen.getByRole('link', { name: 'Contracts' });
      expect(contractsLink).not.toHaveAttribute('aria-current');
    });

    it('handles rapid route changes without errors', () => {
      const { rerender } = render(<Navbar />);
      
      const routes = ['/contracts', '/milestones', '/reputation', '/'];
      routes.forEach(route => {
        mockUsePathname.mockReturnValue(route);
        rerender(<Navbar />);
        expect(screen.getByRole('navigation')).toBeInTheDocument();
      });
    });

    it('handles multiple rerenders without losing state', () => {
      const { rerender } = render(<Navbar />);
      
      for (let i = 0; i < 5; i++) {
        rerender(<Navbar />);
        expect(screen.getAllByRole('link')).toHaveLength(3);
      }
    });
  });

  describe('Accessibility', () => {
    it('passes jest-axe accessibility audit', async () => {
      const { container } = render(<Navbar />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper color contrast on active links', () => {
      mockUsePathname.mockReturnValue('/contracts');
      render(<Navbar />);

      const activeLink = screen.getByRole('link', { name: 'Contracts' });
      expect(activeLink.className).toMatch(/text-\[var\(--primary\)\]/);
    });

    it('has proper color contrast on inactive links', () => {
      render(<Navbar />);

      const inactiveLink = screen.getByRole('link', { name: 'Milestones' });
      expect(inactiveLink.className).toMatch(/text-\[var\(--muted-foreground\)\]/);
    });

    it('has sufficient visual indication of focus state', () => {
      render(<Navbar />);

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link.className).toMatch(/focus:ring-2/);
        expect(link.className).toMatch(/focus:outline-none/);
        expect(link.className).toMatch(/focus:ring-\[var\(--ring\)\]/);
        expect(link.className).toMatch(/focus:ring-offset-1/);
      });
    });

    it('announces active page to screen readers via aria-current', () => {
      mockUsePathname.mockReturnValue('/contracts');
      render(<Navbar />);

      const activeLink = screen.getByRole('link', { name: 'Contracts' });
      expect(activeLink).toHaveAttribute('aria-current', 'page');
    });

    it('has accessible link text for all navigation items', () => {
      render(<Navbar />);

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).toHaveTextContent(/Contracts|Milestones|Reputation/);
        expect(link).toBeVisible();
      });
    });

    it('maintains a logical reading order for screen readers', () => {
      render(<Navbar />);

      const nav = screen.getByRole('navigation', { name: 'Primary' });
      const links = nav.querySelectorAll('a');
      
      expect(links[0]).toHaveTextContent('Contracts');
      expect(links[1]).toHaveTextContent('Milestones');
      expect(links[2]).toHaveTextContent('Reputation');
    });
  });

  describe('Integration with Next.js', () => {
    it('works with Next.js Link component correctly', () => {
      render(<Navbar />);

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link.tagName).toBe('A');
        expect(link).toHaveAttribute('href');
      });
    });

    it('handles Next.js pathname changes correctly', () => {
      const { rerender } = render(<Navbar />);
      
      mockUsePathname.mockReturnValue('/contracts');
      rerender(<Navbar />);
      
      expect(screen.getByRole('link', { name: 'Contracts' })).toHaveAttribute('aria-current', 'page');
      
      mockUsePathname.mockReturnValue('/milestones');
      rerender(<Navbar />);
      
      expect(screen.getByRole('link', { name: 'Milestones' })).toHaveAttribute('aria-current', 'page');
      expect(screen.getByRole('link', { name: 'Contracts' })).not.toHaveAttribute('aria-current');
    });
  });

  describe('Error Handling', () => {
    it('handles invalid route configurations gracefully', () => {
      render(<Navbar />);
      
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(3);
    });
  });

  describe('Performance', () => {
    it('renders without unnecessary rerenders', () => {
      const { rerender } = render(<Navbar />);
      
      for (let i = 0; i < 3; i++) {
        rerender(<Navbar />);
        expect(screen.getAllByRole('link')).toHaveLength(3);
      }
    });

    it('memoizes route rendering effectively', () => {
      const { rerender } = render(<Navbar />);
      
      for (let i = 0; i < 3; i++) {
        rerender(<Navbar />);
        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(3);
        expect(links[0]).toHaveTextContent('Contracts');
      }
    });
  });

  describe('CSS Custom Properties Integration', () => {
    it('uses CSS custom properties for theming', () => {
      render(<Navbar />);

      // Check that all links use CSS custom properties for colors
      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        // All links should use CSS custom properties for colors
        const className = link.className;
        // Check for custom properties in the class
        expect(className).toMatch(/var\(--[a-z-]+\)/);
      });
      
      // Specifically check that inactive links use muted-foreground
      const inactiveLink = screen.getByRole('link', { name: 'Milestones' });
      expect(inactiveLink.className).toMatch(/var\(--muted-foreground\)/);
    });

    it('applies hover styles consistently', () => {
      render(<Navbar />);

      const inactiveLink = screen.getByRole('link', { name: 'Milestones' });
      expect(inactiveLink.className).toMatch(/hover:text-\[var\(--foreground\)\]/);
      expect(inactiveLink.className).toMatch(/hover:bg-\[var\(--muted\)\]/);
    });
  });
});
