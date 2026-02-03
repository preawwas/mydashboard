import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Login page
 * Uses accessibility-based locators (getByRole, getByLabel, getByText)
 */
export class LoginPage {
    readonly page: Page;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;
    readonly errorMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        // Use getByLabel for form inputs
        this.emailInput = page.getByLabel('อีเมล');
        this.passwordInput = page.getByLabel('รหัสผ่าน');
        // Use getByRole for buttons
        this.submitButton = page.getByRole('button', { name: 'เข้าสู่ระบบ' });
        // Error message container
        this.errorMessage = page.getByRole('alert').or(page.locator('.bg-red-900\\/10'));
    }

    async goto() {
        await this.page.goto('/login');
        await this.page.waitForLoadState('networkidle');
    }

    async login(email: string, password: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.submitButton.click();
    }

    async expectErrorMessage(message: string) {
        await expect(this.page.getByText(message)).toBeVisible();
    }

    async expectEmailError() {
        await expect(this.page.getByText('รูปแบบอีเมลไม่ถูกต้อง')).toBeVisible();
    }

    async expectPasswordError() {
        await expect(this.page.getByText('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')).toBeVisible();
    }

    async expectRedirectToDashboard() {
        await expect(this.page).toHaveURL(/\/dashboard/);
    }
}
