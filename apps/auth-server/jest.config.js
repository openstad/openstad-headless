module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    'src/**/*.js',
  ],

  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/test/unit/**/*.js'],
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/test/integration/**/*.test.js'],
    },
  ],

  testRegex: '\\.test\\.js$',

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  
  // The test environment that will be used for testing
  testEnvironment: 'node',
};
