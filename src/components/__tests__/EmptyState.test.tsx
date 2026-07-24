import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from '../EmptyState';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function renderEmptyState(props: Partial<React.ComponentProps<typeof EmptyState>> = {}) {
  return render(
    <EmptyState
      title="Default Title"
      description="Default description text."
      {...props}
    />,
  );
}

// ---------------------------------------------------------------------------
// Core rendering
// ---------------------------------------------------------------------------
describe('EmptyState – core rendering', () => {
  it('renders the title', () => {
    renderEmptyState({ title: 'No contracts found' });
    expect(screen.getByText('No contracts found')).toBeInTheDocument();
  });

  it('renders the description', () => {
    renderEmptyState({ description: 'Create your first contract to get started.' });
    expect(screen.getByText('Create your first contract to get started.')).toBeInTheDocument();
  });

  it('renders title in an h2 element', () => {
    renderEmptyState({ title: 'No milestones yet' });
    const heading = screen.getByRole('heading', { level: 2, name: 'No milestones yet' });
    expect(heading).toBeInTheDocument();
  });

  it('renders without any icon or illustration when neither is provided', () => {
    const { container } = renderEmptyState();
    // No decorative wrapper should be present (the aria-hidden div for the image area)
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------
describe('EmptyState – accessibility', () => {
  it('wraps content in a landmark region', () => {
    renderEmptyState({ title: 'No reputation yet' });
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('region has an accessible name matching the title', () => {
    renderEmptyState({ title: 'No reputation yet' });
    expect(screen.getByRole('region')).toHaveAccessibleName('No reputation yet');
  });

  it('title element carries an id that aria-labelledby references', () => {
    renderEmptyState({ title: 'Accessible title' });
    const heading = screen.getByRole('heading', { name: 'Accessible title' });
    const region = screen.getByRole('region');
    const headingId = heading.getAttribute('id');
    expect(headingId).toBeTruthy();
    expect(region).toHaveAttribute('aria-labelledby', headingId);
  });

  it('icon wrapper is hidden from assistive technology', () => {
    const icon = <span data-testid="custom-icon">★</span>;
    renderEmptyState({ icon });
    const iconWrapper = screen.getByTestId('custom-icon').parentElement;
    expect(iconWrapper).toHaveAttribute('aria-hidden', 'true');
  });

  it('illustration wrapper is hidden from assistive technology', () => {
    renderEmptyState({ illustration: 'contracts' });
    const region = screen.getByRole('region');
    const illustrationWrapper = region.querySelector('[aria-hidden="true"]');
    expect(illustrationWrapper).toBeInTheDocument();
  });

  it('action button is keyboard focusable (no tabIndex=-1)', () => {
    renderEmptyState({ actionLabel: 'Create Contract', onAction: jest.fn() });
    const button = screen.getByRole('button', { name: 'Create Contract' });
    expect(button).not.toHaveAttribute('tabindex', '-1');
  });

  it('secondary action button is keyboard focusable', () => {
    renderEmptyState({
      actionLabel: 'Create Contract',
      onAction: jest.fn(),
      secondaryActionLabel: 'Learn More',
      onSecondaryAction: jest.fn(),
    });
    const secondary = screen.getByRole('button', { name: 'Learn More' });
    expect(secondary).not.toHaveAttribute('tabindex', '-1');
  });

  it('action button has focus-visible outline class for keyboard navigation', () => {
    renderEmptyState({ actionLabel: 'Add Milestone', onAction: jest.fn() });
    const button = screen.getByRole('button', { name: 'Add Milestone' });
    expect(button).toHaveClass('focus-visible:outline');
  });

  it('secondary action button has focus-visible outline class', () => {
    renderEmptyState({
      actionLabel: 'Create Contract',
      onAction: jest.fn(),
      secondaryActionLabel: 'Learn More',
      onSecondaryAction: jest.fn(),
    });
    const secondary = screen.getByRole('button', { name: 'Learn More' });
    expect(secondary).toHaveClass('focus-visible:outline');
  });

  it('button accessible name comes from visible text, not a separate aria-label', () => {
    renderEmptyState({ actionLabel: 'Create Contract', onAction: jest.fn() });
    const button = screen.getByRole('button', { name: 'Create Contract' });
    // aria-label would override the visible text — assert it is absent so the
    // accessible name is derived from the button's text content.
    expect(button).not.toHaveAttribute('aria-label');
  });
});

// ---------------------------------------------------------------------------
// Icon and illustration props
// ---------------------------------------------------------------------------
describe('EmptyState – icon & illustration', () => {
  it('renders a custom icon node when provided', () => {
    const icon = <span data-testid="test-icon">📄</span>;
    renderEmptyState({ icon });
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders the contracts illustration variant with correct colour classes', () => {
    renderEmptyState({ illustration: 'contracts' });
    const wrapper = screen.getByRole('region').querySelector('[aria-hidden="true"]');
    expect(wrapper).toHaveClass('bg-blue-50');
    expect(wrapper).toHaveClass('text-blue-700');
  });

  it('renders the milestones illustration variant with correct colour classes', () => {
    renderEmptyState({ illustration: 'milestones' });
    const wrapper = screen.getByRole('region').querySelector('[aria-hidden="true"]');
    expect(wrapper).toHaveClass('bg-emerald-50');
    expect(wrapper).toHaveClass('text-emerald-700');
  });

  it('renders the reputation illustration variant with correct colour classes', () => {
    renderEmptyState({ illustration: 'reputation' });
    const wrapper = screen.getByRole('region').querySelector('[aria-hidden="true"]');
    expect(wrapper).toHaveClass('bg-amber-50');
    expect(wrapper).toHaveClass('text-amber-700');
  });

  it('prefers custom icon over illustration when both are supplied', () => {
    const icon = <span data-testid="custom-icon">★</span>;
    renderEmptyState({ icon, illustration: 'contracts' });
    // Custom icon should be present; illustration SVG should be replaced by the icon
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    // The icon wrapper should not carry the blue illustration colour class since
    // the illustration prop only styles the wrapper when no custom icon is supplied.
    // Verify the custom icon renders inside the icon container.
    const iconWrapper = screen.getByTestId('custom-icon').parentElement;
    expect(iconWrapper).toHaveAttribute('aria-hidden', 'true');
  });

  it('falls back to neutral styles when icon is provided without illustration', () => {
    const icon = <span data-testid="custom-icon">📄</span>;
    renderEmptyState({ icon });
    const wrapper = screen.getByTestId('custom-icon').parentElement;
    expect(wrapper).toHaveClass('bg-slate-50');
    expect(wrapper).toHaveClass('text-slate-500');
  });
});

// ---------------------------------------------------------------------------
// Action button behaviour
// ---------------------------------------------------------------------------
describe('EmptyState – primary action', () => {
  it('renders an action button when actionLabel and onAction are provided', () => {
    const onAction = jest.fn();
    renderEmptyState({ actionLabel: 'Create Contract', onAction });
    expect(screen.getByRole('button', { name: 'Create Contract' })).toBeInTheDocument();
  });

  it('calls onAction when the action button is clicked', () => {
    const onAction = jest.fn();
    renderEmptyState({ actionLabel: 'Create Contract', onAction });
    fireEvent.click(screen.getByRole('button', { name: 'Create Contract' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('does not render action button when actionLabel is missing', () => {
    renderEmptyState({ onAction: jest.fn() });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not render action button when onAction handler is missing', () => {
    renderEmptyState({ actionLabel: 'Create Contract' });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not render any button when neither actionLabel nor onAction is provided', () => {
    renderEmptyState();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('primary button has type="button" to prevent accidental form submission', () => {
    renderEmptyState({ actionLabel: 'Add Milestone', onAction: jest.fn() });
    expect(screen.getByRole('button', { name: 'Add Milestone' })).toHaveAttribute('type', 'button');
  });
});

// ---------------------------------------------------------------------------
// Secondary action button behaviour
// ---------------------------------------------------------------------------
describe('EmptyState – secondary action', () => {
  it('renders a secondary action button when both secondaryActionLabel and onSecondaryAction are provided', () => {
    renderEmptyState({
      actionLabel: 'Create Contract',
      onAction: jest.fn(),
      secondaryActionLabel: 'Learn More',
      onSecondaryAction: jest.fn(),
    });
    expect(screen.getByRole('button', { name: 'Learn More' })).toBeInTheDocument();
  });

  it('calls onSecondaryAction when secondary button is clicked', () => {
    const onSecondaryAction = jest.fn();
    renderEmptyState({
      actionLabel: 'Create Contract',
      onAction: jest.fn(),
      secondaryActionLabel: 'Learn More',
      onSecondaryAction,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Learn More' }));
    expect(onSecondaryAction).toHaveBeenCalledTimes(1);
  });

  it('does not render secondary button when secondaryActionLabel is missing', () => {
    renderEmptyState({
      actionLabel: 'Create Contract',
      onAction: jest.fn(),
      onSecondaryAction: jest.fn(),
    });
    // Only primary button should be present
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('does not render secondary button when onSecondaryAction handler is missing', () => {
    renderEmptyState({
      actionLabel: 'Create Contract',
      onAction: jest.fn(),
      secondaryActionLabel: 'Learn More',
    });
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.queryByRole('button', { name: 'Learn More' })).not.toBeInTheDocument();
  });

  it('can render secondary button without a primary action', () => {
    renderEmptyState({
      secondaryActionLabel: 'Learn More',
      onSecondaryAction: jest.fn(),
    });
    expect(screen.getByRole('button', { name: 'Learn More' })).toBeInTheDocument();
  });

  it('secondary button has type="button"', () => {
    renderEmptyState({
      actionLabel: 'Create Contract',
      onAction: jest.fn(),
      secondaryActionLabel: 'Learn More',
      onSecondaryAction: jest.fn(),
    });
    expect(screen.getByRole('button', { name: 'Learn More' })).toHaveAttribute('type', 'button');
  });

  it('secondary button has a distinct border style from the primary button', () => {
    renderEmptyState({
      actionLabel: 'Create Contract',
      onAction: jest.fn(),
      secondaryActionLabel: 'Learn More',
      onSecondaryAction: jest.fn(),
    });
    const secondary = screen.getByRole('button', { name: 'Learn More' });
    expect(secondary).toHaveClass('border');
  });
});

// ---------------------------------------------------------------------------
// Long-text / edge-case rendering
// ---------------------------------------------------------------------------
describe('EmptyState – edge cases', () => {
  it('renders a very long title without crashing', () => {
    const longTitle = 'A'.repeat(300);
    renderEmptyState({ title: longTitle });
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(longTitle);
  });

  it('renders a very long description without crashing', () => {
    const longDescription = 'B'.repeat(500);
    renderEmptyState({ description: longDescription });
    expect(screen.getByText(longDescription)).toBeInTheDocument();
  });

  it('title element has max-width class to constrain long text', () => {
    renderEmptyState({ title: 'Long title that should wrap within its container' });
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveClass('max-w-xl');
  });

  it('description element has max-width class to constrain long text', () => {
    renderEmptyState({ description: 'This is a long description used to verify wrapping behaviour.' });
    // The description is a <p> — check text content then class
    const desc = screen.getByText('This is a long description used to verify wrapping behaviour.');
    expect(desc).toHaveClass('max-w-md');
  });

  it('renders correctly with an empty-string description (no crash)', () => {
    expect(() => renderEmptyState({ description: '' })).not.toThrow();
  });

  it('handles multiple rapid clicks on the action without errors', () => {
    const onAction = jest.fn();
    renderEmptyState({ actionLabel: 'Create Contract', onAction });
    const button = screen.getByRole('button', { name: 'Create Contract' });
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledTimes(3);
  });
});

// ---------------------------------------------------------------------------
// Real-world usage snapshots (contracts, milestones, reputation pages)
// ---------------------------------------------------------------------------
describe('EmptyState – page adoption scenarios', () => {
  it('renders the contracts empty state as used on the contracts page', () => {
    const onAction = jest.fn();
    render(
      <EmptyState
        illustration="contracts"
        title="No contracts found"
        description="You haven't created any contracts yet. Start by creating your first contract to begin freelancing securely."
        actionLabel="Create Contract"
        onAction={onAction}
      />,
    );
    expect(screen.getByRole('heading', { name: 'No contracts found' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Contract' })).toBeInTheDocument();
  });

  it('renders the milestones empty state (no milestones at all)', () => {
    const onAction = jest.fn();
    render(
      <EmptyState
        illustration="milestones"
        title="No milestones tracked"
        description="Track your progress by adding milestones to your contracts. Milestones help you stay organized and ensure timely delivery."
        actionLabel="Add Milestone"
        onAction={onAction}
      />,
    );
    expect(screen.getByRole('heading', { name: 'No milestones tracked' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Milestone' })).toBeInTheDocument();
  });

  it('renders the milestones filter empty state (filter returns no results)', () => {
    const onAction = jest.fn();
    render(
      <EmptyState
        illustration="milestones"
        title="No milestones match this filter"
        description="There are no pending milestones at the moment. Try a different filter or add a new milestone."
        actionLabel="Add Milestone"
        onAction={onAction}
      />,
    );
    expect(screen.getByRole('heading', { name: 'No milestones match this filter' })).toBeInTheDocument();
  });

  it('renders the reputation empty state without an action button', () => {
    render(
      <EmptyState
        illustration="reputation"
        title="No reputation yet"
        description="Your reputation will be built as you complete contracts and receive feedback from clients. Start by creating and fulfilling your first contract."
      />,
    );
    expect(screen.getByRole('heading', { name: 'No reputation yet' })).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('reputation page adoption: region is accessible without an action', () => {
    render(
      <EmptyState
        illustration="reputation"
        title="No reputation yet"
        description="Your reputation will be built as you complete contracts."
      />,
    );
    expect(screen.getByRole('region')).toHaveAccessibleName('No reputation yet');
  });
});
