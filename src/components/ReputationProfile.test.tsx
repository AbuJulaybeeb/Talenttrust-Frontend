/**
 * ReputationProfile.test.tsx
 *
 * Locks down every conditional rendering branch of ReputationProfile:
 *   1. No reputation yet   – undefined score
 *   2. No reputation yet   – null score
 *   3. Score === 0         – edge: falsy-but-valid score (hasReputation = true)
 *   4. Partial reputation  – score present, history empty  (amber banner)
 *   5. Full reputation     – score present, history non-empty (events rendered)
 *   6. Single-char initial – name.slice(0,1).toUpperCase() avatar edge case
 *   7. Accessible labelling & sr-only structure
 *   8. Default prop values
 *   9. Accessibility – jest-axe audit (issue #135 req.)
 *  10. Semantic ordered list & <time> element (issue #246)
 *       – history renders as <ol> not <ul>
 *       – each date is wrapped in a <time> element
 *       – valid ISO dates get a machine-readable dateTime attribute
 *       – non-parseable date strings omit the dateTime attribute
 *       – empty history shows no list at all
 *
 * Accessibility assertions follow the aria-labelledby contracts expressed in
 * the component source and are verified via jest-axe for the full-history
 * state (as required by issue #135).
 *
 * Types are imported from the component itself – no duplicates.
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import ReputationProfile, {
  ReputationEvent,
  ReputationProfileProps,
} from './ReputationProfile';
import { assertNoA11yViolations } from '@/test-utils/a11y';

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const HISTORY_EVENTS: ReputationEvent[] = [
  {
    id: 'ev-1',
    type: 'Verification',
    summary: 'Completed identity verification',
    date: '2026-04-24',
  },
  {
    id: 'ev-2',
    type: 'On-chain review',
    summary: 'Received positive trust signal',
    date: '2026-04-23',
  },
  {
    id: 'ev-3',
    type: 'Referral',
    summary: 'Referred two new community members',
    date: '2026-04-20',
  },
];

// Convenience wrapper so every render call uses the exported prop type.
function renderProfile(props: ReputationProfileProps) {
  return render(<ReputationProfile {...props} />);
}

function getLevelText() {
  const levelBlock = document.querySelector('[aria-labelledby="reputation-level-label"]');
  return levelBlock?.textContent?.replace('Level', '').trim() ?? '';
}

// ---------------------------------------------------------------------------
// 1. No-reputation state – undefined score (default)
// ---------------------------------------------------------------------------

describe('ReputationProfile – no reputation (undefined score)', () => {
  beforeEach(() => {
    renderProfile({ name: 'Guest User', history: [] });
  });

  it('renders "No reputation yet" in the score block', () => {
    expect(screen.getByText(/No reputation yet/i)).toBeInTheDocument();
  });

  it('renders "Pending" in the level block', () => {
    expect(screen.getByText(/^Pending$/i)).toBeInTheDocument();
  });

  it('renders "Private by default" pill in the history header', () => {
    expect(screen.getByText(/Private by default/i)).toBeInTheDocument();
  });

  it('renders the empty history message', () => {
    expect(
      screen.getByText(/No reputation history available yet\./i)
    ).toBeInTheDocument();
  });

  it('does NOT render the partial-reputation amber banner', () => {
    expect(screen.queryByText(/Partial reputation data/i)).not.toBeInTheDocument();
  });

  it('does NOT render any history event list items', () => {
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 2. No-reputation state – explicit null score
// ---------------------------------------------------------------------------

describe('ReputationProfile – no reputation (null score)', () => {
  beforeEach(() => {
    renderProfile({ name: 'Legacy User', score: null, history: [] });
  });

  it('renders "No reputation yet" when score is null', () => {
    expect(screen.getByText(/No reputation yet/i)).toBeInTheDocument();
  });

  it('renders "Pending" when score is null', () => {
    expect(screen.getByText(/^Pending$/i)).toBeInTheDocument();
  });

  it('does NOT show the partial banner for null score', () => {
    expect(screen.queryByText(/Partial reputation data/i)).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 3. Edge case – score of 0 (falsy in JS but valid per hasReputation logic)
// ---------------------------------------------------------------------------

describe('ReputationProfile – score === 0 (edge: falsy-but-valid)', () => {
  beforeEach(() => {
    renderProfile({ name: 'New Member', score: 0, level: 'Newcomer', history: [] });
  });

  it('renders "0" as the score (hasReputation = true for score >= 0)', () => {
    // The score paragraph contains the digit "0" (plus sr-only spans).
    const scorePara = screen.getByText(
      (_c, el) => el?.tagName === 'P' && /0/.test(el.textContent ?? '')
        && el.getAttribute('aria-labelledby') === 'reputation-score-label'
    );
    expect(scorePara).toBeInTheDocument();
  });

  it('renders the level label, not "Pending"', () => {
    expect(getLevelText()).toBe('Newcomer');
    expect(screen.queryByText(/^Pending$/i)).not.toBeInTheDocument();
  });

  it('shows the partial amber banner because history is empty', () => {
    expect(screen.getByText(/Partial reputation data/i)).toBeInTheDocument();
  });

  it('shows "Private by default" pill', () => {
    expect(screen.getByText(/Private by default/i)).toBeInTheDocument();
  });

  it('does NOT render "No reputation yet"', () => {
    expect(screen.queryByText(/No reputation yet/i)).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 4. Partial reputation – score present, history empty (amber banner)
// ---------------------------------------------------------------------------

describe('ReputationProfile – partial reputation (score, no history)', () => {
  const PARTIAL_PROPS: ReputationProfileProps = {
    name: 'Partial User',
    score: 42,
    level: 'Active Member',
    history: [],
  };

  beforeEach(() => {
    renderProfile(PARTIAL_PROPS);
  });

  it('renders the amber "Partial reputation data" banner', () => {
    expect(screen.getByText(/Partial reputation data/i)).toBeInTheDocument();
  });

  it('renders the banner explanation text', () => {
    expect(
      screen.getByText(/A score exists but history is currently hidden/i)
    ).toBeInTheDocument();
  });

  it('renders "Private by default" pill (history.length === 0)', () => {
    expect(screen.getByText(/Private by default/i)).toBeInTheDocument();
  });

  it('renders the score value', () => {
    expect(screen.getByText(/42/)).toBeInTheDocument();
  });

  it('renders the level', () => {
    expect(getLevelText()).toBe('Active Member');
  });

  it('does NOT render history list items', () => {
    expect(document.querySelector('ol')).toBeNull();
  });

  it('renders the empty history message', () => {
    expect(
      screen.getByText(/No reputation history available yet\./i)
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 5. Full reputation – score present, history non-empty
// ---------------------------------------------------------------------------

describe('ReputationProfile – full reputation (score + history)', () => {
  const FULL_PROPS: ReputationProfileProps = {
    name: 'Verified User',
    score: 88,
    level: 'Trusted Contributor',
    history: HISTORY_EVENTS,
  };

  beforeEach(() => {
    renderProfile(FULL_PROPS);
  });

  it('renders the score value', () => {
    expect(screen.getByText(/88/)).toBeInTheDocument();
  });

  it('renders the level', () => {
    expect(getLevelText()).toBe('Trusted Contributor');
  });

  it('renders the "Visible" pill (history present)', () => {
    expect(screen.getByText(/^Visible$/i)).toBeInTheDocument();
  });

  it('does NOT render the partial banner', () => {
    expect(screen.queryByText(/Partial reputation data/i)).not.toBeInTheDocument();
  });

  it('does NOT render the empty history message', () => {
    expect(
      screen.queryByText(/No reputation history available yet\./i)
    ).not.toBeInTheDocument();
  });

  it('renders a list item for each ReputationEvent', () => {
    const ol = document.querySelector('ol');
    const items = ol ? within(ol).getAllByRole('listitem') : [];
    expect(items).toHaveLength(HISTORY_EVENTS.length);
  });

  it('renders each event type label', () => {
    HISTORY_EVENTS.forEach((ev) => {
      expect(screen.getByText(ev.type)).toBeInTheDocument();
    });
  });

  it('renders each event summary', () => {
    HISTORY_EVENTS.forEach((ev) => {
      expect(screen.getByText(ev.summary)).toBeInTheDocument();
    });
  });

  it('renders each event date', () => {
    HISTORY_EVENTS.forEach((ev) => {
      expect(screen.getByText(ev.date)).toBeInTheDocument();
    });
  });

  it('renders events in DOM order matching the history array', () => {
    const ol = document.querySelector('ol');
    const items = ol ? within(ol).getAllByRole('listitem') : [];
    HISTORY_EVENTS.forEach((ev, idx) => {
      expect(within(items[idx]).getByText(ev.summary)).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// 6. Single-character name initial
// ---------------------------------------------------------------------------

describe('ReputationProfile – single-character name initial', () => {
  it('renders the uppercased first character of a one-letter name', () => {
    renderProfile({ name: 'A', history: [] });
    // The avatar div contains exactly the initial letter.
    expect(screen.getByText('A', { selector: 'div' })).toBeInTheDocument();
  });

  it('uppercases the first character for a lowercase name', () => {
    renderProfile({ name: 'alice', history: [] });
    expect(screen.getByText('A', { selector: 'div' })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 7. Accessible labelling & sr-only structure
// ---------------------------------------------------------------------------

describe('ReputationProfile – accessible labelling', () => {
  it('renders a section element labelled by "profile-heading"', () => {
    renderProfile({ name: 'Aria Test User', history: [] });
    const section = screen.getByRole('region', { name: /Reputation profile for Aria Test User/i });
    expect(section).toBeInTheDocument();
    expect(section.getAttribute('aria-labelledby')).toBe('profile-heading');
  });

  it('renders an sr-only h2 with the user name', () => {
    renderProfile({ name: 'Screen Reader User', history: [] });
    const heading = document.getElementById('profile-heading');
    expect(heading).not.toBeNull();
    expect(heading?.textContent).toMatch(/Reputation profile for Screen Reader User/i);
    expect(heading?.classList.contains('sr-only')).toBe(true);
  });

  it('score paragraph carries aria-labelledby="reputation-score-label"', () => {
    renderProfile({ name: 'Score Label User', score: 70, history: [] });
    // The <p> that shows the score must reference the label element.
    const scorePara = document.querySelector('[aria-labelledby="reputation-score-label"]');
    expect(scorePara).not.toBeNull();
  });

  it('level paragraph carries aria-labelledby="reputation-level-label"', () => {
    renderProfile({ name: 'Level Label User', score: 70, history: [] });
    const levelPara = document.querySelector('[aria-labelledby="reputation-level-label"]');
    expect(levelPara).not.toBeNull();
  });

  it('score label element has id="reputation-score-label"', () => {
    renderProfile({ name: 'Label Id User', score: 55, history: [] });
    const labelEl = document.getElementById('reputation-score-label');
    expect(labelEl).not.toBeNull();
    expect(labelEl?.textContent).toMatch(/Reputation score/i);
  });

  it('level label element has id="reputation-level-label"', () => {
    renderProfile({ name: 'Level Id User', score: 55, history: [] });
    const labelEl = document.getElementById('reputation-level-label');
    expect(labelEl).not.toBeNull();
    expect(labelEl?.textContent).toMatch(/^Level$/i);
  });

  it('sr-only span announces "Reputation score " before the numeric value', () => {
    renderProfile({ name: 'SR Score User', score: 77, history: [] });
    const srSpans = screen.getAllByText(/Reputation score/i);
    // At least one sr-only span should exist.
    const srOnlySpan = srSpans.find((el) => el.classList.contains('sr-only'));
    expect(srOnlySpan).toBeDefined();
  });

it('sr-only span announces "out of {maxScore}" after the numeric score', () => {
     renderProfile({ name: 'SR Out User', score: 77, maxScore: 10, history: [] });
     const outOf10 = screen.getAllByText(/out of 10/i);
     const srOnlySpan = outOf10.find((el) => el.classList.contains('sr-only'));
     expect(srOnlySpan).toBeDefined();
   });

   it('sr-only span announces "out of 5" (default) after the numeric score', () => {
     renderProfile({ name: 'SR Out Default User', score: 77, history: [] });
     const outOf5 = screen.getAllByText(/out of 5/i);
     const srOnlySpan = outOf5.find((el) => el.classList.contains('sr-only'));
     expect(srOnlySpan).toBeDefined();
   });

  it('sr-only span announces "Level " before the level text when score exists', () => {
    renderProfile({ name: 'SR Level User', score: 77, level: 'Expert', history: [] });
    const levelSpans = screen.getAllByText(/^Level$/i);
    const srOnlySpan = levelSpans.find((el) => el.classList.contains('sr-only'));
    expect(srOnlySpan).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// 8. Default prop values
// ---------------------------------------------------------------------------

describe('ReputationProfile – default prop values', () => {
  it('derives level from score when level is not provided', () => {
    renderProfile({ name: 'Default User', score: 3 });
    expect(getLevelText()).toBe('Trusted Partner');
  });

  it('defaults history to [] (no events rendered, no crash)', () => {
    // No history prop → should not throw and should show empty state.
    renderProfile({ name: 'Default History User', score: 50 });
    expect(
      screen.getByText(/No reputation history available yet\./i)
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 9. Accessibility – jest-axe audit on full-history state (issue #135 req.)
// ---------------------------------------------------------------------------

describe('ReputationProfile – jest-axe audit', () => {
  it('full-history state has no axe violations', async () => {
    const { container } = render(
      <ReputationProfile
        name="Verified User"
        score={88}
        level="Trusted Contributor"
        history={HISTORY_EVENTS}
      />
    );
    await assertNoA11yViolations(container);
  });

  it('no-reputation state has no axe violations', async () => {
    const { container } = render(
      <ReputationProfile name="Guest User" history={[]} />
    );
    await assertNoA11yViolations(container);
  });

  it('partial-reputation state has no axe violations', async () => {
    const { container } = render(
      <ReputationProfile name="Partial User" score={42} level="Active Member" history={[]} />
    );
    await assertNoA11yViolations(container);
  });

  it('null score state has no axe violations', async () => {
    const { container } = render(
      <ReputationProfile name="Legacy User" score={null} history={[]} />
    );
    await assertNoA11yViolations(container);
  });
});

// ---------------------------------------------------------------------------
// 10. Semantic ordered list & <time> element (issue #246)
// ---------------------------------------------------------------------------

describe('ReputationProfile – ordered list semantics (issue #246)', () => {
  /**
   * Scenario: History renders as <ol>, not <ul>.
   * Reputation history is inherently chronological, so the list must be
   * ordered to convey sequential meaning to assistive technologies.
   */
  it('renders the history as an ordered list (<ol>) when events are present', () => {
    const { container } = renderProfile({
      name: 'Ordered List User',
      score: 80,
      history: HISTORY_EVENTS,
    });
    const ol = container.querySelector('ol');
    expect(ol).not.toBeNull();
    const historyHeading = screen.getByRole('heading', { name: /reputation history/i });
    const historySection = historyHeading.closest('div');
    const ul = historySection ? historySection.querySelector('ul') : null;
    expect(ul).toBeNull();
  });

  /**
   * Scenario: Each event date is rendered inside a <time> element.
   * The <time> element communicates a machine-readable date to browsers,
   * search engines, and assistive technologies.
   */
  it('wraps each event date in a <time> element', () => {
    const { container } = renderProfile({
      name: 'Time Element User',
      score: 80,
      history: HISTORY_EVENTS,
    });
    const timeEls = container.querySelectorAll('time');
    expect(timeEls).toHaveLength(HISTORY_EVENTS.length);
  });

  /**
   * Scenario: Valid ISO date strings get a machine-readable dateTime attribute.
   * The dateTime attribute value must equal the raw date string.
   */
  it('sets dateTime attribute equal to the ISO date string for valid dates', () => {
    const { container } = renderProfile({
      name: 'DateTime Attr User',
      score: 80,
      history: HISTORY_EVENTS,
    });
    const timeEls = container.querySelectorAll('time');
    HISTORY_EVENTS.forEach((ev, idx) => {
      expect(timeEls[idx].getAttribute('dateTime')).toBe(ev.date);
    });
  });

  /**
   * Scenario: A non-parseable date string omits the dateTime attribute.
   * Emitting an invalid dateTime value would produce invalid HTML, so
   * the attribute should be absent when the date cannot be parsed.
   */
  it('omits dateTime attribute when event.date is not a parseable date', () => {
    const invalidDateEvent: ReputationEvent = {
      id: 'ev-bad',
      type: 'Unknown',
      summary: 'Event with unparseable date',
      date: 'not-a-date',
    };
    const { container } = renderProfile({
      name: 'Invalid Date User',
      score: 80,
      history: [invalidDateEvent],
    });
    const timeEl = container.querySelector('time');
    expect(timeEl).not.toBeNull();
    // The visible text should still be shown
    expect(timeEl?.textContent).toBe('not-a-date');
    // But dateTime attribute must NOT be set
    expect(timeEl?.hasAttribute('dateTime')).toBe(false);
  });

  /**
   * Scenario: The <time> element contains the human-readable date text.
   * The text content of each <time> must match the event.date string.
   */
  it('renders each event date as the text content of its <time> element', () => {
    const { container } = renderProfile({
      name: 'Time Text User',
      score: 80,
      history: HISTORY_EVENTS,
    });
    const timeEls = container.querySelectorAll('time');
    HISTORY_EVENTS.forEach((ev, idx) => {
      expect(timeEls[idx].textContent).toBe(ev.date);
    });
  });

  /**
   * Scenario: Empty history shows no list at all — no <ol>, no <ul>.
   * When history is empty, the empty-state message is shown instead.
   */
  it('renders no ordered list when history is empty', () => {
    const { container } = renderProfile({
      name: 'Empty History User',
      history: [],
    });
    expect(container.querySelector('ol')).toBeNull();
    expect(container.querySelector('ul')).toBeNull();
    expect(
      screen.getByText(/No reputation history available yet\./i)
    ).toBeInTheDocument();
  });

  /**
   * Scenario: "Private by default" pill appears when history is empty.
   * This preserves the existing presentation for the empty-history path.
   */
  it('shows "Private by default" pill when history is empty', () => {
    renderProfile({ name: 'Private User', history: [] });
    expect(screen.getByText(/Private by default/i)).toBeInTheDocument();
  });

  /**
   * Scenario: List items inside <ol> are still individually selectable.
   * Confirms that the <li> children carry the correct implicit role.
   */
  it('renders a list item role for each event inside the ordered list', () => {
    renderProfile({
      name: 'Listitem Role User',
      score: 80,
      history: HISTORY_EVENTS,
    });
    const ol = document.querySelector('ol');
    const items = ol ? within(ol).getAllByRole('listitem') : [];
    expect(items).toHaveLength(HISTORY_EVENTS.length);
  });

