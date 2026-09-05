import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e', // Directory containing test files
    fullyParallel: true,       // Run tests in parallel to save time
    forbidOnly: !!process.env.CI, // Fail build if test.only is left in code on CI
    retries: process.env.CI ? 2 : 0, // Retry failed tests on CI environment
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['html'],
        ['list'],
    ],
    use: {
        baseURL: 'http://localhost:3000', // Base URL for all tests
        trace: 'on-first-retry', // Collect trace on first retry
        screenshot: 'only-on-failure', // Capture screenshot only on test failure
    },

    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        ...(process.platform === 'darwin' ? [] : [
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
        ]),
        // ------- skip mobile tests until we have a mobile-friendly UI ----------
       // { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
       // ...(process.platform === 'darwin' ? [] : [
       // { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
       // ]),
    ],

    webServer: process.env.CI? undefined :{
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
      },
});