import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import SettingsPanel from '../SettingsPanel';
import EmptyState from '../EmptyState';
import { ErrorSummary } from '../ErrorSummary';
import { PreferencesProvider } from '@/lib/preferences';

expect.extend(toHaveNoViolations);

type SettingsViewState = 'loaded' | 'empty' | 'error';

interface SettingsViewProps {
  state: SettingsViewState;
}

/**
 * Renders the settings view shell for each user-visible data state while
 * keeping the accessibility assertions deterministic and independent of
 * routing or network requests.
 */
function SettingsView({ state }: SettingsViewProps) {
  return (
    <PreferencesProvider>
      <div data-testid="settings-view">
        <header role="banner">
          <h1>Settings</h1>
        </header>
        <main role="main" aria-labelledby="settings-heading">
          <h2 id="settings-heading" className="sr-only">
            Settings preferences
          </h2>
          {state === 'loaded' && <SettingsPanel />}
          {state === 'empty' && (
            <EmptyState
              title="No settings found"
              description="There are no settings available to display."
            />
          )}
          {state === 'error' && (
            <ErrorSummary
              errors={[
                {
                  fieldId: 'settings',
                  message: 'Settings could not be loaded.',
                },
              ]}
            />
          )}
        </main>
      </div>
    </PreferencesProvider>
  );
}

async function expectNoAccessibilityViolations(state: SettingsViewState) {
  const { container } = render(<SettingsView state={state} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
}

describe('Settings view accessibility', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('has no accessibility violations in the loaded state', async () => {
    await expectNoAccessibilityViolations('loaded');
  });

  it('has no accessibility violations in the empty state', async () => {
    await expectNoAccessibilityViolations('empty');
  });

  it('has no accessibility violations in the error state', async () => {
    await expectNoAccessibilityViolations('error');
  });
});