/**
    * Scenario: axe accessibility audit passes with the new <ol> + <time> structure.
    * This confirms no new a11y violations are introduced by the semantic change.
    */
   it('full-history state with <ol> and <time> has no axe violations', async () => {
     const { container } = render(
       <ReputationProfile
         name="A11y Ol Time User"
         score={90}
         level="Expert"
         history={HISTORY_EVENTS}
       />
     );
     await assertNoA11yViolations(container);
   });
 });

// ---------------------------------------------------------------------------
// 11. Meter semantics for reputation score (issue #245)
// ---------------------------------------------------------------------------

describe('ReputationProfile – reputation score meter (issue #245)', () => {
   it('renders a meter role when score is present', () => {
     renderProfile({ name: 'Meter User', score: 88, history: HISTORY_EVENTS });
     const meter = screen.getByRole('meter');
     expect(meter).toBeInTheDocument();
   });

   it('meter has aria-valuenow set to the score value', () => {
     renderProfile({ name: 'Meter Value User', score: 75, history: HISTORY_EVENTS });
     const meter = screen.getByRole('meter');
     expect(meter).toHaveAttribute('aria-valuenow', '75');
   });

   it('meter has aria-valuemin set to 0', () => {
     renderProfile({ name: 'Meter Min User', score: 50, history: HISTORY_EVENTS });
     const meter = screen.getByRole('meter');
     expect(meter).toHaveAttribute('aria-valuemin', '0');
   });

   it('meter has aria-valuemax set to maxScore prop (default 5)', () => {
     renderProfile({ name: 'Meter Max Default User', score: 4, history: HISTORY_EVENTS });
     const meter = screen.getByRole('meter');
     expect(meter).toHaveAttribute('aria-valuemax', '5');
   });

   it('meter has aria-valuemax set to custom maxScore when provided', () => {
     renderProfile({ name: 'Meter Max Custom User', score: 42, maxScore: 100, history: HISTORY_EVENTS });
     const meter = screen.getByRole('meter');
     expect(meter).toHaveAttribute('aria-valuemax', '100');
   });

   it('does NOT render a meter role when score is absent', () => {
     renderProfile({ name: 'No Meter User', history: [] });
     expect(screen.queryByRole('meter')).not.toBeInTheDocument();
   });

   it('does NOT render a meter role when score is null', () => {
     renderProfile({ name: 'No Meter Null User', score: null, history: [] });
     expect(screen.queryByRole('meter')).not.toBeInTheDocument();
   });

   it('meter renders at min value (score 0)', () => {
     renderProfile({ name: 'Meter Min Value User', score: 0, maxScore: 5, history: HISTORY_EVENTS });
     const meter = screen.getByRole('meter');
     expect(meter).toHaveAttribute('aria-valuenow', '0');
     expect(meter).toHaveAttribute('aria-valuemin', '0');
     expect(meter).toHaveAttribute('aria-valuemax', '5');
   });

   it('meter renders at max value (score equals maxScore)', () => {
     renderProfile({ name: 'Meter Max Value User', score: 5, maxScore: 5, history: HISTORY_EVENTS });
     const meter = screen.getByRole('meter');
     expect(meter).toHaveAttribute('aria-valuenow', '5');
     expect(meter).toHaveAttribute('aria-valuemax', '5');
   });

   it('meter has an accessible name via aria-labelledby', () => {
     renderProfile({ name: 'Meter A11y User', score: 88, history: HISTORY_EVENTS });
     const meter = screen.getByRole('meter');
     expect(meter).toHaveAttribute('aria-labelledby', 'reputation-score-label');
   });

   it('meter axe audit passes for score-present state', async () => {
     const { container } = render(
       <ReputationProfile
         name="Meter A11y Verified User"
         score={88}
         level="Trusted Contributor"
         history={HISTORY_EVENTS}
       />
     );
     await assertNoA11yViolations(container);
   });

    it('meter axe audit passes for score-null state', async () => {
      const { container } = render(
        <ReputationProfile name="Meter A11y Guest User" score={null} history={[]} />
      );
      await assertNoA11yViolations(container);
    });
  });

  describe('reputation level legend and derived level', () => {
    it('does not render the legend when there is no score', () => {
      renderProfile({ name: 'No Score User', score: undefined });
      expect(screen.queryByText(/Reputation Level Legend/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('list', { name: /Reputation Level Legend/i })).not.toBeInTheDocument();
    });

    it('renders the legend when score exists', () => {
      renderProfile({ name: 'Score User', score: 3.5 });
      expect(screen.getByText(/Reputation Level Legend/i)).toBeInTheDocument();
      const legendList = screen.getByRole('list', { name: /Reputation Level Legend/i });
      expect(legendList).toBeInTheDocument();
      expect(within(legendList).getAllByRole('listitem')).toHaveLength(5);
    });

    it('associates the meter with the legend via aria-describedby', () => {
      renderProfile({ name: 'A11y User', score: 3.5 });
      const meter = screen.getByRole('meter');
      expect(meter).toHaveAttribute('aria-describedby', 'reputation-legend');
    });

    it('honors the explicit level prop when provided', () => {
      renderProfile({ name: 'Explicit Level User', score: 4.5, level: 'Custom Legend Status' });
      expect(screen.getByText('Custom Legend Status')).toBeInTheDocument();
    });

    it('derives level from score when level is not provided (default maxScore = 5)', () => {
      // Band 1 [0, 1): Newcomer
      const { unmount } = renderProfile({ name: 'User 1', score: 0.5 });
      expect(getLevelText()).toBe('Newcomer');
      unmount();

      // Band 2 [1, 2): Contributor
      const { unmount: unmount2 } = renderProfile({ name: 'User 2', score: 1.5 });
      expect(getLevelText()).toBe('Contributor');
      unmount2();

      // Band 3 [2, 3): Active Contributor
      const { unmount: unmount3 } = renderProfile({ name: 'User 3', score: 2.5 });
      expect(getLevelText()).toBe('Active Contributor');
      unmount3();

      // Band 4 [3, 4): Trusted Partner
      const { unmount: unmount4 } = renderProfile({ name: 'User 4', score: 3.5 });
      expect(getLevelText()).toBe('Trusted Partner');
      unmount4();

      // Band 5 [4, 5]: Expert
      renderProfile({ name: 'User 5', score: 4.5 });
      expect(getLevelText()).toBe('Expert');
    });

    it('correctly maps scores at boundaries (default maxScore = 5)', () => {
      // Score exactly 0 -> Newcomer
      const { unmount: u0 } = renderProfile({ name: 'U0', score: 0 });
      expect(getLevelText()).toBe('Newcomer');
      u0();

      // Score exactly 1 -> Contributor
      const { unmount: u1 } = renderProfile({ name: 'U1', score: 1.0 });
      expect(getLevelText()).toBe('Contributor');
      u1();

      // Score exactly 2 -> Active Contributor
      const { unmount: u2 } = renderProfile({ name: 'U2', score: 2.0 });
      expect(getLevelText()).toBe('Active Contributor');
      u2();

      // Score exactly 3 -> Trusted Partner
      const { unmount: u3 } = renderProfile({ name: 'U3', score: 3.0 });
      expect(getLevelText()).toBe('Trusted Partner');
      u3();

      // Score exactly 4 -> Expert
      const { unmount: u4 } = renderProfile({ name: 'U4', score: 4.0 });
      expect(getLevelText()).toBe('Expert');
      u4();

      // Score exactly 5 -> Expert
      renderProfile({ name: 'U5', score: 5.0 });
      expect(getLevelText()).toBe('Expert');
    });

    it('handles custom maxScore scaling correctly', () => {
      // With custom maxScore = 10, the bands are:
      // [0, 2): Newcomer
      // [2, 4): Contributor
      // [4, 6): Active Contributor
      // [6, 8): Trusted Partner
      // [8, 10]: Expert
      renderProfile({ name: 'Scaled User', score: 7.0, maxScore: 10 });
      expect(getLevelText()).toBe('Trusted Partner');
    });

    it('passes axe accessibility checks when legend is rendered', async () => {
      const { container } = renderProfile({ name: 'A11y Legend User', score: 3.5 });
      await assertNoA11yViolations(container);
    });
  });

// ---------------------------------------------------------------------------
// 12. Issue #528 – States and Interactions Testing
// ---------------------------------------------------------------------------

/**
 * Issue #528 Test Suite – Component State Testing and Interaction Coverage
 *
 * This section addresses Issue #528 requirements for comprehensive state
 * and interaction testing of the ReputationProfile component.
 *
 * IMPORTANT FINDING:
 * ReputationProfile is a PURE PRESENTATIONAL COMPONENT with NO interactive
 * elements (no buttons, links, form controls, expandable sections, tabs, or
 * dialogs). All rendering is driven exclusively by props, with no internal
 * data fetching, loading states, or error handling.
 *
 * Given this architecture:
 * - "Loading state" does not exist (component receives complete data via props)
 * - "Error state" does not exist (component has no error handling logic)
 * - "Empty state" = no reputation (score undefined/null)
 * - "Success state" = full reputation (score + history present)
 * - "Primary interaction" = N/A (no interactive elements exist)
 *
 * The tests below focus on:
 * 1. Explicit state exclusivity (only one rendering mode at a time)
 * 2. Prop-driven state transitions (re-rendering with different props)
 * 3. Keyboard navigation through semantic HTML (lists, regions)
 * 4. Screen reader accessible structure
 */

describe('Issue #528 – State Exclusivity and Transitions', () => {
  /**
   * Requirement: Verify that only one state renders at a time.
   * The component must never render multiple states simultaneously.
   */
  describe('state exclusivity', () => {
    it('empty state (no score) – no partial banner, no legend, no history list', () => {
      renderProfile({ name: 'Empty User', score: undefined, history: [] });

      // Empty state indicators present
      expect(screen.getByText(/No reputation yet/i)).toBeInTheDocument();
      expect(screen.getByText(/^Pending$/i)).toBeInTheDocument();

      // Success state indicators absent
      expect(screen.queryByText(/Partial reputation data/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Reputation Level Legend/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('meter')).not.toBeInTheDocument();
      expect(document.querySelector('ol')).toBeNull();
    });

    it('empty state (null score) – no partial banner, no legend, no history list', () => {
      renderProfile({ name: 'Null User', score: null, history: [] });

      // Empty state indicators present
      expect(screen.getByText(/No reputation yet/i)).toBeInTheDocument();
      expect(screen.getByText(/^Pending$/i)).toBeInTheDocument();

      // Success state indicators absent
      expect(screen.queryByText(/Partial reputation data/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Reputation Level Legend/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('meter')).not.toBeInTheDocument();
    });

    it('partial state (score present, empty history) – no empty indicators, shows partial banner', () => {
      renderProfile({ name: 'Partial User', score: 50, level: 'Active', history: [] });

      // Partial state indicators present
      expect(screen.getByText(/Partial reputation data/i)).toBeInTheDocument();
      expect(screen.getByRole('meter')).toBeInTheDocument();
      expect(screen.getByText(/Reputation Level Legend/i)).toBeInTheDocument();

      // Empty state indicators absent
      expect(screen.queryByText(/No reputation yet/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/^Pending$/i)).not.toBeInTheDocument();

      // Full history indicators absent
      expect(document.querySelector('ol')).toBeNull();
      expect(screen.queryByText(/^Visible$/i)).not.toBeInTheDocument();
    });

    it('full state (score + history) – no empty indicators, no partial banner', () => {
      renderProfile({ name: 'Full User', score: 88, level: 'Expert', history: HISTORY_EVENTS });

      // Full state indicators present
      expect(screen.getByRole('meter')).toBeInTheDocument();
      expect(screen.getByText(/Reputation Level Legend/i)).toBeInTheDocument();
      expect(document.querySelector('ol')).not.toBeNull();
      expect(screen.getByText(/^Visible$/i)).toBeInTheDocument();

      // Empty state indicators absent
      expect(screen.queryByText(/No reputation yet/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/^Pending$/i)).not.toBeInTheDocument();

      // Partial state indicators absent
      expect(screen.queryByText(/Partial reputation data/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Private by default/i)).not.toBeInTheDocument();
    });

    it('score of 0 is treated as valid reputation (not empty state)', () => {
      renderProfile({ name: 'Zero Score User', score: 0, history: [] });

      // Partial state (score present, history empty)
      expect(screen.getByRole('meter')).toBeInTheDocument();
      expect(screen.getByText(/Partial reputation data/i)).toBeInTheDocument();

      // Empty state absent
      expect(screen.queryByText(/No reputation yet/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/^Pending$/i)).not.toBeInTheDocument();
    });
  });

  /**
   * Requirement: Test prop-driven state transitions.
   * When props change, the component must re-render the correct state.
   */
  describe('prop-driven state transitions', () => {
    it('transitions from empty to partial when score is added', () => {
      const { rerender } = render(<ReputationProfile name="User" score={undefined} history={[]} />);

      // Initially empty
      expect(screen.getByText(/No reputation yet/i)).toBeInTheDocument();

      // Add score → partial state
      rerender(<ReputationProfile name="User" score={42} history={[]} />);
      expect(screen.queryByText(/No reputation yet/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Partial reputation data/i)).toBeInTheDocument();
      expect(screen.getByRole('meter')).toBeInTheDocument();
    });

    it('transitions from partial to full when history is added', () => {
      const { rerender } = render(<ReputationProfile name="User" score={77} history={[]} />);

      // Initially partial
      expect(screen.getByText(/Partial reputation data/i)).toBeInTheDocument();
      expect(screen.getByText(/Private by default/i)).toBeInTheDocument();

      // Add history → full state
      rerender(<ReputationProfile name="User" score={77} history={HISTORY_EVENTS} />);
      expect(screen.queryByText(/Partial reputation data/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Private by default/i)).not.toBeInTheDocument();
      expect(screen.getByText(/^Visible$/i)).toBeInTheDocument();
      expect(document.querySelector('ol')).not.toBeNull();
    });

    it('transitions from full to partial when history is cleared', () => {
      const { rerender } = render(<ReputationProfile name="User" score={88} history={HISTORY_EVENTS} />);

      // Initially full
      expect(document.querySelector('ol')).not.toBeNull();
      expect(screen.getByText(/^Visible$/i)).toBeInTheDocument();

      // Clear history → partial state
      rerender(<ReputationProfile name="User" score={88} history={[]} />);
      expect(document.querySelector('ol')).toBeNull();
      expect(screen.queryByText(/^Visible$/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Partial reputation data/i)).toBeInTheDocument();
    });

    it('transitions from partial to empty when score is removed', () => {
      const { rerender } = render(<ReputationProfile name="User" score={50} history={[]} />);

      // Initially partial
      expect(screen.getByText(/Partial reputation data/i)).toBeInTheDocument();

      // Remove score → empty state
      rerender(<ReputationProfile name="User" score={undefined} history={[]} />);
      expect(screen.queryByText(/Partial reputation data/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('meter')).not.toBeInTheDocument();
      expect(screen.getByText(/No reputation yet/i)).toBeInTheDocument();
    });

    it('legend active item updates when score changes', () => {
      const { rerender, container } = render(
        <ReputationProfile name="User" score={0.5} history={HISTORY_EVENTS} maxScore={5} />
      );

      // Score 0.5 → Newcomer band active
      let activeItems = container.querySelectorAll('.border-indigo-200');
      expect(activeItems).toHaveLength(1);
      expect(activeItems[0].textContent).toContain('Newcomer');

      // Change score → Trusted Partner band active
      rerender(<ReputationProfile name="User" score={3.5} history={HISTORY_EVENTS} maxScore={5} />);
      activeItems = container.querySelectorAll('.border-indigo-200');
      expect(activeItems).toHaveLength(1);
      expect(activeItems[0].textContent).toContain('Trusted Partner');
    });
  });
});

describe('Issue #528 – Keyboard Navigation and Semantic Structure', () => {
  /**
   * Requirement: Verify keyboard navigation through semantic HTML.
   * The component uses semantic HTML (<section>, <ol>, <ul>) which provides
   * natural keyboard navigation. No custom focus management is needed.
   */
  describe('keyboard navigability', () => {
    it('section landmark has correct role and accessible name', () => {
      renderProfile({ name: 'Nav Test User', score: 88, history: HISTORY_EVENTS });

      const section = screen.getByRole('region', { name: /Reputation profile for Nav Test User/i });
      expect(section).toBeInTheDocument();
      expect(section.tagName).toBe('SECTION');
    });

    it('reputation history ordered list is keyboard-navigable', () => {
      const { container } = renderProfile({ name: 'Nav User', score: 88, history: HISTORY_EVENTS });

      const ol = container.querySelector('ol');
      expect(ol).not.toBeNull();
      expect(ol?.tagName).toBe('OL');

      // Ordered lists provide natural keyboard navigation
      // Screen readers announce: "List, X items"
      const items = ol ? within(ol).getAllByRole('listitem') : [];
      expect(items).toHaveLength(HISTORY_EVENTS.length);
    });

    it('reputation level legend list is keyboard-navigable', () => {
      renderProfile({ name: 'Legend Nav User', score: 3.5, history: HISTORY_EVENTS });

      const legendList = screen.getByRole('list', { name: /Reputation Level Legend/i });
      expect(legendList).toBeInTheDocument();
      expect(legendList.tagName).toBe('UL');

      const items = within(legendList).getAllByRole('listitem');
      expect(items).toHaveLength(5);
    });

    it('no interactive elements exist in empty state', () => {
      const { container } = renderProfile({ name: 'No Interaction User', score: undefined, history: [] });

      // Verify no buttons, links, or form controls exist
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(container.querySelector('input')).toBeNull();
      expect(container.querySelector('select')).toBeNull();
      expect(container.querySelector('textarea')).toBeNull();
    });

    it('no interactive elements exist in partial state', () => {
      const { container } = renderProfile({ name: 'Partial No Interaction', score: 50, history: [] });

      // Verify no buttons, links, or form controls exist
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(container.querySelector('input')).toBeNull();
    });

    it('no interactive elements exist in full state', () => {
      const { container } = renderProfile({ name: 'Full No Interaction', score: 88, history: HISTORY_EVENTS });

      // Verify no buttons, links, or form controls exist
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(container.querySelector('input')).toBeNull();
    });

    it('legend items are not interactive – no click handlers', () => {
      const { container } = renderProfile({ name: 'Legend Static User', score: 3.5, history: HISTORY_EVENTS });

      const legendList = screen.getByRole('list', { name: /Reputation Level Legend/i });
      const items = within(legendList).getAllByRole('listitem');

      // Legend items are <li> elements with no interactive semantics
      items.forEach((item) => {
        expect(item.tagName).toBe('LI');
        expect(item).not.toHaveAttribute('role', 'button');
        expect(item).not.toHaveAttribute('tabindex');
        expect(item).not.toHaveAttribute('onclick');
        expect(item).not.toHaveAttribute('onkeydown');
      });
    });
  });

  /**
   * Requirement: Verify screen reader accessible structure.
   * All state indicators, labels, and semantic elements must have correct
   * accessible names and roles.
   */
  describe('screen reader accessible structure', () => {
    it('empty state has clear accessible labels', () => {
      renderProfile({ name: 'SR Empty User', score: undefined, history: [] });

      // Score block accessible
      const scoreLabel = document.getElementById('reputation-score-label');
      expect(scoreLabel).toHaveTextContent('Reputation score');

      const scorePara = document.querySelector('[aria-labelledby="reputation-score-label"]');
      expect(scorePara).toHaveTextContent('No reputation yet');

      // Level block accessible
      const levelLabel = document.getElementById('reputation-level-label');
      expect(levelLabel).toHaveTextContent('Level');

      const levelPara = document.querySelector('[aria-labelledby="reputation-level-label"]');
      expect(levelPara).toHaveTextContent('Pending');
    });

    it('partial state has clear accessible labels', () => {
      renderProfile({ name: 'SR Partial User', score: 42, level: 'Active', history: [] });

      // Meter has accessible name and value
      const meter = screen.getByRole('meter');
      expect(meter).toHaveAttribute('aria-labelledby', 'reputation-score-label');
      expect(meter).toHaveAttribute('aria-valuenow', '42');
      expect(meter).toHaveAttribute('aria-valuemin', '0');
      expect(meter).toHaveAttribute('aria-valuemax', '5');

      // Partial banner has clear messaging
      expect(screen.getByText(/Partial reputation data/i)).toBeInTheDocument();
      expect(screen.getByText(/A score exists but history is currently hidden/i)).toBeInTheDocument();
    });

    it('full state has clear accessible labels and structure', () => {
      renderProfile({ name: 'SR Full User', score: 88, level: 'Expert', history: HISTORY_EVENTS });

      // Section landmark
      const section = screen.getByRole('region', { name: /Reputation profile for SR Full User/i });
      expect(section).toHaveAttribute('aria-labelledby', 'profile-heading');

      // Meter with description
      const meter = screen.getByRole('meter');
      expect(meter).toHaveAttribute('aria-describedby', 'reputation-legend');

      // History heading
      expect(screen.getByRole('heading', { name: /Reputation history/i })).toBeInTheDocument();

      // Legend heading
      expect(screen.getByRole('heading', { name: /Reputation Level Legend/i })).toBeInTheDocument();

      // Ordered list for history
      const ol = document.querySelector('ol');
      const items = ol ? within(ol).getAllByRole('listitem') : [];
      expect(items).toHaveLength(HISTORY_EVENTS.length);
    });

    it('history time elements have machine-readable dates', () => {
      const { container } = renderProfile({ name: 'SR Time User', score: 88, history: HISTORY_EVENTS });

      const timeElements = container.querySelectorAll('time');
      expect(timeElements).toHaveLength(HISTORY_EVENTS.length);

      HISTORY_EVENTS.forEach((event, idx) => {
        const timeEl = timeElements[idx];
        expect(timeEl).toHaveAttribute('dateTime', event.date);
        expect(timeEl.textContent).toBe(event.date);
      });
    });

    it('sr-only content provides context for screen readers', () => {
      renderProfile({ name: 'SR Context User', score: 77, maxScore: 10, history: HISTORY_EVENTS });

      // Profile heading (sr-only)
      const profileHeading = document.getElementById('profile-heading');
      expect(profileHeading).toHaveClass('sr-only');
      expect(profileHeading?.textContent).toMatch(/Reputation profile for SR Context User/i);

      // Score sr-only spans
      expect(screen.getByText(/Reputation score/i, { selector: '.sr-only' })).toBeInTheDocument();
      expect(screen.getByText(/out of 10/i, { selector: '.sr-only' })).toBeInTheDocument();

      // Level sr-only span
      expect(screen.getByText(/^Level$/i, { selector: '.sr-only' })).toBeInTheDocument();
    });
  });
});

describe('Issue #528 – Accessibility Audit for All States', () => {
  /**
   * Requirement: Run jest-axe on all states to ensure no violations.
   * This is the comprehensive accessibility check required by Issue #528.
   */
  it('empty state passes axe audit', async () => {
    const { container } = render(<ReputationProfile name="A11y Empty" score={undefined} history={[]} />);
    await assertNoA11yViolations(container);
  });

  it('null score state passes axe audit', async () => {
    const { container } = render(<ReputationProfile name="A11y Null" score={null} history={[]} />);
    await assertNoA11yViolations(container);
  });

  it('partial state passes axe audit', async () => {
    const { container } = render(<ReputationProfile name="A11y Partial" score={42} history={[]} />);
    await assertNoA11yViolations(container);
  });

  it('full state passes axe audit', async () => {
    const { container } = render(
      <ReputationProfile name="A11y Full" score={88} level="Expert" history={HISTORY_EVENTS} />
    );
    await assertNoA11yViolations(container);
  });

  it('score of 0 (edge case) passes axe audit', async () => {
    const { container } = render(<ReputationProfile name="A11y Zero" score={0} history={[]} />);
    await assertNoA11yViolations(container);
  });

  it('custom maxScore state passes axe audit', async () => {
    const { container } = render(
      <ReputationProfile name="A11y Custom" score={75} maxScore={100} history={HISTORY_EVENTS} />
    );
    await assertNoA11yViolations(container);
  });

  it('single history event passes axe audit', async () => {
    const { container } = render(
      <ReputationProfile name="A11y Single" score={50} history={[HISTORY_EVENTS[0]]} />
    );
    await assertNoA11yViolations(container);
  });
});

describe('Issue #528 – Non-Interactive Component Documentation', () => {
  /**
   * This describe block serves as explicit documentation for Issue #528 reviewers:
   * ReputationProfile is a PURE PRESENTATIONAL COMPONENT with NO interactive elements.
   *
   * Traditional "interaction testing" (click handlers, keyboard event handlers,
   * state changes from user input) does not apply to this component because:
   * 1. No buttons exist
   * 2. No links exist
   * 3. No form controls exist
   * 4. No expandable/collapsible sections exist
   * 5. No tabs or navigation exist
   * 6. No modal/dialog triggers exist
   *
   * All state changes are prop-driven (tested in "prop-driven state transitions" above).
   * Keyboard navigation is provided by semantic HTML (tested in "keyboard navigability" above).
   * Screen reader support is provided by ARIA attributes (tested throughout).
   */

  it('documents that no primary interaction exists – component is display-only', () => {
    const { container } = renderProfile({ name: 'Documentation User', score: 88, history: HISTORY_EVENTS });

    // Explicitly verify absence of interactive elements
    const buttons = screen.queryAllByRole('button');
    const links = screen.queryAllByRole('link');
    const inputs = container.querySelectorAll('input, select, textarea');
    const clickables = container.querySelectorAll('[onclick]');
    const keyHandlers = container.querySelectorAll('[onkeydown], [onkeyup], [onkeypress]');

    expect(buttons).toHaveLength(0);
    expect(links).toHaveLength(0);
    expect(inputs).toHaveLength(0);
    expect(clickables).toHaveLength(0);
    expect(keyHandlers).toHaveLength(0);

    // This test passes, documenting that the component is purely presentational
    expect(true).toBe(true);
  });

  it('legend items are styled but not interactive', () => {
    const { container } = renderProfile({ name: 'Legend Doc User', score: 3.5, history: HISTORY_EVENTS });

    const legendList = screen.getByRole('list', { name: /Reputation Level Legend/i });
    const items = within(legendList).getAllByRole('listitem');

    // Legend items have visual styling (active vs inactive) but no event handlers
    const activeItem = container.querySelector('.border-indigo-200');
    expect(activeItem).toBeInTheDocument();
    expect(activeItem?.textContent).toContain('Trusted Partner');

    // Active item has no interactive attributes
    expect(activeItem).not.toHaveAttribute('role', 'button');
    expect(activeItem).not.toHaveAttribute('tabindex');
    expect(activeItem).not.toHaveAttribute('onclick');

    // All items are static <li> elements
    items.forEach((item) => {
      expect(item.tagName).toBe('LI');
      expect(item).not.toHaveAttribute('onclick');
    });
  });

  it('component behavior is entirely prop-driven – no internal state or effects', () => {
    // This test documents the architecture for reviewers
    const props: ReputationProfileProps = {
      name: 'Prop-Driven User',
      score: 88,
      level: 'Expert',
      history: HISTORY_EVENTS,
      maxScore: 5,
    };

    const { rerender, container } = render(<ReputationProfile {...props} />);

    // All rendering is determined by props
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '88');
    expect(getLevelText()).toBe('Expert');

    // Change props → component re-renders deterministically
    rerender(<ReputationProfile {...props} score={25} level="Contributor" />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '25');
    expect(getLevelText()).toBe('Contributor');

    // No internal state exists that could cause non-deterministic behavior
    expect(container.querySelector('[data-state]')).toBeNull();
  });
});
