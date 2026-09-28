import { Locator, Page } from '@playwright/test';

export class WorkbenchLoginPage {
  readonly heading: Locator;
  readonly username: Locator;
  readonly password: Locator;
  readonly signInButton: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Log into my account' });
    this.username = page.locator('#username');
    this.password = page.locator('#password');
    this.signInButton = page.getByRole('button', { name: 'Sign in' });
  }

  async goto() {
    // Relative to baseURL, which includes the /vitality-drive-workbench/ path.
    await this.page.goto('./');
  }

  // The Sign In button only enables on key events, so fill() isn't enough.
  async login(username: string, password: string) {
    await this.username.pressSequentially(username);
    await this.password.pressSequentially(password);
    await this.signInButton.click();
  }
}
