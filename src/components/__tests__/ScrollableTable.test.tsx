import React from 'react';
import { render, screen } from '@testing-library/react';
import { testA11y } from '@/test-utils/a11y';
import ScrollableTable from '../ScrollableTable';

/** A sample wide table to test scrolling behavior. */
const WideTable = () => (
  <table>
    <caption className="sr-only">Sample wide data table</caption>
    <thead>
      <tr>
        <th>ID</th>
        <th>Contract</th>
        <th>Client</th>
        <th>Freelancer</th>
        <th>Value</th>
        <th>Status</th>
        <th>Created</th>
        <th>Milestones</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>Escrow Implementation</td>
        <td>GABC12...7890</td>
        <td>GXYZ98...3210</td>
        <td>$7,000.00</td>
        <td>Active</td>
        <td>Apr 20, 2026</td>
        <td>3</td>
      </tr>
      <tr>
        <td>2</td>
        <td>UI Redesign</td>
        <td>GDEF34...5678</td>
        <td>GPQR56...9012</td>
        <td>$12,500.00</td>
        <td>Completed</td>
        <td>Mar 15, 2026</td>
        <td>5</td>
      </tr>
    </tbody>
  </table>
);

const sampleLabel = 'Contracts table — scroll right to see all columns';

describe('ScrollableTable', () => {
  // ── Rendering ──────────────────────────────────────────────
  it('renders children inside the scroll region', () => {
    render(
      <ScrollableTable ariaLabel={sampleLabel}>
        <table>
          <tbody>
            <tr><td>Cell content</td></tr>
          </tbody>
        </table>
      </ScrollableTable>
    );

    expect(screen.getByText('Cell content')).toBeInTheDocument();
  });

  it('renders a <table> element when a table child is provided', () => {
    render(
      <ScrollableTable ariaLabel={sampleLabel}>
        <table data-testid="inner-table">
          <tbody>
            <tr><td>data</td></tr>
          </tbody>
        </table>
      </ScrollableTable>
    );

    expect(screen.getByTestId('inner-table')).toBeInTheDocument();
    expect(screen.getByText('data')).toBeInTheDocument();
  });

  // ── ARIA & accessibility attributes ────────────────────────
  it('has role="region" on the scroll container', () => {
    render(
      <ScrollableTable ariaLabel={sampleLabel}>
        <table><tbody><tr><td>x</td></tr></tbody></table>
      </ScrollableTable>
    );

    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('applies the aria-label to the scroll region', () => {
    render(
      <ScrollableTable ariaLabel={sampleLabel}>
        <table><tbody><tr><td>x</td></tr></tbody></table>
      </ScrollableTable>
    );

    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-label', sampleLabel);
  });

  it('is keyboard-reachable with tabIndex={0}', () => {
    render(
      <ScrollableTable ariaLabel={sampleLabel}>
        <table><tbody><tr><td>x</td></tr></tbody></table>
      </ScrollableTable>
    );

    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('tabindex', '0');
  });

  it('can receive keyboard focus via tabIndex={0}', () => {
    render(
      <ScrollableTable ariaLabel={sampleLabel}>
        <table><tbody><tr><td>x</td></tr></tbody></table>
      </ScrollableTable>
    );

    const region = screen.getByRole('region');
    // tabIndex={0} makes the element part of the natural tab order
    expect(region).toHaveAttribute('tabindex', '0');

    // Programmatically focus the element (simulates keyboard navigation)
    region.focus();
    // In jsdom, calling .focus() on a tabIndex=0 element sets activeElement
    expect(document.activeElement).toBe(region);
  });

  // ── Scroll behavior ────────────────────────────────────────
  it('has overflow-x-auto class for horizontal scrolling', () => {
    render(
      <ScrollableTable ariaLabel={sampleLabel}>
        <table><tbody><tr><td>x</td></tr></tbody></table>
      </ScrollableTable>
    );

    const region = screen.getByRole('region');
    expect(region.className).toContain('overflow-x-auto');
  });

  // ── Optional id prop ───────────────────────────────────────
  it('applies a custom id when provided', () => {
    render(
      <ScrollableTable ariaLabel={sampleLabel} id="custom-scroll">
        <table><tbody><tr><td>x</td></tr></tbody></table>
      </ScrollableTable>
    );

    expect(screen.getByRole('region')).toHaveAttribute('id', 'custom-scroll');
  });

  it('has no id attribute when id is not provided', () => {
    render(
      <ScrollableTable ariaLabel={sampleLabel}>
        <table><tbody><tr><td>x</td></tr></tbody></table>
      </ScrollableTable>
    );

    const region = screen.getByRole('region');
    expect(region.hasAttribute('id')).toBe(false);
  });

  // ── Edge cases ─────────────────────────────────────────────
  it('renders an empty table without errors', () => {
    render(
      <ScrollableTable ariaLabel="Empty table region">
        <table>
          <thead><tr><th>Col</th></tr></thead>
          <tbody />
        </table>
      </ScrollableTable>
    );

    expect(screen.getByRole('region')).toBeInTheDocument();
    expect(screen.getByText('Col')).toBeInTheDocument();
  });

  it('handles very wide tables with many columns', () => {
    const columns = 20;
    const headers = Array.from({ length: columns }, (_, i) => (
      <th key={i}>Column {i + 1}</th>
    ));
    const cells = Array.from({ length: columns }, (_, i) => (
      <td key={i}>Cell {i + 1}</td>
    ));

    render(
      <ScrollableTable ariaLabel="Wide table region">
        <table>
          <thead><tr>{headers}</tr></thead>
          <tbody><tr>{cells}</tr></tbody>
        </table>
      </ScrollableTable>
    );

    expect(screen.getByText('Column 1')).toBeInTheDocument();
    expect(screen.getByText('Column 20')).toBeInTheDocument();
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('renders a complex wide table with caption, thead, tbody', () => {
    render(
      <ScrollableTable ariaLabel={sampleLabel}>
        <WideTable />
      </ScrollableTable>
    );

    expect(screen.getByText('Escrow Implementation')).toBeInTheDocument();
    expect(screen.getByText('UI Redesign')).toBeInTheDocument();
    expect(screen.getByText('$7,000.00')).toBeInTheDocument();
    expect(screen.getByText('$12,500.00')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });
});

describe('ScrollableTable — a11y', () => {
  it('has no axe violations with a simple table', async () => {
    await testA11y(
      <ScrollableTable ariaLabel={sampleLabel}>
        <table>
          <caption className="sr-only">Simple table</caption>
          <thead>
            <tr><th>Name</th><th>Value</th></tr>
          </thead>
          <tbody>
            <tr><td>Item</td><td>1</td></tr>
          </tbody>
        </table>
      </ScrollableTable>
    );
  });

  it('has no axe violations with a complex wide table', async () => {
    await testA11y(
      <ScrollableTable ariaLabel={sampleLabel}>
        <WideTable />
      </ScrollableTable>
    );
  });

  it('has no axe violations with an empty table body', async () => {
    await testA11y(
      <ScrollableTable ariaLabel="Empty table">
        <table>
          <thead><tr><th>Col</th></tr></thead>
          <tbody />
        </table>
      </ScrollableTable>
    );
  });

  it('has no axe violations with a wide table (many columns)', async () => {
    const columns = 12;
    const headers = Array.from({ length: columns }, (_, i) => (
      <th key={i}>Col {i + 1}</th>
    ));
    const cells = Array.from({ length: columns }, (_, i) => (
      <td key={i}>Data {i + 1}</td>
    ));

    await testA11y(
      <ScrollableTable ariaLabel="Very wide table">
        <table>
          <thead><tr>{headers}</tr></thead>
          <tbody><tr>{cells}</tr></tbody>
        </table>
      </ScrollableTable>
    );
  });
});
