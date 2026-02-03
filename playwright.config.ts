import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Pwsnboard E2E testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',

    use: {
        headless: false,
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'on-first-retry',
    },

    projects: [
        // Auth tests - standalone (no login required)
        {
            name: 'auth',
            testMatch: /auth\.spec\.ts/,
            use: {
                ...devices['Desktop Chrome'],
                storageState: { cookies: [], origins: [] },
            },
        },
        // Auth setup - saves login state for other tests
        {
            name: 'setup',
            testMatch: /.*\.setup\.ts/,
        },
        // Main tests - requires login (depends on setup)
        // Excludes auth.spec.ts to prevent duplicate runs
        {
            name: 'chromium',
            testMatch: /.*\.spec\.ts/,
            testIgnore: /auth\.spec\.ts/,
            use: {
                ...devices['Desktop Chrome'],
                storageState: 'playwright/.auth/user.json',
            },
            dependencies: ['setup'],
        },
    ],

    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
});

