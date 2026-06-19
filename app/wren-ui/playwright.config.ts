import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Look for test files in the "tests" directory, relative to this configuration file.
  testDir: 'e2e',

  // Each test is given 60 seconds.
  timeout: 1 * 60 * 1000,

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: false,

  // Retry on CI only.
  retries: 0,

  // Opt out of parallel tests on CI.
  workers: 1,

  // Reporter to use
  reporter: 'html',

  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    baseURL: 'http://127.0.0.1:3000',

    // Collect trace when retrying the failed test.
    trace: 'on-first-retry',
  },
  // Configure projects for major browsers.
  projects: [
    {
      name: 'setup db',
      testMatch: /global\.setup\.ts/,
      teardown: 'cleanup db',
    },
    {
      name: 'cleanup db',
      testMatch: /global\.teardown\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup db'],
    },
  ],
  // Run local backend and frontend servers before starting the tests.
  webServer: [
    {
      command:
        'cd ../wren-graphql && DB_TYPE=sqlite SQLITE_FILE=../wren-ui/testdb.sqlite3 NODE_ENV=test PORT=3001 HOSTNAME=0.0.0.0 yarn start',
      url: 'http://127.0.0.1:3001',
      reuseExistingServer: true,
    },
    {
      command:
        'WREN_GRAPHQL_ENDPOINT=http://127.0.0.1:3001 NODE_ENV=test PORT=3000 HOSTNAME=0.0.0.0 yarn start',
      url: 'http://127.0.0.1:3000',
      reuseExistingServer: true,
    },
  ],
});
