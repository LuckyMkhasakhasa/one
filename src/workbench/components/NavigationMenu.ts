import { Locator, Page } from '@playwright/test';
import { BaseComponent } from '../../core/BaseComponent';

export interface NavLink {
  name: string;
  href: string;
}

/** Primary navigation of the Workbench shell (side bar / top bar). */
export class NavigationMenu extends BaseComponent {
  readonly links: Locator;

  constructor(page: Page) {
    super(page, page.getByRole('navigation').or(page.locator('nav, aside, .sidebar, .navbar')).first());
    this.links = this.root.locator('a[href]');
  }

  link(name: string | RegExp): Locator {
    return this.root.getByRole('link', { name }).first();
  }

  async open(name: string | RegExp): Promise<void> {
    await this.link(name).click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Visible, same-site navigation links, de-duplicated by href. */
  async internalLinks(): Promise<NavLink[]> {
    const origin = new URL(this.page.url()).origin;
    const found = new Map<string, NavLink>();
    for (const link of await this.links.all()) {
      if (!(await link.isVisible())) continue;
      const raw = await link.getAttribute('href');
      if (!raw || raw.startsWith('#') || /^(javascript|mailto|tel):/i.test(raw)) continue;
      const href = new URL(raw, this.page.url()).toString();
      if (!href.startsWith(origin) || /log\s*out|sign\s*out/i.test(href)) continue;
      const name = (await link.innerText()).trim() || href;
      if (!found.has(href)) found.set(href, { name, href });
    }
    return [...found.values()];
  }
}
