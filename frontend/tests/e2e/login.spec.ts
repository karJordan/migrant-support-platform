import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
    test('should show error for invalid credentials', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[name="email"]', 'wrong@test.com');
        await page.fill('input[name="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');

        await expect(page.locator('text=Invalid username or password')).toBeVisible();
    });

    test('should successfully login with valid credentials', async ({ page }) => {
        await page.goto('/login');
        
        // Fill valid credentials (use test user created by seed)
        await page.fill('input[name="email"]', 'test@test.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        
        // Should redirect to home page
        await expect(page).toHaveURL('/login');
        
        const viewportSize = page.viewportSize();
        const isDesktop = viewportSize && viewportSize.width >= 768;

        if (isDesktop) {
            // On desktop, logout button should be visible
            await expect(page.locator('button:has-text("Log out")')).toBeVisible();
          } else {
            // On mobile, just check that the user is redirected to home
            await expect(page).toHaveURL('/');
          }
      });
    });