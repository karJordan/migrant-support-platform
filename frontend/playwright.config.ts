import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e', // Directory containing test files
    fullyParallel: true,       // Run tests in parallel to save time
    forbidOnly: !!process.env.CI, // Fail build if test.only is left in code on CI
    retries: process.env.CI ? 2 : 0, // Retry failed tests on CI environment
    workers: process.env.CI ? 1 : undefined,

    timeout: 60_000,
    expect: {timeout: 15_000},

    reporter: [
        ['html'],
        ['list'],
    ],
    use: {
        baseURL: 'http://localhost:3000', // Base URL for all tests
        trace: 'on-first-retry', // Collect trace on first retry
        screenshot: 'only-on-failure', // Capture screenshot only on test failure
        actionTimeout: 15_000,
        navigationTimeout: 30_000,
    },

    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
        { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
        { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
    ],

    webServer: process.env.CI? undefined :{
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
      },
});