import { test, expect } from '@playwright/test';

test.describe('Register Flow', () => {
    test('should show browser validation pop up for empty fields', async ({ page }) => {
        await page.goto('/signup');

        await page.click('button[type="submit"]');

        const nameField = page.locator('input[name="name"]');
        const emailField = page.locator('input[name="email"]');
        const passwordField = page.locator('input[name="password"]');
    
        // Browser validation makes fields invalid
        await expect(nameField).toHaveJSProperty('validationMessage', 'Please fill out this field.');
        await expect(emailField).toHaveJSProperty('validationMessage', 'Please fill out this field.');
        await expect(passwordField).toHaveJSProperty('validationMessage', 'Please fill out this field.');
  });

    test('should show validation popup for invalid email', async ({ page, browserName }) => {
        await page.goto('/signup');

        const invalidEmail = 'invalid-email';

        await page.fill('input[name="name"]', 'Test User');
        await page.fill('input[name="email"]', 'invalid-email');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');

        const emailField = page.locator('input[name="email"]');
        const validationMessage = await emailField.getAttribute('validationMessage');
  
        // ✅ Check if the field is invalid (works on all browsers)
        if (validationMessage) {
          // Check that the message is about email format
          expect(validationMessage).toMatch(/email/i);
        } else {
          // Fallback: check HTML5 validity
          const isInvalid = await emailField.evaluate((el) => {
            return el.matches(':invalid');
          });
          expect(isInvalid).toBe(true);
        }
      });

    test('should successfully register a new user', async ({ page }) => {
        const uniqueEmail = `testuser${Date.now()}@test.com`; // Unique email for each test run

        await page.goto('/signup');

        await page.fill('input[name="name"]', 'Test User');
        await page.fill('input[name="email"]', uniqueEmail);
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Should redirect to dashboard
        await expect(page).toHaveURL('/login');
    });
});
