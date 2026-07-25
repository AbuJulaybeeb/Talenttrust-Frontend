import { render, screen } from '@testing-library/react';
import SettingsLoading from '../loading';

describe('SettingsLoading', () => {
  it('renders the settings skeleton through the route loading boundary', () => {
    render(<SettingsLoading />);

    expect(screen.getByTestId('settings-loading-skeleton')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Loading settings' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });
});
