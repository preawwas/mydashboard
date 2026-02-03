import { test, expect } from '@playwright/test';
import { InvestmentsPage } from '../pages/InvestmentsPage';

test.describe('Investments', () => {
    test('should display investments page', async ({ page }) => {
        const investmentsPage = new InvestmentsPage(page);
        await investmentsPage.goto();

        // Verify page loaded using accessibility locator
        await expect(page).toHaveURL(/\/investments/);
        await investmentsPage.expectPageLoaded();
    });

    test('should open add investment form', async ({ page }) => {
        const investmentsPage = new InvestmentsPage(page);
        await investmentsPage.goto();

        await investmentsPage.openAddForm();

        // Modal should be visible using getByRole
        await expect(investmentsPage.modal).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
        const investmentsPage = new InvestmentsPage(page);
        await investmentsPage.goto();

        await investmentsPage.openAddForm();
        await investmentsPage.submitForm();

        await page.waitForTimeout(500);

        // Should show error states (red text)
        await expect(page.getByText(/จำเป็น|required/i).first()).toBeVisible();
    });

    test('should create new investment successfully', async ({ page }) => {
        const investmentsPage = new InvestmentsPage(page);
        await investmentsPage.goto();

        await investmentsPage.openAddForm();

        // Fill form using accessibility-based methods
        await investmentsPage.fillForm({
            assetCode: 'TEST001',
            assetName: 'Test Investment',
            quantity: 10,
            price: 1000,
        });

        await investmentsPage.submitForm();
        await page.waitForTimeout(2000);
    });

    test('should close modal when cancel is clicked', async ({ page }) => {
        const investmentsPage = new InvestmentsPage(page);
        await investmentsPage.goto();

        await investmentsPage.openAddForm();
        await investmentsPage.closeModal();

        await investmentsPage.expectModalClosed();
    });
});
