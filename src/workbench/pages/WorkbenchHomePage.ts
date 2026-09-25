import { Page } from '@playwright/test';
import { BasePage } from '../../core/BasePage';
import { NavigationMenu } from '../components/NavigationMenu';
import { UserMenu } from '../components/UserMenu';

/** Landing page of the Workbench shown after a successful sign-in. */
export class WorkbenchHomePage extends BasePage {
  protected readonly path = './';
  readonly nav: NavigationMenu;
  readonly userMenu: UserMenu;

  constructor(page: Page) {
    super(page);
    this.nav = new NavigationMenu(page);
    this.userMenu = new UserMenu(page);
  }

  override async waitUntilLoaded(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.locator('input[type="password"]').first().waitFor({ state: 'hidden' });
  }
}
