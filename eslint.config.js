const js = require('@eslint/js');
const globals = require('globals');
const nextPlugin = require('eslint-config-next');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = [
  // Ignore stray files that should never be linted
  // - `test_check.js` and `coverage/**` are generated/test artefacts that
  //   would otherwise pollute lint output during CI.
  // - `.next/**` is the Next.js build cache (regenerated on every build).
  // - `node_modules/**` is third-party code.
  // - `src/declarations.d.ts` holds ambient declarations (no executable code).
  {
    ignores: [
      '**/test_check.js',
      '**/.next/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/src/declarations.d.ts',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        React: 'readonly',
        JSX: 'readonly',
      },
    },
    plugins: { next: nextPlugin },
    rules: {
      ...nextPlugin.rules,
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        React: 'readonly',
        JSX: 'readonly',
      },
    },
    plugins: {
      next: nextPlugin,
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...nextPlugin.rules,
      // Disable base rule — @typescript-eslint/no-unused-vars handles TS correctly
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
    },
  },
];
