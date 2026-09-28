import { Locator, Page } from '@playwright/test';

export class DriverInfoPage {
  readonly heading: Locator;
  readonly planList: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Driver information', level: 2 });
    this.planList = page.getByRole('grid').filter({ has: page.getByRole('columnheader', { name: 'Role' }) });
  }

  /** Value shown under a field label, e.g. field('Entity reference'). */
  field(label: string): Locator {
    return this.page.getByText(label, { exact: true }).locator('xpath=following-sibling::*[1]');
  }
}
