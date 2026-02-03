import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Authentication', () => {
    test.describe('Login Validation', () => {
        test.use({ storageState: { cookies: [], origins: [] } }); // Start without auth

        test('should show error for password less than 6 characters', async ({ page }) => {
            const loginPage = new LoginPage(page);
            await loginPage.goto();

            await loginPage.login('test@example.com', '123');

            await loginPage.expectPasswordError();
        });

        test('should show error for wrong credentials', async ({ page }) => {
            const loginPage = new LoginPage(page);
            await loginPage.goto();

            await loginPage.login('wrong@example.com', 'wrongpassword');

            // Wait for API response
            await page.waitForTimeout(2000);
            await loginPage.expectErrorMessage('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        });

        test('should login successfully with correct credentials', async ({ page }) => {
            const loginPage = new LoginPage(page);
            await loginPage.goto();

            await loginPage.login('personalpreaw09@gmail.com', '123456');

            await loginPage.expectRedirectToDashboard();
        });
    });

    test.describe('Logout', () => {
        test('should logout successfully', async ({ page }) => {
            // Go to dashboard (already logged in from auth setup)
            await page.goto('/dashboard');
            await page.waitForLoadState('networkidle');

            // Find and click logout button
            const logoutButton = page.getByRole('button', { name: /logout|ออกจากระบบ/i });

            // If no button, check for user menu dropdown
            if (await logoutButton.count() === 0) {
                const userMenu = page.locator('[aria-label*="user" i], .user-menu, [data-testid="user-menu"]');
                if (await userMenu.count() > 0) {
                    await userMenu.click();
                    await page.getByRole('menuitem', { name: /logout|ออกจากระบบ/i }).click();
                }
            } else {
                await logoutButton.click();
            }

            // Expect redirect to login
            await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
        });
    });
});
