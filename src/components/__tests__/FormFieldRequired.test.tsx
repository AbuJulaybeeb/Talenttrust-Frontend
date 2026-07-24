import React from 'react';
import { render, screen } from '@testing-library/react';
import { FormField } from '../FormField';
import { testA11y } from '../../test-utils/a11y';

describe('FormField Required Semantics and Indicator', () => {
  const defaultProps = {
    label: 'Email Address',
    id: 'email-input',
  };

  it('sets aria-required="true" on cloned input and renders visible * indicator when required is true', () => {
    render(
      <FormField {...defaultProps} required={true}>
        <input type="email" data-testid="child-input" />
      </FormField>
    );

    const input = screen.getByTestId('child-input');
    expect(input).toHaveAttribute('aria-required', 'true');

    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveAttribute('aria-hidden', 'true');
    expect(asterisk).toHaveClass('text-red-500');
  });

  it('omits aria-required and does not render visual indicator when required is false', () => {
    render(
      <FormField {...defaultProps} required={false}>
        <input type="email" data-testid="child-input" />
      </FormField>
    );

    const input = screen.getByTestId('child-input');
    expect(input).not.toHaveAttribute('aria-required');
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('omits aria-required and does not render visual indicator when required is undefined/omitted', () => {
    render(
      <FormField {...defaultProps}>
        <input type="email" data-testid="child-input" />
      </FormField>
    );

    const input = screen.getByTestId('child-input');
    expect(input).not.toHaveAttribute('aria-required');
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('automatically detects native required prop on the child element', () => {
    render(
      <FormField {...defaultProps}>
        <input type="email" data-testid="child-input" required />
      </FormField>
    );

    const input = screen.getByTestId('child-input');
    expect(input).toHaveAttribute('aria-required', 'true');

    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveAttribute('aria-hidden', 'true');
  });

  it('automatically detects aria-required prop on the child element', () => {
    render(
      <FormField {...defaultProps}>
        <input type="email" data-testid="child-input" aria-required="true" />
      </FormField>
    );

    const input = screen.getByTestId('child-input');
    expect(input).toHaveAttribute('aria-required', 'true');

    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveAttribute('aria-hidden', 'true');
  });

  it('ensures the required indicator is inside the label element', () => {
    render(
      <FormField {...defaultProps} required={true}>
        <input type="email" />
      </FormField>
    );

    const labelElement = screen.getByText(/Email Address/);
    expect(labelElement.tagName).toBe('LABEL');
    
    const asterisk = screen.getByText('*');
    expect(labelElement).toContainElement(asterisk);
  });

  it('passes accessibility validation when required is true', async () => {
    await testA11y(
      <FormField {...defaultProps} required={true}>
        <input type="email" />
      </FormField>
    );
  });

  it('works with <select> elements and sets aria-required', () => {
    render(
      <FormField {...defaultProps} required={true}>
        <select data-testid="child-select">
          <option value="1">Option 1</option>
        </select>
      </FormField>
    );

    const select = screen.getByTestId('child-select');
    expect(select).toHaveAttribute('aria-required', 'true');
  });

  it('works with <textarea> elements and sets aria-required', () => {
    render(
      <FormField {...defaultProps} required={true}>
        <textarea data-testid="child-textarea" />
      </FormField>
    );

    const textarea = screen.getByTestId('child-textarea');
    expect(textarea).toHaveAttribute('aria-required', 'true');
  });

  it('merges aria-required with aria-invalid and aria-describedby correctly', () => {
    render(
      <FormField 
        {...defaultProps} 
        required={true} 
        error="This field is mandatory"
        helperText="Enter a valid address"
      >
        <input type="text" data-testid="child-input" />
      </FormField>
    );

    const input = screen.getByTestId('child-input');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'email-input-error email-input-helper');
  });
});
