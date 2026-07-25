import {
  validateMilestone,
  MAX_MILESTONE_TITLE_LENGTH,
  MAX_MILESTONE_PAYOUT_LIMIT,
} from '../validateMilestone';

describe('validateMilestone', () => {
  it('returns no errors for valid inputs', () => {
    const errors = validateMilestone({
      title: 'Milestone 1: Prototype',
      payout: '1500',
      currency: 'USD',
      dueDate: '2026-12-31',
    });
    expect(errors).toEqual([]);
  });

  it('validates title requirement and character limit', () => {
    // Empty title
    let errors = validateMilestone({ title: '   ', payout: '100', currency: 'USD' });
    expect(errors).toContainEqual({
      fieldId: 'milestone-title',
      message: 'Title is required',
    });

    // Exceeding title limit
    const longTitle = 'a'.repeat(MAX_MILESTONE_TITLE_LENGTH + 1);
    errors = validateMilestone({ title: longTitle, payout: '100', currency: 'USD' });
    expect(errors).toContainEqual({
      fieldId: 'milestone-title',
      message: `Title must be no more than ${MAX_MILESTONE_TITLE_LENGTH} characters`,
    });
  });

  it('validates payout requirement, positive numeric values, and upper limit', () => {
    // Empty payout
    let errors = validateMilestone({ title: 'Test', payout: '', currency: 'USD' });
    expect(errors).toContainEqual({
      fieldId: 'milestone-payout',
      message: 'Payout amount is required',
    });

    // Non-numeric payout
    errors = validateMilestone({ title: 'Test', payout: 'abc', currency: 'USD' });
    expect(errors).toContainEqual({
      fieldId: 'milestone-payout',
      message: 'Payout must be a positive number',
    });

    // Zero payout
    errors = validateMilestone({ title: 'Test', payout: '0', currency: 'USD' });
    expect(errors).toContainEqual({
      fieldId: 'milestone-payout',
      message: 'Payout must be a positive number',
    });

    // Negative payout
    errors = validateMilestone({ title: 'Test', payout: '-500', currency: 'USD' });
    expect(errors).toContainEqual({
      fieldId: 'milestone-payout',
      message: 'Payout must be a positive number',
    });

    // Exceeds maximum limit
    errors = validateMilestone({
      title: 'Test',
      payout: (MAX_MILESTONE_PAYOUT_LIMIT + 1).toString(),
      currency: 'USD',
    });
    expect(errors).toContainEqual({
      fieldId: 'milestone-payout',
      message: `Payout amount cannot exceed ${MAX_MILESTONE_PAYOUT_LIMIT.toLocaleString()}`,
    });
  });

  it('validates currency selection', () => {
    // Empty currency
    let errors = validateMilestone({ title: 'Test', payout: '100', currency: '   ' });
    expect(errors).toContainEqual({
      fieldId: 'milestone-currency',
      message: 'Currency is required',
    });

    // Unsupported currency
    errors = validateMilestone({ title: 'Test', payout: '100', currency: 'DOGE' });
    expect(errors).toContainEqual({
      fieldId: 'milestone-currency',
      message: 'Invalid currency selected',
    });
  });

  it('validates optional due date format and year boundary', () => {
    // Invalid date string format
    let errors = validateMilestone({
      title: 'Test',
      payout: '100',
      currency: 'USD',
      dueDate: 'invalid-date-string',
    });
    expect(errors).toContainEqual({
      fieldId: 'milestone-dueDate',
      message: 'Due date must be a valid date string (e.g. YYYY-MM-DD or MMM D, YYYY)',
    });

    // Date year before 2000
    errors = validateMilestone({
      title: 'Test',
      payout: '100',
      currency: 'USD',
      dueDate: '1999-12-31',
    });
    expect(errors).toContainEqual({
      fieldId: 'milestone-dueDate',
      message: 'Due date year must be between 2000 and 2100',
    });

    // Date year after 2100
    errors = validateMilestone({
      title: 'Test',
      payout: '100',
      currency: 'USD',
      dueDate: '2101-01-01',
    });
    expect(errors).toContainEqual({
      fieldId: 'milestone-dueDate',
      message: 'Due date year must be between 2000 and 2100',
    });
  });
});
