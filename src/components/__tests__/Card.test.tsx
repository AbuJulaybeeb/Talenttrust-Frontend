import React from 'react';
import { render, screen } from '@testing-library/react';
import Card from '../Card';
import MilestonesList from '../MilestonesList';

jest.mock('@/lib/preferences', () => ({
  usePreferences: () => ({
    formatAmount: (value: number, currency: string) => `${currency} ${value}`,
  }),
}));

describe('Card', () => {
  it('renders children correctly', () => {
    render(<Card>Body content</Card>);

    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('renders with a header', () => {
    render(
      <Card header={<h2>Card title</h2>}>
        Body content
      </Card>,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Card title' })).toBeInTheDocument();
  });

  it('renders with a footer', () => {
    render(<Card footer={<p>Footer content</p>}>Body content</Card>);

    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('renders children only when header and footer are omitted', () => {
    render(<Card>Body content</Card>);

    expect(screen.getByText('Body content')).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('preserves heading semantics at adopted card call sites', () => {
    render(
      <MilestonesList
        milestones={[
          {
            id: '1',
            title: 'Design review',
            status: 'Pending',
            payout: 500,
            currency: 'USD',
            dueDate: '2026-01-10',
          },
        ]}
      />,
    );

    expect(screen.getByRole('heading', { level: 2, name: /milestones/i })).toBeInTheDocument();
  });
});
