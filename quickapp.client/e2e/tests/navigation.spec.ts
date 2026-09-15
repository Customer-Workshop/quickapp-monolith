import { expect, test } from '@playwright/test';
import { login } from '../helpers/auth';

test.describe('navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('Customers navigation works', async ({ page }) => {
    await page.getByRole('link', { name: 'Customers' }).click();
    await expect(page).toHaveURL(/\/customers/);
    await expect(page.getByRole('heading', { name: 'Customers', exact: true })).toBeVisible();
  });

  test('Products navigation works', async ({ page }) => {
    await page.getByRole('link', { name: 'Products' }).click();
    await expect(page).toHaveURL(/\/products/);
    await expect(page.getByRole('heading', { name: 'Products', exact: true })).toBeVisible();
  });

  test('Orders navigation works', async ({ page }) => {
    await page.getByRole('link', { name: 'Orders' }).click();
    await expect(page).toHaveURL(/\/orders/);
    await expect(page.getByRole('heading', { name: 'Orders', exact: true })).toBeVisible();
  });

  test('Settings navigation works', async ({ page }) => {
    await page.locator('a[routerLink="/settings"]').click();
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Profile' })).toBeVisible();
  });

  test('user management lists the seeded admin user', async ({ page }) => {
    await page.goto('/settings#users');

    await expect(page.locator('h4')).toContainText('Users Managements');
    await expect(page.locator('ngx-datatable .datatable-body-row').getByText('admin', { exact: true }))
      .toBeVisible();
  });

  test('roles management lists the administrator role', async ({ page }) => {
    await page.goto('/settings#roles');

    await expect(page.locator('h4')).toContainText('Roles Management');
    await expect(page.locator('ngx-datatable .datatable-body-row').getByText('administrator', { exact: true }))
      .toBeVisible();
  });
});
