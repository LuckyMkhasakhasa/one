import { test, expect } from '../../../src/workbench/fixtures';

test.describe('Workbench home (signed in)', () => {
  test.beforeEach(async ({ workbenchHome }) => {
    await workbenchHome.goto();
  });

  test('opens without asking to log in', async ({ workbenchLogin }) => {
    await expect(workbenchLogin.password).toBeHidden();
  });

  test('stays signed in after a reload', async ({ workbenchHome, workbenchLogin }) => {
    await workbenchHome.reload();
    await expect(workbenchLogin.password).toBeHidden();
  });

  test('stays signed in in a new tab', async ({ context }) => {
    const tab = await context.newPage();
    await tab.goto('./');
    await tab.waitForLoadState('domcontentloaded');
    await expect(tab.locator('input[type="password"]')).toBeHidden();
    await tab.close();
  });

  test('shows the signed-in user', async ({ workbenchHome, credentials }) => {
    await workbenchHome.userMenu.expand(credentials.username);
    await expect(workbenchHome.userMenu.userLabel(credentials.username)).toBeVisible();
  });

  test('offers a logout control', async ({ workbenchHome, credentials }) => {
    await workbenchHome.userMenu.expand(credentials.username);
    await expect(workbenchHome.userMenu.logoutControl).toBeVisible();
  });

  test('has a non-empty document title', async ({ workbenchHome }) => {
    expect((await workbenchHome.title()).trim()).not.toBe('');
  });

  test('loads without uncaught script errors', async ({ page, workbenchHome, pageErrors }) => {
    await workbenchHome.reload();
    await page.waitForLoadState('load');
    expect(pageErrors).toEqual([]);
  });

  test('loads without server errors on any request', async ({ page, workbenchHome }) => {
    const failures: string[] = [];
    page.on('response', (r) => {
      if (r.status() >= 500) failures.push(`${r.status()} ${r.url()}`);
    });
    await workbenchHome.reload();
    await page.waitForLoadState('networkidle');
    expect(failures).toEqual([]);
  });
});
