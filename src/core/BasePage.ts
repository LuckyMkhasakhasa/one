import { Page } from '@playwright/test';

/** Common behaviour shared by every page object. */
export abstract class BasePage {
  /** Path relative to the project's baseURL. */
  protected abstract readonly path: string;

  constructor(readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(this.path);
    await this.waitUntilLoaded();
  }

  /** Override to wait for a page-specific element once navigation completes. */
  async waitUntilLoaded(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  url(): string {
    return this.page.url();
  }

  title(): Promise<string> {
    return this.page.title();
  }

  async reload(): Promise<void> {
    await this.page.reload();
    await this.waitUntilLoaded();
  }
}
