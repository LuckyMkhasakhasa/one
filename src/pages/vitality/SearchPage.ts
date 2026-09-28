import { Locator, Page } from '@playwright/test';

export type SearchType = 'Company' | 'Driver' | 'Vehicle';

export class SearchPage {
  readonly heading: Locator;
  readonly searchTypeSelect: Locator;
  readonly planReference: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly mobileNumber: Locator;
  readonly email: Locator;
  readonly entityReference: Locator;
  readonly clearButton: Locator;
  readonly submitButton: Locator;
  readonly logoutButton: Locator;
  readonly logoutDialog: Locator;
  readonly results: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Search', level: 2 });
    this.searchTypeSelect = page.getByRole('button', { name: /^Search Type/ });
    this.planReference = page.getByRole('textbox', { name: 'Plan reference' });
    this.firstName = page.getByRole('textbox', { name: 'First name' });
    this.lastName = page.getByRole('textbox', { name: 'Last name' });
    this.mobileNumber = page.getByRole('textbox', { name: 'Mobile number' });
    this.email = page.getByRole('textbox', { name: 'Email address' });
    this.entityReference = page.getByRole('textbox', { name: 'Entity reference' });
    this.clearButton = page.getByRole('button', { name: 'Clear' });
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.logoutButton = page.getByRole('button', { name: 'Logout' });
    this.logoutDialog = page.getByRole('dialog').filter({ hasText: 'You are about to log out' });
    // Data rows of the results grid (skip the header row).
    this.results = page.getByRole('row').filter({ has: page.getByRole('gridcell') });
  }

  async selectSearchType(type: SearchType) {
    await this.searchTypeSelect.click();
    // Changing the type re-renders the form over AJAX; typing before it lands gets wiped.
    const rerendered = this.page.waitForResponse((r) => r.request().method() === 'POST' && r.url().includes('.xhtml'));
    await this.page.getByRole('option', { name: type, exact: true }).click();
    await rerendered;
    await this.page.waitForLoadState('networkidle');
  }

  message(text: string | RegExp): Locator {
    return this.page.getByText(text);
  }

  result(entityReference: string): Locator {
    return this.results.filter({ hasText: entityReference });
  }

  async openEntity(entityReference: string) {
    await this.page.getByRole('link', { name: entityReference, exact: true }).click();
  }

  async logout() {
    await this.logoutButton.click();
    await this.logoutDialog.getByRole('link', { name: 'Logout' }).click();
  }
}
