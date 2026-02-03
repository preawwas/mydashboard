import { test, expect } from '@playwright/test';
import { ExpensesPage } from '../pages/ExpensesPage';

test.describe('Expenses', () => {
    test('should display expenses page', async ({ page }) => {
        const expensesPage = new ExpensesPage(page);
        await expensesPage.goto();

        // Verify page loaded using accessibility locator
        await expect(page).toHaveURL(/\/expenses/);
        await expensesPage.expectPageLoaded();
    });

    test('should open add expense form', async ({ page }) => {
        const expensesPage = new ExpensesPage(page);
        await expensesPage.goto();

        await expensesPage.openAddForm();

        // Modal should be visible
        await expect(expensesPage.modal).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
        const expensesPage = new ExpensesPage(page);
        await expensesPage.goto();

        await expensesPage.openAddForm();
        await page.waitForTimeout(500);

        await expensesPage.submitForm();
        await page.waitForTimeout(500);

        // Should show error states (red text labels)
        await expect(page.getByText('*').first()).toBeVisible();
    });

    test('should create new expense successfully', async ({ page }) => {
        const expensesPage = new ExpensesPage(page);
        await expensesPage.goto();

        await expensesPage.openAddForm();
        await page.waitForTimeout(1500);

        // Select first category using getByRole
        const categoryButtons = page.getByRole('dialog').getByRole('button').filter({
            has: page.locator('span.truncate')
        });
        if (await categoryButtons.count() > 0) {
            await categoryButtons.first().click();
        }

        // Fill form using accessibility methods
        await expensesPage.fillItemName('Test Expense Item');
        await expensesPage.fillAmount(500);

        // Select payment channel
        const paymentButtons = page.getByRole('dialog').getByRole('button').filter({
            has: page.locator('span.truncate')
        });
        const payCount = await paymentButtons.count();
        if (payCount > 1) {
            await paymentButtons.nth(payCount - 1).click();
        }

        await expensesPage.submitForm();
        await page.waitForTimeout(2000);
    });

    test('should close modal when cancel is clicked', async ({ page }) => {
        const expensesPage = new ExpensesPage(page);
        await expensesPage.goto();

        await expensesPage.openAddForm();
        await expensesPage.closeModal();

        await expensesPage.expectModalClosed();
    });
});
