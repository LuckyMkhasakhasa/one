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

  test('unknown user shows an error', async ({ loginPage }) => {
    await loginPage.login('no_such_user', USERS.password);
    await expect(loginPage.error).toContainText('do not match');
  });

  test('empty password is required', async ({ loginPage }) => {
    await loginPage.username.fill(USERS.standard);
    await loginPage.loginButton.click();
    await expect(loginPage.error).toContainText('Password is required');
  });

  test('error message can be dismissed', async ({ loginPage }) => {
    await loginPage.loginButton.click();
    await expect(loginPage.error).toBeVisible();
    await loginPage.errorDismiss.click();
    await expect(loginPage.error).toBeHidden();
  });

  test('inventory is not reachable without logging in', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');
    await expect(page).not.toHaveURL(/inventory\.html/);
    await expect(loginPage.error).toContainText("You can only access '/inventory.html' when you are logged in");
  });

  test('user can log out', async ({ page, loggedIn, loginPage }) => {
    await loggedIn.logout();
    await expect(loginPage.loginButton).toBeVisible();
    await page.goto('/inventory.html');
    await expect(loginPage.error).toContainText('when you are logged in');
  });

  test('empty username is required', async ({ loginPage }) => {
    await loginPage.loginButton.click();
    await expect(loginPage.error).toContainText('Username is required');
  });
});
