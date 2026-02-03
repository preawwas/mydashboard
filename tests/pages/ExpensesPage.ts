import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Expenses page
 * Uses accessibility-based locators (getByRole, getByLabel, getByText)
 */
export class ExpensesPage {
    readonly page: Page;
    readonly addButton: Locator;
    readonly modal: Locator;
    readonly submitButton: Locator;
    readonly cancelButton: Locator;

    constructor(page: Page) {
        this.page = page;
        // Use getByRole for buttons
        this.addButton = page.getByRole('button', { name: /เพิ่มรายจ่าย|เพิ่ม|Add/i });
        this.modal = page.getByRole('dialog');
        this.submitButton = page.getByRole('dialog').getByRole('button', { name: /บันทึก|เพิ่มรายจ่าย|Save|Add/i }).last();
        this.cancelButton = page.getByRole('dialog').getByRole('button', { name: /ยกเลิก|Cancel/i });
    }

    async goto() {
        await this.page.goto('/expenses');
        await this.page.waitForLoadState('networkidle');
    }

    async openAddForm() {
        await this.addButton.click();
        await expect(this.modal).toBeVisible();
    }

    async selectCategory(categoryName: string) {
        // Click on category by its text content
        await this.modal.getByRole('button', { name: categoryName }).click();
    }

    async selectPaymentChannel(channelName: string) {
        // Click on payment channel by its text content
        await this.modal.getByRole('button', { name: channelName }).click();
    }

    async fillItemName(itemName: string) {
        // Use getByPlaceholder for the item name input
        await this.modal.getByPlaceholder('e.g. Weekly Groceries').fill(itemName);
    }

    async fillAmount(amount: number) {
        // Use getByPlaceholder for the amount input
        await this.modal.getByPlaceholder('0.00').fill(amount.toString());
    }

    async fillForm(data: {
        itemName: string;
        amount: number;
        category?: string;
        paymentChannel?: string;
    }) {
        if (data.category) {
            await this.selectCategory(data.category);
        }
        if (data.paymentChannel) {
            await this.selectPaymentChannel(data.paymentChannel);
        }
        await this.fillItemName(data.itemName);
        await this.fillAmount(data.amount);
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
        await expect(this.page.getByRole('heading', { name: /รายจ่าย|Expense/i })).toBeVisible();
    }
}
