import { test, expect, SIGNED_OUT } from '../../../src/workbench/fixtures';

test.use({ storageState: SIGNED_OUT });

test.describe('Workbench login page', () => {
  test.beforeEach(async ({ workbenchLogin }) => {
    await workbenchLogin.goto();
  });

  test('is served over HTTPS', async ({ page }) => {
    expect(new URL(page.url()).protocol).toBe('https:');
  });

  test('has a non-empty document title', async ({ workbenchLogin }) => {
    expect((await workbenchLogin.title()).trim()).not.toBe('');
  });

  test('shows username, password and submit controls', async ({ workbenchLogin }) => {
    await expect(workbenchLogin.username).toBeVisible();
    await expect(workbenchLogin.username).toBeEditable();
    await expect(workbenchLogin.password).toBeVisible();
    await expect(workbenchLogin.password).toBeEditable();
    await expect(workbenchLogin.submitButton).toBeVisible();
    await expect(workbenchLogin.submitButton).toBeEnabled();
  });

  test('masks the password input', async ({ workbenchLogin }) => {
    await workbenchLogin.password.fill('secret');
    await expect(workbenchLogin.password).toHaveAttribute('type', 'password');
  });

  test('keeps typed values in the fields', async ({ workbenchLogin }) => {
    await workbenchLogin.fill('someone', 'something');
    await expect(workbenchLogin.username).toHaveValue('someone');
    await expect(workbenchLogin.password).toHaveValue('something');
  });

  test('loads without uncaught script errors', async ({ page, workbenchLogin, pageErrors }) => {
    await workbenchLogin.reload();
    await page.waitForLoadState('load');
    expect(pageErrors).toEqual([]);
  });

  test('renders the form on a mobile viewport', async ({ page, workbenchLogin }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await workbenchLogin.reload();
    await expect(workbenchLogin.username).toBeInViewport();
    await expect(workbenchLogin.password).toBeInViewport();
    await expect(workbenchLogin.submitButton).toBeVisible();
  });
});

test.describe('Workbench sign in', () => {
  test.beforeEach(async ({ workbenchLogin }) => {
    await workbenchLogin.goto();
  });

  test('valid credentials sign the user in', async ({ page, workbenchLogin, workbenchHome, credentials }) => {
    await workbenchLogin.login(credentials.username, credentials.password);
    await workbenchHome.waitUntilLoaded();
    await expect(workbenchLogin.password).toBeHidden();
    expect(page.url()).toContain('/vitality-drive-workbench');
  });

  test('pressing Enter submits the form', async ({ workbenchLogin, workbenchHome, credentials }) => {
    await workbenchLogin.loginWithEnter(credentials.username, credentials.password);
    await workbenchHome.waitUntilLoaded();
    await expect(workbenchLogin.password).toBeHidden();
  });

  test('credentials never appear in the URL', async ({ page, workbenchLogin, workbenchHome, credentials }) => {
    await workbenchLogin.login(credentials.username, credentials.password);
    await workbenchHome.waitUntilLoaded();
    expect(page.url()).not.toContain(credentials.password);
  });
});

test.describe('Workbench sign in is rejected', () => {
  test.beforeEach(async ({ workbenchLogin }) => {
    await workbenchLogin.goto();
  });

  const invalid: { name: string; username: (u: string) => string; password: (p: string) => string }[] = [
    { name: 'wrong password', username: (u) => u, password: () => 'wrong-password' },
    { name: 'unknown username', username: () => 'no_such_user_pw_e2e', password: (p) => p },
    { name: 'password in the wrong case', username: (u) => u, password: (p) => p.toUpperCase() },
    { name: 'password with trailing space', username: (u) => u, password: (p) => `${p} ` },
    { name: 'SQL injection in username', username: () => `' OR '1'='1' --`, password: () => `' OR '1'='1' --` },
  ];

  for (const c of invalid) {
    test(`for ${c.name}`, async ({ page, workbenchLogin, credentials }) => {
      const password = c.password(credentials.password);
      await workbenchLogin.login(c.username(credentials.username), password);
      await expect(workbenchLogin.error).toBeVisible();
      await expect(workbenchLogin.password).toBeVisible();
      expect(page.url()).not.toContain(encodeURIComponent(password));
    });
  }

  test('when both fields are empty', async ({ workbenchLogin }) => {
    await workbenchLogin.submit();
    await expect(workbenchLogin.password).toBeVisible();
    await expect(workbenchLogin.username).toBeVisible();
  });

  test('when the password is empty', async ({ workbenchLogin, credentials }) => {
    await workbenchLogin.login(credentials.username, '');
    await expect(workbenchLogin.password).toBeVisible();
  });

  test('when the username is empty', async ({ workbenchLogin, credentials }) => {
    await workbenchLogin.login('', credentials.password);
    await expect(workbenchLogin.password).toBeVisible();
  });

  test('a failed attempt does not block a subsequent valid one', async ({
    workbenchLogin,
    workbenchHome,
    credentials,
  }) => {
    await workbenchLogin.login(credentials.username, 'wrong-password');
    await expect(workbenchLogin.error).toBeVisible();
    await workbenchLogin.login(credentials.username, credentials.password);
    await workbenchHome.waitUntilLoaded();
    await expect(workbenchLogin.password).toBeHidden();
  });
});
