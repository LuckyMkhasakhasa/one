import { Locator, Page } from '@playwright/test';
import { BaseComponent } from '../../core/BaseComponent';

const LOGOUT = /log\s*out|sign\s*out/i;

/** Signed-in user area: shows who is logged in and exposes logout. */
export class UserMenu extends BaseComponent {
  readonly logoutControl: Locator;

  constructor(page: Page) {
    super(page, page.locator('header, .navbar, .topbar, [role="banner"]').first());
    this.logoutControl = page
      .getByRole('link', { name: LOGOUT })
      .or(page.getByRole('button', { name: LOGOUT }))
      .or(page.getByRole('menuitem', { name: LOGOUT }))
      .first();
  }

  /** Element displaying the given username anywhere in the page chrome. */
  userLabel(username: string): Locator {
    return this.page.getByText(username, { exact: false }).first();
  }

  /** Logout may sit behind a dropdown toggle; open it when needed. */
  async expand(username: string): Promise<void> {
    if (await this.logoutControl.isVisible()) return;
    const toggle = this.page
      .getByRole('button', { name: /account|profile|user|menu/i })
      .or(this.userLabel(username))
      .first();
    if (await toggle.isVisible()) await toggle.click();
  }

  async logout(username: string): Promise<void> {
    await this.expand(username);
    await this.logoutControl.click();
  }
}
