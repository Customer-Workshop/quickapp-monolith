import { expect, Page } from '@playwright/test';

export const ADMIN = {
  username: 'admin',
  password: 'tempP@ss123'
};

export async function login(page: Page, credentials = ADMIN) {
  await page.goto('/login');
  await page.locator('#login-username').fill(credentials.username);
  await page.locator('#login-password').fill(credentials.password);
  await page.locator('button[type="submit"]').click();
  await expect(page).not.toHaveURL(/\/login/);
  await expect(page.locator('.user-name')).toContainText(credentials.username);
}

export async function logout(page: Page) {
  await page.getByRole('link', { name: /Logout/i }).click();
  await expect(page).toHaveURL(/\/login/);
}
