/**
 * ContractProgress.test.tsx
 *
 * Covered behaviours
 * ──────────────────
 * 1. Rendering structure  – section landmark, heading, progressbar, fund cards
 * 2. Completion math      – completedCount / totalCount for all StatusType values
 * 3. Percentage rounding  – Math.round edge cases (0 %, 33 %, 50 %, 67 %, 100 %)
 * 4. Paid / outstanding   – paidAmount and outstandingAmount summed correctly
 * 5. Progressbar ARIA     – aria-valuenow / aria-valuemin / aria-valuemax / aria-label
 * 6. Screen-reader text   – sr-only span inside the bar
 * 7. Section a11y         – aria-labelledby wired to the heading id
 * 8. Status classification– "Completed" and "Paid" → completed; everything else → outstanding
 * 9. Currency handling    – first milestone currency propagated; USD fallback on empty list
 * 10. Edge cases          – single milestone, large payouts
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContractProgress from '../ContractProgress';
import { Milestone } from '../MilestonesList';

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

/**
 * Stub usePreferences so tests are isolated from Intl internals and don't
 * require a PreferencesProvider in the tree.
 */
jest.mock('@/lib/preferences', () => ({
  usePreferences: jest.fn(() => ({
    formatAmount: (amount: number, currency: string = 'USD') =>
      `${currency} ${amount.toFixed(2)}`,
  })),
}));

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

/** Build a milestone with status "Completed". */
function makeCompletedMilestone(overrides?: Partial<Milestone>): Milestone {
  return { id: 'ms-completed', title: 'Completed milestone', status: 'Completed', payout: 1000, currency: 'USD', ...overrides };
}

/** Build a milestone with status "Paid". */
function makePaidMilestone(overrides?: Partial<Milestone>): Milestone {
  return { id: 'ms-paid', title: 'Paid milestone', status: 'Paid', payout: 500, currency: 'USD', ...overrides };
}

/** Build a milestone with status "Pending". */
function makePendingMilestone(overrides?: Partial<Milestone>): Milestone {
  return { id: 'ms-pending', title: 'Pending milestone', status: 'Pending', payout: 2500, currency: 'USD', ...overrides };
}

/** Build a milestone with status "Active". */
function makeActiveMilestone(overrides?: Partial<Milestone>): Milestone {
  return { id: 'ms-active', title: 'Active milestone', status: 'Active', payout: 1200, currency: 'USD', ...overrides };
}

/** Build a milestone with status "Disputed". */
function makeDisputedMilestone(overrides?: Partial<Milestone>): Milestone {
  return { id: 'ms-disputed', title: 'Disputed milestone', status: 'Disputed', payout: 800, currency: 'USD', ...overrides };
}

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------

