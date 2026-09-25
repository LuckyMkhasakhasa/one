import { test as base } from '@playwright/test';
import { PostsClient } from './api/PostsClient';
import { LoginPage } from './pages/LoginPage';
import { InventoryPage } from './pages/InventoryPage';
import { CheckoutPage } from './pages/CheckoutPage';

export const USERS = {
  standard: process.env.UI_USER ?? 'standard_user',
  lockedOut: 'locked_out_user',
  password: process.env.UI_PASSWORD ?? 'secret_sauce',
};

type Fixtures = {
  posts: PostsClient;
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  checkoutPage: CheckoutPage;
  /** Inventory page reached after logging in as the standard user. */
  loggedIn: InventoryPage;
};

export const test = base.extend<Fixtures>({
  posts: async ({ request }, use) => use(new PostsClient(request)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  loggedIn: async ({ loginPage, inventoryPage }, use) => {
    await loginPage.goto();
    await loginPage.login(USERS.standard, USERS.password);
    await use(inventoryPage);
  },
});

export { expect } from '@playwright/test';
