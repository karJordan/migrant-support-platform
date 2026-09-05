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
        
        await page.waitForURL('/', { timeout: 10000 });
        await expect(page).toHaveURL('/');
      });
    });
