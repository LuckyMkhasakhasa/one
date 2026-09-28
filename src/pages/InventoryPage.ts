import { Locator, Page } from '@playwright/test';

export class InventoryPage {
  readonly title: Locator;
  readonly items: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly sortSelect: Locator;
  readonly menuButton: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.sortSelect = page.getByTestId('product-sort-container');
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
  }

  item(name: string): Locator {
    return this.items.filter({ hasText: name });
  }

  async addToCart(name: string) {
    await this.item(name).getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeFromCart(name: string) {
    await this.item(name).getByRole('button', { name: 'Remove' }).click();
  }

  async openItem(name: string) {
    await this.page.getByTestId('inventory-item-name').filter({ hasText: name }).click();
  }

  async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo') {
    await this.sortSelect.selectOption(option);
  }

  async prices(): Promise<number[]> {
    const texts = await this.page.getByTestId('inventory-item-price').allTextContents();
    return texts.map((t) => Number(t.replace('$', '')));
  }

  async names(): Promise<string[]> {
    return this.page.getByTestId('inventory-item-name').allTextContents();
  }

  async logout() {
    await this.menuButton.click();
    await this.page.getByTestId('logout-sidebar-link').click();
  }

  async resetAppState() {
    await this.menuButton.click();
    await this.page.getByTestId('reset-sidebar-link').click();
  }

  async openCart() {
    await this.cartLink.click();
  }
}
