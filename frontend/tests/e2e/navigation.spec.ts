import { test, expect } from '@playwright/test';

test.describe('Navigation Flow', () => {
    test('should navigate between pages on desktop', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.goto('/');

        // Navigate to Login page
        await page.click('text=Login');
        await expect(page).toHaveURL('/login');

        // Navigate to Sign Up page
        await page.click('text=Sign Up');
        await expect(page).toHaveURL('/signup');

        // Navigate back to Home page
        await page.click('text=Home');
        await expect(page).toHaveURL('/');

        // Navigate to Services page
        await page.click('text=Services');
        await expect(page).toHaveURL('/services');

        // Navigate to Jobs page
        await page.click('text=Jobs');
        await expect(page).toHaveURL('/jobs');

        // Navigate to Community page
        await page.click('text=Community');
        await expect(page).toHaveURL('/community');

        // Navigate to Resources page
        await page.click('text=Resources');
        await expect(page).toHaveURL('/resources');
    });

    test('should show mobile navigation on small screens', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('/');
        
        // Mobile nav should be visible
        await expect(page.locator('nav.fixed.bottom-0')).toBeVisible();
        // Desktop nav should be hidden
        await expect(page.locator('nav.hidden.md\\:flex')).toBeHidden();
      });
    });