import {
  validateNavigation,
  isNavigationValid,
  NavigationRules,
} from '../navigationValidation';

describe('navigationValidation', () => {
  describe('Path Validation', () => {
    const rules: NavigationRules = {
      path: {
        required: true,
        type: 'path',
        requiredMessage: 'Path is required',
        invalidMessage: 'Invalid path format',
        maxLengthMessage: 'Path is too long',
      },
    };

    it('should pass for a valid path with alphanumeric characters, hyphens, and underscores', () => {
      const validPaths = ['contract-123', 'valid_path_name', 'abc', '123', 'a-1_b'];
      validPaths.forEach((path) => {
        const errors = validateNavigation({ path }, rules);
        expect(errors.path).toBeUndefined();
        expect(isNavigationValid({ path }, rules)).toBe(true);
      });
    });

    it('should fail for an empty path when required (custom message)', () => {
      const emptyPaths = ['', '   ', null, undefined];
      emptyPaths.forEach((path) => {
        const errors = validateNavigation({ path }, rules);
        expect(errors.path).toBe('Path is required');
        expect(isNavigationValid({ path }, rules)).toBe(false);
      });
    });

    it('should fail for an empty path when required (default message)', () => {
      const defaultRules: NavigationRules = {
        path: {
          required: true,
          type: 'path',
        },
      };
      const errors = validateNavigation({ path: '' }, defaultRules);
      expect(errors.path).toBe('This field is required.');
    });

    it('should pass for an empty path when not required', () => {
      const optionalRules: NavigationRules = {
        path: {
          required: false,
          type: 'path',
        },
      };
      const emptyPaths = ['', '   ', null, undefined];
      emptyPaths.forEach((path) => {
        const errors = validateNavigation({ path }, optionalRules);
        expect(errors.path).toBeUndefined();
        expect(isNavigationValid({ path }, optionalRules)).toBe(true);
      });
    });

    it('should fail for an out-of-range path (exceeding 64 characters) (custom message)', () => {
      const longPath = 'a'.repeat(65);
      const errors = validateNavigation({ path: longPath }, rules);
      expect(errors.path).toBe('Path is too long');
      expect(isNavigationValid({ path: longPath }, rules)).toBe(false);
    });

    it('should fail for an out-of-range path (exceeding 64 characters) (default message)', () => {
      const defaultPathRules: NavigationRules = {
        path: {
          required: true,
          type: 'path',
        },
      };
      const longPath = 'a'.repeat(65);
      const errors = validateNavigation({ path: longPath }, defaultPathRules);
      expect(errors.path).toBe('Path must be no more than 64 characters.');
      expect(isNavigationValid({ path: longPath }, defaultPathRules)).toBe(false);
    });

    it('should fail for a path with format errors (invalid characters) (custom message)', () => {
      const invalidPaths = ['contract/123', 'contract.123'];
      invalidPaths.forEach((path) => {
        const errors = validateNavigation({ path }, rules);
        expect(errors.path).toBe('Invalid path format');
        expect(isNavigationValid({ path }, rules)).toBe(false);
      });
    });

    it('should fail for a path with format errors (invalid characters) (default message)', () => {
      const defaultPathRules: NavigationRules = {
        path: {
          required: true,
          type: 'path',
        },
      };
      const errors = validateNavigation({ path: 'contract/123' }, defaultPathRules);
      expect(errors.path).toBe('Path contains invalid characters.');
    });
  });

  describe('Number Validation', () => {
    const rules: NavigationRules = {
      page: {
        required: true,
        type: 'number',
        min: 1,
        max: 100,
        minMessage: 'Page must be at least 1',
        maxMessage: 'Page must be no more than 100',
        invalidMessage: 'Must be a valid number',
        requiredMessage: 'Page is required',
      },
    };

    it('should pass for valid numbers within range', () => {
      const validPages = [1, 50, 100, '50'];
      validPages.forEach((page) => {
        const errors = validateNavigation({ page }, rules);
        expect(errors.page).toBeUndefined();
        expect(isNavigationValid({ page }, rules)).toBe(true);
      });
    });

    it('should fail for empty values when required', () => {
      const emptyPages = ['', '   ', null, undefined];
      emptyPages.forEach((page) => {
        const errors = validateNavigation({ page }, rules);
        expect(errors.page).toBe('Page is required');
        expect(isNavigationValid({ page }, rules)).toBe(false);
      });
    });

    it('should fail for non-numeric values (custom message)', () => {
      const invalidPages = ['abc', '12abc'];
      invalidPages.forEach((page) => {
        const errors = validateNavigation({ page }, rules);
        expect(errors.page).toBe('Must be a valid number');
        expect(isNavigationValid({ page }, rules)).toBe(false);
      });
    });

    it('should fail for non-numeric values (default message)', () => {
      const defaultNumberRules: NavigationRules = {
        page: {
          required: true,
          type: 'number',
        },
      };
      const errors = validateNavigation({ page: 'abc' }, defaultNumberRules);
      expect(errors.page).toBe('Enter a valid number.');
    });

    it('should fail for values below min (custom message)', () => {
      const errors = validateNavigation({ page: 0 }, rules);
      expect(errors.page).toBe('Page must be at least 1');
      expect(isNavigationValid({ page: 0 }, rules)).toBe(false);
    });

    it('should fail for values below min (default message)', () => {
      const defaultNumberRules: NavigationRules = {
        page: {
          required: true,
          type: 'number',
          min: 1,
        },
      };
      const errors = validateNavigation({ page: 0 }, defaultNumberRules);
      expect(errors.page).toBe('Value must be at least 1.');
    });

    it('should fail for values above max (custom message)', () => {
      const errors = validateNavigation({ page: 101 }, rules);
      expect(errors.page).toBe('Page must be no more than 100');
      expect(isNavigationValid({ page: 101 }, rules)).toBe(false);
    });

    it('should fail for values above max (default message)', () => {
      const defaultNumberRules: NavigationRules = {
        page: {
          required: true,
          type: 'number',
          max: 100,
        },
      };
      const errors = validateNavigation({ page: 101 }, defaultNumberRules);
      expect(errors.page).toBe('Value must be no more than 100.');
    });
  });

  describe('String Length and Pattern Validation', () => {
    const rules: NavigationRules = {
      label: {
        required: true,
        minLength: 3,
        maxLength: 10,
        pattern: /^[a-z]+$/,
        requiredMessage: 'Label is required',
        invalidMessage: 'Label format is invalid',
        minLengthMessage: 'Label must be at least 3 characters',
        maxLengthMessage: 'Label must be no more than 10 characters',
      },
    };

    it('should pass for a string matching length and pattern', () => {
      const errors = validateNavigation({ label: 'test' }, rules);
      expect(errors.label).toBeUndefined();
      expect(isNavigationValid({ label: 'test' }, rules)).toBe(true);
    });

    it('should fail if empty', () => {
      const errors = validateNavigation({ label: '' }, rules);
      expect(errors.label).toBe('Label is required');
      expect(isNavigationValid({ label: '' }, rules)).toBe(false);
    });

    it('should fail if too short (custom message)', () => {
      const errors = validateNavigation({ label: 'te' }, rules);
      expect(errors.label).toBe('Label must be at least 3 characters');
      expect(isNavigationValid({ label: 'te' }, rules)).toBe(false);
    });

    it('should fail if too short (default message)', () => {
      const defaultRules: NavigationRules = {
        label: {
          required: true,
          minLength: 3,
        },
      };
      const errors = validateNavigation({ label: 'te' }, defaultRules);
      expect(errors.label).toBe('Enter at least 3 characters.');
    });

    it('should fail if too long (custom message)', () => {
      const errors = validateNavigation({ label: 'longerthanten' }, rules);
      expect(errors.label).toBe('Label must be no more than 10 characters');
      expect(isNavigationValid({ label: 'longerthanten' }, rules)).toBe(false);
    });

    it('should fail if too long (default message)', () => {
      const defaultRules: NavigationRules = {
        label: {
          required: true,
          maxLength: 10,
        },
      };
      const errors = validateNavigation({ label: 'longerthanten' }, defaultRules);
      expect(errors.label).toBe('Enter no more than 10 characters.');
    });

    it('should fail if pattern does not match (custom message)', () => {
      const errors = validateNavigation({ label: 'test1' }, rules);
      expect(errors.label).toBe('Label format is invalid');
      expect(isNavigationValid({ label: 'test1' }, rules)).toBe(false);
    });

    it('should fail if pattern does not match (default message)', () => {
      const defaultRules: NavigationRules = {
        label: {
          required: true,
          pattern: /^[a-z]+$/,
        },
      };
      const errors = validateNavigation({ label: 'test1' }, defaultRules);
      expect(errors.label).toBe('Enter a valid value.');
    });
  });
});
