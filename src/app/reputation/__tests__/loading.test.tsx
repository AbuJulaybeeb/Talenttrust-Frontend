/**
 * loading.test.tsx – /reputation
 *
 * Tests for the reputation page loading skeleton. Covers:
 *   1. Skeleton renders with the correct layout structure
 *   2. aria-busy="true" on the main wrapper
 *   3. aria-hidden="true" on all shimmer blocks
 *   4. role="status" live region announces loading
 *   5. Structural parity with ReputationProfile (no layout shift)
 *   6. ProfileCardSkeleton renders avatar, name, privacy note, metric tiles
 *   7. HistoryCardSkeleton renders heading, badge, event rows
 *   8. Animation classes are present
 *   9. jest-axe accessibility audit
 *  10. Edge cases: fast-load, slow-load, error-replaces-skeleton
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { assertNoA11yViolations } from '@/test-utils/a11y';
import ReputationProfileSkeleton, {
  ProfileCardSkeleton,
  HistoryCardSkeleton,
} from '@/components/ReputationProfileSkeleton';
import ReputationLoading from '../loading';

// ---------------------------------------------------------------------------
// 1. ReputationLoading (route-level loading component)
// ---------------------------------------------------------------------------

describe('ReputationLoading', () => {
  beforeEach(() => {
    render(<ReputationLoading />);
  });

  it('renders a <main> with aria-busy="true"', () => {
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute('aria-busy', 'true');
  });

  it('renders a page heading shimmer block', () => {
    // The heading skeleton is a div with aria-hidden="true" and specific width/height classes
    const headingSkeleton = document.querySelector(
      'main > div[aria-hidden="true"].mb-6'
    );
    expect(headingSkeleton).not.toBeNull();
  });

  it('renders ReputationProfileSkeleton inside main', () => {
    // The composed section with aria-label — aria-busy lives on <main> only
    const section = document.querySelector(
      'main > section[aria-label="Loading reputation"]'
    );
    expect(section).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 2. ReputationProfileSkeleton (composed skeleton)
// ---------------------------------------------------------------------------

describe('ReputationProfileSkeleton', () => {
  beforeEach(() => {
    render(<ReputationProfileSkeleton />);
  });

  it('renders a section with aria-label="Loading reputation"', () => {
    const section = document.querySelector(
      'section[aria-label="Loading reputation"]'
    );
    expect(section).not.toBeNull();
  });

  it('renders a visually-hidden status announcing "Loading reputation…"', () => {
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-atomic', 'true');
    expect(status.textContent).toBe('Loading reputation…');
    // Must be sr-only
    expect(status.classList.contains('sr-only')).toBe(true);
  });

  it('renders both skeleton sub-components', () => {
    // ProfileCardSkeleton and HistoryCardSkeleton are direct children
    // of the section, each with aria-hidden="true"
    const skeletons = document.querySelectorAll(
      'section[aria-label="Loading reputation"] > div[aria-hidden="true"]'
    );
    expect(skeletons).toHaveLength(2);
  });

  it('matches the reputation layout dimensions (max-w-5xl, spacing)', () => {
    const section = document.querySelector(
      'section[aria-label="Loading reputation"]'
    );
    expect(section).toHaveClass('max-w-5xl');
    expect(section).toHaveClass('mx-auto');
    expect(section).toHaveClass('space-y-8');
  });

  it('has no axe violations', async () => {
    const { container } = render(<ReputationProfileSkeleton />);
    await assertNoA11yViolations(container);
  });
});

// ---------------------------------------------------------------------------
// 3. ProfileCardSkeleton
// ---------------------------------------------------------------------------

describe('ProfileCardSkeleton', () => {
  beforeEach(() => {
    render(<ProfileCardSkeleton />);
  });

  it('has aria-hidden="true" on the root element', () => {
    const root = document.querySelector('div[aria-hidden="true"]');
    expect(root).not.toBeNull();
  });

  it('renders an avatar shimmer block', () => {
    // 16x16 rounded square
    const avatar = document.querySelector('.h-16.w-16.rounded-2xl');
    expect(avatar).not.toBeNull();
    expect(avatar).toHaveClass('animate-shimmer');
    expect(avatar).toHaveClass('motion-reduce:animate-none');
  });

  it('renders name/label text shimmer blocks', () => {
    // Two text lines next to avatar
    const nameLines = document.querySelectorAll('.space-y-2 > div');
    expect(nameLines).toHaveLength(2);
    nameLines.forEach((el) => {
      expect(el).toHaveClass('animate-shimmer');
    });
  });

  it('renders a privacy note panel with shimmer blocks', () => {
    // Three text lines in the privacy panel
    const privacyPanel = document.querySelector('.lg\\:w-72');
    expect(privacyPanel).not.toBeNull();
    const privacyLines = privacyPanel!.querySelectorAll('div');
    expect(privacyLines.length).toBeGreaterThanOrEqual(2);
  });

  it('renders three metric tiles (score, level, explanation)', () => {
    // sm:grid-cols-3 grid with metric tiles
    const metricTiles = document.querySelectorAll('.grid.sm\\:grid-cols-3 > div');
    expect(metricTiles).toHaveLength(3);
    metricTiles.forEach((tile) => {
      // Each tile has a label line and a value line
      const lines = tile.querySelectorAll('div');
      expect(lines.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('has correct rounded-3xl card styling', () => {
    const card = document.querySelector('div[aria-hidden="true"].rounded-3xl');
    expect(card).not.toBeNull();
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('shadow-sm');
  });

  it('all shimmer blocks have animate-shimmer and motion-reduce:animate-none', () => {
    const shimmerBlocks = document.querySelectorAll('.animate-shimmer');
    expect(shimmerBlocks.length).toBeGreaterThan(0);
    shimmerBlocks.forEach((block) => {
      expect(block.classList.contains('motion-reduce:animate-none')).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// 4. HistoryCardSkeleton
// ---------------------------------------------------------------------------

describe('HistoryCardSkeleton', () => {
  beforeEach(() => {
    render(<HistoryCardSkeleton />);
  });

  it('has aria-hidden="true" on the root element', () => {
    const root = document.querySelector('div[aria-hidden="true"]');
    expect(root).not.toBeNull();
  });

  it('renders heading and subtitle shimmer blocks', () => {
    const headingBlock = document.querySelector('.h-6.w-44');
    expect(headingBlock).not.toBeNull();
    const subtitleBlock = document.querySelector('.h-3\\.5.w-64');
    expect(subtitleBlock).not.toBeNull();
  });

  it('renders a badge/pill shimmer block', () => {
    // The pill uses rounded-full
    const badge = document.querySelector('.h-6.w-28.rounded-full');
    expect(badge).not.toBeNull();
  });

  it('renders exactly 3 history event row skeletons', () => {
    const ol = document.querySelector('ol');
    expect(ol).not.toBeNull();
    const items = ol!.querySelectorAll('li');
    expect(items).toHaveLength(3);
  });

  it('each event row has type, summary, and date shimmer blocks', () => {
    const items = document.querySelectorAll('ol > li');
    items.forEach((item) => {
      // Each row has a flex container with shimmer blocks
      const innerFlex = item.querySelector('.flex');
      expect(innerFlex).not.toBeNull();
      const shimmerBlocks = innerFlex!.querySelectorAll('.animate-shimmer');
      expect(shimmerBlocks.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('has correct rounded-3xl card styling', () => {
    const card = document.querySelector('div[aria-hidden="true"].rounded-3xl');
    expect(card).not.toBeNull();
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('shadow-sm');
  });

  it('all shimmer blocks have animate-shimmer and motion-reduce:animate-none', () => {
    const shimmerBlocks = document.querySelectorAll('.animate-shimmer');
    expect(shimmerBlocks.length).toBeGreaterThan(0);
    shimmerBlocks.forEach((block) => {
      expect(block.classList.contains('motion-reduce:animate-none')).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// 5. Structural parity with ReputationProfile (no layout shift)
// ---------------------------------------------------------------------------

describe('ReputationProfileSkeleton – structural parity', () => {
  it('uses the same max-w-5xl mx-auto container as ReputationProfile', () => {
    const { container } = render(<ReputationProfileSkeleton />);
    const section = container.querySelector(
      'section[aria-label="Loading reputation"]'
    );
    expect(section).toHaveClass('max-w-5xl');
    expect(section).toHaveClass('mx-auto');
  });

  it('matches space-y-8 spacing of ReputationProfile', () => {
    const { container } = render(<ReputationProfileSkeleton />);
    const section = container.querySelector(
      'section[aria-label="Loading reputation"]'
    );
    expect(section).toHaveClass('space-y-8');
  });

  it('ProfileCardSkeleton has same rounded-3xl card border as profile card', () => {
    render(<ProfileCardSkeleton />);
    const card = document.querySelector('div[aria-hidden="true"].rounded-3xl');
    expect(card).toHaveClass('border', 'border-slate-200', 'bg-white', 'p-6', 'shadow-sm', 'sm:p-8');
  });

  it('HistoryCardSkeleton has same rounded-3xl card border as history card', () => {
    render(<HistoryCardSkeleton />);
    const card = document.querySelector('div[aria-hidden="true"].rounded-3xl');
    expect(card).toHaveClass('border', 'border-slate-200', 'bg-white', 'p-6', 'shadow-sm', 'sm:p-8');
  });
});

// ---------------------------------------------------------------------------
// 6. Edge cases
// ---------------------------------------------------------------------------

describe('ReputationProfileSkeleton – edge cases', () => {
  it('renders without errors in fast-load scenario (skeleton is visible immediately)', () => {
    // Fast load: the skeleton is the first thing rendered.
    // It should not throw and should have all expected elements.
    const { container } = render(<ReputationProfileSkeleton />);
    const section = container.querySelector(
      'section[aria-label="Loading reputation"]'
    );
    expect(section).not.toBeNull();
    const shimmerBlocks = container.querySelectorAll('.animate-shimmer');
    expect(shimmerBlocks.length).toBeGreaterThan(0);
  });

  it('can be rendered multiple times (re-mounts) without issues', () => {
    // Slow load / error scenario: component may unmount and remount.
    // E.g., data resolves, component unmounts, re-navigation re-mounts.
    const { unmount } = render(<ReputationProfileSkeleton />);
    unmount();

    // Verify skeleton is removed from the DOM (error/success replaces it)
    expect(document.querySelector('section[aria-label="Loading reputation"]')).toBeNull();

    // Re-render (simulating route re-navigation)
    const { container } = render(<ReputationProfileSkeleton />);
    const section = container.querySelector(
      'section[aria-label="Loading reputation"]'
    );
    expect(section).not.toBeNull();
  });

  it('skeleton unmounts cleanly when replaced by content (error replaces skeleton)', () => {
    // Simulates the Next.js Suspense lifecycle: skeleton mounts, data resolves
    // (or error occurs), skeleton unmounts, content mounts.
    const { unmount } = render(<ReputationProfileSkeleton />);
    unmount();

    // After unmount, the skeleton should not be in the DOM.
    // This simulates what happens when an error boundary or content
    // replaces the skeleton during the load→settle transition.
    expect(document.querySelector('.animate-shimmer')).toBeNull();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('status announcement is sr-only (visually hidden)', () => {
    render(<ReputationProfileSkeleton />);
    const status = screen.getByRole('status');
    expect(status.classList.contains('sr-only')).toBe(true);
  });

  it('can compose into ReputationLoading without duplicate status regions', () => {
    // aria-busy lives on <main> only; inner section uses aria-label
    const { container } = render(<ReputationLoading />);

    // <main> has aria-busy
    const main = container.querySelector('main');
    expect(main).toHaveAttribute('aria-busy', 'true');

    // Only one aria-busy (on <main> — inner section doesn't duplicate it)
    const busyElements = container.querySelectorAll('[aria-busy="true"]');
    expect(busyElements).toHaveLength(1);

    // Only one role="status" (from ReputationProfileSkeleton)
    const statusElements = screen.getAllByRole('status');
    expect(statusElements).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// 7. Accessibility – jest-axe audits
// ---------------------------------------------------------------------------

describe('ReputationProfileSkeleton – jest-axe audits', () => {
  it('ProfileCardSkeleton has no axe violations', async () => {
    const { container } = render(<ProfileCardSkeleton />);
    await assertNoA11yViolations(container);
  });

  it('HistoryCardSkeleton has no axe violations', async () => {
    const { container } = render(<HistoryCardSkeleton />);
    await assertNoA11yViolations(container);
  });

  it('ReputationProfileSkeleton has no axe violations', async () => {
    const { container } = render(<ReputationProfileSkeleton />);
    await assertNoA11yViolations(container);
  });

  it('ReputationLoading has no axe violations', async () => {
    const { container } = render(<ReputationLoading />);
    await assertNoA11yViolations(container);
  });
});
