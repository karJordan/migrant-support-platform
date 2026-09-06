import { Page } from '@playwright/test';

export const TEST_USERS = {
    regular: {
      email: 'test@test.com',
      password: 'Password123!'
    },
    admin: {
      email: 'admin@test.com',
      password: 'AdminPass123!'
    },
    e2e: {
      email: 'playwright@test.com',
      password: 'Playwright123!'
    }
  };

  export async function loginAsTestUser(page: Page, userType: keyof typeof TEST_USERS = 'regular') {
    const user = TEST_USERS[userType];
    
    await page.goto('/login');
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/userDashboard');
  }
  
  export async function loginAsAdmin(page: Page) {
    await loginAsTestUser(page, 'admin');
  }
  
  export async function ensureLoggedOut(page: Page) {
    // If already logged in, log out
    await page.goto('/');
    const logoutButton = page.locator('button:has-text("Log out")');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    }
  }