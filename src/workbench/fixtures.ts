import { test as base } from '@playwright/test';
import { Env } from '../config/Env';
import { WorkbenchLoginPage } from './pages/WorkbenchLoginPage';
import { WorkbenchHomePage } from './pages/WorkbenchHomePage';

export interface Credentials {
  username: string;
  password: string;
}

type Fixtures = {
  credentials: Credentials;
  workbenchLogin: WorkbenchLoginPage;
  workbenchHome: WorkbenchHomePage;
  /** Uncaught page errors collected during the test. */
  pageErrors: Error[];
};

export const test = base.extend<Fixtures>({
  credentials: async ({}, use) => use({ username: Env.workbenchUser, password: Env.workbenchPassword }),
  workbenchLogin: async ({ page }, use) => use(new WorkbenchLoginPage(page)),
  workbenchHome: async ({ page }, use) => use(new WorkbenchHomePage(page)),
  pageErrors: async ({ page }, use) => {
    const errors: Error[] = [];
    page.on('pageerror', (e) => errors.push(e));
    await use(errors);
  },
});

/** Use in specs that must start without a signed-in session. */
export const SIGNED_OUT = { cookies: [], origins: [] };

export { expect } from '@playwright/test';
