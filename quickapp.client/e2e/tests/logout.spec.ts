import { expect, test } from '@playwright/test';
import { login, logout } from '../helpers/auth';

test.describe('logout', () => {
  test('logout returns to the login page', async ({ page }) => {
    await login(page);
    await logout(page);

    await expect(page.locator('#login-username')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
  });

  test('logged-out users cannot visit the dashboard', async ({ page }) => {
    await login(page);
    await logout(page);
    await page.goto('/');

    await expect(page).toHaveURL(/\/login/);
  });
});
