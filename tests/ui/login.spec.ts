import { test, expect, USERS } from '../../src/fixtures';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('standard user can log in', async ({ page, loginPage, inventoryPage }) => {
    await loginPage.login(USERS.standard, USERS.password);
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.title).toHaveText('Products');
  });

  test('locked out user sees an error', async ({ loginPage }) => {
    await loginPage.login(USERS.lockedOut, USERS.password);
    await expect(loginPage.error).toContainText('locked out');
  });

  test('wrong password shows an error', async ({ loginPage }) => {
    await loginPage.login(USERS.standard, 'wrong_password');
    await expect(loginPage.error).toContainText('do not match');
  });

  test('empty username is required', async ({ loginPage }) => {
    await loginPage.loginButton.click();
    await expect(loginPage.error).toContainText('Username is required');
  });
});
