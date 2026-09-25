import { test as setup, expect } from '../../src/workbench/fixtures';

const WORKBENCH_AUTH_FILE = 'playwright/.auth/workbench.json';

setup('sign in to the Workbench', async ({ page, workbenchLogin, workbenchHome, credentials }) => {
  await workbenchLogin.goto();
  await workbenchLogin.login(credentials.username, credentials.password);
  await workbenchHome.waitUntilLoaded();
  await expect(workbenchLogin.password).toBeHidden();
  await page.context().storageState({ path: WORKBENCH_AUTH_FILE });
});
