import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WalletSkeleton } from '../WalletSkeleton';
import { testA11y } from '@/test-utils/a11y';

describe('WalletSkeleton', () => {
  it('renders with appropriate ARIA attributes for loading state', () => {
    render(<WalletSkeleton />);

    const skeletonRegion = screen.getByRole('region', { name: 'Loading wallet' });
    expect(skeletonRegion).toBeInTheDocument();
    expect(skeletonRegion).toHaveAttribute('aria-busy', 'true');

    const liveRegion = screen.getByText('Loading wallet...');
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveAttribute('role', 'status');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveClass('sr-only');
  });

  it('marks visual placeholder elements with aria-hidden="true"', () => {
    const { container } = render(<WalletSkeleton />);

    const shimmerBlock = container.querySelector('div[aria-hidden="true"]');
    expect(shimmerBlock).toBeInTheDocument();
    expect(shimmerBlock).toHaveClass('animate-shimmer');
    expect(shimmerBlock).toHaveClass('motion-reduce:animate-none');
  });

  it('forwards custom className to root container', () => {
    render(<WalletSkeleton className="custom-test-class" />);

    const skeletonRegion = screen.getByRole('region', { name: 'Loading wallet' });
    expect(skeletonRegion).toHaveClass('custom-test-class');
  });

  it('passes accessibility audits without violations', async () => {
    await testA11y(<WalletSkeleton />);
  });
});
