/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  watchman: false,
  // Run tests serially in a single worker to prevent concurrent axe-core
  // singleton collisions ("Axe is already running") in the a11y test suite.
  maxWorkers: 1,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.css$': '<rootDir>/src/__mocks__/styleMock.js',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './.babelrc' }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(next|next/dist)/)',
  ],
  // Use the test-specific tsconfig so the TS language server resolves
  // Jest globals (describe, test, expect, etc.) inside test files.
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.test.json',
    },
  },
};

module.exports = config;
