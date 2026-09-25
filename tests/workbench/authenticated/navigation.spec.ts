import { test, expect } from '../../../src/workbench/fixtures';

test.describe('Workbench navigation', () => {
  test.beforeEach(async ({ workbenchHome }) => {
    await workbenchHome.goto();
  });

  test('shows the navigation menu', async ({ workbenchHome }) => {
    await expect(workbenchHome.nav.root).toBeVisible();
  });

  test('exposes at least one internal link', async ({ workbenchHome }) => {
    expect((await workbenchHome.nav.internalLinks()).length).toBeGreaterThan(0);
  });

  test('every internal link opens a working page', async ({ page, workbenchHome, workbenchLogin, pageErrors }) => {
    test.slow();
    const links = await workbenchHome.nav.internalLinks();
    for (const link of links) {
      await test.step(`${link.name} (${link.href})`, async () => {
        const response = await page.goto(link.href);
        expect(response?.status() ?? 200, `${link.href} status`).toBeLessThan(400);
        await expect(workbenchLogin.password, 'should not bounce to login').toBeHidden();
        expect(pageErrors, `script errors on ${link.href}`).toEqual([]);
      });
    }
  });

  test('clicking a menu link navigates within the Workbench', async ({ page, workbenchHome, workbenchLogin }) => {
    const [first] = await workbenchHome.nav.internalLinks();
    test.skip(!first, 'no internal navigation links present');
    await workbenchHome.nav.open(first.name);
    await expect(workbenchLogin.password).toBeHidden();
    expect(page.url()).toContain('/vitality-drive-workbench');
  });

  test('browser back returns to the previous page', async ({ page, workbenchHome }) => {
    const start = page.url();
    const target = (await workbenchHome.nav.internalLinks()).find((l) => l.href !== start);
    test.skip(!target, 'no second page to navigate to');
    await page.goto(target!.href);
    await page.goBack();
    expect(page.url()).toBe(start);
  });

  test('an unknown route does not produce a server error', async ({ page }) => {
    const response = await page.goto('./this-page-does-not-exist-e2e');
    expect(response?.status() ?? 200).toBeLessThan(500);
  });
});
