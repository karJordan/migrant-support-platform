import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
    test('should show error for invalid credentials', async ({ page }) => {
        await page.goto('/login');

        const emailField = page.locator('input[name="email"]');
        const passwordField = page.locator('input[name="password"]');

        await emailField.click();
        await emailField.fill('wrong@test.com');
        await expect(emailField).toHaveValue('wrong@test.com');

        await passwordField.click();
        await passwordField.fill('wrongpassword');
        await expect(passwordField).toHaveValue('wrongpassword');

        await page.click('button[type="submit"]');

        await expect(
            page.getByText(/invalid credentials/i)
        ).toBeVisible({ timeout: 10000 });
    });

    test('should successfully login with valid credentials', async ({ page }) => {
        await page.goto('/login');

        const emailField = page.locator('input[name="email"]');
        const passwordField = page.locator('input[name="password"]');

        await emailField.click();
        await emailField.fill('test@test.com');
        await expect(emailField).toHaveValue('test@test.com');

        await passwordField.click();
        await passwordField.fill('password123');
        await expect(passwordField).toHaveValue('password123');

        await page.click('button[type="submit"]');

        await expect(page).toHaveURL('/userDashboard', { timeout: 10000 });
    });
});