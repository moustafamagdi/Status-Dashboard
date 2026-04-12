/**
 * Jest configuration for ES modules
 * Supports both .js files and inline <script> testing
 */
export default {
  testEnvironment: 'jsdom',
  transform: {},
  collectCoverageFrom: [
    'js/**/*.js',
    '!js/**/*.test.js',
    '!node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  testMatch: ['**/*.test.js'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
