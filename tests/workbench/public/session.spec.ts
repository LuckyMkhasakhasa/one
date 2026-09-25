import { test, expect, SIGNED_OUT } from '../../../src/workbench/fixtures';

// These tests create and destroy their own session so logging out can't
// invalidate the shared signed-in state used by the authenticated specs.
test.use({ storageState: SIGNED_OUT });

test.describe('Workbench session', () => {
  test('unauthenticated visitors are sent to the login form', async ({ workbenchHome, workbenchLogin }) => {
    await workbenchHome.page.goto('./');
    await expect(workbenchLogin.password).toBeVisible();
  });

  test.describe('after signing in', () => {
    test.beforeEach(async ({ workbenchLogin, workbenchHome, credentials }) => {
      await workbenchLogin.goto();
      await workbenchLogin.login(credentials.username, credentials.password);
      await workbenchHome.waitUntilLoaded();
    });

    test('sets session cookies that are Secure', async ({ context }) => {
      const cookies = await context.cookies();
      expect(cookies.length).toBeGreaterThan(0);
      const session = cookies.filter((c) => /sess|auth|token|jwt/i.test(c.name));
      for (const cookie of session) expect(cookie.secure, `${cookie.name} should be Secure`).toBe(true);
    });

    test('session cookies are not readable from JavaScript', async ({ context }) => {
      const session = (await context.cookies()).filter((c) => /sess/i.test(c.name));
      for (const cookie of session) expect(cookie.httpOnly, `${cookie.name} should be HttpOnly`).toBe(true);
    });

    test('logout returns to the login form', async ({ workbenchHome, workbenchLogin, credentials }) => {
      await workbenchHome.userMenu.logout(credentials.username);
      await expect(workbenchLogin.password).toBeVisible();
    });

    test('protected pages require login again after logout', async ({
      page,
      workbenchHome,
      workbenchLogin,
      credentials,
    }) => {
      const protectedUrl = page.url();
      await workbenchHome.userMenu.logout(credentials.username);
      await expect(workbenchLogin.password).toBeVisible();
      await page.goto(protectedUrl);
      await expect(workbenchLogin.password).toBeVisible();
    });

    test('the back button does not restore the session after logout', async ({
      page,
      workbenchHome,
      workbenchLogin,
      credentials,
    }) => {
      await workbenchHome.userMenu.logout(credentials.username);
      await expect(workbenchLogin.password).toBeVisible();
      await page.goBack();
      await page.reload();
      await expect(workbenchLogin.password).toBeVisible();
    });

    test('clearing cookies ends the session', async ({ context, workbenchHome, workbenchLogin }) => {
      await context.clearCookies();
      await workbenchHome.page.goto('./');
      await expect(workbenchLogin.password).toBeVisible();
    });
  });
});
