import { expect, test } from '@playwright/test';
import { ADMIN, login } from '../helpers/auth';

test.describe('login', () => {
  test('login page renders', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('.card-header')).toContainText('Login');
    await expect(page.locator('#login-username')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('invalid login shows an error', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#login-username').fill(ADMIN.username);
    await page.locator('#login-password').fill('wrong-password-1');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('#toasta .toast-msg, .toasta-container .toast-msg')).toContainText(
      /Invalid username or password|check that your username and password/i
    );
    await expect(page).toHaveURL(/\/login/);
  });

  test('valid admin login lands on the dashboard', async ({ page }) => {
    await login(page);

    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
    await expect(page.locator('.user-name')).toContainText('admin');
  });

  test('unauthenticated visit to a guarded route redirects to login', async ({ page }) => {
    await page.goto('/customers');

    await expect(page).toHaveURL(/\/login/);
  });
});
