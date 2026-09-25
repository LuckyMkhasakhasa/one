import { Locator, Page } from '@playwright/test';
import { BasePage } from '../../core/BasePage';

/**
 * Workbench sign-in form.
 *
 * Locators prefer accessible roles/labels and fall back to common attribute
 * patterns, so they survive minor markup changes to the login screen.
 */
export class WorkbenchLoginPage extends BasePage {
  protected readonly path = './';
  readonly username: Locator;
  readonly password: Locator;
  readonly submitButton: Locator;
  readonly error: Locator;

  constructor(page: Page) {
    super(page);
    this.username = page
      .getByLabel(/user\s*name|e-?mail|login/i)
      .or(page.getByPlaceholder(/user\s*name|e-?mail/i))
      .or(page.locator('input[name*="user" i], input[id*="user" i], input[type="email"]'))
      .first();
    this.password = page.locator('input[type="password"]').first();
    this.submitButton = page
      .getByRole('button', { name: /log\s*in|sign\s*in|submit|continue/i })
      .or(page.locator('button[type="submit"], input[type="submit"]'))
      .first();
    this.error = page
      .getByRole('alert')
      .or(page.locator('.error, .alert-danger, .invalid-feedback, .mat-error, [class*="error" i]'))
      .filter({ hasText: /\S/ })
      .first();
  }

  override async waitUntilLoaded(): Promise<void> {
    await this.password.waitFor({ state: 'visible' });
  }

  async fill(username: string, password: string): Promise<void> {
    await this.username.fill(username);
    await this.password.fill(password);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async login(username: string, password: string): Promise<void> {
    await this.fill(username, password);
    await this.submit();
  }

  async loginWithEnter(username: string, password: string): Promise<void> {
    await this.fill(username, password);
    await this.password.press('Enter');
  }

  /** The login form is still showing, i.e. the user was not let in. */
  isShown(): Promise<boolean> {
    return this.password.isVisible();
  }
}
