import { Locator, Page } from '@playwright/test';

/** A reusable piece of UI scoped to a root locator (header, menu, dialog...). */
export abstract class BaseComponent {
  constructor(
    protected readonly page: Page,
    readonly root: Locator,
  ) {}

  isVisible(): Promise<boolean> {
    return this.root.isVisible();
  }
}
