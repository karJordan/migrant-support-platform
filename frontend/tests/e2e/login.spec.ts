import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'wrong@test.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    const responsePromise = page.waitForResponse(res => res.url().includes('/api/auth/login'));
    await page.click('button[type="submit"]');
    const response = await responsePromise;

    expect(response.status()).toBe(400);
    await expect(page.locator('text=Invalid username or password')).toBeVisible({ timeout: 10_000 });
});

test('should successfully login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'test@test.com');
    await page.fill('input[name="password"]', 'password123');

    const responsePromise = page.waitForResponse(res => res.url().includes('/api/auth/login'));
    await page.press('input[name="password"]', 'Enter');
    const response = await responsePromise;

    expect(response.status()).toBe(200);
    await expect(page).toHaveURL('/userDashboard', { timeout: 20_000 });
});

});