describe('ContractProgress', () => {
  // =========================================================================
  // 1. Rendering structure
  // =========================================================================

  /**
   * @scenario Rendering structure
   * Verifies the component always mounts the section landmark, heading, progress
   * bar element, and the Paid / Outstanding fund cards.
   */
  describe('rendering structure', () => {
    it('renders an accessible section landmark', () => {
      render(<ContractProgress milestones={[]} />);
      expect(screen.getByRole('region', { name: /escrow progress/i })).toBeInTheDocument();
    });

    it('renders the "Escrow Progress" heading', () => {
      render(<ContractProgress milestones={[]} />);
      expect(screen.getByRole('heading', { name: /escrow progress/i })).toBeInTheDocument();
    });

    it('renders a progressbar element when milestones are present', () => {
      render(<ContractProgress milestones={[makePendingMilestone()]} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('does not render a progressbar when milestones array is empty', () => {
      render(<ContractProgress milestones={[]} />);
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('renders "Paid" and "Outstanding" fund cards', () => {
      render(<ContractProgress milestones={[]} />);
      expect(screen.getByText(/^Paid$/i)).toBeInTheDocument();
    });

    it('renders the "Outstanding" fund card label', () => {
      render(<ContractProgress milestones={[]} />);
      expect(screen.getByText(/^Outstanding$/i)).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Empty state (totalCount === 0)
  // -------------------------------------------------------------------------

  describe('empty state', () => {
    it('shows "No milestones yet" message when milestones array is empty', () => {
      render(<ContractProgress milestones={[]} />);
      expect(screen.getByText('No milestones yet')).toBeInTheDocument();
    });

    it('does not render the "Milestones completed" label when empty', () => {
      render(<ContractProgress milestones={[]} />);
      expect(screen.queryByText(/milestones completed/i)).not.toBeInTheDocument();
    });

    it('does not render the "0 / 0" completion ratio when empty', () => {
      render(<ContractProgress milestones={[]} />);
      expect(screen.queryByText('0 / 0')).not.toBeInTheDocument();
    });

    it('does not render a progressbar when empty', () => {
      render(<ContractProgress milestones={[]} />);
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('still renders financial cards showing zero values when empty', () => {
      render(<ContractProgress milestones={[]} />);
      expect(screen.getByText(/^Paid$/i)).toBeInTheDocument();
      expect(screen.getByText(/^Outstanding$/i)).toBeInTheDocument();
      const zeroes = screen.getAllByText('USD 0.00');
      expect(zeroes).toHaveLength(2);
    });

    it('renders the section heading even when empty', () => {
      render(<ContractProgress milestones={[]} />);
      expect(screen.getByRole('heading', { name: /escrow progress/i })).toBeInTheDocument();
    });

    it('does not throw for an empty milestones array', () => {
      expect(() => render(<ContractProgress milestones={[]} />)).not.toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // Zero milestones — legacy alias kept for back-compat with page-level tests
  // (the component now renders the empty-state branch, not a 0% bar)
  // -------------------------------------------------------------------------

  describe('zero milestones (legacy coverage)', () => {
    it('displays USD 0.00 for both paid and outstanding when milestones is empty', () => {
      render(<ContractProgress milestones={[]} />);
      const zeroes = screen.getAllByText('USD 0.00');
      expect(zeroes).toHaveLength(2);
    });
  });

  // =========================================================================
  // 3. All-paid milestones
  // =========================================================================

  /**
   * @scenario All milestones have status "Completed" or "Paid"
   * Progress must reach 100 %, paid total equals the sum of all payouts,
   * and outstanding must be 0.
   */
  describe('all-paid milestones', () => {
    const allPaid: Milestone[] = [
      makeCompletedMilestone({ id: 'ms-1', payout: 1000 }),
      makePaidMilestone({ id: 'ms-2', payout: 2000 }),
    ];

    it('shows 2 / 2 completion ratio', () => {
      render(<ContractProgress milestones={allPaid} />);
      expect(screen.getByText('2 / 2')).toBeInTheDocument();
    });

    it('sets aria-valuenow to 100', () => {
      render(<ContractProgress milestones={allPaid} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    });

    it('displays the summed payout (1000 + 2000) as paid', () => {
      render(<ContractProgress milestones={allPaid} />);
      expect(screen.getByText('USD 3000.00')).toBeInTheDocument();
    });

    it('displays USD 0.00 for outstanding', () => {
      render(<ContractProgress milestones={allPaid} />);
      expect(screen.getByText('USD 0.00')).toBeInTheDocument();
    });

    it('renders sr-only text "100% complete"', () => {
      render(<ContractProgress milestones={allPaid} />);
      expect(screen.getByText('100% complete')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 4. None-paid milestones
  // =========================================================================

  /**
   * @scenario All milestones are in a non-terminal status (Pending, Active, Disputed)
   * Progress stays at 0 %, paid total is 0, and outstanding equals the full sum.
   */
  describe('none-paid milestones', () => {
    const nonePaid: Milestone[] = [
      makePendingMilestone({ id: 'ms-1', payout: 1500 }),
      makeActiveMilestone({ id: 'ms-2', payout: 2500 }),
    ];

    it('shows 0 / 2 completion ratio', () => {
      render(<ContractProgress milestones={nonePaid} />);
      expect(screen.getByText('0 / 2')).toBeInTheDocument();
    });

    it('sets aria-valuenow to 0', () => {
      render(<ContractProgress milestones={nonePaid} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    });

    it('displays USD 0.00 for paid', () => {
      render(<ContractProgress milestones={nonePaid} />);
      expect(screen.getByText('USD 0.00')).toBeInTheDocument();
    });

    it('displays the full sum (1500 + 2500 = 4000) as outstanding', () => {
      render(<ContractProgress milestones={nonePaid} />);
      expect(screen.getByText('USD 4000.00')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 5. Mixed milestones – completion math & percentage rounding
  // =========================================================================

  /**
   * @scenario 1 of 3 milestones completed
   * Math.round(1/3 * 100) = 33.
   */
  describe('mixed milestones – 1 of 3 (33 %)', () => {
    const mixed: Milestone[] = [
      makeCompletedMilestone({ id: 'ms-1', payout: 1500 }),
      makePendingMilestone({ id: 'ms-2', payout: 2500 }),
      makePendingMilestone({ id: 'ms-3', payout: 3000 }),
    ];

    it('shows 1 / 3 completion ratio', () => {
      render(<ContractProgress milestones={mixed} />);
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    it('sets aria-valuenow to 33 (rounded)', () => {
      render(<ContractProgress milestones={mixed} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '33');
    });

    it('displays paid amount of 1500', () => {
      render(<ContractProgress milestones={mixed} />);
      expect(screen.getByText('USD 1500.00')).toBeInTheDocument();
    });

    it('displays outstanding amount of 5500 (2500 + 3000)', () => {
      render(<ContractProgress milestones={mixed} />);
      expect(screen.getByText('USD 5500.00')).toBeInTheDocument();
    });
  });

  /**
   * @scenario 1 of 2 milestones completed
   * Math.round(1/2 * 100) = 50.
   */
  describe('mixed milestones – 1 of 2 (50 %)', () => {
    const half: Milestone[] = [
      makeCompletedMilestone({ id: 'ms-1', payout: 300 }),
      makePendingMilestone({ id: 'ms-2', payout: 700 }),
    ];

    it('shows 1 / 2 completion ratio', () => {
      render(<ContractProgress milestones={half} />);
      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });

    it('sets aria-valuenow to 50', () => {
      render(<ContractProgress milestones={half} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    });
  });

  /**
   * @scenario 2 of 3 milestones completed
   * Math.round(2/3 * 100) = 67.
   */
  describe('mixed milestones – 2 of 3 (67 %)', () => {
    const twoThirds: Milestone[] = [
      makeCompletedMilestone({ id: 'ms-1', payout: 500 }),
      makePaidMilestone({ id: 'ms-2', payout: 500 }),
      makePendingMilestone({ id: 'ms-3', payout: 1000 }),
    ];

    it('shows 2 / 3 completion ratio', () => {
      render(<ContractProgress milestones={twoThirds} />);
      expect(screen.getByText('2 / 3')).toBeInTheDocument();
    });

    it('sets aria-valuenow to 67 (rounded)', () => {
      render(<ContractProgress milestones={twoThirds} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '67');
    });

    it('sums "Completed" and "Paid" payouts into paid amount (500 + 500 = 1000), and outstanding also = 1000', () => {
      render(<ContractProgress milestones={twoThirds} />);
      // Both paid and outstanding happen to equal 1000 — assert two such labels exist
      expect(screen.getAllByText('USD 1000.00')).toHaveLength(2);
    });
  });

  /**
   * @scenario 1 of 6 milestones completed
   * Math.round(1/6 * 100) = 17.
   */
  describe('mixed milestones – 1 of 6 (17 %)', () => {
    const sixMilestones: Milestone[] = [
      makeCompletedMilestone({ id: 'ms-1', payout: 100 }),
      ...Array.from({ length: 5 }, (_, i) =>
        makePendingMilestone({ id: `ms-${i + 2}`, payout: 200 }),
      ),
    ];

    it('sets aria-valuenow to 17 (Math.round(1/6 * 100))', () => {
      render(<ContractProgress milestones={sixMilestones} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '17');
    });

    it('shows 1 / 6 completion ratio', () => {
      render(<ContractProgress milestones={sixMilestones} />);
      expect(screen.getByText('1 / 6')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 6. Progressbar ARIA attributes
  // =========================================================================

  /**
   * @scenario ARIA semantics on the progressbar
   * aria-valuemin must always be 0, aria-valuemax must always be 100,
   * and the accessible name must embed counts and percentage.
   */
  describe('progressbar ARIA attributes', () => {
    it('always exposes aria-valuemin="0"', () => {
      render(<ContractProgress milestones={[makeCompletedMilestone()]} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemin', '0');
    });

    it('always exposes aria-valuemax="100"', () => {
      render(<ContractProgress milestones={[makeCompletedMilestone()]} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '100');
    });

    it('provides a descriptive aria-label for 1 of 2 milestones (50 %)', () => {
      const milestones = [makeCompletedMilestone(), makePendingMilestone()];
      render(<ContractProgress milestones={milestones} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute(
        'aria-label',
        '1 of 2 milestones completed, 50%',
      );
    });

    it('aria-valuenow is 0 for zero milestones', () => {
      // When milestones is empty the progressbar is not rendered at all;
      // this test confirms the absence rather than a 0 value.
      render(<ContractProgress milestones={[]} />);
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // 7. Screen-reader text inside the progress bar
  // =========================================================================

  /**
   * @scenario sr-only span
   * The inner <span className="sr-only"> must echo the percentage so assistive
   * technology that reads inner text instead of ARIA attributes still gets a value.
   */
  describe('sr-only progress text', () => {
    it('renders "33% complete" inside the bar for 1 of 3 milestones', () => {
      const milestones = [
        makeCompletedMilestone({ id: 'ms-1' }),
        makePendingMilestone({ id: 'ms-2' }),
        makePendingMilestone({ id: 'ms-3' }),
      ];
      render(<ContractProgress milestones={milestones} />);
      expect(screen.getByText('33% complete')).toBeInTheDocument();
    });

    it('renders "50% complete" for 1 of 2 milestones', () => {
      render(<ContractProgress milestones={[makeCompletedMilestone(), makePendingMilestone()]} />);
      expect(screen.getByText('50% complete')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 8. Section landmark accessibility
  // =========================================================================

  /**
   * @scenario aria-labelledby wiring
   * The <section> uses aria-labelledby pointing to the heading's id so that
   * screen readers announce "Escrow Progress" as the region name.
   */
  describe('section landmark a11y', () => {
    it('wires aria-labelledby to the heading id "contract-progress-title"', () => {
      const { container } = render(<ContractProgress milestones={[]} />);
      const section = container.querySelector('section');
      expect(section).toHaveAttribute('aria-labelledby', 'contract-progress-title');
    });

    it('heading has id="contract-progress-title"', () => {
      render(<ContractProgress milestones={[]} />);
      const heading = screen.getByRole('heading', { name: /escrow progress/i });
      expect(heading).toHaveAttribute('id', 'contract-progress-title');
    });
  });

  // =========================================================================
  // 9. Status classification – all five StatusType values
  // =========================================================================

  /**
   * @scenario StatusType classification
   * "Completed" and "Paid" count as done; "Active", "Pending", "Disputed" do not.
   */
  describe('status classification', () => {
    it('"Completed" status counts as completed and adds to paidAmount', () => {
      render(<ContractProgress milestones={[makeCompletedMilestone({ payout: 900 })]} />);
      expect(screen.getByText('1 / 1')).toBeInTheDocument();
      expect(screen.getByText('USD 900.00')).toBeInTheDocument();
    });

    it('"Paid" status counts as completed and adds to paidAmount', () => {
      render(<ContractProgress milestones={[makePaidMilestone({ payout: 450 })]} />);
      expect(screen.getByText('1 / 1')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
      expect(screen.getByText('USD 450.00')).toBeInTheDocument();
    });

    it('"Pending" status does NOT count as completed', () => {
      render(<ContractProgress milestones={[makePendingMilestone({ payout: 300 })]} />);
      expect(screen.getByText('0 / 1')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    });

    it('"Active" status does NOT count as completed', () => {
      render(<ContractProgress milestones={[makeActiveMilestone({ payout: 400 })]} />);
      expect(screen.getByText('0 / 1')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    });

    it('"Disputed" status does NOT count as completed', () => {
      render(<ContractProgress milestones={[makeDisputedMilestone({ payout: 800 })]} />);
      expect(screen.getByText('0 / 1')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    });

    it('"Disputed" payout is treated as outstanding, not paid', () => {
      render(<ContractProgress milestones={[makeDisputedMilestone({ payout: 800 })]} />);
      // outstanding = 800, paid = 0
      expect(screen.getByText('USD 800.00')).toBeInTheDocument(); // outstanding
      expect(screen.getByText('USD 0.00')).toBeInTheDocument();   // paid
    });
  });

  // =========================================================================
  // 10. Currency handling
  // =========================================================================

  /**
   * @scenario Currency propagation
   * The currency of the first milestone is forwarded to formatAmount.
   * When the list is empty the component falls back to "USD".
   */
  describe('currency handling', () => {
    it('uses the currency of the first milestone for formatting', () => {
      render(<ContractProgress milestones={[makeCompletedMilestone({ currency: 'NGN', payout: 200000 })]} />);
      expect(screen.getByText('NGN 200000.00')).toBeInTheDocument();
    });

    it('falls back to USD when the milestones array is empty', () => {
      render(<ContractProgress milestones={[]} />);
      expect(screen.getAllByText('USD 0.00').length).toBeGreaterThanOrEqual(1);
    });

    it('uses the first milestone currency even when later milestones differ', () => {
      const milestones: Milestone[] = [
        makeCompletedMilestone({ id: 'ms-1', currency: 'EUR', payout: 500 }),
        makePendingMilestone({ id: 'ms-2', currency: 'GBP', payout: 250 }),
      ];
      render(<ContractProgress milestones={milestones} />);
      // paid card should use EUR (from first milestone)
      expect(screen.getByText('EUR 500.00')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 11. Single-milestone edge cases
  // =========================================================================

  /**
   * @scenario Single milestone
   * Boundary check: one milestone in each terminal state yields 100 %,
   * one in a non-terminal state yields 0 %.
   */
  describe('single-milestone boundary', () => {
    it('one "Completed" milestone → 1/1, 100 %, full payout as paid', () => {
      render(<ContractProgress milestones={[makeCompletedMilestone({ payout: 5000 })]} />);
      expect(screen.getByText('1 / 1')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
      expect(screen.getByText('USD 5000.00')).toBeInTheDocument();
    });

    it('one "Pending" milestone → 0/1, 0 %, full payout as outstanding', () => {
      render(<ContractProgress milestones={[makePendingMilestone({ payout: 5000 })]} />);
      expect(screen.getByText('0 / 1')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
      expect(screen.getByText('USD 5000.00')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 12. Large payout values
  // =========================================================================

  /**
   * @scenario Large integer payouts
   * Confirms no overflow or formatting errors for contract values up to
   * Number.MAX_SAFE_INTEGER territory.
   */
  describe('large payout values', () => {
    it('correctly sums large payouts without overflow', () => {
      const milestones: Milestone[] = [
        makeCompletedMilestone({ id: 'ms-1', payout: 9_000_000 }),
        makePendingMilestone({ id: 'ms-2', payout: 1_000_000 }),
      ];
      render(<ContractProgress milestones={milestones} />);
      expect(screen.getByText('USD 9000000.00')).toBeInTheDocument(); // paid
      expect(screen.getByText('USD 1000000.00')).toBeInTheDocument(); // outstanding
    });
  });
});
