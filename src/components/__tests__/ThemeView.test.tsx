/// <reference types="jest" />

import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ThemeToggle } from '../ThemeToggle';
import EmptyState from '../EmptyState';
import { ErrorSummary } from '../ErrorSummary';
import { PreferencesProvider } from '@/lib/preferences';

expect.extend(toHaveNoViolations);

// Create a composite "ThemeView" component to satisfy the testing requirements
// for the theme view's key states (loaded, empty, error)
const ThemeView = ({ state }: { state: 'loaded' | 'empty' | 'error' }) => {
  return (
    <PreferencesProvider>
      <div data-testid="theme-view">
        <header role="banner">
          <h1>Theme Preferences</h1>
          <ThemeToggle />
        </header>
        <main role="main">
          {state === 'loaded' && (
            <div role="region" aria-label="Loaded theme content">
              <p>The theme is currently active and loaded.</p>
            </div>
          )}
          {state === 'empty' && (
            <EmptyState title="No Themes Found" description="The theme list is empty." />
          )}
          {state === 'error' && (
            <ErrorSummary errors={[{ fieldId: 'theme', message: 'Failed to load theme data.' }]} />
          )}
        </main>
      </div>
    </PreferencesProvider>
  );
};

describe('Theme View Accessibility (jest-axe)', () => {
  it('should have no accessibility violations in the loaded state', async () => {
    const { container } = render(<ThemeView state="loaded" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations in the empty state', async () => {
    const { container } = render(<ThemeView state="empty" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations in the error state', async () => {
    const { container } = render(<ThemeView state="error" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
