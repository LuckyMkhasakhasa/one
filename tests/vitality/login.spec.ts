import { test, expect, VD_USER } from '../../src/vitalityFixtures';

test.describe('Workbench login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('sign in is disabled until credentials are entered', async ({ loginPage }) => {
    await expect(loginPage.signInButton).toBeDisabled();
    await loginPage.username.pressSequentially(VD_USER.username);
    await loginPage.password.pressSequentially(VD_USER.password);
    await expect(loginPage.signInButton).toBeEnabled();
  });

  test('valid user lands on the search page', async ({ loginPage, searchPage }) => {
    await loginPage.login(VD_USER.username, VD_USER.password);
    await expect(searchPage.heading).toBeVisible();
    await expect(searchPage.logoutButton).toBeVisible();
  });

  test('wrong password stays on the login page', async ({ loginPage, searchPage }) => {
    await loginPage.login(VD_USER.username, 'definitely-wrong');
    await expect(loginPage.heading).toBeVisible();
    await expect(searchPage.heading).toBeHidden();
  });
});

test.describe('Workbench logout', () => {
  test('cancelling the logout dialog keeps the session', async ({ loggedIn }) => {
    await loggedIn.logoutButton.click();
    await expect(loggedIn.logoutDialog).toBeVisible();
    await loggedIn.logoutDialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(loggedIn.logoutDialog).toBeHidden();
    await expect(loggedIn.heading).toBeVisible();
  });

  test('confirming logout returns to the login page', async ({ page, loggedIn, loginPage }) => {
    await loggedIn.logout();
    await expect(loginPage.heading).toBeVisible();

    await page.goto('./index.xhtml');
    await expect(loginPage.heading).toBeVisible();
  });
});
