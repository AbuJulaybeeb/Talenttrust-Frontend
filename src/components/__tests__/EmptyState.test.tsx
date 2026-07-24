import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from '../EmptyState';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        title="Test Title"
        description="Test Description"
      />
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    const icon = <span data-testid="test-icon">Icon</span>;
    render(
      <EmptyState
        icon={icon}
        title="Test Title"
        description="Test Description"
      />
    );

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByTestId('test-icon').parentElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not render icon when not provided', () => {
    render(
      <EmptyState
        title="Test Title"
        description="Test Description"
      />
    );

    expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
  });

  it('renders action button when actionLabel and onAction are provided', () => {
    const mockOnAction = jest.fn();
    render(
      <EmptyState
        title="Test Title"
        description="Test Description"
        actionLabel="Test Action"
        onAction={mockOnAction}
      />
    );

    const button = screen.getByRole('button', { name: 'Test Action' });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(mockOnAction).toHaveBeenCalledTimes(1);
  });

  it('renders secondary action as a keyboard reachable subordinate button', () => {
    const mockOnAction = jest.fn();
    const mockOnSecondaryAction = jest.fn();

    render(
      <EmptyState
        title="No contracts found"
        description="Create a contract or learn how escrow protects both parties."
        actionLabel="Create Contract"
        onAction={mockOnAction}
        secondaryActionLabel="Learn More"
        onSecondaryAction={mockOnSecondaryAction}
      />
    );

    const primaryButton = screen.getByRole('button', { name: 'Create Contract' });
    const secondaryButton = screen.getByRole('button', { name: 'Learn More' });

    expect(primaryButton).not.toHaveAttribute('tabindex', '-1');
    expect(secondaryButton).not.toHaveAttribute('tabindex', '-1');
    expect(primaryButton).toHaveClass('focus-visible:outline');
    expect(secondaryButton).toHaveClass('focus-visible:outline');
    expect(secondaryButton).toHaveClass('border');

    fireEvent.click(primaryButton);
    fireEvent.click(secondaryButton);

    expect(mockOnAction).toHaveBeenCalledTimes(1);
    expect(mockOnSecondaryAction).toHaveBeenCalledTimes(1);
  });

  it('does not render secondary action when label or handler is missing', () => {
    const { rerender } = render(
      <EmptyState
        title="Test Title"
        description="Test Description"
        secondaryActionLabel="Learn More"
      />
    );

    expect(screen.queryByRole('button', { name: 'Learn More' })).not.toBeInTheDocument();

    rerender(
      <EmptyState
        title="Test Title"
        description="Test Description"
        onSecondaryAction={jest.fn()}
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders named illustration variants as decorative content', () => {
    const { rerender } = render(
      <EmptyState
        illustration="contracts"
        title="No contracts found"
        description="Start by creating your first contract."
      />
    );

    let illustration = screen.getByRole('region').querySelector('[aria-hidden="true"]');
    expect(illustration).toBeInTheDocument();
    expect(illustration).toHaveClass('bg-blue-50');

    rerender(
      <EmptyState
        illustration="milestones"
        title="No milestones tracked"
        description="Add milestones to track delivery."
      />
    );

    illustration = screen.getByRole('region').querySelector('[aria-hidden="true"]');
    expect(illustration).toHaveClass('bg-emerald-50');

    rerender(
      <EmptyState
        illustration="reputation"
        title="No reputation yet"
        description="Complete contracts to build reputation."
      />
    );

    illustration = screen.getByRole('region').querySelector('[aria-hidden="true"]');
    expect(illustration).toHaveClass('bg-amber-50');
  });

  it('does not render action button when actionLabel or onAction is missing', () => {
    render(
      <EmptyState
        title="Test Title"
        description="Test Description"
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(
      <EmptyState
        title="Test Title"
        description="Test Description"
      />
    );

    const region = screen.getByRole('region');
    expect(region).toBeInTheDocument();
    expect(region).toHaveAccessibleName('Test Title');
    expect(screen.getByText('Test Title')).toHaveAttribute('id');
  });
});
