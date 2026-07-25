import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import SettingsSkeleton from '../SettingsSkeleton';

describe('SettingsSkeleton', () => {
  it('renders a settings-shaped loading region', () => {
    render(<SettingsSkeleton />);

    expect(screen.getByRole('region', { name: 'Loading settings' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(screen.getByTestId('settings-loading-skeleton')).toBeInTheDocument();
  });

  it('hides the decorative skeleton from assistive technologies', () => {
    render(<SettingsSkeleton />);

    const skeleton = screen.getByTestId('settings-loading-skeleton');

    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    expect(skeleton.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('uses stable minimum dimensions to avoid layout shift', () => {
    render(<SettingsSkeleton />);

    const skeleton = screen.getByTestId('settings-loading-skeleton');
    expect(skeleton).toHaveClass('min-h-[640px]');
    expect(skeleton.querySelector('.min-h-\\[220px\\]')).toBeInTheDocument();
  });

  it('does not expose placeholder text as accessible content', () => {
    render(<SettingsSkeleton />);

    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<SettingsSkeleton />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
