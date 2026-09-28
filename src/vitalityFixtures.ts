import { test as base } from '@playwright/test';
import { WorkbenchLoginPage } from './pages/vitality/WorkbenchLoginPage';
import { SearchPage } from './pages/vitality/SearchPage';
import { DriverInfoPage } from './pages/vitality/DriverInfoPage';

export const VD_USER = {
  username: process.env.VD_USER ?? '',
  password: process.env.VD_PASSWORD ?? '',
};

/** Known driver in the UAT environment. */
export const DRIVER = {
  firstName: 'Bintu',
  lastName: 'Test',
  entityReference: 'EBINTU123',
  planReference: 'PBINTU123',
};

type Fixtures = {
  loginPage: WorkbenchLoginPage;
  searchPage: SearchPage;
  driverInfoPage: DriverInfoPage;
  /** Search page reached after logging in. */
  loggedIn: SearchPage;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => use(new WorkbenchLoginPage(page)),
  searchPage: async ({ page }, use) => use(new SearchPage(page)),
  driverInfoPage: async ({ page }, use) => use(new DriverInfoPage(page)),
  loggedIn: async ({ loginPage, searchPage }, use) => {
    await loginPage.goto();
    await loginPage.login(VD_USER.username, VD_USER.password);
    await searchPage.heading.waitFor();
    await use(searchPage);
  },
});

test.skip(() => !VD_USER.username || !VD_USER.password, 'Set VD_USER and VD_PASSWORD in .env to run Vitality tests');

export { expect } from '@playwright/test';
