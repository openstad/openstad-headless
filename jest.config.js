module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    'src/**/*.js',
  ],

  projects: [
    {
      displayName: 'db',
      testMatch: ['<rootDir>/test/db/**/*.js'],
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/test/integration/**/*.js'],
    },
    {
      displayName: 'config',
      testMatch: ['<rootDir>/test/config/**/*.js'],
    },
  ],

  testRegex: '\\.test\\.js$',

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: ['./jest.setup.js'],

  // The test environment that will be used for testing
  testEnvironment: 'node',
};
