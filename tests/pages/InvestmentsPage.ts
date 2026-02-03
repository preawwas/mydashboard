import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Investments page
 * Uses accessibility-based locators (getByRole, getByLabel, getByText)
 */
export class InvestmentsPage {
    readonly page: Page;
    readonly addButton: Locator;
    readonly modal: Locator;
    readonly submitButton: Locator;
    readonly cancelButton: Locator;

    constructor(page: Page) {
        this.page = page;
        // Use getByRole for buttons
        this.addButton = page.getByRole('button', { name: /เพิ่มการลงทุน|เพิ่ม|Add/i });
        this.modal = page.getByRole('dialog');
        this.submitButton = page.getByRole('dialog').getByRole('button', { name: /บันทึก|Save/i });
        this.cancelButton = page.getByRole('dialog').getByRole('button', { name: /ยกเลิก|Cancel/i });
    }

    async goto() {
        await this.page.goto('/investments');
        await this.page.waitForLoadState('networkidle');
    }

    async openAddForm() {
        await this.addButton.click();
        await expect(this.modal).toBeVisible();
    }

    async fillForm(data: {
        assetCode: string;
        assetName: string;
        quantity: number;
        price: number;
    }) {
        const dialog = this.page.getByRole('dialog');

        // Use getByLabel or getByPlaceholder for inputs
        // Asset Code - find by label text containing "รหัส" or "Code"
        await dialog.getByRole('textbox').first().fill(data.assetCode);
        await dialog.getByRole('textbox').nth(1).fill(data.assetName);

        // Number inputs - use getByRole spinbutton
        const spinbuttons = dialog.getByRole('spinbutton');
        await spinbuttons.nth(0).fill(data.quantity.toString());
        await spinbuttons.nth(1).fill(data.price.toString());
    }

    async submitForm() {
        await this.submitButton.click();
    }

    async closeModal() {
        await this.cancelButton.click();
    }

    async expectModalClosed() {
        await expect(this.modal).not.toBeVisible();
    }

    async expectPageLoaded() {
        await expect(this.page.getByRole('heading', { name: /การลงทุน|Investment/i })).toBeVisible();
    }
}
