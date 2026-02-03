import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

/**
 * Authentication setup - runs before all tests to save auth state
 */
setup('authenticate', async ({ page }) => {
    await page.goto('/login');

    // Fill login form
    await page.locator('input[type="email"]').fill('personalpreaw09@gmail.com');
    await page.locator('input[type="password"]').fill('123456');

    // Submit form
    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    // Save authentication state
    await page.context().storageState({ path: authFile });
});
